package instagram.common;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

@Service
public class FileStorageService {

	@Value("${storage.location}")
	private String storageLocation;
	
	@Value("${storage.base-url}")
	private String baseUrl;
	
	private Path getStorageRoot() {
		Path root = Paths.get(storageLocation).toAbsolutePath().normalize();
		try {
			Files.createDirectories(root);
		} catch (IOException e) {
			throw new RuntimeException("Could not create storage directory", e);
		}
		return root;
	}
	
	public String store(MultipartFile file) {
		if(file.isEmpty()) throw new IllegalArgumentException("Cannot store empty file");
		String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
		String extension = "";
		int dotIndex = originalFilename.lastIndexOf('.');
		if(dotIndex > 0) extension = originalFilename.substring(dotIndex);
		
		String storedFilename = UUID.randomUUID() + extension;
		
		try {
			Path targetPath = getStorageRoot().resolve(storedFilename);
			Files.copy(file.getInputStream(), targetPath);
		} catch (IOException e) {
			throw new RuntimeException("Failed to store file : " + originalFilename, e);
		}
		
		return baseUrl + "/" + storedFilename;
	}
	
	public void delete(String fileUrl) {
		try {
			String filename = fileUrl.substring(fileUrl.lastIndexOf('/') + 1);
			Path targetPath = getStorageRoot().resolve(filename);
			Files.deleteIfExists(targetPath);
		} catch (Exception e) {
			
		}
	}
}
