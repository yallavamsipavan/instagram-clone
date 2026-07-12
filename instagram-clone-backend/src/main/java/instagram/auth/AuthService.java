package instagram.auth;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import instagram.auth.dto.AuthResponse;
import instagram.auth.dto.LoginRequest;
import instagram.auth.dto.RegisterRequest;
import instagram.common.exception.DuplicateResourceException;
import instagram.user.User;
import instagram.user.UserRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	private final JwtService jwtService;
	private final AuthenticationManager authenticationManager;
	
	public AuthResponse register(RegisterRequest request) {
		if(userRepository.existsByUsername(request.getUsername())) throw new DuplicateResourceException("Username is already taken");
		if(userRepository.existsByEmail(request.getEmail())) throw new DuplicateResourceException("Email is already registered");
		User user = User.builder()
			.username(request.getUsername())
			.email(request.getEmail())
			.passwordHash(passwordEncoder.encode(request.getPassword()))
			.fullName(request.getFullName())
			.isPrivate(false)
			.build();
		userRepository.save(user);
		String accessToken = jwtService.generateAccessToken(user);
		String refreshToken = jwtService.generateRefreshToken(user);
		
		return AuthResponse.builder()
			.accessToken(accessToken)
			.refreshToken(refreshToken)
			.tokenType("Bearer")
			.userId(user.getId())
			.username(user.getUsername())
			.build();
	}
	
	public AuthResponse login(LoginRequest request) {
		authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(request.getUsernameOrEmail(), request.getPassword()));
		User user = userRepository.findByUsername(request.getUsernameOrEmail())
			.or(() -> userRepository.findByEmail(request.getUsernameOrEmail()))
			.orElseThrow(() -> new IllegalStateException("User not found after authentication"));
		String accessToken = jwtService.generateAccessToken(user);
		String refreshToken = jwtService.generateRefreshToken(user);
		
		return AuthResponse.builder()
			.accessToken(accessToken)
			.refreshToken(refreshToken)
			.tokenType("Bearer")
			.userId(user.getId())
			.username(user.getUsername())
			.build();
	}
	
	public AuthResponse refreshAccessToken(String refreshToken) {
		String username;
		try {
			username = jwtService.extractUsername(refreshToken);
		} catch (Exception e) {
			throw new IllegalArgumentException("Invalid or expired refresh token");
		}
		
		User user = userRepository.findByUsername(username)
				.or(() -> userRepository.findByEmail(username))
				.orElseThrow(() -> new IllegalArgumentException("Invalid refresh token"));
		
		if(!jwtService.isTokenValid(refreshToken, user)) throw new IllegalArgumentException("Invalid or expired refresh token");
		
		String newAccessToken = jwtService.generateAccessToken(user);
		String newRefreshToken = jwtService.generateRefreshToken(user);
		
		return AuthResponse.builder()
				.accessToken(newAccessToken)
				.refreshToken(newRefreshToken)
				.tokenType("Bearer")
				.userId(user.getId())
				.username(user.getUsername())
				.build();
	}
}
