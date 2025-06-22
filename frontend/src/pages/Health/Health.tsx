import { useEffect, useState } from "react";
import "./Health.css";
import { Link } from "react-router-dom";

function Health() {
  const [status, setStatus] = useState("checking...");

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/health`);
        const data = await res.json();
        setStatus(
          data.status === "ok"
            ? "✅ Backend is healthy"
            : "⚠️ Unexpected response"
        );
      } catch (error) {
        console.error("Health check failed:", error);
        setStatus("❌ Backend is unreachable");
      }
    };

    checkHealth();
  }, []);

  return (
    <div>
      <div className="go-chat-button">
        <Link to="/">Chat Page</Link>
      </div>

      <div className="health-check-container">
        <h1>Health Check</h1>
        <p>Status: {status}</p>
      </div>
    </div>
  );
}

export default Health;
