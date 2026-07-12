package instagram.common.exception;

public class PrivateAccountException extends RuntimeException {
	public PrivateAccountException(String message) {
		super(message);
	}
	public PrivateAccountException() {
		super("Private account exception");
	}
}
