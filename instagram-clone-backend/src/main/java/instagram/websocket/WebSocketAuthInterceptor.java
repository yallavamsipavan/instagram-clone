package instagram.websocket;

import org.jspecify.annotations.NonNull;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import instagram.auth.JwtService;
import instagram.user.CustomUserDetailsService;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class WebSocketAuthInterceptor implements ChannelInterceptor {

	private final JwtService jwtService;
	private final CustomUserDetailsService userDetailsService;
	
	@Override
	public Message<?> preSend(@NonNull Message<?> message, @NonNull MessageChannel channel) {
		
		StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
		
		if(accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
			String authHeader = accessor.getFirstNativeHeader("Authorization");
			if(authHeader != null && authHeader.startsWith("Bearer ")) {
				String jwt = authHeader.substring(7);
				try {
					String username = jwtService.extractUsername(jwt);
					UserDetails userDetails = userDetailsService.loadUserByUsername(username);
					if(jwtService.isTokenValid(jwt, userDetails)) {
						UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
						accessor.setUser(authToken);
					}
				} catch (Exception e) {
					// invalid token
				}
			}
		}
		return message;
	}
}
