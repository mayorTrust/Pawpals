# GitHub Actions CI/CD Setup

This document provides instructions for setting up the necessary credentials for the CI/CD pipeline to deploy the project to an FTP server.

## How to Add FTP Credentials as GitHub Secrets

The `.github/workflows/main.yml` file uses GitHub secrets to securely access your FTP server credentials. You need to add the following secrets to your GitHub repository settings:

- `FTP_SERVER`: The hostname or IP address of your FTP server (e.g., `ftp.example.com`).
- `FTP_USERNAME`: The username for your FTP account.
- `FTP_PASSWORD`: The password for your FTP account.

### Steps to Add Secrets:

1.  **Go to your repository on GitHub.**
2.  **Click on the "Settings" tab.**
3.  **In the left sidebar, click on "Secrets and variables" and then "Actions".**
4.  **Click the "New repository secret" button.**
5.  **For `FTP_SERVER`:**
    *   In the "Name" field, enter `FTP_SERVER`.
    *   In the "Value" field, enter your FTP server address.
    *   Click "Add secret".
6.  **For `FTP_USERNAME`:**
    *   Click "New repository secret" again.
    *   In the "Name" field, enter `FTP_USERNAME`.
    *   In the "Value" field, enter your FTP username.
    *   Click "Add secret".
7.  **For `FTP_PASSWORD`:**
    *   Click "New repository secret" again.
    *   In the "Name" field, enter `FTP_PASSWORD`.
    *   In the "Value" field, enter your FTP password.
    *   Click "Add secret".

Once you have added these secrets, the CI/CD pipeline will be able to connect to your FTP server and deploy the project whenever you push changes to the `main` branch.
