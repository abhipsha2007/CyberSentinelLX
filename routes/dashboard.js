const express = require("express");
const SecurityEvent = require("../models/SecurityEvent");
const protect = require("../middleware/auth");

const router = express.Router();

router.get("/", protect, async (req, res) => {
  try {
    const totalEvents = await SecurityEvent.countDocuments();

    const critical = await SecurityEvent.countDocuments({
      severity: "CRITICAL"
    });

    const high = await SecurityEvent.countDocuments({
      severity: "HIGH"
    });

    const medium = await SecurityEvent.countDocuments({
      severity: "MEDIUM"
    });

    const low = await SecurityEvent.countDocuments({
      severity: "LOW"
    });

    const newEvents = await SecurityEvent.countDocuments({
      status: "NEW"
    });

    const investigating = await SecurityEvent.countDocuments({
      status: "INVESTIGATING"
    });

    const resolved = await SecurityEvent.countDocuments({
      status: "RESOLVED"
    });

    res.json({
      totalEvents,
      severity: {
        critical,
        high,
        medium,
        low
      },
      status: {
        new: newEvents,
        investigating,
        resolved
      }
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Dashboard data could not be loaded"
    });
  }
});

module.exports = router;