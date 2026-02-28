# Hotel Management System ERD

This document provides a visual representation of the data models and their relationships.

> [!IMPORTANT]
> **If you are using [Mermaid Live Editor (Mermaid.Ai)](https://mermaid.live/):**
> DO NOT copy this entire file. Copy **ONLY** the code inside the block below (starting from `erDiagram`).
> Alternatively, use the raw code file: [ERD_Code.mermaid](file:///d:/HotelManagementSystem/ERD_Code.mermaid)

## Mermaid.js Diagram

```mermaid
erDiagram
    User ||--o{ Booking : ""
    User ||--o{ Reservation : ""
    User ||--o{ Payment : ""
    User ||--o{ HousekeepingLog : ""
    User ||--o{ Notification : ""
    User ||--o{ Review : ""
    User ||--o{ PoolReservation : ""
    User ||--o{ Pool : ""

    RoomType ||--o{ Room : ""
    RoomType ||--o{ Review : ""
    RoomType }o--o{ Amenity : ""

    Room ||--o{ Booking : ""
    Room ||--o{ Reservation : ""
    Room ||--o{ HousekeepingLog : ""
    Room ||--o{ PoolReservation : ""

    Booking ||--o| Reservation : ""
    Booking ||--o| Payment : ""
    Payment ||--|| Booking : ""

    Pool ||--o{ PoolReservation : ""
    PoolSlot ||--o{ PoolReservation : ""

    User {
        string fullName
        string email
        string phone
        string passwordHash
        string profileImage
        string role
        string status
        string resetCode
        date resetExpires
        string tasks
    }

    RoomType {
        string typeName
        string description
        int basePrice
        int maxAdults
        int maxChildren
        int maxGuests
        string bedType
        int sizeSqm
        string images
        string amenities
        int rating
        int numReviews
        int discount
        boolean isActive
        boolean isFeatured
    }

    Room {
        string roomNumber
        string typeId
        int floor
        string status
        string notes
    }

    Amenity {
        string name
        string icon
        boolean isActive
    }

    Booking {
        string bookingCode
        string reservationId
        string guestId
        date checkIn
        date checkOut
        int adults
        int children
        string status
        int subtotal
        int tax
        int total
        string paymentId
    }

    Reservation {
        string reservationCode
        string guestId
        date checkIn
        date checkOut
        int adults
        int children
        int rooms
        int subtotal
        int tax
        int total
        string status
        date expiresAt
    }

    Payment {
        string bookingId
        string guestId
        int amount
        string currency
        string method
        string status
        string transactionId
    }

    HousekeepingLog {
        string roomId
        string staffId
        string status
        string task
        string note
    }

    Notification {
        string recipient
        string message
        string type
        boolean isRead
        string link
    }

    Review {
        string userId
        string roomTypeId
        int rating
        string comment
    }

    Pool {
        string name
        string status
        int occupancy
        int capacity
        int temp
        string open
        string close
        string notes
        string updatedBy
    }

    PoolSlot {
        string startTime
        string endTime
        int maxPeople
        int reserved
        string date
    }

    PoolReservation {
        string userId
        string roomId
        string slotId
        string status
    }
```
