package instagram.user.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateProfileRequest {

	@Size(max = 100, message = "Full name cannot axceed 100 characters")
	private String fullName;
	
	@Size(max = 500, message = "Bio cannot exceed 500 characters")
	private String bio;
	
	private String avatarUrl;
}
