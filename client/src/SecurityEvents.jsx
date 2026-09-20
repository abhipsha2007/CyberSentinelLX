import { useEffect, useState } from "react";

function SecurityEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [intel, setIntel] = useState(null);
  const [intelLoading, setIntelLoading] = useState(false);

  const loadEvents = () => {
    const token = localStorage.getItem("token");

    setLoading(true);
    setError("");

    fetch("http://localhost:5000/api/events", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch events");
        }

        return response.json();
      })
      .then((data) => {
        setEvents(data.events || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Could not load security events");
        setLoading(false);
      });
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const checkThreatIntel = async (ip) => {
    try {
      setIntelLoading(true);
      setIntel(null);

      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/api/threat-intel/${encodeURIComponent(ip)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Threat intelligence lookup failed"
        );
      }

      setIntel(data);
    } catch (err) {
      console.error(err);
      setIntel({
        error: err.message,
      });
    } finally {
      setIntelLoading(false);
    }
  };

  return (
    <div>

      <div className="panel">

        <div className="panel-header">

          <div>
            <h2>Security Events</h2>
            <p>
              Detected security activity
            </p>
          </div>

          <button
            className="refresh-button"
            onClick={loadEvents}
          >
            ↻ Refresh
          </button>

        </div>

        {loading && (
          <p className="loading-text">
            Loading security events...
          </p>
        )}

        {error && (
          <p className="error-text">
            {error}
          </p>
        )}

        {!loading && !error && events.length === 0 && (
          <p className="loading-text">
            No security events found.
          </p>
        )}

        {!loading && !error && events.length > 0 && (

          <div className="events-table-wrapper">

            <table className="events-table">

              <thead>

                <tr>
                  <th>Event</th>
                  <th>Source IP</th>
                  <th>User</th>
                  <th>Severity</th>
                  <th>Risk</th>
                  <th>Status</th>
                  <th>Threat Intel</th>
                  <th>Time</th>
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
                      {event.username || "unknown"}
                    </td>

                    <td>

                      <span
                        className={`event-severity ${
                          event.severity?.toLowerCase()
                        }`}
                      >
                        {event.severity}
                      </span>

                    </td>

                    <td>
                      <strong>
                        {event.riskScore}
                      </strong>
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
                          checkThreatIntel(event.sourceIP)
                        }
                      >
                        Check IP
                      </button>
                    </td>

                    <td>
                      {event.createdAt
                        ? new Date(
                            event.createdAt
                          ).toLocaleString()
                        : "-"}
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>

      {intelLoading && (
        <div className="panel">
          <p className="loading-text">
            Checking threat intelligence...
          </p>
        </div>
      )}

      {intel && !intelLoading && (
        <div className="panel">

          <div className="panel-header">

            <div>
              <h2>IP Threat Intelligence</h2>
              <p>
                Security reputation information
              </p>
            </div>

            <button
              className="refresh-button"
              onClick={() => setIntel(null)}
            >
              Close
            </button>

          </div>

          {intel.error ? (

            <p className="error-text">
              {intel.error}
            </p>

          ) : (

            <div className="threat-detail-grid">

              <p>
                <strong>IP Address:</strong>{" "}
                {intel.ip}
              </p>

              <p>
                <strong>Reputation:</strong>{" "}
                {intel.reputation}
              </p>

              <p>
                <strong>Source:</strong>{" "}
                {intel.source}
              </p>

              <p>
                <strong>Status:</strong>{" "}
                No external provider connected
              </p>

              <p>
                <strong>Note:</strong>{" "}
                {intel.note}
              </p>

            </div>

          )}

        </div>
      )}

    </div>
  );
}

export default SecurityEvents;