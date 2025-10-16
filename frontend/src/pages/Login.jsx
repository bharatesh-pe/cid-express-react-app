import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiRefreshCw, FiCheck } from 'react-icons/fi';
import bg1 from '../images/background.png';
import bg3 from '../images/bg3.png';
import log11 from '../images/log11.png';
import flag from '../images/flag.png';
import rowdySheet from '../images/rowdy_sheet.png';
import apiService from '../services/api';
import { toast } from 'react-toastify';

const Login = ({ setIsAuthenticated }) => {
    const navigate = useNavigate();
    const mobileInputRef = useRef(null);
    
    const [user, setUser] = useState({
        mobile_number: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState('');
    const [adminMobile, setAdminMobile] = useState('');
    const [otpTimer, setOtpTimer] = useState(0);
    const [canResend, setCanResend] = useState(false);
    const otpInputRefs = useRef([]);

    useEffect(() => {
        if (mobileInputRef.current) {
            mobileInputRef.current.focus();
        }
    }, []);

    // OTP Timer effect
    useEffect(() => {
        let interval = null;
        if (otpTimer > 0) {
            interval = setInterval(() => {
                setOtpTimer(timer => timer - 1);
            }, 1000);
        } else if (otpTimer === 0 && otpSent) {
            setCanResend(true);
        }
        return () => clearInterval(interval);
    }, [otpTimer, otpSent]);

    // Focus first OTP input when OTP is sent
    useEffect(() => {
        if (otpSent && otpInputRefs.current[0]) {
            otpInputRefs.current[0].focus();
        }
    }, [otpSent]);

    // Auto-verify when OTP is complete
    useEffect(() => {
        if (otp.length === 6 && otpSent && !loading) {
            const timer = setTimeout(() => {
                verifyAdminOTP();
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [otp, otpSent, loading]);

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
                if (response.user.isAdmin) {
                    // Admin: send OTP
                    await apiService.sendOTP(user.mobile_number);
                    setOtpSent(true);
                    setAdminMobile(user.mobile_number);
                    setOtpTimer(60); // 60 seconds timer
                    setCanResend(false);
                    setOtp(''); // Reset OTP
                    toast.info('OTP sent to admin mobile number');
                } else {
                    // Non-admin: login directly
                    localStorage.setItem('police_application_token', response.token);
                    localStorage.setItem('police_application_user', JSON.stringify(response.user));
                    setIsAuthenticated(true);
                    navigate('/home');
                    toast.success('Login successful');
                }
            } else {
                setErrors({ mobile_number: [response.message || 'Login failed. Please try again.'] });
            }
        } catch (error) {
            setErrors({ mobile_number: [error.message || 'Login failed. Please try again.'] });
        } finally {
            setLoading(false);
        }
    };

    const verifyAdminOTP = async () => {
        if (otp.length !== 6) {
            setErrors({ otp: ['Please enter a complete 6-digit OTP'] });
            return;
        }

        setLoading(true);
        setErrors({});
        try {
            const response = await apiService.verifyOTP(adminMobile, otp);
            if (response.success) {
                localStorage.setItem('police_application_token', response.token);
                localStorage.setItem('police_application_user', JSON.stringify(response.user));
                setIsAuthenticated(true);
                navigate('/home');
                toast.success('Admin login successful');
            } else {
                setErrors({ otp: [response.message || 'Invalid OTP.'] });
                setOtp(''); // Clear OTP on error
            }
        } catch (error) {
            setErrors({ otp: [error.message || 'OTP verification failed.'] });
            setOtp(''); // Clear OTP on error
        } finally {
            setLoading(false);
        }
    };

    const resendOTP = async () => {
        setLoading(true);
        setErrors({});
        try {
            await apiService.sendOTP(adminMobile);
            setOtpTimer(60);
            setCanResend(false);
            setOtp('');
            toast.info('OTP resent successfully');
        } catch (error) {
            setErrors({ otp: [error.message || 'Failed to resend OTP'] });
        } finally {
            setLoading(false);
        }
    };

    const goBackToMobile = () => {
        setOtpSent(false);
        setOtp('');
        setOtpTimer(0);
        setCanResend(false);
        setErrors({});
        if (mobileInputRef.current) {
            mobileInputRef.current.focus();
        }
    };

    const handleMobileKeyDown = (e) => {
        if (e.key === 'Enter') {
            directLogin();
        }
    };

    const handleOTPChange = (index, value) => {
        if (value.length > 1) return; // Prevent multiple characters
        
        const newOtp = otp.split('');
        newOtp[index] = value;
        const otpString = newOtp.join('');
        
        // Auto-focus next input
        if (value && index < 5 && otpInputRefs.current[index + 1]) {
            otpInputRefs.current[index + 1].focus();
        }

        setOtp(otpString);
    };

    const handleOTPKeyDown = (index, e) => {
        // Handle backspace
        if (e.key === 'Backspace') {
            if (!otp[index] && index > 0 && otpInputRefs.current[index - 1]) {
                otpInputRefs.current[index - 1].focus();
            }
        }
        // Handle paste
        else if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            navigator.clipboard.readText().then(text => {
                const pastedOTP = text.replace(/\D/g, '').slice(0, 6);
                setOtp(pastedOTP);
                // Auto-verification will be handled by useEffect
            });
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
                                    <h1 className="text-3xl font-bold text-gray-800">BCP APPLICATIONS</h1>
                                    <p className="text-sm text-gray-600">Commissioner Of Police, Bengaluru</p>
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

                        {/* OTP Verification for Admin */}
                        {otpSent && (
                            <div className="mb-4">
                                {/* Back Button */}
                                <button
                                    onClick={goBackToMobile}
                                    className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 transition-colors"
                                >
                                    <FiArrowLeft className="w-4 h-4" />
                                    <span className="text-sm">Change mobile number</span>
                                </button>

                                {/* OTP Header */}
                                <div className="text-center mb-6">
                                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <FiCheck className="w-8 h-8 text-blue-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Enter Verification Code</h3>
                                    <p className="text-gray-600 text-sm">
                                        We've sent a 6-digit code to<br />
                                        <span className="font-medium text-gray-800">+91 {adminMobile}</span>
                                    </p>
                                </div>

                                {/* OTP Input Boxes */}
                                <div className="flex justify-center gap-3 mb-6">
                                    {[0, 1, 2, 3, 4, 5].map((index) => (
                                        <input
                                            key={index}
                                            ref={(el) => (otpInputRefs.current[index] = el)}
                                            type="text"
                                            maxLength="1"
                                            value={otp[index] || ''}
                                            onChange={(e) => handleOTPChange(index, e.target.value)}
                                            onKeyDown={(e) => handleOTPKeyDown(index, e)}
                                            className={`w-12 h-12 text-center text-lg font-bold border-2 rounded-lg focus:outline-none transition-all duration-200 ${
                                                errors.otp 
                                                    ? 'border-red-300 bg-red-50' 
                                                    : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                                            }`}
                                            style={{ caretColor: 'transparent' }}
                                        />
                                    ))}
                                </div>

                                {/* Error Message */}
                                {errors.otp && (
                                    <div className="text-center mb-4">
                                        <p className="text-red-500 text-sm">{errors.otp[0]}</p>
                                    </div>
                                )}

                                {/* Timer and Resend */}
                                <div className="text-center mb-6">
                                    {otpTimer > 0 ? (
                                        <p className="text-gray-600 text-sm">
                                            Resend code in{' '}
                                            <span className="font-medium text-blue-600">
                                                {Math.floor(otpTimer / 60)}:{(otpTimer % 60).toString().padStart(2, '0')}
                                            </span>
                                        </p>
                                    ) : (
                                        <button
                                            onClick={resendOTP}
                                            disabled={loading}
                                            className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors disabled:opacity-50"
                                        >
                                            Didn't receive code? Resend
                                        </button>
                                    )}
                                </div>

                                {/* Verify Button */}
                                <div className="mt-4">
                                    <button
                                        onClick={verifyAdminOTP}
                                        disabled={loading || otp.length !== 6}
                                        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                                    >
                                        {loading ? (
                                            <>
                                                <FiRefreshCw className="w-4 h-4 animate-spin" />
                                                Verifying...
                                            </>
                                        ) : (
                                            <>
                                                <FiCheck className="w-4 h-4" />
                                                Verify & Login
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}

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
