package instagram.message;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import instagram.message.dto.ConversationPreview;
import instagram.message.dto.EditMessageRequest;
import instagram.message.dto.MessageResponse;
import instagram.message.dto.SendMessageRequest;
import instagram.user.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessageController {

	private final MessageService messageService;
	
	@PostMapping("/{receiverId}")
	public ResponseEntity<MessageResponse> sendMessage(
			@AuthenticationPrincipal User currentUser,
			@PathVariable Long receiverId,
			@Valid @RequestBody SendMessageRequest request
		) {
		MessageResponse response = messageService.sendMessage(currentUser.getId(), receiverId, request);
		return ResponseEntity.status(HttpStatus.CREATED).body(response);
	}
	
	@PutMapping("/{messageId}")
	public ResponseEntity<MessageResponse> editMessage(
			@AuthenticationPrincipal User currentUser,
			@PathVariable Long messageId,
			@Valid @RequestBody EditMessageRequest request
		) {
		return ResponseEntity.ok(messageService.editMessage(currentUser.getId(), messageId, request));
	}
	
	@DeleteMapping("/{messageId}")
	public ResponseEntity<Void> unsendMessage(
			@AuthenticationPrincipal User currentUser,
			@PathVariable Long messageId
		) {
		messageService.unsendMessage(currentUser.getId(), messageId);
		return ResponseEntity.noContent().build();
	}
	
	@GetMapping("/conversation/{otherUserId}")
	public ResponseEntity<Page<MessageResponse>> getConversation(
			@AuthenticationPrincipal User currentUser,
			@PathVariable Long otherUserId,
			@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "30") int size
		) {
		Pageable pageable = PageRequest.of(page, size);
		return ResponseEntity.ok(messageService.getConversation(currentUser.getId(), otherUserId, pageable));
	}
	
	@GetMapping("/conversations")
	public ResponseEntity<List<ConversationPreview>> getConversationsList(@AuthenticationPrincipal User currentUser) {
		return ResponseEntity.ok(messageService.getConversationsList(currentUser.getId()));
	}
}
