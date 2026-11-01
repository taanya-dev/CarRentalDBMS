
/* =====================================================
   DBMS LEVEL 3 PROJECT
   Smart Car Rental and Vehicle Telemetry System
   File: 05_mongodb_setup.js

   Database: car_rental_telemetry
   Collection: telemetry_logs

   Run this file using mongosh.
   ===================================================== */

const telemetryDB = db.getSiblingDB("car_rental_telemetry");

/* =====================================================
   PART 1: CREATE COLLECTION
   ===================================================== */

if (!telemetryDB.getCollectionNames().includes("telemetry_logs")) {
    telemetryDB.createCollection("telemetry_logs");
}

const telemetry = telemetryDB.getCollection("telemetry_logs");


/* =====================================================
   PART 2: INSERT SAMPLE TELEMETRY DOCUMENTS
   Upserts make this sample setup safe to rerun.
   ===================================================== */

const readings = [
    {
        _id: 1,
        vehicle_id: 201,
        device_id: 1,
        timestamp: ISODate("2026-10-01T10:00:00Z"),
        location: { label: "BTM Layout" },
        speed: 60,
        fuel_level: 80,
        event_type: "periodic_reading"
    },
    {
        _id: 2,
        vehicle_id: 201,
        device_id: 1,
        timestamp: ISODate("2026-10-01T10:15:00Z"),
        location: { label: "Silk Board" },
        speed: 75,
        fuel_level: 75,
        event_type: "periodic_reading"
    },
    {
        _id: 3,
        vehicle_id: 201,
        device_id: 1,
        timestamp: ISODate("2026-10-01T10:30:00Z"),
        location: { label: "HSR Layout" },
        speed: 45,
        fuel_level: 70,
        event_type: "periodic_reading"
    },
    {
        _id: 4,
        vehicle_id: 202,
        device_id: 2,
        timestamp: ISODate("2026-10-05T11:00:00Z"),
        location: { label: "Whitefield" },
        speed: 70,
        fuel_level: 75,
        event_type: "periodic_reading"
    },
    {
        _id: 5,
        vehicle_id: 202,
        device_id: 2,
        timestamp: ISODate("2026-10-05T11:30:00Z"),
        location: { label: "Airport Road" },
        speed: 90,
        fuel_level: 65,
        event_type: "periodic_reading"
    },
    {
        _id: 6,
        vehicle_id: 203,
        device_id: 3,
        timestamp: ISODate("2026-10-06T09:00:00Z"),
        location: { label: "Electronic City" },
        speed: 50,
        fuel_level: 35,
        event_type: "periodic_reading"
    }
];

readings.forEach((reading) => {
    telemetry.updateOne(
        { _id: reading._id },
        { $set: reading },
        { upsert: true }
    );
});


/* =====================================================
   PART 3: CREATE INDEXES
   ===================================================== */

// Retrieve a vehicle's readings in timestamp order.
telemetry.createIndex(
    { vehicle_id: 1, timestamp: -1 },
    { name: "idx_vehicle_timestamp" }
);

// Retrieve readings associated with a telemetry device.
telemetry.createIndex(
    { device_id: 1, timestamp: -1 },
    { name: "idx_device_timestamp" }
);


/* =====================================================
   PART 4: DISPLAY ALL TELEMETRY DOCUMENTS
   ===================================================== */

print("\n--- All telemetry readings ---");

printjson(
    telemetry.find().sort({ vehicle_id: 1, timestamp: 1 }).toArray()
);


/* =====================================================
   PART 5: LATEST READING FOR EACH VEHICLE
   ===================================================== */

print("\n--- Latest reading for each vehicle ---");

printjson(
    telemetry.aggregate([
        {
            $sort: {
                vehicle_id: 1,
                timestamp: -1
            }
        },
        {
            $group: {
                _id: "$vehicle_id",
                latest_reading: { $first: "$$ROOT" }
            }
        },
        {
            $sort: { _id: 1 }
        }
    ]).toArray()
);


/* =====================================================
   PART 6: AVERAGE AND MAXIMUM SPEED BY VEHICLE
   ===================================================== */

print("\n--- Speed analytics by vehicle ---");

printjson(
    telemetry.aggregate([
        {
            $group: {
                _id: "$vehicle_id",
                total_readings: { $sum: 1 },
                average_speed: { $avg: "$speed" },
                maximum_speed: { $max: "$speed" }
            }
        },
        {
            $sort: { _id: 1 }
        }
    ]).toArray()
);


/* =====================================================
   PART 7: LOW-FUEL ALERTS
   Threshold: fuel level below 40 percent.
   ===================================================== */

print("\n--- Low-fuel readings ---");

printjson(
    telemetry.find({
        fuel_level: { $lt: 40 }
    }).sort({
        fuel_level: 1
    }).toArray()
);


/* =====================================================
   PART 8: HIGH-SPEED READINGS
   Demonstration threshold: speed above 80.
   This is a project rule, not a legal speed limit.
   ===================================================== */

print("\n--- High-speed readings ---");

printjson(
    telemetry.find({
        speed: { $gt: 80 }
    }).sort({
        speed: -1
    }).toArray()
);


/* =====================================================
   PART 9: VERIFY INDEXES AND DOCUMENT COUNT
   ===================================================== */

print("\n--- Collection indexes ---");
printjson(telemetry.getIndexes());

print("\n--- Total telemetry documents ---");
print(telemetry.countDocuments());

print("\n--- MongoDB setup completed ---");
