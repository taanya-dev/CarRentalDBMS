
/* =========================================================
   DBMS LEVEL 3 PROJECT
   Smart Car Rental and Vehicle Telemetry System
   File: 03_advanced_sql.sql
   Database: CarRentalDB

   PREREQUISITES:
   1. Run 01_create_schema.sql first.
   2. Run 02_insert_sample_data.sql second.
   3. Run this file ONCE.
   ========================================================= */

USE CarRentalDB;


/* =========================================================
   PART 1: INDEXES
   Improve frequently used search operations.
   ========================================================= */

CREATE INDEX idx_rental_dates
ON Rental(Start_Date, End_Date);

CREATE INDEX idx_telemetry_device_time
ON Telemetry_Log(Device_ID, TimeStamp);


/* =========================================================
   PART 2: VIEW
   Display essential customer details.
   ========================================================= */

CREATE VIEW Customer_Details AS
SELECT
    Customer_ID,
    First_Name,
    Last_Name,
    Email
FROM Customer;


/* =========================================================
   PART 3: STORED PROCEDURE
   Return the total number of customers.
   ========================================================= */

DELIMITER //

CREATE PROCEDURE GetCustomerCount()
BEGIN
    SELECT COUNT(*) AS Total_Customers
    FROM Customer;
END //

DELIMITER ;


/* =========================================================
   PART 4: FUNCTION
   Calculate a bill total from its components.
   ========================================================= */

DELIMITER //

CREATE FUNCTION TotalBill(
    base DECIMAL(10,2),
    distance DECIMAL(10,2),
    penalty DECIMAL(10,2)
)
RETURNS DECIMAL(10,2)
DETERMINISTIC
NO SQL
BEGIN
    RETURN base + distance + penalty;
END //

DELIMITER ;


/* =========================================================
   PART 5: VEHICLE RATE AUDIT TABLE
   Record changes to vehicle rental rates.
   ========================================================= */

CREATE TABLE Vehicle_Log (
    Log_ID INT AUTO_INCREMENT PRIMARY KEY,
    Vehicle_ID INT NOT NULL,
    Old_Rate DECIMAL(10,2),
    New_Rate DECIMAL(10,2),
    Updated_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


/* =========================================================
   PART 6: TRIGGER
   Log vehicle rate changes automatically.
   ========================================================= */

DELIMITER //

CREATE TRIGGER VehicleRateUpdate
AFTER UPDATE ON Vehicle
FOR EACH ROW
BEGIN
    IF NOT (OLD.Base_Rate <=> NEW.Base_Rate) THEN
        INSERT INTO Vehicle_Log
            (Vehicle_ID, Old_Rate, New_Rate)
        VALUES
            (OLD.Vehicle_ID, OLD.Base_Rate, NEW.Base_Rate);
    END IF;
END //

DELIMITER ;


/* =========================================================
   PART 7: TRANSACTION DEMONSTRATION
   Update a vehicle rate and commit the transaction.
   The trigger records the change.
   ========================================================= */

START TRANSACTION;

UPDATE Vehicle
SET Base_Rate = Base_Rate + 200
WHERE Vehicle_ID = 201;

COMMIT;


/* =========================================================
   PART 8: TRIGGER TEST
   Update another vehicle's rate.
   ========================================================= */

UPDATE Vehicle
SET Base_Rate = Base_Rate + 50
WHERE Vehicle_ID = 203;


/* =========================================================
   PART 9: IMPORTANT SQL QUERIES
   ========================================================= */


/* Query 1: Customer details using the view */

SELECT * FROM Customer_Details;


/* Query 2: Rental history with customer and vehicle */

SELECT
    r.Rental_ID,
    c.First_Name,
    c.Last_Name,
    v.Model,
    r.Start_Date,
    r.End_Date,
    r.Total_Distance
FROM Rental r
JOIN Customer c
    ON r.Customer_ID = c.Customer_ID
JOIN Vehicle v
    ON r.Vehicle_ID = v.Vehicle_ID
ORDER BY r.Start_Date;


/* Query 3: Revenue by branch
   Only paid bills count as collected revenue.
*/

SELECT
    br.Branch_ID,
    br.Branch_Name,
    COALESCE(SUM(b.Total_Amount), 0) AS Total_Revenue
FROM Branch br
LEFT JOIN Vehicle v
    ON br.Branch_ID = v.Branch_ID
LEFT JOIN Rental r
    ON v.Vehicle_ID = r.Vehicle_ID
LEFT JOIN Bill b
    ON r.Rental_ID = b.Rental_ID
    AND b.Payment_Status = 'Paid'
GROUP BY br.Branch_ID, br.Branch_Name
ORDER BY Total_Revenue DESC;


/* Query 4: Customers with more than one phone number */

SELECT
    c.Customer_ID,
    c.First_Name,
    c.Last_Name,
    COUNT(cp.Phone_No) AS Phone_Count
FROM Customer c
JOIN Customer_Phone cp
    ON c.Customer_ID = cp.Customer_ID
GROUP BY
    c.Customer_ID,
    c.First_Name,
    c.Last_Name
HAVING COUNT(cp.Phone_No) > 1;


/* Query 5: Pending bills */

SELECT
    b.Bill_ID,
    b.Rental_ID,
    b.Total_Amount,
    b.Payment_Status
FROM Bill b
WHERE b.Payment_Status = 'Pending'
ORDER BY b.Total_Amount DESC;


/* Query 6: Vehicles with rates above average */

SELECT
    Vehicle_ID,
    Model,
    Base_Rate
FROM Vehicle
WHERE Base_Rate > (
    SELECT AVG(Base_Rate)
    FROM Vehicle
);


/* Query 7: Latest telemetry reading for each vehicle */

SELECT
    v.Vehicle_ID,
    v.Model,
    t.GPS_Location,
    t.TimeStamp,
    t.Speed,
    t.Fuel_Level
FROM Vehicle v
JOIN Telemetry_Device d
    ON v.Vehicle_ID = d.Vehicle_ID
JOIN Telemetry_Log t
    ON d.Device_ID = t.Device_ID
WHERE t.TimeStamp = (
    SELECT MAX(t2.TimeStamp)
    FROM Telemetry_Log t2
    WHERE t2.Device_ID = t.Device_ID
)
ORDER BY v.Vehicle_ID;


/* Query 8: Low-fuel vehicles */

SELECT
    v.Vehicle_ID,
    v.Model,
    t.Fuel_Level,
    t.TimeStamp
FROM Vehicle v
JOIN Telemetry_Device d
    ON v.Vehicle_ID = d.Vehicle_ID
JOIN Telemetry_Log t
    ON d.Device_ID = t.Device_ID
WHERE t.Fuel_Level < 40
ORDER BY t.Fuel_Level ASC;


/* Query 9: Average speed by telemetry device */

SELECT
    Device_ID,
    COUNT(*) AS Total_Readings,
    AVG(Speed) AS Average_Speed,
    MAX(Speed) AS Maximum_Speed
FROM Telemetry_Log
GROUP BY Device_ID;


/* Query 10: Rental count by vehicle */

SELECT
    v.Vehicle_ID,
    v.Model,
    COUNT(r.Rental_ID) AS Total_Rentals
FROM Vehicle v
LEFT JOIN Rental r
    ON v.Vehicle_ID = r.Vehicle_ID
GROUP BY v.Vehicle_ID, v.Model
ORDER BY Total_Rentals DESC;


/* =========================================================
   PART 10: VERIFICATION
   ========================================================= */


/* Test stored procedure */

CALL GetCustomerCount();


/* Test function */

SELECT TotalBill(2000.00, 300.00, 100.00) AS Total_Bill;


/* Verify trigger audit log */

SELECT * FROM Vehicle_Log;


/* Verify updated vehicle rates */

SELECT Vehicle_ID, Model, Base_Rate
FROM Vehicle;


/* Verify indexes */

SHOW INDEX FROM Rental;

SHOW INDEX FROM Telemetry_Log;


/* END OF ADVANCED SQL SCRIPT */
