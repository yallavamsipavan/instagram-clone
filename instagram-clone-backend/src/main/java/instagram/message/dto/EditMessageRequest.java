package instagram.message.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class EditMessageRequest {

	@NotBlank(message = "Content cannot be empty")
	@Size(max = 5000, message = "Message connot exceed 5000 characters")
	private String content;
}
