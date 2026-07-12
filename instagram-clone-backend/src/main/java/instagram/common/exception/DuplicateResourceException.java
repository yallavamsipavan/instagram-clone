package instagram.common.exception;

public class DuplicateResourceException extends RuntimeException {
	public DuplicateResourceException(String message) {
		super(message);
	}
	public DuplicateResourceException() {
		super("Duplicate Resource Exception");
	}
}
