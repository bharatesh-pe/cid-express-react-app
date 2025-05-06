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
import FilterListIcon from "@mui/icons-material/FilterList";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import WestIcon from '@mui/icons-material/West';

const Approval = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [showViewModal, setShowViewModal] = useState();
    const [showEditModal, setShowEditModal] = useState();
    const [selectedRole, setSelectedRole] = useState({
        name: '',
        description: '',
        permissions: {},
    });
    const [delete_role_conf, setDeleteRoleConf] = useState(false)
    const [roleToDelete, setRoleToDelete] = useState(null);
    const [roleNameToDelete, setRoleNameToDelete] = useState("");
    const [addRoleData, setAddRoleData] = useState({
        "name": '',
        "description": '',
        "created_by": '0',
    });
    const [approvalItemRowData, setApprovalItemRowData] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [showRoleAddModal, setShowRoleAddModal] = useState(false)
    const [errorRoleData, setErrorRoleData] = useState({})
    const [searchValue, setSearchValue] = useState(null);
    const pageSize = 10;

    const [showFilterModal, setShowFilterModal] = useState(false);
    const [filterDropdownObj, setfilterDropdownObj] = useState([]);
    const [filterValues, setFilterValues] = useState({});
    const [fromDateValue, setFromDateValue] = useState(null);
    const [toDateValue, setToDateValue] = useState(null);
    const [forceTableLoad, setForceTableLoad] = useState(false);
    const [paginationCount, setPaginationCount] = useState(1);

    const [totalPage, setTotalPage] = useState(0);
    const [totalRecord, setTotalRecord] = useState(0);
    
    const handlePagination = (page) => {
        setPaginationCount(page)
    }

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

    const handleViewRole = (role) => {
        setSelectedRole(role);
        setShowViewModal(true);
    };

    const handleEditRole = (role) => {
        setSelectedRole({
            id: role.id,
            name: role.name,
            description: role.description,
        });

        setShowEditModal(true);
    };


    const approvalItemColumnData = [
        { field: 'name', headerName: 'Item', width: 200 },
        { field: 'description', headerName: 'Description', width: 300 },
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
            const response = await api.post("/master_meta/delete_master_data", { master_name: "Approval Item", id });
            if (!response || !response.success) {
                let errorMessage = response.message || "Error deleting item";
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

            toast.success(response.message || "Item Deleted Successfully", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                className: "toast-success",
            });

            get_approval_items_details(paginationCount);

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


    const get_approval_items_details = async (page) => {

        const getTemplatePayload = {
            page,
            limit: 10,
            search: searchValue || "",
            from_date: fromDateValue,
            to_date: toDateValue,
            filter: filterValues,
            master_name: "approval_item"
        };

        setLoading(true);
        try {
            const response = await api.post("/master_meta/fetch_specific_master_data", getTemplatePayload);
            setLoading(false);
            if (response) {

                const { data, meta } = response;

                const totalPages = meta?.totalPages || 1;
                const totalItems = meta?.totalItems || 0;
                
                if (totalPages !== null && totalPages !== undefined) {
                    setTotalPage(totalPages);
                }
                
                if (totalItems !== null && totalItems !== undefined) {
                    setTotalRecord(totalItems);
                }

                const updatedData = data.map(row => {
                    return {
                        id: row.approval_item_id,
                        name: row.name,
                        description: row.description || "N/A"
                    };
                });
                setApprovalItemRowData(updatedData);
            } else {
                toast.error("Failed to fetch items");
            }
        } catch (err) {
            setLoading(false);
            let errorMessage = err?.response?.data?.message || "Something went wrong. Please try again.";
            toast.error(errorMessage);
        }
    };

    useEffect(() => {
        get_approval_items_details(paginationCount);
    }, [paginationCount, forceTableLoad]);


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

        if (addRoleData.name.trim() === '') {
            error_flag = true;
            setErrorRoleData((prevData) => ({
                ...prevData,
                name: 'Title is required'
            }));
        }

        // if (addRoleData.description.trim() === '') {
        //     error_flag = true;
        //     setErrorRoleData((prevData) => ({
        //         ...prevData,
        //         description: 'Description is required'
        //     }));
        // }

        if (error_flag) {
            toast.error("Please Check Title and Description", {
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
                master_name: "Approval Item",
                data: addRoleData,
                transaction_id:  `approvalItem_${Date.now()}_${Math.floor( Math.random() * 1000 )}`, 
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

            toast.success(response.message || "Approval Item Created Successfully", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                className: "toast-success"
            });

            get_approval_items_details(paginationCount);

            setAddRoleData({
                "name": '',
                "description": '',
                "created_by": '0',
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


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSelectedRole(prevState => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleEditData = async () => {
        var error_flag = false;

        if (selectedRole.name.trim() === '') {
            error_flag = true;
            setErrorRoleData((prevData) => ({
                ...prevData,
                name: 'Item Name is required',
            }));
        }

        // if (selectedRole.description.trim() === '') {
        //     error_flag = true;
        //     setErrorRoleData((prevData) => ({
        //         ...prevData,
        //         description: 'Description is required',
        //     }));
        // }

        if (error_flag) {
            toast.error("Please check Name and Description", {
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
            master_name: "Approval Item",
            data: {
                approval_item_id: selectedRole.id,
                name: selectedRole.name,
                description: selectedRole.description,
            }
        };

        setLoading(true);
        try {
            const response = await api.post("/master_meta/update_master_data", requestData);

            if (!response || !response.success) {
                toast.error(response.message || "Error updating role", {
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

            toast.success(response.message || "Role updated successfully", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                className: "toast-success",
            });

            get_approval_items_details(paginationCount);
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

    const setFilterData = () => {
        setPaginationCount(1);
        setShowFilterModal(false);
        setForceTableLoad((prev) => !prev);
    };

    const handleFilter = async () => {            
        setShowFilterModal(true);
    };

    const handleClear = () => {
        setSearchValue("");
        setFromDateValue(null);
        setToDateValue(null);
        setForceTableLoad((prev) => !prev);
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
                            Approval Items
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "end",
                            }}
                        >
                            <TextFieldInput
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon sx={{ color: "#475467" }} />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                            <IconButton
                                                sx={{ padding: "0 5px", borderRadius: "0" }}
                                                onClick={handleFilter}
                                            >
                                                <FilterListIcon sx={{ color: "#475467" }} />
                                            </IconButton>
                                        </Box>
                                    ),
                                }}
                                onInput={(e) => setSearchValue(e.target.value)}
                                value={searchValue}
                                id="tableSearch"
                                size="small"
                                placeholder="Search Approval Item"
                                variant="outlined"
                                className="profileSearchClass"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        setFilterData()
                                    }
                                }}
                                sx={{
                                    width: "350px",
                                    borderRadius: "6px",
                                    outline: "none",
                                    "& .MuiInputBase-input::placeholder": {
                                        color: "#475467",
                                        opacity: "1",
                                        fontSize: "14px",
                                        fontWeight: "400",
                                        fontFamily: "Roboto",
                                    },
                                }}
                            />
                            {(  searchValue ||
                                fromDateValue ||
                                toDateValue ||
                                Object.keys(filterValues).length > 0) && (
                                <Typography
                                onClick={handleClear}
                                sx={{
                                    fontSize: "13px",
                                    fontWeight: "500",
                                    textDecoration: "underline",
                                    cursor: "pointer",
                                }}
                                mt={1}
                                >
                                Clear Filter
                                </Typography>
                            )}
                        </Box>
                        <Button
                            onClick={() => {
                                setAddRoleData(prevData => ({
                                    ...prevData,
                                }));
                                setShowRoleAddModal(true);
                            }}
                            sx={{
                                height: "38px",
                                }}
                            className="blueButton"
                            startIcon={
                                <AddIcon
                                    sx={{
                                        border: "1.3px solid #FFFFFF",
                                        borderRadius: "50%",
                                        background:"#4D4AF3 !important",
                                    }}
                                />
                            }
                            variant="contained"
                            >
                                Add Item
                        </Button>                         

                    </Box>
                </Box>
                <Box py={2}>
                    <TableView
                        rows={approvalItemRowData}
                        columns={approvalItemColumnData}
                        totalPage={totalPage} 
                        totalRecord={totalRecord} 
                        paginationCount={paginationCount} 
                        handlePagination={handlePagination} 
                        getRowId={(row) => row.id}
                    />

                </Box>
            </Box>

            {/* add , view , edit Approval Items modal */}

            <Dialog
                open={showViewModal || showEditModal || showRoleAddModal}
                onClose={() => {
                    setShowViewModal(false);
                    setShowEditModal(false);
                    setShowRoleAddModal(false);
                    setErrorRoleData({ name: '', description: '' });
                    setAddRoleData({ name: '', description: '' });
                    setSelectedRole(null);            
                }}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                fullScreen
                fullWidth
                sx={{ marginLeft: '50px' }}        
            >
                <DialogTitle id="hierarchy-dialog-title" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                        onClick={() => {
                            setShowViewModal(false);
                            setShowEditModal(false);
                            setShowRoleAddModal(false);
                            setErrorRoleData({ name: '', description: '' });
                            setAddRoleData({ name: '', description: '' });
                            setSelectedRole(null);            
                        }}
                        >
                        <WestIcon sx={{ color: 'black' }}/>
                        <Typography sx={{ fontSize: '18px', fontWeight: 500,}}>
                        {showViewModal && "View Approval Items"}
                        {showEditModal && "Edit Approval Items"}
                        {showRoleAddModal && "Add Item"}
                        </Typography>
                    </Box>

                    {showEditModal && (
                        <Button variant="outlined" onClick={handleEditData}>
                            Update Approval Items
                        </Button>
                    )}
                    {showRoleAddModal && (
                        <Button variant="outlined" onClick={handleAddSaveData}>
                            Add Item
                        </Button>
                    )}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        <FormControl fullWidth>
                            <Box sx={{ marginY: '18px' }}>
                                <h4 className="form-field-heading" style={{ color: !!errorRoleData.name && '#d32f2f' }}>
                                    Item Name
                                </h4>
                                <TextField
                                    fullWidth
                                    label="Item Name"
                                    name="name"
                                    autoComplete="off"
                                    value={showRoleAddModal ? addRoleData.name : selectedRole?.name || selectedRole?.name}
                                    onChange={(e) => {
                                        if (showViewModal) return;

                                        const regex = /^[a-zA-Z0-9\s\b]*$/;
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

                            <Box sx={{ marginBottom: '18px' }}>
                                <h4 className="form-field-heading" style={{ color: !!errorRoleData.description && '#d32f2f' }}>
                                    Description
                                </h4>
                                <TextField
                                    fullWidth
                                    label="Description"
                                    name="description"
                                    autoComplete="off"
                                    value={showRoleAddModal ? addRoleData.description : selectedRole?.description || ""}
                                    onChange={(e) => {
                                        const regex = /^[a-zA-Z0-9\s/,.\b]*$/;
                                        if (regex.test(e.target.value)) {
                                            showRoleAddModal ? handleAddData(e) : handleInputChange(e);
                                        }
                                    }}
                                    error={!!errorRoleData.description}
                                    required={showEditModal || showRoleAddModal}
                                    disabled={showViewModal}
                                />
                            </Box>
                        </FormControl>
                    </DialogContentText>
                </DialogContent>
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
                            Are you sure you want to delete the {roleNameToDelete} Item? This action
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

            {showFilterModal && (
                <Dialog
                    open={showFilterModal}
                    onClose={() => setShowFilterModal(false)}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                    maxWidth="md"
                    fullWidth
                >
                    <DialogTitle
                    id="alert-dialog-title"
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                    }}
                    >
                    Filter
                    <IconButton
                        aria-label="close"
                        onClick={() => setShowFilterModal(false)}
                        sx={{ color: (theme) => theme.palette.grey[500] }}
                    >
                        <CloseIcon />
                    </IconButton>
                    </DialogTitle>
                    <DialogContent sx={{ minWidth: "400px" }}>
                    <DialogContentText id="alert-dialog-description">
                        <Grid container sx={{ alignItems: "center" }}>
                        <Grid item xs={12} md={6} p={2}>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                                format="DD-MM-YYYY"
                                sx={{
                                width: "100%",
                                }}
                                label="From Date"
                                value={fromDateValue ? dayjs(fromDateValue) : null}
                                onChange={(e) =>
                                setFromDateValue(e ? e.format("YYYY-MM-DD") : null)
                                }
                            />
                            </LocalizationProvider>
                        </Grid>
        
                        <Grid item xs={12} md={6} p={2}>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                                format="DD-MM-YYYY"
                                sx={{
                                width: "100%",
                                }}
                                label="To Date"
                                value={toDateValue ? dayjs(toDateValue) : null}
                                onChange={(e) =>
                                setToDateValue(e ? e.format("YYYY-MM-DD") : null)
                                }
                            />
                            </LocalizationProvider>
                        </Grid>
                        </Grid>
                    </DialogContentText>
                    </DialogContent>
                    <DialogActions sx={{ padding: "12px 24px" }}>
                    <Button onClick={() => setShowFilterModal(false)}>Close</Button>
                    <Button
                        className="fillPrimaryBtn"
                        sx={{ minWidth: "100px" }}
                        onClick={() => setFilterData()}
                    >
                        Apply
                    </Button>
                    </DialogActions>
                </Dialog>
            )}
        </Box>
    )
}

export default Approval