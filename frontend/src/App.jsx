import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import RoadmapPage from './pages/RoadmapPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-neutral-950 text-neutral-50 font-sans selection:bg-purple-500/30">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/roadmap/:id" element={<RoadmapPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
