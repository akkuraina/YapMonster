import { Routes, Route } from "react-router-dom"; // Import Routes and Route
import Homepage from "./Pages/Homepage";
import Chatpage from "./Pages/Chatpage";

function App() {
  return (
    <div className="App">
      <Routes> {/* Wrap routes inside the Routes component */}
        <Route path="/" element={<Homepage />} /> {/* Use element prop to specify component */}
        <Route path="/chats" element={<Chatpage />} /> {/* Same here for Chatpage */}
      </Routes>
    </div>
  );
}

export default App;
