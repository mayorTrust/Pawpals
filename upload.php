<?php
header('Content-Type: application/json');

$uploadDir = __DIR__ . '/uploads/';
$uploadedFileUrls = [];
$errors = [];

// Ensure the upload directory exists
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

if (isset($_FILES['images'])) {
    $totalFiles = count($_FILES['images']['name']);

    for ($i = 0; $i < $totalFiles; $i++) {
        $fileName = $_FILES['images']['name'][$i];
        $fileTmpName = $_FILES['images']['tmp_name'][$i];
        $fileSize = $_FILES['images']['size'][$i];
        $fileError = $_FILES['images']['error'][$i];
        $fileType = $_FILES['images']['type'][$i];

        $fileExt = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
        $allowed = ['jpg', 'jpeg', 'png', 'gif'];

        if (in_array($fileExt, $allowed)) {
            if ($fileError === 0) {
                if ($fileSize < 10000000) { // 10MB max
                    $fileNameNew = uniqid('', true) . "." . $fileExt;
                    $fileDestination = $uploadDir . $fileNameNew;

                    if (move_uploaded_file($fileTmpName, $fileDestination)) {
                        // Assuming the server is accessible at http://localhost:8000
                        $uploadedFileUrls[] = "http://localhost:8000/uploads/" . $fileNameNew;
                    } else {
                        $errors[] = "Failed to move uploaded file: " . $fileName;
                    }
                } else {
                    $errors[] = "File is too large (max 10MB): " . $fileName;
                }
            } else {
                $errors[] = "There was an error uploading file: " . $fileName . " (Error code: " . $fileError . ")";
            }
        } else {
            $errors[] = "Invalid file type (allowed: jpg, jpeg, png, gif): " . $fileName;
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