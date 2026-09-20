const express = require("express");
const SecurityEvent = require("../models/SecurityEvent");
const { protect } = require("../middleware/auth");
const detectThreat = require("../services/threatDetector");
const AuditLog = require("../models/AuditLog");

const router = express.Router();

router.get("/", protect, async (req, res) => {
  try {
    const events = await SecurityEvent.find()
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(200).json({
      message: "Security events fetched successfully",
      events
    });

  } catch (error) {
    console.error("Fetch events error:", error);

    res.status(500).json({
      message: "Could not fetch security events"
    });
  }
});


router.post("/", protect, async (req, res) => {
  try {
    const {
      eventType,
      sourceIP,
      username,
      message
    } = req.body;

    if (!eventType || !sourceIP || !message) {
      return res.status(400).json({
        message: "eventType, sourceIP and message are required"
      });
    }

    const threat = detectThreat({
      eventType,
      sourceIP,
      username,
      message
    });

    const event = await SecurityEvent.create({
      eventType,
      sourceIP,
      username: username || "unknown",
      message,
      severity: threat.severity,
      riskScore: threat.riskScore
    });

    await AuditLog.create({
      userId: req.user.userId,
      action: "CREATE_SECURITY_EVENT",
      details: `Security event created: ${event.eventType}`,
      ipAddress: req.ip
    });

    res.status(201).json({
      message: "Security event created successfully",
      event
    });

  } catch (error) {
    console.error("Create event error:", error);

    res.status(500).json({
      message: "Server error"
    });
  }
});
router.patch("/:id/status", protect, async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "NEW",
      "INVESTIGATING",
      "RESOLVED"
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid status"
      });
    }

    const event = await SecurityEvent.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!event) {
      return res.status(404).json({
        message: "Security event not found"
      });
    }

    await AuditLog.create({
      userId: req.user.userId,
      action: "UPDATE_SECURITY_EVENT_STATUS",
      details: `Event ${event._id} changed to ${status}`,
      ipAddress: req.ip
    });

    res.json({
      message: "Event status updated",
      event
    });

  } catch (error) {
    console.error("Status update error:", error);

    res.status(500).json({
      message: "Could not update event status"
    });
  }
});

module.exports = router;