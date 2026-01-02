import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import SymptomAnalyzer from './pages/SymptomAnalyzer';
import MentalHealth from './pages/MentalHealth';
import Emergency from './pages/Emergency';
import History from './pages/History';
import Analytics from './pages/Analytics';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/symptoms" element={<SymptomAnalyzer />} />
        <Route path="/mental-health" element={<MentalHealth />} />
        <Route path="/emergency" element={<Emergency />} />
        <Route path="/history" element={<History />} />
        <Route path="/analytics" element={<Analytics />} />
      </Routes>
    </Router>
  );
}

export default App;
