import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { Box, Button, Chip, CircularProgress, IconButton, InputAdornment, Stack, Tooltip, Typography, Tabs, Tab, Checkbox } from "@mui/material";
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
import ChargeSheetInvestigation from "./ChargeSheetInvestigation";
import PropertyForm from "./PropertyForm";
import Mahazars from './Mahazars';
import CDR from "./CDR";
import Report41A from "./Report41A";
import PlanOfAction from "./PlanOfAction";
import EqProgressReport from "./EqProgressReport";
import ClosureReport from "./ClosureReport";
import dayjs from "dayjs";
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import * as XLSX from 'xlsx';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';


import {
  Dialog,
  DialogTitle,
  DialogContent,
  Link,
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CloseIcon from '@mui/icons-material/Close';

import AccusedSplitScreen from './accusedSplitScreen';

const LokayuktaView = () => {

    const navigate = useNavigate();
    const location = useLocation();
    const { state } = location;
    const { contentArray, actionKey, headerDetails, backNavigation, paginationCount, sysStatus, rowData, tableFields, stepperData, template_id, template_name, table_name, module, overAllReadonly, dashboardName, record_id, caseExtension} = state || {};

    const fromCDR = location.state?.fromCDR || false;

    useEffect(()=>{
        if(!rowData){
            navigate("/dashboard");
        }
    },[]);

    const [splitScreenArray, setSplitScreenArray] = useState([
        'cid_ui_case_accused',
        'cid_pt_case_witness',
    ]);

    const [splitScreenNavTabs, setsplitScreenNavTabs] = useState([]);

    const [splitScreenActiveTab, setSplitScreenActiveTab] = useState(null);

    const [showSplitScreenForm, setShowSplitScreenForm] = useState(false);

    const handleTabChange = async (event, newValue) => {

        var tableObj = splitScreenNavTabs[newValue];
         
        if(!tableObj?.table_name){
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

        setSplitScreenActiveTab(newValue);
        setShowSplitScreenForm(true);
    };

    const selectedSplitScreenRef = useRef([]);
    const directAddNewRef = useRef(false);

    const [selectedSplitScreenRows, setSelectedSplitScreenRows] = useState([]);

    useEffect(() => {
        selectedSplitScreenRef.current = selectedSplitScreenRows;
    }, [selectedSplitScreenRows]);

    const handleSplitScreenCheckbox = async (row, table) => {

        try {
            const viewTemplatePayload = { table_name: table, id: row.id };
            const viewTemplateData = await api.post("/templateData/viewTemplateData", viewTemplatePayload);

            const dataToAdd = viewTemplateData?.success && viewTemplateData?.data ? viewTemplateData.data : row;

            setSelectedSplitScreenRows((prev) => {
                const isSelected = prev.some(item => item.id === row.id);

                if (isSelected) {
                    return prev.filter(item => item.id !== row.id);
                }

                return [...prev, dataToAdd];
            });

        } catch (error) {
            console.log(error,"error");
        }

    };

    const closeSplitScreenForm = ()=>{
        setSplitScreenActiveTab(null);
        setShowSplitScreenForm(false);
        setSelectedSplitScreenRows([]);
        directAddNewRef.current = false;
    }

    const handleOpenSplitScreen = async (row, obj, table) => {

        try {
            const viewTemplatePayload = { table_name: table, id: row.id };
            const viewTemplateData = await api.post("/templateData/viewTemplateData", viewTemplatePayload);

            const dataToAdd = viewTemplateData?.success && viewTemplateData?.data ? viewTemplateData.data : row;

            setSplitScreenActiveTab(obj);
            setShowSplitScreenForm(true);
            setSelectedSplitScreenRows([dataToAdd]);

        } catch (error) {
            console.log(error,"error");
        }

    };


    const handleOverAllAccused = async (obj) => {
        setSplitScreenActiveTab(obj);
        setShowSplitScreenForm(true);
        directAddNewRef.current = true
    };

    const [loading, setLoading] = useState(false);
    const [reloadForm, setReloadForm] = useState(false);
    
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

    const [rowValueId,setRowValueId] = useState({});
    const [formFields, setFormFields] = useState([]);
    const [initalFormData, setInitialFormData] = useState({});
    const [formStepperData, setFormStepperData] = useState([]);

    // for approval data

    const [showApprovalModal, setShowApprovalModal] = useState(false);
    const [showCaseApprovalModal, setShowCaseApprovalModal] = useState(false);
    const [approvalItemsData, setApprovalItemsData] = useState([]);
    const [readonlyApprovalItems, setReadonlyApprovalItems] = useState(false);
    const [approvalDesignationData, setApprovalDesignationData] = useState([]);
    const [approvalFormData, setApprovalFormData] = useState({});
    const [approvalSaveCaseData, setApprovalSaveCaseData] = useState({});
    const [reOpenAddCase, setReOpenAddCase] = useState(false);
    const [approvalSource, setApprovalSource] = useState(null);

    const editedForm = useRef(false);
    const [enableSubmit, setEnableSubmit] = useState(false);
    const [approvalDone, setApprovalDone] = useState(false);
    const [approvalFieldArray, setApprovalFieldArray] = useState([]);
    const [approvalStepperArray, setApprovalStepperArray] = useState([]);

    var roleTitle = JSON.parse(localStorage.getItem("role_title")) || "";
    var designationName = localStorage.getItem("designation_name") || "";
    var gettingDesignationName = ""

    if(roleTitle.toLowerCase() === "investigation officer"){
        gettingDesignationName = "io";
    }else{
        var splitingValue = designationName.split(" ");
        if(splitingValue?.[0]){
            gettingDesignationName = splitingValue[0].toLowerCase();
        }
    }

    const userDesignationName = useRef(gettingDesignationName);

    var userPermissions = JSON.parse(localStorage.getItem("user_permissions")) || [];

    const [tableTabs, setTableTabs] = useState([]);
    const [selectedTableTabs, setSelectedTableTabs] = useState("all");

    const NatureOfDisposalAlert = () => (
        <Box
            sx={{
                mt: 3,
                mb: 3,
                mx: 'auto',
                maxWidth: 500,
                p: 3,
                background: '#fffbe6',
                border: '1px solid #ffe58f',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
            }}
        >
            <WarningAmberIcon sx={{ color: '#faad14', fontSize: 40, mr: 1 }} />
            <Box>
                <Typography variant="h6" sx={{ color: '#ad6800', fontWeight: 600 }}>
                    Nature of Disposal Required
                </Typography>
                <Typography sx={{ color: '#ad6800', mt: 0.5 }}>
                    Please take action by updating Nature of Disposal.
                </Typography>
            </Box>
        </Box>
    );

    const [overAllReadonlyCases, setOverAllReadonlyCases] = useState(overAllReadonly ? overAllReadonly : false);
    const [caseFieldArray, setCaseFieldArray] = useState([]);
    const [caseFieldStepperArray, setCaseFieldStepperArray] = useState([]);

    const [caseAction, setCaseAction] = useState([]);
    const [showCaseActionBtn, setShowCaseActionBtn] = useState(false);

    useEffect(()=>{

        sidebarContentArray.map((element)=>{
            if(element.name.toLowerCase() === "assign to io"){

                setCaseFieldArray(initialRowData?.["field_approval_done_by"] ? [initialRowData?.["field_approval_done_by"]] : [] );

                var fieldArray = initialRowData?.["field_approval_done_by"] ? [initialRowData?.["field_approval_done_by"]] : [];
                var stepperArray = (element?.is_approval && element?.approval_steps) ? JSON.parse(element.approval_steps) : [];

                const userRole = userDesignationName.current.toUpperCase();

                const lastApprovedRole = fieldArray[0];
                const lastApprovedIndex = stepperArray.indexOf(lastApprovedRole);

                const approvedStages = stepperArray.slice(0, lastApprovedIndex + 1);

                setShowCaseActionBtn(approvedStages.includes(userRole));

                if(!initialRowData?.["field_approval_done_by"] || initialRowData?.["field_approval_done_by"] !== "DIG"){
                    setCaseAction(element);
                    setCaseFieldStepperArray((element?.is_approval && element?.approval_steps) ? JSON.parse(element.approval_steps) : []);

                    if(approvedStages.includes(userRole)){
                        setFormEditFlag(false);
                        setFormReadFlag(true);
                        setOverAllReadonlyCases(false);
                    }else{
                        setFormEditFlag(false);
                        setFormReadFlag(true);
                        setOverAllReadonlyCases(true);
                    }
                }else if(initialRowData?.["field_approval_done_by"] === "DIG"){
                    setFormEditFlag(false);
                    setFormReadFlag(true);
                    setOverAllReadonlyCases(false);
                }

            }
        });

    },[initialRowData, tableViewFlag]);

    const backToForm = ()=>{

        if(backNavigation){

            var stateObj = {
                pageCount: paginationCount,
                systemStatus: sysStatus,
                actionKey: actionKey ? actionKey : null,
            }

            if(dashboardName){
                stateObj["dashboardName"] = dashboardName
            }

            if(record_id?.length > 0){
                stateObj["record_id"] = record_id
            }

            navigate(backNavigation, {state : stateObj});
        }
    }

    const sidebarActive = async (item)=>{

        if(!item){
            return false;
        }

        if(editedForm.current){
            const result = await Swal.fire({
                title: 'Unsaved Changes',
                text: 'You have unsaved changes. Are you sure you want to leave?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, Exit',
                cancelButtonText: 'No',
            });
    
            if (!result.isConfirmed) {
                return;
            }
        }
                
        if (overAllReadonlyCases) {

            const registerItemArray = ["UI Case", "PT Case", "Enquiries"];

            if(registerItemArray.includes(item.name)){
                return;
            }

            console.log("overAllReadonlyCases", overAllReadonlyCases);
            console.log("item.name", item.name);
            Swal.fire({
                text: 'IO not found. You are not allowed to perform any actions.',
                icon: 'warning',
                confirmButtonText: 'OK'
            });
            return;
        }

        if(caseExtension){
            const registerItemArray = ["UI Case", "PT Case", "Enquiries"];

            if(registerItemArray.includes(item.name)){
                return;
            }

            Swal.fire({
                text: 'Case Extension not Done. You are not allowed to perform any actions.',
                icon: 'warning',
                confirmButtonText: 'OK'
            });
            return;
        }

        closeSplitScreenForm();

        setSelectedSplitScreenRows([]);
        setActiveSidebar(item);
        setFormOpen(false);
        if(item?.viewAction){
            setTableViewFlag(false);
            setTemplateId(template_id);
            setTableRowId(rowData?.id);
            setTemplateName(template_name);
            setTableName(table_name);
            setStepperConfig(stepperData);
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

            // onClickHandler = (event) => {event.stopPropagation()};
            onClickHandler = (event) => {event.stopPropagation();handleTemplateDataView(params.row, false, tableName)};

        }


        return (
            <Tooltip title={value} placement="top">
                <span
                    style={highlightColor}
                    onClick={onClickHandler}
                    className={`tableValueTextView Roboto`}
                >
                    {value || "----"}
                </span>
            </Tooltip>
        );
    };


    const handleTemplateDataView = async (rowData, editData, table_name) => {

        if (!table_name || table_name === "") {
            toast.warning("Please Check Table Name", {
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

        const viewTemplatePayload = { table_name, id: rowData.id };
        setLoading(true);

        try {
            const viewTemplateData = await api.post("/templateData/viewTemplateData", viewTemplatePayload);
            setLoading(false);

            if (viewTemplateData && viewTemplateData.success) {
                const viewTemplateResponse = await api.post("/templates/viewTemplate", { table_name });
                if (viewTemplateResponse && viewTemplateResponse.success) {

                    setSelectedRowId(rowData.id);
                    setSelectedTemplateId(viewTemplateResponse.data.template_id);
                    setSelectedTemplateName(viewTemplateResponse.data.template_name);
                    setSelectedTableName(table_name);
                    setFormFields(viewTemplateResponse.data.fields || []);
                    setFormStepperData(viewTemplateResponse.data.sections || []);
                    setInitialFormData(viewTemplateData.data || {});
                    setReadonlyForm(true);
                    setEditOnlyForm(editData || false);
                    setFormOpen(true);
                    setRowValueId(rowData);
                } else {
                    toast.error(viewTemplateResponse.message || "Failed to fetch template.", {
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
            } else {
                toast.error(viewTemplateData.message || "Failed to fetch data.", {
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
            toast.error(error?.response?.data?.message || "Please Try Again!", {
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
    };

    useEffect(()=>{
        if(tableTabs.length > 0){
            getTableData(activeSidebar);
        }
    },[selectedTableTabs]);


    const getTableData = async (options, reOpen, noFilters) => {

        var ui_case_id = rowData?.id;
        var pt_case_id = rowData?.pt_case_id;

        if(module === "pt_case"){
            ui_case_id = rowData?.ui_case_id
            pt_case_id = rowData?.id
        }

        var getTemplatePayload = {
            table_name: options.table || options,
            ui_case_id: ui_case_id,
            case_io_id: rowData?.field_io_name_id || "",
            pt_case_id: pt_case_id,
            limit : 10,
            page : tablePaginationCount.current,
            search: noFilters ? "" : tableSearchValue,        
            from_date: noFilters ? null : tableFilterFromDate,
            to_date: noFilters ? null : tableFilterToDate,
            filter: noFilters ? {} : tableFilterOtherFilters,
            module: module ? module : 'ui_case',
            tab: sysStatus,
            checkRandomColumn : "field_approval_done_by",
            checkTabs : true,
        };

        setLoading(true);
        try {

            const getTemplateResponse = await api.post("/templateData/getTemplateData",getTemplatePayload);
            setLoading(false);

            if (getTemplateResponse && getTemplateResponse.success) {

                editedForm.current = false;

                const { meta, data } = getTemplateResponse;
            
                const totalPages = meta?.meta?.totalPages;
                const totalItems = meta?.meta?.totalItems;
                const checkRandomColumnValues = meta?.meta?.checkRandomColumnValues;
                const templateJson = meta?.meta?.template_json;
                
                if (totalPages !== null && totalPages !== undefined) {
                    setTableTotalPage(totalPages);
                }
                
                if (totalItems !== null && totalItems !== undefined) {
                    setTableTotalRecord(totalItems);
                }
                if (checkRandomColumnValues) {
                    setApprovalFieldArray(checkRandomColumnValues);
                }else{
                    setApprovalFieldArray([]);
                }

                var tabFields = [];

                if(templateJson && templateJson.length > 0){
                    var gettingTableTabs = templateJson.filter((element)=>{
                        if(element?.tableTabs === true){
                            return element
                        }
                    });

                    if(gettingTableTabs?.[0] && gettingTableTabs?.[0]?.options?.length > 0){
                        var defaultOptions = gettingTableTabs?.[0]?.options;
                        defaultOptions = [
                            {name : "All", code: "all"},
                            ...defaultOptions
                        ];

                        if (gettingTableTabs?.[0]?.name) {

                            if(selectedTableTabs !== "all"){
                                
                                tabFields = templateJson.filter((element)=>{        
 
                                    const isSelected = selectedTableTabs === element.tabOption && !element?.hide_from_ux;
                                    
                                    if(isSelected){
                                        return element
                                    }
    
                                });
                                
                            }
                        }

                        setTableTabs(defaultOptions)
                    }else{
                        setTableTabs([]);
                    }
                }else{
                    setTableTabs([]);
                }

                const generateReadableHeader = (key) =>key.replace(/^field_/, "").replace(/_/g, " ").toLowerCase().replace(/^\w|\s\w/g, (c) => c.toUpperCase());
                
                const renderCellFunc = (key, count) => (params) => tableCellRender(key, params, params.value, count, options.table);

                if (tabFields.length > 0) {
                    tabFields = tabFields.map((key, index) => {
                        return {
                            field: key?.name,
                            headerName: generateReadableHeader(key?.name),
                            width: generateReadableHeader(key?.name).length < 15 ? 100 : 200,
                            resizable: true,
                            renderHeader: (params) => tableHeaderRender(params, key?.name),
                            renderCell: renderCellFunc(key?.name, index),
                        };
                    });

                    tabFields = [
                        {
                            field: "sl_no",
                            headerName: "S.No",
                            resizable: false,
                            width: splitScreenArray.includes((options?.table || '').toLowerCase()) ? 90 : 65,
                            renderCell: (params) => (
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "end",
                                        gap: "8px",
                                    }}
                                >
                                    {splitScreenArray.includes((options?.table || '').toLowerCase()) && (
                                        <Checkbox
                                            size="small"
                                            sx={{padding: 0}}
                                            checked={selectedSplitScreenRows.some(item => item.id === params.row.id)}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleSplitScreenCheckbox(params.row, options?.table);
                                            }}
                                        />
                                    )}
                                    {params.value}
                                    <DeleteIcon
                                        sx={{ cursor: "pointer", color: "red", fontSize: 20 }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleActionDelete(params.row, options);
                                        }}
                                    />
                                </Box>
                            ),
                        },
                        ...tabFields,
                    ];
                }

                setApprovalStepperArray((options?.is_approval && options?.approval_steps) ? JSON.parse(options.approval_steps) : []);

                if (data?.length > 0) {

                    const excludedKeys = [
                        "created_at", "updated_at", "id", "deleted_at", "attachments",
                        "Starred", "ReadStatus", "linked_profile_info",
                        "ui_case_id", "pt_case_id", "sys_status", "task_unread_count" , "field_cid_crime_no./enquiry_no","field_io_name" , "field_io_name_id", "field_approval_done_by"
                    ];

                    const updatedHeader = [
                        {
                            field: "sl_no",
                            headerName: "S.No",
                            resizable: false,
                            width: splitScreenArray.includes((options?.table || '').toLowerCase()) ? 90 : 65,
                            renderCell: (params) => {

                                const checkedFlag = selectedSplitScreenRef.current.some(item => item.id === params.row.id);

                                return (
                                    <Box
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "end",
                                            gap: "8px",
                                        }}
                                    >
                                        {splitScreenArray.includes((options?.table || '').toLowerCase()) && (
                                            <Checkbox
                                                size="small"
                                                sx={{padding: 0}}
                                                checked={checkedFlag}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleSplitScreenCheckbox(params.row, options?.table);
                                                }}
                                            />
                                        )}
                                        {params.value}
                                        {
                                            !approvalDone &&
                                            <DeleteIcon
                                                sx={{ cursor: "pointer", color: "red", fontSize: 20 }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleActionDelete(params.row, options);
                                                }}
                                            />
                                        }
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
                        ...(splitScreenArray.includes(options?.table?.toLowerCase()) ? [
                            {
                                field: "notices",
                                headerName: "Notices",
                                width: 100,
                                resizable: false,
                                renderCell: (params) => (
                                    <Button
                                        variant="contained"
                                        size="small"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleOpenSplitScreen(params.row, 
                                            {label: 'Notices', table_name: 'cid_ui_case_41a_notices'}, 
                                            options?.table
                                            );
                                        }}
                                        className="newStyleButton"
                                    >
                                        Notices
                                    </Button>
                                )
                            },
                            {
                                field: "recording_of_statement",
                                headerName: "Recording",
                                width: 220,
                                resizable: false,
                                renderCell: (params) => (
                                    <Button
                                        variant="contained"
                                        size="small"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleOpenSplitScreen(params.row, 
                                            {label: 'Recording of Statement', table_name: 'cid_ui_case_recording_of_statements'}, 
                                            options?.table
                                            );
                                        }}
                                        className="newStyleButton"
                                    >
                                        Recording of Statement
                                    </Button>
                                )
                            }
                        ] : []),
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

                    setTableColumnData(tabFields.length > 0 ? tabFields : updatedHeader);
                    setTableRowData(updatedTableData);
                }else{
                    setTableColumnData([]);
                    setTableRowData([]);
                }

                setFormOpen(false);
                setShowApprovalModal(false);
                setShowCaseApprovalModal(false);

                if(reOpen){
                    showAddNewForm();
                    return;
                }
            }

        } catch (error) {
            setLoading(false);
            setTableColumnData([]);
            setTableRowData([]);
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
        if (userDesignationName?.current) {
            const userRole = userDesignationName.current.toUpperCase();

            setEnableSubmit(userRole === editableStage);

            const lastApprovedRole = approvalFieldArray[0];
            const lastApprovedIndex = approvalStepperArray.indexOf(lastApprovedRole);

            const approvedStages = approvalStepperArray.slice(0, lastApprovedIndex + 1);

            setApprovalDone(approvedStages.includes(userRole));
        }
    },[approvalFieldArray, approvalStepperArray]);

    useEffect(() => {
        if (fromCDR) {
            const cdrSidebarItem = {
                name: "CDR/IPDR",
                table: "cid_ui_case_cdr_ipdr",
            };
            setSidebarContentArray([cdrSidebarItem]);
            setActiveSidebar(cdrSidebarItem);
        } else {
            setActiveSidebar(sidebarContentArray?.[0] || null);
        }
    }, []);

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

    const closeAddForm = async ()=>{
        if(editedForm.current){
            const result = await Swal.fire({
                title: 'Unsaved Changes',
                text: 'You have unsaved changes. Are you sure you want to leave?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, Exit',
                cancelButtonText: 'No',
            });
    
            if (result.isConfirmed) {
                setFormOpen(false);
                editedForm.current = false;
            }

        }else{
            setFormOpen(false);
            editedForm.current = false;
        }

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
                }else{
                    setFormStepperData([]);
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

        // setApprovalSaveCaseData(data);
        // if (activeSidebar?.is_approval === true) {
        //     setReOpenAddCase(formOpen);
        //     setApprovalSource('submit');
        //     showCaseApprovalPage(true);
        // } else {
            handleDirectCaseSave(data, formOpen);
        // }
        return;
    }

    const showCaseApprovalPage = async (isSave) => {
    setLoading(true);

    try {
        const getActionsDetails = await api.post("/ui_approval/get_ui_case_approvals");
        setLoading(false);

        if (getActionsDetails && getActionsDetails.success) {
            const approvalItemsList = getActionsDetails.data['approval_item'] || [];
            const designationList = getActionsDetails.data['designation'] || [];

            setApprovalItemsData(approvalItemsList);
            setApprovalDesignationData(designationList);
            setApprovalFormData({});

            let selectedApprovalItemId = null;

            if (activeSidebar?.approval_items) {
                selectedApprovalItemId = Number(activeSidebar.approval_items);
                setReadonlyApprovalItems(true);
            }
            if (selectedApprovalItemId !== null) {
                caseApprovalOnChange('approval_item', selectedApprovalItemId);
            } 

            setShowApprovalModal(true);
        } else {
            const errorMessage = getActionsDetails.message
                ? getActionsDetails.message
                : "Failed to create the template. Please try again.";
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
        const errMsg = error?.response?.data?.message || 'Please Try Again !';
        toast.error(errMsg, {
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
    };



    const showMainCaseApprovalPage = async (isSave) => {
    setLoading(true);

    try {
        const getActionsDetails = await api.post("/ui_approval/get_ui_case_approvals");
        setLoading(false);

        if (getActionsDetails && getActionsDetails.success) {
            const approvalItemsList = getActionsDetails.data['approval_item'] || [];
            const designationList = getActionsDetails.data['designation'] || [];

            setApprovalItemsData(approvalItemsList);
            setApprovalDesignationData(designationList);
            setApprovalFormData({});

            let selectedApprovalItemId = null;

            if (activeSidebar?.approval_items) {
                selectedApprovalItemId = Number(activeSidebar.approval_items);
                setReadonlyApprovalItems(true);
            } else {

                    const caseUpdationItem = approvalItemsList.find(
                        item => item.name?.trim().toLowerCase() === 'case updation'
                    );

                    if (caseUpdationItem) {
                        selectedApprovalItemId = caseUpdationItem.approval_item_id;
                    } 

                setReadonlyApprovalItems(false);
            }

            if (selectedApprovalItemId !== null) {
                caseApprovalOnChange('approval_item', selectedApprovalItemId);
            } 

            setShowCaseApprovalModal(true);
        } else {
            const errorMessage = getActionsDetails.message
                ? getActionsDetails.message
                : "Failed to create the template. Please try again.";
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
        const errMsg = error?.response?.data?.message || 'Please Try Again !';
        toast.error(errMsg, {
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
    };


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
            module_name : template_name,
            action :activeSidebar.name,
            type:  module ? module : "ui_case"
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

        normalData.sys_status = module ? module : "ui_case";
        
        var ui_case_id = rowData?.id;
        var pt_case_id = rowData?.pt_case_id;

        if(module === "pt_case"){
            ui_case_id = rowData?.ui_case_id
            pt_case_id = rowData?.id
        }

        normalData["ui_case_id"] = ui_case_id;
        normalData["pt_case_id"] = pt_case_id;

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
                setApprovalSource(null);
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

    const handleDirectCaseSave = async (data, formOpen) => {
        const formData = new FormData();
        let normalData = {};

        formFields.forEach((field) => {
            if (data[field.name]) {
                if (field.type === "file" || field.type === "profilepicture") {
                    if (Array.isArray(data[field.name])) {
                        data[field.name].forEach((file) => {
                            if (file.filename instanceof File) {
                                formData.append(field.name, file.filename);
                            }
                        });
                    } else {
                        formData.append(field.name, data[field.name]);
                    }
                } else {
                    normalData[field.name] = Array.isArray(data[field.name]) ? data[field.name].join(",") : data[field.name];
                }
            }
        });
        if (activeSidebar?.table === "cid_eq_case_enquiry_order_copy") {
            normalData["sys_status"] = data?.field_status || "eq_case";
            if (data?.field_status && rowData?.id) {
            try {
                await api.post("/templateData/updateDataWithApprovalToTemplates", {
                table_name: "cid_enquiry",
                data: JSON.stringify({ sys_status: data.field_status }),
                id: String(rowData.id),
                transaction_id: `pt_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
                user_designation_id: localStorage.getItem("designation_id") || null,
                others_data: JSON.stringify({}),
                });
            } catch (err) {
                console.error("Failed to update cid_enquiry sys_status", err);
            }
            }
        }else {
            normalData.sys_status = module ? module : "ui_case";
        }
        var ui_case_id = rowData?.id;
        var pt_case_id = rowData?.pt_case_id;

        if(module === "pt_case"){
            ui_case_id = rowData?.ui_case_id
            pt_case_id = rowData?.id
        }

        normalData["ui_case_id"] = ui_case_id;
        normalData["pt_case_id"] = pt_case_id;

        var othersData = {};
        formData.append("table_name", activeSidebar.table);
        formData.append("data", JSON.stringify(normalData));
        formData.append("transaction_id", `pt_${Date.now()}_${Math.floor(Math.random() * 10000)}`);
        formData.append("user_designation_id", localStorage.getItem('designation_id') || null);
        formData.append("others_data", JSON.stringify(othersData));

        setLoading(true);

        try {
            const saveResponse = await api.post("/templateData/saveDataWithApprovalToTemplates", formData);
            setLoading(false);

            if (saveResponse && saveResponse.success) {
                toast.success(saveResponse.message || "Case Created Successfully", {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    className: "toast-success",
                    onOpen: () => {
                        if (activeSidebar?.table === "cid_eq_case_enquiry_order_copy") {
                            navigate("/case/enquiry");
                        } else {
                            getTableData(activeSidebar, formOpen);
                        }
                    }
                });
            } else {
                toast.error(saveResponse.message || "Failed to Add Case. Please try again.", {
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
            toast.error(
                error?.response?.data?.message || "Please Try Again !", {
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
    };

    const formUpdate = async (data, formOpen) => {
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

    if (activeSidebar?.is_approval === true) {
        setApprovalSource('update'); 
        showCaseApprovalPage(true);
    } else {
        handleDirectCaseUpdate(data);
    }
    };

    const handleApprovalWithUpdate = async () => {
        if (!approvalFormData?.approval_item) {
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
        if (!approvalFormData?.approved_by) {
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
        if (!approvalFormData?.approval_date) {
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
        if (!approvalFormData?.remarks) {
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

        const approvalItems = {
            module_name: template_name,
            action: activeSidebar.name,
            id: rowData.id,
        };

        const approvalData = {
            approval: approvalFormData,
            approval_details: approvalItems,
        };

        formData.append("table_name", activeSidebar.table);

        const normalData = {};
        formFields.forEach((field) => {
            if (approvalSaveCaseData[field.name]) {
                if (field.type === "file" || field.type === "profilepicture") {
                    if (Array.isArray(approvalSaveCaseData[field.name])) {
                        const files = approvalSaveCaseData[field.name].filter(file => file.filename instanceof File);
                        files.forEach(file => {
                            formData.append(field.name, file.filename);
                        });

                        const fileMeta = files.map(file => ({
                            ...file,
                            filename: file.filename.name
                        }));
                        formData.append("folder_attachment_ids", JSON.stringify(fileMeta));
                    }
                } else {
                    normalData[field.name] = Array.isArray(approvalSaveCaseData[field.name]) ? approvalSaveCaseData[field.name].join(",") : approvalSaveCaseData[field.name];
                }
            }
        });

        normalData.sys_status = module ? module : "ui_case";

        var ui_case_id = rowData?.id;
        var pt_case_id = rowData?.pt_case_id;

        if(module === "pt_case"){
            ui_case_id = rowData?.ui_case_id
            pt_case_id = rowData?.id
        }

        normalData["ui_case_id"] = ui_case_id;
        normalData["pt_case_id"] = pt_case_id;

        formData.append("data", JSON.stringify(normalData));
        formData.append("id",rowValueId.id);
        formData.append("others_data", JSON.stringify(approvalData));
        formData.append("transaction_id", `pt_${Date.now()}_${Math.floor(Math.random() * 10000)}`);
        formData.append("user_designation_id", localStorage.getItem("designation_id") || null);

        setLoading(true);
        try {
            const response = await api.post("/templateData/updateDataWithApprovalToTemplates", formData);
            setLoading(false);

            if (response?.success) {
                toast.success(response.message || "Case Updated Successfully", {
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
                setApprovalSource(null);
                setRowValueId({});
            } else {
                toast.error(response.message || "Failed to update case.", {
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
            toast.error(error?.response?.data?.message || "Please Try Again !", {
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
    };

    const handleDirectCaseUpdate = async (data) => {

        const formData = new FormData();
        const normalData = {};

        formFields.forEach((field) => {
            if (data[field.name]) {
                if (field.type === "file" || field.type === "profilepicture") {
                    if (Array.isArray(data[field.name])) {
                        data[field.name].forEach(file => {
                            if (file.filename instanceof File) {
                                formData.append(field.name, file.filename);
                            }
                        });
                    } else {
                        formData.append(field.name, data[field.name]);
                    }
                } else {
                    normalData[field.name] = Array.isArray(data[field.name]) ? data[field.name].join(",") : data[field.name];
                }
            }
        });

        if (activeSidebar?.table === "cid_eq_case_enquiry_order_copy") {
            normalData["sys_status"] = data?.field_status || "eq_case";
            if (data?.field_status && rowData?.id) {
            try {
                await api.post("/templateData/updateDataWithApprovalToTemplates", {
                table_name: "cid_enquiry",
                data: JSON.stringify({ sys_status: data.field_status }),
                id: String(rowData.id),
                transaction_id: `pt_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
                user_designation_id: localStorage.getItem("designation_id") || null,
                others_data: JSON.stringify({}),
                });
            } catch (err) {
                console.error("Failed to update cid_enquiry sys_status", err);
            }
            }
        }else {
            normalData.sys_status = module ? module : "ui_case";
        }
        
        var ui_case_id = rowData?.id;
        var pt_case_id = rowData?.pt_case_id;

        if(module === "pt_case"){
            ui_case_id = rowData?.ui_case_id
            pt_case_id = rowData?.id
        }

        normalData["ui_case_id"] = ui_case_id;
        normalData["pt_case_id"] = pt_case_id;

        formData.append("table_name", activeSidebar.table);
        formData.append("data", JSON.stringify(normalData));
        formData.append("id",rowValueId.id);
        formData.append("transaction_id", `pt_${Date.now()}_${Math.floor(Math.random() * 10000)}`);
        formData.append("user_designation_id", localStorage.getItem("designation_id") || null);
        formData.append("others_data", JSON.stringify({}));

        setLoading(true);
        try {
            const updateResponse = await api.post("/templateData/updateDataWithApprovalToTemplates", formData);
            setLoading(false);

            if (updateResponse?.success) {
                toast.success(updateResponse.message || "Case Updated Successfully", {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    className: "toast-success",
                    onOpen: () => {
                        if (activeSidebar?.table === "cid_eq_case_enquiry_order_copy") {
                            navigate("/case/enquiry");
                        } else {
                            getTableData(activeSidebar);
                        }
                    }
                });
                setRowValueId({});
            } else {
                toast.error(updateResponse.message || "Failed to update case.");
            }
        } catch (error) {
            setLoading(false);
            toast.error(error?.response?.data?.message || "Please Try Again !");
        }
    };

    const formCaseUpdate = async (data, formOpen) => {
    if (!table_name) {
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
    showMainCaseApprovalPage(true);
    };


    const handleCaseApprovalWithUpdate = async () => {

        if (!approvalFormData?.approval_item) {
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
        if (!approvalFormData?.approved_by) {
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
        if (!approvalFormData?.approval_date) {
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
        if (!approvalFormData?.remarks) {
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

        const approvalItems = {
            module_name: template_name,
            action: activeSidebar.name,
            id: rowData.id,
        };

        const approvalData = {
            approval: approvalFormData,
            approval_details: approvalItems,
        };

        formData.append("table_name", table_name);

        const normalData = {};
        templateFields.forEach((field) => {
            if (approvalSaveCaseData.hasOwnProperty(field.name)) {
                if (field.type === "file" || field.type === "profilepicture") {
                    if (Array.isArray(approvalSaveCaseData[field.name])) {
                        const files = approvalSaveCaseData[field.name].filter(file => file.filename instanceof File);
                        files.forEach(file => {
                            formData.append(field.name, file.filename);
                        });

                        const fileMeta = files.map(file => ({
                            ...file,
                            filename: file.filename.name
                        }));
                        formData.append("folder_attachment_ids", JSON.stringify(fileMeta));
                    }
                } else {
                    const value = approvalSaveCaseData[field.name];
                    normalData[field.name] = Array.isArray(value) ? value.join(",") : value;
                }
            }
        });

        normalData.sys_status = module ? module : "ui_case";

        var ui_case_id = rowData?.id;
        var pt_case_id = rowData?.pt_case_id;

        if(module === "pt_case"){
            ui_case_id = rowData?.ui_case_id
            pt_case_id = rowData?.id
        }

        normalData["ui_case_id"] = ui_case_id;
        normalData["pt_case_id"] = pt_case_id;

        formData.append("data", JSON.stringify(normalData));
        formData.append("id", tableRowId);
        formData.append("others_data", JSON.stringify(approvalData));
        formData.append("transaction_id", `pt_${Date.now()}_${Math.floor(Math.random() * 10000)}`);
        formData.append("user_designation_id", localStorage.getItem("designation_id") || null);

        setLoading(true);
        try {
            const response = await api.post("/templateData/updateDataWithApprovalToTemplates", formData);
            setLoading(false);

            if (response?.success) {
                toast.success(response.message || "Case Updated Successfully", {
                    position: "top-right",
                    autoClose: 3000,
                    className: "toast-success",
                });
                setApprovalSource(null);
                setRowValueId({});

                setFormOpen(false);
                setShowApprovalModal(false);
                setShowCaseApprovalModal(false);

                setInitialRowData((prev) => ({ ...prev, ...normalData }));
                editedForm.current = false;
                setReloadForm((prev)=>!prev);

            } else {
                toast.error(response.message || "Failed to update case.", {
                    position: "top-right",
                    autoClose: 3000,
                    className: "toast-error",
                });
            }
        } catch (error) {
            setLoading(false);
            console.error("Error while updating:", error);
            toast.error(error?.response?.data?.message || "Please Try Again !", {
                position: "top-right",
                autoClose: 3000,
                className: "toast-error",
            });
        }
    };

    const formError = (error)=>{
        console.log(error,"error");
    }

    const editedFormFlag = (edited)=>{
        editedForm.current = edited;
    }

    
    const [selectedApprovalSteps, setSelectedApprovalSteps] = useState({});

    const handleApprovalStepperClick = (stepValue) => {
        
        var selected = Array.isArray(selectedApprovalSteps.approval_steps)
            ? [...selectedApprovalSteps.approval_steps]
            : [];

        if (selected.includes(stepValue)) {
            selected = selected.filter((v) => v !== stepValue);
        } else {
            selected.push(stepValue);
        }

        setSelectedApprovalSteps({
            ...selectedApprovalSteps,
            approval_steps: selected
        });
    };

    const approvalOverAllSubmit = async ()=>{

        const userId = localStorage.getItem("designation_id");

        if(!activeSidebar?.table){
            toast.error("Template Not Found !", {
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
        if(!activeSidebar?.approval_items){
            toast.error("Approval Items Not Found !", {
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
        if(!userId){
            toast.error("User Not Found !", {
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

        const designation = userDesignationName.current?.toUpperCase();

        var ui_case_id = rowData?.id;
        var pt_case_id = rowData?.pt_case_id;

        if(module === "pt_case"){
            ui_case_id = rowData?.ui_case_id
            pt_case_id = rowData?.id
        }

        var payload = {
            value : designation,
            table_name : activeSidebar.table,
            column:  "field_approval_done_by",
            ui_case_id: ui_case_id,
            pt_case_id: pt_case_id,
            Referenceid: rowData?.id,
            approvalDate: dayjs()?.$d,
            approvalItem: activeSidebar?.approval_items,
            approvedBy: userId,
            remarks: activeSidebar?.name + " Investigation Submitted By " + designation,
            module: template_name
        }

        setLoading(true);    
        try {
            const response = await api.post("/templateData/bulkUpdateColumn", payload);
            setLoading(false);

            if (response?.success) {
                toast.success(response.message || "Success", {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    className: "toast-success",
                    onOpen: () => { getTableData(activeSidebar); }
                });
            } else {
                setLoading(false);
                toast.error(response.message || "Something Went Wrong !", {
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
            toast.error(error?.response?.data?.message || "Please Try Again!", {
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

    const editableStage = (() => {
        if(approvalStepperArray.length === 0) return ""
        if (!approvalFieldArray || approvalFieldArray.length === 0) return approvalStepperArray?.[0];
        
        const lastStage = approvalFieldArray[approvalFieldArray.length - 1];
        const nextIndex = approvalStepperArray.indexOf(lastStage) + 1;

        return approvalStepperArray[nextIndex] || null;
    })();

    useEffect(()=>{
        if (userDesignationName?.current) {
            const userRole = userDesignationName.current.toUpperCase();

            setEnableSubmit(userRole === editableStage);

            const lastApprovedRole = approvalFieldArray[0];
            const lastApprovedIndex = approvalStepperArray.indexOf(lastApprovedRole);

            const approvedStages = approvalStepperArray.slice(0, lastApprovedIndex + 1);

            setApprovalDone(approvedStages.includes(userRole));
        }
    },[approvalFieldArray, approvalStepperArray]);

    const reloadApproval = (data)=>{
        setInitialRowData(data);
    }

    // start --- bulk upload functions

    const [bulkUploadShow, setBulkUploadShow] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);

    const showBulkUploadScreen = ()=>{
        setBulkUploadShow(true);
        setSelectedFile(null);
    }
    
    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
    };

    const downloadExcelHeader = async ()=>{
        
        if(!activeSidebar?.table){
            toast.error('Template Not Found !', {
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

        const downloadReport = {
            "table_name": activeSidebar.table,
        }
        setLoading(true);

        try {
            const downloadReportResponse = await api.post("templateData/downloadExcelData", downloadReport);
            setLoading(false);

            if (downloadReportResponse) {
                const blob = new Blob([downloadReportResponse], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `${activeSidebar.table}_Report.xlsx`;

                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);

                window.URL.revokeObjectURL(url);

            } else {
                const errorMessage = downloadReportResponse.message ? downloadReportResponse.message : "Failed to download report. Please try again.";
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
    }

    const checkUploadedFile = async ()=> {

        if(!activeSidebar?.table){
            toast.error('Template Not Found !', {
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

        if (!selectedFile) {
            toast.error('Please upload a file !', {
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

        const allowedExtensions = ['.xlsx', '.xls'];
        const fileName = selectedFile.name.toLowerCase();
        const isValid = allowedExtensions.some(ext => fileName.endsWith(ext));

        if (!isValid) {
            toast.error('Invalid file format. Please upload a valid Excel file (.xls or .xlsx) !', {
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

        const reader = new FileReader();

        reader.onload = async (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];

            const headerColumn = XLSX.utils.sheet_to_json(worksheet, {
                header: 1,
            })[0];
            
            const jsonData = XLSX.utils.sheet_to_json(worksheet);

            // remove unwanted column

            var ui_case_id = rowData?.id;
            var pt_case_id = rowData?.pt_case_id;

            if(module === "pt_case"){
                ui_case_id = rowData?.ui_case_id
                pt_case_id = rowData?.id
            }

            const rowExcelData = jsonData.map(({ __rowNum__, ...rest }) => ({...rest, ui_case_id, pt_case_id }));

            if(rowExcelData.length === 0 || headerColumn.length === 0){
                toast.error('Excel Data and Header is Empty', {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    className: "toast-warning",
                });
                return
            }

            var payloadData = {
                "table_name" : activeSidebar?.table,
                "rowData" : rowExcelData,
                "columnData": headerColumn
            }

            setLoading(true);
            try {
                const bulkInsertResponse = await api.post("templateData/bulkInsertData", payloadData);
                setLoading(false);

                if (bulkInsertResponse?.success) {
                    toast.success(bulkInsertResponse.message || "Data Uploaded Successfully", {
                        position: "top-right",
                        autoClose: 3000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        className: "toast-success",
                        onOpen: () => { getTableData(activeSidebar) }
                    });

                    setBulkUploadShow(false);
                    setSelectedFile(null);

                } else {
                    toast.error(bulkInsertResponse.message || "Failed to Upload Data.", {
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

        };

        reader.readAsArrayBuffer(selectedFile);
    }

    // end --- bulk upload functions

    return (
        <Stack direction="row" justifyContent="space-between">

            <LokayuktaSidebar contentArray={sidebarContentArray} onClick={sidebarActive} activeSidebar={activeSidebar} templateName={template_name} fromCDR={fromCDR} />

            <Box flex={4} sx={{ overflow: "hidden" }}>

                {fromCDR ? (
                    <CDR
                        templateName={template_name}
                        headerDetails={headerDetails}
                        rowId={tableRowId}
                        options={state?.options}
                        selectedRowData={rowData}
                        backNavigation={backToForm}
                    />
                ) : activeSidebar?.table === "cid_ui_case_action_plan" ? (

                    <ActionPlan
                        templateName={template_name}
                        headerDetails={headerDetails}
                        rowId={tableRowId}
                        options={activeSidebar}
                        selectedRowData={rowData}
                        backNavigation={backToForm}
                    />
                ) : activeSidebar?.chargeSheet === true ? (
                    sysStatus === "disposal" ? (
                        <ChargeSheetInvestigation
                            overAllTemplateActions={contentArray}
                            template_name={template_name}
                            headerDetails={headerDetails}
                            tableRowId={tableRowId}
                            options={activeSidebar}
                            rowData={rowData}
                            module={module}
                            backNavigation={backToForm}
                        />
                    ) : (
                        <Box>
                            <Box pb={1} px={1} sx={{display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', marginTop: '24px'}}>
                                <Typography
                                    sx={{ fontSize: "19px", fontWeight: "500", color: "#171A1C", display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
                                    className="Roboto"
                                    onClick={backToForm}
                                >
                                    <West />
                                    <Typography sx={{ fontSize: '19px', fontWeight: '500', color: '#171A1C' }} className='Roboto'>
                                        {activeSidebar.name ? activeSidebar.name : 'Form'}
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
                            </Box>
                            <NatureOfDisposalAlert />
                        </Box>
                    )
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
                ) : activeSidebar?.table === "cid_ui_case_mahajars" ? (


                     <Mahazars
                        templateName={template_name}
                        headerDetails={headerDetails}
                        rowId={tableRowId}
                        options={activeSidebar}
                        selectedRowData={rowData}
                        backNavigation={backToForm}
                    />    
                ) : activeSidebar?.table === "cid_ui_case_cdr_ipdr" ? (


                     <CDR
                        templateName={template_name}
                        headerDetails={headerDetails}
                        rowId={tableRowId}
                        options={activeSidebar}
                        selectedRowData={rowData}
                        backNavigation={backToForm}
                        module={module}
                    />
                    
                ) : activeSidebar?.table === "cid_ui_case_41a_notices" ? (


                     <Report41A
                        templateName={template_name}
                        headerDetails={headerDetails}
                        rowId={tableRowId}
                        options={activeSidebar}
                        selectedRowData={rowData}
                        backNavigation={backToForm}
                        case_table_name = {table_name}
                    />
                    
                ) : activeSidebar?.table === "cid_eq_case_plan_of_action" ? (


                    <PlanOfAction
                        templateName={template_name}
                        headerDetails={headerDetails}
                        rowId={tableRowId}
                        options={activeSidebar}
                        selectedRowData={rowData}
                        backNavigation={backToForm}
                    />
                ) : activeSidebar?.table === "cid_eq_case_progress_report" ? (


                    <EqProgressReport
                        templateName={template_name}
                        headerDetails={headerDetails}
                        rowId={tableRowId}
                        options={activeSidebar}
                        selectedRowData={rowData}
                        backNavigation={backToForm}
                    />
                ) : activeSidebar?.table === "cid_eq_case_closure_report" ? (

                    <ClosureReport
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

                        {
                            caseAction && caseAction?.is_approval && caseAction?.approval_steps && JSON.parse(caseAction?.approval_steps)?.length > 0 && 
                            <Box sx={{ display: "flex", justifyContent: 'center', alignItems: 'center', mt: 2 }}>
                                {
                                    JSON.parse(caseAction?.approval_steps).map((step, index) => {

                                        var selected = false;

                                        var roleTitle = JSON.parse(localStorage.getItem("role_title")) || "";
                                        var designationName = localStorage.getItem("designation_name") || "";

                                        var stepperValue = ""

                                        if(roleTitle.toLowerCase() === "investigation officer"){
                                            stepperValue = "io";
                                        }else{
                                            var splitingValue = designationName.split(" ");
                                            if(splitingValue?.[0]){
                                                stepperValue = splitingValue[0].toLowerCase();
                                            }
                                        }

                                        var alreadySubmited = false;
                                        var nextStageStep = false;

                                        const lastApprovedRole = caseFieldArray[0];
                                        const lastApprovedIndex = caseFieldStepperArray.indexOf(lastApprovedRole);

                                        const approvedStages = caseFieldStepperArray.slice(0, lastApprovedIndex + 1);

                                        const nextStepIndex = lastApprovedIndex + 1;
                                        const nextStep = caseFieldStepperArray[nextStepIndex];

                                        let statusLabel = "Not Assigned";
                                        let statusClass = "submissionNotAssigned";

                                        if (approvedStages.includes(step)) {
                                            alreadySubmited = true;
                                            statusLabel = "Submitted";
                                            statusClass = "submissionCompleted";
                                        } else if (step === nextStep) {
                                            nextStageStep = true;
                                            statusLabel = "Pending";
                                            statusClass = "submissionPending";
                                        }

                                        if(step.toLowerCase() === stepperValue){
                                            selected = true;
                                        }

                                        var StepperTitle = ""
                                        switch (step.toLowerCase()) {
                                            case "io":
                                                StepperTitle = "Investigation Officer";
                                                break;
                                            case "la":
                                                StepperTitle = "Legal Advisor";
                                                break;
                                            case "sp":
                                                StepperTitle = "Superintendent of Police";
                                                break;
                                            case "dig":
                                                StepperTitle = "Deputy Inspector General";
                                                break;
                                            default:
                                                StepperTitle = ""
                                                break;
                                        }

                                        return (
                                            <React.Fragment key={step}>
                                                <Button
                                                    variant="contained"
                                                    onClick={() => handleApprovalStepperClick(step)}
                                                    sx={() => {
                                                        var backgroundColor = "#f0f0f0";
                                                        var color = "#333";
                                                        var boxShadow = "0 2px 6px rgba(0, 0, 0, 0.1)";

                                                        if (alreadySubmited) {
                                                            backgroundColor = "#27ae60";
                                                            color = "#fff";
                                                            boxShadow = "0 0 0 5px #d4f7e8";
                                                        }else if(nextStageStep){
                                                            backgroundColor = "#ffd230";
                                                            color = "#333";
                                                            boxShadow = "0 0 0 5px #fff4cc ";
                                                        } else if (selected) {
                                                            backgroundColor = "#1570ef";
                                                            color = "#fff";
                                                            boxShadow = "0 0 0 5px #dcebff ";
                                                        }

                                                        return {
                                                            backgroundColor,
                                                            color,
                                                            minWidth: 52,
                                                            height: 50,
                                                            borderRadius: '50%',
                                                            padding: '16px',
                                                            fontWeight: 600,
                                                            boxShadow,
                                                            transition: "all 0.3s ease-in-out",
                                                            transform: selected ? "translateY(-2px)" : "none",
                                                            "&:hover": {
                                                                backgroundColor: alreadySubmited
                                                                    ? "#219150"
                                                                    : nextStageStep
                                                                    ? "#e6c200"
                                                                    : selected
                                                                    ? "#2980b9"
                                                                    : "#dcdcdc",
                                                                boxShadow: alreadySubmited
                                                                    ? "0 8px 16px rgba(39, 174, 96, 0.5)"
                                                                    : nextStageStep
                                                                    ? "0 8px 16px rgba(255, 210, 48, 0.5)"
                                                                    : selected
                                                                    ? "0 8px 16px rgba(52, 152, 219, 0.5)"
                                                                    : "0 4px 10px rgba(0, 0, 0, 0.15)",
                                                                transform: "translateY(-3px)",
                                                            }
                                                        };
                                                    }}
                                                >
                                                    {step}
                                                </Button>
                                                <Box px={2}>        
                                                    <div className="investigationStepperTitle" style={{marginBottom: '4px'}}>
                                                        {StepperTitle}
                                                    </div>
                                                    <div className={`stepperCompletedPercentage ${statusClass}`}>
                                                        {statusLabel}
                                                    </div>
                                                </Box>

                                                {index < JSON.parse(caseAction?.approval_steps)?.length - 1 && (
                                                    <Box
                                                        sx={{
                                                            width: 60,
                                                        }}
                                                        className="divider"
                                                    />
                                                )}
                                            </React.Fragment>
                                        );
                                    })}
                            </Box>
                        }

                        <NormalViewForm 
                            table_row_id={tableRowId}
                            template_id={templateId}
                            template_name={templateName}
                            table_name={tableName}
                            readOnly={formReadFlag}
                            editData={formEditFlag}
                            editName={true}
                            initialData={initialRowData}
                            formConfig={templateFields}
                            stepperData={stepperConfig}
                            onSubmit={formSubmit}
                            onUpdate={formCaseUpdate}
                            onError={formError}
                            headerDetails={headerDetails || "Case Details"}
                            closeForm={backToForm}
                            overAllReadonly={overAllReadonlyCases}
                            noPadding={true}
                            editedForm={editedFormFlag}
                            showAssignIo={true}
                            investigationAction={caseAction}
                            reloadApproval={reloadApproval}
                            showCaseActionBtn={showCaseActionBtn}
                            reloadForm={reloadForm}
                        />
                    </Box>
                    :
                    <Box p={2}>

                        {
                            activeSidebar?.is_approval && activeSidebar?.approval_steps && JSON.parse(activeSidebar?.approval_steps)?.length > 0 && 
                            <Box sx={{ display: "flex", justifyContent: 'center', alignItems: 'center', mb: 2 }}>
                                {
                                    JSON.parse(activeSidebar?.approval_steps).map((step, index) => {

                                        var selected = false;

                                        var roleTitle = JSON.parse(localStorage.getItem("role_title")) || "";
                                        var designationName = localStorage.getItem("designation_name") || "";

                                        var stepperValue = ""

                                        if(roleTitle.toLowerCase() === "investigation officer"){
                                            stepperValue = "io";
                                        }else{
                                            var splitingValue = designationName.split(" ");
                                            if(splitingValue?.[0]){
                                                stepperValue = splitingValue[0].toLowerCase();
                                            }
                                        }

                                        var alreadySubmited = false;
                                        var nextStageStep = false;

                                        const lastApprovedRole = approvalFieldArray[0];
                                        const lastApprovedIndex = approvalStepperArray.indexOf(lastApprovedRole);

                                        const approvedStages = approvalStepperArray.slice(0, lastApprovedIndex + 1);

                                        const nextStepIndex = lastApprovedIndex + 1;
                                        const nextStep = approvalStepperArray[nextStepIndex];

                                        let statusLabel = "Not Assigned";
                                        let statusClass = "submissionNotAssigned";

                                        if (approvedStages.includes(step)) {
                                            alreadySubmited = true;
                                            statusLabel = "Submitted";
                                            statusClass = "submissionCompleted";
                                        } else if (step === nextStep) {
                                            nextStageStep = true;
                                            statusLabel = "Pending";
                                            statusClass = "submissionPending";
                                        }

                                        if(step.toLowerCase() === stepperValue){
                                            selected = true;
                                        }

                                        var StepperTitle = ""
                                        switch (step.toLowerCase()) {
                                            case "io":
                                                StepperTitle = "Investigation Officer";
                                                break;
                                            case "la":
                                                StepperTitle = "Legal Advisor";
                                                break;
                                            case "sp":
                                                StepperTitle = "Superintendent of Police";
                                                break;
                                            case "dig":
                                                StepperTitle = "Deputy Inspector General";
                                                break;
                                            default:
                                                StepperTitle = ""
                                                break;
                                        }

                                        return (
                                            <React.Fragment key={step}>
                                                <Button
                                                    variant="contained"
                                                    onClick={() => handleApprovalStepperClick(step)}
                                                    sx={() => {
                                                        var backgroundColor = "#f0f0f0";
                                                        var color = "#333";
                                                        var boxShadow = "0 2px 6px rgba(0, 0, 0, 0.1)";

                                                        if (alreadySubmited) {
                                                            backgroundColor = "#27ae60";
                                                            color = "#fff";
                                                            boxShadow = "0 0 0 5px #d4f7e8";
                                                        }else if(nextStageStep){
                                                            backgroundColor = "#ffd230";
                                                            color = "#333";
                                                            boxShadow = "0 0 0 5px #fff4cc ";
                                                        } else if (selected) {
                                                            backgroundColor = "#1570ef";
                                                            color = "#fff";
                                                            boxShadow = "0 0 0 5px #dcebff ";
                                                        }

                                                        return {
                                                            backgroundColor,
                                                            color,
                                                            minWidth: 52,
                                                            height: 50,
                                                            borderRadius: '50%',
                                                            padding: '16px',
                                                            fontWeight: 600,
                                                            boxShadow,
                                                            transition: "all 0.3s ease-in-out",
                                                            transform: selected ? "translateY(-2px)" : "none",
                                                            "&:hover": {
                                                                backgroundColor: alreadySubmited
                                                                    ? "#219150"
                                                                    : nextStageStep
                                                                    ? "#e6c200"
                                                                    : selected
                                                                    ? "#2980b9"
                                                                    : "#dcdcdc",
                                                                boxShadow: alreadySubmited
                                                                    ? "0 8px 16px rgba(39, 174, 96, 0.5)"
                                                                    : nextStageStep
                                                                    ? "0 8px 16px rgba(255, 210, 48, 0.5)"
                                                                    : selected
                                                                    ? "0 8px 16px rgba(52, 152, 219, 0.5)"
                                                                    : "0 4px 10px rgba(0, 0, 0, 0.15)",
                                                                transform: "translateY(-3px)",
                                                            }
                                                        };
                                                    }}
                                                >
                                                    {step}
                                                </Button>
                                                <Box px={2}>        
                                                    <div className="investigationStepperTitle" style={{marginBottom: '4px'}}>
                                                        {StepperTitle}
                                                    </div>
                                                    <div className={`stepperCompletedPercentage ${statusClass}`}>
                                                        {statusLabel}
                                                    </div>
                                                </Box>
                                                
                                                {index < JSON.parse(activeSidebar?.approval_steps)?.length - 1 && (
                                                    <Box
                                                        sx={{
                                                            width: 60,
                                                        }}
                                                        className="divider"
                                                    />
                                                )}
                                            </React.Fragment>
                                        );
                                    })}
                            </Box>
                        }

                        <Box pb={1} px={1} sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'start'}}>
                            <Typography
                                sx={{ fontSize: "19px", fontWeight: "500", color: "#171A1C", display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
                                className="Roboto"
                                onClick={backToForm}
                            >
                                <West />
                                <Typography sx={{ fontSize: '19px', fontWeight: '500', color: '#171A1C' }} className='Roboto'>
                                    {activeSidebar.name ? activeSidebar.name : 'Form'}
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
                                            width: '300px', borderRadius: '6px', outline: 'none',
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

                                {
                                    !approvalDone &&
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
                                }

                                {
                                    activeSidebar?.is_approval && enableSubmit &&
                                    <Button
                                        variant="contained"
                                        color="success"
                                        size="large"
                                        sx={{ height: "38px" }}
                                        onClick={approvalOverAllSubmit}
                                    >
                                        Submit
                                    </Button>
                                }

                                {
                                    userPermissions && userPermissions?.[0]?.['bulk_upload'] === true && !approvalDone &&
                                    <Button
                                        variant="contained"
                                        color="success"
                                        size="large"
                                        sx={{ height: "38px" }}
                                        onClick={showBulkUploadScreen}
                                    >
                                        Bulk Upload
                                    </Button>
                                }
                            </Box>
                        </Box>


                            <Box sx={{ display: "flex", alignItems: 'start', justifyContent: 'space-between'}} pl={1}>

                                <Box>
                                    {
                                        tableTabs.length > 0 &&                     
                                        <Box className="parentFilterTabs">
                                            {
                                                tableTabs.map((element)=>{
                                                    return (
                                                        <Box
                                                            onClick={() => {
                                                                setSelectedTableTabs(element.code);
                                                            }}
                                                            className={`filterTabs ${selectedTableTabs === element.code ? "Active" : ""}`}
                                                            sx={{padding: '0px 20px'}}
                                                        >
                                                            {element?.name}
                                                        </Box>
                                                    )
                                                })
                                            }
                                        </Box>
                                    }
                                </Box>

                                {
                                    selectedSplitScreenRows.length > 0 &&
                                    <Box>
                                        <Button
                                            variant="contained"
                                            className="blueButton"
                                            size="large"
                                            sx={{ height: "38px" }}
                                            onClick={()=>handleOverAllAccused( {label: 'Notices', table_name: 'cid_ui_case_41a_notices'} )}
                                        >
                                            Create Notices
                                        </Button>
                                    </Box>
                                }
                            </Box>

                        <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
                            
                            <Box sx={{ width: '100%' }}>
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
                    </Box>
                )}

            </Box>

            {formOpen && (
                <Box sx={{overflow: 'auto', height: '100vh', width: '100%'}}>
                    <NormalViewForm
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
                        noPadding={true}
                        selectedRow={rowData}
                        investigationViewTable={table_name}
                        editedForm={editedFormFlag}
                        disableEditButton={approvalDone}
                    />
                </Box>
            )}

            <ApprovalModal
                open={showApprovalModal}
                onClose={() => {
                    setShowApprovalModal(false);
                    setApprovalSource(null);
                }}
                onSave={approvalSource === 'submit' ? handleApprovalWithSave : handleApprovalWithUpdate}
                
                approvalItem={approvalItemsData}
                disabledApprovalItems={readonlyApprovalItems}
        
                designationData={approvalDesignationData}
                
                formData={approvalFormData}
                onChange={caseApprovalOnChange}
            />

            <ApprovalModal
                open={showCaseApprovalModal}
                onClose={() => {
                    setShowCaseApprovalModal(false);
                    setApprovalSource(null);
                }}
                onSave={handleCaseApprovalWithUpdate}
                
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

            {
                bulkUploadShow &&

                <Dialog
                    open={bulkUploadShow}
                    onClose={()=>setBulkUploadShow(false)}
                    maxWidth="sm"
                    fullWidth
                    PaperProps={{ sx: { borderRadius: 3, p: 2} }}
                >
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <DialogTitle sx={{ fontWeight: 600, fontSize: '20px', pb: 0  }}>Excel Upload</DialogTitle>
                        <IconButton onClick={()=>setBulkUploadShow(false)}>
                            <CloseIcon />
                        </IconButton>
                    </Box>

                    <DialogContent>
                        <Typography sx={{ mb: 2 }}>
                            Please check Excel header before upload. If needed,&nbsp;
                            <Link onClick={downloadExcelHeader} underline="hover" rel="noopener" sx={{cursor: 'pointer'}}>
                                Download here
                            </Link>
                        </Typography>

                        <Box
                            component="label"
                            htmlFor="excel-upload"
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexDirection: 'column',
                                border: '2px dashed #1976d2',
                                p: 5,
                                textAlign: 'center',
                                borderRadius: 2,
                                backgroundColor: '#f9f9f9',
                                cursor: 'pointer',
                                '&:hover': { backgroundColor: '#f0f0f0' },
                            }}
                        >
                            <UploadFileIcon sx={{ fontSize: 48, color: '#1976d2', mb: 1 }} />
                            <Typography variant="h6" fontWeight={500} sx={{ color: '#555' }}>
                                Click here to upload Excel file
                            </Typography>
                            <input
                                type="file"
                                accept=".xlsx, .xls"
                                id="excel-upload"
                                hidden
                                onChange={handleFileChange}
                            />
                        </Box>

                        {selectedFile && (
                            <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
                                <Typography mt={2} color="blue">
                                    Selected File: {selectedFile.name}
                                </Typography>
                                <Button
                                    variant="contained"
                                    color="success"
                                    sx={{ mt: 2, textTransform: 'uppercase', fontWeight: 500 }}
                                    startIcon={<UploadFileIcon />}
                                    onClick={checkUploadedFile}
                                >
                                    Upload
                                </Button>
                            </Box>
                        )}
                    </DialogContent>
                </Dialog>
            }

            {
                showSplitScreenForm &&
                <AccusedSplitScreen
                    tableObj={splitScreenActiveTab}
                    selectedAccused={selectedSplitScreenRows}
                    closeForm={closeSplitScreenForm}
                    ui_case_id={module === "pt_case" ? rowData?.ui_case_id :  rowData?.id}
                    pt_case_id={module === "pt_case" ? rowData?.id :  rowData?.pt_case_id}
                    module={module}
                    mainTableName={activeSidebar?.table}
                    directAddNew={directAddNewRef.current}
                />
            }


        </Stack>
    );
};

export default LokayuktaView;
