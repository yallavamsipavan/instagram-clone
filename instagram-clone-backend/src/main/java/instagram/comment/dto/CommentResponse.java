package instagram.comment.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommentResponse {

	private Long id;
	private Long postId;
	private Long userId;
	private String username;
	private String userAvatarUrl;
	private String content;
	private Long parentCommentId;
	private long likesCount;
	private long repliesCount;
	private boolean likedByCurrentUser;
	private LocalDateTime createdAt;
}
