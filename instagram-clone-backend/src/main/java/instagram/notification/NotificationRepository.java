package instagram.notification;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import instagram.user.User;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

	Page<Notification> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);
	
	long countByUserAndIsRead(User user, boolean isRead);
}
