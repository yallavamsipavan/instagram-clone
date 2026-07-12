package instagram.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RefreshTokenRequest {

	@NotBlank(message = "Refresh tooken is required")
	private String refreshToken;
}
