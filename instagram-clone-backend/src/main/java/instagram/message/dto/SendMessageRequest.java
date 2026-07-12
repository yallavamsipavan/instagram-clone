package instagram.message.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class SendMessageRequest {

	@Size(max = 5000, message = "Message cannot exceed 5000 characters")
	private String content;
	
	private Long sharedPostId;
}
