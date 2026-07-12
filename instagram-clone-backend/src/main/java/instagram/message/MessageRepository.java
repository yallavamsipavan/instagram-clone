package instagram.message;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import instagram.user.User;

public interface MessageRepository extends JpaRepository<Message, Long> {

	@Query("""
			SELECT m FROM Message m
			WHERE (m.sender = :userA AND m.receiver = :userB)
			   OR (m.sender = :userB AND m.receiver = :userA)
			ORDER BY m.createdAt DESC
			""")
	Page<Message> findConversation(@Param("userA") User userA, @Param("userB") User userB, Pageable pageable);
	
//	@Query("""
//			SELECT m FROM Message m
//			WHERE m.id IN (
//				SELECT MAX(m2.id) FROM Message m2
//				WHERE m2.sender = :user OR m2.receiver = :user
//				GROUP BY
//					CASE
//						WHEN m2.sender = :user THEN m2.receiver
//						ELSE m2.sender
//					END
//			) ORDER BY m.createdAt DESC
//			""")
//	List<Message> findLatestMessagePerConversation(@Param("user") User user);
	
	@Query(value = """
			SELECT m.* FROM messages m
			INNER JOIN (
				SELECT
					CASE WHEN sender_id = :userId THEN receiver_id ELSE sender_id END AS other_user_id,
					MAX(id) AS max_id
				FROM messages
				WHERE sender_id = :userId OR receiver_id = :userId
				GROUP BY other_user_id
			) latest ON m.id = latest.max_id
			ORDER BY m.created_at DESC
			""", nativeQuery = true)
	List<Message> findLatestMessagePerConversation(@Param("userId") Long userId);
	
	
	
	long countByReceiverAndIsReadAndIsDeleted(User receiver, boolean isRead, boolean isDeleted);
}
