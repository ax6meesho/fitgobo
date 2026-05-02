import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './pages/Auth';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import WorkoutGenerator from './pages/WorkoutGenerator';
import BMICalculator from './pages/BMICalculator';
import History from './pages/History';
import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './lib/firebase';

import DietSuggestions from './pages/DietSuggestions';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setUser(user);
        setLoading(false);
      });
      return unsubscribe;
    } catch (e) {
      setLoading(false);
    }
  }, []);

  if (loading) return (
    <div className="h-screen w-screen flex items-center justify-center bg-[#050505]">
      <div className="w-12 h-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <Router>
      <Routes>
        <Route path="/auth" element={user ? <Navigate to="/" /> : <Auth />} />
        <Route path="/onboarding" element={!user ? <Navigate to="/auth" /> : <Onboarding />} />
        <Route path="/" element={!user ? <Navigate to="/auth" /> : <Dashboard />} />
        <Route path="/workout" element={!user ? <Navigate to="/auth" /> : <WorkoutGenerator />} />
        <Route path="/bmi" element={!user ? <Navigate to="/auth" /> : <BMICalculator />} />
        <Route path="/diet" element={!user ? <Navigate to="/auth" /> : <DietSuggestions />} />
        <Route path="/history" element={!user ? <Navigate to="/auth" /> : <History />} />
      </Routes>
    </Router>
  );
}
