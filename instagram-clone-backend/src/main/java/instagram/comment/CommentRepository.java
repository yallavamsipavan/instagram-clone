package instagram.comment;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import instagram.post.Post;

public interface CommentRepository extends JpaRepository<Comment, Long> {
	
	Page<Comment> findByPostAndParentCommentIsNullOrderByCreatedAtAsc(Post post, Pageable pageable);
	
	Page<Comment> findByParentCommentOrderByCreatedAtAsc(Comment parentComment, Pageable pageable);
	
	long countByPost(Post post);
	
	long countByParentComment(Comment parentComment);
}
