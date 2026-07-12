package instagram.message;

import java.time.LocalDateTime;

import instagram.post.Post;
import instagram.user.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "messages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Message {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "sender_id", nullable = false)
	private User sender;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "receiver_id", nullable = false)
	private User receiver;
	
	@Column
	private String content;
	
	@Enumerated(EnumType.STRING)
	@Column(name = "message_type", nullable = false, length = 20)
	private MessageType messageType;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "shared_post_id")
	private Post sharedPost;
	
	@Column(name = "is_read", nullable = false)
	@Builder.Default
	private boolean isRead = false;
	
	@Column(name = "is_deleted", nullable = false)
	@Builder.Default
	private boolean isDeleted = false;
	
	@Column(name = "edited_at")
	private LocalDateTime editedAt;
	
	@Column(name = "created_at", nullable = false, updatable = false)
	private LocalDateTime createdAt;
	
	@PrePersist
	protected void onCreate() {
		createdAt = LocalDateTime.now();
	}
}
