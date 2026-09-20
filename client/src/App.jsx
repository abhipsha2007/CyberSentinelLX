import { useEffect, useState } from "react";
import Login from "./Login";
import SecurityEvents from "./SecurityEvents";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

import "./App.css";

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [page, setPage] = useState("dashboard");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  // CHECK LOGIN
  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        setLoggedIn(true);
      } catch (error) {
        console.error("Saved user error:", error);

        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
  }, []);

  // LOAD DASHBOARD
  const loadDashboard = async () => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        "http://localhost:5000/api/dashboard",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Dashboard request failed");
      }

      const data = await response.json();

      setStats(data);

    } catch (error) {
      console.error("Dashboard error:", error);
    }
  };

  // LOAD SECURITY EVENTS
  const loadEvents = async () => {
    const token = localStorage.getItem("token");

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/events",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Events request failed");
      }

      const data = await response.json();

      setEvents(data.events || []);

    } catch (error) {
      console.error("Events error:", error);

    } finally {
      setLoading(false);
    }
  };

  // LOAD DATA AFTER LOGIN
  useEffect(() => {
    if (loggedIn) {
      loadDashboard();
      loadEvents();
    }
  }, [loggedIn]);

  // LOGIN
  const handleLogin = (userData) => {
    setUser(userData);
    setLoggedIn(true);
    setPage("dashboard");
  };

  // LOGOUT
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
    setLoggedIn(false);
    setStats(null);
    setEvents([]);
    setPage("dashboard");
  };

  // LOGIN SCREEN
  if (!loggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  // HIGH + CRITICAL THREATS
  const threats = events.filter(
    (event) =>
      event.severity === "HIGH" ||
      event.severity === "CRITICAL"
  );

  // CHART DATA
  const chartData = stats
    ? [
        {
          name: "Critical",
          value: stats.severity?.critical || 0
        },
        {
          name: "High",
          value: stats.severity?.high || 0
        },
        {
          name: "Medium",
          value: stats.severity?.medium || 0
        },
        {
          name: "Low",
          value: stats.severity?.low || 0
        }
      ]
    : [];

  return (
    <div className="dashboard">

      {/* SIDEBAR */}
      <aside className="sidebar">

        <div className="brand">

          <div className="shield">
            🛡️
          </div>

          <div>
            <h2>CyberSentinel X</h2>
            <span>SOC PLATFORM</span>
          </div>

        </div>

        <nav
          className="navigation"
          aria-label="Main navigation"
        >
          <button
            type="button"
            className={page === "dashboard" ? "active" : ""}
            onClick={() => setPage("dashboard")}
          >
            Dashboard
          </button>
          <button
            type="button"
            className={page === "events" ? "active" : ""}
            onClick={() => setPage("events")}
          >
            Security Events
          </button>
        </nav>

        <button type="button" className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <h1>{page === "dashboard" ? "Security Dashboard" : "Security Events"}</h1>
            <p>Welcome, {user?.name || user?.email || "User"}</p>
          </div>
        </header>

        {page === "events" ? (
          <SecurityEvents events={events} loading={loading} />
        ) : (
          <section className="dashboard-content">
            <div className="threat-summary">
              <h2>Threat Summary</h2>
              <p>{threats.length} high or critical threats detected.</p>
            </div>

            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#2563eb" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;