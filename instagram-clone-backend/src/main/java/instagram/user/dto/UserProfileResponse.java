package instagram.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponse {
	private Long id;
	private String username;
	private String fullName;
	private String bio;
	private String avatarUrl;
	private boolean isPrivate;
	private long followersCount;
	private long followingCount;
	private long postsCount;
}
