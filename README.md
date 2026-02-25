# Comftay - Modern Hotel Management System

![Comftay Dark Mode Hero](/dark_mode_hero_booking_bar_1772001368178.png)

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

### 📊 Dashboard & Reporting (New!)
- **Revenue Exports**: Managers and Admins can now download high-fidelity **Excel** (.xlsx) and professional **PDF** reports for annual and monthly revenue data.
- **Visual Analytics**: The system uses `exceljs` for branded spreadsheets and `pdfkit-table` for structured, printable PDF documents.
- **Performance Optimized**: Aggregation-based reporting ensures fast generation even with high transaction volumes.

### 🎨 Design & Experience
- **Premium Aesthetics**: Glassmorphism elements, vibrant color palettes, and smooth micro-animations.
- **Full Dark Mode**: A unified design system that adapts perfectly to dark and light modes across all modules, including the Pool Facility Control Center.
- **Responsive Design**: Fully optimized for Desktop, Tablet, and Mobile devices.

### 📅 Visual Verification: Dark Mode Calendar
![Dark Mode Calendar Fix](/calendar_dark_mode_verification_1772001118316.png)

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Tailwind CSS, Redux Toolkit, Lucide React, date-fns |
| **Backend** | Node.js, Express (Express 5/path-to-regexp), TypeScript |
| **Database** | MongoDB with Mongoose ODM |
| **Auth** | JWT (JSON Web Tokens) with Bcrypt password hashing |
| **Media** | Cloudinary (Image storage & transformation) |
| **Comms** | Nodemailer (Email notifications) |
| **Reporting**| ExcelJS, PDFKit, PDFKit-Table |

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
│   │   ├── controllers/    # API Route handlers (Auth, Report, Pool, etc.)
│   │   ├── models/         # Mongoose Schemas
│   │   ├── routes/         # API Endpoint definitions
│   │   └── middleware/     # Auth, Roles & File Upload logic
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

## 🌐 Deployment (Render Blueprints)

Comftay is optimized for one-click deployment using **Render Blueprints**. The root `render.yaml` file defines a multi-service architecture:

### 1. Backend Service (Web Service)
- **Runtime**: Node.js
- **Environment**: Connection strings in `render.yaml` (link your own MongoDB Atlas cluster).
- **CORS**: Automatically configured via the `FRONTEND_URL` environment variable.

### 2. Frontend Site (Static Site)
- **Runtime**: Static
- **Internal Linking**: The frontend automatically resolves the backend API via the `VITE_API_BASE_URL` environment variable.

### Quick Start Deployment
1. Connect your GitHub repository to **Render**.
2. Select **Blueprint** when prompted.
3. Render will automatically detect `render.yaml` and provision all services.

## 📡 API Reference

### Auth
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new guest |
| `POST` | `/api/auth/login` | Authenticate user & return JWT |
| `POST` | `/api/auth/forgot-password` | Request password reset email |
| `POST` | `/api/auth/reset-password` | Set new password with reset code |

### Rooms & Facilities
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/rooms` | Fetch rooms with filters |
| `PATCH`| `/api/rooms/:id/status` | Update room status (Staff only) |
| `GET` | `/api/rooms/types` | List all room categories |
| `GET` | `/api/pool/slots` | Fetch time-based pool availability |
| `POST` | `/api/pool/reserve` | Book a private pool/spa slot |
| `PATCH`| `/api/pool/reservation/:id/cancel` | Cancel a pool slot |

### Bookings & Reservations
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/reservations` | Create a temporary 15-min hold |
| `GET` | `/api/reservations/my` | View guest's personal reservations |
| `POST` | `/api/bookings` | Finalize booking & confirm stay |
| `GET` | `/api/bookings/:id/invoice`| Generate digital receipt |
| `POST` | `/api/bookings/:id/confirm-payment` | Manually mark as paid (Staff) |

### Housekeeping & Maintenance
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/housekeeping` | List all task logs |
| `PATCH`| `/api/housekeeping/:id/status` | Update task progress |
| `PATCH`| `/api/housekeeping/:id/assign` | Delegate task to staff member |

### Reporting & Analytics (New)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/reports/revenue/excel` | Export annual revenue to Excel |
| `GET` | `/api/reports/revenue/pdf` | Export annual revenue to PDF |
| `GET` | `/api/dashboard/stats` | Operational KPIs & Chart data |

### Profile & Notifications
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/profile` | Get current user's profile |
| `POST` | `/api/profile/image` | Upload/Update profile picture |
| `GET` | `/api/notifications` | Fetch user alerts |
| `DELETE`| `/api/notifications/clear-all` | Clear all notifications |

## 📜 License
This project is licensed under the **ISC License**.

---
*Built with ❤️ by the Comftay Team.*
