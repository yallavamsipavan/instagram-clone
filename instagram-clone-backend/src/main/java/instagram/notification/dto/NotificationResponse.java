package instagram.notification.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {
	private Long id;
	private String type;
	private Long actorId;
	private String actorUsername;
	private String actorAvatarUrl;
	private Long entityId;
	private boolean isRead;
	private LocalDateTime createdAt;
}
