import React, { useState } from "react";
import { AppBar, Toolbar, InputBase, IconButton, Box, TextField, InputAdornment, Badge, Button } from "@mui/material";
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from '@mui/icons-material/Close';
import Slide from '@mui/material/Slide';

export default function Navbar() {

    const [loading, setLoading] = useState(false);

    const [notificationCount, setNotificationCount] = useState(2);

    const [showAlertPage, setShowAlertPage] = useState(false);

    const showAlertUX = ()=> {
        setShowAlertPage(true);
    }

    const closeAlertPage = ()=> {
        setShowAlertPage(false);
    }

    return (
        <>
        <AppBar
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
            >

                {/* Left: Search */}

                <TextField
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
                />

                {/* Right: Notification */}
                <Box>
                    <IconButton size="small" aria-label="show notifications" color="inherit" sx={{position: 'relative'}} onClick={showAlertUX}>
                        <Badge badgeContent={notificationCount === 0 ? null : notificationCount} className="notificationBadge" overlap="circular">
                            <NotificationsNoneIcon sx={{color: '#212121', height: '25px', width: '25px'}} />
                        </Badge>
                    </IconButton>
                    <IconButton size="small" aria-label="show help" color="inherit">
                        <HelpOutlineIcon sx={{color: '#212121', height: '25px', width: '25px'}} />
                    </IconButton>
                </Box>

            </Toolbar>
        </AppBar>

        { showAlertPage &&
            <>
                <Box sx={{ position: 'fixed', top: '0', left: '0', right: '0', bottom: '0', background: 'rgba(0, 0, 0, 0.5)', zIndex: '99', }} />
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
                            zIndex: 99,
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

                        <Box>

                            <Box px={3} py={2} sx={{border: '1px solid #E0E0E0'}}>
                                <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                    <p className="AlertTitle">
                                        Admin assigned a New Case to you
                                    </p>

                                    <p className="AlertNewBage">
                                        New
                                    </p>
                                </Box>
                                <Button variant="outlined" sx={{color: '#1F1DAC', borderColor: '#1F1DAC'}}>
                                    View
                                </Button>
                            </Box>

                            <Box px={3} py={2} sx={{border: '1px solid #E0E0E0'}}>
                                <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                    <p className="AlertTitle">
                                        Admin assigned a New Case to you
                                    </p>
                                </Box>
                                <Button variant="outlined" sx={{color: '#1F1DAC', borderColor: '#1F1DAC'}}>
                                    View
                                </Button>
                            </Box>

                            <Box px={3} py={2} sx={{border: '1px solid #E0E0E0'}}>
                                <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                    <p className="AlertTitle">
                                        Admin assigned a New Case to you
                                    </p>
                                </Box>
                                <Button variant="outlined" sx={{color: '#1F1DAC', borderColor: '#1F1DAC'}}>
                                    View
                                </Button>
                            </Box>

                        </Box>

                    </Box>
                </Slide>
            </>
        }

        </>
    );
}
