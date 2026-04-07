# Hotel Management System ERD

This document provides a visual representation of the data models and their relationships.

> [!IMPORTANT]
> **If you are using [Mermaid Live Editor (Mermaid.Ai)](https://mermaid.live/):**
> DO NOT copy this entire file. Copy **ONLY** the code inside the block below (starting from `erDiagram`).
> Alternatively, use the raw code file: [ERD_Code.mermaid](file:///d:/HotelManagementSystem/ERD_Code.mermaid)

## Mermaid.js Diagram

```mermaid
erDiagram
    User ||--o{ Booking : "makes"
    User ||--o{ Reservation : "makes"
    User ||--o{ Payment : "makes"
    User ||--o{ HousekeepingLog : "assigned to"
    User ||--o{ Notification : "receives"
    User ||--o{ Review : "writes"
    User ||--o{ PoolReservation : "books"
    User ||--o{ Pool : "updates"

    RoomType ||--o{ Room : "categorizes"
    RoomType ||--o{ Review : "receives"
    RoomType }o--o{ Amenity : "includes"

    Room ||--o{ Booking : "has"
    Room ||--o{ Reservation : "has"
    Room ||--o{ HousekeepingLog : "has"
    Room ||--o{ PoolReservation : "links to"

    Booking ||--o| Reservation : "links to"
    Booking ||--o| Payment : "has"
    Payment ||--|| Booking : "pays for"

    Pool ||--o{ PoolReservation : "has"
    PoolSlot ||--o{ PoolReservation : "reserved in"

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
