import { Box, Button, Checkbox, CircularProgress, FormControl, Grid, IconButton, InputAdornment, TextField, Typography } from "@mui/material"
import { useState } from "react"
import TableView from "../components/table-view/TableView";
import TextFieldInput from '@mui/material/TextField';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import ASC from '@mui/icons-material/North';
import DESC from '@mui/icons-material/South';
import ClearIcon from '@mui/icons-material/Clear';

import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import CloseIcon from '@mui/icons-material/Close';

const RolePage = () => {

    // loader variable
    const [loading, setLoading] = useState(false);

    // table row variable
    const [roleRowData, setRoleRowData] = useState([]);

    const [addPermissionData, setAddPermissionData] = useState({
        'user_mgnt' : false,
        'master' : false,
        'ui_case' : false,
        'pt_case' : false,
        'trial_case' : false,
        'quick_report' : false,
        'create_case' : false,
        'view_case' : false,
        'edit_case' : false,
        'delete_case' : false,
        'add_accused' : false,
        'view_accused' : false,
        'edit_accused' : false,
        'delete_accused' : false,
        'progress_report_enabled' : false,
        'add_progress_report' : false,
        'view_progress_report' : false,
        'edit_progress_report' : false,
        'delete_progress_report' : false,
        'fsl_enabled' : false,
        'add_fsl' : false,
        'view_fsl' : false,
        'edit_fsl' : false,
        'delete_fsl' : false,
        'transfer_to_other_division' : false,
        'change_of_io' : false,
        'prosecution_sanction' : false,
        '17a_pc_act' : false,
        'add_attachment' : false,
        'view_attachment' : false,
        'delete_attachment' : false,
        'download_attachment' : false,
        'view_remark' : false,
        'add_remark' : false,
        'delete_remark' : false,
        'petitions_enabled' : false,
        'add_petitions' : false,
        'view_petitions' : false,
        'edit_petitions' : false,
        'delete_petitions' : false,
        'merge' : false,
        'demerge' : false,
        'case_details_download' : false,
        'cases_download' : false,
        'case_details_print' : false,
        'cases_print' : false,
        'create_pt' : false,
        'view_pt' : false,
        'edit_pt_case' : false,
        'view_witnesses' : false,
        'add_witnesses' : false,
        'edit_witnesses' : false,
        'trial_monitoring' : false,
        'further_investigation' : false,
        'prosecutors_updates' : false,
        'status_update' : false,
        'preliminary_charge_sheet_173_8' : false,
        'create_enquiry' : false,
        'view_enquiry' : false,
        'edit_enquiry' : false,
        'create_new_circular' : false,
        'approval' : false,
        'view_circular' : false,
        'edit_circular' : false,
        'delete_circular' : false,
        'create_new_judgement' : false,
        'view_judgement' : false,
        'edit_judgement' : false,
        'delete_judgement' : false,
        'create_new_government_order' : false,
        'view_government_order' : false,
        'edit_government_order' : false,
        'delete_government_order' : false
    })

    // table column variable
    const [roleColumnData, setRoleColumnData] = useState([
        { field: 'sl_no', headerName: 'S.No' },
        {
            field: '',
            headerName: 'Action',
            flex: 1,
            renderCell: (params) => {
                return (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px', height: '100%' }}>
                        <Button variant="outlined">
                            View
                        </Button>
                        <Button variant="contained" color="primary">
                            Edit
                        </Button>
                        <Button variant="contained" color="error">
                            Delete
                        </Button>
                    </Box>
                );
            }
        }
    ]);


    // add role variables

    const [showRoleAddModal, setShowRoleAddModal] = useState(false)

    const [addRoleData, setAddRoleData] = useState({
        "role_title" : '',
        "role_description" : '',
        "permissions" : addPermissionData
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

        if(errorRoleData[name]){
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

        if(addRoleData.role_title.trim() === ''){
            error_flag = true;
            setErrorRoleData((prevData) => ({
                ...prevData,
                role_title: 'Role title is required'
            }));
        }

        if(addRoleData.role_description.trim()  === ''){
            error_flag = true;
            setErrorRoleData((prevData) => ({
                ...prevData,
                role_description: 'Role Description is required'
            }));
        }

        if(error_flag){
            var errorWarning = "Please Check Title and Description";
            toast.error(errorWarning, {
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

        const token = localStorage.getItem("auth_token");

        addRoleData['transaction_id'] = `role_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

        try {
            
            const serverURL = process.env.REACT_APP_SERVER_URL;
            const response = await fetch(`${serverURL}/role/create_role`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'token' : token
                },
                body: JSON.stringify(addRoleData),
            });

            const data = await response.json();

            if (!response.ok) {
                toast.error(data.message, {
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

            toast.success(data && data.message ? data.message : "Role Created Successfully", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                className: "toast-success"
            });


            setAddRoleData({
                "role_title" : '',
                "role_description" : '',
                "permissions" : addPermissionData
            });

            setShowRoleAddModal(false);

        } catch (err) {
            var errMessage = 'Something went wrong. Please try again.'
            if(err && err.message){
                errMessage = err.message;
            }
            toast.error(errMessage, {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                className: "toast-warning",
            });
            return;
        }

    };
    
    
    return (
        <Box inert={loading ? true : false}>
            <Box p={2}>
                <Box sx={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap'}}>
                    <Box>
                        <Typography className='Roboto' sx={{fontSize:'20px',fontWeight:'600',color:'#1D2939'}}>Role Management</Typography>
                    </Box>
                    <Box sx={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                        <TextFieldInput InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{color:'#475467'}} />
                                </InputAdornment>
                                ),
                            endAdornment: (
                                searchValue && (
                                    <IconButton sx={{padding:0}} onClick={()=>setSearchValue('')} size="small">
                                        <ClearIcon sx={{ color: '#475467' }} />
                                    </IconButton>
                                )
                            )
                            }}
                            onInput={(e)=>setSearchValue(e.target.value)}
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
                            sx={{width:'400px',borderRadius:'6px',outline:'none',
                                '& .MuiInputBase-input::placeholder': {
                                    color: '#475467',
                                    opacity:'1',
                                    fontSize:'14px',
                                    fontWeight:'400',
                                    fontFamily:'Roboto'
                                },
                            }} 
                        />
                        <Button onClick={() => setShowRoleAddModal(true)} sx={{ background: '#32D583', color: '#101828', textTransform: 'none', height: '38px' }} startIcon={<AddIcon sx={{ border: '1.3px solid #101828', borderRadius: '50%' }} />} variant="contained">
                            Add Role
                        </Button>
                    </Box>
                </Box>
                <Box py={2}>
                    <TableView rows={roleRowData} columns={roleColumnData} backBtn={tablePagination !== 1} nextBtn={roleRowData.length === 10} handleBack={handlePrevPage} handleNext={handleNextPage} />
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

                                <Box sx={{marginY:'18px'}}>

                                    <h4 className="form-field-heading" 
                                        style={{
                                            color:!!errorRoleData.role_title && '#d32f2f'
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

                                <Box sx={{marginBottom:'18px'}}>
                                    <h4 className="form-field-heading" 
                                        style={{
                                            color:!!errorRoleData.role_title && '#d32f2f'
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

                                <h4 className="form-field-heading">Permissions</h4>
                                <Grid container spacing={2}>
                                    {
                                        addPermissionData && Object.keys(addPermissionData).map((fieldName) => {
                                            return (
                                                <Grid item xs={12} md={4} key={fieldName} sx={{display:'flex', alignItems:'center'}}>
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
                                </Grid>

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
                loading &&  <div className='parent_spinner' tabIndex="-1" aria-hidden="true">
                                <CircularProgress size={100} />
                            </div>
            }
        </Box>
    )
}

export default RolePage