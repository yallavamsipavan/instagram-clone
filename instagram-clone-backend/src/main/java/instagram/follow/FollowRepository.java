package instagram.follow;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import instagram.user.User;

public interface FollowRepository extends JpaRepository<Follow, Long> {
	
	Optional<Follow> findByFollowerAndFollowing(User follower, User following);
	
	boolean existsByFollowerAndFollowingAndStatus(User follower, User following, FollowStatus status);
	
	Page<Follow> findByFollowingAndStatus(User following, FollowStatus status, Pageable pageable);
	
	Page<Follow> findByFollowerAndStatus(User follower, FollowStatus status, Pageable pageable);
	
	long countByFollowingAndStatus(User following, FollowStatus status);
	
	long countByFollowerAndStatus(User follower, FollowStatus status);
	
	void deleteByFollowerAndFollowing(User follower, User following);
}
