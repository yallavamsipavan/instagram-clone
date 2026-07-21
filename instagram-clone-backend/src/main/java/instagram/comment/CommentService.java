package instagram.comment;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import instagram.comment.dto.CommentRequest;
import instagram.comment.dto.CommentResponse;
import instagram.common.exception.PrivateAccountException;
import instagram.common.exception.ResourceNotFoundException;
import instagram.follow.FollowRepository;
import instagram.follow.FollowStatus;
import instagram.like.LikeRepository;
import instagram.notification.NotificationService;
import instagram.notification.NotificationType;
import instagram.post.Post;
import instagram.post.PostRepository;
import instagram.user.User;
import instagram.user.UserRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CommentService {

	private final CommentRepository commentRepository;
	private final PostRepository postRepository;
	private final UserRepository userRepository;
	private final LikeRepository likeRepository;
	private final FollowRepository followRepository;
	private final NotificationService notificationService;
	
	@Transactional
	public CommentResponse addComment(Long userId, Long postId, CommentRequest request) {
		User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found"));
        
        checkPostAccess(user, post);
        
        Comment parentComment = null;
        if(request.getParentCommentId() != null) {
        	parentComment = commentRepository.findById(request.getParentCommentId())
        			.orElseThrow(() -> new ResourceNotFoundException("Parent comment not found"));
        }
        
        Comment comment = Comment.builder()
        		.post(post)
        		.user(user)
        		.parentComment(parentComment)
        		.content(request.getContent())
        		.build();
        
        commentRepository.save(comment);
        
        notificationService.notify(post.getUser(), user, NotificationType.COMMENT, comment.getId());
        
        return toResponse(comment, userId);
	}
	
	@Transactional
	public void deleteComment(Long userId, Long commentId) {
		Comment comment = commentRepository.findById(commentId)
				.orElseThrow(() -> new ResourceNotFoundException("Comment not found"));
		
		if(!comment.getUser().getId().equals(userId)) throw new IllegalArgumentException("You can only delete your own comments");
		
		notificationService.removeNotification(comment.getPost().getUser(), comment.getUser(), NotificationType.COMMENT, comment.getId());
		
		commentRepository.delete(comment);
	}
	
	@Transactional(readOnly = true)
	public Page<CommentResponse> getCommentsForPost(Long postId, Long currentUserId, Pageable pageable) {
		User currentUser = userRepository.findById(currentUserId)
				.orElseThrow(() -> new ResourceNotFoundException("User not found"));
		Post post = postRepository.findById(postId)
				.orElseThrow(() -> new ResourceNotFoundException("Post not found"));
		
		checkPostAccess(currentUser, post);
		
		return commentRepository.findByPostAndParentCommentIsNullOrderByCreatedAtAsc(post, pageable)
				.map(c -> toResponse(c, currentUserId));
	}
	
	@Transactional(readOnly = true)
	public Page<CommentResponse> getReplies(Long commentId, Long currentUserId, Pageable pageable) {
		User currentUser = userRepository.findById(currentUserId)
				.orElseThrow(() -> new ResourceNotFoundException("User not found"));
		Comment parentComment = commentRepository.findById(commentId)
				.orElseThrow(() -> new ResourceNotFoundException("Comment not found"));
		
		checkPostAccess(currentUser, parentComment.getPost());
		
		return commentRepository.findByParentCommentOrderByCreatedAtAsc(parentComment, pageable)
				.map(c -> toResponse(c, currentUserId));
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
	
	private CommentResponse toResponse(Comment comment, Long currentUserId) {
		long likesCount = likeRepository.countByComment(comment);
		long repliesCount = commentRepository.countByParentComment(comment);
		
		boolean likedByCurrentUser = false;
		if(currentUserId != null) {
			User currentUser = userRepository.findById(currentUserId).orElse(null);
			if(currentUser != null) likedByCurrentUser = likeRepository.existsByUserAndComment(currentUser, comment);
		}
		
		return CommentResponse.builder()
				.id(comment.getId())
				.postId(comment.getPost().getId())
				.userId(comment.getUser().getId())
				.username(comment.getUser().getUsername())
				.userAvatarUrl(comment.getUser().getAvatarUrl())
				.content(comment.getContent())
				.parentCommentId(comment.getParentComment() != null ? comment.getParentComment().getId() : null)
				.likesCount(likesCount)
				.repliesCount(repliesCount)
				.likedByCurrentUser(likedByCurrentUser)
				.createdAt(comment.getCreatedAt())
				.build();
	}
}
