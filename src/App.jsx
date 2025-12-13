import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Workout from "./pages/Workout";
import { Toaster } from 'react-hot-toast';
import Navbar from "./components/Navbar";
import Layout from "./components/Layout";

function App() {
  return (
    <Router>
      <Layout>
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: '#18181b',
              color: '#fff',
              border: '1px solid #27272a',
              fontFamily: 'Inter, sans-serif',
            },
            success: {
              iconTheme: {
                primary: '#22c55e',
                secondary: '#000',
              },
            },
          }}
        />
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/workout/:routineId" element={<Workout />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
