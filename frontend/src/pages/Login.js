import React, { useState } from 'react';
import { TextField, Button, Box, Typography , Divider , Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import cidLogo from "../Images/cid_logo.png";
import OTPInputComponent from '../components/otp';
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";

import { CircularProgress } from "@mui/material";

const Login = () => {
    const [kgid, setKGID] = useState('');
    const [pin, setPin] = useState('');
    const [otp, setOtp] = useState('');
    const [validationError, setValidationError] = useState('');
    const [loading, setLoading] = useState(false); // State for loading indicator
    const navigate = useNavigate();
    const [showOtp, setShowOtp] = useState(false);
    const [showDesignation, setShowDesignation] = useState(false);
    const [designation, setDesignation] = useState([]);
    const [tempToken, setTempToken] = useState('');
    
    const handleSubmit = async (e) => {
        setValidationError('');
        e.preventDefault();
        setLoading(true);
       
        try {
           
            if(!kgid || !pin || isNaN(kgid) || isNaN(pin)){
                setValidationError('Please enter valid KGID and PIN');
                setLoading(false);
                return;
            }

            const serverURL = process.env.REACT_APP_SERVER_URL;
            const response = await fetch(`${serverURL}/auth/generate_OTP`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ kgid: kgid, pin: pin }),
            });
            
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message);
            }
            setShowOtp(true);
            setLoading(false);
        } catch (err) {
            //in err Error: You have exceeded the maximum number of attempts
            setLoading(false);
            setLoading(false);
            var errMessage = 'Something went wrong. Please try again.'
            if(err && err.message){
                errMessage = err.message;
            }
            setValidationError(errMessage);
        }
    }

    const verifyOtp = async (e) => {
        setValidationError('');
        e.preventDefault();
        setLoading(true);
        try {
            const serverURL = process.env.REACT_APP_SERVER_URL;
            const response = await fetch(`${serverURL}/auth/verify_OTP`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ kgid: kgid, otp: otp }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message);
            }

            console.log('data',data);
            console.log('data.user_designation',data.user_designation);


            if(data && data.users_designation){
                const users_designation = data.users_designation;
                console.log("users_designation",users_designation)
                if(users_designation.length === 1){
                    if(data && data.token){
                        localStorage.setItem('auth_token', data.token);
                        localStorage.setItem('kgid', kgid);
                        localStorage.setItem('username', data.userRole.name);
                        navigate('/dashboard');
                    }
                }
                else if(users_designation.length > 1){
                    if(data && data.token){
                        setTempToken(data.token);
                    }
                    setDesignation(users_designation);
                    setShowDesignation(true);
                }

            }

            
            setOtp('');
            setLoading(false);
            // setShowOtp(false);

        } catch (err) {
            setLoading(false);
            var errMessage = 'Something went wrong. Please try again.'
            if(err && err.message){
                errMessage = err.message;
            }
            setValidationError(errMessage);
        }
    }

    const resendOtp = async () => {
        setValidationError('');
        setLoading(true);
       
        try {
           
            if(!kgid || !pin || isNaN(kgid) || isNaN(pin)){
                setValidationError('Please enter valid KGID and PIN');
                setLoading(false);
                return;
            }

            const serverURL = process.env.REACT_APP_SERVER_URL;
            const response = await fetch(`${serverURL}/generateOtp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ kgid: kgid, pin: pin }),
            });

            const data = await response.json();
            if (!response.ok) {
               throw new Error(data.message);
            }
            setShowOtp(true);
            setLoading(false);
        } catch (err) {
            setLoading(false);
            var errMessage = 'Something went wrong. Please try again.'
            if(err && err.message){
                errMessage = err.message;
            }
            setValidationError(errMessage);
        }
    }

    const designationClick = (item) => {
        console.log("Clicked Item:", item); // Check if item is received correctly
        localStorage.setItem('auth_token', tempToken);
        localStorage.setItem('kgid', kgid);
        localStorage.setItem('designation_id', item.user_designation_id);
        localStorage.setItem('designation_name', item.designation_name);
        navigate("/dashboard");
    };


    return (
        <Box
            sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh", // Full viewport height
            }}
            >
           <Box sx={{ maxWidth: 400, margin: 'auto', padding: 3 }}  inert={loading ? true : false}>
                <Box
                    sx={{
                        padding: 1,
                        display: "flex",
                        gap: "10px",
                        alignItems: "center",
                        justifyContent: "center",
                        borderBottom: "1px solid #D0D5DD",
                    }}
                    >
                    <img
                        srcSet={`${cidLogo}?w=248&fit=crop&auto=format&dpr=2 2x`}
                        src={`${cidLogo}?w=248&fit=crop&auto=format`}
                        alt=""
                        loading="lazy"
                    />
                    <Divider
                        sx={{
                        height: "50px",
                        width: "1px",
                        backgroundColor: "#D0D5DD",
                        border: "none",
                        }}
                    />
                    <Typography className='poppins' align="left" variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                        Case Management
                        <br />
                        System
                    </Typography>
                    <Divider sx={{ marginTop: 1 }} />
                </Box>
                {validationError && <Typography color="error">{validationError}</Typography>}
                { !showOtp && <form onSubmit={handleSubmit}>
                    <TextField
                        label="KGID"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={kgid}
                        onChange={(e) => setKGID(e.target.value)}
                    />
                    {/* <OTPInputComponent length={6} value={otp} onChange={setOtp} /> */}
                    <TextField
                        label="PIN"
                        type="password"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={pin}
                        onChange={(e) => setPin(e.target.value)}
                    />
                    <Button type="submit" variant="contained" fullWidth sx={{ marginTop: 2 }}>
                        Generate OTP
                    </Button>
                </form> }

                { showOtp && <form onSubmit={verifyOtp}>
                    <Typography className='poppins' align="left" variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                        Enter OTP
                    </Typography>
                    <OTPInputComponent length={6} value={otp} onChange={setOtp} />
                  
                    <Button type="submit" variant="contained" fullWidth sx={{ marginTop: 2 }}>
                        Login
                    </Button>
                </form> }
                { !showOtp && <Box
                    sx={{
                        padding: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "end",
                        borderBottom: "1px solid #D0D5DD",
                        marginTop: 2,
                    }}
                    >
                        <Link href="#" underline="none">
                            {'Forgot Password?'}
                        </Link>
                       
                    </Box> }

                {  showOtp && <Box
                    sx={{
                        padding: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        borderBottom: "1px solid #D0D5DD",
                        marginTop: 2,
                    }}
                    >
                        <Link href="#" underline="none" onClick={() => resendOtp()}>
                            {'Resend OTP'}
                        </Link>
                    </Box>}
                {
                    loading &&  <div className='parent_spinner' tabIndex="-1" aria-hidden="true">
                                    <CircularProgress size={100} />
                                </div>
                }
            </Box>
            <Dialog
                    open={showDesignation}
                    keepMounted
                    onClose={() => setShowDesignation(false)}
                    aria-describedby="alert-dialog-slide-description"
                    maxWidth="xs"
                    fullWidth
                >
                    <DialogTitle>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Box>
                                <Typography variant="h3" style={{ fontWeight: '400', fontSize: '18px', color: '#1D2939' }}></Typography>
                                <Typography variant="h5" style={{ fontWeight: '600', fontSize: '24px', color: '#1D2939' }}>Choose Designation</Typography>
                            </Box>
                            <Box
                                p={1}
                                sx={{
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    cursor: "pointer",
                                    background: "#EAECF0",
                                    borderRadius: "50%",
                                }}
                            >
                                <svg
                                    onClick={() => setShowDesignation(false)}
                                    width="20"
                                    height="20"
                                    viewBox="0 0 20 20"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M14.6666 5.33447L5.33325 14.6678M5.33325 5.33447L14.6666 14.6678"
                                        stroke="#667085"
                                        strokeWidth="1.8"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </Box>
                        </Box>
                    </DialogTitle>
                    <DialogContent>
                        {designation.map((item) => (
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    padding: 2,
                                    border: "1px solid #EAECF0",
                                    borderRadius: "5px",
                                    marginBottom: 2,
                                    cursor: "pointer",
                                }}
                                 onClick={() => designationClick(item)}
                            >
                                <Box>
                                    <Typography variant="h6" style={{ fontWeight: '600', fontSize: '18px', color: '#1D2939' }}>{item.designation.designation_name}</Typography>
                                    <Typography variant="h6" style={{ fontWeight: '400', fontSize: '14px', color: '#667085' }}>{item.designation.description}</Typography>
                                </Box>
                            </Box>
                        ))}
                    </DialogContent>
                </Dialog>
        </Box>
        
    );
};

export default Login;
