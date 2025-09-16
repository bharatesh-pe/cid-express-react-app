import siimsLogo from '../images/siims_logo.svg'
import rowdySheet from '../images/rowdy_sheet.png'
import fireEmergency from '../images/fire_emergency.png'
import cidLogo from '../images/cid.png'

import background from '../images/background.png'

import { FiArrowRight, FiLogOut, FiRefreshCw, FiUsers, FiSettings } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import apiService from '../services/api';
import { isAdmin } from '../utils/auth';

const Home = ({ setIsAuthenticated }) => {
    const navigate = useNavigate();
    const [applications, setApplications] = useState([]);
    const [userApplications, setUserApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [user, setUser] = useState(null);
    const [loggingOut, setLoggingOut] = useState(false);

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Get user data from localStorage
            const storedUser = apiService.getStoredUser();
            if (!storedUser) {
                navigate('/');
                return;
            }
            setUser(storedUser);

            // Fetch all applications
            const applicationsResponse = await apiService.getApplications();
            setApplications(applicationsResponse.data || []);

            // Filter applications based on user's access
            const userAppCodes = storedUser.applications || [];
            const accessibleApplications = applicationsResponse.data?.filter(app => 
                userAppCodes.includes(app.code)
            ) || [];
            
            setUserApplications(accessibleApplications);

        } catch (error) {
            console.error('Error fetching user data:', error);
            setError('Failed to load applications. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        setLoggingOut(true);
        try {
            await apiService.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Add a small delay for smooth transition
            setTimeout(() => {
                apiService.clearAuthData();
                setIsAuthenticated(false);
                navigate('/', { replace: true });
            }, 300);
        }
    };


    const handleApplicationClick = async (application) => {
        try {
            // Get user's mobile number from stored user data
            const storedUser = apiService.getStoredUser();
            if (!storedUser || !storedUser.mobile_number) {
                console.error('User mobile number not found');
                window.open(application.link, '_blank', 'noopener,noreferrer');
                return;
            }

            // Generate encrypted token for mobile number and source
            const response = await apiService.generateEncryptedToken(application.code);
            
            if (response.success && response.token) {
                // Create URL with encrypted token parameter
                const urlWithToken = `${application.link}?token=${encodeURIComponent(response.token)}`;
                
                // Open application in new tab with encrypted token
                window.open(urlWithToken, '_blank', 'noopener,noreferrer');
            } else {
                console.error('Failed to generate encrypted token:', response.message);
                // Fallback to regular link
                window.open(application.link, '_blank', 'noopener,noreferrer');
            }
        } catch (error) {
            console.error('Error opening application:', error);
            // Fallback to regular link
            window.open(application.link, '_blank', 'noopener,noreferrer');
        }
    };

    const renderApplicationCard = (application) => (
        <div
            key={application.id}
            onClick={() => handleApplicationClick(application)}
            className="p-4 bg-white group border border-gray-200 rounded-lg shadow-sm hover:shadow-md hover:border-blue-400 transition-all duration-200 flex flex-col justify-between h-[130px] cursor-pointer"
        >
            <div className="flex items-center gap-3">
                <img
                    src={`src${application.image}` || siimsLogo}
                    className="w-[36px] h-[36px] object-contain"
                    alt={application.code}
                />
                <h2 className="text-md font-medium text-gray-800 group-hover:text-blue-700 transition line-clamp-2">
                    {application.code}
                </h2>
            </div>
            <div className="mt-4 flex justify-end items-center">
                <span className="text-md text-blue-600 group-hover:underline font-semibold">
                    View Application
                </span>
                <FiArrowRight className="text-blue-600 group-hover:text-blue-800 text-lg transition-transform group-hover:translate-x-1 mt-1" />
            </div>
        </div>
    );

    const renderLoadingState = () => (
        <div className="flex items-center justify-center py-20">
            <div className="flex items-center gap-3">
                <FiRefreshCw className="w-6 h-6 animate-spin text-white" />
                <span className="text-white text-lg">Loading applications...</span>
            </div>
        </div>
    );

    const renderErrorState = () => (
        <div className="flex flex-col items-center justify-center py-20">
            <div className="text-center">
                <p className="text-red-300 text-lg mb-4">{error}</p>
                <button
                    onClick={fetchUserData}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
                >
                    <FiRefreshCw className="w-4 h-4" />
                    Try Again
                </button>
            </div>
        </div>
    );

    const divider = ()=>{
        return (
            <div className="flex justify-between items-center my-8">
                {[...Array(30)].map((_, idx) => (
                    <div key={idx} className="w-6 h-[2px] bg-gray-100 rounded" />
                ))}
            </div>
        )
    }

    return (
        <div className={`relative min-h-screen transition-opacity duration-300 ${loggingOut ? 'opacity-50' : 'opacity-100'}`}>

            <div
                className="absolute inset-0 bg-cover bg-center z-0"
                style={{ backgroundImage: `url(${background})` }}
            />
            
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70 z-10" />

            <div className="relative z-20 text-white">
                {/* Enhanced Navbar */}
                <nav className="bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200/50 sticky top-0 z-30">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16">
                            {/* Logo and Title */}
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-3">
                                    <img src={siimsLogo} className="w-10 h-10 object-contain" alt="SIIMS Logo" />
                                    <div>
                                        <h1 className="text-xl font-bold text-gray-800 uppercase tracking-wide">
                                            Police Application
                                        </h1>
                                        <p className="text-xs text-gray-500 uppercase tracking-wider">
                                            SIIMS Portal
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* User Info and Actions */}
                            <div className="flex items-center gap-4">
                                {/* User Info */}
                                {user && (
                                    <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-lg">
                                        <div className="text-right">
                                            <p className="text-sm font-medium text-gray-800">
                                                {user.user_name}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {user.isAdmin ? 'Administrator' : 'User'}
                                            </p>
                                        </div>
                                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                            <span className="text-white text-sm font-semibold">
                                                {user.user_name ? user.user_name.charAt(0).toUpperCase() : 'U'}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* Logout Button */}
                                <button
                                    onClick={handleLogout}
                                    disabled={loggingOut}
                                    className={`flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all duration-300 border border-red-200 hover:border-red-300 ${
                                        loggingOut ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                                >
                                    {loggingOut ? (
                                        <>
                                            <FiRefreshCw className="w-4 h-4 animate-spin" />
                                            <span className="hidden sm:inline">Logging out...</span>
                                        </>
                                    ) : (
                                        <>
                                            <FiLogOut className="w-4 h-4" />
                                            <span className="hidden sm:inline">Logout</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </nav>

                <div className="px-6 py-10 max-w-6xl mx-auto">
                    {/* Welcome Message */}
                    {user && (
                        <div className="mb-8 text-center">
                            <h2 className="text-2xl font-bold text-white mb-2">
                                Welcome back, {user.user_name}!
                            </h2>
                            <p className="text-gray-300 text-sm">
                                You have access to {user.applications ? user.applications.length : 0} application(s)
                            </p>
                        </div>
                    )}

                    {/* Admin Management Section - Temporarily Hidden */}
                    {/* {!loading && !error && isAdmin() && (
                        <div className="mb-10">
                            <h4 className="text-xl font-bold text-gray-100 mb-4 uppercase">
                                Admin Management
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div 
                                    onClick={() => navigate('/admin/users')}
                                    className="group cursor-pointer bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6 hover:bg-white/20 transition-all duration-300 hover:scale-105"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/30 transition-colors">
                                            <FiUsers className="w-6 h-6 text-blue-400" />
                                        </div>
                                        <div>
                                            <h5 className="text-lg font-semibold text-white group-hover:text-blue-300 transition-colors">
                                                User Management
                                            </h5>
                                            <p className="text-gray-300 text-sm">
                                                Add, edit, and manage user accounts
                                            </p>
                                        </div>
                                        <FiArrowRight className="w-5 h-5 text-gray-400 ml-auto group-hover:text-white group-hover:translate-x-1 transition-all" />
                                    </div>
                                </div>

                                <div 
                                    onClick={() => navigate('/admin/applications')}
                                    className="group cursor-pointer bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6 hover:bg-white/20 transition-all duration-300 hover:scale-105"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-green-500/20 rounded-lg group-hover:bg-green-500/30 transition-colors">
                                            <FiSettings className="w-6 h-6 text-green-400" />
                                        </div>
                                        <div>
                                            <h5 className="text-lg font-semibold text-white group-hover:text-green-300 transition-colors">
                                                Application Management
                                            </h5>
                                            <p className="text-gray-300 text-sm">
                                                Add, edit, and manage applications
                                            </p>
                                        </div>
                                        <FiArrowRight className="w-5 h-5 text-gray-400 ml-auto group-hover:text-white group-hover:translate-x-1 transition-all" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )} */}

                    {/* Loading State */}
                    {loading && renderLoadingState()}

                    {/* Error State */}
                    {error && !loading && renderErrorState()}

                    {/* Applications */}
                    {!loading && !error && userApplications.length > 0 && (
                        <div className="mb-10">
                            <h4 className="text-xl font-bold text-gray-100 mb-4 uppercase">
                                Your Accessible Applications
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                {userApplications.map(renderApplicationCard)}
                            </div>
                        </div>
                    )}

                    {/* No Applications Message */}
                    {!loading && !error && userApplications.length === 0 && (
                        <div className="text-center py-20">
                            <p className="text-gray-300 text-lg mb-4">
                                You don't have access to any applications yet.
                            </p>
                            <p className="text-gray-400 text-sm">
                                Please contact your administrator to assign application access.
                            </p>
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
};

export default Home;
