import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Welcome from './components/Welcome';
import DataSources from './components/DataSources';
import Mapping from './components/Mapping';
import GraphVisualization from './components/GraphVisualization';
import './App.css';

interface User {
  id: string;
  username: string;
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const userData = localStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData: User, token: string) => {
    setUser(userData);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Router>
      <div className="App">
        <nav className="navbar">
          <div className="nav-brand">HarmonyGraph</div>
          <div className="nav-links">
            <a href="/welcome">Welcome</a>
            <a href="/datasources">Data Sources</a>
            <a href="/mapping">Mapping</a>
            <a href="/graph">Graph</a>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </div>
        </nav>
        
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/welcome" />} />
            <Route path="/welcome" element={<Welcome user={user} />} />
            <Route path="/datasources" element={<DataSources />} />
            <Route path="/mapping" element={<Mapping />} />
            <Route path="/graph" element={<GraphVisualization />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;