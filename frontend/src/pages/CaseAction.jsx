import React from 'react';
import { Autocomplete, Box, Button, Checkbox, CircularProgress, FormControl, IconButton, InputAdornment, Radio, Switch, TextField, Typography, Tabs, Tab, Tooltip } from "@mui/material"
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import TableView from "../components/table-view/TableView";
import TextFieldInput from '@mui/material/TextField';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import ASC from '@mui/icons-material/North';
import DESC from '@mui/icons-material/South';
import ClearIcon from '@mui/icons-material/Clear';
import ReactDOMServer from 'react-dom/server';

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
    const [forceTableLoad, setForceTableLoad] = useState(false);

    const [tableData, setTableData] = useState([]);

    const [totalPage, setTotalPage] = useState(0);
    const [totalRecord, setTotalRecord] = useState(0);

    const [tableColumn, setTableColumn] = useState([
        { field: 'sl_no', headerName: 'S.No',resizable: false, width: 70, renderCell: (params) => tableCellRender(params, "sl_no")},
        { 
            field: 'name', 
            headerName: 'Action Name',
            resizable: true,
            width: 200,
            renderCell: (params) => tableCellRender(params, "name")
        },
        { 
            field: 'table', 
            headerName: 'Template',
            resizable: true,
            width: 200,
            renderCell: (params) => tableCellRender(params, "table")
        },
        { 
            field: 'module', 
            headerName: 'Module',
            resizable: true,
            width: 200,
            renderCell: (params) => {
                return (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: 'space-between', width: '200px' }}>
                        <span className='tableValueTextView Roboto' style={{fontSize:'15px',fontWeight:'400'}}>
                            {
                                params && params.row && params.row.module ? changeHeaderNameModule(params.row.module) : ''
                            }
                        </span>
                    </div>
                )
            }
        },
        { 
            field: 'field', 
            headerName: 'Field',
            resizable: true,
            width: 200,
            renderCell: (params) => {
                return (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: 'space-between', width: '200px' }}>
                        <span className='tableValueTextView Roboto' style={{fontSize:'15px',fontWeight:'400'}}>
                            {
                                params && params.row && params.row.field ?  params.row.field.replace(/^field_/, "").replace(/_/g, " ").toLowerCase().replace(/^\w|\s\w/g, (c) => c.toUpperCase()) : ''
                            }
                        </span>
                    </div>
                )
            }
        },
        { 
            field: 'is_pdf', 
            headerName: 'PDF',
            resizable: true,
            width: 100,
            renderCell: (params) => {
                return (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: 'space-between', width: '200px' }}>
                        <span className='tableValueTextView Roboto' style={{fontSize:'15px',fontWeight:'400'}}>
                            {
                                params && params.row && params.row.is_pdf ? 'True' : ''
                            }
                        </span>
                    </div>
                )
            }
        },
        { 
            field: 'is_approval', 
            headerName: 'Approval',
            resizable: true,
            width: 100,
            renderCell: (params) => {
                return (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: 'space-between', width: '200px' }}>
                        <span className='tableValueTextView Roboto' style={{fontSize:'15px',fontWeight:'400'}}>
                            {
                                params && params.row && params.row.is_approval ? 'True' : ''
                            }
                        </span>
                    </div>
                )
            }
        },
        { 
            field: 'is_view_action', 
            headerName: 'View Action',
            resizable: true,
            width: 100,
            renderCell: (params) => {
                return (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: 'space-between', width: '200px' }}>
                        <span className='tableValueTextView Roboto' style={{fontSize:'15px',fontWeight:'400'}}>
                            {
                                params && params.row && params.row.is_view_action ? 'True' : ''
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
            width: 200,
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
    const [otherTemplateDataFields, setOtherTemplateDataFields] = useState([]);
    const [addActionFormData, setAddActionFormData] = useState({});
    const [permissionData, setPermissionData] = useState([]);
    const [approvalItemsData, setApprovalItemsData] = useState([]);
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

    // tab actions state 
    const [tabValue, setTabValue] = useState("template");
    

    useEffect(()=>{

        loadTableData(paginationCount);

    },[paginationCount, forceTableLoad]);

    const handlePagination = (page) => {
        setPaginationCount(page)
    }

    const loadTableData = async (page) => {

        var getTemplatePayload = {
            "page": page,
            "limit": 10,
            "search": searchValue ? searchValue : '',
            "sort_by": tableSortField,
            "sort_order": "DESC"
        }

        setLoading(true);

        try {

            const getOverallActionData = await api.get("/action/get_overall_actions", getTemplatePayload);
            
            setLoading(false);


            if (getOverallActionData.success && getOverallActionData.data) {

                const { meta } = getOverallActionData;

                const totalPages = meta?.totalPages;
                const totalItems = meta?.totalItems;

                if (totalPages !== null && totalPages !== undefined) {
                    setTotalPage(totalPages);
                }

                if (totalItems !== null && totalItems !== undefined) {
                    setTotalRecord(totalItems);
                }

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

    const handleOtherTemplateChange = async (name, value) => {

        if(name === 'table' && tabValue === 'field' && value){

            const viewTableData = {
                "table_name": value
            }
    
            setLoading(true);
            setOtherTemplateDataFields([]);

            const viewTemplateResponse = await api.post("/templates/viewTemplate", viewTableData);

            setLoading(false);
    
            if (viewTemplateResponse && viewTemplateResponse.success) {
    
                if(viewTemplateResponse.data && viewTemplateResponse.data['fields'].length > 0){

                    var updatedOptions = viewTemplateResponse.data['fields'].filter((element)=>{
                        if(element && element.options){
                            return element;
                        }
                    });

                    setOtherTemplateDataFields(updatedOptions)
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

        }else if(name === 'table' && tabValue === 'field' && !value){
            setOtherTemplateDataFields([]);
        }

        setAddActionFormData({
            ...addActionFormData,
            [name]: value,
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

                    if(getOtherTemplateOnly.permissions){
                        setPermissionData(getOtherTemplateOnly.permissions)
                    }

                    if(getOtherTemplateOnly.approval_item){
                        setApprovalItemsData(getOtherTemplateOnly.approval_item)
                    }

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
            toast.error('Please Check Action Name !',{
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
            toast.error('Please Check Module !',{
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
            toast.error('Please Select Template !',{
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

        if(tabValue === 'field'){
            if(!addActionFormData || !addActionFormData['field'] || addActionFormData['field'] === ''){
                toast.error('Please Select Template Fields !',{
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
        }

        if(!addActionFormData['tab'] || addActionFormData['tab'].length === 0){
            toast.error('Please Select Tab Filters Before Submit Actions !',{
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

        const selectedIcon = icons.find(icon => icon.id === addActionFormData['icon']);
        const iconSvg = selectedIcon ? ReactDOMServer.renderToStaticMarkup(selectedIcon.svg) : null;
    
        const payload = {
            ...addActionFormData,
            icon: iconSvg,
            is_pdf: addActionFormData['is_pdf'] || false,
            permissions: addActionFormData['permissions'] ? JSON.stringify(addActionFormData['permissions']) : undefined,
            tab: addActionFormData['tab'] ? JSON.stringify(addActionFormData['tab']) : undefined,
        };        
        console.log(payload, "Payload being sent to backend");

        try {

            const insertActionOptions = await api.post("/action/insert_action", payload);

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
                setOtherTemplateDataFields([]);

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

    const tabModuleObj = {
        "ui_case" : [
            {
                name : 'UI Cases',
                code : 'ui_case'
            },
            {
                name : 'Preliminary Charge Sheet - 173 (8)',
                code : '178_cases'
            },
            {
                name : 'Merged Cases',
                code : 'merge_cases'
            },
            {
                name : 'Disposal',
                code : 'disposal'
            },
            {
                name : 'Reinvestigation',
                code : 'Reinvestigation'
            },
        ],
        "pt_case" : [
            {
                name : 'PT Cases',
                code : 'pt_case'
            },
            {
                name : 'Preliminary Charge Sheet - 173 (8)',
                code : '178_cases'
            },
            {
                name : 'Disposal',
                code : 'disposal'
            }
        ],
        "eq_case" : [
            {
                name : 'Enquiries',
                code : 'eq_case'
            },
            {
                name : 'Completed',
                code : 'Completed'
            },
            {
                name : 'Closed',
                code : 'Closed'
            },
            {
                name : 'Disposal',
                code : 'disposal'
            }
        ]
    }
    const icons = [
        {
            id: 'icon1',
            svg: (
                <svg
                    width="50"
                    height="50"
                    viewBox="0 0 34 34"
                    fill=""
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ width: '34px', height: '34px' }}
                >
                    <circle cx="12" cy="12" r="12" fill=""/>
                    <mask id="mask0_1120_40631" style={{ maskType: 'alpha' }} maskUnits="userSpaceOnUse" x="4" y="4" width="16" height="16">
                        <rect x="4" y="4" width="16" height="16" fill=""/>
                    </mask>
                    <g mask="url(#mask0_1120_40631)">
                        <path d="M5.6001 20V17.4666H18.4001V20H5.6001ZM7.53343 15.1423V13.177L14.2399 6.4628C14.3365 6.36625 14.4368 6.29875 14.5409 6.2603C14.6452 6.22186 14.7524 6.20264 14.8628 6.20264C14.9774 6.20264 15.0856 6.22186 15.1873 6.2603C15.2889 6.29875 15.3865 6.3638 15.4801 6.45547L16.2129 7.18464C16.3053 7.28119 16.3717 7.3803 16.4123 7.48197C16.4528 7.58375 16.4731 7.69325 16.4731 7.81047C16.4731 7.91769 16.4531 8.02453 16.4131 8.13097C16.3731 8.23753 16.308 8.33586 16.2179 8.42597L9.5001 15.1423H7.53343ZM14.7438 8.67314L15.6064 7.8103L14.8654 7.0693L14.0026 7.93197L14.7438 8.67314Z" fill=""/>
                    </g>
                </svg>
            )
        },        
        {
            id: 'icon2',
            svg: (
                <svg
                    width="50"
                    height="50"
                    viewBox="0 0 34 34"
                    fill=""
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ width: '34px', height: '34px' }}
                >
                    <circle cx="12" cy="12" r="12" fill="" />
                    <mask id="mask0_1120_40636" style={{ maskType: 'alpha' }} maskUnits="userSpaceOnUse" x="4" y="4" width="16" height="16">
                        <rect x="4" y="4" width="16" height="16" fill="" />
                    </mask>
                    <g mask="url(#mask0_1120_40636)">
                        <path d="M9.40504 17.2666C9.10493 17.2666 8.85126 17.163 8.64404 16.9558C8.43681 16.7486 8.3332 16.4949 8.3332 16.1948V8.39997H7.5332V7.5333H10.3999V6.8103H13.5999V7.5333H16.4665V8.39997H15.6665V16.1876C15.6665 16.4959 15.5629 16.7527 15.3557 16.9583C15.1485 17.1639 14.8948 17.2666 14.5947 17.2666H9.40504ZM10.6692 15.2H11.5357V9.59997H10.6692V15.2ZM12.464 15.2H13.3305V9.59997H12.464V15.2Z" fill="" />
                    </g>
                </svg>
            )
        },
        {
            id: 'icon3',
            svg: (
                <svg width="50" height="50" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="12" fill=""/>
                    <mask id="mask0_1120_40641" style={{ maskType: 'alpha' }} maskUnits="userSpaceOnUse" x="4" y="4" width="16" height="16">
                        <rect x="4" y="4" width="16" height="16" fill=""/>
                    </mask>
                    <g mask="url(#mask0_1120_40641)">
                        <path d="M7.80523 17.2667C7.5129 17.2667 7.26118 17.1612 7.05007 16.9501C6.83895 16.739 6.7334 16.4872 6.7334 16.1949V7.80523C6.7334 7.50179 6.83895 7.24729 7.05007 7.04173C7.26118 6.83618 7.5129 6.7334 7.80523 6.7334H16.1949C16.4983 6.7334 16.7528 6.83618 16.9584 7.04173C17.164 7.24729 17.2667 7.50179 17.2667 7.80523V16.1949C17.2667 16.4872 17.164 16.739 16.9584 16.9501C16.7528 17.1612 16.4983 17.2667 16.1949 17.2667H7.80523ZM16.4001 8.6654L12.0899 13.0834L10.0771 11.0872L7.60007 13.5642V14.7731L10.0771 12.2962L12.0809 14.3001L16.4001 9.88206V8.6654Z" fill=""/>
                    </g>
                </svg>
            )
        },        
        {
            id: 'icon4',
            svg: (
                <svg width="50" height="50" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="12" fill=""/>
                    <mask id="mask0_1120_40646" style={{ maskType: 'alpha' }} maskUnits="userSpaceOnUse" x="4" y="4" width="16" height="16">
                        <rect x="4" y="4" width="16" height="16" fill=""/>
                    </mask>
                    <g mask="url(#mask0_1120_40646)">
                        <path d="M18.1255 18.7385L16.2152 16.8513C16.0281 16.982 15.8236 17.0838 15.6019 17.157C15.3801 17.2301 15.1479 17.2666 14.9054 17.2666C14.2395 17.2666 13.6757 17.0361 13.214 16.575C12.7525 16.1139 12.5217 15.5534 12.5217 14.8935C12.5217 14.2337 12.7523 13.6735 13.2134 13.2128C13.6745 12.7521 14.2349 12.5218 14.8947 12.5218C15.5546 12.5218 16.1149 12.752 16.5755 13.2123C17.0362 13.6726 17.2665 14.2336 17.2665 14.8953C17.2665 15.1434 17.2283 15.3821 17.1517 15.6113C17.0753 15.8405 16.9716 16.0508 16.8409 16.2423L18.7384 18.1191L18.1255 18.7385ZM7.90237 17.273C7.2437 17.273 6.68415 17.0426 6.2237 16.582C5.76337 16.1213 5.5332 15.5576 5.5332 14.891C5.5332 14.2322 5.76337 13.6726 6.2237 13.2123C6.68415 12.752 7.2437 12.5218 7.90237 12.5218C8.56904 12.5218 9.13276 12.752 9.59354 13.2123C10.0542 13.6726 10.2845 14.2322 10.2845 14.891C10.2845 15.5576 10.0542 16.1213 9.59354 16.582C9.13276 17.0426 8.56904 17.273 7.90237 17.273ZM14.9014 16.4063C15.3157 16.4063 15.669 16.2592 15.9614 15.9651C16.2537 15.6709 16.3999 15.3115 16.3999 14.8868C16.3999 14.4725 16.2523 14.1191 15.9572 13.8268C15.6622 13.5346 15.3075 13.3885 14.8932 13.3885C14.4685 13.3885 14.1105 13.536 13.819 13.831C13.5276 14.1261 13.3819 14.4808 13.3819 14.8951C13.3819 15.3197 13.529 15.6777 13.8232 15.9691C14.1174 16.2606 14.4768 16.4063 14.9014 16.4063ZM7.90237 10.291C7.2437 10.291 6.68415 10.0606 6.2237 9.59996C5.76337 9.13929 5.5332 8.57563 5.5332 7.90896C5.5332 7.25018 5.76337 6.69063 6.2237 6.23029C6.68415 5.76996 7.2437 5.53979 7.90237 5.53979C8.56904 5.53979 9.13276 5.76996 9.59354 6.23029C10.0542 6.69063 10.2845 7.25018 10.2845 7.90896C10.2845 8.57563 10.0542 9.13929 9.59354 9.59996C9.13276 10.0606 8.56904 10.291 7.90237 10.291ZM14.8974 10.291C14.2307 10.291 13.667 10.0606 13.2062 9.59996C12.7455 9.13929 12.5152 8.57563 12.5152 7.90896C12.5152 7.25018 12.7455 6.69063 13.2062 6.23029C13.667 5.76996 14.2307 5.53979 14.8974 5.53979C15.556 5.53979 16.1156 5.76996 16.576 6.23029C17.0364 6.69063 17.2665 7.25018 17.2665 7.90896C17.2665 8.57563 17.0364 9.13929 16.576 9.59996C16.1156 10.0606 15.556 10.291 14.8974 10.291Z" fill=""/>
                    </g>
                </svg>
            )
        },
        {
            id: 'icon5',
            svg: (
                <svg width="50" height="50" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="12" fill=""/>
                    <mask id="mask0_1120_40651" style={{ maskType: 'alpha' }} maskUnits="userSpaceOnUse" x="4" y="4" width="16" height="16">
                        <rect x="4" y="4" width="16" height="16" fill=""/>
                    </mask>
                    <g mask="url(#mask0_1120_40651)">
                        <path d="M7.80523 17.2667C7.51045 17.2667 7.25812 17.1618 7.04823 16.9519C6.83834 16.742 6.7334 16.4897 6.7334 16.1949V7.80523C6.7334 7.51045 6.83834 7.25812 7.04823 7.04823C7.25812 6.83834 7.51045 6.7334 7.80523 6.7334H16.1949C16.4897 6.7334 16.742 6.83834 16.9519 7.04823C17.1618 7.25812 17.2667 7.51045 17.2667 7.80523V13.3629L13.3629 17.2667H7.80523ZM13.2001 16.4001L16.4001 13.2001H13.2001V16.4001ZM9.0949 13.0206H12.0001V12.1539H9.0949V13.0206ZM9.0949 10.6334H14.9052V9.76673H9.0949V10.6334Z" fill=""/>
                    </g>
                </svg>
            )
        },
        {
            id: 'icon6',
            svg: (
                <svg width="50" height="50" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="12" fill=""/>
                    <mask id="mask0_1120_40656" style={{ maskType: 'alpha' }} maskUnits="userSpaceOnUse" x="4" y="4" width="16" height="16">
                        <rect x="4" y="4" width="16" height="16" fill=""/>
                    </mask>
                    <g mask="url(#mask0_1120_40656)">
                        <path d="M9.24997 15.6666C8.6303 15.6666 8.04036 15.5213 7.48013 15.2306C6.91991 14.94 6.4513 14.5341 6.0743 14.0128C5.76152 13.5803 5.52652 13.0722 5.3693 12.4884C5.21197 11.9046 5.1333 11.2529 5.1333 10.5333C5.1333 9.93581 5.34441 9.41981 5.76663 8.98525C6.18886 8.55059 6.68541 8.33325 7.2563 8.33325C7.37519 8.33325 7.4983 8.34225 7.62563 8.36025C7.75297 8.37814 7.87263 8.41059 7.98463 8.45759L12 9.97558L16.0153 8.45759C16.1273 8.41059 16.247 8.37814 16.3743 8.36025C16.5016 8.34225 16.6247 8.33325 16.7436 8.33325C17.3145 8.33325 17.8111 8.55059 18.2333 8.98525C18.6555 9.41981 18.8666 9.93581 18.8666 10.5333C18.8666 11.2529 18.788 11.9046 18.6306 12.4884C18.4734 13.0722 18.244 13.5803 17.9423 14.0128C17.5653 14.5341 17.0967 14.94 16.5365 15.2306C15.9762 15.5213 15.3863 15.6666 14.7666 15.6666C14.0932 15.6666 13.5118 15.5027 13.0225 15.1749L12.2885 14.6833H11.7115L10.9775 15.1749C10.4881 15.5027 9.9123 15.6666 9.24997 15.6666ZM9.6833 13.1229C9.95763 13.1229 10.1745 13.0655 10.334 12.9506C10.4933 12.8356 10.573 12.6687 10.573 12.4499C10.5687 12.0824 10.3141 11.7255 9.80897 11.3794C9.30386 11.0333 8.77863 10.8603 8.2333 10.8603C7.95897 10.8603 7.74313 10.9233 7.5858 11.0493C7.42858 11.1754 7.34997 11.3423 7.34997 11.5499C7.3543 11.9217 7.60791 12.2768 8.1108 12.6153C8.6138 12.9537 9.13797 13.1229 9.6833 13.1229ZM14.2666 13.1396C14.812 13.1396 15.34 12.9665 15.8506 12.6204C16.3613 12.2743 16.6187 11.9175 16.623 11.5499C16.623 11.3354 16.545 11.1695 16.3891 11.0524C16.2331 10.9354 16.0201 10.8769 15.75 10.8769C15.1534 10.8811 14.597 11.0747 14.0808 11.4576C13.5646 11.8405 13.3487 12.2268 13.4333 12.6166C13.4777 12.7798 13.5714 12.9078 13.7141 13.0006C13.8568 13.0933 14.041 13.1396 14.2666 13.1396Z" fill=""/>
                    </g>
                </svg>
            )
        },
    ];
    const handleClear = ()=>{
        setSearchValue('');
        setForceTableLoad((prev) => !prev);
    }
    const searchTableData = ()=>{
        setPaginationCount(1);
        setForceTableLoad((prev) => !prev);
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
                                    <IconButton sx={{ padding: 0 }} onClick={() => handleClear()} size="small">
                                        <ClearIcon sx={{ color: '#475467' }} />
                                    </IconButton>
                                )
                            )
                        }}
                            onInput={(e) => setSearchValue(e.target.value)}
                            value={searchValue}
                            id="tableSearch"
                            size="small"
                            placeholder='Search Action Name '
                            variant="outlined"
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    searchTableData();
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
                            onClick={showActionAddModal}
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
                                Add New
                        </Button>                          

                    </Box>

                </Box>
            </Box>

            <Box py={2}>
                <TableView 
                    rows={tableData} 
                    columns={tableColumn} 
                    totalPage={totalPage} 
                    totalRecord={totalRecord} 
                    paginationCount={paginationCount} 
                    handlePagination={handlePagination} 
                />
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

                            <Tabs
                                value={tabValue}
                                onChange={(e, newValue) => setTabValue(newValue)}
                                centered
                            >
                                <Tab label="Template-Based Action" value="template" />
                                <Tab label="Field-Based Action" value="field" />
                            </Tabs>

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
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <h4 className='Roboto' style={{ fontSize: '16px', fontWeight: '400', margin: 0, marginBottom: 0, color: '#1D2939' }}>
                                    Choose Icon for action
                                </h4>
                                <Box sx={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                    {icons.map((icon) => (
                                        <Box
                                            key={icon.id}
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                cursor: 'pointer',
                                                transition: 'transform 0.3s ease, color 0.3s ease'
                                            }}
                                            className={addActionFormData.icon === icon.id ? 'activeIconSelect' : 'normalViewIconSelect'}
                                            onClick={() => {
                                                setAddActionFormData({ ...addActionFormData, icon: icon.id });
                                            }}
                                        >
                                            {React.cloneElement(icon.svg, {
                                                style: {
                                                transition: 'fill 0.3s ease',
                                                },
                                            })}
                                        </Box>
                                    ))}
                                </Box>
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
                                    onChange={(event, newValue) => handleOtherTemplateChange('table', newValue?.table_name)}
                                    renderInput={(params) =>
                                        <TextField
                                            {...params}
                                            className='selectHideHistory'
                                            label='Templates'
                                        />
                                    }
                                />
                            </Box>

                            { tabValue === 'template' ? 

                                <>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Switch name={'is_pdf'} checked={addActionFormData['is_pdf']} onChange={handleSwitch} />
                                        <Typography pt={1} sx={{ textTransform: 'capitalize', textWrap: 'nowrap' }} className='propsOptionsBtn'>
                                            Do you want to enable PDF Upload
                                        </Typography>
                                    </Box>
                                </>

                            :
                                <>
                                    <Box sx={{display:'flex',flexDirection:'column',gap:'12px'}}>
                                        <h4 className='Roboto' style={{ fontSize: '16px', fontWeight: '400', margin: 0, marginBottom:0, color: '#1D2939' }} >
                                            Choose which fields do want to update
                                        </h4>
                                        <Autocomplete
                                            id=""
                                            options={otherTemplateDataFields}
                                            required
                                            getOptionLabel={(option) => option.label || ''}
                                            value={otherTemplateDataFields.find((option) => option.name === (addActionFormData && addActionFormData['field'])) || null}
                                            onChange={(event, newValue) => handleOtherTemplateChange('field', newValue?.name)}
                                            renderInput={(params) =>
                                                <TextField
                                                    {...params}
                                                    className='selectHideHistory'
                                                    label='Select Fields'
                                                />
                                            }
                                        />
                                    </Box>
                                </>

                            }

                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Switch name={'is_approval'} checked={addActionFormData['is_approval']} onChange={handleSwitch} />
                                        <Typography pt={1} sx={{ textTransform: 'capitalize', textWrap: 'nowrap' }} className='propsOptionsBtn'>
                                            Do you want to enable Approval
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Switch name={'is_view_action'} checked={addActionFormData['is_view_action']} onChange={handleSwitch} />
                                        <Typography pt={1} sx={{ textTransform: 'capitalize', textWrap: 'nowrap' }} className='propsOptionsBtn'>
                                            Do you want to enable only View Action
                                        </Typography>
                                    </Box>
                                    {
                                        addActionFormData['is_approval'] && 
                                        <Box sx={{display:'flex',flexDirection:'column',gap:'12px'}}>
                                            <h4 className='Roboto' style={{ fontSize: '16px', fontWeight: '400', margin: 0, marginBottom:0, color: '#1D2939' }} >
                                                Do you want to set default value for approval items
                                            </h4>
                                            <Autocomplete
                                                id=""
                                                options={approvalItemsData}
                                                required
                                                getOptionLabel={(option) => option.name || ''}
                                                value={approvalItemsData.find((option) => option.approval_item_id === (addActionFormData && addActionFormData['approval_items'])) || null}
                                                onChange={(event, newValue) => handleOtherTemplateChange('approval_items', newValue?.approval_item_id)}
                                                renderInput={(params) =>
                                                    <TextField
                                                        {...params}
                                                        className='selectHideHistory'
                                                        label='Select Approval Items'
                                                    />
                                                }
                                            />
                                        </Box>
                                    }

                                    <Box sx={{display:'flex',flexDirection:'column',gap:'12px'}}>
                                        <h4 className='Roboto' style={{ fontSize: '16px', fontWeight: '400', margin: 0, marginBottom:0, color: '#1D2939' }} >
                                            Choose which permission do you want to add
                                        </h4>
                                        <Autocomplete
                                            id=""
                                            options={permissionData}
                                            required
                                            multiple
                                            limitTags={3}
                                            getOptionLabel={(option) => option.permission_name}
                                            value={permissionData.filter(option => 
                                                [].concat(addActionFormData?.['permissions'] || []).includes(option.permission_key)
                                            )}
                                            onChange={(event, newValue) => {
                                                const selectedCodes = newValue ? newValue.map(item => item.permission_key) : [];
                                                handleOtherTemplateChange('permissions', selectedCodes);
                                            }}
                                            renderInput={(params) =>
                                                <TextField
                                                    {...params}
                                                    className='selectHideHistory'
                                                    label='Select Permission'
                                                />
                                            }
                                        />
                                    </Box>

                                    <Box sx={{display:'flex',flexDirection:'column',gap:'12px'}}>
                                        <h4 className='Roboto' style={{ fontSize: '16px', fontWeight: '400', margin: 0, marginBottom:0, color: '#1D2939' }} >
                                            Choose which action do want to add
                                        </h4>
                                        <Autocomplete
                                            id=""
                                            options={tabModuleObj?.[addActionFormData?.['module']] || []}
                                            required
                                            multiple
                                            limitTags={3}
                                            getOptionLabel={(option) => option.name}
                                            value={(tabModuleObj?.[addActionFormData?.['module']] || []).filter(option =>
                                                [].concat(addActionFormData?.['tab'] || []).includes(option.code)
                                            )}
                                            onChange={(event, newValue) => {
                                                const selectedCodes = newValue ? newValue.map(item => item.code) : [];
                                                handleOtherTemplateChange('tab', selectedCodes);
                                            }}
                                            renderInput={(params) =>
                                                <TextField
                                                    {...params}
                                                    className='selectHideHistory'
                                                    label='Select Tab Filters'
                                                />
                                            }
                                        />
                                    </Box>


                        </FormControl>
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ padding: '12px 24px' }}>
                    <Button onClick={() => setActionAddModal(false)}>Cancel</Button>
                    <Button variant="contained" className='blueButton' sx={{padding: '6px 32px'}} onClick={() => addNewActionData()}>Add</Button>
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