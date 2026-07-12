package instagram.follow;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import instagram.follow.dto.FollowResponse;
import instagram.user.User;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/follows")
@RequiredArgsConstructor
public class FollowController {

	private final FollowService followService;
	
	@PostMapping("/{targetUserId}")
	public ResponseEntity<FollowResponse> sendFollowRequest(@AuthenticationPrincipal User currentUser, @PathVariable Long targetUserId) {
		return ResponseEntity.ok(followService.sendFollowRequest(currentUser.getId(), targetUserId));
	}
	
	@PutMapping("/{followerUserId}/accept")
	public ResponseEntity<FollowResponse> acceptFollowRequest(@AuthenticationPrincipal User currentUser, @PathVariable Long followerUserId) {
		return ResponseEntity.ok(followService.acceptFollowRequest(currentUser.getId(), followerUserId));
	}
	
	@DeleteMapping("/{followerUserId}/reject")
	public ResponseEntity<FollowResponse> rejectFollowRequest(@AuthenticationPrincipal User currentUser, @PathVariable Long followerUserId) {
		followService.rejectFollowRequest(currentUser.getId(), followerUserId);
		return ResponseEntity.noContent().build();
	}
	
	@DeleteMapping("/{targetUserId}")
	public ResponseEntity<Void> unfollow(@AuthenticationPrincipal User currentUser, @PathVariable Long targetUserId) {
		followService.unfollow(currentUser.getId(), targetUserId);
		return ResponseEntity.noContent().build();
	}
	
	@GetMapping("/{userId}/followers")
	public ResponseEntity<Page<FollowResponse>> getFollowers(
			@AuthenticationPrincipal User currentUser,
			@PathVariable Long userId,
			@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "20") int size
		) {
		Pageable pageable = PageRequest.of(page, size);
		return ResponseEntity.ok(followService.getFollowers(currentUser.getId(), userId, pageable));
	}
	
	@GetMapping("/{userId}/following")
	public ResponseEntity<Page<FollowResponse>> getFollowing(
			@AuthenticationPrincipal User currentUser,
			@PathVariable Long userId,
			@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "20") int size
		) {
		Pageable pageable = PageRequest.of(page, size);
		return ResponseEntity.ok(followService.getFollowing(currentUser.getId(), userId, pageable));
	}
}
