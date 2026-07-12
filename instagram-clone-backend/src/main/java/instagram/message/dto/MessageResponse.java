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
public class MessageResponse {
	private Long id;
	private Long senderId;
	private String senderUsername;
	private Long receiverId;
	private String receiverUsername;
	private String content;
	private String messageType;
	private Long sharedPostId;
	private String sharedPostMediaUrl;
	private boolean isRead;
	private boolean isDeleted;
	private LocalDateTime editedAt;
	private LocalDateTime createdAt;
}
