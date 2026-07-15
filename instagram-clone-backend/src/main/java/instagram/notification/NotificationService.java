package instagram.notification;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import instagram.common.exception.ResourceNotFoundException;
import instagram.notification.dto.NotificationResponse;
import instagram.user.User;
import instagram.user.UserRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NotificationService {

	private final NotificationRepository notificationRepository;
	private final UserRepository userRepository;
	private final SimpMessagingTemplate messagingTemplate;
	
	@Transactional
	public void notify(User recipient, User actor, NotificationType type, Long entityId) {
		if(recipient.getId().equals(actor.getId())) return;
		
		boolean alreadyExists = notificationRepository.existsByUserAndActorAndTypeAndEntityId(recipient, actor, type, entityId);
		if(alreadyExists) return;
		
		Notification notification = Notification.builder()
				.user(recipient)
				.actor(actor)
				.type(type)
				.entityId(entityId)
				.build();
		
		notificationRepository.save(notification);
		
		NotificationResponse response = toResponse(notification);
		messagingTemplate.convertAndSendToUser(recipient.getUsername(), "/queue/notifications", response);
	}
	
	@Transactional(readOnly = true)
	public Page<NotificationResponse> getNotifications(Long userId, Pageable pageable) {
		User user = userRepository.findById(userId)
				.orElseThrow(() -> new ResourceNotFoundException("User not found"));
		
		return notificationRepository.findByUserOrderByCreatedAtDesc(user, pageable).map(this::toResponse);
	}
	
	@Transactional
	public void markAsRead(Long userId, Long notificationId) {
		Notification notification = notificationRepository.findById(notificationId)
				.orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
		
		if(!notification.getUser().getId().equals(userId)) throw new IllegalArgumentException("You can only mark your own notifications as read");
		
		notification.setRead(true);
		notificationRepository.save(notification);
	}
	
	@Transactional(readOnly = true)
	public long getUnreadCount(Long userId) {
		User user = userRepository.findById(userId)
				.orElseThrow(() -> new ResourceNotFoundException("User not found"));
		
		return notificationRepository.countByUserAndIsRead(user, false);
	}
	
	private NotificationResponse toResponse(Notification notification) {
		return NotificationResponse.builder()
				.id(notification.getId())
				.type(notification.getType().name())
				.actorId(notification.getActor().getId())
				.actorUsername(notification.getActor().getUsername())
				.actorAvatarUrl(notification.getActor().getAvatarUrl())
				.entityId(notification.getEntityId())
				.isRead(notification.isRead())
				.createdAt(notification.getCreatedAt())
				.build();
	}
}
