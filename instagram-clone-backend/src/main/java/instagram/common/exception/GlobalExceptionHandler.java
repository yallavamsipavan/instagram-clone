package instagram.common.exception;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;

@RestControllerAdvice
public class GlobalExceptionHandler {

	@ExceptionHandler(DuplicateResourceException.class)
	public ResponseEntity<ErrorResponse> handleDuplicateResource(DuplicateResourceException exp) {
		return buildResponse(HttpStatus.CONFLICT, exp.getMessage(), null);
	}
	
	@ExceptionHandler(ResourceNotFoundException.class)
	public ResponseEntity<ErrorResponse> handleResourceNotFound(ResourceNotFoundException exp) {
		return buildResponse(HttpStatus.NOT_FOUND, exp.getMessage(), null);
	}
	
	@ExceptionHandler(BadCredentialsException.class)
	public ResponseEntity<ErrorResponse> handleBadCredentials(BadCredentialsException exp) {
		return buildResponse(HttpStatus.UNAUTHORIZED, "Invalid username/email or password", null);
	}
	
	@ExceptionHandler(NoResourceFoundException.class)
	public ResponseEntity<ErrorResponse> handleNoResourceFound(NoResourceFoundException exp) {
		return buildResponse(HttpStatus.NOT_FOUND, "Resource not found", null);
	}
	
	@ExceptionHandler(PrivateAccountException.class)
	public ResponseEntity<ErrorResponse> handlePrivateAccount(PrivateAccountException exp) {
		return buildResponse(HttpStatus.FORBIDDEN, exp.getMessage(), null);
	}
	
	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<ErrorResponse> handleValidationErrors(MethodArgumentNotValidException exp) {
		List<String> details = exp.getBindingResult()
			.getFieldErrors()
			.stream()
			.map(error -> error.getField() + " : " + error.getDefaultMessage())
			.toList();
		return buildResponse(HttpStatus.BAD_REQUEST, "Validation failed", details);
	}
	
	@ExceptionHandler
	public ResponseEntity<ErrorResponse> handleGenericException(Exception exp) {
		return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR, "An unexpected error occurred", null);
	}
	
	private ResponseEntity<ErrorResponse> buildResponse(HttpStatus status, String message, List<String> details) {
		ErrorResponse error = ErrorResponse.builder()
			.timestamp(LocalDateTime.now())
			.status(status.value())
			.error(status.getReasonPhrase())
			.message(message)
			.details(details)
			.build();
		return new ResponseEntity<>(error, status);
	}
}
