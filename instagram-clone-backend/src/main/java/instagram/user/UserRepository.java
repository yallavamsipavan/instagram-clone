package instagram.user;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserRepository extends JpaRepository<User, Long> {
	
	Optional<User> findByUsername(String username);
	
	Optional<User> findByEmail(String email);
	
	boolean existsByUsername(String username);
	
	boolean existsByEmail(String email);
	
	@Query(value = "SELECT * FROM users WHERE username ILIKE CONCAT('%', :query, '%') LIMIT 20", nativeQuery = true)
	List<User> searchByUsername(@Param("query") String query);
}
