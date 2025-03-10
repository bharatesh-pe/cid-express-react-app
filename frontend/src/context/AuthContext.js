import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Create the AuthContext
export const AuthContext = createContext();

// AuthProvider Component
export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [token, setToken] = useState(localStorage.getItem("auth_token") || "");
  const [isAuthenticated, setAuthenticated] = useState(!!token); // Initial authentication state

  // Function to verify the token
  const verifyUserToken = async () => {
    try {
      // If the token exists and the path is "/", redirect to dashboard
      if (token && window.location.pathname === "/") {
        console.log("Token found. Redirecting to dashboard.");
        setAuthenticated(true);
        navigate("/dashboard");
        return;
      }

      // If no token and the path is "/", clear the token and set authentication to false
      if (!token && window.location.pathname === "/") {
        localStorage.removeItem("auth_token");
        setAuthenticated(false);
        return;
      }

      // If no token, clear the token, set authentication to false, and log the message
      if (!token) {
        localStorage.removeItem("auth_token");
        console.log(
          window.location.pathname + "---No token found. Redirecting to login."
        );
        setAuthenticated(false);
        navigate("/login");
        return;
      }

    } catch (error) {
      console.error("Error verifying token:", error);
      setAuthenticated(false);
      localStorage.removeItem("auth_token");
      navigate("/login");
    }
  };

  useEffect(() => {
    verifyUserToken();
  }, [token]);

  return (
    <AuthContext.Provider value={{ token, setToken, isAuthenticated, setAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const useAuth = () => useContext(AuthContext);
