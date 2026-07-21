package instagram.notification;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
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
	
	@Transactional
	public void removeNotification(User recipient, User actor, NotificationType type, Long entityId) {
		notificationRepository.findByUserAndActorAndTypeAndEntityId(recipient, actor, type, entityId)
		.ifPresent(notification -> {
			Long notificationId = notification.getId();
			notificationRepository.delete(notification);
			messagingTemplate.convertAndSendToUser(recipient.getUsername(), "/queue/notifications/deleted", notificationId);
		});
	}
	
	@Transactional
	public Page<NotificationResponse> getNotifications(Long userId, Pageable pageable) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        LocalDateTime cutoff = LocalDateTime.now().minusHours(48);
        notificationRepository.deleteByUserAndIsReadTrueAndReadAtBefore(user, cutoff);

        Page<Notification> page = notificationRepository.findByUserOrderByCreatedAtDesc(user, pageable);

        List<NotificationResponse> responses = page.getContent().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());

        List<Notification> toMarkRead = page.getContent().stream()
                .filter(n -> !n.isRead())
                .collect(Collectors.toList());

        if (!toMarkRead.isEmpty()) {
            LocalDateTime now = LocalDateTime.now();
            toMarkRead.forEach(n -> {
                n.setRead(true);
                n.setReadAt(now);
            });
            notificationRepository.saveAll(toMarkRead);
        }

        return new PageImpl<>(responses, pageable, page.getTotalElements());
    }

	
	@Transactional
	public void markAsRead(Long userId, Long notificationId) {
		Notification notification = notificationRepository.findById(notificationId)
				.orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
		
		if(!notification.getUser().getId().equals(userId)) throw new IllegalArgumentException("You can only mark your own notifications as read");
		
		notification.setRead(true);
		notification.setReadAt(LocalDateTime.now());
		notificationRepository.save(notification);
	}

	@Transactional
	public void removeAllOfType(User recipient, User actor, NotificationType type) {
		List<Notification> matches = notificationRepository.findAllByUserAndActorAndType(recipient, actor, type);
		if(!matches.isEmpty()) {
			notificationRepository.deleteAll(matches);
			matches.forEach(n -> {
				messagingTemplate.convertAndSendToUser(
						recipient.getUsername(),
						"/queue/notifications/deleted",
						n.getId());
				}
			);
		}
	}
	
	@Transactional
	public void notifyFresh(User recipient, User actor, NotificationType type, Long entityId) {
		if(recipient.getId().equals(actor.getId())) return;
		
		Notification notification = Notification.builder()
				.user(recipient)
				.actor(actor)
				.type(type)
				.entityId(entityId)
				.build();
		
		notificationRepository.save(notification);
		
		NotificationResponse response = toResponse(notification);
		messagingTemplate.convertAndSendToUser(
				recipient.getUsername(),
				"/queue/notifications",
				response
			);
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
