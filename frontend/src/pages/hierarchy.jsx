import { Box, Button, CircularProgress, FormControl, Grid, IconButton, InputAdornment, TextField, Typography, MenuItem, Select, InputLabel } from "@mui/material"
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
import Autocomplete from '@mui/material/Autocomplete';
import { ArrowBack } from "@mui/icons-material";

const Hierarchy = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [showViewModal, setShowViewModal] = useState();
    const [showEditModal, setShowEditModal] = useState();
    const [showRoleAddModal, setShowRoleAddModal] = useState(false)
    const [errorRoleData, setErrorRoleData] = useState({})
    const [searchValue, setSearchValue] = useState(null);
    const [designation, setDesignation] = useState([]);
    const [selectedDesignation, setSelectedDesignation] = useState(null);
    const [selectedSupervisorDesignation, setSelectedSupervisorDesignation] = useState(null);
    const [selectedRole, setSelectedRole] = useState({
        officer_designation_id: '',
        supervisor_designation_id: '',
    });
    const [delete_role_conf, setDeleteRoleConf] = useState(false)
    const [roleToDelete, setRoleToDelete] = useState(null);
    const [roleNameToDelete, setRoleNameToDelete] = useState("");
    const [addRoleData, setAddRoleData] = useState({
        officer_designation_id: "",
        supervisor_designation_id: "",
    });
    const [HierarchyRowData, setHierarchyRowData] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
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
            return HierarchyRowData;
        }
        return HierarchyRowData.filter((row) =>
            row.officer_designation_name.toLowerCase().includes(searchValue.toLowerCase()) ||
            row.supervisor_designation_name.toLowerCase().includes(searchValue.toLowerCase())
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

    const get_designation = async () => {
        try {
            const response = await api.post("/master_meta/fetch_specific_master_data", {
                master_name: "designation"
            });

            if (Array.isArray(response)) {
                const departmentList = response.map(dept => ({
                    id: dept.designation_id,
                    name: dept.designation_name
                }));

                setDesignation(departmentList);
            } else {
                toast.error("Failed to fetch Designation");
            }
        } catch (err) {
            let errorMessage = err?.response?.data?.message || "Something went wrong. Please try again.";
            toast.error(errorMessage);
        }
    };


    const get_hierarchy_details = async () => {
        if (designation.length === 0) {
            return;
        }

        setLoading(true);
        try {
            const response = await api.post("/master_meta/fetch_specific_master_data", {
                master_name: "hierarchy"
            });

            if (response) {
                const updatedData = response.map(row => {
                    const officerDesignation = designation.find(desgn => desgn.id === row.officer_designation_id);
                    const supervisorDesignation = designation.find(desgn => desgn.id === row.supervisor_designation_id);

                    return {
                        id: row.users_hierarchy_id,
                        officer_designation_name: officerDesignation ? officerDesignation.name : row.officer_designation_id,
                        supervisor_designation_name: supervisorDesignation ? supervisorDesignation.name : row.supervisor_designation_id,
                        officer_designation_id: row.officer_designation_id,
                        supervisor_designation_id: row.supervisor_designation_id
                    };
                });

                setHierarchyRowData(updatedData);
            } else {
                toast.error("Failed to fetch Hierarchy");
            }
        } catch (err) {
            let errorMessage = err?.response?.data?.message || "Something went wrong. Please try again.";
            toast.error(errorMessage);
        }
        setLoading(false);
    };
    useEffect(() => {
        get_designation();
    }, []);

    useEffect(() => {
        if (designation.length > 0) {
            get_hierarchy_details();
        }
    }, [designation]);


    const handleViewRole = (role) => {
        if (!role) return;

        setSelectedRole({
            users_hierarchy_id: role.users_hierarchy_id ?? "",
            officer_designation_id: role.officer_designation_id ?? "",
            supervisor_designation_id: role.supervisor_designation_id ?? "",
        });

        const selectedDept = designation.find(dept => dept.id === role.officer_designation_id);
        const selectedSuperDept = designation.find(dept => dept.id === role.supervisor_designation_id);

        setSelectedDesignation(selectedDept ? { code: selectedDept.id, name: selectedDept.name } : null);
        setSelectedSupervisorDesignation(selectedSuperDept ? { code: selectedSuperDept.id, name: selectedSuperDept.name } : null);

        setShowViewModal(true);
    };

    const handleEditRole = (role) => {
        if (!role) return;

        setSelectedRole({
            users_hierarchy_id: role.users_hierarchy_id ?? "",
            officer_designation_id: role.officer_designation_id ?? "",
            supervisor_designation_id: role.supervisor_designation_id ?? "",
        });

        const selectedDept = designation.find(dept => dept.id === role.officer_designation_id);
        const selectedSuperDept = designation.find(dept => dept.id === role.supervisor_designation_id);

        setSelectedDesignation(selectedDept ? { code: selectedDept.id, name: selectedDept.name } : null);
        setSelectedSupervisorDesignation(selectedSuperDept ? { code: selectedSuperDept.id, name: selectedSuperDept.name } : null);

        setShowEditModal(true);
    };

    const hierarchyColumnData = [
        { field: 'officer_designation_name', headerName: 'Officer Designation', width: 200 },
        { field: 'supervisor_designation_name', headerName: 'Supervisor Designation', width: 300 },
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
            const response = await api.post("/master_meta/delete_master_data", { master_name: "hierarchy", id });
            if (!response || !response.success) {
                let errorMessage = response.message || "Error deleting hierarchy";
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

            toast.success(response.message || "Hierarchy Deleted Successfully", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                className: "toast-success",
            });

            get_hierarchy_details();

        } catch (err) {
            let errorMessage = err.response?.message || "Something went wrong. Please try again.";

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
    const handleAddSaveData = async () => {
        var error_flag = false;

        if (addRoleData.officer_designation_id === '') {
            error_flag = true;
            setErrorRoleData((prevData) => ({
                ...prevData,
                officer_designation_id: 'Officer Designation is required'
            }));
        }

        if (addRoleData.supervisor_designation_id === '') {
            error_flag = true;
            setErrorRoleData((prevData) => ({
                ...prevData,
                supervisor_designation_id: 'Supervisor Designation is required'
            }));
        }

        if (error_flag) {
            toast.error("Please check the required fields", {
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
                master_name: "hierarchy",
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

            toast.success(response.message || "Hierarchy Created Successfully", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                className: "toast-success"
            });

            get_hierarchy_details();

            setAddRoleData({
                officer_designation_id: '',
                supervisor_designation_id: '',
            });
            setSelectedDesignation("");
            setShowRoleAddModal(false);

        } catch (err) {
            let errorMessage = err.message || "Something went wrong. Please try again.";
            if (err?.response?.data?.message) {
                errorMessage = err?.response?.data?.message;
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

    const handleEditData = async () => {
        var error_flag = false;

        if (selectedRole.officer_designation_id === '') {
            error_flag = true;
            setErrorRoleData((prevData) => ({
                ...prevData,
                officer_designation_id: 'Officer Designation is required'
            }));
        }

        if (selectedRole.supervisor_designation_id === '') {
            error_flag = true;
            setErrorRoleData((prevData) => ({
                ...prevData,
                supervisor_designation_id: 'Supervisor Designation is required'
            }));
        }

        if (error_flag) {
            toast.error("Please check the required fields", {
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
            master_name: "hierarchy",
            data: {
                hierarchy_id: selectedRole.id,
                officer_designation_id: selectedRole.officer_designation_id,
                supervisor_designation_id: selectedRole.supervisor_designation_id,
            }
        };

        setLoading(true);
        try {
            const response = await api.post("/master_meta/update_master_data", requestData);

            if (!response || !response.success) {
                toast.error(response.message || "Error updating Hierarchy", {
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

            toast.success(response.message || "Hierarchy updated successfully", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                className: "toast-success",
            });

            get_hierarchy_details();
            setShowEditModal(false);
        } catch (err) {
            let errorMessage = err.message || "Something went wrong. Please try again.";
            if (err?.response?.data?.message) {
                errorMessage = err?.response?.data?.message;
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


    useEffect(() => {
        if (selectedRole && selectedRole.department_id && designation.length > 0) {
            const matchedDepartment = designation.find(dept => dept.id === selectedRole.designation_id);
            setSelectedDesignation(matchedDepartment ? { code: matchedDepartment.id, name: matchedDepartment.name } : null);
        }
    }, [selectedRole, designation]);


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
                            Hierarchy
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
                            Add Hierarchy
                        </Button>
                    </Box>
                </Box>
                <Box py={2}>
                    <TableView
                        rows={currentPageRows}
                        columns={hierarchyColumnData}
                        handleNext={handleNext}
                        handleBack={handleBack}
                        backBtn={currentPage > 0}
                        nextBtn={currentPage < totalPages - 1}
                        getRowId={(row) => row.id}
                    />

                </Box>
            </Box>

            {/* add , view , edit Hierarchy modal */}

            <Dialog
                open={showViewModal || showEditModal || showRoleAddModal}
                onClose={() => {
                    setShowViewModal(false);
                    setShowEditModal(false);
                    setShowRoleAddModal(false);
                    setErrorRoleData({ officer_designation_id: '', supervisor_designation_id: '' });
                    setSelectedDesignation(null);
                    setSelectedSupervisorDesignation(null);
                    setAddRoleData({ officer_designation_id: '', supervisor_designation_id: '' });
                    setSelectedRole(prev => prev ? { ...prev, officer_designation_id: '', supervisor_designation_id: '' } : prev);
                }}

                aria-labelledby="hierarchy-dialog-title"
                maxWidth="md"
                fullWidth
            >
                <DialogTitle id="hierarchy-dialog-title" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    {showViewModal && "View Hierarchy"}
                    {showEditModal && "Edit Hierarchy"}
                    {showRoleAddModal && "Add New Hierarchy"}
                    <IconButton
                        aria-label="close"
                        onClick={() => {
                            setShowViewModal(false);
                            setShowEditModal(false);
                            setShowRoleAddModal(false);
                            setErrorRoleData({ officer_designation_id: '', supervisor_designation_id: '' });
                        }}
                        sx={{ color: (theme) => theme.palette.grey[500] }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <DialogContent>
                    <DialogContentText>
                        <FormControl fullWidth>
                            <Box sx={{ marginBottom: "18px" }}>
                                <Autocomplete
                                    options={designation}
                                    getOptionLabel={(option) => option.name}
                                    value={selectedDesignation}
                                    onChange={(event, newValue) => {
                                        setSelectedDesignation(newValue);
                                        const designationId = newValue ? newValue.id : null;
                                        setSelectedRole((prev) => ({ ...prev, officer_designation_id: designationId }));
                                        setAddRoleData((prev) => ({ ...prev, officer_designation_id: designationId }));
                                    }}
                                    renderInput={(params) => <TextField {...params} label="Select Designation" variant="outlined" />}
                                />
                            </Box>

                            <Box sx={{ marginBottom: "18px" }}>
                                <Autocomplete
                                    options={designation}
                                    getOptionLabel={(option) => option.name}
                                    value={selectedSupervisorDesignation}
                                    onChange={(event, newValue) => {
                                        setSelectedSupervisorDesignation(newValue);
                                        const designationId = newValue ? newValue.id : null;
                                        setSelectedRole((prev) => ({ ...prev, supervisor_designation_id: designationId }));
                                        setAddRoleData((prev) => ({ ...prev, supervisor_designation_id: designationId }));
                                    }}
                                    renderInput={(params) => <TextField {...params} label="Select Supervisor Designation" variant="outlined" />}
                                />
                            </Box>
                        </FormControl>
                    </DialogContentText>
                </DialogContent>

                <DialogActions sx={{ padding: '12px 24px' }}>
                    <Button
                        onClick={() => {
                            setShowViewModal(false);
                            setShowEditModal(false);
                            setShowRoleAddModal(false);
                            setErrorRoleData({ officer_designation_id: '', supervisor_designation_id: '' });
                            setSelectedDesignation(null);
                            setSelectedSupervisorDesignation(null);
                            setAddRoleData({ officer_designation_id: '', supervisor_designation_id: '' });
                            setSelectedRole(null);
                        }}
                    >
                        Close
                    </Button>
                    {showEditModal && (
                        <Button variant="outlined" onClick={handleEditData}>
                            Edit Hierarchy
                        </Button>
                    )}
                    {showRoleAddModal && (
                        <Button variant="outlined" onClick={handleAddSaveData}>
                            Add Hierarchy
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
                            Are you sure you want to delete the {roleNameToDelete} Hierarchy? This action
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

export default Hierarchy