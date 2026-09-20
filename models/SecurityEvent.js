const mongoose = require("mongoose");

const securityEventSchema = new mongoose.Schema(
  {
    eventType: {
      type: String,
      required: true
    },

    sourceIP: {
      type: String,
      required: true
    },

    username: {
      type: String,
      default: "unknown"
    },

    message: {
      type: String,
      required: true
    },

    severity: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
      default: "LOW"
    },

    riskScore: {
      type: Number,
      default: 0
    },

    status: {
      type: String,
      enum: ["NEW", "INVESTIGATING", "RESOLVED"],
      default: "NEW"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("SecurityEvent", securityEventSchema);