<?php
header('Content-Type: application/json');

require __DIR__ . '/vendor/autoload.php';

// IMPORTANT: You must create a service account in the Google Cloud Console and
// download the JSON credentials file. Rename it to 'service-account-credentials.json'
// and place it in the same directory as this script.
//
// 1. Go to https://console.cloud.google.com/
// 2. Create a new project or select an existing one.
// 3. Enable the Google Drive API for your project.
// 4. Go to "Credentials" and create a new service account.
// 5. Download the JSON key file and rename it to 'service-account-credentials.json'.
// 6. Share the Google Drive folder you want to upload to with the service account's email address.

const GOOGLE_API_CREDENTIALS = __DIR__ . '/service-account-credentials.json';
const GDRIVE_FOLDER_ID = '1ouvC9XweCu3co16Kx5GIM_L3BVQHvTbr'; // Replace with your Google Drive folder ID

if (!file_exists(GOOGLE_API_CREDENTIALS)) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'errors' => ['Google API credentials file not found. Please follow the setup instructions in the script.']
    ]);
    exit;
}

$response = ['success' => false, 'urls' => [], 'errors' => []];

try {
    $client = new Google_Client();
    $client->setAuthConfig(GOOGLE_API_CREDENTIALS);
    $client->addScope(Google_Service_Drive::DRIVE_FILE);
    $driveService = new Google_Service_Drive($client);

    if (isset($_FILES['images'])) {
        $totalFiles = count($_FILES['images']['name']);

        for ($i = 0; $i < $totalFiles; $i++) {
            $fileName = $_FILES['images']['name'][$i];
            $fileTmpName = $_FILES['images']['tmp_name'][$i];
            $fileType = $_FILES['images']['type'][$i];

            if ($_FILES['images']['error'][$i] !== UPLOAD_ERR_OK) {
                $response['errors'][] = "Error uploading file: " . $fileName;
                continue;
            }
            
            $fileMetadata = new Google_Service_Drive_DriveFile([
                'name' => $fileName,
                'parents' => [GDRIVE_FOLDER_ID]
            ]);

            $content = file_get_contents($fileTmpName);

            $file = $driveService->files->create($fileMetadata, [
                'data' => $content,
                'mimeType' => $fileType,
                'uploadType' => 'multipart',
                'fields' => 'id, webViewLink, webContentLink'
            ]);

            // Make the file publicly readable
            $permission = new Google_Service_Drive_Permission([
                'type' => 'anyone',
                'role' => 'reader',
            ]);
            $driveService->permissions->create($file->id, $permission);

            // The webContentLink is a direct download link, but it's not suitable for embedding.
            // We'll use the webViewLink and construct a direct link from it.
            // A common pattern is to use the file ID with a specific URL format.
            // For example: https://drive.google.com/uc?id=FILE_ID
            $response['urls'][] = 'https://drive.google.com/uc?id=' . $file->id;
        }

        if (empty($response['errors'])) {
            $response['success'] = true;
        } else {
            http_response_code(400);
        }

    } else {
        $response['errors'][] = "No images were uploaded.";
        http_response_code(400);
    }

} catch (Exception $e) {
    http_response_code(500);
    $response['errors'][] = 'Google Drive API Error: ' . $e->getMessage();
}

echo json_encode($response);
?>
