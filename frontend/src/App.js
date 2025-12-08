import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import DashboardPage from './pages/DashboardPage';
import StoriesPage from './pages/StoriesPage';
import AdminPage from './pages/AdminPage';
import AdminProductsPage from './pages/AdminProductsPage';
import AdminStoriesPage from './pages/AdminStoriesPage';
import AdminLayout from './pages/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
    return (
        <ThemeProvider>
            <Router>
                <div className="App">
                    <Routes>
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
                            path="/admin/products" 
                            element={
                                <ProtectedRoute requireAdmin={true}>
                                    <AdminLayout>
                                        <AdminProductsPage />
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
                        
                        {/* Customer routes - allow guest access */}
                        <Route 
                            path="/" 
                            element={<DashboardPage />}
                        />
                        <Route 
                            path="/dashboard" 
                            element={<DashboardPage />}
                        />
                        <Route 
                            path="/stories" 
                            element={<StoriesPage />}
                        />
                    </Routes>
                </div>
            </Router>
        </ThemeProvider>
    );
}

export default App;
