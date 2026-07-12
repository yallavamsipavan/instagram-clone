package instagram.post;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import instagram.user.User;

public interface PostRepository extends JpaRepository<Post, Long> {

	Page<Post> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);
	
	long countByUser(User user);
	
	@Query("SELECT p FROM Post p WHERE p.user.id IN :followedUserIds ORDER BY p.createdAt DESC")
	Page<Post> findFeedForUser(@Param("followedUserIds") List<Long> followedUserIds, Pageable pageable);
}
