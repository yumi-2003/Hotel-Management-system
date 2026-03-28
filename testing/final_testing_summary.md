# Final Testing Summary

This table provides a high-level overview of the testing conducted on the Hotel Management System.

| Test ID | Module | Scenario | User Role | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **AUT-01** | Auth | Unauthorized access block | Unauthenticated | Redirect to Login; API returns 401 | **Blocked & Redirected** | **PASS** |
| **AUT-02** | Auth | Specific role restricted | Housekeeping | Accessing Admin Panel returns 403 | **Access Denied (403)** | **PASS** |
| **BOK-01** | Booking | Search for available rooms | Guest | Only unoccupied rooms show for selected dates | **Filtered correctly** | **PASS** |
| **BOK-02** | Booking | Complete reservation | Guest | Receive confirmation & PDF bill | **Bill generated as PDF** | **PASS** |
| **STA-01** | Staff | Housekeeping task view | Housekeeping | Sees *only* assigned cleaning tasks | **Role-specific data only** | **PASS** |
| **STA-02** | Staff | Instant data sync | Front Desk | Changing room to 'Dirty' alerts Housekeeping | **Real-time update** | **PASS** |
| **ADM-01** | Admin | Full control access | Admin | Access User, Room, and Revenue reports | **Full access granted** | **PASS** |
| **SYS-01** | System | Responsiveness | All Roles | UI adapts to Mobile/Tablet layouts | **Responsive layout** | **PASS** |

---
> [!NOTE]
> All automated Jest unit tests passed (Server: 6/6, Client: 3/3). Manual verification for staff-specific cross-role data access is complete and validated.
