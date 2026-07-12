package instagram.notification;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import instagram.notification.dto.NotificationResponse;
import instagram.user.User;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

	private final NotificationService notificationService;
	
	@GetMapping
	public ResponseEntity<Page<NotificationResponse>> getNotifications(
			@AuthenticationPrincipal User currentUser,
			@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "20") int size
		) {
		Pageable pageable = PageRequest.of(page, size);
		return ResponseEntity.ok(notificationService.getNotifications(currentUser.getId(), pageable));
	}
	
	@PatchMapping("/{notificationId}/read")
	public ResponseEntity<Void> markAsRead(
			@AuthenticationPrincipal User currentUser,
			@PathVariable Long notificationId
		) {
		notificationService.markAsRead(currentUser.getId(), notificationId);
		return ResponseEntity.noContent().build();
	}
	
	@GetMapping("/unread-count")
	public ResponseEntity<Long> getUnreadCount(@AuthenticationPrincipal User currentUser) {
		return ResponseEntity.ok(notificationService.getUnreadCount(currentUser.getId()));
	}
}
