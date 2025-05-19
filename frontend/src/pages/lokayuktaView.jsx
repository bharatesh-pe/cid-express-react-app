import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { Box, Button, Chip, CircularProgress, IconButton, InputAdornment, Stack, Tooltip, Typography } from "@mui/material";
import LokayuktaSidebar from "../components/lokayuktaSidebar";
import { West } from "@mui/icons-material";
import DeleteIcon from '@mui/icons-material/Delete';
import TextFieldInput from "@mui/material/TextField";

import NormalViewForm from "../components/dynamic-form/NormalViewForm";
import TableView from "../components/table-view/TableView";
import api from "../services/api";
import Swal from "sweetalert2";

import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import AddIcon from "@mui/icons-material/Add";
import DynamicForm from "../components/dynamic-form/DynamicForm";
import ApprovalModal from "../components/dynamic-form/ApprovalModalForm";
import ActionPlan from "./ActionPlan";
import ProgressReport from "./ProgressReport";
import PropertyForm from "./PropertyForm";
const LokayuktaView = () => {

    const navigate = useNavigate();
    const { state } = useLocation();
    const { contentArray, headerDetails, backNavigation, paginationCount, sysStatus, rowData, tableFields, stepperData, template_id, template_name, table_name, module } = state || {};

    const [loading, setLoading] = useState(false);
    
    const [activeSidebar, setActiveSidebar] = useState(null);

    const [sidebarContentArray, setSidebarContentArray] = useState(contentArray ? JSON.parse(contentArray) : []);

    // crime investigation states
    const [formReadFlag, setFormReadFlag] = useState(true);
    const [formEditFlag, setFormEditFlag] = useState(false);
    
    const [templateFields, setTemplateFields] = useState(tableFields || []);
    const [initialRowData, setInitialRowData] = useState(rowData || {});
    const [stepperConfig, setStepperConfig] = useState(stepperData || []);

    const [tableName, setTableName] = useState(table_name || null);
    const [templateName, setTemplateName] = useState(template_name || null);

    const [tableRowId, setTableRowId] = useState(rowData?.id || null);
    const [templateId, setTemplateId] = useState(template_id || null);


    // table content states
    const [tableViewFlag, setTableViewFlag] = useState(false);

    const [tableColumnData, setTableColumnData] = useState([
        { field: 'sl_no', headerName: 'Sl. No.' },
    ]);
    const [tableRowData, setTableRowData] = useState([]);

    const tablePaginationCount = useRef(1);

    const [tableSearchValue, setTableSearchValue] = useState(null);
    const [tableTotalPage, setTableTotalPage] = useState(1);
    const [tableTotalRecord, setTableTotalRecord] = useState(0);

    const [tableFilterToDate, setTableFilterToDate] = useState(null);
    const [tableFilterFromDate, setTableFilterFromDate] = useState(null);
    const [tableFilterOtherFilters, setTableFilterOtherFilters] = useState({});


    // action template states
    const [formOpen, setFormOpen] = useState(false);
    const [selectedRowId, setSelectedRowId] = useState(null);
    const [selectedTemplateId, setSelectedTemplateId] = useState(null);
    const [selectedTableName, setSelectedTableName] = useState(null);
    const [selectedTemplateName, setSelectedTemplateName] = useState(null);
    const [readonlyForm, setReadonlyForm] = useState(null);
    const [editOnlyForm, setEditOnlyForm] = useState(null);

    const [formFields, setFormFields] = useState([]);
    const [initalFormData, setInitialFormData] = useState({});
    const [formStepperData, setFormStepperData] = useState([]);

    // for approval data

    const [showApprovalModal, setShowApprovalModal] = useState(false);
    const [approvalItemsData, setApprovalItemsData] = useState([]);
    const [readonlyApprovalItems, setReadonlyApprovalItems] = useState(false);
    const [approvalDesignationData, setApprovalDesignationData] = useState([]);
    const [approvalFormData, setApprovalFormData] = useState({});
    const [approvalSaveCaseData, setApprovalSaveCaseData] = useState({});
    const [reOpenAddCase, setReOpenAddCase] = useState(false);

    var userPermissions = JSON.parse(localStorage.getItem("user_permissions")) || [];

    const backToForm = ()=>{

        if(backNavigation){

            var stateObj = {
                pageCount: paginationCount,
                systemStatus: sysStatus
            }

            navigate(backNavigation, {state : stateObj});
        }
    }

    const sidebarActive = (item)=>{

        if(!item){
            return false;
        }

        setActiveSidebar(item);
        if(item?.viewAction){
            setTableViewFlag(false);
            setTemplateId(template_id);
            setTableRowId(rowData?.id);
            setTemplateName(template_name);
            setTableName(table_name);
            setStepperConfig(stepperData);
            setInitialRowData(rowData);
            setTemplateFields(tableFields);
            setFormEditFlag(false);
            setFormReadFlag(true);
            return;
        }else{
            setTableViewFlag(true);
            getTableData(item);
        }
    }

    function isValidISODate(value) {
        return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value) && !isNaN(new Date(value).getTime());
    }

    const tableHeaderRender = (params, key) => {
        return (
            <Tooltip title={params.colDef.headerName} arrow placement="top">
                <Typography
                    className="MuiDataGrid-columnHeaderTitle mui-multiline-header"
                    sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'normal',
                        wordBreak: 'break-word',
                        lineHeight: '1.2em',
                        fontSize: "15px",
                        fontWeight: "500",
                        color: "#1D2939",
                        width: '100%',
                    }}
                >
                    {params.colDef.headerName}
                </Typography>
            </Tooltip>
        );
    };

    const tableCellRender = (key, params, value, index, tableName) => {
        // if (params?.row?.attachments) {
        //     var attachmentField = params.row.attachments.find((data) => data.field_name === key);
        //     if (attachmentField) {
        //         return fileUploadTableView(key, params, params.value);
        //     }
        // }

        let highlightColor = {};
        let onClickHandler = null;

        if (tableName && index !== null && index === 0 ) {
            highlightColor = { color: '#0167F8', textDecoration: 'underline', cursor: 'pointer' };

            onClickHandler = (event) => {event.stopPropagation()};
        }


        return (
            <Tooltip title={value} placement="top">
                <span
                    style={highlightColor}
                    onClick={onClickHandler}
                    className={`tableValueTextView Roboto`}
                >
                    {value || "-"}
                </span>
            </Tooltip>
        );
    };

    const getTableData = async (options, reOpen, noFilters) => {

        var ui_case_id = rowData?.id;
        var pt_case_id = rowData?.pt_case_id;

        if(module === "pt_case"){
            ui_case_id = rowData?.ui_case_id
            pt_case_id = rowData?.id
        }

        var getTemplatePayload = {
            table_name: options.table,
            ui_case_id: ui_case_id,
            case_io_id: rowData?.field_io_name_id || "",
            pt_case_id: pt_case_id,
            limit : 10,
            page : tablePaginationCount.current,
            search: noFilters ? "" : tableSearchValue,        
            from_date: noFilters ? null : tableFilterFromDate,
            to_date: noFilters ? null : tableFilterToDate,
            filter: noFilters ? {} : tableFilterOtherFilters,
        };

        setLoading(true);
        try {

            const getTemplateResponse = await api.post("/templateData/getTemplateData",getTemplatePayload);
            setLoading(false);

            if (getTemplateResponse && getTemplateResponse.success) {

                const { meta, data } = getTemplateResponse;
            
                const totalPages = meta?.meta?.totalPages;
                const totalItems = meta?.meta?.totalItems;
                
                if (totalPages !== null && totalPages !== undefined) {
                    setTableTotalPage(totalPages);
                }
                
                if (totalItems !== null && totalItems !== undefined) {
                    setTableTotalRecord(totalItems);
                }

                if (data?.length > 0) {

                    const excludedKeys = [
                        "created_at", "updated_at", "id", "deleted_at", "attachments",
                        "Starred", "ReadStatus", "linked_profile_info",
                        "ui_case_id", "pt_case_id", "sys_status", "task_unread_count" , "field_cid_crime_no./enquiry_no","field_io_name" , "field_io_name_id"
                    ];

                    const generateReadableHeader = (key) =>key.replace(/^field_/, "").replace(/_/g, " ").toLowerCase().replace(/^\w|\s\w/g, (c) => c.toUpperCase());

                    const renderCellFunc = (key, count) => (params) => tableCellRender(key, params, params.value, count, options.table);

                    const updatedHeader = [
                        {
                            field: "sl_no",
                            headerName: "S.No",
                            resizable: false,
                            width: 65,
                            renderCell: (params) => {
                                return (
                                    <Box
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "end",
                                            gap: "8px",
                                        }}
                                    >
                                        {params.value}
                                        <DeleteIcon
                                            sx={{ cursor: "pointer", color: "red", fontSize: 20 }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleActionDelete(params.row, options);
                                            }}
                                        />
                                    </Box>
                                );
                            }
                        },
                        ...Object.keys(data[0]).filter((key) => !excludedKeys.includes(key))
                        .map((key, index) => ({
                            field: key,
                            headerName: generateReadableHeader(key),
                            width: generateReadableHeader(key).length < 15 ? 100 : 200,
                            resizable: true,
                            renderHeader: (params) => (
                                tableHeaderRender(params, key)
                            ),
                            renderCell: renderCellFunc(key, index),
                        })),
                    ]

                    const formatDate = (value) => {
                        const parsed = Date.parse(value);
                        if (isNaN(parsed)) return value;
                        return new Date(parsed).toLocaleDateString("en-GB");
                    };

                    const updatedTableData = getTemplateResponse.data.map((field, index) => {

                        const updatedField = {};

                        Object.keys(field).forEach((key) => {
                            if (field[key] && key !== 'id' && isValidISODate(field[key])) {
                                updatedField[key] = formatDate(field[key]);
                            } else {
                                updatedField[key] = field[key];
                            }
                        });

                        return {
                            ...updatedField,
                            sl_no: (tablePaginationCount.current - 1) * 10 + (index + 1),
                            ...(field.id ? {} : { id: "unique_id_" + index }),
                        };
                    });

                    setTableColumnData(updatedHeader);
                    setTableRowData(updatedTableData);
                }else{
                    setTableColumnData([]);
                    setTableRowData([]);
                }

                setFormOpen(false);
                setShowApprovalModal(false);

                if(reOpen){
                    showAddNewForm();
                    return;
                }
            }

        } catch (error) {
            setLoading(false);
            if (error && error.response && error.response["data"]) {
                toast.error(error.response["data"].message ? error.response["data"].message : "Please Try Again !", {
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

    useEffect(()=>{
        setActiveSidebar(sidebarContentArray?.[0] || null);
    },[]);

    const handleClear = () => {
        tablePaginationCount.current = 1;
        setTableSearchValue("");
        setTableFilterToDate(null);
        setTableFilterFromDate(null);
        setTableFilterOtherFilters({});

        getTableData(activeSidebar, false, true);
    };

    const searchTableData = ()=>{
        tablePaginationCount.current = 1;
        getTableData(activeSidebar);
    }

    const handlePagination = (page) => {
        tablePaginationCount.current = page
        getTableData(activeSidebar);
    }

    const handleActionDelete = async (data, options)=>{

        if(!data?.id || !options?.table){
            toast.error('Invaild Template ID', {
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

        Swal.fire({
            title: "Are you sure?",
            text: "Do you want to delete this data ?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, Delete it!",
            cancelButtonText: "No",
        }).then(async (result) => {
            if (result.isConfirmed) {
                const deleteTemplateData = {
                    table_name: options?.table,
                    where: { id: data.id },
                };

                setLoading(true);

                try {
                    const deleteTemplateDataResponse = await api.post("templateData/deleteTemplateData",deleteTemplateData);
                    setLoading(false);

                    if (deleteTemplateDataResponse && deleteTemplateDataResponse.success) {
                        toast.success(deleteTemplateDataResponse.message ? deleteTemplateDataResponse.message : "Template Deleted Successfully",{
                            position: "top-right",
                            autoClose: 3000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                            progress: undefined,
                            className: "toast-success",
                            onOpen: () => {getTableData(options)}
                        });
                    } else {
                        const errorMessage = deleteTemplateDataResponse.message ? deleteTemplateDataResponse.message : "Failed to delete the template. Please try again.";
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
                    if (error && error.response && error.response["data"]) {
                        toast.error(error.response["data"].message ? error.response["data"].message : "Please Try Again !", {
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

    const closeAddForm = ()=>{
        setFormOpen(false);
    }

    const showAddNewForm = async ()=>{
        
        if(!activeSidebar?.table){
            toast.error("Please Check The Template !", {
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

        const viewTableData = {
            table_name: activeSidebar.table,
        };

        setLoading(true);
    
        try {

            const viewTemplateResponse = await api.post("/templates/viewTemplate",viewTableData);
            setLoading(false);

            if (viewTemplateResponse && viewTemplateResponse.success) {
                
                setSelectedRowId(null);
                setSelectedTemplateId(viewTemplateResponse?.["data"]?.template_id);
                setSelectedTableName(viewTemplateResponse?.["data"]?.table_name);
                setSelectedTemplateName(viewTemplateResponse?.["data"]?.template_name);
                
                setReadonlyForm(false);
                setEditOnlyForm(false);
                
                setFormFields(viewTemplateResponse?.["data"]?.["fields"] || []);
                setInitialFormData({});
                if (viewTemplateResponse?.["data"]?.no_of_sections && viewTemplateResponse?.["data"]?.no_of_sections > 0) {
                    setFormStepperData(viewTemplateResponse?.["data"]?.sections ? viewTemplateResponse?.["data"]?.sections: []);
                }

                setFormOpen(true);

            } else {

                const errorMessage = viewTemplateResponse.message ? viewTemplateResponse.message : "Failed to get the template. Please try again.";
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
            if (error && error.response && error.response["data"]) {
                toast.error(error.response["data"].message ? error.response["data"].message : "Please Try Again !", {
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
    
    const formSubmit = async (data, formOpen)=>{

        if (!activeSidebar.table || activeSidebar.table === "") {
            toast.warning("Please Check The Template", {
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
    
        if (Object.keys(data).length === 0) {
            toast.warning("Data Is Empty Please Check Once", {
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

        setApprovalSaveCaseData(data);
        setReOpenAddCase(formOpen);
        showCaseApprovalPage(true);
        return;
    }

    const showCaseApprovalPage = async (isSave)=>{
        
        setLoading(true);
        try {
            const getActionsDetails = await api.post("/ui_approval/get_ui_case_approvals");
            setLoading(false);

            if (getActionsDetails && getActionsDetails.success) {

                setApprovalItemsData(getActionsDetails.data['approval_item']);
                setApprovalDesignationData(getActionsDetails.data['designation']);

                setApprovalFormData({})

                if(activeSidebar?.approval_items){
                    caseApprovalOnChange('approval_item', Number(activeSidebar?.approval_items));
                    setReadonlyApprovalItems(true);
                }else{
                    caseApprovalOnChange('approval_item', null);
                    setReadonlyApprovalItems(false);
                } 

                setShowApprovalModal(true);
            } else {
    
                const errorMessage = getActionsDetails.message ? getActionsDetails.message : "Failed to create the template. Please try again.";
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

    const caseApprovalOnChange = (name, value)=>{
        setApprovalFormData((prev)=>{
            return{
                ...prev,
                [name] : value
            }
        });
    }

    const handleApprovalWithSave = async ()=> {

        if (!approvalFormData || !approvalFormData["approval_item"]) {
            toast.error("Please Select Approval Item !", {
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
        
        if (!approvalFormData || !approvalFormData["approved_by"]) {
            toast.error("Please Select Designation !", {
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

        if (!approvalFormData || !approvalFormData["approval_date"]) {
            toast.error("Please Select Approval Date !", {
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
    
        if (!approvalFormData || !approvalFormData["remarks"]) {
    
            toast.error("Please Enter Comments !", {
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

        const formData = new FormData();

        var approvalItems = {
            module_name : 'Under Investigation',
            action : 'Create Case'
        }

        var approvalData = {
            approval : approvalFormData,
            approval_details : approvalItems,
            others_table_name : table_name
        }

        
        formData.append("table_name", activeSidebar.table);
    
        var normalData = {}; // Non-file upload fields
    
        formFields.forEach((field) => {
            if (approvalSaveCaseData[field.name]) {
                if (field.type === "file" || field.type === "profilepicture") {
                    // Append file fields to formData
                    if (field.type === "file") {
                        if (Array.isArray(approvalSaveCaseData[field.name])) {

                            const hasFileInstance = approvalSaveCaseData[field.name].some((file) => file.filename instanceof File);
                            var filteredArray = approvalSaveCaseData[field.name].filter((file) => file.filename instanceof File);

                            if (hasFileInstance) {
                                approvalSaveCaseData[field.name].forEach((file) => {
                                    if (file.filename instanceof File) {
                                        formData.append(field.name, file.filename);
                                    }
                                });
            
                                filteredArray = filteredArray.map((obj) => {
                                    return {
                                        ...obj,
                                        filename: obj.filename["name"],
                                    };
                                });
                
                                formData.append("folder_attachment_ids",JSON.stringify(filteredArray));
                            }
                        }
                    } else {
                        formData.append(field.name, approvalSaveCaseData[field.name]);
                    }
                } else {
                    normalData[field.name] = Array.isArray(approvalSaveCaseData[field.name]) ? approvalSaveCaseData[field.name].join(",") : approvalSaveCaseData[field.name]
                }
            }
        });

        normalData.sys_status = "ui_case";
        normalData["ui_case_id"] = rowData.id;

        formData.append("data", JSON.stringify(normalData));
        formData.append("others_data", JSON.stringify(approvalData));
        var transitionId = `pt_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
        formData.append("transaction_id", transitionId);
        formData.append("user_designation_id", localStorage.getItem('designation_id') ? localStorage.getItem('designation_id') : null);

        setLoading(true);
          
        try {
            const overallSaveData = await api.post("/templateData/saveDataWithApprovalToTemplates",formData);

            setLoading(false);

            if (overallSaveData && overallSaveData.success) {

                toast.success(overallSaveData.message ? overallSaveData.message : "Case Created Successfully", {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    className: "toast-success",
                    onOpen: () => { getTableData(activeSidebar, reOpenAddCase) }
                });
            } else {
                const errorMessage = overallSaveData.message ? overallSaveData.message : "Failed to Add case. Please try again.";
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
            if (error && error.response && error.response["data"]) {
                toast.error(error.response["data"].message ? error.response["data"].message : "Please Try Again !",{
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

    const formUpdate = (data)=>{
        console.log(data,"data");
    }

    const formError = (error)=>{
        console.log(error,"error");
    }

    return (
        <Stack direction="row" justifyContent="space-between">

            <LokayuktaSidebar contentArray={sidebarContentArray} onClick={sidebarActive} activeSidebar={activeSidebar} templateName={template_name} />

            <Box flex={4} sx={{ overflow: "hidden" }}>

                {activeSidebar?.table === "cid_ui_case_action_plan" ? (

                    
                    <ActionPlan
                        templateName={template_name}
                        headerDetails={headerDetails}
                        rowId={tableRowId}
                        options={activeSidebar}
                        selectedRowData={rowData}
                        backNavigation={backToForm}
                    />
               ) : activeSidebar?.table === "cid_ui_case_progress_report" ? (


                     <ProgressReport
                        templateName={template_name}
                        headerDetails={headerDetails}
                        rowId={tableRowId}
                        options={activeSidebar}
                        selectedRowData={rowData}
                        backNavigation={backToForm}
                    />
                ) : activeSidebar?.table === "cid_ui_case_property_form" ? (


                     <PropertyForm
                        templateName={template_name}
                        headerDetails={headerDetails}
                        rowId={tableRowId}
                        options={activeSidebar}
                        selectedRowData={rowData}
                        backNavigation={backToForm}
                    />
                    
                 ) : (
                    
                    !tableViewFlag ?
                    <Box sx={{overflow: 'auto', height: '100vh'}}>
                        <NormalViewForm 
                            table_row_id={tableRowId}
                            template_id={templateId}
                            template_name={templateName}
                            table_name={tableName}
                            readOnly={formReadFlag}
                            editData={formEditFlag}
                            initialData={initialRowData}
                            formConfig={templateFields}
                            stepperData={stepperConfig}
                            onSubmit={formSubmit}
                            onUpdate={formUpdate}
                            onError={formError}
                            headerDetails={headerDetails || "Case Details"}
                            closeForm={backToForm}
                            noPadding={true}
                        />
                    </Box>
                    :
                    <Box p={2}>
                        <Box pb={1} px={1} sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'start'}}>
                            <Typography
                                sx={{ fontSize: "19px", fontWeight: "500", color: "#171A1C", display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
                                className="Roboto"
                                onClick={backToForm}
                            >
                                <West />
                                <Typography sx={{ fontSize: '19px', fontWeight: '500', color: '#171A1C' }} className='Roboto'>
                                    {template_name ? template_name : 'Form'}
                                </Typography>
                                {headerDetails && (
                                    <Chip
                                        label={headerDetails}
                                        color="primary"
                                        variant="outlined"
                                        size="small"
                                        sx={{ fontWeight: 500, marginTop: '2px' }}
                                    />
                                )}
                            </Typography>

                            <Box sx={{display: 'flex', alignItems: 'start', gap: '12px'}}>
                                <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'end'}}>
                                    <TextFieldInput
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <SearchIcon sx={{ color: '#475467' }} />
                                                </InputAdornment>
                                            ),
                                            endAdornment: (
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                    <IconButton
                                                        sx={{ padding: "0 5px", borderRadius: "0" }}
                                                    >
                                                        <FilterListIcon sx={{ color: "#475467" }} />
                                                    </IconButton>
                                                </Box>
                                            )
                                        }}
                                        onInput={(e) => setTableSearchValue(e.target.value)}
                                        value={tableSearchValue}
                                        id="tableSearch"
                                        size="small"
                                        placeholder='Search..'
                                        variant="outlined"
                                        className="profileSearchClass"
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
                                    {(tableSearchValue || tableFilterToDate || tableFilterFromDate ||
                                        Object.keys(tableFilterOtherFilters).length > 0) && (
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
                                    onClick={showAddNewForm}
                                    sx={{height: "38px",}}
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

                        <Box sx={{overflow: 'auto'}}>
                            <TableView
                                rows={tableRowData}
                                columns={tableColumnData}
                                totalPage={tableTotalPage}
                                totalRecord={tableTotalRecord}
                                paginationCount={tablePaginationCount.current}
                                handlePagination={handlePagination}
                            />
                        </Box>
                    </Box>
                )}

            </Box>

            {formOpen && (
                <DynamicForm
                    table_row_id={selectedRowId}
                    template_id={selectedTemplateId}
                    table_name={selectedTableName}
                    template_name={selectedTemplateName}
                    readOnly={readonlyForm}
                    editData={editOnlyForm}
                    formConfig={formFields}
                    initialData={initalFormData}
                    stepperData={formStepperData}
                    onSubmit={formSubmit}
                    onUpdate={formUpdate}
                    onError={formError}
                    closeForm={closeAddForm}
                />
            )}

            <ApprovalModal
                open={showApprovalModal}
                onClose={() => setShowApprovalModal(false)}
                onSave={handleApprovalWithSave}
                
                approvalItem={approvalItemsData}
                disabledApprovalItems={readonlyApprovalItems}
        
                designationData={approvalDesignationData}
                
                formData={approvalFormData}
                onChange={caseApprovalOnChange}
            />

            {loading && (
                <div className="parent_spinner" tabIndex="-1" aria-hidden="true">
                    <CircularProgress size={100} />
                </div>
            )}
        </Stack>
    );
};

export default LokayuktaView;
