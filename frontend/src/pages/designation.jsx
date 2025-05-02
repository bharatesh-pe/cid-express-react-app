import { Autocomplete, Box, Button, CircularProgress, FormControl, Grid, IconButton, InputAdornment, TextField, Typography } from "@mui/material"
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

const Designation = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [showViewModal, setShowViewModal] = useState();
    const [showEditModal, setShowEditModal] = useState();
    const [selectedRole, setSelectedRole] = useState({
        designation_name: '',
        description: '',
        permissions: {},
    });
    const [showRoleAddModal, setShowRoleAddModal] = useState(false)
    const [errorRoleData, setErrorRoleData] = useState({})
    const [searchValue, setSearchValue] = useState(null);
    const [delete_role_conf, setDeleteRoleConf] = useState(false)
    const [roleToDelete, setRoleToDelete] = useState(null);
    const [roleNameToDelete, setRoleNameToDelete] = useState("");
    const [addRoleData, setAddRoleData] = useState({
        "designation_name": '',
        "description": '',
        "created_by": '0',
    });
    const [designationRowData, setDesignationRowData] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const pageSize = 10;


    const [overallDepartment, setOverallDepartment] = useState([]);
    const [overallDivision, setOverallDivision] = useState([]);
    const [departmentBasedDivision, setDepartmentBasedDivision] = useState([]);

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

        if(role?.department_id){

            var departmentIds = role.department_id.split(',')

            var updatedDivision = overallDivision.filter((division)=>{
                if(division?.department_id){
                    console.log(division?.department_id,"division?.department_id")
                    return departmentIds.includes(String(division.department_id))
                }
            })
    
            setDepartmentBasedDivision(updatedDivision);
        }

    };

    const handleEditRole = (role) => {
        setSelectedRole({
            id: role.id,
            designation_name: role.name,
            ...role
        });
        setShowEditModal(true);

        if(role?.department_id){

            var departmentIds = role.department_id.split(',')

            var updatedDivision = overallDivision.filter((division)=>{
                if(division?.department_id){
                    return departmentIds.includes(String(division.department_id))
                }
            })
    
            setDepartmentBasedDivision(updatedDivision);
        }
    };

    const designationColumnData = [
        { field: 'department_name', headerName: 'Department', width: 200 },
        { field: 'division_name', headerName: 'Division', width: 200 },
        { field: 'name', headerName: 'Designation', width: 200 },
        { field: 'description', headerName: 'Description', width: 300 },
        {
            field: '',
            headerName: 'Action',
            width: 300,
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
            const response = await api.post("/master_meta/delete_master_data", { master_name: "Designation", id });
            if (!response || !response.success) {
                let errorMessage = response.message || "Error deleting designation";
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

            toast.success(response.message || "Designation Deleted Successfully", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                className: "toast-success",
            });

            get_designation_details(paginationCount);

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

    const get_designation_details = async (page) => {

        const getTemplatePayload = {
            page,
            limit: 10,
            search: searchValue || "",
            from_date: fromDateValue,
            to_date: toDateValue,
            filter: filterValues,
            master_name: "designation"
        };

        setLoading(true);
        try {
            const response = await api.post("/master_meta/fetch_specific_master_data", getTemplatePayload);
            setLoading(false);
            if (response) {

                const { meta } = response;

                const totalPages = meta?.totalPages || 1;
                const totalItems = meta?.totalItems || 0;
                
                if (totalPages !== null && totalPages !== undefined) {
                    setTotalPage(totalPages);
                }
                
                if (totalItems !== null && totalItems !== undefined) {
                    setTotalRecord(totalItems);
                }

                const updatedData = response.map((row, index) => {
                    return {
                        id: row.designation_id,
                        name: row.designation_name,
                        department_id: row.department_id,
                        division_id: row.division_id,
                        division_name: row.division_name,
                        department_name: row.department_name,
                        description: row.description || "N/A"
                    };
                });
                setDesignationRowData(updatedData);
            } else {
                toast.error("Failed to fetch designations");
            }
        } catch (err) {
            setLoading(false);
            let errorMessage = err?.response?.data?.message || "Something went wrong. Please try again.";
            toast.error(errorMessage);
        }
    };

    useEffect(() => {
        get_designation_details(paginationCount);
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

        if (!addRoleData?.designation_name || addRoleData?.designation_name.trim() === '') {
            error_flag = true;
            setErrorRoleData((prevData) => ({
                ...prevData,
                designation_name: 'Title is required'
            }));
        }

        // if (!addRoleData?.description || addRoleData?.description.trim() === '') {
        //     error_flag = true;
        //     setErrorRoleData((prevData) => ({
        //         ...prevData,
        //         description: 'Description is required'
        //     }));
        // }

        if (!addRoleData?.department_id || addRoleData?.department_id === null || addRoleData?.department_id === undefined) {
            error_flag = true;
            setErrorRoleData((prevData) => ({
                ...prevData,
                department_id: 'Department is required'
            }));
        }

        if (!addRoleData?.division_id || addRoleData?.division_id === null || addRoleData?.division_id === undefined) {
            error_flag = true;
            setErrorRoleData((prevData) => ({
                ...prevData,
                division_id: 'Division is required'
            }));
        }

        if (error_flag) {
            toast.error("Please Check Details", {
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
                master_name: "Designation",
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

            toast.success(response.message || "Designation Created Successfully", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                className: "toast-success"
            });

            get_designation_details(paginationCount);

            setAddRoleData({
                "designation_name": '',
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

        if (!selectedRole?.designation_name || selectedRole?.designation_name.trim() === '') {
            error_flag = true;
            setErrorRoleData((prevData) => ({
                ...prevData,
                designation_name: 'Designation Name is required',
            }));
        }

        // if (!selectedRole?.description || selectedRole?.description.trim() === '') {
        //     error_flag = true;
        //     setErrorRoleData((prevData) => ({
        //         ...prevData,
        //         description: 'Description is required',
        //     }));
        // }

        if (!selectedRole?.department_id || selectedRole?.department_id === null || selectedRole?.department_id === undefined) {
            error_flag = true;
            setErrorRoleData((prevData) => ({
                ...prevData,
                department_id: 'Department is required'
            }));
        }

        if (!selectedRole?.division_id || selectedRole?.division_id === null || selectedRole?.division_id === undefined) {
            error_flag = true;
            setErrorRoleData((prevData) => ({
                ...prevData,
                division_id: 'Division is required'
            }));
        }

        if (error_flag) {
            toast.error("Please check Details", {
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
            master_name: "Designation",
            data: {
                designation_id: selectedRole.id,
                designation_name: selectedRole.designation_name,
                description: selectedRole.description,
                division_id: selectedRole.division_id,
                department_id: selectedRole.department_id,
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

            get_designation_details(paginationCount);
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

    useEffect(()=>{
        getAllMasters();
    },[])

    const getAllMasters = async ()=>{
        setLoading(true);
        try {

            var payload = {
                needed_masters : ["department", "division"]
            }

            const response = await api.post("/master/get_master_data", payload);

            if(!response || !response?.department || !response?.division){
                toast.error(response?.message || "Data Not Found" , {
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

            if(response?.department && response.department.length > 0){
                setOverallDepartment(response.department);
            }

            if(response?.division && response?.division.length > 0){
                setOverallDivision(response.division);
            }

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
    }

    const handleDepartmentValue = (data)=> {

        const departmentCodes = Array.isArray(data) ? data.map(item => Number(item.code)) : [];

        var updatedDivision = overallDivision.filter((division)=>{
            if(division?.department_id){
                return departmentCodes.includes(division.department_id)
            }
        })

        setDepartmentBasedDivision(updatedDivision);

        if(!showRoleAddModal){

            setSelectedRole(prevState => ({
                ...prevState,
                ['department_id']: departmentCodes.join(','),
                ['division_id']: null
            }));

        }else{
            
            setAddRoleData((prevData) => ({
                ...prevData,
                ['department_id']: departmentCodes.join(','),
                ['division_id']: null
            }));

        }

        if (errorRoleData?.department_id) {
            setErrorRoleData(prevErrors => {
                const updatedErrors = { ...prevErrors };
                delete updatedErrors.department_id;
                return updatedErrors;
            });
        }

    }

    const handleDivisionChange = (data) => {
        const divisionCodes = Array.isArray(data) ? data.map(item => Number(item.code)) : [];
    
        if (!showRoleAddModal) {
            setSelectedRole(prevState => ({
                ...prevState,
                division_id: divisionCodes.join(",")
            }));
        } else {
            setAddRoleData(prevData => ({
                ...prevData,
                division_id: divisionCodes.join(",")
            }));
        }
    
        if (errorRoleData?.division_id) {
            setErrorRoleData(prevErrors => {
                const updatedErrors = { ...prevErrors };
                delete updatedErrors.division_id;
                return updatedErrors;
            });
        }
    };

    const parseMultipleCheckValues = (input) => {
        if (Array.isArray(input)) {
            return input.map(id => Number(id));
        } else if (typeof input === 'string') {
            return input.split(',').map(id => Number(id.trim()));
        } else if (typeof input === 'number') {
            return [input];
        } else {
            return [];
        }
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
                            Designation
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
                                placeholder="Search Designation"
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
                                Add Designation
                        </Button>                        
                    </Box>
                </Box>
                <Box py={2}>
                    <TableView
                        rows={designationRowData}
                        columns={designationColumnData}
                        totalPage={totalPage} 
                        totalRecord={totalRecord} 
                        paginationCount={paginationCount} 
                        handlePagination={handlePagination} 
                        getRowId={(row) => row.id}
                    />

                </Box>
            </Box>

            {/* add , view , edit Designation modal */}

            <Dialog
                open={showViewModal || showEditModal || showRoleAddModal}
                onClose={() => {
                    setShowViewModal(false);
                    setShowEditModal(false);
                    setShowRoleAddModal(false);
                    setErrorRoleData({ designation_name: '', description: '' });
                }}
                aria-labelledby="designation-dialog-title"
                maxWidth="lg"
                fullWidth
            >
                <DialogTitle id="designation-dialog-title" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    {showViewModal && "View Designation"}
                    {showEditModal && "Edit Designation"}
                    {showRoleAddModal && "Add New Designation"}
                    <IconButton
                        aria-label="close"
                        onClick={() => {
                            setShowViewModal(false);
                            setShowEditModal(false);
                            setShowRoleAddModal(false);
                            setErrorRoleData({ designation_name: '', description: '' });
                            setAddRoleData({ designation_name: '', description: '' });
                            setSelectedRole(null);                    
                        }}
                        sx={{ color: (theme) => theme.palette.grey[500] }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <DialogContent>
                    <DialogContentText>
                        <FormControl fullWidth>

                            <Box sx={{display: 'flex', flexDirection: 'column', gap: '16px'}}>

                                <Box>
                                    <h4 className="form-field-heading" style={{ color: !!errorRoleData.designation_name && '#d32f2f' }}>
                                        Designation Name
                                    </h4>
                                    <TextField
                                        fullWidth
                                        label="Designation Name"
                                        name="designation_name"
                                        autoComplete="off"
                                        value={showRoleAddModal ? addRoleData.designation_name : selectedRole?.designation_name || selectedRole?.name}
                                        onChange={(e) => {
                                            if (showViewModal) return;

                                            const regex = /^[a-zA-Z0-9\s\b]*$/;
                                            if (regex.test(e.target.value)) {
                                                if (showRoleAddModal) {
                                                    handleAddData(e);
                                                } else {
                                                    handleInputChange(e);
                                                }
                                            }
                                        }}
                                        error={!!errorRoleData.designation_name}
                                        required={showEditModal || showRoleAddModal}
                                        disabled={showViewModal}
                                    />
                                </Box>

                                <Box>
                                    <h4 className="form-field-heading" style={{ color: !!errorRoleData.department_id && '#d32f2f' }}>
                                        Department
                                    </h4>
                                    <Autocomplete
                                        id=""
                                        required
                                        multiple
                                        options={overallDepartment}
                                        getOptionLabel={(option) => option.name || ''}
                                        value={
                                            showRoleAddModal
                                              ? overallDepartment.filter(opt => parseMultipleCheckValues(addRoleData.department_id).includes(opt.code))
                                              : overallDepartment.filter(opt => parseMultipleCheckValues(selectedRole?.department_id).includes(opt.code))
                                        }
                                        onChange={(event, newValue) => handleDepartmentValue(newValue)}
                                        disabled={showViewModal}
                                        renderInput={(params) =>
                                            <TextField
                                                {...params}
                                                error={errorRoleData && errorRoleData['department_id'] && Boolean(errorRoleData['department_id'])}
                                                className='selectHideHistory'
                                                label={
                                                        <>
                                                            Department
                                                            <span
                                                                style={{
                                                                    padding: '0px 0px 0px 5px', 
                                                                    verticalAlign: 'middle'
                                                                }} 
                                                                className='MuiFormLabel-asterisk MuiInputLabel-asterisk css-1ljffdk-MuiFormLabel-asterisk'
                                                            >
                                                                {'*'}
                                                            </span>
                                                        </>
                                                    }
                                            />
                                        }
                                    />
                                </Box>

                                <Box>
                                    <h4 className="form-field-heading" style={{ color: !!errorRoleData.division_id && '#d32f2f' }}>
                                        Division
                                    </h4>
                                    <Autocomplete
                                        multiple
                                        id="division-multi-select"
                                        options={departmentBasedDivision}
                                        getOptionLabel={(option) => option.name || ''}
                                        value={
                                            showRoleAddModal
                                              ? departmentBasedDivision.filter(opt => parseMultipleCheckValues(addRoleData.division_id).includes(opt.code))
                                              : departmentBasedDivision.filter(opt => parseMultipleCheckValues(selectedRole?.division_id).includes(opt.code))
                                        }
                                        onChange={(event, newValue) => handleDivisionChange(newValue)}
                                        disabled={showViewModal}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                error={errorRoleData?.division_id}
                                                className="selectHideHistory"
                                                label={
                                                    <>
                                                        Division
                                                        <span
                                                            style={{ padding: '0px 0px 0px 5px', verticalAlign: 'middle' }}
                                                            className="MuiFormLabel-asterisk MuiInputLabel-asterisk css-1ljffdk-MuiFormLabel-asterisk"
                                                        >
                                                            {'*'}
                                                        </span>
                                                    </>
                                                }
                                            />
                                        )}
                                    />
                                </Box>
{/* 
                                <Box>
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
                                </Box> */}
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
                            setErrorRoleData({ designation_name: '', description: '' });
                            setAddRoleData({ designation_name: '', description: '' });
                            setSelectedRole(null);            
                        }}
                    >
                        Close
                    </Button>
                    {showEditModal && (
                        <Button variant="outlined" onClick={handleEditData}>
                            Update Designation
                        </Button>
                    )}
                    {showRoleAddModal && (
                        <Button variant="outlined" onClick={handleAddSaveData}>
                            Add Designation
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
                            Are you sure you want to delete the {roleNameToDelete} Designation? This action
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

export default Designation