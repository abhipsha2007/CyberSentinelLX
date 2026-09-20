function detectThreat(event) {
  let riskScore = 0;
  let severity = "LOW";
  const message = event.message.toLowerCase();

  // Failed login detection
  if (event.eventType === "FAILED_LOGIN") {
    riskScore += 30;
  }

  // Multiple login attempts
  if (
    message.includes("multiple failed") ||
    message.includes("brute force")
  ) {
    riskScore += 40;
  }

  // SQL injection pattern in logs
  if (
    message.includes("union select") ||
    message.includes("' or '1'='1") ||
    message.includes("drop table")
  ) {
    riskScore += 50;
  }

  // Suspicious IP example
  if (event.sourceIP.startsWith("10.")) {
    riskScore += 10;
  }

  // Severity calculation
  if (riskScore >= 80) {
    severity = "CRITICAL";
  } else if (riskScore >= 60) {
    severity = "HIGH";
  } else if (riskScore >= 30) {
    severity = "MEDIUM";
  }

  return {
    riskScore,
    severity
  };
}

module.exports = detectThreat;