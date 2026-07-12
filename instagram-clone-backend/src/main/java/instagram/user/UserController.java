package instagram.user;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import instagram.user.dto.UpdateProfileRequest;
import instagram.user.dto.UserProfileResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

	private final UserService userService;
	
	@GetMapping("/{username}")
	public ResponseEntity<UserProfileResponse> getProfile(@PathVariable String username) {
		return ResponseEntity.ok(userService.getProfileByUsername(username));
	}
	
	@PutMapping("/me")
	public ResponseEntity<UserProfileResponse> updateProfile(@AuthenticationPrincipal User currentUser, @Valid @RequestBody UpdateProfileRequest request) {
		return ResponseEntity.ok(userService.updateProfile(currentUser.getId(), request));
	}
	
	@PatchMapping("/me/privacy")
	public ResponseEntity<UserProfileResponse> togglePrivacy(@AuthenticationPrincipal User currentUser) {
		return ResponseEntity.ok(userService.togglePrivacy(currentUser.getId()));
	}
	
	@GetMapping("/search")
	public ResponseEntity<List<UserProfileResponse>> searchUsers(@RequestParam String query) {
		return ResponseEntity.ok(userService.searchUsers(query));
	}
}
