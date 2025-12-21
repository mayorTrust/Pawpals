<?php
header('Content-Type: application/json');

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'vendor/autoload.php'; // Adjust path as necessary

$response = ['success' => false, 'message' => 'An unknown error occurred.'];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $to = $_POST['to'] ?? '';
    $subject = $_POST['subject'] ?? '';
    $body = $_POST['body'] ?? '';
    $altBody = $_POST['altBody'] ?? strip_tags($body); // Plain-text body for non-HTML mail clients

    if (empty($to) || empty($subject) || empty($body)) {
        $response['message'] = 'Missing required email parameters (to, subject, body).';
        echo json_encode($response);
        exit;
    }

    $mail = new PHPMailer(true); // Passing `true` enables exceptions

    try {
        // Server settings
        // These settings are now passed in the POST request (from client-side)
        $smtpHost = $_POST['smtpHost'] ?? '';
        $smtpPort = $_POST['smtpPort'] ?? 587;
        $smtpEncryption = $_POST['smtpEncryption'] ?? 'tls';
        $smtpUsername = $_POST['smtpUsername'] ?? '';
        $smtpPassword = $_POST['smtpPassword'] ?? '';
        $senderEmail = $_POST['senderEmail'] ?? '';

        if (empty($smtpHost) || empty($smtpUsername) || empty($smtpPassword) || empty($senderEmail)) {
            throw new Exception('SMTP settings are incomplete. Please configure them in the admin panel.');
        }

        $mail->isSMTP();
        $mail->Host       = $smtpHost;
        $mail->SMTPAuth   = true;
        $mail->Username   = $smtpUsername;
        $mail->Password   = $smtpPassword;
        $mail->SMTPSecure = $smtpEncryption === 'none' ? PHPMailer::ENCRYPTION_STARTTLS : $smtpEncryption;
        $mail->Port       = $smtpPort;

        // Recipients
        $mail->setFrom($senderEmail, 'PawPals');
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
        $response['message'] = "Email could not be sent. Mailer Error: {$mail->ErrorInfo}";
    }
} else {
    $response['message'] = 'Invalid request method.';
}

echo json_encode($response);
?>