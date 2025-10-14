import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";

import { Home, Login, UserManagement, ApplicationManagement, AnalyticsViewer } from "./pages";
import AdminRoute from "./components/AdminRoute";
import apiService from "./services/api";

const App = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is authenticated
        const checkAuth = async () => {
            try {
                if (apiService.isAuthenticated()) {
                    // Verify token with backend
                    await apiService.getProfile();
                    setIsAuthenticated(true);
                } else {
                    setIsAuthenticated(false);
                }
            } catch (error) {
                // Token is invalid, clear auth data
                apiService.clearAuthData();
                setIsAuthenticated(false);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <Router>
            <Routes>
                <Route 
                    path="/" 
                    element={isAuthenticated ? <Navigate to="/home" replace /> : <Login setIsAuthenticated={setIsAuthenticated} />} 
                />
                <Route 
                    path="/home" 
                    element={isAuthenticated ? <Home setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/" replace />} 
                />
                <Route 
                    path="/admin/users" 
                    element={isAuthenticated ? (
                        <AdminRoute>
                            <UserManagement setIsAuthenticated={setIsAuthenticated} />
                        </AdminRoute>
                    ) : <Navigate to="/" replace />} 
                />
                <Route 
                    path="/admin/applications" 
                    element={isAuthenticated ? (
                        <AdminRoute>
                            <ApplicationManagement setIsAuthenticated={setIsAuthenticated} />
                        </AdminRoute>
                    ) : <Navigate to="/" replace />} 
                />
                <Route 
                    path="/analytics-viewer" 
                    element={<AnalyticsViewer />} 
                />
            </Routes>
        </Router>
    );
};

export default App;
