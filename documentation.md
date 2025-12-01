# MedSense Documentation

## 1. Introduction
MedSense is a comprehensive medication adherence application designed to help patients track their medication schedules and allow caregivers to monitor their loved ones' progress. Built with modern web technologies, MedSense offers a seamless experience across devices, including offline capabilities.

## 2. Key Features

### For Patients
*   **Medication Tracking**: Easily add medications with dosage and frequency details.
*   **Smart Reminders**: Receive notifications 5 minutes before and exactly at the scheduled time.
*   **Adherence Monitoring**: Visual charts and scores to track how well you are sticking to your schedule.
*   **Offline Support**: Access your schedule and mark medications as taken even without an internet connection.
*   **Caregiver Connection**: Invite family members or caregivers to view your progress.

### For Caregivers
*   **Patient Dashboard**: View a list of all connected patients.
*   **Real-time Monitoring**: See adherence scores, recent logs, and missed dose alerts.
*   **Invitation System**: Securely connect with patients via email invitations.
*   **Mobile Optimized**: Dedicated mobile navigation for quick access to patient lists.

## 3. Technical Architecture

### Tech Stack
*   **Frontend**: React.js (Vite)
*   **Styling**: Tailwind CSS
*   **Backend / Database**: Firebase (Firestore, Authentication)
*   **PWA**: Vite PWA Plugin for offline capabilities and installability.

### Data Structure
*   **Users**: Stores user profiles and roles (Patient/Caregiver).
*   **Medications**: Sub-collection for each user storing medication details.
*   **Logs**: Records of taken doses with timestamps.
*   **Reminders**: Scheduled alerts for medications.
*   **Invitations**: Manages the connection requests between patients and caregivers.

## 4. Installation & Setup

### Prerequisites
*   Node.js (v14 or higher)
*   npm or yarn

### Steps
1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd Medsense
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Configure Firebase**:
    *   Create a project in the Firebase Console.
    *   Enable Authentication (Email/Password).
    *   Enable Firestore Database.
    *   Update `src/firebase.js` with your project configuration.

4.  **Run the development server**:
    ```bash
    npm run dev
    ```

5.  **Build for production**:
    ```bash
    npm run build
    ```

## 5. Usage Guide

### Patient Workflow
1.  **Sign Up**: Create an account as a Patient.
2.  **Add Medications**: Go to the Dashboard or Medications tab and click "Add Medication".
3.  **Set Reminders**: Reminders are automatically generated based on frequency.
4.  **Track Doses**: When a reminder appears or it's time, click "Take Now" on the dashboard.
5.  **Invite Caregiver**: Go to Settings -> Caregiver Access -> Invite Caregiver.

### Caregiver Workflow
1.  **Sign Up**: Create an account as a Caregiver.
2.  **Connect**: Wait for an invitation email or check the "Pending Invitations" section on your dashboard.
3.  **Monitor**: Click on a patient's card to view detailed logs and adherence stats.
4.  **Mobile Access**: Use the "Patients" icon in the bottom navigation bar on mobile devices to quickly view your patient list.

## 6. Offline Capabilities (PWA)
MedSense is a Progressive Web App (PWA). This means:
*   **Installable**: You can install it on your phone or desktop like a native app.
*   **Offline Access**: The app caches essential data and uses Firestore's offline persistence. You can view your schedule and mark doses as taken while offline. The data will sync with the cloud once you reconnect.

## 7. Troubleshooting

*   **Reminders not showing?** Ensure you have allowed notifications in your browser settings.
*   **Data not syncing?** Check your internet connection. Changes made offline will sync automatically when online.
*   **Invite not received?** Check the spam folder or ensure the email address was entered correctly.

---
*Generated for MedSense Project - 2025*
