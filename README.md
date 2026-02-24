# Comftay - Modern Hotel Management System

Comftay is a premium, full-stack hotel management solution designed to streamline operations, enhance guest experiences, and provide detailed operational insights. Built with a modern tech stack (React, TypeScript, Node.js, MongoDB), it features a high-end UI with full dark mode support and a robust role-based access system.

## 🌟 Key Features

### 🏨 Core Management
- **Intelligent Booking Engine**: A responsive, real-time booking bar with precise availability feedback and automated reservation expiry (15-minute hold).
- **Infinity Pool & Spa Reservation**: A time-based booking system with 1-hour slots, atomic availability management, and automated capacity control.
- **Dynamic Room Management**: Support for customized Room Types, individual Room status tracking (Occupied, Cleaning, Out of Service), and Amenity management.
- **Housekeeping Automation**: Automated task assignment upon guest check-out, real-time status updates for pool cleaning, and maintenance logging.

### 👤 User Roles & Dashboards
- **Admin**: Full system control, user management, and core configuration.
- **Manager**: Operational analytics, staff performance, and revenue reporting.
- **Receptionist**: Efficient front-desk operations including Check-in/Check-out flows and reservation oversight.
- **Housekeeping**: Mobile-optimized task list for cleaning assignments and room status reporting.
- **Guest**: Seamless booking experience, profile management, and reservation history tracking.

### 🔔 Advanced Notification System
- **Real-time Alerts**: Staff receives instant notifications for new task assignments (e.g., room cleaning).
- **Management Features**: Optimistic "Clear All" functionality (instant list clearing) and "Mark all as read" for efficient inbox management.
- **Clean UI**: Visual loading states and automated "All Caught Up" empty state views.

### 🎨 Design & Experience
- **Premium Aesthetics**: Glassmorphism elements, vibrant color palettes, and smooth micro-animations.
- **Full Dark Mode**: A unified design system that adapts perfectly to dark and light modes across all modules, including the Pool Facility Control Center.
- **Responsive Design**: Fully optimized for Desktop, Tablet, and Mobile devices.

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Tailwind CSS, Redux Toolkit, Lucide React, date-fns |
| **Backend** | Node.js, Express (Express 5/path-to-regexp), TypeScript |
| **Database** | MongoDB with Mongoose ODM |
| **Auth** | JWT (JSON Web Tokens) with Bcrypt password hashing |
| **Media** | Cloudinary (Image storage & transformation) |
| **Comms** | Nodemailer (Email notifications) |

## 📂 Project Structure

```
HotelManagementSystem/
├── client/                 # React frontend (Vite)
│   ├── src/
│   │   ├── components/     # Reusable UI & Layout components
│   │   ├── pages/          # Feature-specific pages (Admin, Booking, etc.)
│   │   ├── store/          # Redux State Management (Slices)
│   │   ├── services/       # API integration layers
│   │   └── types/          # Shared TypeScript interfaces
├── server/                 # Node.js backend (Express)
│   ├── src/
│   │   ├── controllers/    # API Route handlers
│   │   ├── models/         # Mongoose Schemas (User, Room, Booking, etc.)
│   │   ├── routes/         # API Endpoint definitions
│   │   └── middleware/     # Auth & validation logic
```

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18+ 
- **MongoDB**: Local instance or Atlas Cloud URI
- **Cloudinary Account**: For room/profile image uploads

### Installation

1. **Clone & Navigate**
   ```bash
   git clone <repository-url>
   cd HotelManagementSystem
   ```

2. **Backend Setup**
   ```bash
   cd server
   npm install
   # Create .env based on the variables below
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd ../client
   npm install
   # Create .env based on the variables below
   npm run dev
   ```

### Environment Variables

**Server (`server/.env`)**
```env
PORT=4000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_secret
CLOUDINARY_CLOUD_NAME=name
CLOUDINARY_API_KEY=key
CLOUDINARY_API_SECRET=secret
EMAIL_USER=your_email
EMAIL_PASS=your_email_app_password
```

**Client (`client/.env`)**
```env
VITE_API_BASE_URL=http://localhost:4000/api
```

## 📡 API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Authenticate user & return JWT |
| `GET` | `/api/rooms` | Fetch all available rooms with filters |
| `POST` | `/api/reservations` | Create a new room reservation |
| `GET` | `/api/pool/slots` | Fetch time-based pool availability |
| `POST` | `/api/pool/reserve`| Book a private pool/spa slot |
| `DELETE`| `/api/notifications/clear-all` | Permanently clear user notifications |
| `GET` | `/api/dashboard/stats` | Operational statistics for staff/admin |

## 📜 License
This project is licensed under the **ISC License**.

---
*Built with ❤️ by the Comftay Team.*
