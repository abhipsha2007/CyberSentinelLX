import { useEffect, useState } from "react";

function EventManager({ onUpdated }) {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const [form, setForm] = useState({
    eventType: "FAILED_LOGIN",
    sourceIP: "",
    username: "",
    message: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const loadEvents = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/events",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load events");
      }

      setEvents(data.events || []);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const createEvent = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/events",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(form),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Event creation failed");
      }

      setMessage(
        `Event created successfully. Risk Score: ${data.event.riskScore}, Severity: ${data.event.severity}`
      );

      setForm({
        eventType: "FAILED_LOGIN",
        sourceIP: "",
        username: "",
        message: "",
      });

      loadEvents();

      if (onUpdated) {
        onUpdated();
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/events/${id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Status update failed");
      }

      loadEvents();

      if (onUpdated) {
        onUpdated();
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>

      {/* CREATE EVENT */}

      <div className="panel">
        <div className="panel-header">
          <div>
            <h2>Create Security Event</h2>
            <p>Submit security activity for threat analysis</p>
          </div>
        </div>

        <form className="event-form" onSubmit={createEvent}>

          <label>Event Type</label>

          <select
            name="eventType"
            value={form.eventType}
            onChange={handleChange}
          >
            <option value="FAILED_LOGIN">
              FAILED_LOGIN
            </option>

            <option value="SUCCESS_LOGIN">
              SUCCESS_LOGIN
            </option>

            <option value="SUSPICIOUS_ACTIVITY">
              SUSPICIOUS_ACTIVITY
            </option>

            <option value="SQL_INJECTION_PATTERN">
              SQL_INJECTION_PATTERN
            </option>

            <option value="BRUTE_FORCE">
              BRUTE_FORCE
            </option>

            <option value="MALWARE_ALERT">
              MALWARE_ALERT
            </option>
          </select>

          <label>Source IP</label>

          <input
            name="sourceIP"
            placeholder="192.168.1.100"
            value={form.sourceIP}
            onChange={handleChange}
            required
          />

          <label>Username</label>

          <input
            name="username"
            placeholder="admin"
            value={form.username}
            onChange={handleChange}
          />

          <label>Message</label>

          <textarea
            name="message"
            placeholder="Describe the security event"
            value={form.message}
            onChange={handleChange}
            required
          />

          <button type="submit">
            Create Security Event
          </button>

        </form>

        {message && (
          <p className="success-text">
            {message}
          </p>
        )}

        {error && (
          <p className="error-text">
            {error}
          </p>
        )}
      </div>


      {/* EVENT LIST */}

      <div className="panel event-manager-panel">

        <div className="panel-header">
          <div>
            <h2>Event Management</h2>
            <p>Security events detected by CyberSentinel X</p>
          </div>
        </div>

        {events.length === 0 ? (
          <p className="loading-text">
            No security events found.
          </p>
        ) : (

          <div className="events-table-wrapper">

            <table className="events-table">

              <thead>
                <tr>
                  <th>Event</th>
                  <th>IP</th>
                  <th>Severity</th>
                  <th>Risk</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>

                {events.map((event) => (

                  <tr key={event._id}>

                    <td>
                      <strong>
                        {event.eventType}
                      </strong>

                      <small className="event-message">
                        {event.message}
                      </small>
                    </td>

                    <td>
                      {event.sourceIP}
                    </td>

                    <td>
                      <span
                        className={`event-severity ${
                          event.severity.toLowerCase()
                        }`}
                      >
                        {event.severity}
                      </span>
                    </td>

                    <td>
                      {event.riskScore}
                    </td>

                    <td>
                      <span className="status-badge">
                        {event.status}
                      </span>
                    </td>

                    <td>

                      <button
                        className="refresh-button"
                        onClick={() =>
                          setSelectedEvent(event)
                        }
                      >
                        Details
                      </button>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>
        )}

      </div>


      {/* THREAT DETAILS */}

      {selectedEvent && (

        <div className="panel">

          <div className="panel-header">

            <div>
              <h2>Threat Details</h2>
              <p>Detailed security event information</p>
            </div>

            <button
              className="refresh-button"
              onClick={() => setSelectedEvent(null)}
            >
              Close
            </button>

          </div>

          <div className="threat-detail-grid">

            <p>
              <strong>Event:</strong>{" "}
              {selectedEvent.eventType}
            </p>

            <p>
              <strong>Source IP:</strong>{" "}
              {selectedEvent.sourceIP}
            </p>

            <p>
              <strong>Username:</strong>{" "}
              {selectedEvent.username}
            </p>

            <p>
              <strong>Severity:</strong>{" "}
              {selectedEvent.severity}
            </p>

            <p>
              <strong>Risk Score:</strong>{" "}
              {selectedEvent.riskScore}
            </p>

            <p>
              <strong>Status:</strong>{" "}
              {selectedEvent.status}
            </p>

            <p>
              <strong>Message:</strong>{" "}
              {selectedEvent.message}
            </p>

          </div>

          <div className="status-actions">

            <button
              onClick={() =>
                updateStatus(
                  selectedEvent._id,
                  "NEW"
                )
              }
            >
              NEW
            </button>

            <button
              onClick={() =>
                updateStatus(
                  selectedEvent._id,
                  "INVESTIGATING"
                )
              }
            >
              INVESTIGATING
            </button>

            <button
              onClick={() =>
                updateStatus(
                  selectedEvent._id,
                  "RESOLVED"
                )
              }
            >
              RESOLVED
            </button>

          </div>

        </div>
      )}

    </div>
  );
}

export default EventManager;