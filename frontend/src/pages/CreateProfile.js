import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button, TextField, FormControl, Box, Typography, Radio, InputAdornment, IconButton } from '@mui/material';
import TableView from '../components/table-view/TableView';
import AddIcon from '@mui/icons-material/Add';
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Slide from "@mui/material/Slide";
import api from '../services/api';
import TextFieldInput from '@mui/material/TextField';
import SearchIcon from '@mui/icons-material/Search';
import filterLines from '../Images/filterLines.svg'
import ClearIcon from '@mui/icons-material/Clear';

import ASC from '@mui/icons-material/North';
import DESC from '@mui/icons-material/South';

import LogoImg from '../Images/siimsLogo.png';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';

import { CircularProgress } from "@mui/material";

const CreateProfile = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { pagination } = location.state || {};
    const [openModal, setOpenModal] = useState(false);
    const [multipleSectionCount, setMultipleSectionCount] = useState(1);
    const [tableData, setTableData] = useState([]);
    const [paginationCount, setPaginationCount] = useState(pagination ? pagination : 1);
    const [tableSortOption, settableSortOption] = useState('DESC');
    const [tableSortField, settableSortField] = useState('created_at');
    const [showOptionModal,setShowOptionModal] = useState(false)
    const [searchValue,setSearchValue] = useState(null);


    const [formData, setFormData] = useState({
        profile_name: '',
        type: '',
        module: '',
    });
    const [errors, setErrors] = useState({
        profile_name: '',
        type: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [loading, setLoading] = useState(false); // State for loading indicator
    const [error, setError] = useState(null); // State for error messages
    const [data, setData] = useState(null); // State for storing the response data


    useEffect(() => {
        // getProfileTemplates();
        loadTableData(paginationCount);
    }, [paginationCount,tableSortOption]);

    const changeHeaderNameModule = (module)=>{
        switch(module){
            case 'ui_case':
                return 'Under Investigation';
            case 'pt_case':
                return 'Pending Trail';
            case 'eq_case':
                return 'Enquiries';
            case 'master':
                return 'Masters';
            case 'circular':
                return 'Circular';
            case 'governmentorder':
                return 'Government Order';
            case 'judgement':
                return 'Judgement';  
            case 'others':
                return 'Other Actions';
            default:
                return 'N/A';
        }
    }

    const columns: GridColDef[] = [
        {
            field: 'sl_no', headerName: 'S.No.', resizable: false
        },
        { 
            field: 'template_name', 
            headerName: 'Template', 
            width: 200,
            resizable: false,
            renderHeader: () => (
                <div onClick={()=>ApplyTableSort('table_name')} style={{ display: "flex", alignItems: "center", justifyContent: 'space-between', width: '200px' }}>
                    <span style={{color:'#1D2939',fontSize:'15px',fontWeight:'500'}}>Template</span>
                    {tableSortOption === 'ASC' ? <ASC sx={{color:'#475467',width:'18px'}} /> : <DESC sx={{color:'#475467',width:'18px'}} /> }
                </div>
            )
        },
        {
            field: 'template_module',
            headerName: 'Template Module',
            width: 200,
            resizable: false,
            renderHeader: () => (
                <div onClick={()=>ApplyTableSort('template_module')} style={{ display: "flex", alignItems: "center", justifyContent: 'space-between', width: '200px' }}>
                    <span style={{color:'#1D2939',fontSize:'15px',fontWeight:'500'}}>Template Module</span>
                    {tableSortOption === 'ASC' ? <ASC sx={{color:'#475467',width:'18px'}} /> : <DESC sx={{color:'#475467',width:'18px'}} /> }
                </div>
            ),
            renderCell: (params) => {
                return (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: 'space-between', width: '200px' }}>
                        <span style={{fontSize:'15px',fontWeight:'400'}}>
                            {
                                params && params.row && params.row.template_module ? changeHeaderNameModule(params.row.template_module) : ''
                            }
                        </span>
                    </div>
                )
            }
        },
        {
            field: 'link_module',
            headerName: 'Linked Module',
            width: 200,
            resizable: false,
            renderHeader: () => (
                <div onClick={()=>ApplyTableSort('link_module')} style={{ display: "flex", alignItems: "center", justifyContent: 'space-between', width: '200px' }}>
                    <span style={{color:'#1D2939',fontSize:'15px',fontWeight:'500'}}>Linked Module</span>
                    {tableSortOption === 'ASC' ? <ASC sx={{color:'#475467',width:'18px'}} /> : <DESC sx={{color:'#475467',width:'18px'}} /> }
                </div>
            ),
            renderCell: (params) => {
                return (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: 'space-between', width: '200px' }}>
                        <span style={{fontSize:'15px',fontWeight:'400'}}>
                            {
                                params && params.row && params.row.link_module ? changeHeaderNameModule(params.row.link_module) : ''
                            }
                        </span>
                    </div>
                )
            }
        },
        {
            field: '',
            headerName: 'Action',
            flex: 1,
            resizable: false,
            renderCell: (params) => {
                return (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px', height: '100%' }}>
                        <Button variant="outlined" onClick={(event) => { event.stopPropagation(); handleTemplateView(params.row); }}>
                            View
                        </Button>
                        <Button variant="contained" color="primary" onClick={(event) => { event.stopPropagation(); handleTemplateEdit(params.row); }}>
                            Edit
                        </Button>
                        <Button variant="contained" color="error" onClick={(event) => { event.stopPropagation(); handleProfileDelete(params.row); }}>
                            Delete
                        </Button>
                    </Box>
                );
            }
        }
    ];

    const handleTemplateEdit = async (row) => {
        if (!row || !row.table_name || row.table_name === '') {
            toast.warning('Please Check the Template Name', {
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

        const viewTableData = {
            "table_name": row.table_name.split(' ').join('_')
        }

        setLoading(true);
        const viewTemplateResponse = await api.post("/templates/viewTemplate", viewTableData);
        setLoading(false);

        if (viewTemplateResponse && viewTemplateResponse.success) {

            if(viewTemplateResponse.data && viewTemplateResponse.data['fields'].length > 0){
                var formData = {
                    profile_name : viewTemplateResponse.data['template_name'],
                    Createdfields : viewTemplateResponse.data['fields'],
                    type : viewTemplateResponse.data['template_type'],
                    module : viewTemplateResponse.data['template_module'],
                    link_module : viewTemplateResponse.data['link_module'] ? viewTemplateResponse.data['link_module'] : null,
                    stepper : viewTemplateResponse.data['sections'] && viewTemplateResponse.data['sections'].length > 0 ? viewTemplateResponse.data['sections'] : [],
                    action : 'edit',
                    pagination: paginationCount,
                }
                navigate('/formbuilder', { state: formData });
            }

        } else {
            const errorMessage = viewTemplateResponse.message ? viewTemplateResponse.message : "Failed to delete the template. Please try again.";
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
    }

    const handleTemplateView = async (row)=> {
        if (!row || !row.table_name || row.table_name === '') {
            toast.warning('Please Check the Template Name', {
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

        const viewTableData = {
            "table_name": row.table_name.split(' ').join('_')
        }
        setLoading(true);
        const viewTemplateResponse = await api.post("/templates/viewTemplate", viewTableData);
        setLoading(false);

        if (viewTemplateResponse && viewTemplateResponse.success) {

            if(viewTemplateResponse.data && viewTemplateResponse.data['fields']){

                var sendingObj = {
                    "table_name" : viewTemplateResponse.data['table_name'],
                    "template_name" : viewTemplateResponse.data['template_name'],
                    "stepperData" : viewTemplateResponse.data['no_of_sections'] > 0 ? viewTemplateResponse.data['sections'] : [],
                    "formConfig": viewTemplateResponse.data['fields'],
                    "exitLocation" : '/create-profile',
                    "pagination":paginationCount
                }

                navigate('/viewTemplate', { state: sendingObj });
            }else{
                toast.error('No Data Found', {
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

        } else {
            const errorMessage = viewTemplateResponse.message ? viewTemplateResponse.message : "Failed to delete the template. Please try again.";
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
    }

    const handleProfileDelete = async (row) => {

        if (!row || !row.table_name || row.table_name === '') {
            toast.warning('Please Check the Template Name', {
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

        Swal.fire({
            title: 'Are you sure?',
            text: "Do you want to delete this template ?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, Delete it!',
            cancelButtonText: 'No',
        }).then( async (result) => {
            if (result.isConfirmed) {
                const deleteTableData = {
                    "table_name": row.table_name.split(' ').join("_"),
                    "template_name": row.template_name,
                }
                setLoading(true);
                try {
                    const deleteTemplateResponse = await api.post("/templates/deleteTemplate", deleteTableData);
                    setLoading(false);

                    if (deleteTemplateResponse && deleteTemplateResponse.success) {

                        toast.success(deleteTemplateResponse.message ? deleteTemplateResponse.message : "Template Deleted Successfully", {
                            position: "top-right",
                            autoClose: 3000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                            progress: undefined,
                            className: "toast-success",
                            onOpen: () => loadTableData(paginationCount)
                        });

                    } else {
                        const errorMessage = deleteTemplateResponse.message ? deleteTemplateResponse.message : "Failed to delete the template. Please try again.";
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
                    console.log(error, "error");
                    setLoading(false);

                    if (error && error.response && error.response['data']) {
                        toast.error(error.response['data'].message ? error.response['data'].message : 'Please Try Again !', {
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
                }
            } else {
                console.log("Template deletion canceled.");
            }
        });
    }

    const loadTableData = async (page, searchData) => {

        var getTemplatePayload = {
            "page": page,
            "limit": 10,
            "sort_by": tableSortField,
            "order": tableSortOption,
            "search": searchData ? searchData : ''
        }

        setLoading(true);

        try {
            const getTemplateResponse = await api.post("/templates/paginateTemplate", getTemplatePayload);
            setLoading(false);

            if (getTemplateResponse && getTemplateResponse.success) {
                if (getTemplateResponse.data && getTemplateResponse.data['data']) {
                    var updatedTableData = getTemplateResponse.data['data'].map((field, index) => {
                        return {
                            ...field,
                            id: field.table_name + index, // Create a unique id for each row
                            sl_no: (page - 1) * 10 + (index + 1),
                            table_name: field?.table_name.split('_').join(" "),
                        };
                    });

                    setTableData(updatedTableData)
                }

            } else {
                const errorMessage = getTemplateResponse.message ? getTemplateResponse.message : "Failed to create the template. Please try again.";
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
            console.log(error, "error");
            setLoading(false);

            if (error && error.response && error.response['data']) {
                toast.error(error.response['data'].message ? error.response['data'].message : 'Please Try Again !',{
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
        }
    }


    // Validation function
    const validate = () => {
        let formErrors = {};
        let isValid = true;

        if (!formData.profile_name) {
            formErrors.profile_name = 'Name is required';
            isValid = false;
        }

        if (!formData.type) {
            formErrors.type = 'Please select an option';
            isValid = false;
        }

        setErrors(formErrors);
        return isValid;
    };

    // Handle input change
    const handleChange = (e) => {
        const { name, value } = e.target;

        var newObj = {
            ...formData,
            [name]: value,
        }

        if(name === 'type'){
            newObj['stepper'] = [];
        }

        setFormData({
            ...newObj
        });
    };

    // Handle form submit
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (validate()) {
            setLoading(true);

            try {

                var duplicatePayload = {
                    "template_name" : formData.profile_name,
                    "template_module" : formData.module
                }

                var duplicateCheck = await api.post('templates/checkDuplicateTemplate',duplicatePayload);
                setLoading(false);

                if(duplicateCheck && duplicateCheck.success){
                    setIsSubmitting(true);
                    formData['pagination'] = paginationCount;
                    navigate('/formbuilder', { state: formData });
                }else{
                    toast.warning(`Table ${formData.profile_name} already exists`, {
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

            } catch (error) {
                setLoading(false);
                if (error && error.response && error.response['data']) {
                    toast.error(error.response['data'].message ? error.response['data'].message : 'Please Try Again !', {
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
            }
        }
    };

    const addNewOptions = {
        id: 'formbuilderOptions',
        label: 'Choose how do you want to create your template',
        options: [
            { name: 'One sheet template', code: 'onesheettemplate' },
            { name: 'Template with multiple Section', code: 'multiplesection' }
        ]
    };

    const moduleOptions = {
        id: 'formbuilderModuleOptions',
        label: 'Choose how do you want to create your template',
        options: [
            { name: 'Under Investigation', code: 'ui_case' },
            { name: 'Pending Trail', code: 'pt_case' },
            { name: 'Enquiries', code: 'eq_case' },
            { name: 'Masters', code: 'master' },
            { name: 'Circular', code: 'circular' },
            { name: 'Government Order', code: 'governmentorder' },
            { name: 'Judgement', code: 'judgement' },
            { name: 'Other Actions', code: 'others' }
        ]
    };

    const linkModuleOptions = {
        id: 'formbuilderLinkModuleOptions',
        label: 'Choose how do you want to create your template',
        options: [
            { name: 'Under Investigation', code: 'ui_case' },
            { name: 'Pending Trail', code: 'pt_case' },
            { name: 'Enquiries', code: 'eq_case' },
        ]
    };

    // const existingData = JSON.parse(localStorage.getItem("formData")) || [];



    const modalCloseFunc = () => {
        setOpenModal(false);
        setFormData({
            profile_name: '',
            type: '',
            module: ''
        });
    }

    const incrementCount = (e) => {
        if (multipleSectionCount < 5) {
            setMultipleSectionCount(multipleSectionCount + 1);
        }
    };

    const decrementCount = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (multipleSectionCount > 1) {
            setMultipleSectionCount(multipleSectionCount - 1);
            if (formData.stepper && formData.stepper.length > 0) {
                const updatedStepper = formData.stepper.slice(0, multipleSectionCount - 1);
                setFormData((prev) => ({ ...prev, stepper: updatedStepper }));
            }
        }
    };

    const handleStepperChange = (e, index) => {
        const { value } = e.target;

        setFormData((prev) => {
            const updatedStepper = [...(prev.stepper || [])];
            updatedStepper[index] = value;
            return { ...prev, stepper: updatedStepper };
        });
    };

    // handle pagination

    const handleNextPage = ()=>{
        setPaginationCount((prev)=>prev + 1)
    }

    const handlePrevPage = ()=>{
        setPaginationCount((prev)=>prev - 1)
    }

    const ApplyTableSort = (field)=>{
        settableSortOption((prevOption) => (prevOption === 'DESC' ? 'ASC' : 'DESC'));
        settableSortField(field);
    }

    const handleClear = ()=>{
        setSearchValue('');
        loadTableData(paginationCount);
    }

    return (
        <Box sx={{ padding: 2 }} inert={loading ? true : false}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between',alignItems:'center' }}>
                <Box>
                    <Typography className='Roboto' sx={{fontSize:'20px',fontWeight:'600',color:'#1D2939'}}>Templates</Typography>
                    {/* <Typography className='Roboto' sx={{fontSize:'16px',fontWeight:'400',color:'#667085'}}>Overview view of all dossier profile details</Typography> */}
                </Box>
                <Box sx={{ display: 'flex',alignItems:'center',gap:'8px' }}>
                    <TextFieldInput InputProps={{
                                    startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon sx={{color:'#475467'}} />
                                    </InputAdornment>
                                    ),
                                endAdornment: (
                                    searchValue && (
                                        <IconButton sx={{padding:0}} onClick={handleClear} size="small">
                                            <ClearIcon sx={{ color: '#475467' }} />
                                        </IconButton>
                                    )
                                )
                                }}
                                onChange={(e)=>setSearchValue(e.target.value)}
                                value={searchValue}
                                id="tableSearch" 
                                autoComplete='off'
                                size="small"
                                placeholder='Search anything'
                                variant="outlined" 
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        loadTableData(paginationCount, e.target.value);
                                    }
                                }}
                                sx={{width:'300px',borderRadius:'6px',outline:'none',
                                    '& .MuiInputBase-input::placeholder': {
                                        color: '#475467',
                                        opacity:'1',
                                        fontSize:'14px',
                                        fontWeight:'400',
                                        fontFamily:'Roboto'
                                    },
                                }} 
                            />
                <Button sx={{ background: '#32D583',color:'#101828',textTransform:'none' }} startIcon={<AddIcon sx={{border:'1.3px solid #101828',borderRadius:'50%'}} />} variant="contained" onClick={() => setOpenModal(true)}>
                    Create New Template
                </Button>
            </Box>
            </Box>
            <Box sx={{display:'flex',justifyContent:'end',gap:'12px'}} pb={2}>

                <Button onClick={()=>setShowOptionModal(true)} variant="outlined" startIcon={<img src={filterLines} />} sx={{border:'1px solid #D0D5DD',color:'#1D2939',textTransform:'none', display:'none'}}>
                    Filters
                </Button>

            </Box>

            <Dialog
                open={openModal}
                keepMounted
                onClose={() => modalCloseFunc(false)}
                aria-describedby="alert-dialog-slide-description"
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        {/* <Box>
                            <img src={LogoImg} width='53px' height='53px' />
                        </Box> */}
                        <Box>
                            <Typography variant="h3" style={{ fontWeight: '400', fontSize: '18px', color: '#1D2939' }}></Typography>
                            <Typography variant="h5" style={{ fontWeight: '600', fontSize: '24px', color: '#1D2939' }}>Template Creation</Typography>
                        </Box>
                        <Box
                            p={1}
                            sx={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                cursor: "pointer",
                                background: "#EAECF0",
                                borderRadius: "50%",
                            }}
                        >
                            <svg
                                onClick={() => modalCloseFunc(false)}
                                width="20"
                                height="20"
                                viewBox="0 0 20 20"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M14.6666 5.33447L5.33325 14.6678M5.33325 5.33447L14.6666 14.6678"
                                    stroke="#667085"
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </Box>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Box pt={3} sx={{display:'flex',flexDirection:'column',gap:'32px'}}>
                        <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:'32px'}}>
                            <TextField
                                fullWidth
                                label="Template name"
                                name="profile_name"
                                autoComplete='off'
                                value={formData.profile_name}
                                onChange={handleChange}
                                error={!!errors.profile_name}
                                required
                                helperText={errors.profile_name ? errors.profile_name : "Length should be 45 characters or less"}
                                margin='0'
                                inputProps={{
                                    maxLength: 45,
                                }}
                            />

                            <Box sx={{display:'flex',flexDirection:'column',gap:'12px'}}>
                                <h4 className='Roboto' style={{ fontSize: '16px', fontWeight: '400', margin: 0, marginBottom:0, color: '#1D2939' }} >
                                    Choose how do you want to create your template
                                </h4>
                                <Box>
                                {addNewOptions.options?.map((option, index) => {
                                    const isSelected = formData['type'] === option.code;

                                    const styles = {
                                        border: `1px solid ${isSelected ? '#1570EF' : '#D0D5DD'}`,
                                        borderRadius: index === 0
                                            ? '6px 6px 0 0'
                                            : index === addNewOptions.options.length - 1
                                                ? '0 0 6px 6px'
                                                : '0',
                                        background: isSelected ? '#EFF8FF' : '#FCFCFD',
                                        color: isSelected ? '#1D2939' : '#475467',
                                        fontWeight: isSelected ? '500' : '400',
                                    };

                                    return (
                                        <Box key={`${addNewOptions.id}-${option.code}`} sx={{ border: styles.border, borderRadius: styles.borderRadius, background: styles.background }}>
                                            <Radio
                                                name="type"
                                                required
                                                id={`${addNewOptions.id}-${option.code}`}
                                                value={option.code}
                                                checked={isSelected}
                                                onChange={handleChange}
                                            />
                                            <label className='Roboto' style={{ color: `${styles.color}`, fontWeight: `${styles.fontWeight}`, fontSize: '14px', cursor: 'pointer' }} htmlFor={`${addNewOptions.id}-${option.code}`}>
                                                {option.name}
                                            </label>
                                        </Box>
                                    );
                                })}
                                </Box>
                            </Box>

                            <Box sx={{display:'flex',flexDirection:'column',gap:'12px'}}>
                                <h4 className='Roboto' style={{ fontSize: '16px', fontWeight: '400', margin: 0, marginBottom:0, color: '#1D2939' }} >
                                    Choose which module you want to create
                                </h4>
                                <Box>
                                {moduleOptions.options?.map((option, index) => {
                                    const isSelected = formData['module'] === option.code;

                                    const styles = {
                                        border: `1px solid ${isSelected ? '#1570EF' : '#D0D5DD'}`,
                                        borderRadius: index === 0
                                            ? '6px 6px 0 0'
                                            : index === moduleOptions.options.length - 1
                                                ? '0 0 6px 6px'
                                                : '0',
                                        background: isSelected ? '#EFF8FF' : '#FCFCFD',
                                        color: isSelected ? '#1D2939' : '#475467',
                                        fontWeight: isSelected ? '500' : '400',
                                    };

                                    return (
                                        <Box key={`${moduleOptions.id}-${option.code}`} sx={{ border: styles.border, borderRadius: styles.borderRadius, background: styles.background }}>
                                            <Radio
                                                name="module"
                                                required
                                                id={`${moduleOptions.id}-${option.code}`}
                                                value={option.code}
                                                checked={isSelected}
                                                onChange={handleChange}
                                            />
                                            <label className='Roboto' style={{ color: `${styles.color}`, fontWeight: `${styles.fontWeight}`, fontSize: '14px', cursor: 'pointer' }} htmlFor={`${moduleOptions.id}-${option.code}`}>
                                                {option.name}
                                            </label>
                                        </Box>
                                    );
                                })}
                                </Box>
                            </Box>

                            {formData.module === 'others' && (

                                <Box sx={{display:'flex',flexDirection:'column',gap:'12px'}}>
                                    <h4 className='Roboto' style={{ fontSize: '16px', fontWeight: '400', margin: 0, marginBottom:0, color: '#1D2939' }} >
                                        Choose which module you want to link
                                    </h4>
                                    <Box>
                                    {linkModuleOptions.options?.map((option, index) => {
                                        const isSelected = formData['link_module'] === option.code;

                                        const styles = {
                                            border: `1px solid ${isSelected ? '#1570EF' : '#D0D5DD'}`,
                                            borderRadius: index === 0
                                                ? '6px 6px 0 0'
                                                : index === linkModuleOptions.options.length - 1
                                                    ? '0 0 6px 6px'
                                                    : '0',
                                            background: isSelected ? '#EFF8FF' : '#FCFCFD',
                                            color: isSelected ? '#1D2939' : '#475467',
                                            fontWeight: isSelected ? '500' : '400',
                                        };

                                        return (
                                            <Box key={`${linkModuleOptions.id}-${option.code}`} sx={{ border: styles.border, borderRadius: styles.borderRadius, background: styles.background }}>
                                                <Radio
                                                    name="link_module"
                                                    required
                                                    id={`${linkModuleOptions.id}-${option.code}`}
                                                    value={option.code}
                                                    checked={isSelected}
                                                    onChange={handleChange}
                                                />
                                                <label className='Roboto' style={{ color: `${styles.color}`, fontWeight: `${styles.fontWeight}`, fontSize: '14px', cursor: 'pointer' }} htmlFor={`${linkModuleOptions.id}-${option.code}`}>
                                                    {option.name}
                                                </label>
                                            </Box>
                                        );
                                    })}
                                    </Box>
                                </Box>

                            )}

                            {formData.type === 'multiplesection' && (
                                <Box sx={{display:'flex',flexDirection:'column',gap:'16px'}}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px' }}>
                                        <Box>
                                            <h4 className='Roboto' style={{ fontSize: '16px', fontWeight: '400', margin: 0, color: '#1D2939' }}>
                                                How many steps would you like <br /> to create?
                                            </h4>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <button type='button' disabled={multipleSectionCount <= 1} onClick={(event) => decrementCount(event)} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
                                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <g clipPath="url(#clip0_114_13974)">
                                                        <path d="M6.66675 10.0003H13.3334M18.3334 10.0003C18.3334 14.6027 14.6025 18.3337 10.0001 18.3337C5.39771 18.3337 1.66675 14.6027 1.66675 10.0003C1.66675 5.39795 5.39771 1.66699 10.0001 1.66699C14.6025 1.66699 18.3334 5.39795 18.3334 10.0003Z" stroke="#1570EF" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
                                                    </g>
                                                    <defs>
                                                        <clipPath id="clip0_114_13974">
                                                            <rect width="20" height="20" fill="white" />
                                                        </clipPath>
                                                    </defs>
                                                </svg>
                                            </button>
                                            <p style={{ fontSize: '18px', fontWeight: '400', color: '#1D2939', margin: '0' }}>
                                                {multipleSectionCount}
                                            </p>
                                            <button type='button' disabled={multipleSectionCount >= 5} onClick={(event) => incrementCount(event)} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
                                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <g clipPath="url(#clip0_114_13976)">
                                                        <path d="M10.0001 6.66699V13.3337M6.66675 10.0003H13.3334M18.3334 10.0003C18.3334 14.6027 14.6025 18.3337 10.0001 18.3337C5.39771 18.3337 1.66675 14.6027 1.66675 10.0003C1.66675 5.39795 5.39771 1.66699 10.0001 1.66699C14.6025 1.66699 18.3334 5.39795 18.3334 10.0003Z" stroke="#1570EF" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
                                                    </g>
                                                    <defs>
                                                        <clipPath id="clip0_114_13976">
                                                            <rect width="20" height="20" fill="white" />
                                                        </clipPath>
                                                    </defs>
                                                </svg>
                                            </button>
                                        </Box>
                                    </Box>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', flexWrap: 'wrap', gap: '16px'}}>
                                        {multipleSectionCount > 0 &&
                                            Array.from({ length: multipleSectionCount }).map((_, index) => (
                                                <TextField
                                                    key={index}
                                                    label={`Name stepper ${index + 1}`}
                                                    required
                                                    value={formData.stepper && formData.stepper[index] ? formData.stepper[index] : ''}
                                                    onChange={(e) => handleStepperChange(e, index)}
                                                    name={`NameStepper${index + 1}`}
                                                    margin="0"
                                                />
                                            ))
                                        }

                                    </Box>
                                </Box>
                            )}
                            <Button
                                fullWidth
                                variant="contained"
                                color="primary"
                                type="submit"
                                disabled={isSubmitting}
                                sx={{ backgroundColor: '#1570EF', borderRadius: '8px', textTransform: 'none', fontSize: '16px', fontWeight: '500', marginTop: '32px' }}
                            >
                                {isSubmitting ? 'Submitting...' : 'Continue'}
                            </Button>
                        </form>
                    </Box>
                </DialogContent>
            </Dialog>

            <TableView rows={tableData} columns={columns} checkboxSelection={false} backBtn={paginationCount !== 1} nextBtn={tableData.length === 10} handleBack={handlePrevPage} handleNext={handleNextPage} />

            {showOptionModal && 
                <Dialog
                    open={showOptionModal}
                    onClose={() => setShowOptionModal(false)}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">Filters</DialogTitle>
                    <DialogContent sx={{ minWidth: '400px' }}>
                        <DialogContentText id="alert-dialog-description">
                            <FormControl fullWidth>

                            </FormControl>
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions sx={{ padding: '12px 24px' }}>
                        <Button onClick={() => setShowOptionModal(false)}>Cancel</Button>
                        <Button className='fillPrimaryBtn'>Submit</Button>
                    </DialogActions>
                </Dialog>
            }

            {loading && <div className='parent_spinner' tabIndex="-1" aria-hidden="true">
                            <CircularProgress size={100} />
                        </div>}
            

        </Box>
    );
};

export default CreateProfile;