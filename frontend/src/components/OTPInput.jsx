import { useState, useRef, useEffect } from 'react';

const OTPInput = ({ numInputs = 6, value, onChange, onComplete, className = "", ...props }) => {
    const [otp, setOtp] = useState(new Array(numInputs).fill(''));
    const inputRefs = useRef([]);

    useEffect(() => {
        if (value && value !== otp.join('')) {
            const newOtp = value.split('').slice(0, numInputs);
            const paddedOtp = [...newOtp, ...new Array(numInputs - newOtp.length).fill('')];
            setOtp(paddedOtp);
        }
    }, [value, numInputs]);

    // Call onChange after state update
    useEffect(() => {
        const otpValue = otp.join('');
        onChange?.(otpValue);
    }, [otp, onChange]);

    const handleChange = (index, value) => {
        // Only allow numeric input for OTP
        if (value && !/^[0-9]$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        const otpValue = newOtp.join('');

        // Only auto-complete when the last digit (6th) is entered
        if (value && index === numInputs - 1 && otpValue.length === numInputs && newOtp.every(digit => digit !== '')) {
            onComplete?.(otpValue);
        }

        // Move to next input
        if (value && index < numInputs - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, numInputs);
        // Only allow numeric characters
        const numericData = pastedData.replace(/[^0-9]/g, '');
        const newOtp = numericData.split('');
        const paddedOtp = [...newOtp, ...new Array(numInputs - newOtp.length).fill('')];
        setOtp(paddedOtp);
        
        const otpValue = paddedOtp.join('');
        
        // Only auto-complete if all 6 digits are pasted and none are empty
        if (otpValue.length === numInputs && paddedOtp.every(digit => digit !== '')) {
            onComplete?.(otpValue);
        }
    };

    return (
        <div className={`flex justify-center gap-2 ${className}`}>
            {otp.map((digit, index) => (
                <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9a-zA-Z]*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className="w-12 h-12 text-center text-lg font-semibold border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    {...props}
                />
            ))}
        </div>
    );
};

export default OTPInput;
