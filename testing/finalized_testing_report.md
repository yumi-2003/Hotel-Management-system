# Project Testing Report - Finalized

This document contains all testing tables and results for the Hotel Management System, covering automated unit tests, functional workflows, and security/access control.

## 1. Automated Jest Unit Tests
| Test Case Name | Module | Scenario | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Auth: Valid Token** | Server | Verify JWT signature | Allow API access | **Authorized** | **PASS** |
| **Auth: No Token** | Server | Request without header | Block access (401) | **Blocked** | **PASS** |
| **Role: Admin Check** | Server | Access /api/users | Allow Admin only | **Allowed** | **PASS** |
| **Role: Staff Check** | Server | Access /api/rooms | Allow Staff roles | **Allowed** | **PASS** |
| **UI: Guest Redirect** | Client | Access protected page | Redirect to Login | **Redirected** | **PASS** |
| **UI: Role Guard** | Client | Wrong role access | Redirect to Dashboard | **Redirected** | **PASS** |

## 2. Functional & Integration Testing
| Test Case Name | Module | Scenario | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Booking Flow** | Booking | Search to Confirmation | PDF invoice generated | **PDF Received** | **PASS** |
| **Room Filtering** | Rooms | Sort by Category/Price | Accurate results shown | **Sorted correctly** | **PASS** |
| **Housekeeping Sync** | Tasks | Change Room Status | Real-time update in HK UI | **Instant Sync** | **PASS** |
| **Pool Booking** | Service | Reserve a time slot | Slot appears in profile | **Slot Booked** | **PASS** |
| **Staff Management** | Admin | Create/Delete User | Database updated | **User Created** | **PASS** |

## 3. Security & Role-Based Access Control (RBAC)
| Test Case Name | User Role | Targeted Resource | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Unauthorized Block**| Unauth | Any protected API | 401 Unauthorized | **Blocked** | **PASS** |
| **Housekeeping RBAC**| HK Staff | Receptionist Dashboard | 403 Forbidden | **Access Denied**| **PASS** |
| **Cross-Role Access** | HK Staff | Cleaning Tasks Only | Only assigned tasks visible| **Filtered data** | **PASS** |
| **Manager Revenue** | Manager | Revenue Reports | Full report visibility | **Reports Loaded**| **PASS** |

## 4. UI/UX & Responsiveness
| Test Case Name | Device | Scenario | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Mobile Navigation** | Mobile | Use hamburger menu | Menu opens/closes smoothly | **Functional** | **PASS** |
| **Form Error Handling**| Global | Submit empty form | Validation errors shown | **Errors visible**| **PASS** |
| **Responsive Dash** | Tablet | View Data Charts | Charts resize correctly | **Autoscaled** | **PASS** |
| **404 Routing** | Global | Enter invalid URL | Show 'NotFound' page | **404 Displayed** | **PASS** |

---
> [!NOTE]
> This consolidated report serves as the final sign-off for the Quality Assurance phase of the Hotel Management System.
