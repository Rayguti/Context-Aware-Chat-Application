// import { useEffect, useState } from "react";

// function App() {
//   const [status, setStatus] = useState("checking...");

//   useEffect(() => {
//     const checkHealth = async () => {
//       try {
//         const res = await fetch(`${import.meta.env.VITE_API_URL}/health`);
//         const data = await res.json();
//         setStatus(data.status === "ok" ? "✅ Backend is healthy" : "⚠️ Unexpected response");
//       } catch (error) {
//         console.error("Health check failed:", error);
//         setStatus("❌ Backend is unreachable");
//       }
//     };

//     checkHealth();
//   }, []);

//   return (
//     <div style={{ padding: "2rem", fontFamily: "sans-serif", textAlign: "center" }}>
//       <h1>Health Check</h1>
//       <p>Status: {status}</p>
//     </div>
//   );
// }

// export default App;

import { BrowserRouter, Routes, Route } from "react-router-dom";
import ChatBox from "./pages/ChatBox/ChatBox";
import Health from "./pages/Health/Health";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ChatBox />} />
        <Route path="/health" element={<Health />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
