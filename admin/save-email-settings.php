<?php
header('Content-Type: application/json');

// This script should be protected and only accessible to administrators.
// Add your own authentication/authorization logic here.

$response = ['success' => false, 'message' => 'An error occurred.'];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $configFile = __DIR__ . '/../config.php';

    // Ensure the config file exists and is writable
    if (!file_exists($configFile) || !is_writable($configFile)) {
        http_response_code(500);
        $response['message'] = 'Configuration file is missing or not writable.';
        echo json_encode($response);
        exit;
    }

    // Get the existing configuration
    $config = require $configFile;

    // Update the configuration with the new values from the POST request
    $config['smtp_host'] = $_POST['smtp_host'] ?? $config['smtp_host'];
    $config['smtp_username'] = $_POST['smtp_username'] ?? $config['smtp_username'];
    // Only update the password if a new one is provided
    if (!empty($_POST['smtp_password'])) {
        $config['smtp_password'] = $_POST['smtp_password'];
    }
    $config['smtp_port'] = (int)($_POST['smtp_port'] ?? $config['smtp_port']);
    $config['smtp_secure'] = $_POST['smtp_secure'] ?? $config['smtp_secure'];
    $config['from_email'] = $_POST['from_email'] ?? $config['from_email'];
    $config['from_name'] = 'Pawpals Team'; // Or make this configurable as well

    // Prepare the content to be written to the config file
    $newConfigContent = "<?php\n// Securely store your email configuration here\nreturn " . var_export($config, true) . ";\n?>";

    // Write the updated configuration back to the file
    if (file_put_contents($configFile, $newConfigContent) !== false) {
        $response['success'] = true;
        $response['message'] = 'Email settings saved successfully!';
    } else {
        http_response_code(500);
        $response['message'] = 'Failed to write to the configuration file.';
    }
} else {
    http_response_code(405);
    $response['message'] = 'Invalid request method.';
}

echo json_encode($response);
?>