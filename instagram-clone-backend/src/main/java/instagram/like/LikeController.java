package instagram.like;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

import instagram.user.User;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class LikeController {

	private final LikeService likeService;
	
	@PostMapping("/api/posts/{postId}/like")
	public ResponseEntity<Void> likePost(
			@AuthenticationPrincipal User currentUser,
			@PathVariable Long postId
		) {
		likeService.likePost(currentUser.getId(), postId);
		return ResponseEntity.noContent().build();
	}
	
	@DeleteMapping("/api/posts/{postId}/like")
	public ResponseEntity<Void> unlikePost(
			@AuthenticationPrincipal User currentUser,
			@PathVariable long postId
		) {
		likeService.unlikePost(currentUser.getId(), postId);
		return ResponseEntity.noContent().build();
	}
	
	@PostMapping("/api/comments/{commentId}/like")
	public ResponseEntity<Void> likeComment(
			@AuthenticationPrincipal User currentUser,
			@PathVariable Long commentId
		) {
		likeService.likeComment(currentUser.getId(), commentId);
		return ResponseEntity.noContent().build();
	}
	
	@DeleteMapping("/api/comments/{commentId}/like")
	public ResponseEntity<Void> unlikeComment(
			@AuthenticationPrincipal User currentUser,
			@PathVariable Long commentId
		) {
		likeService.unlikeComment(currentUser.getId(), commentId);
		return ResponseEntity.noContent().build();
	}
}
