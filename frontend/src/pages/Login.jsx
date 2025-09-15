import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import bg1 from '../images/background.png';
import bg3 from '../images/bg3.png';
import log11 from '../images/log11.png';
import flag from '../images/flag.png';
import rowdySheet from '../images/rowdy_sheet.png';
import apiService from '../services/api';

const Login = ({ setIsAuthenticated }) => {
    const navigate = useNavigate();
    const mobileInputRef = useRef(null);
    
    const [user, setUser] = useState({
        mobile_number: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (mobileInputRef.current) {
            mobileInputRef.current.focus();
        }
    }, []);

    const isNumber = (e) => {
        const keysAllowed = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
        const keyPressed = e.key;
        if (!keysAllowed.includes(keyPressed)) {
            e.preventDefault();
        }
    };

    const directLogin = async () => {
        if (!user.mobile_number || user.mobile_number.length !== 10) {
            setErrors({ mobile_number: ['Please enter a valid 10-digit mobile number'] });
            return;
        }

        setLoading(true);
        setErrors({});
        
        try {
            const response = await apiService.directLogin(user.mobile_number);
            
            if (response.success) {
                // Store user data and token
                localStorage.setItem('police_application_token', response.token);
                localStorage.setItem('police_application_user', JSON.stringify(response.user));
                
                setIsAuthenticated(true);
                navigate('/home');
                console.log('Login successful');
            } else {
                setErrors({ mobile_number: [response.message || 'Login failed. Please try again.'] });
            }
        } catch (error) {
            setErrors({ mobile_number: [error.message || 'Login failed. Please try again.'] });
        } finally {
            setLoading(false);
        }
    };


    const handleMobileKeyDown = (e) => {
        if (e.key === 'Enter') {
            directLogin();
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Login Form Section */}
            <div className="flex-1 max-w-2xl flex items-center justify-center px-4 py-8">
                <div className="w-full max-w-lg">
                    <div className="bg-white rounded-lg shadow-lg p-8 relative">
                                               
                        {/* Header */}
                        <div className="mb-8">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="relative">
                                    <img 
                                        src={rowdySheet} 
                                        alt="Police Logo" 
                                        className="w-16 h-16 object-contain"
                                    />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-800">Police Application</h1>
                                    <p className="text-sm text-gray-600">Crime Records Bureau, Bengaluru</p>
                                </div>
                            </div>
                            <h4 className="text-xl font-bold text-gray-800 mt-6">Login to your account!</h4>
                        </div>

                        {/* Mobile Number Input */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Phone Number
                            </label>
                            <div className="flex border-b-2 border-gray-200 focus-within:border-blue-500">
                                <div className="flex items-center px-3 bg-white text-gray-600 font-medium">
                                    +91-
                                </div>
                                <input
                                    ref={mobileInputRef}
                                    type="text"
                                    maxLength="10"
                                    value={user.mobile_number}
                                    onChange={(e) => setUser({...user, mobile_number: e.target.value})}
                                    onKeyPress={isNumber}
                                    onKeyDown={handleMobileKeyDown}
                                    placeholder="O O O O O O O O O O"
                                    className={`flex-1 px-3 py-4 border-0 bg-white text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-0 text-lg font-semibold tracking-widest ${
                                        errors.mobile_number ? 'text-red-600' : ''
                                    }`}
                                />
                                <div className="flex items-center px-3 bg-white">
                                    <img src={flag} alt="India" className="w-6 h-4" />
                                </div>
                            </div>
                            {errors.mobile_number && (
                                <p className="text-red-500 text-sm mt-1">{errors.mobile_number[0]}</p>
                            )}
                            
                            <div className="mt-4">
                                <button
                                    onClick={directLogin}
                                    disabled={loading || !user.mobile_number || user.mobile_number.length !== 10}
                                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {loading ? 'Logging in...' : 'Login'}
                                </button>
                            </div>
                        </div>


                    </div>
                     {/* Background Image */}
                     <img src={bg3} alt="" className="absolute bottom-2 left-0 w-24 h-18 sm:w-32 sm:h-24 md:w-40 md:h-30 lg:w-48 lg:h-36 opacity-15" />
                </div>
            </div>

            {/* Background Image Section */}
            <div className="hidden lg:block flex-1 relative">
                <img 
                    src={bg1} 
                    alt="Background" 
                    className="w-full h-full object-cover"
                />
            </div>
        </div>
    );
};

export default Login;
