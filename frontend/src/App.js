import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import DashboardPage from './pages/DashboardPage';
import AdminPage from './pages/AdminPage';
import AdminStoriesPage from './pages/AdminStoriesPage';
import AdminLayout from './pages/AdminLayout';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
    return (
        <ThemeProvider>
            <Router>
                <div className="App">
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        
                        {/* Admin routes with layout */}
                        <Route 
                            path="/admin/users" 
                            element={
                                <ProtectedRoute requireAdmin={true}>
                                    <AdminLayout>
                                        <AdminPage />
                                    </AdminLayout>
                                </ProtectedRoute>
                            } 
                        />
                        <Route 
                            path="/admin/stories" 
                            element={
                                <ProtectedRoute requireAdmin={true}>
                                    <AdminLayout>
                                        <AdminStoriesPage />
                                    </AdminLayout>
                                </ProtectedRoute>
                            } 
                        />
                        
                        {/* Default admin route */}
                        <Route 
                            path="/admin" 
                            element={
                                <ProtectedRoute requireAdmin={true}>
                                    <AdminLayout>
                                        <AdminPage />
                                    </AdminLayout>
                                </ProtectedRoute>
                            } 
                        />
                        
                        {/* Customer routes */}
                        <Route 
                            path="/" 
                            element={
                                <ProtectedRoute>
                                    <DashboardPage />
                                </ProtectedRoute>
                            } 
                        />
                        <Route 
                            path="/dashboard" 
                            element={
                                <ProtectedRoute>
                                    <DashboardPage />
                                </ProtectedRoute>
                            } 
                        />
                    </Routes>
                </div>
            </Router>
        </ThemeProvider>
    );
}

export default App;
