package instagram.user;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User implements UserDetails {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	@Column(nullable = false, unique = true, length = 30)
	private String username;
	
	@Column(nullable = false, unique = true)
	private String email;
	
	@Column(name = "password_hash", nullable = false)
	private String passwordHash;
	
	@Column(name = "full_name", length = 100)
    private String fullName;
	
	@Column(length = 500)
    private String bio;

    @Column(name = "avatar_url")
    private String avatarUrl;
    
    @Column(name = "is_private", nullable = false)
    @Builder.Default
    private boolean isPrivate = false;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
    	createdAt = LocalDateTime.now();
    	updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
    	updatedAt = LocalDateTime.now();
    }
    
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
    	return List.of(new SimpleGrantedAuthority("ROLE_USER"));
    }
    
    @Override
    public String getPassword() {
    	return passwordHash;
    }
    
    @Override
    public String getUsername() {
    	return username;
    }
    
    @Override
    public boolean isAccountNonExpired() {
    	return true;
    }
    
    @Override
    public boolean isAccountNonLocked() {
    	return true;
    }
    
    @Override
    public boolean isCredentialsNonExpired() {
    	return true;
    }
    
    @Override
    public boolean isEnabled() {
    	return true;
    }
}
