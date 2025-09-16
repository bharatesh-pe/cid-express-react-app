import { Navigate } from 'react-router-dom';
import { isAdmin } from '../utils/auth';

const AdminRoute = ({ children }) => {
    if (!isAdmin()) {
        // Redirect non-admin users to home page
        return <Navigate to="/home" replace />;
    }
    
    return children;
};

export default AdminRoute;
