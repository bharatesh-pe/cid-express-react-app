import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { Box, Button, Chip, Grid,CircularProgress, IconButton, InputAdornment, Stack, Tooltip, Typography, Tabs, Tab, Checkbox } from "@mui/material";
import LokayuktaSidebar from "../components/lokayuktaSidebar";
import { West } from "@mui/icons-material";
import DeleteIcon from '@mui/icons-material/Delete';
import TextFieldInput from "@mui/material/TextField";
import { Menu, MenuItem } from '@mui/material';

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
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import SelectField from "../components/form/Select";
import MultiSelect from "../components/form/MultiSelect";
import AutocompleteField from "../components/form/AutoComplete";
import {
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  DialogContentText,
  Link,
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CloseIcon from '@mui/icons-material/Close';
import DateField from "../components/form/Date";
import DateTimeField from "../components/form/DateTime";
import TimeField from "../components/form/Time";
import AccusedSplitScreen from './accusedSplitScreen';
import CaseDairy from "./CaseDairy";


const LokayuktaView = () => {

    const navigate = useNavigate();
    const location = useLocation();
    const { state } = location;
    const { contentArray, actionKey, headerDetails, backNavigation, paginationCount, sysStatus, rowData, tableFields, stepperData, template_id, template_name, table_name, module, overAllReadonly, dashboardName, record_id, caseExtension, activeSidebarObj } = state || {};

    const fromCDR = location.state?.fromCDR || false;

    useEffect(()=>{
        if(!rowData){
            navigate("/dashboard");
        }
    },[]);

    
    const [filterDropdownObj, setfilterDropdownObj] = useState([]);
    const [othersFilterModal, setOthersFilterModal] = useState(false);
    const [othersFromDate, setOthersFromDate] = useState(null);
    const [othersToDate, setOthersToDate] = useState(null);
    const [othersFiltersDropdown, setOthersFiltersDropdown] = useState([]);
    const [othersFilterData, setOthersFilterData] = useState({});
    const [filterValues, setFilterValues] = useState(record_id ? {"record_id": JSON.parse(record_id)} : {});

    const [splitScreenArray, setSplitScreenArray] = useState([
        'cid_ui_case_accused',
        'cid_pt_case_witness',
    ]);

    const [currentTableName, setCurrentTableName] = useState(null);
    const [secondTableName, setSecondTableName] = useState(null);

    const [splitScreenNavTabs, setsplitScreenNavTabs] = useState([]);

    const [splitScreenActiveTab, setSplitScreenActiveTab] = useState(null);

    const [showSplitScreenForm, setShowSplitScreenForm] = useState(false);


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
    const [childTables, setChildTables] = useState([]);

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
            if(element.name.toLowerCase() === "assign to io" || element.name.toLowerCase() === "assign to eo"){

                setCaseFieldArray(initialRowData?.["field_approval_done_by"] ? [initialRowData?.["field_approval_done_by"]] : [] );

                var fieldArray = initialRowData?.["field_approval_done_by"] ? [initialRowData?.["field_approval_done_by"]] : [];
                var stepperArray = (element?.is_approval && element?.approval_steps) ? JSON.parse(element.approval_steps) : [];

                const userRole = userDesignationName.current.toUpperCase();

                const lastApprovedRole = fieldArray[0];
                const lastApprovedIndex = stepperArray.indexOf(lastApprovedRole);

                const approvedStages = stepperArray.slice(0, lastApprovedIndex + 1);

                setShowCaseActionBtn(approvedStages.includes(userRole));

                if(element.name.toLowerCase() === "assign to io" || element.name.toLowerCase() === "assign to eo")
                {
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
                // else if(element.name.toLowerCase() === "assign to eo")
                // {
                //     setFormEditFlag(true);
                //     setFormReadFlag(false);
                //     setOverAllReadonlyCases(false);
                // }

            }
        });

    },[initialRowData, tableViewFlag]);


    const backToForm = ()=>{
        if ( currentTableName === "cid_ui_case_old_cms_data" || secondTableName === "cid_pt_case_cnr") {
            if (activeSidebar) {
                sidebarActive(activeSidebar, true);
            }
        } else if(backNavigation){

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
        setCurrentTableName(null); 
        setSecondTableName(null);
    }

    const sidebarActive = async (item, ignored)=>{

        if(!item){
            return false;
        }

        if(editedForm.current && !ignored){
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
        setSelectedTableTabs('all');

        setTableSearchValue("");
        setTableFilterToDate(null);
        setTableFilterFromDate(null);
        setTableFilterOtherFilters({});
        setOthersFilterData({});
        setOthersFromDate(null);
        setOthersToDate(null);

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
            setCurrentTableName(null);
            setSecondTableName(null);
            return;
        }else{
            setTableViewFlag(true);
            setCurrentTableName(null);
            setSecondTableName(null);
            getTableData(item, false, true);
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
                    setChildTables(viewTemplateResponse?.["data"]?.["child_tables"] || []);
                    // Check if field_ui_case has a value - if it has value, make it readonly, else remove readonly
                    const hasFieldUiCaseValue = viewTemplateData.data?.field_ui_case && viewTemplateData.data.field_ui_case !== null && viewTemplateData.data.field_ui_case !== "";
                    
                    if (hasFieldUiCaseValue) {
                        setReadonlyForm(true);
                        setEditOnlyForm(false);
                    } else {
                        setReadonlyForm(true);   // Make form readonly by default
                        setEditOnlyForm(false);  // Will show "Edit" button instead of Save buttons
                    }
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

    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const handleMenuClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const defaultMenuItems = [
        { label: 'Notices', table_name: 'cid_ui_case_notices' },
        { label: 'Court matters', table_name: 'cid_pt_case_petition' },
        { label: 'Petition', table_name: 'cid_pt_case_petition' },
        { label: 'Trial Monitoring', table_name: 'cid_pt_case_trial_monitoring' },
        { label: 'Recording of Statement', table_name: 'cid_ui_case_recording_of_statements' },
    ];

    let parsedContentArray = [];

    try {
        if (typeof contentArray === "string") {
            parsedContentArray = JSON.parse(contentArray);
        } else if (Array.isArray(contentArray)) {
            parsedContentArray = contentArray;
        } else {
            parsedContentArray = Object.values(contentArray || {});
        }
    } catch (e) {
        console.error("Failed to parse contentArray:", e);
    }

    const contentTables = parsedContentArray
        .filter(item => typeof item.table === 'string')
        .map(item => item.table);

    const menuItems = defaultMenuItems.filter(item => {
        const activeName = (activeSidebar?.name || "").toLowerCase();
        if (activeName === "witness") {
            return item.label === "Notices" || item.label === "Recording of Statement";
        }
        if (module === "ui_case" && item.label === "Petition") return false;
        if (item.label === "Court Matters" && module === "pt_case" && activeSidebar?.name.toLowerCase() !== "accused") return false;
        return contentTables.includes(item.table_name);
    });



    useEffect(()=>{
        if(tableTabs.length > 0){
            getTableData(activeSidebar);
        }
    },[selectedTableTabs]);

      const mappingCases = async () => {
        let resolvedTableName = table_name;

        if (module === "pt_case" || module === "pt_trail_case") {
            resolvedTableName = "cid_under_investigation";
        } else if (module === "ui_case") {
            resolvedTableName = "cid_pending_trial";
        }

        if (!resolvedTableName) {
            console.warn("Missing resolvedTableName in mappingCases");
            toast.warning("Please Check Table Name");
            return;
        }


        let ui_case_id = "";
        let pt_case_id = "";
        let selectedId = "";

        if (module === "pt_case" || module === "pt_trail_case") {
            ui_case_id = rowData?.ui_case_id;
            selectedId = ui_case_id;
        } else if (module === "ui_case") {
            pt_case_id = rowData?.pt_case_id;
            selectedId = pt_case_id;
        }

        if (!selectedId || selectedId === null) {
            toast.warning("No data found.", {
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

        setSelectedRowId(selectedId);

        const viewTemplatePayload = {
            table_name: resolvedTableName,
            id: selectedId
        };

        setLoading(true);
        try {
            const viewTemplateData = await api.post("/templateData/viewTemplateData", viewTemplatePayload);
            setLoading(false);

            if (viewTemplateData?.success) {
                const viewTemplateResponse = await api.post("/templates/viewTemplate", { table_name: resolvedTableName });
                if (viewTemplateResponse?.success) {
                    setSelectedTemplateId(viewTemplateResponse.data.template_id);
                    setSelectedTemplateName(viewTemplateResponse.data.template_name);
                    setSelectedTableName(resolvedTableName);
                    setFormFields(viewTemplateResponse.data.fields || []);
                    setFormStepperData(viewTemplateResponse.data.sections || []);
                    setInitialFormData(viewTemplateData.data || {});
                    setReadonlyForm(true);
                    setEditOnlyForm(false);
                    setFormOpen(true);
                    setRowValueId(rowData);
                } else {
                    toast.error(viewTemplateResponse.message || "Failed to fetch template.", { position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    className: "toast-error", });
                }
            } else {
                toast.error(viewTemplateData.message || "Failed to fetch data.", { position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    className: "toast-error", });
            }
        } catch (error) {
            setLoading(false);
            toast.error(error?.response?.data?.message || "Please Try Again!", { position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    className: "toast-error", });
        }
    };


    const handleViewOldCase = () => {
        const oldCaseTable = {
            table: "cid_ui_case_old_cms_data",
            is_approval: false,
        };
        setCurrentTableName("cid_ui_case_old_cms_data"); 
        setSecondTableName("")
        setTableViewFlag(true);

        getTableData(oldCaseTable);
    };

    const handleViewCNR = () => {
        const oldCaseTable = {
            table: "cid_pt_case_cnr",
            is_approval: false,
        };
        setCurrentTableName(""); 
        setSecondTableName("cid_pt_case_cnr")
        setTableViewFlag(true);

        getTableData(oldCaseTable);
    };



    const getTableData = async (options, reOpen, noFilters) => {

        var ui_case_id = rowData?.id;
        var pt_case_id = rowData?.pt_case_id;

        if(module === "pt_case" || module === "pt_trail_case"){
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
            from_date: noFilters?.from_date ?? tableFilterFromDate,
            to_date: noFilters?.to_date ?? tableFilterToDate,
            filter: noFilters || tableFilterOtherFilters,
            module: module ? module : 'ui_case',
            tab: sysStatus,
            checkRandomColumn : "field_approval_done_by",
            checkTabs : true,
            tableTab : selectedTableTabs
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
                
                const renderCellFunc = (key, count) => (params) => tableCellRender(key, params, params.value, count, options.table || options);

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
                            width: index === 0 ? 150 : generateReadableHeader(key).length < 15 ? 100 : 200,
                            resizable: true,
                            renderHeader: (params) => (
                                tableHeaderRender(params, key)
                            ),
                            renderCell: renderCellFunc(key, index),
                        })),
                         ...(splitScreenArray.includes((options?.table || "").toLowerCase()) ? [
                            { label: "Notices", table_name: "cid_ui_case_notices", field: "notices", width: 100 },
                            { label: "Petition", table_name: "cid_pt_case_petition", field: "petition", width: 110 },
                            { label: "Court Matters", table_name: "cid_pt_case_petition", field: "court_matters", width: 160 },
                            { label: "Trial Monitoring", table_name: "cid_pt_case_trial_monitoring", field: "trial_monitoring", width: 180 },
                            { label: "Recording of Statement", table_name: "cid_ui_case_recording_of_statements", field: "recording_of_statement", width: 240 },
                        ]
                            .filter(item => {
                                const activeName = ((options && options.name) ? options.name : activeSidebar?.name || "").toLowerCase();
                                if (activeName === "witness") {
                                    return item.label === "Notices" || item.label === "Recording of Statement";
                                }
                                if (module === "ui_case" && item.label === "Petition") return false;
                                if (item.label === "Court Matters" && module === "pt_case" && activeSidebar?.name.toLowerCase() !== "accused") return false;
                                return contentTables.includes(item.table_name);
                            })
                            .map(item => ({
                                field: item.field,
                                headerName: item.label,
                                width: item.width,
                                resizable: false,
                                renderCell: (params) => (
                                    <Button
                                        variant="contained"
                                        size="small"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            const tbl = (options && options.table) ? options.table : (typeof options === 'string' ? options : undefined);
                                            handleOpenSplitScreen(params.row, { label: item.label, table_name: item.table_name }, tbl);
                                        }}
                                        className="newStyleButton"
                                    >
                                        {item.label}
                                    </Button>
                                )
                            })) : []),
                    ]

                    const formatDate = (value) => {
                        const parsed = Date.parse(value);
                        if (isNaN(parsed)) return value;
                        return new Date(parsed).toLocaleDateString("en-GB");
                    };

                    const formatTime = (value) => {
                        const parsed = Date.parse(value);
                        if (isNaN(parsed)) return value;
                        return new Date(parsed).toLocaleTimeString("en-GB", {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                            hour12: true, 
                        });
                    };

                    const formatDateTime = (value) => {
                        const parsed = Date.parse(value);
                        if (isNaN(parsed)) return value;
                        return new Date(parsed).toLocaleString("en-GB", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                            hour12: true,
                        });
                    };

                    const updatedTableData = getTemplateResponse.data.map((field, index) => {

                        const updatedField = {};

                        Object.keys(field).forEach((key) => {

                            const templateField = templateJson && templateJson.find((element)=> element.name === key);

                            if(templateField){

                                if (templateField?.type === "date") {
                                    updatedField[key] = formatDate(field[key]);
                                } else if (templateField?.type === "time") {
                                    updatedField[key] = formatTime(field[key]);
                                } else if (templateField?.type === "datetime") {
                                    updatedField[key] = formatDateTime(field[key]);
                                } else {
                                    updatedField[key] = field[key];
                                }

                            }else if (field[key] && key !== 'id' && isValidISODate(field[key])) {
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

            let activeSidebarArray = [];
            
            try {
                if (activeSidebarObj) {
                    activeSidebarArray = Array.isArray(activeSidebarObj) ? activeSidebarObj : [activeSidebarObj];
                }
            } catch (error) {
                activeSidebarArray = [];
            }

            if(activeSidebarArray?.[0]){
                sidebarActive(activeSidebarArray?.[0], true)
            }else{
                setActiveSidebar(sidebarContentArray?.[0] || null);
            }

        }
    }, []);

    const handleClear = () => {
        tablePaginationCount.current = 1;
        setTableSearchValue("");
        setTableFilterToDate(null);
        setTableFilterFromDate(null);
        setTableFilterOtherFilters({});
        setOthersFilterData({});
        setOthersFromDate(null);
        setOthersToDate(null);

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
                    transaction_id: `delete_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
                    ui_case_id : rowData?.id,
                    pt_case_id : rowData?.pt_case_id,
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
                            onOpen: () => {
                                  fetchCounts();
                                  getTableData(options)
                                }
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
        
        if (!currentTableName && !secondTableName  && (!activeSidebar?.table || activeSidebar?.table === "")) {
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
            table_name: currentTableName || secondTableName || activeSidebar?.table,
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
                
                // For add new form, set to allow save buttons (create mode)
                setReadonlyForm(false);
                setEditOnlyForm(false);
                
                setFormFields(viewTemplateResponse?.["data"]?.["fields"] || []);
                setInitialFormData({});
                setChildTables(viewTemplateResponse?.["data"]?.["child_tables"] || []);

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

        if ((!currentTableName || currentTableName === "") && (!secondTableName || secondTableName === "") && (!activeSidebar?.table || activeSidebar.table === "")) {
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
    const [tableCounts, setTableCounts] = useState({});

const ui_case_id = module === "pt_case" ? rowData?.ui_case_id : rowData?.id;
const pt_case_id = module === "pt_case" ? rowData?.id : rowData?.pt_case_id;

let normalizedSidebarItems = [];
try {
    if (typeof contentArray === "string") {
        normalizedSidebarItems = JSON.parse(contentArray);
    } else if (Array.isArray(contentArray)) {
        normalizedSidebarItems = contentArray;
    } else {
        normalizedSidebarItems = Object.values(contentArray || {});
    }
} catch (e) {
    console.error("Failed to parse contentArray:", e);
}

const fetchCounts = async () => {
    if (!ui_case_id && !pt_case_id) return;

    const tableNamesForCount = normalizedSidebarItems.map(item => item.table).filter(Boolean);

    try {
        const serverURL = process.env.REACT_APP_SERVER_URL;
        const response = await fetch(`${serverURL}/templateData/getTableCountsByCaseId`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ table_names: tableNamesForCount, ui_case_id, pt_case_id, module, sysStatus }),
        });

        const data = await response.json();
        if (data.success) {
            setTableCounts(data.data);
        } else {
            setTableCounts({});
        }
    } catch (err) {
        console.error("Error fetching table counts:", err);
        setTableCounts({});
    }
};


    function sanitizeKey(str) {
        return str
            .toLowerCase()
            .replace(/[^\w]/g, "_")
            .replace(/_+/g, "_")
            .replace(/^_+|_+$/g, "");
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

        let childTableDataMap = {};

        if (childTables && Array.isArray(childTables)) {
            childTables.forEach(child => {
                const childFieldName = child.field_name;

                if (data[childFieldName]) {
                    let parsed;
                    try {
                        parsed = typeof data[childFieldName] === "string"
                            ? JSON.parse(data[childFieldName])
                            : data[childFieldName];
                    } catch (err) {
                        parsed = [];
                    }

                    if (Array.isArray(parsed)) {
                        const normalizedRows = parsed.map(row => {
                            let newRow = {};
                            for (const key in row) {
                                const sanitizedKey = sanitizeKey(key);
                                newRow[sanitizedKey] = row[key];
                            }
                            return newRow;
                        });

                        childTableDataMap[child.child_table_name] = normalizedRows;
                    }
                }
            });
        }

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
        formData.append("table_name", activeSidebar.table || currentTableName || secondTableName);
        formData.append("data", JSON.stringify(normalData));
        formData.append("child_tables", JSON.stringify(childTableDataMap));
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
                        fetchCounts();
                        if (activeSidebar?.table === "cid_eq_case_enquiry_order_copy") {
                            navigate("/case/enquiry");
                        }else if (currentTableName === 'cid_ui_case_old_cms_data') {
                            getTableData({table:"cid_ui_case_old_cms_data"}, formOpen);
                        }else if (secondTableName === 'cid_pt_case_cnr'){
                            getTableData({table:"cid_pt_case_cnr"}, formOpen);
                        }else {
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
        console.log("formSubmit", data, formOpen);

        console.log("selectedTableName", selectedTableName)

    if ((!currentTableName || currentTableName === "") && (!secondTableName || secondTableName === "") && (!selectedTableName || selectedTableName === "") && (!activeSidebar?.table || activeSidebar.table === "")) {
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

        let childTableDataMap = {};

        if (childTables && Array.isArray(childTables)) {
            childTables.forEach(child => {
                const childFieldName = child.field_name;

                if (data[childFieldName]) {
                    let parsed;
                    try {
                        parsed = typeof data[childFieldName] === "string"
                            ? JSON.parse(data[childFieldName])
                            : data[childFieldName];
                    } catch (err) {
                        parsed = [];
                    }

                    if (Array.isArray(parsed)) {
                        const normalizedRows = parsed.map(row => {
                            let newRow = {};
                            for (const key in row) {
                                const sanitizedKey = sanitizeKey(key);
                                newRow[sanitizedKey] = row[key];
                            }
                            return newRow;
                        });

                        childTableDataMap[child.child_table_name] = normalizedRows;
                    }
                }
            });
        }

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

        const tableName = activeSidebar.table || currentTableName || secondTableName || selectedTableName;
 
        formData.append("table_name", tableName);
        formData.append("data", JSON.stringify(normalData));
        if (tableName === selectedTableName) {
            formData.append("id", selectedRowId);
        } else {
            formData.append("id", rowValueId?.id);
        }
        formData.append("transaction_id", `pt_${Date.now()}_${Math.floor(Math.random() * 10000)}`);
        formData.append("child_tables", JSON.stringify(childTableDataMap));
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
                        }else if (currentTableName === 'cid_ui_case_old_cms_data') {
                            getTableData({table:"cid_ui_case_old_cms_data"});
                        }else if (secondTableName === 'cid_pt_case_cnr') {
                            getTableData({table:"cid_pt_case_cnr"});
                        }else if(selectedTableName){
                            getTableData(selectedTableName)
                        }else {
                            getTableData(activeSidebar);
                        }
                    }
                });
                setRowValueId({});
            } else {
                toast.error(updateResponse.message || "Failed to update case.", {
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
                          if (
                            error &&
                            error.response &&
                            error.response.status === 400 &&
                            typeof error.response.data?.message === "string" &&
                            error.response.data.message.includes("Duplicate constraint: The combination of")
                          ) {
                            // Extract the field names from the error message
                            const match = error.response.data.message.match(/Duplicate constraint: The combination of (.+) is already present/);
                            let fields = "";
                            if (match && match[1]) {
                              fields = match[1]
                                .split(",")
                                .map(f =>
                                  f
                                    .replace(/field_/g, "")
                                    .replace(/\./g, "")
                                    .replace(/_/g, " ")
                                    .replace(/\s+/g, " ")
                                    .replace(/\b\w/g, c => c.toUpperCase())
                                    .trim()
                                )
                                .join(", ");
                            }
                            toast.error(
                              `Duplicate entry: The combination of ${fields} is already present.`,
                              {
                                position: "top-right",
                                autoClose: 3000,
                                hideProgressBar: false,
                                closeOnClick: true,
                                pauseOnHover: true,
                                draggable: true,
                                progress: undefined,
                                className: "toast-error",
                              }
                            );
                          } else {
                            toast.error(error?.response?.data?.message || "Please Try Again !", {
                                position: "top-right",
                                autoClose: 3000,
                                className: "toast-error",
                            });
                          }
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


    // start magazine view 

    const showMagazineView = (overAllAction, element) => {

        var actionArray = [];

        if(overAllAction){     
            actionArray = sidebarContentArray
                .filter(item => (item.table && !item?.field))
                .map(item => ({
                    table: item.table,
                    name: item.name
                }));
        }else{
            actionArray = sidebarContentArray
                .filter(item => item.table === (element?.table || activeSidebar.table))
                .map(item => ({
                    table: item.table,
                    name: item.name
                }));
        }


        if(actionArray.length === 0){
            toast.error('No Template Action Was Found !', {
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
        

        var overAllObj = {
            ...state,
            actionArray : actionArray,
            ui_case_id: module === "pt_case" ? rowData?.ui_case_id :  rowData?.id,
            pt_case_id: module === "pt_case" ? rowData?.id :  rowData?.pt_case_id,
            headerDetails,
            overAllAction,
        }
        
        navigate("/magazine-view", { state: overAllObj });

    };

    const setOtherFilterData = () => {
        setOthersFilterModal(false);
        const normalizedOthersFilterData = Object.fromEntries(
        Object.entries(othersFilterData).map(([key, value]) => [key, value != null ? String(value) : null])
        );

        getTableData(activeSidebar, false, { from_date: othersFromDate, to_date: othersToDate,...normalizedOthersFilterData});
    };

    const handleOthersFilter = async (activeSidebar)=>{

        if(!activeSidebar?.table){
            toast.error('Please Check The Template', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                className: "toast-error",
            });
            return false;
        }

        const viewTableData = { table_name: activeSidebar.table };
        
        setLoading(true);
        try {
            const viewTemplateResponse = await api.post("/templates/viewTemplate", viewTableData);
            setLoading(false);
        
            if (viewTemplateResponse && viewTemplateResponse.success && viewTemplateResponse.data) {
                var templateFields = viewTemplateResponse.data["fields"] ? viewTemplateResponse.data["fields"] : [];
                var validFilterFields = ["dropdown", "autocomplete", "multidropdown", "date", "datetime", "time",];
        
                var getOnlyDropdown = templateFields.filter((element) => validFilterFields.includes(element.type)).map((field) => {
                    const existingField = filterDropdownObj?.find(
                        (item) => item.name === field.name
                    );
                    return {
                        ...field,
                        history: false,
                        info: false,
                        required: false,
                        ...(field.is_dependent === "true" && {options: existingField?.options ? [...existingField.options] : [] }),
                    };
                });
        
                // const today = dayjs().format("YYYY-MM-DD");
        
                // getAllOptionsforFilter(getOnlyDropdown, true);
                getAllOptionsforFilter(getOnlyDropdown, true, rowData, activeSidebar.table, activeSidebar.table);

                // if(fromDateValue == null || toDateValue === null){
                //     setFromDateValue(today);
                //     setToDateValue(today);
                // }
        
                // setShowFilterModal(true);
                setOthersFilterModal(true);

            } else {
                const errorMessage = viewTemplateResponse.message ? viewTemplateResponse.message : "Failed to Get Template. Please try again.";
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
                toast.error( error.response["data"].message ? error.response["data"].message : "Please Try Again !",{
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

    const getAllOptionsforFilter = async (dropdownFields, others, selectedRow, table_name, investigationViewTable) => {
        try {

            setLoading(true);

            const apiCalls = dropdownFields
                .filter((field) => field.api && field.table)
                .map(async (field) => {
                    try {

                        let payload = {};
                        let headerName = "name";
                        let headerId = "id";
                        let res;

                        const isAccusedOrWitness =
                            (field.table === "cid_ui_case_accused" || field.table === "cid_pt_case_witness") &&
                            selectedRow &&
                            field?.particular_case_options;

                        if (isAccusedOrWitness) {
                            let payloadApi = "templateData/getAccusedWitness";

                            let ui_case_id = "";
                            let pt_case_id = "";

                            if (selectedRow?.pt_case_id && selectedRow?.ui_case_id) {
                                ui_case_id = selectedRow.ui_case_id || "";
                                pt_case_id = selectedRow.pt_case_id || "";
                            } else if (selectedRow?.pt_case_id) {
                                ui_case_id = selectedRow.id || "";
                                pt_case_id = selectedRow.pt_case_id || "";
                            } else if (selectedRow?.ui_case_id) {
                                ui_case_id = selectedRow.ui_case_id || "";
                                pt_case_id = selectedRow.id || "";
                            } else {
                                ui_case_id = selectedRow.id || "";
                            }


                            payload = {
                                table_name: field.table,
                                ui_case_id,
                                pt_case_id,
                            };


                            res = await api.post(payloadApi, payload);


                            if (!res.data) return { id: field.id, options: [] };

                            const updatedOptions = res.data.map((item) => ({
                                name: item?.name || "",
                                code: item?.id || "",
                            }));

                            return { id: field.id, options: updatedOptions };
                        }

                        if (field.api === "/templateData/getTemplateData") {
                            payload.table_name = field.table;

                            res = await api.post(field.api, payload);

                            if (!res.data) return { id: field.id, options: [] };

                            const updatedOptions = res.data.map((item) => {
                                const nameKey = Object.keys(item).find(
                                    (key) => !["id", "created_at", "updated_at"].includes(key)
                                );
                                return {
                                    name: nameKey ? item[nameKey] : "",
                                    code: item.id,
                                };
                            });

                            return { id: field.id, options: updatedOptions };
                        } else {
                            res = await api.post(field.api, payload);

                            if (!res.data) return { id: field.id, options: [] };

                            if (field.table === "users") {
                                headerName = "name";
                                headerId = "user_id";
                            } else {
                                headerName = field.table + "_name";
                                headerId = field.table + "_id";
                            }

                            const updatedOptions = res.data.map((item) => ({
                                name: item[headerName],
                                code: item[headerId],
                            }));

                            return { id: field.id, options: updatedOptions };
                        }
                    } catch (error) {
                        console.error(`Error in field [${field.id}]:`, error);
                        return { id: field.id, options: [] };
                    }
                });

            const results = await Promise.all(apiCalls);


            const updatedFieldsDropdown = dropdownFields.map((field) => {
                const updatedField = results.find((res) => res.id === field.id);
                return updatedField ? { ...field, options: updatedField.options } : field;
            });

            if (others) {
                setOthersFiltersDropdown(updatedFieldsDropdown);
            } else {
                setfilterDropdownObj(updatedFieldsDropdown);
            }

            setLoading(false);
        } catch (error) {
            setLoading(false);
            console.error(" Error in getAllOptionsforFilter:", error);
        }
    };


    const handleAutocomplete = (field, selectedValue, othersFilter) => {

        var updatedFormData = {}
        var selectedFilterDropdown = []

        if(othersFilter){

            selectedFilterDropdown = othersFiltersDropdown
            updatedFormData = { ...othersFilterData, [field.name]: selectedValue };
            
            setOthersFilterData(updatedFormData);
            
        }else{

            selectedFilterDropdown = filterDropdownObj
            updatedFormData = { ...filterValues, [field.name]: selectedValue };
        
            setFilterValues(updatedFormData);

        }

        if (field?.api && field?.table) {
            var dependent_field = selectedFilterDropdown.filter((element) => {
            return (
                element.dependent_table &&
                element.dependent_table.length > 0 &&
                element.dependent_table.includes(field.table)
            );
            });

            if (dependent_field && dependent_field[0] && dependent_field[0].api) {
            var apiPayload = {};
            if (dependent_field[0].dependent_table.length === 1) {
                const key = field.table === "users" ? "user_id" : `${field.table}_id`;
                apiPayload = {
                [key]: updatedFormData[field.name],
                };
            } else {
                var dependentFields = selectedFilterDropdown.filter((element) => {
                return dependent_field[0].dependent_table.includes(element.table);
                });

                apiPayload = dependentFields.reduce((payload, element) => {
                if (updatedFormData && updatedFormData[element.name]) {
                    const key =
                    element.table === "users" ? "user_id" : `${element.table}_id`;
                    payload[key] = updatedFormData[element.name];
                }
                return payload;
                }, {});
            }

            const callApi = async () => {
                setLoading(true);

                try {
                var getOptionsValue = await api.post(
                    dependent_field[0].api,
                    apiPayload
                );
                setLoading(false);

                var updatedOptions = [];

                if (getOptionsValue && getOptionsValue.data) {
                    updatedOptions = getOptionsValue.data.map((element, i) => {
                    return {
                        name: element[
                        dependent_field[0].table === "users"
                            ? "name"
                            : dependent_field[0].table + "_name"
                        ],
                        code: element[
                        dependent_field[0].table === "users"
                            ? "user_id"
                            : dependent_field[0].table + "_id"
                        ],
                    };
                    });
                }

                var userUpdateFields = {
                    options: updatedOptions,
                };


                dependent_field.forEach((data) => {
                    delete updatedFormData[data.name];
                });

                if(othersFilter){
                    setOthersFiltersDropdown(
                        selectedFilterDropdown.map((element) => element.id === dependent_field[0].id ? { ...element, ...userUpdateFields } : element)
                    );
                    dependent_field.map((data) => {
                        delete othersFilterData[data.name];
                    });

                    setOthersFilterData(updatedFormData);
                }else{
                    setfilterDropdownObj(
                        selectedFilterDropdown.map((element) => element.id === dependent_field[0].id ? { ...element, ...userUpdateFields } : element )
                    );
                    dependent_field.map((data) => {
                        delete filterValues[data.name];
                    });

                    setFilterValues(updatedFormData);
                }

                } catch (error) {
                setLoading(false);
                if (error && error.response && error.response.data) {
                    toast.error(
                    error.response?.data?.message || "Need dependent Fields",
                    {
                        position: "top-right",
                        autoClose: 3000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        className: "toast-error",
                    }
                    );
                    return;
                }
                }
            };
            callApi();
            }
        }
    };


    return (
        <Stack direction="row" justifyContent="space-between">

            <LokayuktaSidebar showMagazineView={showMagazineView} ui_case_id={module === "pt_case" ? rowData?.ui_case_id :  rowData?.id}  pt_case_id={module === "pt_case" ? rowData?.id :  rowData?.pt_case_id} contentArray={sidebarContentArray} onClick={sidebarActive} activeSidebar={activeSidebar} templateName={template_name} fromCDR={fromCDR} 
            tableCounts={tableCounts}
            setTableCounts={setTableCounts} 
            module={module} 
            sysStatus={sysStatus}
                />

            <Box flex={4} sx={{ overflow: "hidden" }}>

                {fromCDR ? (
                    <CDR
                        templateName={template_name}
                        headerDetails={headerDetails}
                        rowId={tableRowId}
                        options={state?.options}
                        selectedRowData={rowData}
                        backNavigation={backToForm}
                        showMagazineView={showMagazineView}

                    />
                ) : activeSidebar?.table === "cid_ui_case_action_plan" ? (

                    <ActionPlan
                        templateName={template_name}
                        headerDetails={headerDetails}
                        rowId={tableRowId}
                        options={activeSidebar}
                        selectedRowData={rowData}
                        backNavigation={backToForm}
                        showMagazineView={showMagazineView}
                        fetchCounts={fetchCounts}
                        module={module}
                    />
                ) : activeSidebar?.caseDairy === true ? (

                    <CaseDairy
                        actionArray={sidebarContentArray}
                        showMagazineView={showMagazineView}
                        headerDetails={headerDetails}
                        backToForm={backToForm}
                        options={activeSidebar}
                        selectedRowData={rowData}
                        rowData={rowData}
                        record_id={record_id}
                        module={module}
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
                            showMagazineView={showMagazineView}

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
                        showMagazineView={showMagazineView}
                        fetchCounts={fetchCounts}
                        module={module}
                    />
                ) : activeSidebar?.table === "cid_ui_case_property_form" ? (


                     <PropertyForm
                        templateName={template_name}
                        headerDetails={headerDetails}
                        rowId={tableRowId}
                        options={activeSidebar}
                        selectedRowData={rowData}
                        backNavigation={backToForm}
                        showMagazineView={showMagazineView}
                        fetchCounts={fetchCounts}
                        module={module}
                    />
                ) : activeSidebar?.table === "cid_ui_case_mahazars" ? (


                     <Mahazars
                        templateName={template_name}
                        headerDetails={headerDetails}
                        rowId={tableRowId}
                        options={activeSidebar}
                        selectedRowData={rowData}
                        backNavigation={backToForm}
                        showMagazineView={showMagazineView}
                        fetchCounts={fetchCounts}
                        module={module}
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
                        showMagazineView={showMagazineView}
                        fetchCounts={fetchCounts}
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
                        showMagazineView={showMagazineView}

                    />
                    
                ) : activeSidebar?.table === "cid_eq_case_plan_of_action" ? (


                    <PlanOfAction
                        templateName={template_name}
                        headerDetails={headerDetails}
                        rowId={tableRowId}
                        options={activeSidebar}
                        selectedRowData={rowData}
                        backNavigation={backToForm}
                        showMagazineView={showMagazineView}

                    />
                ) : activeSidebar?.table === "cid_eq_case_progress_report" ? (


                    <EqProgressReport
                        templateName={template_name}
                        headerDetails={headerDetails}
                        rowId={tableRowId}
                        options={activeSidebar}
                        selectedRowData={rowData}
                        backNavigation={backToForm}
                        showMagazineView={showMagazineView}

                    />
                ) : activeSidebar?.table === "cid_eq_case_closure_report" ? (

                    <ClosureReport
                        templateName={template_name}
                        headerDetails={headerDetails}
                        rowId={tableRowId}
                        options={activeSidebar}
                        selectedRowData={rowData}
                        backNavigation={backToForm}
                        showMagazineView={showMagazineView}

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

                                        let statusLabel = "Not Approved";
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
                            oldCase = {true}
                            CNR = {true}
                            onViewCNR ={handleViewCNR}
                            onViewOldCase={handleViewOldCase} 
                            mappingCase = {true}
                            onMappingCase = {mappingCases}
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
                            showMagazineView={showMagazineView}
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

                                        let statusLabel = "Not Approved";
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
                                    {currentTableName === "cid_ui_case_old_cms_data"
                                        ? "Old CMS Data"
                                        : secondTableName === "cid_pt_case_cnr"
                                        ? "CNR"
                                        : (activeSidebar?.name || "Form")}

                                </Typography>
                                {headerDetails && (
                                    <Tooltip title={headerDetails}>
                                    <Chip
                                        label={
                                        <Typography
                                            sx={{
                                            fontSize: '13px',
                                            maxWidth: 230,
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            fontWeight: 500, marginTop: '2px'
                                            }}
                                        >
                                            {headerDetails}
                                        </Typography>
                                        }
                                        color="primary"
                                        variant="outlined"
                                        size="small"
                                        sx={{ fontWeight: 500, marginTop: '2px' }}
                                    />
                                    </Tooltip>
                                )}
                            </Typography>

                            <Box sx={{display: 'flex', alignItems: 'start', gap: '12px'}}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'end' }}>
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
                                                        onClick={() => handleOthersFilter(activeSidebar)}
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
                                        placeholder="Search"
                                        variant="outlined"
                                        className="profileSearchClass"
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault();
                                                searchTableData();
                                            }
                                        }}
                                        sx={{
                                            width: '250px', borderRadius: '6px', outline: 'none',
                                            '& .MuiInputBase-input::placeholder': {
                                                color: '#475467',
                                                opacity: '1',
                                                fontSize: '14px',
                                                fontWeight: '400',
                                                fontFamily: 'Roboto'
                                            },
                                        }}
                                    />
                                {(
                                    tableSearchValue ||
                                    tableFilterToDate ||
                                    tableFilterFromDate ||
                                    Object.keys(tableFilterOtherFilters).length > 0 ||
                                    Object.keys(othersFilterData || {}).length > 0
                                ) && (
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
                                            View all/ Clear Filter
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

                                {/* <Button
                                    onClick={()=>showMagazineView(false)}
                                    sx={{height: "38px", textTransform: 'none'}}
                                    className="whiteBorderedBtn"
                                >
                                    Case Docket
                                </Button> */}

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

                                {selectedSplitScreenRows.length > 0 && (
                                <>
                                <Button
                                    variant="contained"
                                    className="blueButton"
                                    size="large"
                                    sx={{ height: '38px' }}
                                    onClick={handleMenuClick}
                                >
                                    Create
                                </Button>
                                <Menu
                                    anchorEl={anchorEl}
                                    open={open}
                                    onClose={handleMenuClose}
                                >
                                    {menuItems.map((item) => (
                                    <MenuItem
                                        key={item.table_name}
                                        onClick={() => {
                                        handleOverAllAccused(item);
                                        handleMenuClose();
                                        }}
                                    >
                                        {`${item.label}`}
                                    </MenuItem>
                                    ))}
                                </Menu>
                                </>
                                )}                            
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
                                <Box
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'space-between', 
                                        gap: 2,
                                        mt: 2,
                                        flexWrap: 'wrap',
                                    }}
                                >
                                    <Typography
                                        sx={{
                                            color: 'blue',
                                            wordBreak: 'break-word',
                                            fontSize: '14px',
                                            flexGrow: 1,
                                            minWidth: 0,
                                            maxWidth: '70%',
                                        }}
                                    >
                                        Selected File: {selectedFile.name}
                                    </Typography>

                                    <Button
                                        variant="contained"
                                        color="success"
                                        sx={{
                                            textTransform: 'uppercase',
                                            fontWeight: 500,
                                            whiteSpace: 'nowrap',
                                        }}
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
                    fetchCounts={fetchCounts}
                />
            }


        {othersFilterModal && (
            <Dialog
                open={othersFilterModal}
                onClose={() => setOthersFilterModal(false)}
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
                        onClick={() => setOthersFilterModal(false)}
                        sx={{ color: (theme) => theme.palette.grey[500] }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

            <DialogContent sx={{ minWidth: "400px" }}>
                <DialogContentText id="alert-dialog-description">
                    <Grid container sx={{ alignItems: "center" }}>
                        <Grid item xs={12} md={6} p={2}>
                             <h4 className="form-field-heading">From Date</h4>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                    format="DD-MM-YYYY"
                                    sx={{
                                        width: "100%",
                                    }}
                                    label="From Date"
                                    value={othersFromDate ? dayjs(othersFromDate) : null}
                                    onChange={(e) =>
                                        setOthersFromDate(e ? e.format("YYYY-MM-DD") : null)
                                    }
                                />
                            </LocalizationProvider>
                        </Grid>

                        <Grid item xs={12} md={6} p={2}>
                             <h4 className="form-field-heading">To Date</h4>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                    format="DD-MM-YYYY"
                                    sx={{
                                        width: "100%",
                                    }}
                                    label="To Date"
                                    value={othersToDate ? dayjs(othersToDate) : null}
                                    onChange={(e) =>
                                        setOthersToDate(e ? e.format("YYYY-MM-DD") : null)
                                    }
                                />
                            </LocalizationProvider>
                        </Grid>

                        {othersFiltersDropdown.map((field) => {
                            if (field?.hide_from_ux) {
                                return null;
                            }

                            if (!field?.table_display_content) {
                                return null;
                            }
                            switch (field.type) {
                                case "dropdown":
                                return (
                                    <Grid item xs={12} md={6} p={2}>
                                    <div className="form-field-wrapper_selectedField">
                                        <SelectField
                                        key={field.id}
                                        field={field}
                                        formData={othersFilterData}
                                        onChange={(value) =>
                                            handleAutocomplete(field, value.target.value, true)
                                        }
                                        hideLinkModule={true}   
                                        />
                                    </div>
                                    </Grid>
                                );

                                case "multidropdown":
                                return (
                                    <Grid item xs={12} md={6} p={2}>
                                    <MultiSelect
                                        key={field.id}
                                        field={field}
                                        formData={othersFilterData}
                                        onChange={(name, selectedCode) =>
                                            handleAutocomplete(field, selectedCode, true)
                                        }
                                        hideLinkModule={true}   
                                    />
                                    </Grid>
                                );

                                case "autocomplete":
                                return (
                                    <Grid item xs={12} md={6} p={2}>
                                    <AutocompleteField
                                        key={field.id}
                                        field={field}
                                        formData={othersFilterData}
                                        onChange={(name, selectedCode) =>
                                            handleAutocomplete(field, selectedCode, true)
                                        }
                                        hideLinkModule={true}   
                                    />
                                    </Grid>
                                );
                                case "date":
                                return (
                                    <Grid item xs={12} md={6} p={2} key={field.id}>
                                        <div className="form-field-wrapper_selectedField">
                                            <DateField
                                                key={field.id}
                                                field={field}
                                                formData={othersFilterData}
                                                    onChange={(date) => {
                                                    const formattedDate = date ? dayjs(date).format("YYYY-MM-DD") : null;
                                                    setOthersFilterData((prev) => ({
                                                    ...prev,
                                                    [field.name]: formattedDate,
                                                    }));
                                                }}
                                            />
                                        </div>
                                    </Grid>
                                );

                                case "datetime":
                                    return (
                                        <Grid item xs={12} md={6} p={2} key={field.id}>
                                            <div className="form-field-wrapper_selectedField">
                                                <DateTimeField
                                                    key={field.id}
                                                    field={field}
                                                    formData={othersFilterData}
                                                    onChange={(date) => {
                                                        const formattedDateTime = date
                                                            ? dayjs(date).format("YYYY-MM-DD HH:mm:ss")
                                                            : null;
                                                        setOthersFilterData((prev) => ({
                                                            ...prev,
                                                            [field.name]: formattedDateTime,
                                                        }));
                                                    }}
                                                />
                                            </div>
                                        </Grid>
                                    );
                                                       
                                // case "time":
                                //     return (
                                //         <Grid item xs={12} md={6} p={2} key={field.id}>
                                //             <div className="form-field-wrapper_selectedField">
                                //                 <TimeField
                                //                     key={field.id}
                                //                     field={field}
                                //                     formData={othersFilterData}
                                //                     onChange={(time) => {
                                //                         const formattedTime = time
                                //                             ? dayjs(time).format("HH:mm:ss")
                                //                             : null;
                                //                         setOthersFilterData((prev) => ({
                                //                             ...prev,
                                //                             [field.name]: formattedTime,
                                //                         }));
                                //                     }}
                                //                 />
                                //             </div>
                                //         </Grid>
                                //     );
                        }
                        })}
                    </Grid>
                </DialogContentText>
            </DialogContent>
            <DialogActions sx={{ padding: "12px 24px" }}>
                <Button onClick={() => setOthersFilterModal(false)}>Close</Button>
                <Button
                    className="fillPrimaryBtn"
                    sx={{ minWidth: "100px" }}
                    onClick={() => setOtherFilterData()}
                >
                    Apply
                </Button>
            </DialogActions>
            </Dialog>
        )}


        </Stack>
    );
};

export default LokayuktaView;
