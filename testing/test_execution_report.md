# Test Execution Report

This document records the results of the automated and manual tests performed on the Hotel Management System.

## 1. Automated Unit Tests (Jest)
These tests ensure core system logic and security barriers are functioning correctly.

| Test ID | Scenario | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- |
| **JST-01** | Server: Valid Token Auth | Call `next()` and allow access. | **Passed:** Successfully authorized user from JWT. | **PASS** |
| **JST-02** | Server: No Token Auth | Return 401 Unauthorized error. | **Passed:** Access blocked as expected. | **PASS** |
| **JST-03** | Server: Invalid Token | Return 401 "Token is not valid". | **Passed:** Invalid characters correctly rejected. | **PASS** |
| **JST-04** | Server: Role Check (Admin) | Allow access for 'admin' role. | **Passed:** Correctly matched role in request. | **PASS** |
| **JST-05** | Server: Role Check (Housekeeping) | Deny access to Admin routes. | **Passed:** 403 Forbidden returned correctly. | **PASS** |
| **JST-06** | Client: Unauth Redirect | Redirect user to `/login`. | **Passed:** Unauthenticated users cannot view pages. | **PASS** |
| **JST-07** | Client: Role-based Route | Render children if role matches. | **Passed:** Components visible to authorized users. | **PASS** |
| **JST-08** | Client: Dashboard Switch | Redirect to role-specific dashboard. | **Passed:** Housekeeping sent to `/housekeeping-dashboard`. | **PASS** |

## 2. Functional & Usability Testing (Manual/UAT)
These scenarios cover end-to-end workflows and site-wide functionality.

| Test ID | Module | Scenario | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **UAT-01** | Booking | Reservation Life-cycle | From search to PDF confirmation. | **Passed:** Full flow completed without errors. | **PASS** |
| **UAT-02** | Housekeeping | Real-time Status Sync | Receptionist check-out alerts staff. | **Passed:** Room status changed instantly to "Dirty". | **PASS** |
| **UAT-03** | Admin | Staff Management | Create/Remove staff accounts. | **Passed:** Database updated correctly via Admin UI. | **PASS** |
| **UAT-04** | Search | Date/Guest Filters | Show only available rooms. | **Passed:** Filters narrowed results accurately. | **PASS** |
| **UAT-05** | Service | Pool Reservation | Book pool slots. | **Passed:** Slots reserved and visible in dashboard. | **PASS** |

## 3. UI/UX & Responsiveness
| Test ID | Scenario | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- |
| **UX-01** | Mobile responsiveness | Nav menu works on small screens. | **Passed:** Hamburger menu opens/closes correctly. | **PASS** |
| **UX-02** | Form Validation | Missing fields show warnings. | **Passed:** UI highlights invalid input. | **PASS** |
| **UX-03** | Error Handling | Custom 404 page for invalid URL. | **Passed:** User sees helpful "Not Found" message. | **PASS** |

---
> [!NOTE]
> All automated tests were run using `npm test` in their respective directories. Manual tests were verified across desktop and mobile breakpoints.
