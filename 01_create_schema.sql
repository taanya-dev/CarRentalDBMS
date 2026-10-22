
/* =====================================================
   DBMS LEVEL 3 PROJECT
   Smart Car Rental and Vehicle Telemetry System
   File: 01_create_schema.sql
   Database: CarRentalDB
   ===================================================== */

CREATE DATABASE IF NOT EXISTS CarRentalDB;

USE CarRentalDB;


/* =====================================================
   1. BRANCH TABLE
   ===================================================== */

CREATE TABLE Branch (
    Branch_ID INT PRIMARY KEY,
    Branch_Name VARCHAR(50) NOT NULL,
    Contact_No VARCHAR(15) UNIQUE,
    City VARCHAR(30),
    State VARCHAR(30)
);


/* =====================================================
   2. CUSTOMER TABLE
   ===================================================== */

CREATE TABLE Customer (
    Customer_ID INT PRIMARY KEY,
    License_No VARCHAR(20) UNIQUE NOT NULL,
    First_Name VARCHAR(30) NOT NULL,
    Middle_Name VARCHAR(30),
    Last_Name VARCHAR(30) NOT NULL,
    Street VARCHAR(50),
    City VARCHAR(30),
    State VARCHAR(30),
    Zip VARCHAR(10),
    Email VARCHAR(100) UNIQUE
);


/* =====================================================
   3. VEHICLE TABLE
   ===================================================== */

CREATE TABLE Vehicle (
    Vehicle_ID INT PRIMARY KEY,
    Branch_ID INT NOT NULL,
    Registration_No VARCHAR(20) UNIQUE NOT NULL,
    Model VARCHAR(30) NOT NULL,
    Type VARCHAR(20),
    Year INT,
    Fuel_Type VARCHAR(20),
    Base_Rate DECIMAL(10,2) NOT NULL,

    CONSTRAINT fk_vehicle_branch
        FOREIGN KEY (Branch_ID)
        REFERENCES Branch(Branch_ID),

    CONSTRAINT chk_vehicle_rate
        CHECK (Base_Rate > 0),

    CONSTRAINT chk_vehicle_year
        CHECK (Year IS NULL OR Year BETWEEN 1990 AND 2100)
);


/* =====================================================
   4. EMPLOYEE TABLE
   ===================================================== */

CREATE TABLE Employee (
    Employee_ID INT PRIMARY KEY,
    Branch_ID INT NOT NULL,
    Employee_Name VARCHAR(50) NOT NULL,
    Role VARCHAR(60),
    Contact_No VARCHAR(15) UNIQUE,

    CONSTRAINT fk_employee_branch
        FOREIGN KEY (Branch_ID)
        REFERENCES Branch(Branch_ID)
);


/* =====================================================
   5. RENTAL TABLE
   ===================================================== */

CREATE TABLE Rental (
    Rental_ID INT PRIMARY KEY,
    Customer_ID INT NOT NULL,
    Vehicle_ID INT NOT NULL,
    Start_Date DATE NOT NULL,
    End_Date DATE,
    Pickup_Location VARCHAR(50),
    Drop_Location VARCHAR(50),
    Total_Distance DECIMAL(10,2) DEFAULT 0,

    CONSTRAINT fk_rental_customer
        FOREIGN KEY (Customer_ID)
        REFERENCES Customer(Customer_ID),

    CONSTRAINT fk_rental_vehicle
        FOREIGN KEY (Vehicle_ID)
        REFERENCES Vehicle(Vehicle_ID),

    CONSTRAINT chk_rental_dates
        CHECK (End_Date IS NULL OR End_Date >= Start_Date),

    CONSTRAINT chk_rental_distance
        CHECK (
            Total_Distance IS NULL
            OR Total_Distance >= 0
        )
);


/* =====================================================
   6. TELEMETRY DEVICE TABLE
   ===================================================== */

CREATE TABLE Telemetry_Device (
    Device_ID INT PRIMARY KEY,
    Vehicle_ID INT UNIQUE NOT NULL,
    IMEI_No VARCHAR(20) UNIQUE NOT NULL,
    Install_Date DATE,
    Status VARCHAR(20) NOT NULL DEFAULT 'Active',

    CONSTRAINT fk_device_vehicle
        FOREIGN KEY (Vehicle_ID)
        REFERENCES Vehicle(Vehicle_ID),

    CONSTRAINT chk_device_status
        CHECK (
            Status IN ('Active', 'Inactive', 'Maintenance')
        )
);


/* =====================================================
   7. TELEMETRY LOG TABLE
   ===================================================== */

CREATE TABLE Telemetry_Log (
    Log_ID INT PRIMARY KEY,
    Device_ID INT NOT NULL,
    GPS_Location VARCHAR(100),
    TimeStamp DATETIME NOT NULL,
    Speed DECIMAL(5,2),
    Fuel_Level DECIMAL(5,2),

    CONSTRAINT fk_log_device
        FOREIGN KEY (Device_ID)
        REFERENCES Telemetry_Device(Device_ID),

    CONSTRAINT chk_log_speed
        CHECK (Speed IS NULL OR Speed >= 0),

    CONSTRAINT chk_log_fuel
        CHECK (
            Fuel_Level IS NULL
            OR Fuel_Level BETWEEN 0 AND 100
        )
);


/* =====================================================
   8. BILL TABLE
   ===================================================== */

CREATE TABLE Bill (
    Bill_ID INT PRIMARY KEY,
    Rental_ID INT UNIQUE NOT NULL,
    Base_Amount DECIMAL(10,2) NOT NULL,
    Distance_Charge DECIMAL(10,2) NOT NULL DEFAULT 0,
    Penalty_Charge DECIMAL(10,2) NOT NULL DEFAULT 0,
    Total_Amount DECIMAL(10,2) NOT NULL,
    Payment_Date DATE,
    Payment_Status VARCHAR(20) NOT NULL DEFAULT 'Pending',

    CONSTRAINT fk_bill_rental
        FOREIGN KEY (Rental_ID)
        REFERENCES Rental(Rental_ID),

    CONSTRAINT chk_bill_amounts
        CHECK (
            Base_Amount >= 0
            AND Distance_Charge >= 0
            AND Penalty_Charge >= 0
            AND Total_Amount >= 0
        ),

    CONSTRAINT chk_payment_status
        CHECK (
            Payment_Status IN ('Paid', 'Pending', 'Failed')
        )
);


/* =====================================================
   9. CUSTOMER PHONE TABLE
   Supports multiple phone numbers per customer.
   ===================================================== */

CREATE TABLE Customer_Phone (
    Customer_ID INT,
    Phone_No VARCHAR(15),

    PRIMARY KEY (Customer_ID, Phone_No),

    CONSTRAINT fk_phone_customer
        FOREIGN KEY (Customer_ID)
        REFERENCES Customer(Customer_ID)
);


/* =====================================================
   END OF SCHEMA
   All 9 project tables have been defined.
   ===================================================== */

/* Verification: execute after creating the tables */

SHOW TABLES;
