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
        ObjectId _id PK
        string fullName
        string email
        string phone
        string passwordHash
        string profileImage
        string role
        string status
        string resetPasswordCode
        date resetPasswordExpires
        ObjectId[] tasksAssigned FK
        date createdAt
        date updatedAt
    }

    RoomType {
        ObjectId _id PK
        ObjectId[] amenities FK
        string typeName
        string description
        int basePrice
        int maxAdults
        int maxChildren
        int maxGuests
        string bedType
        int sizeSqm
        string[] images
        int rating
        int numReviews
        int discount
        boolean isActive
        boolean isFeatured
        date createdAt
        date updatedAt
    }

    Room {
        ObjectId _id PK
        ObjectId roomTypeId FK
        string roomNumber
        int floor
        string status
        string notes
        date createdAt
        date updatedAt
    }

    Amenity {
        ObjectId _id PK
        string name
        string icon
        boolean isActive
        date createdAt
        date updatedAt
    }

    Booking {
        ObjectId _id PK
        ObjectId reservationId FK
        ObjectId guestId FK
        ObjectId paymentId FK
        string bookingCode
        date checkInDate
        date checkOutDate
        int adultsCount
        int childrenCount
        string status
        int subtotalAmount
        int taxAmount
        int totalPrice
        date createdAt
        date updatedAt
    }

    Reservation {
        ObjectId _id PK
        ObjectId guestId FK
        string reservationCode
        date checkInDate
        date checkOutDate
        int adultsCount
        int childrenCount
        int roomsCount
        int subtotalAmount
        int taxAmount
        int totalAmount
        string status
        date expiresAt
        date createdAt
        date updatedAt
    }

    Payment {
        ObjectId _id PK
        ObjectId bookingId FK
        ObjectId guestId FK
        int amount
        string currency
        string paymentMethod
        string status
        string transactionId
        date createdAt
        date updatedAt
    }

    HousekeepingLog {
        ObjectId _id PK
        ObjectId roomId FK
        ObjectId staffId FK
        string status
        string task
        string note
        date createdAt
        date updatedAt
    }

    Notification {
        ObjectId _id PK
        ObjectId recipient FK
        string message
        string type
        boolean isRead
        string link
        date createdAt
        date updatedAt
    }

    Review {
        ObjectId _id PK
        ObjectId userId FK
        ObjectId roomTypeId FK
        int rating
        string comment
        date createdAt
        date updatedAt
    }

    Pool {
        ObjectId _id PK
        ObjectId updatedBy FK
        string name
        string status
        int currentOccupancy
        int maxCapacity
        int temperature
        string openingTime
        string closingTime
        string notes
        date createdAt
        date updatedAt
    }

    PoolSlot {
        ObjectId _id PK
        string startTime
        string endTime
        int maxPeople
        int currentReserved
        string date
        date createdAt
        date updatedAt
    }

    PoolReservation {
        ObjectId _id PK
        ObjectId userId FK
        ObjectId roomId FK
        ObjectId slotId FK
        string status
        date createdAt
        date updatedAt
    }
```
