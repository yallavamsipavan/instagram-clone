package instagram.post;

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
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import instagram.post.dto.PostResponse;
import instagram.user.User;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {

	private final PostService postService;
	
	@PostMapping(consumes = "multipart/form-data")
	public ResponseEntity<PostResponse> createPost(
			@AuthenticationPrincipal User currentUser,
			@RequestParam("file") MultipartFile file,
			@RequestParam(value = "caption", required = false) String caption
		) {
		PostResponse response = postService.createdPost(currentUser.getId(), file, caption);
		return ResponseEntity.status(HttpStatus.CREATED).body(response);
	}
	
	@DeleteMapping("/{postId}")
	public ResponseEntity<Void> deletePost(
			@AuthenticationPrincipal User currentUser,
			@PathVariable Long postId
		) {
		postService.deletePost(currentUser.getId(), postId);
		return ResponseEntity.noContent().build();
	}
	
	@GetMapping("/user/{username}")
	public ResponseEntity<Page<PostResponse>> getUserPosts(
			@AuthenticationPrincipal User currentUser,
			@PathVariable String username,
			@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "20") int size
		) {
		Pageable pageable = PageRequest.of(page, size);
		return ResponseEntity.ok(postService.getUserPosts(currentUser.getId(), username, pageable));
	}
	
	@GetMapping("/feed")
	public ResponseEntity<Page<PostResponse>> getFeed(
			@AuthenticationPrincipal User currentUser,
			@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "20") int size
		) {
		Pageable pageable = PageRequest.of(page, size);
		return ResponseEntity.ok(postService.getFeed(currentUser.getId(), pageable));
	}
}
