package instagram.like;

import org.springframework.data.jpa.repository.JpaRepository;

import instagram.comment.Comment;
import instagram.post.Post;
import instagram.user.User;

public interface LikeRepository extends JpaRepository<Like, Long> {

	boolean existsByUserAndPost(User user, Post post);
	
	boolean existsByUserAndComment(User user, Comment comment);
	
	long countByPost(Post post);
	
	long countByComment(Comment comment);
	
	void deleteByUserAndPost(User user, Post post);
	
	void deleteByUserAndComment(User user, Comment comment);
}
