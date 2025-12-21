// js/email.js
import { db } from './firebase.js';
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { showNotification } from './notification.js';

const EMAIL_SETTINGS_DOC_ID = 'emailSettings';

export async function getAdminEmail() {
    try {
        const settingsRef = doc(db, 'appSettings', EMAIL_SETTINGS_DOC_ID);
        const settingsSnap = await getDoc(settingsRef);
        if (settingsSnap.exists()) {
            return settingsSnap.data().senderEmail;
        }
    } catch (error) {
        console.error("Error fetching admin email from settings:", error);
    }
    return null; // Return null if not found or error
}

export async function sendEmail(to, subject, body, altBody = '') {
    try {
        // Fetch email settings from Firestore
        const settingsRef = doc(db, 'appSettings', EMAIL_SETTINGS_DOC_ID);
        const settingsSnap = await getDoc(settingsRef);

        if (!settingsSnap.exists()) {
            showNotification("Email settings not configured. Please contact admin.", true);
            console.error("Email settings not found in Firestore.");
            return false;
        }

        const emailSettings = settingsSnap.data();

        const response = await fetch('/send_email.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                to: to,
                subject: subject,
                body: body,
                altBody: altBody,
                smtpHost: emailSettings.smtpHost,
                smtpPort: emailSettings.smtpPort,
                smtpEncryption: emailSettings.smtpEncryption,
                smtpUsername: emailSettings.smtpUsername,
                smtpPassword: emailSettings.smtpPassword,
                senderEmail: emailSettings.senderEmail
            })
        });

        const result = await response.json();

        if (result.success) {
            console.log("Email sent successfully to " + to);
            return true;
        } else {
            showNotification("Failed to send email: " + result.message, true);
            console.error("Failed to send email:", result.message);
            return false;
        }
    } catch (error) {
        showNotification("An error occurred while sending email: " + error.message, true);
        console.error("Error in sendEmail function:", error);
        return false;
    }
}

export async function sendTemplatedEmail(to, subject, templatePath, data) {
    try {
        const response = await fetch(templatePath);
        if (!response.ok) {
            throw new Error(`Failed to load email template from ${templatePath}`);
        }
        let htmlBody = await response.text();

        // Replace placeholders in the template
        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                const placeholder = new RegExp(`{{${key}}}`, 'g');
                htmlBody = htmlBody.replace(placeholder, data[key]);
            }
        }
        // Replace current year placeholder
        htmlBody = htmlBody.replace(/{{currentYear}}/g, new Date().getFullYear().toString());

        // Create a plain text version for altBody (simple stripping of HTML tags)
        const altBody = htmlBody.replace(/<[^>]*>?/gm, '');

        return await sendEmail(to, subject, htmlBody, altBody);
    } catch (error) {
        showNotification("Error preparing or sending templated email: " + error.message, true);
        console.error("Error in sendTemplatedEmail function:", error);
        return false;
    }
}
