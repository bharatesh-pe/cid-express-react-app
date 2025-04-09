import { Box, Button, CircularProgress, FormControl, Grid, IconButton, InputAdornment, TextField, Typography } from "@mui/material"
import { useEffect, useState } from "react"
import TableView from "../components/table-view/TableView";
import TextFieldInput from '@mui/material/TextField';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear';
import api from '../services/api';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import CloseIcon from '@mui/icons-material/Close';
import eyes from "../Images/eye.svg"
import edit from "../Images/tableEdit.svg";
import trash from "../Images/tableTrash.svg";
import ErrorIcon from "../Images/erroricon.png";
import { useNavigate } from "react-router-dom";
import { ArrowBack } from "@mui/icons-material";

const KGID = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [showViewModal, setShowViewModal] = useState();
    const [showEditModal, setShowEditModal] = useState();
    const [selectedRole, setSelectedRole] = useState({
        kgid: '',
        name: '',
        mobile: '',
        start: '',
        end: '',
        permissions: {},
    });
    const [delete_role_conf, setDeleteRoleConf] = useState(false)
    const [roleToDelete, setRoleToDelete] = useState(null);
    const [roleNameToDelete, setRoleNameToDelete] = useState("");
    const [addRoleData, setAddRoleData] = useState({
        'kgid':'',
        'name': '',
        'mobile': '',
    });
    const [departmentRowData, setDepartmentRowData] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [showRoleAddModal, setShowRoleAddModal] = useState(false)
    const [errorRoleData, setErrorRoleData] = useState({})
    const [searchValue, setSearchValue] = useState(null);
    const pageSize = 10;

    const showDeleteRoleDialoge = (id, name) => {
        setRoleToDelete(id);
        setRoleNameToDelete(name);
        setDeleteRoleConf(true);
    };

    const handleDeleteRole = () => {
        if (roleToDelete !== null) {
            deleteRole(roleToDelete);
            setDeleteRoleConf(false);
            setRoleToDelete(null);
        }
    };

    const getFilteredRows = () => {
        if (!searchValue) {
            return departmentRowData;
        }
        return departmentRowData.filter((row) =>
            row.kgid.toLowerCase().includes(searchValue.toLowerCase()) ||
            row.name.toLowerCase().includes(searchValue.toLowerCase()) ||
            row.mobile.toLowerCase().includes(searchValue.toLowerCase())
        );
    };
    
    const filteredRows = getFilteredRows();
    const totalPages = Math.ceil(filteredRows.length / pageSize);
    const currentPageRows = filteredRows.slice(currentPage * pageSize, (currentPage + 1) * pageSize);
    const handleNext = () => {
        if (currentPage < totalPages - 1) {
            setCurrentPage((prev) => prev + 1);
        }
    };
    const handleBack = () => {
        if (currentPage > 0) {
            setCurrentPage((prev) => prev - 1);
        }
    };

    const handleViewRole = (role) => {
        setSelectedRole(role);
        setShowViewModal(true);
    };

    const handleEditRole = (role) => {
        setSelectedRole({
            id: role.id,
            kgid: role.kgid,
            name: role.name,
            mobile: role.mobile,
            start: role.start_date,
            end: role.end_date,
        });

        setShowEditModal(true);
    };

    const departmentColumnData = [
        { field: 'kgid', headerName: 'KGID', width: 200 },
        { field: 'name', headerName: 'Name', width: 200 },
        { field: 'mobile', headerName: 'Mobile', width: 200 },
        {
            field: '',
            headerName: 'Action',
            flex: 1,
            renderCell: (params) => {
                return (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px', height: '100%' }}>
                        <Button
                            style={{
                                background: "transparent",
                                border: "none",
                                padding: "0",
                                boxShadow: "none",
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                color: "black",
                                fontSize: "14px",
                                textAlign: "center",
                                textTransform: "none",
                            }}
                            onClick={() => handleViewRole(params.row)}
                        >
                            <img
                                src={eyes}
                                alt="View"
                                style={{ width: "20px", height: "20px" }}
                            />
                            <span>View</span>
                        </Button>
                        <Button
                            style={{
                                background: "transparent",
                                border: "none",
                                padding: "0",
                                boxShadow: "none",
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                color: "black",
                                fontSize: "14px",
                                textAlign: "center",
                                textTransform: "none",
                            }}
                            onClick={() => {

                                handleEditRole(params.row)
                            }}
                        >
                            <img
                                src={edit}
                                alt="Edit"
                                style={{ width: "20px", height: "20px" }}
                            />
                            <span>Edit</span>
                        </Button>
                        <Button
                            style={{
                                background: "transparent",
                                border: "none",
                                padding: "0",
                                boxShadow: "none",
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                color: "Red",
                                fontSize: "14px",
                                textAlign: "center",
                                textTransform: "none",
                            }}
                            onClick={() => showDeleteRoleDialoge(params.row.id, params.row.name)}
                        >
                            <img
                                src={trash}
                                alt="Delete"
                                style={{ width: "20px", height: "20px" }}
                            />
                            <span>Delete</span>
                        </Button>
                    </Box>
                );
            }
        }
    ];

    const deleteRole = async (id) => {
        setLoading(true);
        if (!id) {
            toast.error("Invalid role ID.");
            return;
        }
        try {
            const response = await api.post("/master_meta/delete_master_data", { master_name: "Kgid", id });
            if (!response || !response.success) {
                let errorMessage = response.message || "Error deleting kgid";
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
                return;
            }

            toast.success(response.message || "KGID Deleted Successfully", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                className: "toast-success",
            });

            get_department_details();

        } catch (err) {
            let errorMessage = err.response?.data?.error || err.response?.message || "Something went wrong. Please try again.";

            if (errorMessage.includes("violates foreign key constraint")) {
                errorMessage = "This KGID is assigned to a user and cannot be deleted.";
            }
            
            toast.error(errorMessage, {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                className: "toast-warning",
            });
        } finally {
            setLoading(false);
        }
    };


    const get_department_details = async () => {
        setLoading(true);
        try {
            const response = await api.post("/master_meta/fetch_specific_master_data", {
                master_name: "kgid"
            });

            if (response) {
                const updatedData = response.map(row => {
                    return {
                        id: row.id,
                        kgid: row.kgid,
                        name: row.name,
                        mobile: row.mobile,
                        start_date : row.start_date,
                        end_date : row.end_date,
                    };
                });
                setDepartmentRowData(updatedData);
            } else {
                toast.error("Failed to fetch kgid");
            }
        } catch (err) {
            let errorMessage = err?.response?.data?.message || "Something went wrong. Please try again.";
            toast.error(errorMessage);
        }
        setLoading(false);
    };

    useEffect(() => {
        get_department_details();
    }, []);

    const handleAddData = (e) => {
        const { name, value } = e.target;

        setAddRoleData((prevData) => ({
            ...prevData,
            [name]: value,
        }));

        if (errorRoleData[name]) {
            setErrorRoleData((prevErrors) => {
                const updatedErrors = { ...prevErrors };
                if (updatedErrors[name]) {
                    delete updatedErrors[name];
                }
                return updatedErrors;
            });
        }
    };

    const handleAddSaveData = async () => {
        var error_flag = false;
        let errorMessage = '';
        let errorCount = 0;

        if (addRoleData.kgid.trim() === '') {
            error_flag = true;
            errorMessage = 'KGID is required';
            errorCount++;
            setErrorRoleData((prevData) => ({
                ...prevData,
                kgid: 'KGID is required'
            }));
        }else if (addRoleData.kgid.trim().length < 5) {
            error_flag = true;
            errorMessage = 'KGID must be at least 5 characters long';
            errorCount++;
            setErrorRoleData((prevData) => ({
                ...prevData,
                kgid: 'KGID must be at least 5 characters long',
            }));
        } else if (addRoleData.kgid.trim().length > 10) {
            error_flag = true;
            errorMessage = 'KGID must not exceed 10 characters';
            errorCount++;
            setErrorRoleData((prevData) => ({
                ...prevData,
                kgid: 'KGID must not exceed 10 characters',
            }));
        }

        if (addRoleData.name.trim() === '') {
            error_flag = true;
            errorMessage = 'Name is required';
            errorCount++;
            setErrorRoleData((prevData) => ({
                ...prevData,
                name: 'Name is required'
            }));
        }

        if (addRoleData.mobile.trim() === '') {
            error_flag = true;
            errorMessage = 'Mobile is required';
            errorCount++;
            setErrorRoleData((prevData) => ({
                ...prevData,
                mobile: 'Mobile is required'
            }));
        } else if (addRoleData.mobile.trim().length !== 10) {
            error_flag = true;
            errorMessage = 'Mobile must be 10 digits';
            errorCount++;
            setErrorRoleData((prevData) => ({
                ...prevData,
                mobile: 'Mobile must be 10 digits'
            }));
        }    

        if (error_flag) {
            if (errorCount > 1) {
                errorMessage = "Please check fields";
            }
            toast.error(errorMessage , {
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

        setLoading(true);

        try {
            const requestData = {
                master_name: "Kgid",
                data: addRoleData
            };
            const response = await api.post("/master_meta/create_master_data", requestData);

            if (!response || !response.success) {
                toast.error(response.message || "Failed to create record", {
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

            toast.success(response.message || "KGID Created Successfully", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                className: "toast-success"
            });

            get_department_details();

            setAddRoleData({
                'kgid':'',
                'name': '',
                'mobile': '',
            });
            setShowRoleAddModal(false);

        } catch (err) {
            let errorMessage = err.message || "Something went wrong. Please try again.";
            if (err?.response?.data?.message) {
                errorMessage = err?.response?.data?.message || "Something went wrong. Please try again.";
            }
            toast.error(errorMessage, {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                className: "toast-warning",
            });
        }

        setLoading(false);
    };


    const handleDateInputChange = (e) => {
        const { name, value } = e.target;
    
        setSelectedRole((prevState) => ({
            ...prevState,
            [name === "start_date" ? "start" : name === "end_date" ? "end" : name]: value,
        }));
    };
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSelectedRole(prevState => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleEditData = async () => {
        var error_flag = false;
        let errorMessage = '';
        if (selectedRole.kgid.trim() === '') {
            error_flag = true;
            errorMessage = 'KGID is required';
            setErrorRoleData((prevData) => ({
                ...prevData,
                kgid: 'KGID is required',
            }));
        }else if (selectedRole.kgid.trim().length < 5) {
            error_flag = true;
            errorMessage = 'KGID must be at least 5 characters long';
            setErrorRoleData((prevData) => ({
                ...prevData,
                kgid: 'KGID must be at least 5 characters long',
            }));
        } else if (selectedRole.kgid.trim().length > 10) {
            error_flag = true;
            errorMessage = 'KGID must not exceed 10 characters';
            setErrorRoleData((prevData) => ({
                ...prevData,
                kgid: 'KGID must not exceed 10 characters',
            }));
        }

        if (selectedRole.name.trim() === '') {
            error_flag = true;
            if (!errorMessage) errorMessage = 'Name is required';
            setErrorRoleData((prevData) => ({
                ...prevData,
                name: 'Name is required',
            }));
        }

        if (selectedRole.mobile.trim() === '') {
            error_flag = true;
            if (!errorMessage) errorMessage = 'Mobile is required';
            setErrorRoleData((prevData) => ({
                ...prevData,
                mobile: 'Mobile is required'
            }));
        } else if (selectedRole.mobile.trim().length !== 10) {
            error_flag = true;
            if (!errorMessage) errorMessage = 'Mobile must be 10 digits';
            setErrorRoleData((prevData) => ({
                ...prevData,
                mobile: 'Mobile must be 10 digits'
            }));
        }    

        if (error_flag) {
            toast.error(errorMessage || "Please check fields", {
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

        const requestData = {
            master_name: "Kgid",
            data: {
                id: selectedRole.id,
                kgid: selectedRole.kgid,
                name: selectedRole.name,
                mobile: selectedRole.mobile,
                start_date: selectedRole.start,
                end_date: selectedRole.end,
            }
        };

        setLoading(true);
        try {
            const response = await api.post("/master_meta/update_master_data", requestData);

            if (!response || !response.success) {
                toast.error(response.message || "Error updating kgid", {
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

            toast.success(response.message || "KGID updated successfully", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                className: "toast-success",
            });

            get_department_details();
            setShowEditModal(false);
        } catch (err) {
            let errorMessage = err.message || "Something went wrong. Please try again.";
            if (err?.response?.data?.message) {
                errorMessage = err?.response?.data?.message || "Something went wrong. Please try again.";
            }
            toast.error(errorMessage, {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                className: "toast-warning",
            });
        }
        setLoading(false);
    };

    return (
        <Box inert={loading ? true : false}>
            <Box p={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                    <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 0, cursor: 'pointer' }}
                        onClick={() => navigate("/master")}
                    >
            <ArrowBack sx={{ fontSize: 24, color: "#1D2939" }} />

                        <Typography className="Roboto" sx={{ fontSize: "20px", fontWeight: "600", color: "#1D2939", margin: 0 }}>
                            KGID
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <TextFieldInput InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ color: '#475467' }} />
                                </InputAdornment>
                            ),
                            endAdornment: (
                                searchValue && (
                                    <IconButton sx={{ padding: 0 }}  
                                    onClick={() => {
                                        setSearchValue('');
                                        setCurrentPage(0);
                                    }} 
                                    size="small">
                                        <ClearIcon sx={{ color: '#475467' }} />
                                    </IconButton>
                                )
                            )
                        }}
                            onInput={(e) => setSearchValue(e.target.value)}
                            value={searchValue}
                            id="tableSearch"
                            size="small"
                            placeholder='Search anything'
                            variant="outlined"
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                }
                            }}
                            sx={{
                                width: '400px', borderRadius: '6px', outline: 'none',
                                '& .MuiInputBase-input::placeholder': {
                                    color: '#475467',
                                    opacity: '1',
                                    fontSize: '14px',
                                    fontWeight: '400',
                                    fontFamily: 'Roboto'
                                },
                            }}
                        />
                        <Button
                            onClick={() => {
                                setAddRoleData(prevData => ({
                                    ...prevData,
                                }));
                                setShowRoleAddModal(true);
                            }}

                            sx={{ background: '#32D583', color: '#101828', textTransform: 'none', height: '38px' }} startIcon={<AddIcon sx={{ border: '1.3px solid #101828', borderRadius: '50%' }} />} variant="contained">
                            Add KGID
                        </Button>
                    </Box>
                </Box>
                <Box py={2}>
                    <TableView
                        rows={currentPageRows}
                        columns={departmentColumnData}
                        handleNext={handleNext}
                        handleBack={handleBack}
                        backBtn={currentPage > 0}
                        nextBtn={currentPage < totalPages - 1}
                        getRowId={(row) => row.id}
                    />

                </Box>
            </Box>

            {/* add , view , edit Department modal */}

            <Dialog
                open={showViewModal || showEditModal || showRoleAddModal}
                onClose={() => {
                    setShowViewModal(false);
                    setShowEditModal(false);
                    setShowRoleAddModal(false);
                    setErrorRoleData({ kgid: '', name: '', mobile: ''});
                    setAddRoleData({ kgid: '', name: '', mobile: ''});
                    setSelectedRole(null);            
                }}
                aria-labelledby="department-dialog-title"
                maxWidth="md"
                fullWidth
            >
                <DialogTitle id="department-dialog-title" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    {showViewModal && "View KGID"}
                    {showEditModal && "Edit KGID"}
                    {showRoleAddModal && "Add New KGID"}
                    <IconButton
                        aria-label="close"
                        onClick={() => {
                            setShowViewModal(false);
                            setShowEditModal(false);
                            setShowRoleAddModal(false);
                            setErrorRoleData({ kgid: '', name: '', mobile: ''});
                        }}
                        sx={{ color: (theme) => theme.palette.grey[500] }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <DialogContent>
                    <DialogContentText>
                        <FormControl fullWidth>
                            <Box sx={{ marginY: '18px' }}>
                                <h4 className="form-field-heading" style={{ color: !!errorRoleData.kgid && '#d32f2f' }}>
                                    KGID
                                </h4>
                                <TextField
                                    fullWidth
                                    label="KGID"
                                    name="kgid"
                                    autoComplete="off"
                                    value={showRoleAddModal ? addRoleData.kgid : selectedRole?.kgid || ""}
                                    onChange={(e) => {
                                        const regex = /^[0-9\b]*$/;
                                        const value = e.target.value;

                                        if (regex.test(value) && value.length <= 10) {
                                            showRoleAddModal ? handleAddData(e) : handleInputChange(e);
                                        }
                                    }}
                                    error={!!errorRoleData.kgid}
                                    required={showEditModal || showRoleAddModal}
                                    disabled={showViewModal}
                                />
                            </Box>
                            <Box sx={{ marginY: '18px' }}>
                                <h4 className="form-field-heading" style={{ color: !!errorRoleData.name && '#d32f2f' }}>
                                    Name
                                </h4>
                                <TextField
                                    fullWidth
                                    label="Name"
                                    name="name"
                                    autoComplete="off"
                                    value={showRoleAddModal ? addRoleData.name : selectedRole?.name || selectedRole?.name}
                                    onChange={(e) => {
                                        if (showViewModal) return;

                                        const regex = /^[a-zA-Z\s]*$/;                                        
                                        if (regex.test(e.target.value)) {
                                            if (showRoleAddModal) {
                                                handleAddData(e);
                                            } else {
                                                handleInputChange(e);
                                                setSelectedRole((prev) => ({ ...prev, name: e.target.value }));
                                            }
                                        }
                                    }}
                                    error={!!errorRoleData.name}
                                    required={showEditModal || showRoleAddModal}
                                    disabled={showViewModal}
                                />
                            </Box>
                            <Box sx={{ marginY: '18px' }}>
                                <h4 className="form-field-heading" style={{ color: !!errorRoleData.mobile && '#d32f2f' }}>
                                    Mobile
                                </h4>
                                <TextField
                                    fullWidth
                                    label="Mobile"
                                    name="mobile"
                                    autoComplete="off"
                                    value={showRoleAddModal ? addRoleData.mobile : selectedRole?.mobile || ""}
                                    onChange={(e) => {
                                        if (showViewModal) return;

                                        const regex = /^[0-9\b]*$/;
                                        if (regex.test(e.target.value) && e.target.value.length <= 10) {
                                            if (showRoleAddModal) {
                                                handleAddData(e);
                                            } else {
                                                handleInputChange(e);
                                                setSelectedRole((prev) => ({ ...prev, mobile: e.target.value }));
                                            }
                                        }
                                    }}
                                    error={!!errorRoleData.mobile}
                                    required={showEditModal || showRoleAddModal}
                                    disabled={showViewModal}
                                />
                            </Box>
                            {showEditModal && (
                        <>
                            <Box sx={{ marginY: '18px' }}>
                                <h4 className="form-field-heading">
                                    Start Date
                                </h4>
                                <TextField
                                    fullWidth
                                    type="date"
                                    name="start_date"
                                    value={selectedRole?.start ? selectedRole.start.split('T')[0] : ""}
                                    onChange={handleDateInputChange}
                                    disabled={showViewModal}
                                />
                            </Box>
                            <Box sx={{ marginY: '18px' }}>
                                <h4 className="form-field-heading">
                                    End Date
                                </h4>
                                <TextField
                                    fullWidth
                                    type="date"
                                    name="end_date"
                                    value={selectedRole?.end ? selectedRole.end.split('T')[0] : ""}
                                    onChange={handleDateInputChange}
                                    disabled={showViewModal}
                                />
                            </Box>
                        </>
                    )}                        
                    </FormControl>
                    </DialogContentText>
                </DialogContent>

                <DialogActions sx={{ padding: '12px 24px' }}>
                    <Button
                        onClick={() => {
                            setShowViewModal(false);
                            setShowEditModal(false);
                            setShowRoleAddModal(false);
                            setErrorRoleData({ kgid: '', name: '', mobile: ''});
                            setAddRoleData({ kgid: '', name: '', mobile: ''});
                            setSelectedRole(null);            
                        }}
                    >
                        Close
                    </Button>
                    {showEditModal && (
                        <Button variant="outlined" onClick={handleEditData}>
                            Edit KGID
                        </Button>
                    )}
                    {showRoleAddModal && (
                        <Button variant="outlined" onClick={handleAddSaveData}>
                            Add KGID
                        </Button>
                    )}
                </DialogActions>
            </Dialog>


            {/* Delete Role conformation Popup */}
            <div>
                <Dialog
                    open={delete_role_conf}
                    onClose={() => setDeleteRoleConf(false)}
                    maxWidth="sm"
                    fullWidth
                    sx={{ borderRadius: "12px", padding: "15px" }}
                >
                    <DialogContent sx={{ textAlign: "left" }}>
                        <div style={{ display: "flex", alignItems: "center", marginBottom: "15px" }}>
                            <div
                                style={{
                                    width: "60px",
                                    height: "60px",
                                    borderRadius: "50%",
                                    overflow: "hidden",
                                    background: "rgb(250 209 209)",
                                    padding: "3px",
                                }}
                            >
                                <img
                                    src={ErrorIcon}
                                    alt="Warning Icon"
                                    style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }}
                                />
                            </div>
                        </div>

                        <p style={{ fontSize: "20px", fontWeight: "bold" }}>
                            <span> Delete {roleNameToDelete}</span>
                        </p>

                        <p style={{ fontSize: "16px", color: "rgb(156 163 175)", margin: 0 }}>
                            Are you sure you want to delete the {roleNameToDelete} KGID? This action
                            cannot be undone.
                        </p>
                    </DialogContent>

                    <DialogActions sx={{ display: "flex", justifyContent: "center", padding: "10px 20px" }}>
                        <Button
                            variant="contained"
                            color="danger"
                            onClick={() => setDeleteRoleConf(false)}
                            sx={{
                                width: "150px",
                                marginRight: "10px",
                                border: "1px solid lightgrey",
                                boxShadow: "none",
                                "&:hover": {
                                    backgroundColor: "#f3f4f6",
                                    boxShadow: "none",
                                },
                            }}
                        >
                            Cancel
                        </Button>

                        <Button
                            variant="contained"
                            sx={{
                                color: "white",
                                backgroundColor: "#ef4444",
                                borderRadius: "5px",
                                "&:hover": {
                                    backgroundColor: "#dc2626",
                                },
                                width: "150px",
                                boxShadow: "none",
                            }}
                            onClick={() => handleDeleteRole()}
                        >
                            Delete
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>

            {
                loading && <div className='parent_spinner' tabIndex="-1" aria-hidden="true">
                    <CircularProgress size={100} />
                </div>
            }
        </Box>
    )
}

export default KGID