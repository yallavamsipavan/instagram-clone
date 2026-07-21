package instagram.follow;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import instagram.common.exception.DuplicateResourceException;
import instagram.common.exception.PrivateAccountException;
import instagram.common.exception.ResourceNotFoundException;
import instagram.follow.dto.FollowResponse;
import instagram.notification.NotificationService;
import instagram.notification.NotificationType;
import instagram.user.User;
import instagram.user.UserRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class FollowService {

	private final FollowRepository followRepository;
	private final UserRepository userRepository;
	private final NotificationService notificationService;
	
	@Transactional
	public FollowResponse sendFollowRequest(Long currentUserId, Long targetUserId) {
		
		if(currentUserId.equals(targetUserId)) throw new IllegalArgumentException("You cannot follow yourself");
		
		User follower = userRepository.findById(currentUserId)
				.orElseThrow(() -> new ResourceNotFoundException("User not found"));
		User following = userRepository.findById(targetUserId)
				.orElseThrow(() -> new ResourceNotFoundException("User not found"));
		
		followRepository.findByFollowerAndFollowing(follower, following)
				.ifPresent(f -> {
					throw new DuplicateResourceException("Follow request already exists");
				});
		
		FollowStatus status = following.isPrivate() ? FollowStatus.PENDING : FollowStatus.ACCEPTED;
		
		Follow follow = Follow.builder()
				.follower(follower)
				.following(following)
				.status(status)
				.build();
		
		followRepository.save(follow);
		
		// Clean up any stale follow notifications from a previous follow/unfollow cycle
	    // before creating a fresh one, so only the latest action is ever shown.
		notificationService.removeAllOfType(following, follower, NotificationType.FOLLOW_REQUEST);
		notificationService.removeAllOfType(following, follower, NotificationType.FOLLOW_ACCEPTED);
		
		notificationService.notifyFresh(following, follower,
				status == FollowStatus.PENDING ? NotificationType.FOLLOW_REQUEST : NotificationType.FOLLOW_ACCEPTED,
				follow.getId());
		
		return toResponse(following, status);
	}
	
	@Transactional
	public FollowResponse acceptFollowRequest(Long currentUserId, Long followerUserId) {
		User currentUser = userRepository.findById(currentUserId)
				.orElseThrow(() -> new ResourceNotFoundException("User not found"));
		User followerUser = userRepository.findById(followerUserId)
				.orElseThrow(() -> new ResourceNotFoundException("User not found"));
		Follow follow = followRepository.findByFollowerAndFollowing(followerUser, currentUser)
				.orElseThrow(() -> new ResourceNotFoundException("Follow request not found"));
		
		if(follow.getStatus() == FollowStatus.ACCEPTED) throw new IllegalStateException("Follow request already accepted");
		
		follow.setStatus(FollowStatus.ACCEPTED);
		followRepository.save(follow);
		
		notificationService.removeAllOfType(followerUser, currentUser, NotificationType.FOLLOW_REQUEST);
		notificationService.removeAllOfType(followerUser, currentUser, NotificationType.FOLLOW_ACCEPTED);
		
		notificationService.notifyFresh(followerUser, currentUser, NotificationType.FOLLOW_ACCEPTED, follow.getId());
		
		return toResponse(followerUser, FollowStatus.ACCEPTED);
	}
	
	@Transactional
	public void rejectFollowRequest(Long currentUserId, Long followerUserId) {
		User currentUser = userRepository.findById(currentUserId)
				.orElseThrow(() -> new ResourceNotFoundException("User not found"));
		User followerUser = userRepository.findById(followerUserId)
				.orElseThrow(() -> new ResourceNotFoundException("User not found"));
		Follow follow = followRepository.findByFollowerAndFollowing(followerUser, currentUser)
				.orElseThrow(() -> new ResourceNotFoundException("Follow request not found"));
		
		notificationService.removeNotification(currentUser, followerUser, NotificationType.FOLLOW_REQUEST, follow.getId());
		
		followRepository.delete(follow);
	}
	
	@Transactional
	public void unfollow(Long currentUserId, Long targetUserId) {
		User follower = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
		User following = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
		
		followRepository.findByFollowerAndFollowing(follower, following)
			.ifPresent(follow -> {
				notificationService.removeNotification(following, follower, NotificationType.FOLLOW_REQUEST, follow.getId());
				followRepository.delete(follow);
			}
		);
	}
	
	@Transactional(readOnly = true)
	public Page<FollowResponse> getFollowers(Long currentUserId, Long targetUserId, Pageable pageable) {
		User targetUser = userRepository.findById(targetUserId)
				.orElseThrow(() -> new ResourceNotFoundException("User not found"));
		checkListAccess(currentUserId, targetUser);
		
		return followRepository.findByFollowingAndStatus(targetUser, FollowStatus.ACCEPTED, pageable)
				.map(f -> toResponse(f.getFollower(), f.getStatus()));
	}
	
	@Transactional(readOnly = true)
	public Page<FollowResponse> getFollowing(Long currentUserId, Long targetUserId, Pageable pageable) {
		User targetUser = userRepository.findById(targetUserId)
				.orElseThrow(() -> new ResourceNotFoundException("User not found"));
		checkListAccess(currentUserId, targetUser);
		
		return followRepository.findByFollowerAndStatus(targetUser, FollowStatus.ACCEPTED, pageable)
				.map(f -> toResponse(f.getFollowing(), f.getStatus()));
	}

	@Transactional(readOnly = true)
	public FollowResponse getFollowStatus(Long currentUserId, Long targetUserId) {
		User targetUser = userRepository.findById(targetUserId)
				.orElseThrow(() -> new ResourceNotFoundException("User not found"));
		
		if(currentUserId.equals(targetUserId)) {
			return FollowResponse.builder()
					.userId(targetUser.getId())
					.username(targetUser.getUsername())
					.avatarUrl(targetUser.getAvatarUrl())
					.status("SELF")
					.build();
		}
		
		User currentUser = userRepository.findById(currentUserId)
	            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
		
		return followRepository.findByFollowerAndFollowing(currentUser, targetUser)
				.map(f -> toResponse(targetUser, f.getStatus()))
				.orElse(FollowResponse.builder()
						.userId(targetUser.getId())
						.username(targetUser.getUsername())
						.avatarUrl(targetUser.getAvatarUrl())
						.status("NOT_FOLLOWING")
						.build());
	}
	
	@Transactional(readOnly = true)
	public FollowResponse getIncomingRequestStatus(Long currentUserId, Long otherUserId) {
		User currentUser = userRepository.findById(currentUserId)
	            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
	    User otherUser = userRepository.findById(otherUserId)
	            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

	    return followRepository.findByFollowerAndFollowing(otherUser, currentUser)
	    		.map(f -> toResponse(otherUser, f.getStatus()))
	    		.orElse(FollowResponse.builder()
	    				.userId(otherUser.getId())
	    				.username(otherUser.getUsername())
	    				.avatarUrl(otherUser.getAvatarUrl())
	    				.status("NOT_FOLLOWING")
	    				.build());
	}
	
	@Transactional(readOnly = true)
	public Page<FollowResponse> getPendingRequests(Long currentUserId, Pageable pageable) {
		User currentUser = userRepository.findById(currentUserId)
				.orElseThrow(() -> new ResourceNotFoundException("User not found"));
		
		return followRepository.findByFollowingAndStatus(currentUser, FollowStatus.PENDING, pageable)
				.map(f -> toResponse(f.getFollower(), f.getStatus()));
	}
	
	private void checkListAccess(Long currentUserId, User targetUser) {
		boolean isOwnProfile = targetUser.getId().equals(currentUserId);
		if(targetUser.isPrivate() && !isOwnProfile) {
			User currentUser = userRepository.findById(currentUserId)
					.orElseThrow(() -> new ResourceNotFoundException("User not found"));
			boolean isFollowingAccepted = followRepository
					.existsByFollowerAndFollowingAndStatus(currentUser, targetUser, FollowStatus.ACCEPTED);
			if(!isFollowingAccepted) throw new PrivateAccountException("This account is private");
		}
	}
	
	private FollowResponse toResponse(User user, FollowStatus status) {
		return FollowResponse.builder()
				.userId(user.getId())
				.username(user.getUsername())
				.avatarUrl(user.getAvatarUrl())
				.status(status.name())
				.build();
	}
}
