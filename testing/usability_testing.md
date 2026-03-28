# Usability Testing and UAT Report

This document outlines the User Acceptance Testing (UAT) scenarios and usability validation for the Hotel Management System.

## Usability Testing Table

| Test Case ID | Scenario | User Role | Expected Result | Validation Status |
| :--- | :--- | :--- | :--- | :--- |
| **UT-001** | Unauthorized Access Blocked | Guest / Unauthenticated | Redirected to Login; API returns 401/403 for protected routes. | Pending |
| **UT-002** | Housekeeping Task View | Housekeeping | Housekeeping staff *only* sees cleaning tasks and room status updates relevant to their role. | Pending |
| **UT-003** | Reservation Management | receptionist / Admin | Can create, modify, and cancel reservations. Housekeeping cannot access this view. | Pending |
| **UT-004** | Dashboard Analytics | Admin / Manager | View occupancy rates, revenue reports, and staff performance. | Pending |
| **UT-005** | Instant Data Sync | Housekeeping & Front Desk | Front Desk marks room as "Checked Out"; Housekeeping instantly sees room status change to "Dirty". | Pending |
| **UT-006** | Profile Update | All Staff | Staff can update their own profile details (email, password, etc.). | Pending |

## UAT Scenarios for Staff

### 1. Housekeeping Workflow
**Scenario:** A guest checks out.
- **Step 1:** Receptionist marks the room as "Checked Out" in the system.
- **Step 2:** Housekeeping staff logs in.
- **Step 3:** Housekeeping navigates to "Tasks" or "Room Status".
- **Step 4:** **Verification:** The room is listed as "Dirty/Cleaning Required". Housekeeping cannot see the guest's financial details or other reservations.

### 2. Admin/Manager Workflow
**Scenario:** Monthly report generation.
- **Step 1:** Admin logs in.
- **Step 2:** Admin navigates to "Reports".
- **Step 3:** Admin selects "Occupancy" and "Revenue" for the past month.
- **Step 4:** **Verification:** Report is generated correctly. Staff with "Housekeeping" role cannot access this page (returns 403).

### 3. Cross-Role Data Integrity
**Scenario:** Duty assignment.
- **Step 1:** Manager assigns a specific room cleaning task to a Housekeeping staff member.
- **Step 2:** The Housekeeping staff member logs in.
- **Step 3:** **Verification:** The task appears instantly on their dashboard. No other staff (receptionist) sees this as their assigned task.

---
> [!NOTE]
> These tests are designed to be performed by actual hotel staff during the pilot phase to ensure the UI is intuitive and the system meets operational needs.
