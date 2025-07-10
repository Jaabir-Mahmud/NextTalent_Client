# Admin Dashboard Components

This folder contains the modular components for the admin dashboard functionality.

## Structure

- **AdminDashboard.jsx** - Main dashboard component with navigation and routing
- **DashboardOverview.jsx** - Dashboard overview with stats cards and charts
- **UserManagement.jsx** - User management with DataGrid and user actions
- **JobModeration.jsx** - Job moderation with approval/rejection functionality
- **Reports.jsx** - Reports page for downloading CSV data
- **Feedback.jsx** - Feedback management with reply functionality
- **Settings.jsx** - Admin settings and preferences
- **index.js** - Export file for clean imports

## Features

### Dashboard Overview
- Real-time statistics cards
- User signup trends chart
- Job posting trends chart
- Top job categories pie chart
- Responsive design for mobile and desktop

### User Management
- DataGrid with user information
- View user details modal
- Remove user functionality
- Responsive columns for mobile

### Job Moderation
- Job approval/rejection workflow
- Detailed job information modal
- Notification system for employers
- Message system for feedback
- Responsive design

### Reports
- CSV download functionality
- User data export
- Job data export
- Feedback data export

### Feedback Management
- View user feedback
- Reply to feedback
- Threaded conversation view
- Real-time updates

### Settings
- Admin display name
- Email notification preferences
- Theme preferences
- Persistent settings storage

## Usage

```jsx
import { AdminDashboard } from './pages/Admin';

// In your app
<AdminDashboard isDark={isDark} toggleDark={toggleDark} />
```

## Dependencies

- Material-UI (MUI) for UI components
- Firebase Firestore for data management
- Chart.js for data visualization
- SweetAlert2 for modals and notifications
- date-fns for date manipulation 