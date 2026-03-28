# Comprehensive Testing Documentation

This document provides detailed testing tables for the entire Hotel Management System, categorized by module and testing type.

## 1. Authentication & Security
| Test ID | Module | Scenario | Expected Result | Type |
| :--- | :--- | :--- | :--- | :--- |
| **SEC-01** | Login | Valid credentials | Redirect to appropriate dashboard based on role. | Security |
| **SEC-02** | Login | Invalid credentials | Show "Invalid email or password" error. | Functional |
| **SEC-03** | Auth | Unauthorized Page | Guest attempting to access `/admin/dashboard` is redirected to `/login`. | Security |
| **SEC-04** | Register | Duplicate Email | Show "User already exists" error. | Functional |
| **SEC-05** | Password | Forgot Password | Reset link sent to valid email; error shown for non-existent email. | Functional |
| **SEC-06** | Profile | Password Update | User can change password; old password becomes invalid. | Security |

## 2. Room & Booking Flow
| Test ID | Module | Scenario | Expected Result | Type |
| :--- | :--- | :--- | :--- | :--- |
| **BOK-01** | Search | Filter by Date/Guest | Only rooms available for the selected range are displayed. | Functional |
| **BOK-02** | Booking | Reservation Process | User can select a room, enter details, and receive a confirmation. | Integration |
| **BOK-03** | My Res. | View History | Guest sees all their past and upcoming reservations correctly. | Functional |
| **BOK-04** | Rooms | Amenities Display | All listed amenities for a room (WiFi, AC, etc.) are visible. | UI/UX |
| **BOK-05** | Conf. | PDF Generation | User can download a booking confirmation as a PDF. | Integration |

## 3. Staff & Management
| Test ID | Module | Scenario | Expected Result | Type |
| :--- | :--- | :--- | :--- | :--- |
| **STA-01** | Admin Dash | User Management | Admin can create, delete, and list all staff members. | Functional |
| **STA-02** | Manager | Revenue Reports | Manager can view total revenue and occupancy charts. | UI/UX |
| **STA-03** | Housekeeping | Status Toggle | Staff can mark a room as "Cleaning" or "Clean" instantly. | Integration |
| **STA-04** | Receptionist | Check-in/out | Receptionist can process guests arrivals and departures. | Functional |
| **STA-05** | Dashboard | Sync across Roles | Receptionist check-out instantly alerts Housekeeping. | Integration |

## 4. Services & Notifications
| Test ID | Module | Scenario | Expected Result | Type |
| :--- | :--- | :--- | :--- | :--- |
| **SRV-01** | Pool | Reservation | User can book a time slot for the swimming pool. | Functional |
| **SRV-02** | Notif. | System Alerts | Real-time notifications appear for task assignments/status changes. | Integration |
| **SRV-03** | Offers | Discount Codes | Applying a valid discount code correctly updates the total price. | Functional |

## 5. UI/UX & Responsiveness
| Test ID | Module | Scenario | Expected Result | Type |
| :--- | :--- | :--- | :--- | :--- |
| **UI-01** | Global | Mobile Menu | Hamburger menu works on mobile view for all roles. | Responsiveness |
| **UI-02** | Dashboard | Data Charts | Charts (Recharts) scale correctly on smaller screens. | UI/UX |
| **UI-03** | Forms | Validation | Empty required fields trigger visual "required" indicators. | UI/UX |
| **UI-04** | Pages | 404 Error | Accessing a non-existent route shows a custom "NotFound" page. | Functional |

## 6. Edge Cases & Performance
| Test ID | Module | Scenario | Expected Result | Type |
| :--- | :--- | :--- | :--- | :--- |
| **EDG-01** | Reservation | Double Booking | System prevents booking the same room for overlapping dates. | Logic |
| **EDG-02** | Uploads | Large Files | Profile picture uploads are capped at 5MB and resized. | Integration |
| **EDG-03** | Network | Offline Mode | App shows a "Poor Connection" warning when API is unreachable. | UI/UX |
| **EDG-04** | Session | Token Expiry | Expired JWT token results in a smooth logout and redirect. | Security |

---
> [!IMPORTANT]
> This suite should be executed before every major release to ensure zero regressions across the platform.
