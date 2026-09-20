const express = require("express");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.get("/:ip", protect, async (req, res) => {
  try {
    const ip = req.params.ip;

    if (!ip) {
      return res.status(400).json({
        message: "IP address is required"
      });
    }

    res.json({
      ip,
      reputation: "UNKNOWN",
      source: "CyberSentinel X",
      note: "External threat-intelligence provider is not connected yet."
    });

  } catch (error) {
    console.error("Threat intelligence error:", error);

    res.status(500).json({
      message: "Threat intelligence lookup failed"
    });
  }
});

module.exports = router;