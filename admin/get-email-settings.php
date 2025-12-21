<?php
header('Content-Type: application/json');

// This script should be protected and only accessible to administrators.
// Add your own authentication/authorization logic here.

$configFile = __DIR__ . '/../config.php';

if (file_exists($configFile)) {
    $config = require $configFile;

    // Never return the password, even to an admin form.
    // The form should require re-entry of the password to update it.
    unset($config['smtp_password']);

    echo json_encode(['success' => true, 'settings' => $config]);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Configuration file not found.']);
}
?>