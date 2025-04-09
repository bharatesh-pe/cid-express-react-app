import React, { useState } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
  Divider,
  Link,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import cidLogo from "../Images/cid_logo.png";
import OTPInputComponent from "../components/otp";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";

import { CircularProgress } from "@mui/material";

const Login = () => {
    const [kgid, setKGID] = useState('');
    const [pin, setPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [otp, setOtp] = useState('');
    const [validationError, setValidationError] = useState('');
    const [loading, setLoading] = useState(false); // State for loading indicator
    const navigate = useNavigate();
    const [showOtp, setShowOtp] = useState(false);
    const [showDesignation, setShowDesignation] = useState(false);
    const [user_position, setUserPosition] = useState([]);
    const [tempToken, setTempToken] = useState('');
    const [forgotPassword, setForgotPassword] = useState(false);
    const [forgotVerifyOtp, setForgotVerifyOtp] = useState(false);
    const [forgotPin, setForgotPin] = useState(false);
    const [usersDesignations, setUsersDesignations] = useState({});
  	const [usersDivision, setUsersDivision] = useState({});
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
    const handleForgotPin = async (e) => {
        setValidationError('');
        e.preventDefault();
        setLoading(true);
       
        try {
           
            if(!kgid || isNaN(kgid)){
                setValidationError('Please enter valid KGID');
                setLoading(false);
                return;
            }

            const serverURL = process.env.REACT_APP_SERVER_URL;
            const response = await fetch(`${serverURL}/auth/generate_OTP_without_pin`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ kgid: kgid}),
            });
            
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message);
            }
            setShowOtp(false);
            setForgotVerifyOtp(true);
            setForgotPassword(false);
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
    

    const handleforgotOtpVerify = async (e) => {
        setValidationError('');
        e.preventDefault();
        setLoading(true);
       
        try {
            const serverURL = process.env.REACT_APP_SERVER_URL;
            const response = await fetch(`${serverURL}/auth/verify_OTP_without_pin`, {
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
            setShowOtp(false);
            setForgotVerifyOtp(false);
            setForgotPassword(false);
            setForgotPin(true);
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

    const handleforgotPinLogin = async (e) => {
        setValidationError('');
        e.preventDefault();
        setLoading(true);
    
        try {
            const serverURL = process.env.REACT_APP_SERVER_URL;
            const response = await fetch(`${serverURL}/auth/update_pin`, {
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
            if(data && data.success){
              toast.success(data.message || "PIN updated Successfully", {
                  position: "top-right",
                  autoClose: 3000,
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: true,
                  draggable: true,
                  progress: undefined,
                  className: "toast-success",
                 onOpen: () => {
                  setShowOtp(false);
                  setForgotVerifyOtp(false);
                  setForgotPassword(false);
                  setForgotPin(false);
                  setLoading(false);
                  setConfirmPin('');
                  setPin('');
                  setKGID('');
                  setOtp('');
                },
              });
          }
        } catch (err) {
            const errMessage = err?.message || 'Something went wrong. Please try again.';
            setValidationError(errMessage);
        }
        finally{
            setLoading(false);
        }
    };    
    
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

            // console.log('data',data);
            // console.log('data.user_position',data.user_position);
            // console.log('data.user_role_permissions',data.user_role_permissions);

      if (data && data.users_division) {
        setUsersDivision(data.users_division);
      }

      if (data && data.user_position) {
        const user_position = data.user_position;
        if (user_position.length === 1) {
          if (data && data.token) {
            localStorage.setItem("auth_token", data.token);
            localStorage.setItem("kgid", kgid);
            localStorage.setItem("username", data.user_detail.name);

            if (
              data.users_designation[0] &&
              data.users_designation[0].designation &&
              data.users_designation[0].designation.designation_name &&
              data.users_designation[0].designation_id
            ) {
              localStorage.setItem(
                "designation_id",
                data.users_designation[0].designation_id
              );
              localStorage.setItem(
                "designation_name",
                data.users_designation[0].designation.designation_name
              );
            }

            if (
              data.users_division[0] &&
              data.users_division[0].division &&
              data.users_division[0].division.division_name &&
              data.users_division[0].division_id
            ) {
              localStorage.setItem(
                "division_id",
                data.users_division[0].division_id
              );
              localStorage.setItem(
                "division_name",
                data.users_division[0].division.division_name
              );
            }

            navigate("/dashboard");
          }
        } else if (user_position.length > 1) {
          if (data && data.token) {
            localStorage.setItem("auth_token", data.token);
            localStorage.setItem("kgid", kgid);
            localStorage.setItem("username", data.user_detail.name);
            setTempToken(data.token);
          }
          setUserPosition(user_position);
          setShowDesignation(true);
        }
      }

      setOtp("");
      setLoading(false);
      // setShowOtp(false);
    } catch (err) {
      setLoading(false);
      var errMessage = "Something went wrong. Please try again.";
      if (err && err.message) {
        errMessage = err.message;
      }
      setValidationError(errMessage);
    }
  };

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
    localStorage.setItem("auth_token", tempToken);
    localStorage.setItem("kgid", kgid);

    for (let i = 0; i < usersDesignations.length; i++) {
      if (
        usersDesignations[i] &&
        usersDesignations[i].designation &&
        usersDesignations[i].designation_id &&
        usersDesignations[i].designation.designation_name &&
        usersDesignations[i].designation.designation_name == item.designation
      ) {
        localStorage.setItem(
          "designation_id",
          usersDesignations[i].designation_id
        );
        localStorage.setItem(
          "designation_name",
          usersDesignations[i].designation.designation_name
        );
      }
    }

    for (let i = 0; i < usersDivision.length; i++) {
      if (
        usersDivision[i] &&
        usersDivision[i].division &&
        usersDivision[i].division_id &&
        usersDivision[i].division.division_name &&
        usersDivision[i].division.division_name == item.division
      ) {
        localStorage.setItem("division_id", usersDivision[i].division_id);
        localStorage.setItem(
          "division_name",
          usersDivision[i].division.division_name
        );
      }
    }
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
                { !showOtp && !forgotPassword && !forgotVerifyOtp && !forgotPin && <form onSubmit={handleSubmit}>
                    <TextField
                        label="KGID"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={kgid}
                        onChange={(e) => {
                            const value = e.target.value;
                            if (/^\d*$/.test(value)) {
                                setKGID(value);
                            }
                        }}
                        inputProps={{ maxLength: 10 }}
                    />
                    {/* <OTPInputComponent length={6} value={otp} onChange={setOtp} /> */}
                    <TextField
                        label="PIN"
                        type="password"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={pin}
                        onChange={(e) => {
                            const value = e.target.value;
                            if (/^\d*$/.test(value)) {
                                setPin(value);
                            }
                        }}
                    />
                    <Button type="submit" variant="contained" fullWidth sx={{ marginTop: 2 }}>
                        Generate OTP
                    </Button>
                </form> }
                {!showOtp && forgotPassword && (
                    <form onSubmit={handleForgotPin}>
                        <TextField
                            label="KGID"
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            value={kgid}
                            onChange={(e) => {
                                const value = e.target.value;
                                if (/^\d*$/.test(value)) {
                                    setKGID(value);
                                }
                            }}
                            inputProps={{ maxLength: 10 }}
                        />
                        <Button type="submit" variant="contained" fullWidth sx={{ marginTop: 2 }}>
                            Generate OTP
                        </Button>
                    </form>
                )}

                { showOtp && <form onSubmit={verifyOtp}>
                    <Typography className='poppins' align="left" variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                        Enter OTP
                    </Typography>
                    <OTPInputComponent length={6} value={otp} onChange={setOtp} />
                  
                    <Button type="submit" variant="contained" fullWidth sx={{ marginTop: 2 }}>
                        Login
                    </Button>
                </form> }
                { !showOtp && forgotVerifyOtp && <form onSubmit={handleforgotOtpVerify}>
                    <Typography className='poppins' align="left" variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                        Enter OTP
                    </Typography>
                    <OTPInputComponent length={6} value={otp} onChange={setOtp} />
                  
                    <Button type="submit" variant="contained" fullWidth sx={{ marginTop: 2 }}>
                        Verify Otp
                    </Button>
                </form> }

                { !showOtp && !forgotPassword && !forgotVerifyOtp && forgotPin && <form onSubmit={handleforgotPinLogin}>
                    <TextField
                        label="PIN"
                        type="password"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={pin}
                        onChange={(e) => {
                            const value = e.target.value;
                            if (/^\d*$/.test(value)) {
                                setPin(value);
                            }
                        }}
                    />
                    <TextField
                        label="Confirm PIN"
                        type="password"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={confirmPin}
                        onChange={(e) => {
                            const value = e.target.value;
                            if (/^\d*$/.test(value)) {
                                setConfirmPin(value);
                            }
                        }}
                    />

                    <Button type="submit" variant="contained" fullWidth sx={{ marginTop: 2 }}>
                        Update Pin
                    </Button>

                </form> }

                { !showOtp && !forgotPassword && !forgotVerifyOtp && !forgotPin && <Box
                    sx={{
                        padding: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "end",
                        borderBottom: "1px solid #D0D5DD",
                        marginTop: 2,
                    }}
                    >
                       <Link href="#" underline="none" onClick={() => setForgotPassword(true)}>
                            {'Forgot Pin?'}
                        </Link>
                       
                    </Box> }
                { !showOtp && forgotPassword && <Box
                    sx={{
                        padding: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "end",
                        borderBottom: "1px solid #D0D5DD",
                        marginTop: 2,
                    }}
                >
                    <Link 
                        href="#" 
                        underline="none" 
                        onClick={() => {
                            setForgotPassword(false);
                            setValidationError('');
                            setKGID('');
                            setPin('');
                            setOtp('');
                        }}
                        sx={{ color: "red" }}auth
                    >
                        {'Cancel'}
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

                    {  !showOtp && forgotVerifyOtp && <Box
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
                                <Typography variant="h5" style={{ fontWeight: '600', fontSize: '24px', color: '#1D2939' }}>Choose your position</Typography>
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
                        {user_position.map((item) => (
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
                                    <Typography variant="h6" style={{ fontWeight: '600', fontSize: '18px', color: '#1D2939' }}>{item.designation}</Typography>
                                    <Typography variant="h6" style={{ fontWeight: '400', fontSize: '14px', color: '#667085' }}>{item.division}</Typography>
                                </Box>
                            </Box>
                        ))}
                    </DialogContent>
                </Dialog>
        </Box>
        
    );
};

export default Login;