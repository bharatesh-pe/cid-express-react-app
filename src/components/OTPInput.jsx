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

    const handleChange = (index, value) => {
        if (value && !/^[0-9a-zA-Z]$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        const otpValue = newOtp.join('');
        onChange?.(otpValue);

        if (otpValue.length === numInputs && newOtp.every(digit => digit !== '')) {
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
        const newOtp = pastedData.split('');
        const paddedOtp = [...newOtp, ...new Array(numInputs - newOtp.length).fill('')];
        setOtp(paddedOtp);
        
        const otpValue = paddedOtp.join('');
        onChange?.(otpValue);
        
        if (otpValue.length === numInputs) {
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
