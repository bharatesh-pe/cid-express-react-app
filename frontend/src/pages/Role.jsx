import { Box, Button, Checkbox, CircularProgress, FormControl, Grid, IconButton, InputAdornment, TextField, Typography , Accordion, AccordionSummary, AccordionDetails, Tooltip } from "@mui/material"
import { useEffect, useState } from "react"
import TableView from "../components/table-view/TableView";
import TextFieldInput from '@mui/material/TextField';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import ASC from '@mui/icons-material/North';
import DESC from '@mui/icons-material/South';
import ClearIcon from '@mui/icons-material/Clear';
import api from '../services/api';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import CloseIcon from '@mui/icons-material/Close';
import { Description } from "@mui/icons-material";
import eyes from "../Images/eye.svg"
import edit from "../Images/tableEdit.svg";
import trash from "../Images/tableTrash.svg";
import ErrorIcon from "../Images/erroricon.png";
import FilterListIcon from "@mui/icons-material/FilterList";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import WestIcon from '@mui/icons-material/West';


const RolePage = () => {

    // loader variable
    const [loading, setLoading] = useState(false);
    const [showViewModal, setShowViewModal] = useState();
    const [showEditModal, setShowEditModal] = useState();
    const [selectedRole, setSelectedRole] = useState({
        role_title: '',
        role_description: '',
        permissions: {},
    });

    const [addPermissionData, setAddPermissionData] = useState({});
    const [permission_data, setPermissionData] = useState({});
    const [module_data, setModuleData] = useState({});
    const [delete_role_conf,setDeleteRoleConf] = useState(false)

    // table row variable
    const [roleRowData, setRoleRowData] = useState([]);

    //function for delete role conformation
    const [roleToDelete, setRoleToDelete] = useState(null);
    const [roleNameToDelete, setRoleNameToDelete] = useState("");

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

    const [totalPage, setTotalPage] = useState(0);
    const [totalRecord, setTotalRecord] = useState(0);

    // filter states
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [filterDropdownObj, setfilterDropdownObj] = useState([]);
    const [filterValues, setFilterValues] = useState({});
    const [fromDateValue, setFromDateValue] = useState(null);
    const [toDateValue, setToDateValue] = useState(null);
    const [forceTableLoad, setForceTableLoad] = useState(false);
    const [othersFilterData, setOthersFilterData] = useState({});
    const [othersFiltersDropdown, setOthersFiltersDropdown] = useState([]);

    const [paginationCount, setPaginationCount] = useState(1);


    // table column variable
    const [roleColumnData, setRoleColumnData] = useState([
        { 
            field : "S_No", 
            headerName : "S.No", 
            width: 70,
            renderCell: (params) => tableCellRender(params, "S_No"),
        },
        { 
            field: 'title', 
            headerName: 'Title', 
            width : 200,
            renderCell: (params) => tableCellRender(params, "title"),
        },
        { 
            field: 'description', 
            headerName: 'Description', 
            width : 200,
            renderCell: (params) => tableCellRender(params, "description"),
        },
        {
            field: '',
            headerName: 'Action',
            width : 250,
            renderCell: (params) => {
                return (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px', height: '100%' }}>
                        <Button variant="outlined"  onClick={() => handleViewRole(params.row)}>
                            View
                        </Button>
                        <Button variant="contained" color="primary" onClick={() => { handleEditRole(params.row)}}>
                            Edit
                        </Button>
                        <Button variant="contained" color="error" onClick={() => showDeleteRoleDialoge(params.row.id, params.row.role_title)}>
                            Delete
                        </Button>
                    </Box>
                );
            }
        }
    ]);

    const tableCellRender = (params, key) => {
    
        var value = params?.row?.[key]

        return (
            <Tooltip title={value} placement="top">
                <span
                    className={`tableValueTextView Roboto ${ params?.row && !params.row["ReadStatus"] ? "" : ""}`}
                >
                    {value || "-"}
                </span>
            </Tooltip>
        );
    };

    const handleViewRole = (role) => {
        setSelectedRole(role);
        setShowViewModal(true);
    };

    const handleEditRole = (role) => {
        const newTransactionId = role.transaction_id || `role_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
        setSelectedRole({
            ...role,
            transaction_id: newTransactionId,
        });
        setShowEditModal(true);
    };

    const deleteRole = async (id) => {
        setLoading(true);
        if (!id) {
            toast.error("Invalid role ID.");
            return;
        }
    
        try {
            const response = await api.post("/role/delete_role", { id });
    
            if (!response || !response.success) {
                let errorMessage = response.message || "Error deleting role";
                console.log(errorMessage);
                if (errorMessage.includes("violates foreign key constraint")) {
                    errorMessage = "This role has been assigned to some officer. Please check.";
                }
    
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
    
            toast.success(response.message || "Role Deleted Successfully", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                className: "toast-success",
            });
    
            get_details(paginationCount);
    
        } catch (err) {
            let errorMessage = err.message || "Something went wrong. Please try again.";
            if(err?.response?.data?.message)
            {
                errorMessage = err?.response?.data?.message || "Something went wrong. Please try again.";
            }
            if (errorMessage.includes("violates foreign key constraint")) {
                errorMessage = "This role has been assigned to some officer. Please check.";
            }
            toast.error(errorMessage , {
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
        finally {
            setLoading(false);
        }
    };
    
    
    useEffect(() => {
        get_details(paginationCount);
    }, [paginationCount, forceTableLoad])

    const get_details = async (page) => {

        var payload = {
            page,
            limit: 10,
            search: searchValue || "",
            from_date: fromDateValue,
            to_date: toDateValue
        }

        setLoading(true);
        try {

            const response = await api.post("/role/get_all_roles", payload);
            setLoading(false);
    
            if (response && response.success) {

                const { meta } = response;

                const totalPages = meta?.totalPages;
                const totalItems = meta?.totalItems;

                if (totalPages !== null && totalPages !== undefined) {
                    setTotalPage(totalPages);
                }

                if (totalItems !== null && totalItems !== undefined) {
                    setTotalRecord(totalItems);
                }

                const updatedData = response.data.map((row, index) => {
                    const permissions = Object.keys(row).reduce((acc, key) => {
                        if (typeof row[key] === 'boolean') {
                            acc[key] = row[key];
                        }
                        return acc;
                    }, {});
    
                    return {
                        ...row,
                        S_No : (page - 1) * 10 + (index + 1),
                        id: row.role_id,
                        title: row.role_title,
                        description: row.role_description,
                        permissions: permissions
                    };
                });
    
                setRoleRowData(updatedData);
            } else {
                toast.error(response.message || "Failed to fetch roles");
            }
        } catch (err) {
            setLoading(false);
            let errorMessage = err.message || "Something went wrong. Please try again.";
            if(err?.response?.data?.message)
            {
                errorMessage = err?.response?.data?.message || "Something went wrong. Please try again.";
            }
            toast.error(errorMessage);
        }
    };

    const setFilterData = () => {
        setPaginationCount(1);
        setShowFilterModal(false);
        setForceTableLoad((prev) => !prev);
    };

    const handlePagination = (page) => {
        setPaginationCount(page)
    }

    const handleFilter = async () => {        
        setfilterDropdownObj([]);
        setShowFilterModal(true);
    };

    const handleClear = () => {
        setSearchValue("");
        setFilterValues({});
        setFromDateValue(null);
        setToDateValue(null);
        setForceTableLoad((prev) => !prev);
    };


    const get_permissions = async () => {
         setLoading(true);
        try {
            const response = await api.post("/role/get_all_permissions");
    
            if (response && response.success) {
    
                const permissions = response.data || [];
                const permissionObj = permissions.reduce((acc, permission) => {
                    acc[permission.permission_name] = false;
                    return acc;
                }, {});
    
                setAddPermissionData(permissionObj);
                setPermissionData(permissions);
            } else {
                toast.error(response.message || "Failed to fetch permissions");
            }
        } catch (err) {
            let errorMessage = err.message || "Something went wrong. Please try again.";
            if(err?.response?.data?.message)
            {
                errorMessage = err?.response?.data?.message || "Something went wrong. Please try again.";
            }
            toast.error(errorMessage);
        }
         setLoading(false);
    };
        
    const get_module = async () => {
         setLoading(true);
        try {
            const response = await api.post("/role/get_all_module");
    
            if (response && response.success) {
    
                const module = response.data || [];
                // const module_obj = module.reduce((acc, module) => {
                //     acc[module.ui_name] = false;
                //     return acc;
                // }, {});
    
                setModuleData(module);
            } else {
                toast.error(response.message || "Failed to fetch module");
            }
        } catch (err) {
            let errorMessage = err.message || "Something went wrong. Please try again.";
            if(err?.response?.data?.message)
            {
                errorMessage = err?.response?.data?.message || "Something went wrong. Please try again.";
            }
            toast.error(errorMessage);
        }
         setLoading(false);
    };
        
    useEffect(() => {
        get_permissions();
        get_module();
    }, [])
    // add role variables
    
    const [showRoleAddModal, setShowRoleAddModal] = useState(false)
    
    const [addRoleData, setAddRoleData] = useState({
        "role_title": '',
        "role_description": '',
        "permissions": addPermissionData
    });

    const [errorRoleData, setErrorRoleData] = useState({})

    // table pagination variable
    const [tablePagination, setTablePagination] = useState(1);

    // table search variable
    const [searchValue, setSearchValue] = useState(null);

    const handleNextPage = () => {
        setTablePagination((prev) => prev + 1)
    }

    const handlePrevPage = () => {
        setTablePagination((prev) => prev - 1)
    }

    const handlePermissionData = (name, checked) => {
        setAddRoleData((prevData) => ({
            ...prevData,
            permissions: {
                ...prevData.permissions,
                [name]: checked,
            },
        }));
    };

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
    
        if (addRoleData.role_title.trim() === '') {
            error_flag = true;
            setErrorRoleData((prevData) => ({
                ...prevData,
                role_title: 'Role title is required'
            }));
        }
    
        if (addRoleData.role_description.trim() === '') {
            error_flag = true;
            setErrorRoleData((prevData) => ({
                ...prevData,
                role_description: 'Role Description is required'
            }));
        }
    
        const hasSelectedPermission = Object.values(addRoleData.permissions).some(value => value === true);

        if (!hasSelectedPermission) {
            error_flag = true;
            toast.error("At least one permission must be selected", {
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
    
        if (error_flag) {
            toast.error("Please Check Title and Description, and Permissions", {
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
            const response = await api.post("/role/create_role", addRoleData);
    
            if (!response || !response.success) {
                toast.error(response.message || "Failed to create role", {
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
    
            toast.success(response.message || "Role Created Successfully", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                className: "toast-success"
            });
    
            get_details(paginationCount); // Refresh role list after creation
    
            setAddRoleData({
                "transaction_id": "",
                "role_title": '',
                "role_description": '',
                "permissions": addPermissionData
            });
    
            setShowRoleAddModal(false);
            
        } catch (err) {
            let errorMessage = err.message || "Something went wrong. Please try again.";
            if(err?.response?.data?.message)
            {
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

    const handleCheckboxChange = (event) => {
        const { id, checked } = event.target;
        console.log(id, checked);
        setSelectedRole((prevSelectedRole) => ({
            ...prevSelectedRole,
            permissions: {
                ...prevSelectedRole.permissions,
                [id]: checked,
            },
        }));
    };

    useEffect(() => {
        console.log(selectedRole);
    }, [selectedRole]);


    const handleEditData = async () => {
        var error_flag = false;
    
        if (selectedRole.role_title.trim() === '') {
            error_flag = true;
            setErrorRoleData((prevData) => ({
                ...prevData,
                role_title: 'Role title is required',
            }));
        }
    
        if (selectedRole.role_description.trim() === '') {
            error_flag = true;
            setErrorRoleData((prevData) => ({
                ...prevData,
                role_description: 'Role Description is required',
            }));
        }
        const hasPermissionSelected = Object.values(selectedRole.permissions).some(value => value === true);

        if (!hasPermissionSelected) {
            error_flag = true;
            toast.error("At least one permission must be selected.", {
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
    
        if (error_flag) {
            toast.error("Please check title and Description, and Permissions", {
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
            id: selectedRole.id,
            role_title: selectedRole.role_title,
            role_description: selectedRole.role_description,
            permissions: selectedRole.permissions,
            transaction_id: selectedRole.transaction_id,
        };
     setLoading(true);
        try {
            const response = await api.post("/role/update_role", requestData);
    
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
    
            get_details(paginationCount);
            setShowEditModal(false);
        } catch (err) {
             let errorMessage = err.message || "Something went wrong. Please try again.";
            if(err?.response?.data?.message)
            {
                errorMessage = err?.response?.data?.message || "Something went wrong. Please try again.";
            }
            toast.error(errorMessage || "Something went wrong. Please try again.", {
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

    // const [filteredRows, setFilteredRows] = useState(roleRowData);
    // useEffect(() => {
    //     if (!searchValue) {
    //         setFilteredRows(roleRowData);
    //         return;
    //     }
    
    //     const lowercasedSearch = searchValue.toLowerCase();
    //     const filteredData = roleRowData.filter(row =>
    //         Object.values(row).some(value =>
    //             typeof value === "string" && value.toLowerCase().includes(lowercasedSearch)
    //         )
    //     );
    
    //     setFilteredRows(filteredData);
    // }, [searchValue, roleRowData]);
    

    return (
        <Box inert={loading ? true : false}>
            <Dialog
                open={showViewModal}
                onClose={() => setShowViewModal(false)}
                aria-labelledby="view-role-title"
                maxWidth="md"
                fullWidth
                aria-describedby="alert-dialog-description"
                fullScreen
                sx={{ marginLeft: '50px' }}        

            >
            <DialogTitle id="hierarchy-dialog-title" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                        onClick={() => setShowViewModal(false)}
                        >
                        <WestIcon sx={{ color: 'black' }}/>
                        <Typography sx={{ fontSize: '18px', fontWeight: 500,}}>
                            View Role
                        </Typography>
                    </Box>
                </DialogTitle>

                <DialogContent>
                    <DialogContentText>
                        <FormControl fullWidth>
                            <Box sx={{ marginY: '18px' }}>
                                <h4 className="form-field-heading" >
                                    Role Title
                                </h4>
                                <TextField
                                    fullWidth
                                    // label="Title"
                                    name="role_titles"
                                    value={selectedRole?.title || ""}
                                />
                            </Box>

                            <Box sx={{ marginBottom: '18px' }}>
                                <h4 className="form-field-heading" >
                                    Role Description
                                </h4>
                                <TextField
                                    fullWidth
                                    // label="Description"
                                    name="role_descriptions"
                                    value={selectedRole?.description || ""}
                                />
                            </Box>

                            {/* <h4 className="form-field-heading">Permissions</h4>
                            <Grid container spacing={2}>
                                {selectedRole &&
                                    Object.keys(selectedRole)
                                        .filter((fieldName) => selectedRole[fieldName] === true)
                                        .map((fieldName) => (
                                            <Grid item xs={12} md={4} key={fieldName} sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Checkbox
                                                    name="addRolePermissions"
                                                    id={fieldName}
                                                    value={fieldName}
                                                    checked={true}
                                                />
                                                <label htmlFor={fieldName} style={{ fontSize: '14px' }}>
                                                    {fieldName}
                                                </label>
                                            </Grid>
                                        ))}
                            </Grid> */}
                            <div>
                                    <h4 className="form-field-heading">Permissions</h4>
                                    {module_data &&
                                        Object.keys(module_data).map((index) => {
                                            const module_id = module_data[index].module_id;
                                            const module_name = module_data[index].name;
                                            const module_ui_name = module_data[index].ui_name;
                                            const sub_modules = JSON.parse(module_data[index].sub_modules || "[]");
                                            if(selectedRole && selectedRole[module_name])
                                            {
                                                const ModuleHeader = (
                                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                        <Checkbox
                                                            name="addRolePermissions"
                                                            id={module_name}
                                                            value={module_name}
                                                            checked={true}
                                                        />
                                                        <Typography variant="subtitle1">{module_ui_name}</Typography>
                                                    </Box>
                                                );
                                                
                                                const ModulePermissions = (
                                                    <Grid container spacing={2} sx={{ marginTop: 1 }}>
                                                        {permission_data &&
                                                            Object.keys(permission_data).map((permission_index) => {
                                                                const permission = permission_data[permission_index];
                                                                const permission_key = permission.permission_key;
                                                                if(selectedRole && selectedRole[permission_key])
                                                                {
                                                                    if (module_id === permission.module_id) {
                                                                        return (
                                                                            <Grid item xs={12} sm={6} md={4} lg={4} xl={4} key={permission.permission_key} sx={{ display: "flex", alignItems: "center" }}>
                                                                                <Checkbox
                                                                                    name="addRolePermissions"
                                                                                    id={permission.permission_key}
                                                                                    value={permission.permission_key}
                                                                                    checked={true}
                                                                                />
                                                                                <Typography variant="body2">{permission.permission_name}</Typography>
                                                                            </Grid>
                                                                        );
                                                                    }
                                                                }
                                                                return null;
                                                            })}
                                                    </Grid>
                                                );
                                           
                                                return (
                                                    <Box key={module_name} sx={{ marginBottom: 1, padding: 1, borderRadius: "8px", backgroundColor: "#f9f9f9" }}>
                                                        {sub_modules.length > 0 ? (
                                                            <Accordion>
                                                                <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls={`panel-${module_name}-content`} id={`panel-${module_name}-header`}>
                                                                    {ModuleHeader}
                                                                </AccordionSummary>
                                                                <AccordionDetails>{ModulePermissions}</AccordionDetails>
                                                            </Accordion>
                                                        ) : (
                                                            <Accordion>
                                                                <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls={`panel-${module_name}-content`} id={`panel-${module_name}-header`}>
                                                                {ModuleHeader}
                                                                </AccordionSummary>
                                                                <AccordionDetails>{ModulePermissions}</AccordionDetails>
                                                            </Accordion>
                                                        )}
                                                    </Box>
                                                );
                                            }


                                        })}
                            </div>
                        </FormControl>
                    </DialogContentText>
                </DialogContent>
            </Dialog>

            <Box>
                <Dialog
                    open={showEditModal}
                    onClose={() => setShowEditModal(false)}
                    aria-labelledby="view-role-title"
                    maxWidth="md"
                    aria-describedby="alert-dialog-description"
                    fullScreen
                    fullWidth
                    sx={{ marginLeft: '50px' }}        
    
                >
                <DialogTitle id="hierarchy-dialog-title" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                        onClick={() => setShowEditModal(false)}
                        >
                        <WestIcon sx={{ color: 'black' }}/>
                        <Typography sx={{ fontSize: '18px', fontWeight: 500,}}>
                            Edit Role
                        </Typography>
                    </Box>
                    <Button variant="outlined" onClick={handleEditData}>Update Role</Button>
                </DialogTitle>

                    <DialogContent>
                        <DialogContentText>
                            <FormControl fullWidth>
                                <Box sx={{ marginY: '18px' }}>
                                    <h4 className="form-field-heading">Role Title</h4>
                                    <TextField
                                        fullWidth
                                        label="Title"
                                        name="role_title"
                                        autoComplete="off"
                                        value={selectedRole?.role_title || ""}
                                        onChange={(e) => {
                                            const regex = /^[a-zA-Z0-9\s\b]*$/;
                                            if (regex.test(e.target.value)) {
                                                handleInputChange(e);
                                            }
                                        }}    
                                        required
                                    />
                                </Box>

                                <Box sx={{ marginBottom: '18px' }}>
                                    <h4 className="form-field-heading">Role Description</h4>
                                    <TextField
                                        fullWidth
                                        label="Description"
                                        name="role_description"
                                        value={selectedRole?.role_description || ""}
                                        onChange={(e) => {
                                            const regex = /^[a-zA-Z0-9\s/,.\b]*$/;
                                            if (regex.test(e.target.value)) {
                                                handleInputChange(e);
                                            }
                                        }}                                       
                                    required
                                    />
                                </Box>

                                {/* <h4 className="form-field-heading">Permissions</h4>
                                <Grid container spacing={2}>
                                    {selectedRole.permissions &&
                                        Object.keys(selectedRole.permissions).map((fieldName) => (
                                            <Grid item xs={12} md={4} key={fieldName} sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Checkbox
                                                    name="addRolePermissions"
                                                    id={fieldName}
                                                    value={fieldName}
                                                    checked={selectedRole.permissions[fieldName] === true}
                                                    onChange={handleCheckboxChange}
                                                />
                                                <label htmlFor={fieldName} style={{ fontSize: '14px' }}>
                                                    {fieldName}
                                                </label>
                                            </Grid>
                                        ))}
                                </Grid> */}

                                 <div>
                                    <h4 className="form-field-heading">Permissions</h4>
                                    {module_data &&
                                        Object.keys(module_data).map((index) => {
                                            const module_id = module_data[index].module_id;
                                            const module_name = module_data[index].name;
                                            const module_ui_name = module_data[index].ui_name;
                                            const sub_modules = JSON.parse(module_data[index].sub_modules || "[]");

                                            const ModuleHeader = (
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                    <Checkbox
                                                        name="addRolePermissions"
                                                        id={module_name}
                                                        value={module_name}
                                                        checked={selectedRole['permissions'][module_name] === true}
                                                        onChange={handleCheckboxChange}
                                                    />
                                                    <Typography variant="subtitle1">{module_ui_name}</Typography>
                                                </Box>
                                            );

                                            const ModulePermissions = (
                                                <Grid container spacing={2} sx={{ marginTop: 1 }}>
                                                    {permission_data &&
                                                        Object.keys(permission_data).map((permission_index) => {
                                                            const permission = permission_data[permission_index];
                                                            if (module_id === permission.module_id) {
                                                                return (
                                                                    <Grid item xs={12} sm={6} md={4} lg={4} xl={4} key={permission.permission_key} sx={{ display: "flex", alignItems: "center" }}>
                                                                        <Checkbox
                                                                            name="addRolePermissions"
                                                                            id={permission.permission_key}
                                                                            value={permission.permission_key}
                                                                            checked={selectedRole['permissions'][permission.permission_key] === true}
                                                                            onChange={handleCheckboxChange}
                                                                        />
                                                                        <Typography variant="body2">{permission.permission_name}</Typography>
                                                                    </Grid>
                                                                );
                                                            }
                                                            return null;
                                                        })}
                                                </Grid>
                                            );

                                            return (
                                                <Box key={module_name} sx={{ marginBottom: 1, padding: 1, borderRadius: "8px", backgroundColor: "#f9f9f9" }}>
                                                    {sub_modules.length > 0 ? (
                                                        <Accordion>
                                                            <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls={`panel-${module_name}-content`} id={`panel-${module_name}-header`}>
                                                                {ModuleHeader}
                                                            </AccordionSummary>
                                                            <AccordionDetails>{ModulePermissions}</AccordionDetails>
                                                        </Accordion>
                                                    ) : (
                                                        // <Box>
                                                        //     {ModuleHeader}
                                                        //     {ModulePermissions}
                                                        // </Box>
                                                        <Accordion>
                                                            <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls={`panel-${module_name}-content`} id={`panel-${module_name}-header`}>
                                                            {ModuleHeader}
                                                            </AccordionSummary>
                                                            <AccordionDetails>{ModulePermissions}</AccordionDetails>
                                                        </Accordion>
                                                    )}
                                                </Box>
                                            );
                                        })}
                                </div>
                            </FormControl>
                        </DialogContentText>
                    </DialogContent>
                </Dialog>

            </Box>

            <Box p={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                    <Box>
                        <Typography className='Roboto' sx={{ fontSize: '20px', fontWeight: '600', color: '#1D2939' }}>Role Management</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
                        <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'end'}}>
                            <TextFieldInput 
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon sx={{ color: '#475467' }} />
                                        </InputAdornment>
                                    ),
                                    // endAdornment: (
                                    //     <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    //         <IconButton sx={{ padding: "0 5px", borderRadius: "0" }} onClick={handleFilter}>
                                    //             <FilterListIcon sx={{ color: "#475467" }} />
                                    //         </IconButton>
                                    //     </Box>
                                    // )
                                }}
                                onInput={(e) => setSearchValue(e.target.value)}
                                value={searchValue}
                                id="tableSearch"
                                size="small"
                                placeholder='Search roles'
                                variant="outlined"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        setFilterData();
                                    }
                                }}
                                className="profileSearchClass"
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
                            {(searchValue || fromDateValue || toDateValue || Object.keys(filterValues).length > 0) && (
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
                                    transaction_id: `role_${Date.now()}_${Math.floor(Math.random() * 10000)}`
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
                                Add Role
                        </Button>
                    </Box>
                </Box>
                <Box py={2}>
                <TableView 
                    rows={roleRowData} 
                    columns={roleColumnData} 
                    totalPage={totalPage} 
                    totalRecord={totalRecord} 
                    paginationCount={paginationCount} 
                    handlePagination={handlePagination} 
                    getRowId={(row) => row.id} />
                </Box>
            </Box>

            {/* add role modal */}

            {showRoleAddModal &&
                <Dialog
                    open={showRoleAddModal}
                    onClose={() => setShowRoleAddModal(false)}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                    maxWidth="md"
                    fullScreen
                    fullWidth
                    sx={{ marginLeft: '50px' }}        
    
                >

                <DialogTitle id="hierarchy-dialog-title" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                        onClick={() => setShowRoleAddModal(false)}
                        >
                        <WestIcon sx={{ color: 'black' }}/>
                        <Typography sx={{ fontSize: '18px', fontWeight: 500,}}>
                            Add Role
                        </Typography>
                    </Box>

                    <Button variant="outlined" onClick={handleAddSaveData}>Add Role</Button>

                </DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            <FormControl fullWidth>

                                <Box sx={{ marginY: '18px' }}>

                                    <h4 className="form-field-heading"
                                        style={{
                                            color: !!errorRoleData.role_title && '#d32f2f'
                                        }}
                                    >
                                        Role Title
                                    </h4>

                                    <TextField
                                        fullWidth
                                        label="Title"
                                        name="role_title"
                                        autoComplete='off'
                                        value={addRoleData.role_title}
                                        onChange={(e) => {
                                            const regex = /^[a-zA-Z0-9\s\b]*$/;
                                            if (regex.test(e.target.value)) {
                                                handleAddData(e);
                                            }
                                        }}                                        
                                        error={!!errorRoleData.role_title}
                                        required
                                    />
                                </Box>

                                <Box sx={{ marginBottom: '18px' }}>
                                    <h4 className="form-field-heading"
                                        style={{
                                            color: !!errorRoleData.role_title && '#d32f2f'
                                        }}
                                    >
                                        Role Description
                                    </h4>
                                    <TextField
                                        fullWidth
                                        label="Description"
                                        name="role_description"
                                        autoComplete='off'
                                        value={addRoleData.role_description}
                                        onChange={(e) => {
                                            const regex = /^[a-zA-Z0-9\s/,.\b]*$/;
                                            if (regex.test(e.target.value)) {
                                                handleAddData(e);
                                            }
                                        }}
                                        error={!!errorRoleData.role_description}
                                        required
                                    />
                                </Box>

                                <div>
                                    <h4 className="form-field-heading">Permissions</h4>
                                    {module_data &&
                                        Object.keys(module_data).map((index) => {
                                            const module_id = module_data[index].module_id;
                                            const module_name = module_data[index].name;
                                            const module_ui_name = module_data[index].ui_name;
                                            const sub_modules = JSON.parse(module_data[index].sub_modules || "[]");

                                            const ModuleHeader = (
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                    <Checkbox
                                                        name="addRolePermissions"
                                                        id={module_name}
                                                        value={module_name}
                                                        checked={addRoleData["permissions"][module_name] === true}
                                                        onChange={(e) => handlePermissionData(module_name, e.target.checked)}
                                                    />
                                                    <Typography variant="subtitle1">{module_ui_name}</Typography>
                                                </Box>
                                            );

                                            const ModulePermissions = (
                                                <Grid container spacing={2} sx={{ marginTop: 1 }}>
                                                    {permission_data &&
                                                        Object.keys(permission_data).map((permission_index) => {
                                                            const permission = permission_data[permission_index];
                                                            if (module_id === permission.module_id) {
                                                                return (
                                                                    <Grid item xs={12} sm={6} md={4} lg={4} xl={4} key={permission.permission_key} sx={{ display: "flex", alignItems: "center" }}>
                                                                        <Checkbox
                                                                            name="addRolePermissions"
                                                                            id={permission.permission_key}
                                                                            value={permission.permission_key}
                                                                            checked={addRoleData["permissions"][permission.permission_key] === true}
                                                                            onChange={(e) => handlePermissionData(permission.permission_key, e.target.checked)}
                                                                        />
                                                                        <Typography variant="body2">{permission.permission_name}</Typography>
                                                                    </Grid>
                                                                );
                                                            }
                                                            return null;
                                                        })}
                                                </Grid>
                                            );

                                            return (
                                                <Box key={module_name} sx={{ marginBottom: 1, padding: 1, borderRadius: "8px", backgroundColor: "#f9f9f9" }}>
                                                    {sub_modules.length > 0 ? (
                                                        <Accordion>
                                                            <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls={`panel-${module_name}-content`} id={`panel-${module_name}-header`}>
                                                                {ModuleHeader}
                                                            </AccordionSummary>
                                                            <AccordionDetails>{ModulePermissions}</AccordionDetails>
                                                        </Accordion>
                                                    ) : (
                                                        // <Box>
                                                        //     {ModuleHeader}
                                                        //     {ModulePermissions}
                                                        // </Box>
                                                        <Accordion>
                                                            <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls={`panel-${module_name}-content`} id={`panel-${module_name}-header`}>
                                                            {ModuleHeader}
                                                            </AccordionSummary>
                                                            <AccordionDetails>{ModulePermissions}</AccordionDetails>
                                                        </Accordion>
                                                    )}
                                                </Box>
                                            );
                                        })}
                                </div>


                                {/* <h4 className="form-field-heading">Permissions</h4>
                                <Grid container spacing={2}>
                                    {
                                        addPermissionData && Object.keys(addPermissionData).map((fieldName) => {
                                            return (
                                                <Grid item xs={12} md={4} key={fieldName} sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <Checkbox
                                                        name="addRolePermissions"
                                                        id={fieldName}
                                                        value={fieldName}
                                                        p={0}
                                                        checked={addRoleData['permissions'][fieldName] === true ? true : false}
                                                        onChange={(e) =>
                                                            handlePermissionData(fieldName, e.target.checked)
                                                        }
                                                    />
                                                    <label htmlFor={fieldName} style={{ fontSize: '14px' }}>
                                                        {fieldName}
                                                    </label>
                                                </Grid>
                                            )
                                        })
                                    }
                                </Grid> */}

                            </FormControl>
                        </DialogContentText>
                    </DialogContent>
                </Dialog>
            }
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
                              background:"rgb(250 209 209)",
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
                          Are you sure you want to delete the {roleNameToDelete} role? This action
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

            {
                loading && <div className='parent_spinner' tabIndex="-1" aria-hidden="true">
                    <CircularProgress size={100} />
                </div>
            }
        </Box>
    )
}

export default RolePage