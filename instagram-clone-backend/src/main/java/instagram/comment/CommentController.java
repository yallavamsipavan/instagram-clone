package instagram.comment;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import instagram.comment.dto.CommentRequest;
import instagram.comment.dto.CommentResponse;
import instagram.user.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class CommentController {

	private final CommentService commentService;
	
	@PostMapping("/api/posts/{postId}/comments")
	public ResponseEntity<CommentResponse> addComment(
			@AuthenticationPrincipal User currentUser,
			@PathVariable Long postId,
			@Valid @RequestBody CommentRequest request
		) {
		CommentResponse response = commentService.addComment(currentUser.getId(), postId, request);
		return ResponseEntity.status(HttpStatus.CREATED).body(response);
	}
	
	@DeleteMapping("/api/comments/{commentId}")
	public ResponseEntity<Void> deleteComment(
			@AuthenticationPrincipal User currentUser,
			@PathVariable Long commentId
		) {
		commentService.deleteComment(currentUser.getId(), commentId);
		return ResponseEntity.noContent().build();
	}
	
	@GetMapping("/api/posts/{postId}/comments")
	public ResponseEntity<Page<CommentResponse>> getComments(
			@AuthenticationPrincipal User currentUser,
			@PathVariable Long postId,
			@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "20") int size
		) {
		Pageable pageable = PageRequest.of(page, size);
		return ResponseEntity.ok(commentService.getCommentsForPost(postId, currentUser.getId(), pageable));
	}
	
	@GetMapping("/api/comments/{commentId}/replies")
	public ResponseEntity<Page<CommentResponse>> getReplies(
			@AuthenticationPrincipal User currentUser,
			@PathVariable Long commentId,
			@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "20") int size
		) {
		Pageable pageable = PageRequest.of(page, size);
		return ResponseEntity.ok(commentService.getReplies(commentId, currentUser.getId(), pageable));
	}
}
