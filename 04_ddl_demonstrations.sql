
/* =====================================================
   DBMS LEVEL 3 PROJECT
   File: 04_ddl_demonstrations.sql
   Demonstrates ALTER TABLE and RENAME TABLE.
   
   PREREQUISITE:
   Run 01_create_schema.sql first.
   
   IMPORTANT:
   Run this file only after the Employee and Bill
   tables have been created.
   ===================================================== */

USE CarRentalDB;


/* =====================================================
   PART 1: ALTER TABLE DEMONSTRATIONS
   ===================================================== */


/* 1. ADD COLUMN
   Add a temporary Experience column to Employee.
*/

ALTER TABLE Employee
ADD COLUMN Experience INT;


/* 2. MODIFY COLUMN
   Increase Role column length from VARCHAR(50)
   to VARCHAR(60).
*/

ALTER TABLE Employee
MODIFY COLUMN Role VARCHAR(60);


/* 3. RENAME COLUMN
   Rename Employee_Name to Emp_Name.
*/

ALTER TABLE Employee
RENAME COLUMN Employee_Name TO Emp_Name;


/* 4. RESTORE ORIGINAL COLUMN NAME
   Restore Emp_Name to Employee_Name so the
   original project schema remains unchanged.
*/

ALTER TABLE Employee
RENAME COLUMN Emp_Name TO Employee_Name;


/* 5. DROP COLUMN
   Remove the temporary Experience column.
*/

ALTER TABLE Employee
DROP COLUMN Experience;


/* =====================================================
   PART 2: RENAME TABLE DEMONSTRATION
   ===================================================== */

/* Rename Bill to Billing */

RENAME TABLE Bill TO Billing;


/* Restore the original table name */

RENAME TABLE Billing TO Bill;


/* =====================================================
   PART 3: VERIFICATION
   ===================================================== */

/* Verify Employee structure */

DESCRIBE Employee;


/* Verify Bill table exists under its original name */

SHOW TABLES;


/* Verify Bill data remains intact */

SELECT * FROM Bill;


/* END OF DDL DEMONSTRATION */
