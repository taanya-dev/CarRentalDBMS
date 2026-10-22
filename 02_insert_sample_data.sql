
/* =====================================================
   DBMS LEVEL 3 PROJECT
   Smart Car Rental and Vehicle Telemetry System
   File: 02_insert_sample_data.sql
   Database: CarRentalDB

   IMPORTANT:
   Run 01_create_schema.sql first.
   Run this file only once for the sample dataset.
   ===================================================== */

USE CarRentalDB;


/* =====================================================
   1. INSERT BRANCH DATA
   ===================================================== */

INSERT INTO Branch
    (Branch_ID, Branch_Name, Contact_No, City, State)
VALUES
    (1, 'Electronic City', '9876501111',
     'Bangalore', 'Karnataka'),

    (2, 'Whitefield', '9876502222',
     'Bangalore', 'Karnataka');


/* =====================================================
   2. INSERT CUSTOMER DATA
   ===================================================== */

INSERT INTO Customer
    (Customer_ID, License_No, First_Name, Middle_Name,
     Last_Name, Street, City, State, Zip, Email)
VALUES
    (101, 'DL001', 'Rahul', NULL, 'Sharma',
     'BTM Layout', 'Bangalore', 'Karnataka',
     '560076', 'rahul@gmail.com'),

    (102, 'DL002', 'Priya', 'K', 'Reddy',
     'HSR Layout', 'Bangalore', 'Karnataka',
     '560102', 'priya@gmail.com'),

    (103, 'DL003', 'Arjun', NULL, 'Patil',
     'Jayanagar', 'Bangalore', 'Karnataka',
     '560041', 'arjun@gmail.com'),

    (104, 'DL004', 'Sneha', NULL, 'Nair',
     'Indiranagar', 'Bangalore', 'Karnataka',
     '560038', 'sneha@gmail.com'),

    (105, 'DL005', 'Rohan', NULL, 'Das',
     'Koramangala', 'Bangalore', 'Karnataka',
     '560034', 'rohan@gmail.com'),

    (106, 'DL006', 'Asha', NULL, 'Rao',
     'Banashankari', 'Bangalore', 'Karnataka',
     '560070', 'asha@gmail.com'),

    (107, 'DL007', 'Kiran', NULL, 'Shetty',
     'Yelahanka', 'Bangalore', 'Karnataka',
     '560064', 'kiran@gmail.com'),

    (108, 'DL008', 'Neha', NULL, 'Joshi',
     'JP Nagar', 'Bangalore', 'Karnataka',
     '560078', 'neha@gmail.com'),

    (109, 'DL009', 'Vikram', NULL, 'Singh',
     'Marathahalli', 'Bangalore', 'Karnataka',
     '560037', 'vikram@gmail.com'),

    (110, 'DL010', 'Anita', NULL, 'Paul',
     'Hebbal', 'Bangalore', 'Karnataka',
     '560024', 'anita@gmail.com');


/* =====================================================
   3. INSERT EMPLOYEE DATA
   ===================================================== */

INSERT INTO Employee
    (Employee_ID, Branch_ID, Employee_Name, Role, Contact_No)
VALUES
    (1, 1, 'Ramesh', 'Manager', '9000000001'),

    (2, 1, 'Suresh', 'Executive', '9000000002'),

    (3, 2, 'Kavya', 'Manager', '9000000003');


/* =====================================================
   4. INSERT VEHICLE DATA
   ===================================================== */

INSERT INTO Vehicle
    (Vehicle_ID, Branch_ID, Registration_No, Model,
     Type, Year, Fuel_Type, Base_Rate)
VALUES
    (201, 1, 'KA01AA1111', 'Swift',
     'Hatchback', 2022, 'Petrol', 1800.00),

    (202, 1, 'KA01AA2222', 'Creta',
     'SUV', 2023, 'Diesel', 2500.00),

    (203, 2, 'KA01AA3333', 'City',
     'Sedan', 2021, 'Petrol', 2200.00);


/* =====================================================
   5. INSERT CUSTOMER PHONE DATA
   ===================================================== */

INSERT INTO Customer_Phone
    (Customer_ID, Phone_No)
VALUES
    (101, '9000010001'),

    (101, '9000010002'),

    (102, '9000010003'),

    (103, '9000010004'),

    (104, '9000010005');


/* =====================================================
   6. INSERT RENTAL DATA
   ===================================================== */

INSERT INTO Rental
    (Rental_ID, Customer_ID, Vehicle_ID, Start_Date,
     End_Date, Pickup_Location, Drop_Location, Total_Distance)
VALUES
    (1, 101, 201, '2026-10-01', '2026-10-03',
     'Electronic City', 'HSR', 120.00),

    (2, 102, 202, '2026-10-05', '2026-10-07',
     'Whitefield', 'Airport', 180.00);


/* =====================================================
   7. INSERT TELEMETRY DEVICE DATA
   ===================================================== */

INSERT INTO Telemetry_Device
    (Device_ID, Vehicle_ID, IMEI_No, Install_Date, Status)
VALUES
    (1, 201, 'IMEI111111111111111',
     '2026-01-01', 'Active'),

    (2, 202, 'IMEI222222222222222',
     '2026-01-15', 'Active'),

    (3, 203, 'IMEI333333333333333',
     '2026-02-01', 'Active');


/* =====================================================
   8. INSERT TELEMETRY LOG DATA
   ===================================================== */

INSERT INTO Telemetry_Log
    (Log_ID, Device_ID, GPS_Location, TimeStamp,
     Speed, Fuel_Level)
VALUES
    (1, 1, 'BTM Layout', '2026-10-01 10:00:00',
     60.00, 80.00),

    (2, 1, 'Silk Board', '2026-10-01 10:15:00',
     75.00, 75.00),

    (3, 1, 'HSR Layout', '2026-10-01 10:30:00',
     45.00, 70.00),

    (4, 2, 'Whitefield', '2026-10-05 11:00:00',
     70.00, 75.00),

    (5, 2, 'Airport Road', '2026-10-05 11:30:00',
     90.00, 65.00),

    (6, 3, 'Electronic City', '2026-10-06 09:00:00',
     50.00, 35.00);


/* =====================================================
   9. INSERT BILL DATA
   ===================================================== */

INSERT INTO Bill
    (Bill_ID, Rental_ID, Base_Amount, Distance_Charge,
     Penalty_Charge, Total_Amount, Payment_Date, Payment_Status)
VALUES
    (1, 1, 2000.00, 300.00, 0.00,
     2300.00, '2026-10-03', 'Paid'),

    (2, 2, 2500.00, 450.00, 200.00,
     3150.00, '2026-10-07', 'Pending');


/* =====================================================
   10. VERIFY INSERTED DATA
   ===================================================== */

SELECT * FROM Branch;

SELECT * FROM Customer;

SELECT * FROM Employee;

SELECT * FROM Vehicle;

SELECT * FROM Customer_Phone;

SELECT * FROM Rental;

SELECT * FROM Telemetry_Device;

SELECT * FROM Telemetry_Log;

SELECT * FROM Bill;


/* =====================================================
   END OF SAMPLE DATA SCRIPT
   ===================================================== */
