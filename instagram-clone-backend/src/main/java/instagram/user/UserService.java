package instagram.user;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import instagram.common.exception.ResourceNotFoundException;
import instagram.follow.FollowRepository;
import instagram.follow.FollowStatus;
import instagram.post.PostRepository;
import instagram.user.dto.UpdateProfileRequest;
import instagram.user.dto.UserProfileResponse;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {
	
	private final UserRepository userRepository;
	private final FollowRepository followRepository;
	private final PostRepository postRepository;
	
	public UserProfileResponse getProfileByUsername(String username) {
		User user = userRepository.findByUsername(username)
			.orElseThrow(() -> new ResourceNotFoundException("User not found : " + username));
		return toProfileResponse(user);
	}
	
	@Transactional
	public UserProfileResponse updateProfile(Long userId, UpdateProfileRequest request) {
		
		User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found"));
		
		if(request.getFullName() != null) user.setFullName(request.getFullName());;
		if(request.getBio() != null) user.setBio(request.getBio());
		if(request.getAvatarUrl() != null) user.setAvatarUrl(request.getAvatarUrl());
		
		userRepository.save(user);
		return toProfileResponse(user);
	}
	
	@Transactional
	public UserProfileResponse togglePrivacy(Long userId) {
		User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found"));
		user.setPrivate(!user.isPrivate());
		userRepository.save(user);
		return toProfileResponse(user);
	}
	
	public List<UserProfileResponse> searchUsers(String query) {
		return userRepository.searchByUsername(query)
				.stream()
				.map(this::toProfileResponse)
				.collect(Collectors.toList());
	}
	
	private UserProfileResponse toProfileResponse(User user) {
		long followers = followRepository.countByFollowingAndStatus(user, FollowStatus.ACCEPTED);
		long following = followRepository.countByFollowerAndStatus(user, FollowStatus.ACCEPTED);
		long posts = postRepository.countByUser(user);
		return UserProfileResponse.builder()
				.id(user.getId())
				.username(user.getUsername())
				.fullName(user.getFullName())
				.bio(user.getBio())
				.avatarUrl(user.getAvatarUrl())
				.isPrivate(user.isPrivate())
				.followersCount(followers)
				.followingCount(following)
				.postsCount(posts)
				.build();
	}
}
