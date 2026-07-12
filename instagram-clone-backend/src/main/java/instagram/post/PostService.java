package instagram.post;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import instagram.comment.CommentRepository;
import instagram.common.FileStorageService;
import instagram.common.exception.PrivateAccountException;
import instagram.common.exception.ResourceNotFoundException;
import instagram.follow.FollowRepository;
import instagram.follow.FollowStatus;
import instagram.like.LikeRepository;
import instagram.post.dto.PostResponse;
import instagram.user.User;
import instagram.user.UserRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PostService {
	private final PostRepository postRepository;
	private final UserRepository userRepository;
	private final FollowRepository followRepository;
	private final LikeRepository likeRepository;
	private final CommentRepository commentRepository;
	private final FileStorageService fileStorageService;
	
	@Transactional
	public PostResponse createdPost(Long userId, MultipartFile file, String caption) {
		User user = userRepository.findById(userId)
				.orElseThrow(() -> new ResourceNotFoundException("User not found"));
		
		String contentType = file.getContentType();
		MediaType mediaType;
		
		if(contentType != null && contentType.startsWith("image/")) mediaType = MediaType.IMAGE;
		else if(contentType != null && contentType.startsWith("video/")) mediaType = MediaType.VIDEO;
		else throw new IllegalArgumentException("File must be an image or vedio");
		
		String mediaUrl = fileStorageService.store(file);
		
		Post post = Post.builder()
				.user(user)
				.mediaUrl(mediaUrl)
				.mediaType(mediaType)
				.caption(caption)
				.build();
		
		postRepository.save(post);
		return toResponse(post, userId);
	}
	
	@Transactional
	public void deletePost(Long userId, Long postId) {
		Post post = postRepository.findById(postId)
				.orElseThrow(() -> new ResourceNotFoundException("Post not found"));
		
		if(!post.getUser().getId().equals(userId)) throw new IllegalArgumentException("You can only delete your own posts");
		
		fileStorageService.delete(post.getMediaUrl());
		postRepository.delete(post);
	}
	
	@Transactional(readOnly = true)
	public Page<PostResponse> getUserPosts(Long currentUserId, String targetUsername, Pageable pageable) {
		User targetUser = userRepository.findByUsername(targetUsername)
				.orElseThrow(() -> new ResourceNotFoundException("User not found"));
		
		boolean isOwnProfile = targetUser.getId().equals(currentUserId);
		
		if(targetUser.isPrivate() && !isOwnProfile) {
			User currentUser = userRepository.findById(currentUserId)
					.orElseThrow(() -> new ResourceNotFoundException("User not found"));
			boolean isFollowingAccepted = followRepository.existsByFollowerAndFollowingAndStatus(currentUser, targetUser, FollowStatus.ACCEPTED);
			if(!isFollowingAccepted) throw new PrivateAccountException("This account is private");
		}
		return postRepository.findByUserOrderByCreatedAtDesc(targetUser, pageable)
				.map(post -> toResponse(post, currentUserId));
	}
	
	@Transactional(readOnly = true)
	public Page<PostResponse> getFeed(Long currentUserId, Pageable pageable) {
		User curentUser = userRepository.findById(currentUserId)
				.orElseThrow(() -> new ResourceNotFoundException("User not found"));
		
		List<Long> followedUserIds = followRepository
				.findByFollowerAndStatus(curentUser, FollowStatus.ACCEPTED, Pageable.unpaged())
				.stream()
				.map(f -> f.getFollowing().getId())
				.collect(Collectors.toList());
		
		followedUserIds.add(currentUserId);
		
		return postRepository.findFeedForUser(followedUserIds, pageable)
				.map(post -> toResponse(post, currentUserId));
	}
	
	private PostResponse toResponse(Post post, Long currentUserId) {
	    long likesCount = likeRepository.countByPost(post);
	    long commentsCount = commentRepository.countByPost(post);
	    boolean likedByCurrentUser = false;
	    if(currentUserId != null) {
	    	User currentUser = userRepository.findById(currentUserId).orElse(null);
	    	if(currentUser != null) likedByCurrentUser = likeRepository.existsByUserAndPost(currentUser, post);
	    }
	    return PostResponse.builder()
	            .id(post.getId())
	            .userId(post.getUser().getId())
	            .username(post.getUser().getUsername())
	            .userAvatarUrl(post.getUser().getAvatarUrl())
	            .mediaUrl(post.getMediaUrl())
	            .mediaType(post.getMediaType().name())
	            .caption(post.getCaption())
	            .likesCount(likesCount)
	            .commentsCount(commentsCount)
	            .likedByCurrentUser(likedByCurrentUser)
	            .createdAt(post.getCreatedAt())
	            .build();
	}
}
