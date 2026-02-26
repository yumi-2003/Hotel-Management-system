import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Header from "./components/Layouts/Header";
import Footer from "./components/Layouts/Footer";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import RoomsList from "./pages/Rooms/RoomsList";
import RoomDetail from "./pages/Rooms/RoomDetail";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleBasedRoute from "./components/RoleBasedRoute";
import { UserRole } from "./utils/roleUtils";

// Role-specific dashboards
import AdminDashboard from "./pages/AdminDashboard";
import ManagerDashboard from "./pages/ManagerDashboard";
import ReceptionistDashboard from "./pages/ReceptionistDashboard";
import HousekeepingDashboard from "./pages/HousekeepingDashboard";
import HousekeepingAssignment from "./pages/HousekeepingAssignment";
import MyReservations from "./pages/MyReservations";
import ProfileSettings from "./pages/ProfileSettings";
import UserManagement from "./pages/Management/UserManagement";
import RoomTypeManagement from "./pages/Management/RoomTypeManagement";
import RoomTypeForm from "./pages/Management/RoomTypeForm";
import AmenityManagement from "./pages/Management/AmenityManagement";
import About from "./pages/About";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import Policies from "./pages/Policies";
import Terms from "./pages/Terms";
import Offers from "./pages/Offers";
import Amenities from "./pages/Amenities";
import PoolManagement from "./pages/Management/PoolManagement";
import BookingManagement from "./pages/Management/BookingManagement";
import ReservationManagement from "./pages/Management/ReservationManagement";
import RoomManagement from "./pages/Management/RoomManagement";
import HousekeepingManagement from "./pages/Management/HousekeepingManagement";

import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import BookingPage from "./pages/BookingPage";
import BookingConfirmation from "./pages/BookingConfirmation";
import PoolReservation from "./pages/PoolReservation";
import NotFound from "./pages/NotFound";
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <div className="flex flex-col min-h-screen">
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/rooms" element={<RoomsList />} />
          <Route path="/rooms/:id" element={<RoomDetail />} />


          
          {/* Protected routes - require authentication */}
          <Route
            path="/book"
            element={
              <ProtectedRoute>
                <BookingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-reservations"
            element={
              <ProtectedRoute>
                <MyReservations />
              </ProtectedRoute>
            }
          />
          <Route
            path="/booking/confirmation"
            element={
              <ProtectedRoute>
                <BookingConfirmation />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfileSettings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pool/reserve"
            element={
              <ProtectedRoute>
                <PoolReservation />
              </ProtectedRoute>
            }
          />
          
          {/* Admin routes */}
          <Route
            path="/admin/dashboard"
            element={
              <RoleBasedRoute allowedRoles={[UserRole.ADMIN]}>
                <AdminDashboard />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <RoleBasedRoute allowedRoles={[UserRole.ADMIN, UserRole.MANAGER]}>
                <UserManagement />
              </RoleBasedRoute>
            }
          />
          
          {/* Room & Amenity Management (Admin/Manager) */}
          <Route
            path="/admin/rooms"
            element={
              <RoleBasedRoute allowedRoles={[UserRole.ADMIN, UserRole.MANAGER]}>
                <RoomTypeManagement />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/admin/rooms/new"
            element={
              <RoleBasedRoute allowedRoles={[UserRole.ADMIN, UserRole.MANAGER]}>
                <RoomTypeForm />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/admin/rooms/edit/:id"
            element={
              <RoleBasedRoute allowedRoles={[UserRole.ADMIN, UserRole.MANAGER]}>
                <RoomTypeForm />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/admin/amenities"
            element={
              <RoleBasedRoute allowedRoles={[UserRole.ADMIN, UserRole.MANAGER]}>
                <AmenityManagement />
              </RoleBasedRoute>
            }
          />
          
          {/* Manager routes */}
          <Route
            path="/manager/dashboard"
            element={
              <RoleBasedRoute allowedRoles={[UserRole.ADMIN, UserRole.MANAGER]}>
                <ManagerDashboard />
              </RoleBasedRoute>
            }
          />
          
          {/* Receptionist routes */}
          <Route
            path="/receptionist/dashboard"
            element={
              <RoleBasedRoute allowedRoles={[UserRole.ADMIN, UserRole.MANAGER, UserRole.RECEPTIONIST]}>
                <ReceptionistDashboard />
              </RoleBasedRoute>
            }
          />
          
          <Route
            path="/housekeeping/dashboard"
            element={
              <RoleBasedRoute allowedRoles={[UserRole.ADMIN, UserRole.MANAGER, UserRole.HOUSEKEEPING]}>
                <HousekeepingDashboard />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/manager/housekeeping/assignment"
            element={
              <RoleBasedRoute allowedRoles={[UserRole.ADMIN, UserRole.MANAGER]}>
                <HousekeepingAssignment />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/staff/pool"
            element={
              <RoleBasedRoute allowedRoles={[UserRole.ADMIN, UserRole.MANAGER, UserRole.RECEPTIONIST]}>
                <PoolManagement />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/staff/bookings"
            element={
              <RoleBasedRoute allowedRoles={[UserRole.ADMIN, UserRole.MANAGER, UserRole.RECEPTIONIST]}>
                <BookingManagement />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/staff/reservations"
            element={
              <RoleBasedRoute allowedRoles={[UserRole.ADMIN, UserRole.MANAGER, UserRole.RECEPTIONIST]}>
                <ReservationManagement />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/staff/rooms"
            element={
              <RoleBasedRoute allowedRoles={[UserRole.ADMIN, UserRole.MANAGER, UserRole.RECEPTIONIST]}>
                <RoomManagement />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/staff/housekeeping"
            element={
              <RoleBasedRoute allowedRoles={[UserRole.ADMIN, UserRole.MANAGER, UserRole.HOUSEKEEPING]}>
                <HousekeepingManagement />
              </RoleBasedRoute>
            }
          />

          {/* Static Content Routes */}
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/policies" element={<Policies />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/offers" element={<Offers />} />
          <Route path="/amenities" element={<Amenities />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
