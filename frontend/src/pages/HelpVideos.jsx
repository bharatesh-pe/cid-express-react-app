import React, { useEffect, useState } from "react";

import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Select,
    MenuItem,
    InputLabel,
    FormControl,
    Typography,
    Box,
    Button,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    IconButton,
    CircularProgress
} from "@mui/material";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DeleteIcon from "@mui/icons-material/Delete";

import api from "../services/api";

import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';

const moduleLabels = {
    dashboard: "Dashboard",
    ui_case: "Under Investigation",
    pt_case: "Pending Trial",
    eq_case: "Enquiries",
    caseView: "Investigations",
};

export default function VideoListViewer() {

    const REACT_APP_SERVER_URL_FILE_VIEW = process.env.REACT_APP_SERVER_URL_FILE_VIEW;

    const [videos, setVideos] = useState({});
    const [loading, setLoading] = useState(false);

    const [open, setOpen] = useState(false);
    const [selectedModule, setSelectedModule] = useState("");
    const [videoFile, setVideoFile] = useState(null);

    const showAddNewPopup = () => {
        setSelectedModule("");
        setVideoFile(null);
        setOpen(true);
    };

    // Close dialog
    const handleClose = () => {
        setOpen(false);
    };

    // Handle Submit
    const handleSubmit = async () => {
        if (!selectedModule || !videoFile) {
            toast.error("Please select module and upload a video");
            return;
        }

        const formData = new FormData();
        formData.append("module", selectedModule);
        formData.append("video", videoFile);

        try {
            setLoading(true);

            const getAllVideosResponse = await api.post("/templateData/uploadHelpVideo", formData);
            setLoading(false);

            console.log(getAllVideosResponse,"getAllVideosResponse")

            if (getAllVideosResponse && getAllVideosResponse.success) {
                setOpen(false);
                gettingAllVideos();
            } else {
                const errorMessage = getAllVideosResponse?.data?.message || "Failed to upload help videos.";
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
            toast.error(error?.response?.data?.message || "Please Try Again!", {
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
    };

    useEffect(() => {
        gettingAllVideos();
    }, []);

    const gettingAllVideos = async () => {

        const gettingKeyOnly = Object.keys(moduleLabels);

        const payload = {
            data: gettingKeyOnly
        };

        try {
            setLoading(true);

            const getAllVideosResponse = await api.post("/templateData/gettingAllHelpVideos", payload);
            setLoading(false);

            if (getAllVideosResponse && getAllVideosResponse.data && getAllVideosResponse.success) {
                setVideos(getAllVideosResponse.data);
            } else {
                const errorMessage = getAllVideosResponse?.data?.message || "Failed to get help videos.";
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
            toast.error(error?.response?.data?.message || "Please Try Again!", {
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
    };

    const handleDeleteVideo = (moduleName, fileName) => {
        console.log(moduleName, fileName,"moduleName, fileName");
    };

    return (
        <Box p={3} mb={5}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between'}} pb={2}>
                <Typography variant="h6" gutterBottom>
                    Help Videos
                </Typography>
                <Button onClick={showAddNewPopup} sx={{ background: '#0167F8', fontSize: '14px', fontWeight: '500', color: '#FFFFFF', padding: '6px 16px' }} className="Roboto blueButton">
                    Add New
                </Button>
            </Box>
            {Object.entries(videos).map(([moduleKey, videoList]) => (
                <Accordion key={moduleKey}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography fontWeight="bold">
                            {moduleLabels[moduleKey]}
                        </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        {videoList.length > 0 ? (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                                {videoList.map((videoUrl, idx) => {
                                    const fileName = videoUrl.split("/").pop();

                                    return (
                                        <div
                                            key={idx}
                                            style={{
                                                position: 'relative',
                                                border: '1px solid #ccc',
                                                borderRadius: '8px',
                                                padding: '8px',
                                                width: '300px',
                                                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
                                                backgroundColor: '#fafafa',
                                                overflow: 'hidden',
                                                transition: 'box-shadow 0.2s ease-in-out'
                                            }}
                                            className="video-card"
                                        >
                                            <video
                                                src={`${REACT_APP_SERVER_URL_FILE_VIEW}${videoUrl}`}
                                                controls
                                                style={{ width: '100%', borderRadius: '4px' }}
                                            />
                                            <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                                                <Typography
                                                    variant="body2"
                                                    sx={{ mt: 1, wordBreak: 'break-all' }}
                                                >
                                                    {fileName}
                                                </Typography>
                                                <IconButton
                                                    onClick={() => handleDeleteVideo(moduleKey, fileName)}
                                                    size="small"
                                                    sx={{
                                                        zIndex: 2,
                                                        width: '35px',
                                                        display: 'flex',
                                                        justifyContent: 'center',
                                                        alignItems: 'center'
                                                    }}
                                                >
                                                    <DeleteIcon sx={{color: 'rgba(255, 0, 0, 0.8)'}} fontSize="small" />
                                                </IconButton>
                                            </Box>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <Typography variant="body2" color="text.secondary">
                                No videos found.
                            </Typography>
                        )}
                    </AccordionDetails>
                </Accordion>
            ))}
            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
                <DialogTitle>Upload Help Video</DialogTitle>
                <DialogContent dividers>
                    <FormControl fullWidth sx={{ my: 3 }}>
                        <InputLabel>Select Module</InputLabel>
                        <Select
                            value={selectedModule}
                            onChange={(e) => setSelectedModule(e.target.value)}
                            label="Select Module"
                        >
                            {Object.entries(moduleLabels).map(([key, label]) => (
                                <MenuItem key={key} value={key}>{label}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Button
                        variant="outlined"
                        component="label"
                        fullWidth
                    >
                        Choose Video File
                        <input
                            type="file"
                            hidden
                            accept="video/*"
                            onChange={(e) => setVideoFile(e.target.files[0])}
                        />
                    </Button>

                    {videoFile && (
                        <Typography mt={2} variant="body2" color="green">
                            Selected: {videoFile.name}
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained" disabled={!selectedModule || !videoFile}>
                        Upload
                    </Button>
                </DialogActions>
            </Dialog>

            {loading && (
                <div className="parent_spinner" tabIndex="-1" aria-hidden="true">
                    <CircularProgress size={100} />
                </div>
            )}

        </Box>
    );
}
