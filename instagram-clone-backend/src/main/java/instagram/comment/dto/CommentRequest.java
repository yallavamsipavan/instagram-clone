package instagram.comment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CommentRequest {

	@NotBlank(message = "Comment connot be empty")
	@Size(max = 1000, message = "Comment cannot exceed 1000 characters")
	private String content;
	
	private Long parentCommentId;
}
