import { Autocomplete, Box, Button, Checkbox, CircularProgress, FormControl, IconButton, InputAdornment, Radio, Switch, TextField, Typography } from "@mui/material"
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
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
import Swal from 'sweetalert2';

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

const CaseActions = () => {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);

    // table states

    const [searchValue, setSearchValue] = useState('');
    const [paginationCount, setPaginationCount] = useState(1);
    const [tableSortField, settableSortField] = useState(null);    

    const [tableData, setTableData] = useState([]);

    const [tableColumn, setTableColumn] = useState([
        { field: 'sl_no', headerName: 'S.No',resizable: false},
        { 
            field: 'name', 
            headerName: 'Action Name',
            resizable: true,
            flex: 2
        },
        { 
            field: 'table', 
            headerName: 'Selected Template',
            resizable: true,
            flex: 2
        },
        { 
            field: 'module', 
            headerName: 'Selected Module',
            resizable: true,
            flex: 2,
            renderCell: (params) => {
                return (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: 'space-between', width: '200px' }}>
                        <span style={{fontSize:'15px',fontWeight:'400'}}>
                            {
                                params && params.row && params.row.module ? changeHeaderNameModule(params.row.module) : ''
                            }
                        </span>
                    </div>
                )
            }
        },
        {
            field: '',
            headerName: 'Action',
            resizable: false,
            flex: 3,
            renderCell: (params) => {
                return (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px', height: '100%' }}>
                        <Button variant="outlined" onClick={(event) => { event.stopPropagation(); handleView(params.row); }}>
                            View
                        </Button>
                        <Button variant="contained" color="error" onClick={(event) => { event.stopPropagation(); handleProfileDelete(params.row); }}>
                            Delete
                        </Button>
                    </Box>
                );
            }
        }
    ]);

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
                return 'Other Template';
            default:
                return 'N/A';
        }
    }

    // adding data states
    const [actionAddModal, setActionAddModal] = useState(false);
    const [otherTemplateData, setOtherTemplateData] = useState([]);
    const [addActionFormData, setAddActionFormData] = useState({});
    const [addActionErrors, setAddActionErrors] = useState({});

    const moduleOptions = {
        id: 'formbuilderModuleOptions',
        label: 'Choose how do you want to create your template',
        options: [
            { name: 'Under Investigation', code: 'ui_case' },
            { name: 'Pending Trail', code: 'pt_case' },
            { name: 'Enquiries', code: 'eq_case' }
        ]
    };
    

    useEffect(()=>{

        loadTableData(paginationCount);

    },[paginationCount]);

    const loadTableData = async (page, searchData) => {

        var getTemplatePayload = {
            "page": page,
            "limit": 10,
            "search": searchData,
            "sort_by": tableSortField,
            "sort_order": "DESC"
        }

        setLoading(true);

        try {

            const getOverallActionData = await api.get("/action/get_overall_actions", getTemplatePayload);
            
            setLoading(false);


            if (getOverallActionData.data && getOverallActionData.data) {

                if(getOverallActionData.data.length > 0){

                    var updatedTableData = getOverallActionData.data.map((field, index) => {
                        return {
                            ...field,
                            id: field.id,
                            sl_no: (page - 1) * 10 + (index + 1),
                            table: field?.table.split('_').join(" "),
                        };
                    });
    
                    setTableData(updatedTableData);

                }else{
                    setTableData([]);
                }

            } else {
                const errorMessage = getOverallActionData.message ? getOverallActionData.message : "Failed to create the template. Please try again.";
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
            setLoading(false);
            if (error && error.response && error.response) {
                toast.error(error.response.message ? error.response.message : 'Please Try Again !',{
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

    const handleView = async (row)=> {

        if (!row || !row.table || row.table === '') {
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
            "table_name": row.table.split(' ').join('_')
        }

        try {

            setLoading(true);
        
            const viewTemplateResponse = await api.post("/templates/viewTemplate", viewTableData);

            if (viewTemplateResponse && viewTemplateResponse.success) {
                
                setLoading(false);

                if(viewTemplateResponse.data && viewTemplateResponse.data['fields']){

                    var sendingObj = {
                        "table_name" : viewTemplateResponse.data['table_name'],
                        "template_name" : viewTemplateResponse.data['template_name'],
                        "stepperData" : viewTemplateResponse.data['no_of_sections'] > 0 ? viewTemplateResponse.data['sections'] : [],
                        "formConfig": viewTemplateResponse.data['fields'],
                        "exitLocation" : '/caseAction',
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

                setLoading(false);
                const errorMessage = viewTemplateResponse.message ? viewTemplateResponse.message : "Please try again.";
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

            setLoading(false);
            if (error && error.response && error.response) {
                toast.error(error.response.message ? error.response.message : 'Please Try Again !',{
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

    const handleProfileDelete = async (row) => {

        if (!row || !row.id || row.id === '') {
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
                    "id": row.id
                }
                setLoading(true);
                try {
                    const deleteTemplateResponse = await api.post("/action/delete_action", deleteTableData);
                    setLoading(false);

                    if (deleteTemplateResponse && deleteTemplateResponse.success) {

                        toast.success(deleteTemplateResponse.message ? deleteTemplateResponse.message : "Action Deleted Successfully", {
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
                        const errorMessage = deleteTemplateResponse.message ? deleteTemplateResponse.message : "Failed to delete the action. Please try again.";
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

    const handleChange = (e) => {
        const { name, value } = e.target;

        setAddActionFormData({
            ...addActionFormData,
            [name]: value,
        });

    };

    const handleOtherTemplateChange = (value) => {
        setAddActionFormData({
            ...addActionFormData,
            ['table']: value,
        });
    };

    const handleSwitch = (e) => {
        const { name, checked } = e.target;

        setAddActionFormData({
            ...addActionFormData,
            [name]: checked
        });

    };

    const handleNextPage = ()=>{
        setPaginationCount((prev)=>prev + 1)
    }

    const handlePrevPage = ()=>{
        setPaginationCount((prev)=>prev - 1)
    }

    const ApplyTableSort = (module)=>{
        settableSortField(module);
    }

    const showActionAddModal = async ()=> {

        setLoading(true);

        try {

            const getOtherTemplateOnly = await api.get("/action/get_other_templates");

            setLoading(false);

            if (getOtherTemplateOnly && getOtherTemplateOnly.success) {

                if (getOtherTemplateOnly.other_templates) {
                    setOtherTemplateData(getOtherTemplateOnly.other_templates);
                    setActionAddModal(true);
                }

            } else {
                
                const errorMessage = getOtherTemplateOnly.message ? getOtherTemplateOnly.message : "Failed to create the template. Please try again.";
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

    const addNewActionData = async ()=> {

        console.log(addActionFormData,"addActionFormData")

        if(!addActionFormData || !addActionFormData['name'] || addActionFormData['name'] === ''){
            toast.error('Please Try Again !',{
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

        if(!addActionFormData || !addActionFormData['module'] || addActionFormData['module'] === ''){
            toast.error('Please Try Again !',{
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

        if(!addActionFormData || !addActionFormData['table'] || addActionFormData['table'] === ''){
            toast.error('Please Try Again !',{
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

        addActionFormData['is_pdf'] = addActionFormData['is_pdf'] ? addActionFormData['is_pdf'] : false ;

        try {

            const insertActionOptions = await api.post("/action/insert_action", addActionFormData);

            setLoading(false);

            if (insertActionOptions && insertActionOptions.success) {

                toast.success(insertActionOptions.message ? insertActionOptions.message : "Action Added Successfully", {
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

                setOtherTemplateData([]);
                setAddActionFormData({});
                setActionAddModal(false);

            } else {
                
                const errorMessage = insertActionOptions.message ? insertActionOptions.message : "Failed to create the template. Please try again.";
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

    return (
        <Box p={2} inert={loading ? true : false}>
    
            <Box px={0.5}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>

                    <Box>
                        <Typography className='Roboto' sx={{ fontSize: '20px', fontWeight: '600', color: '#1D2939' }}>Case Actions</Typography>
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
                                    loadTableData(paginationCount,searchValue);
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
                        
                        <Button onClick={showActionAddModal} sx={{ background: '#32D583', color: '#101828', textTransform: 'none', height: '38px' }} startIcon={<AddIcon sx={{ border: '1.3px solid #101828', borderRadius: '50%' }} />} variant="contained">
                            Add New
                        </Button>

                    </Box>

                </Box>
            </Box>

            <Box py={2}>
                <TableView rows={tableData} columns={tableColumn} backBtn={paginationCount !== 1} nextBtn={tableData.length === 10}  handleBack={handlePrevPage} handleNext={handleNextPage} />
            </Box>

            <Dialog
                open={actionAddModal}
                onClose={() => setActionAddModal(false)}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                maxWidth="md"
                fullWidth
            >
                <DialogTitle id="alert-dialog-title" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} >
                    Add Case Action
                    <IconButton
                        aria-label="close"
                        onClick={() => setActionAddModal(false)}
                        sx={{ color: (theme) => theme.palette.grey[500] }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ minWidth: '400px' }}>
                    <DialogContentText id="alert-dialog-description">
                        <FormControl sx={{paddingTop: '20px', gap:'32px'}} fullWidth>

                            <Box sx={{display:'flex',flexDirection:'column',gap:'12px'}}>
                                <h4 className='Roboto' style={{ fontSize: '16px', fontWeight: '400', margin: 0, marginBottom:0, color: '#1D2939' }} >
                                    Enter Action Name                               
                                </h4>
                                <TextField
                                    fullWidth
                                    label="Action Name"
                                    name="name"
                                    autoComplete='off'
                                    value={addActionFormData.name}
                                    onChange={handleChange}
                                    error={!!addActionErrors.profile_name}
                                    required
                                    helperText={addActionErrors.profile_name ? addActionErrors.profile_name : ""}
                                    margin='0'
                                />
                            </Box>

                            <Box sx={{display:'flex',flexDirection:'column',gap:'12px'}}>
                                <h4 className='Roboto' style={{ fontSize: '16px', fontWeight: '400', margin: 0, marginBottom:0, color: '#1D2939' }} >
                                    Choose how do you want to create your template
                                </h4>
                                <Box>
                                    {moduleOptions.options?.map((option, index) => {
                                        const isSelected = addActionFormData['module'] === option.code;

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

                            <Box sx={{display:'flex',flexDirection:'column',gap:'12px'}}>
                                <h4 className='Roboto' style={{ fontSize: '16px', fontWeight: '400', margin: 0, marginBottom:0, color: '#1D2939' }} >
                                    Choose which template do you want to add
                                </h4>
                                <Autocomplete
                                    id=""
                                    options={otherTemplateData}
                                    required
                                    getOptionLabel={(option) => option.table_name || ''}
                                    value={otherTemplateData.find((option) => option.table_name === (addActionFormData && addActionFormData['table'])) || null}
                                    onChange={(event, newValue) => handleOtherTemplateChange(newValue.table_name)}
                                    renderInput={(params) =>
                                        <TextField
                                            {...params}
                                            className='selectHideHistory'
                                            label='Templates'
                                        />
                                    }
                                />
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Switch name={'is_pdf'} checked={addActionFormData['is_pdf']} onChange={handleSwitch} />
                                <Typography pt={1} sx={{ textTransform: 'capitalize', textWrap: 'nowrap' }} className='propsOptionsBtn'>
                                    Do you want to enable PDF Upload
                                </Typography>
                            </Box>

                        </FormControl>
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ padding: '12px 24px' }}>
                    <Button onClick={() => setActionAddModal(false)}>Cancel</Button>
                    <Button variant="contained" sx={{padding: '6px 32px'}} onClick={() => addNewActionData()}>Add</Button>
                </DialogActions>
            </Dialog>
            


            {loading && 
                <div className='parent_spinner' tabIndex="-1" aria-hidden="true">
                    <CircularProgress size={100} />
                </div>
            }
            
        </Box>
    );
}

export default CaseActions