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
