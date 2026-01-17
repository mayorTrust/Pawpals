# PawPals: Your Ultimate Pet Adoption Platform

## 🐾 Project Overview

PawPals is a comprehensive web application designed to connect loving homes with adorable pets. It features a user-friendly interface for browsing pet listings, managing user profiles, processing orders, and an admin panel for seamless management. This platform leverages modern web technologies to provide a smooth and engaging experience for both pet adopters and administrators.

## ✨ Features

-   **Pet Listings:** Browse detailed profiles of available pets, complete with images, descriptions, and health information.
-   **User Authentication:** Secure user registration and login powered by Firebase.
-   **User Profiles:** Users can manage their personal information and view their order history.
-   **Order Management:** A streamlined process for purchasing pets, including order confirmation and tracking delivery progress.
-   **Payment Processing:** Supports multiple payment methods including Card, Cash App, and Cryptocurrency, with options to save preferred methods.
-   **Admin Panel:** Dedicated section for administrators to manage listings, orders, users, and email settings.
-   **Email Notifications:** Automated email notifications for various events (e.g., order processing, payment confirmation, admin alerts) via PHPMailer.
-   **Responsive Design:** Built with Tailwind CSS for a beautiful and consistent experience across all devices.

## 🚀 Technologies Used

-   **Frontend:**
    -   HTML5
    -   CSS3 (Tailwind CSS for utility-first styling)
    -   JavaScript (ES6+)
-   **Backend/Services:**
    -   **Firebase:** Authentication, Firestore (NoSQL Database) for storing listings, users, orders, and payment details.
    -   **PHP:** For server-side operations, primarily email sending using PHPMailer, and image uploads.
    -   **Composer:** PHP dependency manager.
    -   **npm:** Node.js package manager for frontend dependencies (Tailwind CSS).

## 🛠️ Setup and Installation

Follow these steps to get your PawPals project up and running locally.

### Prerequisites

-   **Node.js & npm:** Make sure you have Node.js and npm installed (e.g., via `nvm` or direct installer).
-   **PHP:** PHP 7.4+ is required.
-   **Composer:** Install Composer globally.
-   **Firebase Project:** A Google Firebase project is essential for authentication and database services.

### Step 1: Clone the Repository

```bash
git clone <your-repository-url>
cd Pawpals
```

### Step 2: Install Frontend Dependencies

Install Tailwind CSS and other Node.js dependencies:

```bash
npm install
```

### Step 3: Build Tailwind CSS

Compile your CSS. The `--watch` flag is useful during development to automatically recompile on changes.

```bash
npm run build-css # For a one-time build
# OR
npm run watch-css # For continuous compilation during development
```

### Step 4: Install Backend Dependencies

Install PHP dependencies using Composer:

```bash
composer install
```

### Step 5: Set up Firebase

1.  **Create a Firebase Project:** Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
2.  **Add a Web App:** In your Firebase project, add a new web application.
3.  **Get Firebase Configuration:** Copy the Firebase configuration object provided (it will look like `const firebaseConfig = { ... };`).
4.  **Update `js/firebase-config.js`:** Create or open `js/firebase-config.js` and paste your configuration there.

    ```javascript
    // js/firebase-config.js
    const firebaseConfig = {
      apiKey: "YOUR_API_KEY",
      authDomain: "YOUR_AUTH_DOMAIN",
      projectId: "YOUR_PROJECT_ID",
      storageBucket: "YOUR_STORAGE_BUCKET",
      messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
      appId: "YOUR_APP_ID"
    };

    export { firebaseConfig };
    ```
5.  **Enable Services:**
    -   **Authentication:** Go to "Authentication" in the Firebase Console and enable "Email/Password" provider.
    -   **Firestore Database:** Go to "Firestore Database" and create a new database (start in production mode, then adjust security rules).
6.  **Configure Firestore Security Rules:** Set up rules to allow read/write access for authenticated users to `users`, `listings`, and `orders` collections. For local development, you might start with more permissive rules and tighten them for production.

    Example (very permissive, for development only):
    ```firestore
    rules_version = '2';
    service cloud.firestore {
      match /databases/{database}/documents {
        match /{document=**} {
          allow read, write: if request.auth != null; // Authenticated users can read/write all
        }
      }
    }
    ```

### Step 6: Configure Email Sending

Open `config.php` and fill in your SMTP server details. This is used by PHPMailer for sending various email notifications.

```php
// config.php
<?php
// SMTP configuration for PHPMailer
$smtp_host = 'YOUR_SMTP_HOST'; // e.g., 'smtp.gmail.com'
$smtp_username = 'YOUR_SMTP_USERNAME'; // e.g., 'your_email@gmail.com'
$smtp_password = 'YOUR_SMTP_PASSWORD'; // Your email password or app-specific password
$smtp_port = 587; // or 465 for SSL
$smtp_secure = 'tls'; // 'tls' or 'ssl'

// From email address for notifications
$from_email = 'no-reply@yourdomain.com';
$from_name = 'PawPals Support';

// Admin email for notifications
$admin_email = 'admin@yourdomain.com';

// DO NOT EDIT BELOW THIS LINE
?>
```

### Step 7: Run the Application

You can use PHP's built-in development server to serve the application:

```bash
php -S localhost:8000
```

Now, open your web browser and go to `http://localhost:8000`.

## ☁️ Deployment

These instructions guide you through deploying the PawPals application using [fly.io](https://fly.io), a modern platform for running full-stack applications.

### Prerequisites

-   A `fly.io` account.
-   The `flyctl` command-line tool installed. You can find installation instructions [here](https://fly.io/docs/hands-on/install-flyctl/).

### Step 1: Login to Fly

```bash
fly auth login
```

### Step 2: Launch the App

This command will automatically detect the `Dockerfile` and suggest settings.

```bash
fly launch
```

When prompted:
-   Choose an app name (or let Fly generate one).
-   Select a region.
-   You may be asked to configure a database, but since this project uses Firebase Firestore, you can skip this step.

This creates a `fly.toml` file, which configures your deployment.

### Step 3: Set Secrets

Your application needs sensitive information (API keys, passwords) that shouldn't be hardcoded. In Fly, these are managed as "secrets."

**1. Firebase Secrets:**
Get your Firebase configuration object from `js/firebase-config.js` and set each key as a secret.

```bash
fly secrets set \
  FIREBASE_API_KEY="YOUR_API_KEY" \
  FIREBASE_AUTH_DOMAIN="YOUR_AUTH_DOMAIN" \
  FIREBASE_PROJECT_ID="YOUR_PROJECT_ID" \
  FIREBASE_STORAGE_BUCKET="YOUR_STORAGE_BUCKET" \
  FIREBASE_MESSAGING_SENDER_ID="YOUR_MESSAGING_SENDER_ID" \
  FIREBASE_APP_ID="YOUR_APP_ID"
```

**2. SMTP Secrets:**
Set the secrets for your SMTP server, which are used by PHPMailer.

```bash
fly secrets set \
  SMTP_HOST="YOUR_SMTP_HOST" \
  SMTP_USERNAME="YOUR_SMTP_USERNAME" \
  SMTP_PASSWORD="YOUR_SMTP_PASSWORD" \
  SMTP_PORT="587" \
  SMTP_SECURE="tls" \
  FROM_EMAIL="no-reply@yourdomain.com" \
  FROM_NAME="PawPals Support" \
  ADMIN_EMAIL="admin@yourdomain.com"
```

**Note:** You'll need to update your application code to read these secrets from environment variables instead of a `config.php` or `js/firebase-config.js` file. This is a best practice for security and portability.

### Step 4: Deploy the Application

After setting your secrets, deploy your application:

```bash
fly deploy
```

This command will build the Docker image, push it to Fly's registry, and deploy it.

### Step 5: Monitor Your Deployment

You can monitor the status of your deployment with:

```bash
fly status
```

To view real-time logs:

```bash
fly logs
```

Your application should now be live! You can open it in your browser with:

```bash
fly open
```

## 🤝 Contributing

We welcome contributions! If you have suggestions or want to improve PawPals, please feel free to:

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/your-feature-name`).
3.  Make your changes.
4.  Commit your changes (`git commit -m 'Feat: Add some amazing feature'`).
5.  Push to the branch (`git push origin feature/your-feature-name`).
6.  Open a Pull Request.

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
