import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import OTPInput from '../components/OTPInput';
import bg1 from '../images/background.png';
import bg3 from '../images/bg3.png';
import log11 from '../images/log11.png';
import flag from '../images/flag.png';
import { FiRefreshCw } from 'react-icons/fi';

const Login = () => {
    const navigate = useNavigate();
    const mobileInputRef = useRef(null);
    
    const [user, setUser] = useState({
        mobile_no: '',
        otp: ''
    });
    const [errors, setErrors] = useState({});
    const [otpStatus, setOtpStatus] = useState(false);
    const [otpValue, setOtpValue] = useState('');
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

    const sendOtp = async () => {
        if (!user.mobile_no || user.mobile_no.length !== 10) {
            setErrors({ mobile_no: ['Please enter a valid 10-digit mobile number'] });
            return;
        }

        setLoading(true);
        setErrors({});
        
        try {
            // Simulate API call - replace with actual API endpoint
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            setOtpStatus(true);
            console.log('OTP sent to:', user.mobile_no);
        } catch (error) {
            setErrors({ mobile_no: ['Failed to send OTP. Please try again.'] });
        } finally {
            setLoading(false);
        }
    };

    const resendOtp = async () => {
        setLoading(true);
        setErrors({});
        
        try {
            // Simulate API call - replace with actual API endpoint
            await new Promise(resolve => setTimeout(resolve, 1000));
            console.log('OTP resent to:', user.mobile_no);
        } catch (error) {
            setErrors({ otp: ['Failed to resend OTP. Please try again.'] });
        } finally {
            setLoading(false);
        }
    };

    const verifyOtp = async () => {
        if (!otpValue || otpValue.length !== 6) {
            setErrors({ otp: ['Please enter a valid 6-digit OTP'] });
            return;
        }

        setLoading(true);
        setErrors({});
        
        try {
            // Simulate API call - replace with actual API endpoint
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Store user data and token (replace with actual API response)
            localStorage.setItem('user', JSON.stringify({ mobile_no: user.mobile_no }));
            localStorage.setItem('token', 'mock-jwt-token');
            
            // Navigate to home page
            navigate('/');
        } catch (error) {
            setErrors({ otp: ['Invalid OTP. Please try again.'] });
        } finally {
            setLoading(false);
        }
    };

    const handleMobileKeyDown = (e) => {
        if (e.key === 'Enter') {
            sendOtp();
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Login Form Section */}
            <div className="flex-1 max-w-2xl flex items-center justify-center px-4 py-8">
                <div className="w-full max-w-lg">
                    <div className="bg-white rounded-lg shadow-lg p-8 relative">
                        {/* Background Image */}
                        <img src={bg3} alt="" className="absolute top-0 left-0 w-40 h-30 opacity-15" />
                        
                        {/* Header */}
                        <div className="mb-8">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="relative">
                                    <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                                                <div className="w-4 h-4 bg-white rounded-full"></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                                        <div className="w-2 h-2 bg-white rounded-full"></div>
                                    </div>
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
                                    value={user.mobile_no}
                                    onChange={(e) => setUser({...user, mobile_no: e.target.value})}
                                    onKeyPress={isNumber}
                                    onKeyDown={handleMobileKeyDown}
                                    disabled={otpStatus}
                                    placeholder="O O O O O O O O O O"
                                    className={`flex-1 px-3 py-4 border-0 bg-white text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-0 text-lg font-semibold tracking-widest ${
                                        errors.mobile_no ? 'text-red-600' : ''
                                    }`}
                                />
                                <div className="flex items-center px-3 bg-white">
                                    <img src={flag} alt="India" className="w-6 h-4" />
                                </div>
                            </div>
                            {errors.mobile_no && (
                                <p className="text-red-500 text-sm mt-1">{errors.mobile_no[0]}</p>
                            )}
                            
                            {!otpStatus && (
                                <div className="text-right mt-2">
                                    <button
                                        onClick={sendOtp}
                                        disabled={loading || !user.mobile_no}
                                        className="text-blue-600 hover:text-blue-800 font-medium text-sm disabled:opacity-50"
                                    >
                                        REQUEST OTP
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* OTP Input */}
                        {otpStatus && (
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    OTP
                                </label>
                                <OTPInput
                                    value={otpValue}
                                    onChange={setOtpValue}
                                    onComplete={verifyOtp}
                                    className="mb-4"
                                />
                                {errors.otp && (
                                    <p className="text-red-500 text-sm mt-1">{errors.otp[0]}</p>
                                )}
                                
                                <div className="text-right mb-4">
                                    <button
                                        onClick={resendOtp}
                                        disabled={loading}
                                        className="text-gray-600 hover:text-gray-800 font-medium text-sm disabled:opacity-50 flex items-center gap-2 ml-auto"
                                    >
                                        <FiRefreshCw className="w-4 h-4" />
                                        RESEND THE OTP
                                    </button>
                                </div>
                                
                                <button
                                    onClick={verifyOtp}
                                    disabled={loading || !otpValue || otpValue.length !== 6}
                                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Verifying...' : 'Login To Continue'}
                                </button>
                            </div>
                        )}

                        {/* Decorative Seal */}
                        <div className="flex justify-center mt-8">
                            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center opacity-60">
                                <div className="text-center">
                                    <div className="text-xs font-semibold text-gray-600">SILICON VALLEY</div>
                                    <div className="text-xs font-semibold text-gray-600">OF INDIA</div>
                                    <div className="text-xs text-gray-500 mt-1">EST. 1537</div>
                                </div>
                            </div>
                        </div>
                    </div>
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
