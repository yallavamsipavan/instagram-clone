package instagram.notification;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import instagram.user.User;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

	Page<Notification> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);
	
	long countByUserAndIsRead(User user, boolean isRead);
	
	boolean existsByUserAndActorAndTypeAndEntityId(User user, User actor, NotificationType type, Long entityId);
	
	Optional<Notification> findByUserAndActorAndTypeAndEntityId(User user, User actor, NotificationType type, Long entityId);

    void deleteByUserAndIsReadTrueAndReadAtBefore(User user, LocalDateTime cutoff);
    
    List<Notification> findAllByUserAndActorAndType(User user, User actor, NotificationType type);
}
