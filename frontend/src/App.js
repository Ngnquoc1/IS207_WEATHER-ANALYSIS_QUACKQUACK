import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import DashboardPage from './pages/DashboardPage';
import SearchPage from './pages/SearchPage';
import './App.css';

function App() {
    return (
        <ThemeProvider>
            <Router>
                <div className="App">
                    <Routes>
                        <Route path="/" element={<DashboardPage />} />
                        <Route path="/dashboard" element={<DashboardPage />} />
                        <Route path="/search" element={<SearchPage />} />
                    </Routes>
                </div>
            </Router>
        </ThemeProvider>
    );
}

export default App;
