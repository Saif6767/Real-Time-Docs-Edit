import { Navigate } from "react-router-dom";

/**
 * PrivateRoute: Only allows access if user is authenticated.
 * Usage: wrap your protected component with <PrivateRoute>
 *
 * Example:
 * <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
 */
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token"); // JWT token ya auth token

  if (!token) {
    // User not logged in, redirect to login page
    return <Navigate to="/login" replace />;
  }

  // User logged in, render the children
  return children;
};

export default PrivateRoute;
