import { Routes, Route } from "react-router-dom";

import Home from "./pages/MapHome";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Interests from "./pages/Interests";
import Events from "./pages/Events";
import Profile from "./pages/Profile";
import Navbar from "./components/Navbar";

function App() {
  return (
    <>
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/intereses" element={<Interests />} />
          <Route path="/events" element={<Events />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </main>
    </>
  );
}

export default App;