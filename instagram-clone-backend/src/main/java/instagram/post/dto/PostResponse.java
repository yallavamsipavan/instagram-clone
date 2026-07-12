package instagram.post.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PostResponse {
	private Long id;
	private Long userId;
	private String username;
	private String userAvatarUrl;
	private String mediaUrl;
	private String mediaType;
	private String caption;
	private long likesCount;
	private long commentsCount;
	private boolean likedByCurrentUser;
	private LocalDateTime createdAt;
}
