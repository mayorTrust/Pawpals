<?php
header('Content-Type: application/json');

$uploadDir = __DIR__ . '/uploads/';
$uploadedFileUrls = [];
$errors = [];

// Ensure the upload directory exists
if (!is_dir($uploadDir)) {
    if (!mkdir($uploadDir, 0755, true)) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'errors' => ['Failed to create upload directory.']
        ]);
        exit;
    }
}

if (isset($_FILES['images'])) {
    $totalFiles = count($_FILES['images']['name']);

    // Define allowed file types and their corresponding MIME types
    $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif'];
    $allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];

    for ($i = 0; $i < $totalFiles; $i++) {
        $fileName = $_FILES['images']['name'][$i];
        $fileTmpName = $_FILES['images']['tmp_name'][$i];
        $fileSize = $_FILES['images']['size'][$i];
        $fileError = $_FILES['images']['error'][$i];

        // 1. Check for upload errors
        if ($fileError !== UPLOAD_ERR_OK) {
            $errors[] = "Error uploading file: " . $fileName . " (Error code: " . $fileError . ")";
            continue;
        }

        // 2. Check file size
        if ($fileSize > 10000000) { // 10MB max
            $errors[] = "File is too large (max 10MB): " . $fileName;
            continue;
        }

        // 3. Validate file extension
        $fileExt = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
        if (!in_array($fileExt, $allowedExtensions)) {
            $errors[] = "Invalid file extension: " . $fileName . " (Allowed: " . implode(', ', $allowedExtensions) . ")";
            continue;
        }

        // 4. Validate MIME type for security
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $fileTmpName);
        finfo_close($finfo);

        if (!in_array($mimeType, $allowedMimeTypes)) {
            $errors[] = "Invalid file type: " . $fileName . ". Suspected malicious file.";
            continue;
        }

        // 5. Generate a unique name and move the file
        $fileNameNew = uniqid('', true) . "." . $fileExt;
        $fileDestination = $uploadDir . $fileNameNew;

        if (move_uploaded_file($fileTmpName, $fileDestination)) {
            // Dynamically create the base URL
            $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? "https://" : "http://";
            $host = $_SERVER['HTTP_HOST'];
            $baseUrl = $protocol . $host;
            
            $uploadedFileUrls[] = $baseUrl . "/uploads/" . $fileNameNew;
        } else {
            $errors[] = "Failed to move uploaded file: " . $fileName;
        }
    }
} else {
    $errors[] = "No images were uploaded.";
}

if (empty($errors)) {
    echo json_encode([
        'success' => true,
        'urls' => $uploadedFileUrls
    ]);
} else {
    http_response_code(400); // Bad request
    echo json_encode([
        'success' => false,
        'errors' => $errors
    ]);
}
?>