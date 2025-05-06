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
import FilterListIcon from "@mui/icons-material/FilterList";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import WestIcon from '@mui/icons-material/West';

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

    const [showFilterModal, setShowFilterModal] = useState(false);
    const [filterDropdownObj, setfilterDropdownObj] = useState([]);
    const [filterValues, setFilterValues] = useState({});
    const [fromDateValue, setFromDateValue] = useState(null);
    const [toDateValue, setToDateValue] = useState(null);
    const [forceTableLoad, setForceTableLoad] = useState(false);
    const [paginationCount, setPaginationCount] = useState(1);

    const [totalPage, setTotalPage] = useState(0);
    const [totalRecord, setTotalRecord] = useState(0);
    const [rawDesignationData, setRawDesignationData] = useState([]);
    const [designationDetails, setDesignationDetails] = useState(null);
    const [allDepartments, setAllDepartments] = useState([]);
    const [allDivisions, setAllDivisions] = useState([]);
    const [structuredDesignation, setStructuredDesignation] = useState([]);
    
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
    const fetchMasterData = async () => {
        try {
            setLoading(true);
            const payload = { needed_masters: ["department", "division"] };
            const response = await api.post("/master/get_master_data", payload);
            setLoading(false);

            let deptData = allDepartments;
            let divData = allDivisions;
    
            if (Array.isArray(response.department)) {
                deptData = response.department;
                setAllDepartments(deptData);
            }
    
            if (Array.isArray(response.division)) {
                divData = response.division;
                setAllDivisions(divData);
            }
    
            return { deptData, divData };
        } catch (err) {
            setLoading(false);    
            toast.error("Failed to load master data");
            throw err;
        }
    };
    
    const processDesignationData = (selectedDetail, deptData, divData) => {
        const deptIds = selectedDetail?.department_id?.split(',') || [];
        const divIds = selectedDetail?.division_id?.split(',') || [];
    
        const departments = deptIds
            .map(id => deptData.find(d => String(d.code) === String(id)))
            .filter(Boolean);
    
        const divisions = divIds
            .map(id => divData.find(d => String(d.code) === String(id)))
            .filter(Boolean);
    
        return departments.map(dept => {
            const relatedDivs = divisions.filter(div => String(div.department_id) === String(dept.code));
            return { ...dept, divisions: relatedDivs };
        });
    };
    
    
        
    const get_designation = async () => {
        setLoading(true);
        try {
            const response = await api.post("/master_meta/fetch_specific_master_data", {
                master_name: "designation",
                get_all: true,
            });

            const { data } = response;

            if (Array.isArray(data)) {
                setRawDesignationData(data);
                const departmentList = data.map(dept => ({
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
        setLoading(false);
    };

    const get_hierarchy_details = async (page) => {
        if (designation.length === 0) {
            return;
        }

        const getTemplatePayload = {
            page,
            limit: 10,
            from_date: fromDateValue,
            to_date: toDateValue,
            filter: filterValues,
            master_name: "hierarchy"
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
            setLoading(false);
            let errorMessage = err?.response?.data?.message || "Something went wrong. Please try again.";
            toast.error(errorMessage);
        }
    };
    useEffect(() => {
        get_designation();
    }, []);

    useEffect(() => {
        if (designation.length > 0) {
            get_hierarchy_details(paginationCount);
        }
    }, [designation, paginationCount, forceTableLoad]);


    const handleViewRole = async (role) => {
        if (!role) return;
    
        setSelectedRole({
            users_hierarchy_id: role.users_hierarchy_id ?? "",
            officer_designation_id: role.officer_designation_id ?? "",
            supervisor_designation_id: role.supervisor_designation_id ?? "",
        });
    
        const selectedDept = designation.find(dept => String(dept.id) === String(role.officer_designation_id));
        const selectedSuperDept = designation.find(dept => String(dept.id) === String(role.supervisor_designation_id));
    
        setSelectedDesignation(selectedDept ? { code: selectedDept.id, name: selectedDept.name } : null);
        setSelectedSupervisorDesignation(selectedSuperDept ? { code: selectedSuperDept.id, name: selectedSuperDept.name } : null);
    
        const selectedDetail = rawDesignationData.find(item => 
            String(item.designation_id) === String(role.officer_designation_id)
        );
    
        setDesignationDetails(selectedDetail || null);
    
        try {
            const { deptData, divData } = await fetchMasterData();
        
            if (selectedDetail) {
                const result = processDesignationData(selectedDetail, deptData, divData);
    
                const structured = Array.isArray(result) ? result : [];
                setStructuredDesignation(structured);
            } else {
                setStructuredDesignation([]);
            }
    
            setShowViewModal(true);
        } catch (err) {
            console.error("Failed in handleViewRole:", err);
            toast.error("Failed to load master data");
            setStructuredDesignation([]);
        }
    };
    
    
    

    const handleEditRole = async(role) => {
        if (!role) return;

        setSelectedRole({
            users_hierarchy_id: role.id ?? "",
            officer_designation_id: role.officer_designation_id ?? "",
            supervisor_designation_id: role.supervisor_designation_id ?? "",
        });

        const selectedDept = designation.find(dept => dept.id === role.officer_designation_id);
        const selectedSuperDept = designation.find(dept => dept.id === role.supervisor_designation_id);

        setSelectedDesignation(selectedDept ? { code: selectedDept.id, name: selectedDept.name } : null);
        setSelectedSupervisorDesignation(selectedSuperDept ? { code: selectedSuperDept.id, name: selectedSuperDept.name } : null);

        const selectedDetail = rawDesignationData.find(item => 
            String(item.designation_id) === String(role.officer_designation_id)
        );
    
        setDesignationDetails(selectedDetail || null);
    
        try {
            const { deptData, divData } = await fetchMasterData();
        
            if (selectedDetail) {
                const result = processDesignationData(selectedDetail, deptData, divData);
    
                const structured = Array.isArray(result) ? result : [];
                setStructuredDesignation(structured);
            } else {
                setStructuredDesignation([]);
            }
    
            setShowEditModal(true);
        } catch (err) {
            console.error("Failed in handleeditRole:", err);
            toast.error("Failed to load master data");
            setStructuredDesignation([]);
        }

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
                    // <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px', height: '100%' }}>
                    //     <Button
                    //         style={{
                    //             background: "transparent",
                    //             border: "none",
                    //             padding: "0",
                    //             boxShadow: "none",
                    //             display: "flex",
                    //             alignItems: "center",
                    //             gap: "6px",
                    //             color: "black",
                    //             fontSize: "14px",
                    //             textAlign: "center",
                    //             textTransform: "none",
                    //         }}
                    //         onClick={() => handleViewRole(params.row)}
                    //     >
                    //         <img
                    //             src={eyes}
                    //             alt="View"
                    //             style={{ width: "20px", height: "20px" }}
                    //         />
                    //         <span>View</span>
                    //     </Button>
                    //     <Button
                    //         style={{
                    //             background: "transparent",
                    //             border: "none",
                    //             padding: "0",
                    //             boxShadow: "none",
                    //             display: "flex",
                    //             alignItems: "center",
                    //             gap: "6px",
                    //             color: "black",
                    //             fontSize: "14px",
                    //             textAlign: "center",
                    //             textTransform: "none",
                    //         }}
                    //         onClick={() => {

                    //             handleEditRole(params.row)
                    //         }}
                    //     >
                    //         <img
                    //             src={edit}
                    //             alt="Edit"
                    //             style={{ width: "20px", height: "20px" }}
                    //         />
                    //         <span>Edit</span>
                    //     </Button>
                    //     {/* <Button
                    //         style={{
                    //             background: "transparent",
                    //             border: "none",
                    //             padding: "0",
                    //             boxShadow: "none",
                    //             display: "flex",
                    //             alignItems: "center",
                    //             gap: "6px",
                    //             color: "Red",
                    //             fontSize: "14px",
                    //             textAlign: "center",
                    //             textTransform: "none",
                    //         }}
                    //         onClick={() => showDeleteRoleDialoge(params.row.id, params.row.name)}
                    //     >
                    //         <img
                    //             src={trash}
                    //             alt="Delete"
                    //             style={{ width: "20px", height: "20px" }}
                    //         />
                    //         <span>Delete</span>
                    //     </Button> */}
                    // </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px', height: '100%' }}>
                        <Button variant="outlined"  onClick={() => {

                                handleViewRole(params.row)
                            }}>
                            View
                        </Button>
                        <Button variant="contained" color="primary"  onClick={() => {

                                handleEditRole(params.row)
                            }}>
                            Edit
                        </Button>
                        {/* <Button variant="contained" color="error"  onClick={() => showDeleteRoleDialoge(params.row.id, params.row.name)}>
                            Delete
                        </Button> */}
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
            const response = await api.post("/master_meta/delete_master_data", { master_name: "Hierarchy", id });
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

            get_hierarchy_details(paginationCount);

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
                master_name: "Hierarchy",
                data: addRoleData,
                transaction_id:  `hierarchy_${Date.now()}_${Math.floor( Math.random() * 1000 )}`, 
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

            get_hierarchy_details(paginationCount);

            setAddRoleData({
                officer_designation_id: '',
                supervisor_designation_id: '',
            });
            setSelectedDesignation(null);
            setSelectedSupervisorDesignation(null)
            setDesignationDetails(null);
            setStructuredDesignation([]);
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
            master_name: "Hierarchy",
            data: {
                hierarchy_id: selectedRole.users_hierarchy_id,
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

            get_hierarchy_details(paginationCount);
            setSelectedDesignation(null);
            setDesignationDetails(null);
            setStructuredDesignation([]);
            setSelectedSupervisorDesignation(null)
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
                            Hierarchy
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
                                placeholder="Search Hierarchy"
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
                                Add Hierarchy
                        </Button>                         
                    </Box>
                </Box>
                <Box py={2}>
                    <TableView
                        rows={HierarchyRowData}
                        columns={hierarchyColumnData}
                        totalPage={totalPage} 
                        totalRecord={totalRecord} 
                        paginationCount={paginationCount} 
                        handlePagination={handlePagination} 
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
                            setErrorRoleData({ officer_designation_id: '', supervisor_designation_id: '' });
                            setSelectedDesignation(null);
                            setSelectedSupervisorDesignation(null);
                            setAddRoleData({ officer_designation_id: '', supervisor_designation_id: '' });
                            setSelectedRole(null);
                            setDesignationDetails(null);
                            setStructuredDesignation([]);
                        }}
                        >
                        <WestIcon sx={{ color: 'black' }}/>
                        <Typography sx={{ fontSize: '18px', fontWeight: 500,}}>
                        {showViewModal && "View Hierarchy"}
                        {showEditModal && "Edit Hierarchy"}
                        {showRoleAddModal && "Add Hierarchy"}
                        </Typography>
                    </Box>

                    {showEditModal && (
                        <Button variant="outlined" onClick={handleEditData}>
                            Update Hierarchy
                        </Button>
                    )}
                    {showRoleAddModal && (
                        <Button variant="outlined" onClick={handleAddSaveData}>
                            Add Hierarchy
                        </Button>
                    )}
                </DialogTitle>

                <DialogContent>
                    <Box>
                        <FormControl fullWidth>
                            <Box sx={{ marginBottom: "18px" }}>
                            <h4 className="form-field-heading" style={{ color: !!errorRoleData.officer_designation_id && '#d32f2f' }}>
                                    Officer Designation
                                </h4>

                                <Autocomplete
                                options={designation}
                                getOptionLabel={(option) => option.name}
                                value={selectedDesignation}
                                onChange={async (event, newValue) => {
                                    setSelectedDesignation(newValue);
                                    const designationId = newValue ? newValue.id : null;
                            
                                    setSelectedRole((prev) => ({ ...prev, officer_designation_id: designationId }));
                                    setAddRoleData((prev) => ({ ...prev, officer_designation_id: designationId }));
                            
                                    const selectedDetail = rawDesignationData.find(item => item.designation_id === designationId);
                                    setDesignationDetails(selectedDetail || null);
                            
                                    if (!selectedDetail) return;
                            
                                    try {
                                        const { deptData, divData } = await fetchMasterData();
                            
                                        const structured = processDesignationData(selectedDetail, deptData, divData);
                                        setStructuredDesignation(structured);
                                    } catch (err) {
                                        // Error handling is already in fetchMasterData
                                    }
                                }}                                
                                disabled={showViewModal || showEditModal}
                                renderInput={(params) => (
                                    <TextField {...params} label="Select Designation" variant="outlined" />
                                )}
                                />

                            </Box>
                            <h4 className="form-field-heading" style={{ color: !!errorRoleData.supervisor_designation_id && '#d32f2f' }}>
                            Supervisor Designation
                            </h4>
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
                                    disabled={showViewModal}
                                    renderInput={(params) => <TextField {...params} label="Select Supervisor Designation" variant="outlined" />}
                                />
                            </Box>

                            {(showViewModal || showEditModal || (showRoleAddModal && designationDetails)) && (
                                <Box sx={{ mt: 3 }}>
                                    <h4 className="form-field-heading">Designation Details</h4>
                                    <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #ccc" }}>
                                        <thead>
                                            <tr style={{ background: "#f0f0f0" }}>
                                                <th style={{ border: "1px solid #ccc", padding: "8px" }}>Department</th>
                                                <th style={{ border: "1px solid #ccc", padding: "8px" }}>Division</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {structuredDesignation.length > 0 ? (
                                                structuredDesignation.map((dept) => {
                                                    if (dept.divisions.length > 0) {
                                                        return dept.divisions.map((div, index) => (
                                                            <tr key={div.code}>
                                                                {index === 0 && (
                                                                    <td
                                                                        rowSpan={dept.divisions.length}
                                                                        style={{ border: "1px solid #ccc", padding: "8px", verticalAlign: "top" }}
                                                                    >
                                                                        {dept.name || "-"}
                                                                    </td>
                                                                )}
                                                                <td style={{ border: "1px solid #ccc", padding: "8px" }}>{div.name || "-"}</td>
                                                            </tr>
                                                        ));
                                                    } else {
                                                        return (
                                                            <tr key={dept.code}>
                                                                <td style={{ border: "1px solid #ccc", padding: "8px" }}>{dept.name || "-"}</td>
                                                                <td style={{ border: "1px solid #ccc", padding: "8px" }}>-</td>
                                                            </tr>
                                                        );
                                                    }
                                                })
                                            ) : (
                                                <tr>
                                                    <td style={{ border: "1px solid #ccc", padding: "8px" }}>-</td>
                                                    <td style={{ border: "1px solid #ccc", padding: "8px" }}>-</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </Box>
                            )}


                        </FormControl>
                    </Box>
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

export default Hierarchy