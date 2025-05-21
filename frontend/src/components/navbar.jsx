import React, { useEffect, useState } from "react";
import { AppBar, Toolbar, InputBase, IconButton, Box, TextField, InputAdornment, Badge, Button, CircularProgress, Dialog, DialogTitle, DialogContent, DialogContentText } from "@mui/material";
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from '@mui/icons-material/Close';
import Slide from '@mui/material/Slide';
import api from "../services/api";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

export default function Navbar({ unreadNotificationCount }) {

    const [loading, setLoading] = useState(false);

    const [notificationCount, setNotificationCount] = useState(unreadNotificationCount);

    const [showAlertPage, setShowAlertPage] = useState(false);
    const [alertOverllData, setAlertOverallData] = useState([]);

    const [approvalModalShow, setApprovalModalShow] = useState(false);
    const [indivitualApprovalData, setIndivitualApprovalData] = useState({});

    const showAlertUX = ()=> {
        setShowAlertPage(true);
        getOverallAlertData();
    }

    const closeAlertPage = ()=> {
        setShowAlertPage(false);
    }

    const getOverallAlertData = async ()=>{

        var alertsPayload = {
            "user_designation_id" : localStorage.getItem("designation_id") ? localStorage.getItem("designation_id") : '',
            "user_division_id" :  localStorage.getItem("division_id") ? localStorage.getItem("division_id") : '',
        }

        setLoading(true);

        try {
            const overallAlertsData = await api.post("/ui_approval/get_alert_notification", alertsPayload);

            setLoading(false);

            if (overallAlertsData && overallAlertsData.success && overallAlertsData.data) { 

                setAlertOverallData(overallAlertsData.data);

            } else {
                const errorMessage = overallAlertsData.message ? overallAlertsData.message : "Failed to add approval. Please try again.";
                toast.error(errorMessage, {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    className: "toast-error",
                });

            }

        } catch (error) {
            setLoading(false);
            if (error && error.response && error.response['data']) {
                toast.error(error.response['data'].message ? error.response['data'].message : 'Please Try Again !', {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    className: "toast-error",
                });

            }
        }
    }

    const showIndivitualAlert = async (data) =>{

        if(!data.approval_id){
            toast.error("Approval ID not found", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                className: "toast-error",
            });
            return;
        }

        var indivitualAlertsPayload = {
            "approval_id" : data.approval_id,
            "user_designation_id" : localStorage.getItem("designation_id") ? localStorage.getItem("designation_id") : '',
            "user_division_id" :  localStorage.getItem("division_id") ? localStorage.getItem("division_id") : '',
        }

        setLoading(true);

        try {
            const indivitualCaseApprovalData = await api.post("/ui_approval/get_case_approval_by_id", indivitualAlertsPayload);

            setLoading(false);

            if (indivitualCaseApprovalData && indivitualCaseApprovalData.success && indivitualCaseApprovalData.data) { 

                setApprovalModalShow(true);
                setIndivitualApprovalData(indivitualCaseApprovalData.data);

            } else {
                const errorMessage = indivitualCaseApprovalData.message ? indivitualCaseApprovalData.message : "Failed to add approval. Please try again.";
                toast.error(errorMessage, {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    className: "toast-error",
                });

            }

        } catch (error) {
            setLoading(false);
            if (error && error.response && error.response['data']) {
                toast.error(error.response['data'].message ? error.response['data'].message : 'Please Try Again !', {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    className: "toast-error",
                });

            }
        }
    }

    useEffect(() => {
        setNotificationCount(unreadNotificationCount);
    }, [unreadNotificationCount]);

    const formatDate = (fieldValue, time) => {
        if (!fieldValue || typeof fieldValue !== "string") return fieldValue;

        const dateValue = new Date(fieldValue);
    
        if (isNaN(dateValue.getTime()) || (!fieldValue.includes("-") && !fieldValue.includes("/"))) {
            return fieldValue;
        }
    
        const day = String(dateValue.getDate()).padStart(2, "0");
        const month = String(dateValue.getMonth() + 1).padStart(2, "0");
        const year = dateValue.getFullYear();

        let formattedDate = `${day}/${month}/${year}`;

        if (time) {
            let hours = dateValue.getHours();
            const minutes = String(dateValue.getMinutes()).padStart(2, "0");
            const ampm = hours >= 12 ? "PM" : "AM";
            hours = hours % 12 || 12;
            formattedDate += ` ${hours}:${minutes} ${ampm}`;
        }
    
        return formattedDate;
    };

    return (
        <>
        {/* <AppBar
            position="sticky"
            sx={{
                background: "#fff",
                boxShadow: "none",
                borderBottom: "1px solid #D0D5DD",
                zIndex: 98,
            }}
            inert={loading ? true : false}
        >
            <Toolbar
                sx={{ justifyContent: "space-between", padding: '3px' }}
                className="navbarHeight"
            > */}

                {/* Left: Search */}

                {/* <TextField
                    variant="standard"
                    placeholder="Search Case ID, Crime Number"
                    fullWidth
                    className="navbarSearchInput"
                    sx={{
                        background: '#F2F4F7',
                        width: 600,
                        padding: '12px 16px',
                        borderRadius: '8px',
                        '& .MuiInputBase-input': {
                            padding: 0,
                            border: 'none',
                        },
                    }}
                    InputProps={{
                        disableUnderline: true,
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon sx={{ color: '#667085' }} />
                            </InputAdornment>
                        ),
                        endAdornment: (
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <svg
                                    width="18"
                                    height="14"
                                    viewBox="0 0 18 14"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                <path
                                    d="M1.5 3.66675L11.5 3.66675M11.5 3.66675C11.5 5.04746 12.6193 6.16675 14 6.16675C15.3807 6.16675 16.5 5.04746 16.5 3.66675C16.5 2.28604 15.3807 1.16675 14 1.16675C12.6193 1.16675 11.5 2.28604 11.5 3.66675ZM6.5 10.3334L16.5 10.3334M6.5 10.3334C6.5 11.7141 5.38071 12.8334 4 12.8334C2.61929 12.8334 1.5 11.7141 1.5 10.3334C1.5 8.9527 2.61929 7.83341 4 7.83341C5.38071 7.83341 6.5 8.9527 6.5 10.3334Z"
                                    stroke="#1570EF"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                                </svg>
                            </Box>
                        ),
                    }}
                /> */}
{/* 
                <Box>
                    
                </Box> */}

                {/* Right: Notification */}
                {/* <Box> */}
                    <IconButton size="small" aria-label="show notifications" color="inherit" sx={{position: 'relative'}} onClick={showAlertUX}>
                        <Badge badgeContent={notificationCount == 0 ? undefined : notificationCount} className="notificationBadge" overlap="circular">
                            <NotificationsNoneIcon sx={{color: '#212121', height: '25px', width: '25px'}} />
                        </Badge>
                    </IconButton>
                    {/* <IconButton size="small" aria-label="show help" color="inherit">
                        <HelpOutlineIcon sx={{color: '#212121', height: '25px', width: '25px'}} />
                    </IconButton>
                </Box>

            </Toolbar>
        </AppBar> */}

        { showAlertPage &&
            <>
                <Box sx={{ position: 'fixed', top: '0', left: '0', right: '0', bottom: '0', background: 'rgba(0, 0, 0, 0.5)', zIndex: '999', }} />
                <Slide direction="left" in={showAlertPage} mountOnEnter unmountOnExit>
                    <Box
                        inert={loading ? true : false} 
                        sx={{
                            position: 'fixed',
                            top: 0,
                            right: 0,
                            height: '100%',
                            width: 'calc(100% - 920px)',
                            background: '#F5F5F5',
                            zIndex: 999,
                            overflow: 'hidden',
                        }}
                    >
                        <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center' ,height: '55.5px', padding: '3px 16px', borderBottom: '1px solid #EEEEEE', }}>

                            <p style={{fontSize: '15px', color: '#000000', fontWeight: '500', fontFamily: 'Inter' }}>
                                Notification
                            </p>

                            <IconButton size="small" aria-label="show help" color="inherit" onClick={closeAlertPage}>
                                <CloseIcon sx={{color: '#212121', height: '25px', width: '25px'}} />
                            </IconButton>

                        </Box>

                        <Box sx={{height: 'calc(100% - 80px)', overflowY: 'auto'}}>

                            {
                                alertOverllData && alertOverllData.map((data)=>(
                                    <Box px={3} py={2} sx={{borderBottom: '1px solid #E0E0E0'}}>
                                        <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>

                                            <p className="AlertTitle">
                                                <span style={{fontWeight: '500'}}>
                                                    {data?.created_by_name + ': '}
                                                </span>
                                                {data?.alert_message}
                                            </p>
        
                                            {   !data?.read_status &&
                                                <p className="AlertNewBage">
                                                    New
                                                </p>
                                            }

                                        </Box>
                                        <Button onClick={()=>showIndivitualAlert(data)} variant="outlined" sx={{color: '#1F1DAC', borderColor: '#1F1DAC'}}>
                                            View
                                        </Button>
                                    </Box>
                                ))
                            }
    
                            {
                                alertOverllData && alertOverllData.length === 0 &&
                                <Box p={2} sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', border: '1px solid #E0E0E0'}}>
                                    <p style={{fontSize: '15px', color: '#5d5d5d', fontWeight: '500', fontFamily: 'Inter' }}>
                                        No Records Found
                                    </p>
                                </Box>
                            }
                        </Box>

                    </Box>
                </Slide>
            </>
        }

        {approvalModalShow &&
            <Dialog
                open={approvalModalShow}
                onClose={() => setApprovalModalShow(false)}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                maxWidth="sm"
                fullWidth
                sx={{zIndex:'1000'}}
            >
                {/* <DialogTitle id="alert-dialog-title" sx={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between' }} >

                </DialogTitle> */}
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        <Box>
                            {
                                <Box sx={{display: 'flex', flexDirection: 'column', gap: '8px'}}>

                                    <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'start'}}>
                                        <Box>
                                            <Box className="ProfileViewTopic">
                                                <span>
                                                    {indivitualApprovalData['created_by'] || ''} 
                                                </span>
                                                <span> Added Approval for </span>
                                                <span className="ProfileViewHeading">
                                                    {indivitualApprovalData['action'] ? `${indivitualApprovalData['action']}` : ''}
                                                </span>
                                                <span>
                                                    {indivitualApprovalData['module'] ? ` in ${indivitualApprovalData['module']}` : ''}
                                                </span>
                                            </Box>

                                            <Box className="ProfileViewDesc Roboto">
                                                <span className="alertDescDate">
                                                    {indivitualApprovalData['created_at'] ? formatDate(indivitualApprovalData['created_at'], true) : ''}
                                                </span>
                                            </Box>
                                        </Box>
                                        <IconButton
                                            aria-label="close"
                                            onClick={() => setApprovalModalShow(false)}
                                            sx={{ color: (theme) => theme.palette.grey[500], padding: '2px' }}
                                        >
                                            <CloseIcon />
                                        </IconButton>
                                    </Box>

                                    <hr style={{width: '100%', margin: '0', border: '1px solid #D0D5DD'}} />

                                    <Box sx={{display: 'flex', flexDirection: 'column', gap: '8px'}}>

                                        <p className="ProfileViewDesc Roboto">
                                            {indivitualApprovalData['approvalItem'] && (
                                                <span>
                                                    The item <strong>{indivitualApprovalData['approvalItem']}</strong> was approved
                                                </span>
                                            )}
                                            {indivitualApprovalData['approvedBy'] && (
                                                <span> by <strong>{indivitualApprovalData['approvedBy']}</strong></span>
                                            )}
                                            {indivitualApprovalData['approval_date'] && (
                                                <span> on <strong>{formatDate(indivitualApprovalData['approval_date'])}</strong>.</span>
                                            )}
                                        </p>

                                        {indivitualApprovalData['remarks'] && (
                                            <span className="ProfileViewDesc"> Comments: <>{indivitualApprovalData['remarks']}</></span>
                                        )}

                                    </Box>

                                </Box>
                            }
                        </Box>
                    </DialogContentText>
                </DialogContent>
            </Dialog>
        }

        {
            loading && <div className='parent_spinner' tabIndex="-1" aria-hidden="true">
                <CircularProgress size={100} />
            </div>
        }

        </>
    );
}
