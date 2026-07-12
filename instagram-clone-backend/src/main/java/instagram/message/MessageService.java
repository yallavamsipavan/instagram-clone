package instagram.message;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import instagram.common.exception.ResourceNotFoundException;
import instagram.message.dto.ConversationPreview;
import instagram.message.dto.EditMessageRequest;
import instagram.message.dto.MessageResponse;
import instagram.message.dto.SendMessageRequest;
import instagram.post.Post;
import instagram.post.PostRepository;
import instagram.user.User;
import instagram.user.UserRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MessageService {

	private final MessageRepository messageRepository;
	private final UserRepository userRepository;
	private final PostRepository postRepository;
	private final SimpMessagingTemplate messagingTemplate;
	
	@Transactional
	public MessageResponse sendMessage(Long senderId, Long receiverId, SendMessageRequest request) {
		
		if(senderId.equals(receiverId)) throw new IllegalArgumentException("You cannot message yourself");
		
		User sender = userRepository.findById(senderId)
				.orElseThrow(() -> new ResourceNotFoundException("User not found"));
		User receiver = userRepository.findById(receiverId)
				.orElseThrow(() -> new ResourceNotFoundException("User not found"));
		
		Message.MessageBuilder builder = Message.builder()
				.sender(sender)
				.receiver(receiver);
		
		if(request.getSharedPostId() != null) {
			Post post = postRepository.findById(request.getSharedPostId())
					.orElseThrow(() -> new ResourceNotFoundException("Post not found"));
			builder.messageType(MessageType.POST_SHARE)
					.sharedPost(post)
					.content(request.getContent());
		} else {
			if(request.getContent() == null || request.getContent().isBlank()) throw new IllegalArgumentException("Message content cannot be empty");
			builder.messageType(MessageType.TEXT)
					.content(request.getContent());
		}
		
		Message message = builder.build();
		messageRepository.save(message);
		
		MessageResponse response = toResponse(message);
		
		// real-time after connection (may be)
		messagingTemplate.convertAndSendToUser(receiver.getUsername(), "/queue/messages", response);
		
		return response;
	}
	
	@Transactional
	public MessageResponse editMessage(Long userId, Long messageId, EditMessageRequest request) {
		Message message = messageRepository.findById(messageId)
				.orElseThrow(() -> new ResourceNotFoundException("Message not found"));
		
		if(!message.getSender().getId().equals(userId)) throw new IllegalArgumentException("You can only edit your own messages");
		if(message.isDeleted()) throw new IllegalStateException("Cannot edit a deleted message");
		if(message.getMessageType() != MessageType.TEXT) throw new IllegalStateException("Only text messages can be edited");
		
		message.setContent(request.getContent());
		message.setEditedAt(LocalDateTime.now());
		messageRepository.save(message);
		
		MessageResponse response = toResponse(message);
		messagingTemplate.convertAndSendToUser(message.getReceiver().getUsername(), "/queue/messages/edited", response);
		
		return response;
	}
	
	@Transactional
	public void unsendMessage(Long userId, Long messageId) {
		Message message = messageRepository.findById(messageId)
				.orElseThrow(() -> new ResourceNotFoundException("Message not found"));
		
		if(!message.getSender().getId().equals(userId)) throw new IllegalArgumentException("You can only unsend your own messages");
		
		message.setDeleted(true);
		message.setContent(null);
		messageRepository.save(message);
		
		messagingTemplate.convertAndSendToUser(message.getReceiver().getUsername(), "/queue/messages/deleted", message.getId());
	}
	
	@Transactional(readOnly = true)
	public Page<MessageResponse> getConversation(Long userId, Long otherUserId, Pageable pageable) {
		User userA = userRepository.findById(userId)
				.orElseThrow(() -> new ResourceNotFoundException("User not found"));
		User userB = userRepository.findById(otherUserId)
				.orElseThrow(() -> new ResourceNotFoundException("User not found"));
		
		return messageRepository.findConversation(userA, userB, pageable).map(this::toResponse);
	}
	
	@Transactional(readOnly = true)
	public List<ConversationPreview> getConversationsList(Long userId) {
//		User user = userRepository.findById(userId)
//				.orElseThrow(() -> new ResourceNotFoundException("User not found"));
		userRepository.findById(userId)
				.orElseThrow(() -> new ResourceNotFoundException("User not found"));
		
		return messageRepository.findLatestMessagePerConversation(userId).stream()
				.map(m -> {
					boolean iAmSender = m.getSender().getId().equals(userId);
					User other = iAmSender ? m.getReceiver() : m.getSender();
					String preview = m.isDeleted() ? "Message deleted"
							: (m.getMessageType() == MessageType.POST_SHARE ? "Shared a post" : m.getContent());
					return ConversationPreview.builder()
							.otherUserId(other.getId())
							.otherUsername(other.getUsername())
							.otherUserAvatarUrl(other.getAvatarUrl())
							.lastMessagePreview(preview)
							.lastMessageAt(m.getCreatedAt())
							.lastMessageReadByMe(iAmSender || m.isRead())
							.build();
				})
				.collect(Collectors.toList());
	}
	
	private MessageResponse toResponse(Message message) {
		return MessageResponse.builder()
				.id(message.getId())
				.senderId(message.getSender().getId())
				.senderUsername(message.getSender().getUsername())
				.receiverId(message.getReceiver().getId())
				.receiverUsername(message.getReceiver().getUsername())
				.content(message.isDeleted() ? null : message.getContent())
				.messageType(message.getMessageType().name())
				.sharedPostId(message.getSharedPost() != null ? message.getSharedPost().getId() : null)
				.sharedPostMediaUrl(message.getSharedPost() != null ? message.getSharedPost().getMediaUrl() : null)
				.isRead(message.isRead())
				.isDeleted(message.isDeleted())
				.editedAt(message.getEditedAt())
				.createdAt(message.getCreatedAt())
				.build();
	}
}
