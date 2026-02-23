# Hotel Management System

A full-stack web application for managing hotel operations, built with React, TypeScript, Node.js, Express, and MongoDB.

## Overview

This system provides comprehensive hotel management capabilities including:

- **User Management**: Authentication and role-based access control
- **Room Management**: Room types, individual rooms, and availability tracking
- **Reservations & Bookings**: Online booking system with payment processing
- **Housekeeping**: Task assignment and tracking
- **Dashboard Analytics**: Revenue charts, room status, and operational insights
- **Pool Management**: Pool maintenance scheduling
- **Notifications**: In-app notifications for users and staff

## Architecture

### Frontend (Client)

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with Radix UI components
- **State Management**: Redux Toolkit
- **Routing**: React Router DOM
- **Charts**: Recharts for data visualization
- **PDF Generation**: jsPDF and html2canvas for invoices

### Backend (Server)

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens with bcrypt password hashing
- **File Upload**: Cloudinary integration for image storage
- **Email**: Nodemailer for notifications

## User Roles

1. **Admin**: Full system access, user management, system configuration
2. **Manager**: Operational oversight, reports, staff management
3. **Receptionist**: Front desk operations, bookings, check-ins/check-outs
4. **Housekeeping**: Room cleaning assignments and status updates
5. **Guest**: Online booking, reservation management, profile settings

## Features

### Core Functionality

- User registration and authentication
- Role-based dashboard access
- Room browsing and booking
- Reservation management
- Payment processing simulation
- Invoice generation and download
- Real-time notifications

### Management Modules

- User Management (Admin)
- Room Type & Room Management
- Amenity Management
- Booking & Reservation Oversight
- Housekeeping Task Assignment
- Pool Maintenance Scheduling
- Dashboard Analytics & Reporting

### Guest Features

- Room search and filtering
- Date range selection
- Booking confirmation
- Reservation history
- Profile management
- Password reset functionality

## Project Structure

```
HotelManagementSystem/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service functions
│   │   ├── store/          # Redux store and slices
│   │   ├── types/          # TypeScript type definitions
│   │   └── utils/          # Utility functions
│   └── public/             # Static assets
├── server/                 # Node.js backend
│   ├── src/
│   │   ├── controllers/    # Route handlers
│   │   ├── models/         # MongoDB schemas
│   │   ├── routes/         # API route definitions
│   │   ├── middleware/     # Express middleware
│   │   ├── config/         # Configuration files
│   │   └── utils/          # Server utilities
│   └── uploads/            # File upload directory
└── package.json            # Root package scripts
```

## Installation & Setup

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

### Environment Variables

Create `.env` files in both `client/` and `server/` directories.

#### Server (.env)

```
MONGODB_URI=mongodb://127.0.0.1:27017/hotel_management
JWT_SECRET=your_jwt_secret_key
PORT=5000
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
```

#### Client (.env)

```
VITE_API_URL=http://localhost:4000/api
```

### Installation Steps

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd HotelManagementSystem
   ```

2. **Install server dependencies**

   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies**

   ```bash
   cd ../client
   npm install
   ```

4. **Start MongoDB**
   Ensure MongoDB is running on your system.

5. **Seed initial data** (optional)

   ```bash
   cd ../server
   npm run seed
   ```

6. **Start the application**

   ```bash
   cd ..
   npm start
   ```

   This will start both client (http://localhost:3000) and server (http://localhost:4000) concurrently.

## API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset confirmation

### Rooms

- `GET /api/rooms` - Get all rooms with filters
- `GET /api/rooms/:id` - Get room details
- `POST /api/rooms` - Create room (Admin/Manager)
- `PUT /api/rooms/:id` - Update room (Admin/Manager)
- `DELETE /api/rooms/:id` - Delete room (Admin/Manager)

### Bookings & Reservations

- `POST /api/bookings` - Create booking
- `GET /api/bookings/user` - Get user bookings
- `GET /api/reservations` - Get all reservations (Staff)
- `PUT /api/reservations/:id/status` - Update reservation status

### Dashboard

- `GET /api/dashboard/stats` - Dashboard statistics
- `GET /api/dashboard/revenue` - Revenue data
- `GET /api/dashboard/room-status` - Room status overview

## Development

### Available Scripts

#### Client

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

#### Server

- `npm run dev` - Start development server with nodemon
- `npm run build` - Compile TypeScript
- `npm start` - Start production server

### Code Quality

- ESLint for JavaScript/TypeScript linting
- TypeScript for type checking
- Prettier for code formatting (recommended)

## Deployment

### Production Build

1. Build the client:

   ```bash
   cd client
   npm run build
   ```

2. The `dist` folder will contain the production-ready client files.

3. For the server, ensure environment variables are set for production.

### Recommended Deployment

- **Frontend**: Vercel, Netlify, or any static hosting
- **Backend**: Heroku, Railway, or VPS with PM2
- **Database**: MongoDB Atlas for cloud database

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

For support or questions, please open an issue in the repository.
