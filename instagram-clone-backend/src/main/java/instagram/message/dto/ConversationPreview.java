package instagram.message.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConversationPreview {
	private Long otherUserId;
	private String otherUsername;
	private String otherUserAvatarUrl;
	private String lastMessagePreview;
	private LocalDateTime lastMessageAt;
	private boolean lastMessageReadByMe;
}
