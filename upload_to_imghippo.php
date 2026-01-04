<?php
header('Content-Type: application/json');

$apiKey = '4356bbc7f94bc23a178a20e485dd7203';
$apiUrl = 'https://api.imghippo.com/v1/upload';

$response = ['success' => false, 'urls' => [], 'errors' => []];

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

        // Prepare cURL request
        $cfile = new CURLFile($fileTmpName, $fileType, $fileName);
        $postData = [
            'api_key' => $apiKey,
            'file' => $cfile,
        ];

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $apiUrl);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

        $apiResponse = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

        if ($httpCode == 200) {
            $responseData = json_decode($apiResponse, true);
            if ($responseData && $responseData['success']) {
                $response['urls'][] = $responseData['data']['url'];
            } else {
                $response['errors'][] = "ImgHippo API error for " . $fileName . ": " . ($responseData['message'] ?? 'Unknown error') . ' - ' . $apiResponse;
            }
        } else {
            $response['errors'][] = "HTTP error for " . $fileName . ": " . $httpCode;
        }

        curl_close($ch);
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

echo json_encode($response);
?>