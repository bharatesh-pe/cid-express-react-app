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

            toast.success("KGID Deleted Successfully", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                className: "toast-success",
            });

            get_department_details(paginationCount);

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


    const get_department_details = async (page) => {

        const getTemplatePayload = {
            page,
            limit: 10,
            search: searchValue || "",
            from_date: fromDateValue,
            to_date: toDateValue,
            filter: filterValues,
            master_name: "kgid"
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
            setLoading(false);
            let errorMessage = err?.response?.data?.message || "Something went wrong. Please try again.";
            toast.error(errorMessage);
        }
    };

    useEffect(() => {
        get_department_details(paginationCount);
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
                data: addRoleData,
                transaction_id:  `kgid_${Date.now()}_${Math.floor( Math.random() * 1000 )}`, 
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

            toast.success("KGID Created Successfully", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                className: "toast-success"
            });

            get_department_details(paginationCount);

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

            toast.success("KGID updated successfully", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                className: "toast-success",
            });

            get_department_details(paginationCount);
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
                            KGID
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
                                placeholder="Search Anything"
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
                                Add KGID
                        </Button>                        
                    </Box>
                </Box>
                <Box py={2}>
                    <TableView
                        rows={departmentRowData}
                        columns={departmentColumnData}
                        totalPage={totalPage} 
                        totalRecord={totalRecord} 
                        paginationCount={paginationCount} 
                        handlePagination={handlePagination} 
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
                            setErrorRoleData({ kgid: '', name: '', mobile: ''});
                        }}
                        >
                        <WestIcon sx={{ color: 'black' }}/>
                        <Typography sx={{ fontSize: '18px', fontWeight: 500,}}>
                        {showViewModal && "View KGID"}
                        {showEditModal && "Edit KGID"}
                        {showRoleAddModal && "Add New KGID"}
                        </Typography>
                    </Box>

                    {showEditModal && (
                        <Button variant="outlined" onClick={handleEditData}>
                            Update KGID
                        </Button>
                    )}
                    {showRoleAddModal && (
                        <Button variant="outlined" onClick={handleAddSaveData}>
                            Add KGID
                        </Button>
                    )}
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

export default KGID