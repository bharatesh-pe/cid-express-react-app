import { Box, Button, Checkbox, CircularProgress, FormControl, Grid, IconButton, InputAdornment, TextField, Typography , Accordion, AccordionSummary, AccordionDetails } from "@mui/material"
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

    // table row variable
    const [roleRowData, setRoleRowData] = useState([]);

    // table column variable
    const [roleColumnData, setRoleColumnData] = useState([
        { field: 'title', headerName: 'Title', flex: 1 },
        { field: 'description', headerName: 'Description', flex: 1 },
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
                            onClick={() => deleteRole(params.row.id)}                                        >
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
    ]);

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
        if (!id) {
            toast.error("Invalid role ID.");
            return;
        }
    
        try {
            const response = await api.post("/role/delete_role", { id });
    
            if (!response || !response.success) {
                let errorMessage = response.message || "Error deleting role";
    
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
    
            get_details();
    
        } catch (err) {
            toast.error(err?.message || "Something went wrong. Please try again.", {
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
    };
    
    
    const get_details = async () => {
        try {
            const response = await api.post("/role/get_all_roles");
    
            if (response && response.success) {
                const updatedData = response.data.map(row => {
                    const permissions = Object.keys(row).reduce((acc, key) => {
                        if (typeof row[key] === 'boolean') {
                            acc[key] = row[key];
                        }
                        return acc;
                    }, {});
    
                    return {
                        ...row,
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
            console.error("Error fetching roles:", err);
            toast.error("Something went wrong. Please try again.");
        }
    };


    const get_permissions = async () => {
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
            console.error("Error fetching permissions:", err);
            toast.error("Something went wrong. Please try again.");
        }
    };
        
    const get_module = async () => {
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
            console.error("Error fetching module:", err);
            toast.error("Something went wrong. Please try again.");
        }
    };
        
    useEffect(() => {
        get_details();
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
        console.log(name, checked)
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
    
            get_details(); // Refresh role list after creation
    
            setAddRoleData({
                "transaction_id": "",
                "role_title": '',
                "role_description": '',
                "permissions": addPermissionData
            });
    
            setShowRoleAddModal(false);
            
        } catch (err) {
            toast.error(err?.message || "Something went wrong. Please try again.", {
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
    };
    
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSelectedRole(prevState => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleCheckboxChange = (e) => {
        const { value, checked } = e.target;
        setSelectedRole(prevState => ({
            ...prevState,
            permissions: {
                ...prevState.permissions,
                [value]: checked,
            },
        }));
    };


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
    
        if (error_flag) {
            toast.error("Please check title and description", {
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
    
            get_details();
            setShowEditModal(false);
        } catch (err) {
            toast.error(err?.message || "Something went wrong. Please try again.", {
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
    };

    return (
        <Box inert={loading ? true : false}>
            <Dialog
                open={showViewModal}
                onClose={() => setShowViewModal(false)}
                aria-labelledby="view-role-title"
                maxWidth="md"
                fullWidth
            >
                <DialogTitle id="view-role-title" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    View Role
                    <IconButton
                        aria-label="close"
                        onClick={() => setShowViewModal(false)}
                        sx={{ color: (theme) => theme.palette.grey[500] }}
                    >
                        <CloseIcon />
                    </IconButton>
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

                            <h4 className="form-field-heading">Permissions</h4>
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
                            </Grid>
                        </FormControl>
                    </DialogContentText>
                </DialogContent>

                <DialogActions sx={{ padding: '12px 24px' }}>
                    <Button onClick={() => setShowViewModal(false)}>Close</Button>
                </DialogActions>
            </Dialog>

            <Box p={2}>
                <Dialog
                    open={showEditModal}
                    onClose={() => setShowEditModal(false)}
                    aria-labelledby="view-role-title"
                    maxWidth="md"
                    fullWidth
                >
                    <DialogTitle id="view-role-title" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        Edit Role
                        <IconButton
                            aria-label="close"
                            onClick={() => setShowEditModal(false)}
                            sx={{ color: (theme) => theme.palette.grey[500] }}
                        >
                            <CloseIcon />
                        </IconButton>
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
                                        onChange={handleInputChange}
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
                                        onChange={handleInputChange}
                                        required
                                    />
                                </Box>

                                <h4 className="form-field-heading">Permissions</h4>
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
                                </Grid>
                            </FormControl>
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions sx={{ padding: '12px 24px' }}>
                        <Button onClick={() => setShowEditModal(false)}>Close</Button>
                        <Button variant="outlined" onClick={handleEditData}>Edit Role</Button>
                    </DialogActions>
                </Dialog>

            </Box>



            <Box p={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                    <Box>
                        <Typography className='Roboto' sx={{ fontSize: '20px', fontWeight: '600', color: '#1D2939' }}>Role Management</Typography>
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
                                    <IconButton sx={{ padding: 0 }} onClick={() => setSearchValue('')} size="small">
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
                                    transaction_id: `role_${Date.now()}_${Math.floor(Math.random() * 10000)}`
                                }));
                                setShowRoleAddModal(true);
                            }}

                            sx={{ background: '#32D583', color: '#101828', textTransform: 'none', height: '38px' }} startIcon={<AddIcon sx={{ border: '1.3px solid #101828', borderRadius: '50%' }} />} variant="contained">
                            Add Role
                        </Button>
                    </Box>
                </Box>
                <Box py={2}>
                    <TableView rows={roleRowData} columns={roleColumnData} backBtn={tablePagination !== 1} nextBtn={roleRowData.length === 10} handleBack={handlePrevPage} handleNext={handleNextPage}
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
                    fullWidth
                >
                    <DialogTitle id="alert-dialog-title" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} >
                        Add Role
                        <IconButton
                            aria-label="close"
                            onClick={() => setShowRoleAddModal(false)}
                            sx={{ color: (theme) => theme.palette.grey[500] }}
                        >
                            <CloseIcon />
                        </IconButton>
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
                                        onChange={handleAddData}
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
                                        onChange={handleAddData}
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
                                                                    <Grid item xs={12} md={4} key={permission.permission_key} sx={{ display: "flex", alignItems: "center" }}>
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
                                                <Box key={module_name} sx={{ marginBottom: 2, padding: 2, borderRadius: "8px", backgroundColor: "#f9f9f9" }}>
                                                    {sub_modules.length > 0 ? (
                                                        <Accordion>
                                                            <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls={`panel-${module_name}-content`} id={`panel-${module_name}-header`}>
                                                                {ModuleHeader}
                                                            </AccordionSummary>
                                                            <AccordionDetails>{ModulePermissions}</AccordionDetails>
                                                        </Accordion>
                                                    ) : (
                                                        <Box>
                                                            {ModuleHeader}
                                                            {ModulePermissions}
                                                        </Box>
                                                    )}
                                                </Box>
                                            );
                                        })}
                                </div>;


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
                    <DialogActions sx={{ padding: '12px 24px' }}>
                        <Button onClick={() => setShowRoleAddModal(false)}>Close</Button>
                        <Button variant="outlined" onClick={handleAddSaveData}>Add Role</Button>
                    </DialogActions>
                </Dialog>
            }

            {
                loading && <div className='parent_spinner' tabIndex="-1" aria-hidden="true">
                    <CircularProgress size={100} />
                </div>
            }
        </Box>
    )
}

export default RolePage