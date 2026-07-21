package instagram.like;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import instagram.comment.Comment;
import instagram.comment.CommentRepository;
import instagram.common.exception.PrivateAccountException;
import instagram.common.exception.ResourceNotFoundException;
import instagram.follow.FollowRepository;
import instagram.follow.FollowStatus;
import instagram.notification.NotificationService;
import instagram.notification.NotificationType;
import instagram.post.Post;
import instagram.post.PostRepository;
import instagram.user.User;
import instagram.user.UserRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class LikeService {

	private final LikeRepository likeRepository;
	private final PostRepository postRepository;
	private final CommentRepository commentRepository;
	private final UserRepository userRepository;
	private final FollowRepository followRepository;
	private final NotificationService notificationService;
	
	@Transactional
	public void likePost(Long userId, Long postId) {
		User user = userRepository.findById(userId)
				.orElseThrow(() -> new ResourceNotFoundException("User not found"));
		Post post = postRepository.findById(postId)
				.orElseThrow(() -> new ResourceNotFoundException("Post not found"));
		
		checkPostAccess(user, post);
		
		if(likeRepository.existsByUserAndPost(user, post)) return;
		
		Like like = Like.builder()
				.user(user)
				.post(post)
				.build();
		likeRepository.save(like);
		
		notificationService.notify(post.getUser(), user, NotificationType.LIKE_POST, post.getId());
	}
	
	// Unlike deliberately skips the privacy check: removing your own past reaction
    // should always be allowed, even if you've since unfollowed a private account.
    @Transactional
	public void unlikePost(Long userId, Long postId) {
		User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found"));
        
        // checkPostAccess(user, post);
        
        likeRepository.deleteByUserAndPost(user, post);
        
        notificationService.removeNotification(post.getUser(), user, NotificationType.LIKE_POST, post.getId());
	}
	
	@Transactional
	public void likeComment(Long userId, Long commentId) {
		User user = userRepository.findById(userId)
				.orElseThrow(() -> new ResourceNotFoundException("User not found"));
		Comment comment = commentRepository.findById(commentId)
				.orElseThrow(() -> new ResourceNotFoundException("Comment not found"));
		
		checkPostAccess(user, comment.getPost());
		
		if(likeRepository.existsByUserAndComment(user, comment)) return;
		
		Like like = Like.builder()
				.user(user)
				.comment(comment)
				.build();
		likeRepository.save(like);
		
		notificationService.notify(comment.getUser(), user, NotificationType.LIKE_COMMENT, comment.getId());
	}
	
	// Same reasoning as unlikePost - always allow removing your own like.
    @Transactional
	public void unlikeComment(Long userId, Long commentId) {
		User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));

        // checkPostAccess(user, comment.getPost());
        
        likeRepository.deleteByUserAndComment(user, comment);
        
        notificationService.removeNotification(comment.getUser(), user, NotificationType.LIKE_COMMENT, comment.getId());
	}
	
	private void checkPostAccess(User currentUser, Post post) {
		User postOwner = post.getUser();
		boolean isOwnPost = postOwner.getId().equals(currentUser.getId());
		if(postOwner.isPrivate() && !isOwnPost) {
			boolean isFollowingAccepted = followRepository
					.existsByFollowerAndFollowingAndStatus(currentUser, postOwner, FollowStatus.ACCEPTED);
			if(!isFollowingAccepted) throw new PrivateAccountException("This account is private");
		}
	}
}
