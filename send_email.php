<?php
header('Content-Type: application/json');

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'vendor/autoload.php';

// Load email configuration securely from the server
$config = require 'config.php';

$response = ['success' => false, 'message' => 'An unknown error occurred.'];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Sanitize and retrieve POST data
    $to = filter_var($_POST['to'] ?? '', FILTER_SANITIZE_EMAIL);
    $subject = htmlspecialchars($_POST['subject'] ?? '');
    $body = $_POST['body'] ?? ''; // Assuming body is HTML, sanitize as needed before use
    $altBody = strip_tags($body);

    if (empty($to) || empty($subject) || empty($body)) {
        http_response_code(400);
        $response['message'] = 'Missing required email parameters (to, subject, body).';
        echo json_encode($response);
        exit;
    }
    
    if (!filter_var($to, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        $response['message'] = 'Invalid "to" email address.';
        echo json_encode($response);
        exit;
    }

    $mail = new PHPMailer(true); // Enable exceptions

    try {
        // Check if server settings are complete in config.php
        if (empty($config['smtp_host']) || empty($config['smtp_username']) || empty($config['smtp_password']) || empty($config['from_email'])) {
            throw new Exception('SMTP settings are incomplete. Please configure them in the admin panel.');
        }

        // Server settings from config.php
        $mail->isSMTP();
        $mail->Host       = $config['smtp_host'];
        $mail->SMTPAuth   = true;
        $mail->Username   = $config['smtp_username'];
        $mail->Password   = $config['smtp_password'];
        $mail->SMTPSecure = $config['smtp_secure'];
        $mail->Port       = $config['smtp_port'];

        // Recipients
        $mail->setFrom($config['from_email'], $config['from_name'] ?? 'PawPals');
        $mail->addAddress($to);

        // Content
        $mail->isHTML(true);
        $mail->Subject = $subject;
        $mail->Body    = $body;
        $mail->AltBody = $altBody;

        $mail->send();
        $response['success'] = true;
        $response['message'] = 'Email sent successfully!';
    } catch (Exception $e) {
        http_response_code(500);
        $response['message'] = "Email could not be sent. Mailer Error: {$mail->ErrorInfo}";
    }
} else {
    http_response_code(405); // Method Not Allowed
    $response['message'] = 'Invalid request method.';
}

echo json_encode($response);
?>