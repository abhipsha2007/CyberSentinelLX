const express = require("express");
const AuditLog = require("../models/AuditLog");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.get("/", protect, authorize("admin"), async (req, res) => {
  try {
    const logs = await AuditLog.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      message: "Audit logs fetched successfully",
      logs
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Could not fetch audit logs"
    });
  }
});

module.exports = router;