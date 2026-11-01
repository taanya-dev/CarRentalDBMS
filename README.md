# 🚗 Car Rental DBMS

A full-stack Car Rental Management System built using **Next.js**, **TypeScript**, **MySQL**, and **MongoDB**. The application allows users to manage customers, vehicles, rentals, billing records, and vehicle telemetry through an interactive dashboard.

---

## 📌 Features

- Customer Management
  - View all customers
  - Add new customers
  - Automatic Customer ID generation

- Vehicle Management
  - View available vehicles
  - Vehicle availability validation
  - Prevents double booking

- Rental Management
  - Create rental bookings
  - Select customer and vehicle
  - Start and end date selection
  - Pickup and drop locations
  - Rental history
  - Active and Completed rental status

- Billing
  - Billing records stored in MySQL
  - Dashboard summary

- Telemetry
  - Vehicle telemetry stored in MongoDB
  - Dashboard integration

- Authentication
  - Login API
  - Session-based authentication

---

## 🛠️ Tech Stack

### Frontend
- Next.js
- React
- TypeScript
- CSS

### Backend
- Next.js API Routes
- Node.js

### Databases
- MySQL 8.0
- MongoDB

### Packages
- mysql2
- mongodb
- jose
- bcryptjs

---

## 📂 Project Structure

```
app/
│
├── api/
│   ├── auth/
│   ├── billing/
│   ├── customers/
│   ├── dashboard/
│   ├── rentals/
│   ├── telemetry/
│   └── vehicles/
│
├── page.tsx
├── layout.tsx
│
lib/
├── mongodb.ts
└── mysql.ts

public/

01_create_schema.sql
02_insert_sample_data.sql
03_advanced_sql.sql
04_ddl_demonstrations.sql
05_mongodb_setup.js
```

---

## ⚙️ Installation

Clone the repository

```bash
git clone https://github.com/taanya-dev/CarRentalDBMS.git
```

Move into the project directory

```bash
cd CarRentalDBMS
```

Install dependencies

```bash
npm install
```

---

## 🗄️ Database Setup

### MySQL

Create the database using:

```bash
01_create_schema.sql
```

Insert sample data:

```bash
02_insert_sample_data.sql
```

Optional SQL demonstrations:

```bash
03_advanced_sql.sql
04_ddl_demonstrations.sql
```

### MongoDB

Run:

```bash
05_mongodb_setup.js
```

to create the telemetry database and sample telemetry collection.

---

## ▶️ Running the Project

Start the development server:

```bash
npm run dev
```

Open:

```
http://localhost:3000
```

---

## 📊 Main Modules

- Dashboard
- Customer Management
- Vehicle Management
- Rental Management
- Billing
- Telemetry
- Authentication

---

## 📋 Validation Implemented

- Prevents booking an already rented vehicle.
- Customer IDs are generated automatically.
- Date validation for rentals.
- Foreign key constraints in MySQL.
- Rental history tracking.
- Vehicle availability checking.


Car Rental DBMS Project

Developed as part of the Database Management Systems course using Next.js, MySQL, and MongoDB.

---

## 📄 License

This project is developed for educational purposes.
