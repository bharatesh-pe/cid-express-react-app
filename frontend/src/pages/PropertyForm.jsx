import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import NormalViewForm from "../components/dynamic-form/NormalViewForm";
import TableView from "../components/table-view/TableView";
import api from "../services/api";
import { Chip, Tooltip } from "@mui/material";
import { CircularProgress } from "@mui/material";
import {
    Box,
    Button,
    FormControl,
    InputAdornment,
    Typography,
    Checkbox,
    IconButton,
} from "@mui/material";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from "@mui/material";
import Link from "@mui/material/Link";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from '@mui/icons-material/Delete';
import TextFieldInput from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import SearchIcon from "@mui/icons-material/Search";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import FilterListIcon from "@mui/icons-material/FilterList";
import WestIcon from '@mui/icons-material/West';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import ImportExportIcon from '@mui/icons-material/ImportExport';
import dayjs from "dayjs";
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CloseIcon from '@mui/icons-material/Close';

const PropertyForm = ({ templateName, headerDetails, rowId, options, selectedRowData, backNavigation, showMagazineView,fetchCounts,module }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { pageCount, systemStatus } = location.state || {};

    const [exportableData, setExportableData] = useState([]);
    const [showExportPopup, setShowExportPopup] = useState(false);
    const [tabIndex, setTabIndex] = useState(0);
    const [aoFields, setAoFields] = useState([]);
    const [aoFieldId, setAoFieldId] = useState(selectedRowData);
    const [filterAoValues, setFilterAoValues] = useState({});
    const [viewModeOnly, setViewModeOnly] = useState(false);
    const [isFromEdit, setIsFromEdit] = useState(false);
    const [selectedApprovalEdit, setSelectedApprovalEdit] = useState(null);
    var userPermissions = JSON.parse(localStorage.getItem("user_permissions")) || [];
    const templateActionAddFlag = useRef(false);
    const attachmentEditFlag = useRef(false);
    const [totalPage, setTotalPage] = useState(0);
    const [totalRecord, setTotalRecord] = useState(0);
    const [filterDropdownObj, setfilterDropdownObj] = useState([]);
    const [filterValues, setFilterValues] = useState({});
    const [fromDateValue, setFromDateValue] = useState(null);
    const [toDateValue, setToDateValue] = useState(null);
    const [showSubmitAPButton, setShowSubmitAPButton] = useState(false);
    const [isImmediateSupervisior, setIsImmediateSupervisior] = useState(false);
    const [otherTemplatesTotalPage, setOtherTemplatesTotalPage] = useState(0);
    const [otherTemplatesTotalRecord, setOtherTemplatesTotalRecord] = useState(0);
    const [APIsSubmited, setAPIsSubmited] = useState(false);
    const [otherTemplatesPaginationCount, setOtherTemplatesPaginationCount] = useState(1);
    const [otherSearchValue, setOtherSearchValue] = useState('');
    const [othersFilterModal, setOthersFilterModal] = useState(false);
    const [othersFromDate, setOthersFromDate] = useState(null);
    const [othersToDate, setOthersToDate] = useState(null);
    const [othersFiltersDropdown, setOthersFiltersDropdown] = useState([]);
    const [othersFilterData, setOthersFilterData] = useState({});
    const [childTables, setChildTables] = useState([]);
    const handleOtherPagination = (page) => {
        setOtherTemplatesPaginationCount(page)
    }
    const [disableEditButtonFlag, setDisableEditButtonFlag] = useState(false);
    const [showSubmitPFButton, setShowSubmitPFButton] = useState(false);
    const [paginationCount, setPaginationCount] = useState(pageCount ? pageCount : 1);
    const [tableSortOption, settableSortOption] = useState("DESC");
    const [tableSortKey, setTableSortKey] = useState("");
    const [tableData, setTableData] = useState([]);
    const [isValid, setIsValid] = useState(false);
    const [searchValue, setSearchValue] = useState(null);
    const [table_name, setTable_name] = useState("");
    const [sysStatus, setSysSattus] = useState(systemStatus ? systemStatus : "ui_case");
    const [formOpen, setFormOpen] = useState(false);
    const [formTemplateData, setFormTemplateData] = useState([]);
    const [initialData, setInitialData] = useState({});
    const [viewReadonly, setviewReadonly] = useState(false);
    const [editTemplateData, setEditTemplateData] = useState(false);
    const [selectedRowIds, setSelectedRowIds] = useState([]);
    const [otherFormOpen, setOtherFormOpen] = useState(false);
    const [optionStepperData, setOptionStepperData] = useState([]);
    const [optionFormTemplateData, setOptionFormTemplateData] = useState([]);
    const [starFlag, setStarFlag] = useState(null);
    const [readFlag, setReadFlag] = useState(null);
    const [loading, setLoading] = useState(false); // State for loading indicator
    const [viewTemplateTableColumns, setviewTemplateTableData] = useState([
        { field: "sl_no", headerName: "S.No" },
    ]);
    const [otherTemplateModalOpen, setOtherTemplateModalOpen] = useState(false);
    const [selectedOtherTemplate, setselectedOtherTemplate] = useState(options);
    const [otherTemplateData, setOtherTemplateData] = useState([]);
    const [otherInitialTemplateData, setOtherInitialTemplateData] = useState([]);
    const [otherReadOnlyTemplateData, setOtherReadOnlyTemplateData] = useState(false);
    const [otherEditTemplateData, setOtherEditTemplateData] = useState(false);
    const [otherRowId, setOtherRowId] = useState(null);
    const [otherTemplateId, setOtherTemplateId] = useState(null);
    const [otherTemplateColumn, setOtherTemplateColumn] = useState([
        { field: "sl_no", headerName: "S.No" },
    ]);
    const [hoverTableOptions, setHoverTableOptions] = useState([]);
    const [otherTablePagination, setOtherTablePagination] = useState(1);
    const [selectedRow, setSelectedRow] = useState(selectedRowData);
    const [selectedOtherFields, setSelectedOtherFields] = useState(null);
    const [selectKey, setSelectKey] = useState(null);
    const [randomApprovalId, setRandomApprovalId] = useState(0);
    const hoverTableOptionsRef = useRef([]);


    useEffect(() => {
        handleOtherTemplateActions(selectedOtherTemplate, selectedRowData)
    }, [otherTemplatesPaginationCount]);

    const onSaveTemplateError = (error) => {
        setIsValid(false);
    };

    const exportToExcel = (data, fileName) => {
        if (!data || data.length === 0) return;

        const excludedFields = [
            "id",
            "created_at",
            "updated_at",
            "created_by",
            "sys_status",
            "ReadStatus",
        ];

        const formattedData = data.map((item, index) => {
            const newItem = { "S.no": index + 1 };

            Object.entries(item).forEach(([key, val]) => {
                if (!excludedFields.includes(key)) {
                    let cleanKey = key.startsWith("field_") ? key.slice(6) : key;

                    cleanKey = cleanKey
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (char) => char.toUpperCase());

                    const isDateField =
                        key.toLowerCase().includes("_date") ||
                        key.toLowerCase().endsWith("date");

                    let formattedVal = val;

                    if (
                        isDateField &&
                        typeof val === "string" &&
                        !isNaN(Date.parse(val))
                    ) {
                        formattedVal = dayjs(val).format("DD-MM-YYYY");
                    }

                    newItem[cleanKey] = formattedVal;
                }
            });

            return newItem;
        });

        const worksheet = XLSX.utils.json_to_sheet(formattedData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

        const excelBuffer = XLSX.write(workbook, {
            bookType: "xlsx",
            type: "array",
        });

        const blob = new Blob([excelBuffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        saveAs(blob, `${fileName}.xlsx`);
        setShowExportPopup(false);
    };
    const handleOpenExportPopup = async () => {
        if (!selectedRowData || !selectedOtherTemplate) return;

        const payload = {
            table_name: selectedOtherTemplate.table,
            ui_case_id: selectedRowData.id,
            pt_case_id: selectedRowData?.pt_case_id || null,
            case_io_id: selectedRowData.field_io_name_id || "",
        };

        try {
            const res = await api.post('/templateData/getActionTemplateData', payload);
            setExportableData(res.data || []);
            setShowExportPopup(true);
        } catch (err) {
            console.error('Failed to fetch export data:', err);
            toast.error(
                err || "Please Try Again!",
                {
                    position: "top-right",
                    autoClose: 3000,
                    className: "toast-error",
                }
            );
        }
    };


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
            
            if(!options.table){
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
                "table_name": options.table,
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
                    a.download = `${options.table}_Report.xlsx`;
    
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
    
            if(!options?.table){
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
    
                var ui_case_id = selectedRowData?.id;
                var pt_case_id = selectedRowData?.pt_case_id;
    
                if(module === "pt_case"){
                    ui_case_id = selectedRowData?.ui_case_id
                    pt_case_id = selectedRowData?.id
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
                    "table_name" : options?.table,
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
                            onOpen: () => { handleOtherTemplateActions(options, selectedRow) }
                        });
    
                        if(fetchCounts){
                            fetchCounts();
                        }
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
    
    
    

    const handleOtherTemplateActions = async (options, selectedRow, searchFlag) => {

        const randomId = `random_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        var disabledEditFlag = false;
        var disabledDeleteFlag = false;
        setRandomApprovalId(randomId);

        var ui_case_id = selectedRow?.id;
        var pt_case_id = selectedRow?.pt_case_id;

        if(module === "pt_case" || module === "pt_trail_case"){
            ui_case_id = selectedRow?.ui_case_id
            pt_case_id = selectedRow?.id
        }
        console.log("checking selectedRow", selectedRow);
        var getTemplatePayload = {
            table_name: options.table,
            ui_case_id: ui_case_id,
            case_io_id: selectedRow?.field_io_name || "",
            pt_case_id: pt_case_id ,
            limit: 10,
            module: module || "ui_case",
            page: !searchFlag ? otherTemplatesPaginationCount : 1,
            search: !searchFlag ? otherSearchValue : "",
            from_date: !searchFlag ? othersFromDate : null,
            to_date: !searchFlag ? othersToDate : null,
            filter: !searchFlag ? othersFilterData : {},
        };

        if (options.permissions) {
            const parsedPermissions = JSON.parse(options.permissions);

            if (parsedPermissions && typeof parsedPermissions === 'object' && !Array.isArray(parsedPermissions)) {

                if (parsedPermissions?.['add'].length > 0) {
                    const hasAddPermission = parsedPermissions?.['add'].some(
                        (permission) => userPermissions?.[0]?.[permission] === true
                    );

                    templateActionAddFlag.current = hasAddPermission;
                } else {
                    templateActionAddFlag.current = true;
                }

                if (parsedPermissions?.['edit'].length > 0) {
                    const hasEditPermission = parsedPermissions?.['edit'].some(
                        (permission) => userPermissions?.[0]?.[permission] === true
                    );

                    disabledEditFlag = hasEditPermission
                } else {
                    disabledEditFlag = true;
                }

                if (parsedPermissions?.['delete'].length > 0) {
                    const hasDeletePermission = parsedPermissions?.['delete'].some(
                        (permission) => userPermissions?.[0]?.[permission] === true
                    );

                    disabledDeleteFlag = hasDeletePermission
                } else {
                    disabledDeleteFlag = true;
                }

            } else {
                templateActionAddFlag.current = true;
                disabledEditFlag = true;
                disabledDeleteFlag = true;
            }

        }

        setLoading(true);

        try {
            const getTemplateResponse = await api.post("/templateData/getTemplateData", getTemplatePayload);

            setLoading(false);

            if (getTemplateResponse && getTemplateResponse.success) {

                const { meta } = getTemplateResponse;
                const totalPages = meta?.meta?.totalPages;
                const totalItems = meta?.meta?.totalItems;

                if (totalPages !== null && totalPages !== undefined) {
                    setOtherTemplatesTotalPage(totalPages);
                }

                if (totalItems !== null && totalItems !== undefined) {
                    setOtherTemplatesTotalRecord(totalItems);
                }

                if (getTemplateResponse.data && getTemplateResponse.data) {

                    const records = getTemplateResponse.data;
                    let APisSubmited = false;
                    let anySubmitAP = true;
                    let isSuperivisor = false;
                    const userDesigId = localStorage.getItem('designation_id');

                    if (records && records.length > 0) {

                        // Get supervisor-specific records
                        const supervisorRecords = records.filter(
                            record => record.supervisior_designation_id == userDesigId
                        );


                        let allAPWithOutSupervisorSubmit = false;


                        // Check if all supervisor records are NOT submitted
                        // allAPWithOutSupervisorSubmit = supervisorRecords.length > 0 && supervisorRecords.every(
                        //     r => r.field_submit_status === "" || r.field_submit_status === null
                        // );



                        for (let i = 0; i < supervisorRecords.length; i++) {
                            const status = supervisorRecords[i]['field_submit_status'];
                            console.log("checking the loop", i);
                            console.log("supervisorRecords[i]", supervisorRecords[i]);
                            console.log("field_submit_status", status);
                            console.log("condition check", status === "" || status === null);

                            if (status === "" || status === null) {
                                allAPWithOutSupervisorSubmit = true;
                                console.log("Set allAPWithOutSupervisorSubmit to true");
                                break;
                            }
                        }

                        // Get non-supervisor records with sys_status "ui_case"
                        const ioRecords = records.filter(
                            record =>
                                record.sys_status === "ui_case" &&
                                record.supervisior_designation_id != userDesigId
                        );

                        // Check if all IO records are NOT submitted
                        const allAPWithOutIOSubmit = ioRecords.length > 0 &&
                            ioRecords.every(
                                record => record.field_submit_status === "" || record.field_submit_status === null
                            );

                        // Set flags accordingly
                        if (allAPWithOutSupervisorSubmit || allAPWithOutIOSubmit) {
                            anySubmitAP = false;
                        }

                        if (allAPWithOutSupervisorSubmit) {
                            isSuperivisor = true;
                        }

                        // APisSubmited logic with clear grouping
                        APisSubmited = records.every(record =>
                            record.sys_status === "ui_case" ||
                            (
                                record.sys_status === "IO" &&
                                (record.field_submit_status === "" || record.field_submit_status === null) &&
                                record.supervisior_designation_id != userDesigId
                            )
                        );

                    } else {
                        anySubmitAP = false;
                    }


                    console.log('anySubmitAP', anySubmitAP);

                    console.log('isSuperivisor', isSuperivisor)
                    setShowSubmitAPButton(anySubmitAP);
                    setIsImmediateSupervisior(isSuperivisor);
                    setAPIsSubmited(APisSubmited);

                    let anySubmitPF = false;
                    if (options.table === "cid_ui_case_property_form") {
                        anySubmitPF = records.every(record => record.sys_status === "submit");
                    }

                    setShowSubmitPFButton(anySubmitPF);

                    if (getTemplateResponse.data[0]) {
                        var excludedKeys = [
                            "updated_at",
                            "id",
                            "deleted_at",
                            "attachments",
                            "Starred",
                            "ReadStatus",
                            "linked_profile_info",
                            "sys_status",
                            "field_status",
                            "field_submit_status",
                            "supervisior_designation_id"
                        ];


                        const userPermissions = JSON.parse(localStorage.getItem("user_permissions")) || [];
                        const canDelete = userPermissions[0]?.action_delete;
                        const canEdit = userPermissions[0]?.action_edit;
                        const isViewAction = options.is_view_action === true;

                        const updatedHeader = [
                            {
                                field: "sl_no",
                                headerName: "S.No",
                                resizable: false,
                                width: 75,
                                renderCell: (params) => {
                                    const isPdfUpdated = params.row.field_pr_status === "Yes";
                                    const isPropertyForm = options.table === "cid_ui_case_property_form" && params.row.sys_status === 'submit';

                                    return (
                                        <Box sx={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                            {params.value}
                                            {canDelete && !isPropertyForm && !isViewAction && !isPdfUpdated && (
                                                <DeleteIcon
                                                    sx={{ cursor: "pointer", color: "red", fontSize: 20 }}
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        handleOthersDeleteTemplateData(params.row, options.table,selectedRow.id);
                                                    }}
                                                />
                                            )}
                                        </Box>
                                    );
                                }
                            },
                            ...(Object.keys(getTemplateResponse.data[0] || {}).includes("field_pf_number") ? [{
                                field: "field_pf_number",
                                headerName: "PF Number",
                                width: 200,
                                resizable: true,
                                renderHeader: () => (
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                                        <span style={{ color: "#1D2939", fontSize: "15px", fontWeight: "500" }}>PF Number</span>
                                    </div>
                                ),
                                renderCell: (params) => {
                                    const isEditAllowed = canEdit && !isViewAction && !(options.table === "cid_ui_case_property_form" && params.row.sys_status === 'submit');
                                    return (
                                        <span
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleOthersTemplateDataView(params.row, false, options.table, !isEditAllowed);
                                            }}
                                            style={{
                                                color: '#2563eb',
                                                textDecoration: 'underline',
                                                cursor: 'pointer',
                                                fontWeight: 400,
                                                fontSize: '14px'
                                            }}
                                        >
                                            {params.value || 'View'}
                                        </span>
                                    );
                                }
                            }] : []),

                            ...Object.keys(getTemplateResponse.data[0] || {})
                                .filter((key) =>
                                    !excludedKeys.includes(key) &&
                                    key !== "field_pf_number" &&
                                    key !== "created_at" &&
                                    key !== "created_by" &&
                                    key !== "field_property_details" &&
                                    key !== "field_approval_done_by"
                                )
                                .map((key) => {
                                    const updatedKeyName = key
                                        .replace(/^field_/, "")
                                        .replace(/_/g, " ")
                                        .toLowerCase()
                                        .replace(/^\w|\s\w/g, (c) => c.toUpperCase());

                                    return {
                                        field: key,
                                        headerName: updatedKeyName || "",
                                        width: 200,
                                        resizable: true,
                                        renderHeader: () => (
                                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                                                <span style={{ color: "#1D2939", fontSize: "15px", fontWeight: "500" }}>
                                                    {updatedKeyName || "-"}
                                                </span>
                                            </div>
                                        ),
                                        renderCell: (params) => tableCellRender(key, params, params.value),
                                    };
                               }),

                            ...(Object.keys(getTemplateResponse.data[0] || {}).includes("created_by") ? [{
                                field: "created_by",
                                headerName: "Created By",
                                width: 200,
                                resizable: true,
                                renderHeader: () => (
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                                        <span style={{ color: "#1D2939", fontSize: "15px", fontWeight: "500" }}>Created By</span>
                                    </div>
                                ),
                                renderCell: (params) => tableCellRender("created_by", params, params.row.created_by)
                            }] : []),

                            ...(Object.keys(getTemplateResponse.data[0] || {}).includes("created_at") ? [{
                                field: "created_at",
                                headerName: "Created At",
                                width: 200,
                                resizable: true,
                                renderHeader: () => (
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                                        <span style={{ color: "#1D2939", fontSize: "15px", fontWeight: "500" }}>Created At</span>
                                    </div>
                                ),
                                renderCell: (params) => tableCellRender("created_at", params, params.row.created_at)
                            }] : [])
                        ].filter(Boolean);



                        setOtherTemplateColumn(updatedHeader);
                    } else {
                        setOtherTemplateColumn([]);
                    }

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
                            sl_no: (otherTablePagination - 1) * 10 + (index + 1),
                            ...(field.id ? {} : { id: "unique_id_" + index }),
                        };
                    });

                    setOtherTemplateData(updatedTableData);
                    if (options.is_view_action === true) {
                        setViewModeOnly(true)
                    }
                    else {
                        setViewModeOnly(false)
                    }
                }

                setOtherFormOpen(false);
                setOptionStepperData([]);
                setOptionFormTemplateData([]);
            } else {
                const errorMessage = getTemplateResponse.message
                    ? getTemplateResponse.message
                    : "Failed to create the Action Plan. Please try again.";
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
                toast.error(
                    error.response["data"].message
                        ? error.response["data"].message
                        : "Please Try Again !",
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
            }
        }
    };

    const handleOthersTemplateDataView = async (
        rowData,
        editData,
        table_name,
        disableEditButton
    ) => {
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

        var viewTemplatePayload = {
            table_name: table_name,
            id: rowData.id,
        };

        setLoading(true);
        try {
            const viewTemplateData = await api.post(
                "/templateData/viewTemplateData",
                viewTemplatePayload
            );
            setLoading(false);

            if (viewTemplateData && viewTemplateData.success) {
                setOtherInitialTemplateData(
                    viewTemplateData.data ? viewTemplateData.data : {}
                );
                setOtherReadOnlyTemplateData(!editData);
                setOtherEditTemplateData(editData);
                setOtherRowId(null);
                setOtherTemplateId(null);

                const viewTableData = {
                    table_name: table_name,
                };

                setLoading(true);
                try {
                    const viewTemplateResponse = await api.post(
                        "/templates/viewTemplate",
                        viewTableData
                    );
                    setLoading(false);

                    if (viewTemplateResponse && viewTemplateResponse.success) {
                        const templateData = viewTemplateResponse.data;
                        const rawFields = templateData.fields || [];

                        const processedFields = rawFields.map((field) => {
                            if (
                                field.name === "field_assigned_by" &&
                                templateData.table_name === "cid_ui_case_progress_report"
                            ) {
                                return {
                                    ...field,
                                    disabled: true,
                                };
                            }
                            return field;
                        });
                        setOptionFormTemplateData(processedFields);
                        setDisableEditButtonFlag(disableEditButton);
                        setOtherFormOpen(true);
                        setOtherRowId(rowData.id);
                        setOtherTemplateId(viewTemplateResponse["data"].template_id);
                        setChildTables(viewTemplateResponse?.["data"]?.["child_tables"] || []);
                        if (
                            viewTemplateResponse.data.no_of_sections &&
                            viewTemplateResponse.data.no_of_sections > 0
                        ) {
                            setOptionStepperData(
                                viewTemplateResponse.data.sections
                                    ? viewTemplateResponse.data.sections
                                    : []
                            );
                        }
                    } else {
                        const errorMessage = viewTemplateResponse.message
                            ? viewTemplateResponse.message
                            : "Failed to delete the template. Please try again.";
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
                        toast.error(
                            error.response["data"].message
                                ? error.response["data"].message
                                : "Please Try Again !",
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
                    }
                }
            } else {
                const errorMessage = viewTemplateData.message
                    ? viewTemplateData.message
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
            if (error && error.response && error.response["data"]) {
                toast.error(
                    error.response["data"].message
                        ? error.response["data"].message
                        : "Please Try Again !",
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
            }
        }
    };

    const closeOtherForm = () => {
        setOtherFormOpen(false)
        if (selectedOtherTemplate?.table === "cid_ui_case_property_form") {
            handleOtherTemplateActions(selectedOtherTemplate, selectedRowData)
        }
    }

    const tableCellRender = (key, params, value, index, tableName) => {

        let highlightColor = {};
        let onClickHandler = null;

        if (tableName && index !== null && index === 0) {
            highlightColor = { color: '#0167F8', textDecoration: 'underline', cursor: 'pointer' };

            onClickHandler = (event) => { event.stopPropagation(); handleTemplateDataView(params.row, false, tableName, hoverTableOptions) };
        }


        return (
            <Tooltip title={value} placement="top">
                {
                    (key === "field_io_name" && (value === "" || !value)) ? (
                        <span className="io-alert-flashy">
                            <span className="flashy-dot"></span>
                            ASSIGN IO
                        </span>
                    ) : (
                        <span
                            style={highlightColor}
                            onClick={onClickHandler}
                            className={`tableValueTextView Roboto`}
                        >
                            {value || "-"}
                        </span>
                    )
                }
            </Tooltip>
        );
    };

    const handleOthersDeleteTemplateData = (rowData, table_name, ui_case_id) => {
        Swal.fire({
            title: "Are you sure?",
            text: "Do you want to delete this profile ?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, Delete it!",
            cancelButtonText: "No",
        }).then(async (result) => {
            if (result.isConfirmed) {
                const deleteTemplateData = {
                    table_name: table_name,
                    where: { id: rowData.id },
                    ui_case_id: ui_case_id,
                    transaction_id : "TXN_" + Date.now() + "_" + Math.floor(Math.random() * 1000000),
                };
                setLoading(true);

                try {
                    const deleteTemplateDataResponse = await api.post(
                        "templateData/deleteTemplateData",
                        deleteTemplateData
                    );
                    setLoading(false);

                    if (
                        deleteTemplateDataResponse &&
                        deleteTemplateDataResponse.success
                    ) {
                        toast.success(
                            deleteTemplateDataResponse.message
                                ? deleteTemplateDataResponse.message
                                : "Template Deleted Successfully",
                            {
                                position: "top-right",
                                autoClose: 3000,
                                hideProgressBar: false,
                                closeOnClick: true,
                                pauseOnHover: true,
                                draggable: true,
                                progress: undefined,
                                className: "toast-success",
                                onOpen: () =>
                                    handleOtherTemplateActions(
                                        selectedOtherTemplate,
                                        selectedRow
                                    ),
                            }
                        );
                        if (fetchCounts) {
                            fetchCounts();
                        }
                    } else {
                        const errorMessage = deleteTemplateDataResponse.message
                            ? deleteTemplateDataResponse.message
                            : "Failed to delete the template. Please try again.";
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
                        toast.error(
                            error.response["data"].message
                                ? error.response["data"].message
                                : "Please Try Again !",
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
                    }
                }
            } else {
                console.log("Template deletion canceled.");
            }
        });
    };

    function isValidISODate(value) {
        return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value) && !isNaN(new Date(value).getTime());
    }

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

        var viewTemplatePayload = {
            table_name: table_name,
            id: rowData.id,
        };

        setLoading(true);

        try {

            const viewTemplateData = await api.post("/templateData/viewTemplateData", viewTemplatePayload);
            setLoading(false);

            if (viewTemplateData && viewTemplateData.success) {

                const viewTableData = {
                    table_name: table_name,
                };

                setLoading(true);
                try {
                    const viewTemplateResponse = await api.post("/templates/viewTemplate", viewTableData);
                    setLoading(false);

                    if (viewTemplateResponse && viewTemplateResponse.success) {

                        var actionTemplateMenus = hoverTableOptionsRef.current.map((element) => {

                            if (element?.icon && typeof element.icon === 'function') {
                                element.icon = element?.icon();
                            }

                            return element;

                        });

                        var stateObj = {
                            contentArray: JSON.stringify(actionTemplateMenus),
                            headerDetails: rowData?.["field_cid_crime_no./enquiry_no"] || null,
                            backNavigation: "/case/ui_case",
                            paginationCount: paginationCount,
                            sysStatus: sysStatus,
                            rowData: viewTemplateData?.["data"] || {},
                            tableFields: viewTemplateResponse?.["data"]?.["fields"] || [],
                            stepperData: viewTemplateResponse?.["data"]?.no_of_sections > 0 && viewTemplateResponse?.["data"]?.sections ? viewTemplateResponse?.["data"].sections : [],
                            template_id: viewTemplateResponse?.["data"]?.template_id,
                            template_name: viewTemplateResponse?.["data"]?.template_name,
                            table_name: table_name
                        }

                        navigate("/caseView", { state: stateObj });

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
                const errorMessage = viewTemplateData.message
                    ? viewTemplateData.message
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
    };

    const loadTableData = async (page) => {
        const getTemplatePayload = {
            page,
            limit: 10,
            sort_by: tableSortKey,
            order: tableSortOption,
            search: searchValue || "",
            table_name,
            is_starred: starFlag,
            is_read: readFlag,
            template_module: "ui_case",
            sys_status: sysStatus,
            from_date: fromDateValue,
            to_date: toDateValue,
            filter: filterValues,
        };

        setLoading(true);

        try {
            const getTemplateResponse = await api.post("/templateData/paginateTemplateDataForOtherThanMaster", getTemplatePayload);
            setLoading(false);

            if (getTemplateResponse?.success) {
                const { data, meta } = getTemplateResponse.data;

                const totalPages = meta?.totalPages;
                const totalItems = meta?.totalItems;

                if (totalPages !== null && totalPages !== undefined) {
                    setTotalPage(totalPages);
                }

                if (totalItems !== null && totalItems !== undefined) {
                    setTotalRecord(totalItems);
                }

                if (meta?.table_name && meta?.template_name) {
                    setTable_name(meta.table_name);
                }

                if (data?.length > 0) {
                    const excludedKeys = [
                        "created_at", "updated_at", "id", "deleted_at", "attachments",
                        "Starred", "ReadStatus", "linked_profile_info",
                        "ui_case_id", "pt_case_id", "sys_status", "task_unread_count", "field_cid_crime_no./enquiry_no", "field_io_name", "field_io_name_id"
                    ];

                    const generateReadableHeader = (key) =>
                        key
                            .replace(/^field_/, "")
                            .replace(/_/g, " ")
                            .toLowerCase()
                            .replace(/^\w|\s\w/g, (c) => c.toUpperCase());


                    const renderCellFunc = (key, count) => (params) => tableCellRender(key, params, params.value, count, meta.table_name);

                    // {
                    //     field: "task",
                    //     headerName: "",
                    //     width: 50,
                    //     resizable: true,
                    //     renderHeader: (params) => (
                    //         <Tooltip title="Add Task" sx={{ color: "", fill: "#1f1dac" }}><AssignmentIcon /></Tooltip>
                    //     ),
                    //     renderCell: (params) => {
                    //       const isDisabled = !params?.row?.["field_io_name"];
                    //       return (
                    //         <Badge
                    //             badgeContent={params?.row?.['task_unread_count']}
                    //             color="primary"
                    //             sx={{ '& .MuiBadge-badge': { minWidth: 17, maxWidth: 20, height: 17, borderRadius: '50%', fontSize: '10px',backgroundColor:'#f23067 !important' } }}
                    //         >
                    //             <Tooltip title="Add Task"><AddTaskIcon onClick={isDisabled ? undefined : () => handleTaskShow(params?.row)} sx={{margin: 'auto', cursor: 'pointer',color:'rgb(242 186 5); !important'}} /></Tooltip>
                    //         </Badge>
                    //     )},
                    //   },

                    const updatedHeader = [

                        {
                            field: "field_cid_crime_no./enquiry_no",
                            headerName: "Cid Crime No./Enquiry No",
                            width: 130,
                            resizable: true,
                            cellClassName: 'justify-content-start',
                            renderHeader: (params) => (
                                tableHeaderRender(params, "field_cid_crime_no./enquiry_no")
                            ),
                            renderCell: renderCellFunc("field_cid_crime_no./enquiry_no", 0),
                        },
                        {
                            field: "field_io_name",
                            headerName: "Assign To IO",
                            width: 200,
                            resizable: true,
                            cellClassName: 'justify-content-start',
                            renderHeader: (params) => (
                                tableHeaderRender(params, "field_io_name")
                            ),
                            renderCell: renderCellFunc("field_io_name",),
                        },
                        ...Object.keys(data[0])
                            .filter((key) => !excludedKeys.includes(key))
                            .map((key) => ({
                                field: key,
                                headerName: generateReadableHeader(key),
                                width: generateReadableHeader(key).length < 15 ? 100 : 200,
                                resizable: true,
                                renderHeader: (params) => (
                                    tableHeaderRender(params, key)
                                ),
                                renderCell: renderCellFunc(key),
                            })),
                    ];

                    setviewTemplateTableData(updatedHeader);

                    const formatDate = (value) => {
                        const parsed = Date.parse(value);
                        if (isNaN(parsed)) return value;
                        return new Date(parsed).toLocaleDateString("en-GB");
                    };

                    const updatedTableData = data.map((field, index) => {
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
                            sl_no: (page - 1) * 10 + (index + 1),
                            ...(field.id ? {} : { id: "unique_id_" + index }),
                        };
                    });

                    setTableData(updatedTableData);
                } else {
                    setTableData([]);
                }

                setviewReadonly(false);
                setEditTemplateData(false);
                setInitialData({});
                setFormOpen(false);
                setSelectedRow(null);

            } else {
                setLoading(false);
                toast.error(getTemplateResponse.message || "Failed to load template data.", {
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

    const handleOthersFilter = async (selectedOptions) => {

        if (!selectedOptions?.table) {
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

        const viewTableData = { table_name: selectedOptions.table };

        setLoading(true);
        try {
            const viewTemplateResponse = await api.post("/templates/viewTemplate", viewTableData);
            setLoading(false);

            if (viewTemplateResponse && viewTemplateResponse.success && viewTemplateResponse.data) {
                var templateFields = viewTemplateResponse.data["fields"] ? viewTemplateResponse.data["fields"] : [];
                var validFilterFields = ["dropdown", "autocomplete", "multidropdown"];

                var getOnlyDropdown = templateFields.filter((element) => validFilterFields.includes(element.type)).map((field) => {
                    const existingField = filterDropdownObj?.find(
                        (item) => item.name === field.name
                    );
                    return {
                        ...field,
                        history: false,
                        info: false,
                        required: false,
                        ...(field.is_dependent === "true" && { options: existingField?.options ? [...existingField.options] : [] }),
                    };
                });

                // const today = dayjs().format("YYYY-MM-DD");

                getAllOptionsforFilter(getOnlyDropdown, true);
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
    };

    const handleOtherClear = () => {
        setOtherSearchValue('');
        setOtherTemplatesPaginationCount(1);
        setOthersFromDate(null);
        setOthersToDate(null);
        setOthersFiltersDropdown([]);
        setOthersFilterData({});
        handleOtherTemplateActions(selectedOtherTemplate, selectedRowData, true)
    }

    const showOptionTemplate = async (tableName, approved) => {

        if (!tableName || tableName === "") {
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


        const viewTableData = {
            table_name: tableName,
        };
        setLoading(true);
        setOtherReadOnlyTemplateData(false);
        setOtherEditTemplateData(false);
        try {
            const viewTemplateResponse = await api.post(
                "/templates/viewTemplate",
                viewTableData
            );
            const ioUsers = await getIoUsers();
            const userId = localStorage.getItem("user_id");
            const userName = localStorage.getItem("username");

            setLoading(false);
            if (viewTemplateResponse && viewTemplateResponse.success) {
                var caseFields = [];
                var getCaseIdFields = viewTemplateResponse.data["fields"].map(
                    (field) => {

                        if (field.name === "field_assigned_by" && field.formType === "Dropdown") {

                            field.options = ioUsers.map(user => ({
                                code: user.user_id,
                                name: user.name
                            }));

                            const matchedOption = field.options.find(opt => String(opt.code) === String(userId));
                            if (!matchedOption) {
                                field.options.push({ code: userId, name: userName || `User ${userId}` });
                            }

                            field.defaultValue = userId;
                            field.disabled = true;
                        }


                        if (field && field.table && field.table === table_name) {
                            caseFields = field;
                            field.disabled = true;
                        }

                        return field;
                    }
                );

                var initialData = {};
                if (caseFields && caseFields["name"]) {
                    initialData = {
                        [caseFields["name"]]: selectedRowData.id,
                    };
                }

                setOtherFormOpen(true);
                setOtherInitialTemplateData(initialData);
                setviewReadonly(false);
                setChildTables(viewTemplateResponse?.["data"]?.["child_tables"] || []);
                setEditTemplateData(false);
                setOptionFormTemplateData(getCaseIdFields ? getCaseIdFields : []);
                if (
                    viewTemplateResponse.data.no_of_sections &&
                    viewTemplateResponse.data.no_of_sections > 0
                ) {
                    setOptionStepperData(
                        viewTemplateResponse.data.sections
                            ? viewTemplateResponse.data.sections
                            : []
                    );
                }
            } else {
                const errorMessage = viewTemplateResponse.message
                    ? viewTemplateResponse.message
                    : "Failed to delete the template. Please try again.";
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
                toast.error(
                    error.response["data"].message
                        ? error.response["data"].message
                        : "Please Try Again !",
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
            }
        }
    };

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

    const getAllOptionsforFilter = async (dropdownFields, others) => {
        try {
            setLoading(true);

            const apiCalls = dropdownFields
                .filter(
                    (field) =>
                        field.api === "/templateData/getTemplateData" && field.table
                )
                .map(async (field) => {
                    try {
                        const response = await api.post(field.api, {
                            table_name: field.table,
                        });

                        if (!response.data) return { id: field.id, options: [] };

                        const updatedOptions = response.data.map((templateData) => {
                            const nameKey = Object.keys(templateData).find(
                                (key) => !["id", "created_at", "updated_at"].includes(key)
                            );
                            return {
                                name: nameKey ? templateData[nameKey] : "",
                                code: templateData.id,
                            };
                        });

                        return { id: field.id, options: updatedOptions };
                    } catch (error) {
                        return { id: field.id, options: [] };
                    }
                });

            const results = await Promise.all(apiCalls);

            setLoading(false);
            var updatedFieldsDropdown = dropdownFields.map((field) => {
                const updatedField = results.find((res) => res.id === field.id);
                return updatedField
                    ? { ...field, options: updatedField.options }
                    : field;
            });

            if (others) {
                setOthersFiltersDropdown(updatedFieldsDropdown)
            } else {
                setfilterDropdownObj(updatedFieldsDropdown);
            }

        } catch (error) {
            setLoading(false);
            console.error("Error fetching template data:", error);
        }
    };

    const getIoUsers = async () => {
        const res = await api.post("cidMaster/getIoUsers");
        return res?.data || [];
    };

    const handleSubmitPF = async () => {
        // Find all rows with sys_status === 'PF'
        const pfRows = otherTemplateData.filter(row => row.sys_status === 'PF');
        if (!selectedRowData?.id || pfRows.length === 0) {
            toast.error("No Property Form records with status 'PF' to submit.", {
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
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "Do you want to submit these Property Form(s)? Once submitted, the selected record(s) will be moved to the FSL.",
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes, submit it!',
            cancelButtonText: 'Cancel',
        });

        if (result.isConfirmed) {
            const payload = {
                transaction_id: `submitap_${Math.floor(Math.random() * 1000000)}`,
                ui_case_id: selectedRowData.id,
                row_ids: pfRows.map(row => row.id)
            };

            try {
                setLoading(true);
                const response = await api.post('/templateData/submitPropertyFormFSL', payload);

                if (response.success) {
                    toast.success("The Property Form(s) have been submitted", {
                        position: "top-right",
                        autoClose: 3000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        className: "toast-success",
                        onOpen: () => {
                            if (!selectedOtherTemplate?.field) {
                                handleOtherTemplateActions(selectedOtherTemplate, selectedRow)
                            } else {
                                loadTableData(paginationCount);
                            }
                        },
                    });
                    if (fetchCounts) {
                        fetchCounts();
                    }
                    // No need to clear selectedIds
                } else {
                    toast.error(response.message || 'Something went wrong.', {
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
                toast.error(error.message || 'Submission failed.', {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    className: "toast-error",
                });
            } finally {
                setLoading(false);
            }
        }
    };


    function sanitizeKey(str) {
        return str
            .toLowerCase()
            .replace(/[^\w]/g, "_")
            .replace(/_+/g, "_")
            .replace(/^_+|_+$/g, "");
        }

    const otherAPPRTemplateSaveFunc = async (data, saveNewAction) => {

        if ((!selectedOtherTemplate.table || selectedOtherTemplate.table === "")) {
            toast.warning("Please Check The Template", {
                position: "top-right",
                autoClose: 3000,
                className: "toast-warning",
            });
            return;
        }

        if (Object.keys(data).length === 0) {
            toast.warning("Data Is Empty Please Check Once", {
                position: "top-right",
                autoClose: 3000,
                className: "toast-warning",
            });
            return;
        }

        const formData = new FormData();
        const normalData = {};

        optionFormTemplateData.forEach((field) => {
            const val = data[field.name];
            if (val !== undefined && val !== null && val !== "") {
                if (field.type === "file" || field.type === "profilepicture") {
                    if (field.type === "file") {
                        if (Array.isArray(val)) {
                            const validFiles = val.filter(f => f.filename instanceof File);
                            validFiles.forEach(file => formData.append(field.name, file.filename));
                            const filteredMeta = validFiles.map(f => ({
                                ...f,
                                filename: f.filename.name,
                            }));
                            formData.append("folder_attachment_ids", JSON.stringify(filteredMeta));
                        }
                    } else {
                        formData.append(field.name, val);
                    }
                } else {
                    normalData[field.name] = Array.isArray(val) ? val.join(",") : val
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

        normalData.sys_status = "PF"
        normalData.field_submit_status = "";
        if(module === 'ui_case'){
            normalData["ui_case_id"] = selectedRowData.id;
        }else if(module === 'pt_case'){
            normalData["pt_case_id"] = selectedRowData.id;
        }
        formData.append("table_name", selectedOtherTemplate.table);
        formData.append("data", JSON.stringify(normalData));
        formData.append("child_tables", JSON.stringify(childTableDataMap));
        formData.append("transaction_id", randomApprovalId);
        formData.append("user_designation_id", localStorage.getItem('designation_id') || null);

        setLoading(true);

        try {
            const response = await api.post("/templateData/saveActionPlan", formData);
            setLoading(false);

            if (response?.success) {
                toast.success(response.message || "Case Updated Successfully", {
                    position: "top-right",
                    autoClose: 3000,
                    className: "toast-success",
                });

                setOtherFormOpen(false);

                if (fetchCounts) {
                    fetchCounts();
                }
                if (selectedOtherTemplate?.field) {
                    const combinedData = {
                        id: selectedRowData.id,
                        [selectKey.name]: selectedOtherFields.code,
                    };
                    onUpdateTemplateData(combinedData);
                }
                if (saveNewAction) {
                    await handleOtherTemplateActions(selectedOtherTemplate, selectedRowData);
                    showOptionTemplate(selectedOtherTemplate.table);
                } else {
                    handleOtherTemplateActions(selectedOtherTemplate, selectedRowData);
                }

            } else {
                toast.error(response.message || "Failed to change the status. Please try again.", {
                    position: "top-right",
                    autoClose: 3000,
                    className: "toast-error",
                });
            }
        } catch (error) {
            setLoading(false);
            toast.error(error?.response?.data?.message || "Please Try Again!", {
                position: "top-right",
                autoClose: 3000,
                className: "toast-error",
            });
        }
    };

    const otherTemplateUpdateFunc = async (data) => {
        if (!selectedOtherTemplate.table || selectedOtherTemplate.table === "") {
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

        const formData = new FormData();
        let normalData = {};
        let filteredFileArray = [];

        optionFormTemplateData.forEach((field) => {
            if (data[field.name]) {
                if (field.type === "file" || field.type === "profilepicture") {
                    if (field.type === "file" && Array.isArray(data[field.name])) {
                        const hasFileInstance = data[field.name].some(
                            (file) => file.filename instanceof File
                        );
                        filteredFileArray = data[field.name].filter(
                            (file) => file.filename instanceof File
                        );

                        if (hasFileInstance) {
                            data[field.name].forEach((file) => {
                                if (file.filename instanceof File) {
                                    formData.append(field.name, file.filename);
                                }
                            });

                            const folderInfo = filteredFileArray.map((file) => ({
                                ...file,
                                filename: file.filename.name,
                            }));

                            formData.append(
                                "folder_attachment_ids",
                                JSON.stringify(folderInfo)
                            );
                        }
                    } else {
                        formData.append(field.name, data[field.name]);
                    }
                } else {
                    normalData[field.name] = Array.isArray(data[field.name]) ? data[field.name].join(",") : data[field.name]
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

        if (selectedOtherTemplate.table === "cid_ui_case_progress_report") {
            normalData["field_pr_status"] = "No";
        }

        formData.append("table_name", selectedOtherTemplate.table);
        formData.append("id", data.id);
        formData.append("data", JSON.stringify(normalData));
        formData.append("child_tables", JSON.stringify(childTableDataMap));
        formData.append("transaction_id", randomApprovalId);
        formData.append("user_designation_id", localStorage.getItem("designation_id") || null);

        let othersData = {};

        setLoading(true);

        try {
            const updateRes = await api.post(
                "/templateData/updateDataWithApprovalToTemplates",
                formData
            );
            setLoading(false);

            if (updateRes && updateRes.success) {
                toast.success(updateRes.message || "Data Updated Successfully", {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    className: "toast-success",
                    onOpen: () =>
                        handleOtherTemplateActions(selectedOtherTemplate, selectedRow),
                });

                setOtherEditTemplateData(false);
                setOtherReadOnlyTemplateData(false);
            } else {
                const errorMessage =
                    updateRes.message || "Failed to update. Please try again.";
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
            toast.error(
                error?.response?.data?.message || "Update failed. Please try again.",
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
        }
    };

    const onUpdateTemplateData = async (data) => {

        if (!table_name || table_name === "") {
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

        const formData = new FormData();

        formData.append("table_name", table_name);
        var normalData = {}; // Non-file upload fields

        formTemplateData.forEach((field) => {
            if (data[field.name]) {
                if (field.type === "file" || field.type === "profilepicture") {
                    // Append file fields to formData
                    if (field.type === "file") {
                        if (Array.isArray(data[field.name])) {
                            const hasFileInstance = data[field.name].some(
                                (file) => file.filename instanceof File
                            );
                            var filteredArray = data[field.name].filter(
                                (file) => file.filename instanceof File
                            );
                            if (hasFileInstance) {
                                data[field.name].forEach((file) => {
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
                                formData.append(
                                    "folder_attachment_ids",
                                    JSON.stringify(filteredArray)
                                );
                            }
                        }
                    } else {
                        formData.append(field.name, data[field.name]);
                    }
                } else {
                    // Add non-file fields to normalData
                    normalData[field.name] = Array.isArray(data[field.name]) ? data[field.name].join(",") : data[field.name]
                }
            }
        });
        setLoading(true);
        formData.append("id", data.id);
        formData.append("data", JSON.stringify(normalData));

        try {
            const saveTemplateData = await api.post(
                "/templateData/updateTemplateData",
                formData
            );
            setLoading(false);

            if (saveTemplateData && saveTemplateData.success) {
                toast.success(saveTemplateData.message || "Data Updated Successfully", {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    className: "toast-success",
                    onOpen: () => {
                        loadTableData(paginationCount);
                    },
                });

                setSelectKey(null);
                setSelectedRow([]);
                setSelectedOtherFields(null);
                setselectedOtherTemplate(null);
                setSelectedRowIds([]);

            } else {
                const errorMessage = saveTemplateData.message
                    ? saveTemplateData.message
                    : "Failed to create the profile. Please try again.";
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
                toast.error(
                    error.response["data"].message
                        ? error.response["data"].message
                        : "Please Try Again !",
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
            }
        }
    };


    return (
        <>
            <Box sx={{ overflow: 'auto', height: '100vh' }}>
                <Box py={1} px={2} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', }}>
                    <Box
                        sx={{
                            width: '100%',
                            bgcolor: 'background.paper',
                            borderRadius: 2,
                            zIndex: 1,
                        }}
                    >
                        {/* Header Section */}
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "start",
                                justifyContent: "space-between",
                                mb: 2,
                            }}
                        >
                            <Box
                                sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }}
                                onClick={() => backNavigation()}
                            >
                                <WestIcon />
                                <Typography variant="body1" fontWeight={500}>
                                    {selectedOtherTemplate?.name}
                                </Typography>

                                {/* {selectedRowData?.["field_cid_crime_no./enquiry_no"] && ( */}
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
                                {/* )} */}

                                {/* <Box className="totalRecordCaseStyle">
                                    {otherTemplatesTotalRecord} Records
                                </Box> */}

                                {/* {APIsSubmited && (
                                    <Box className="notifyAtTopCaseStyle">
                                        Submission request in progress. Awaiting SP approval.
                                    </Box>
                                )} */}
                            </Box>

                            {/* Actions Section */}
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Box sx={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', gap: '12px' }}>
                                    <Box></Box>

                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'end' }}>
                                        <TextFieldInput
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <SearchIcon sx={{ color: "#475467" }} />
                                                    </InputAdornment>
                                                ),
                                                // endAdornment: (
                                                //     <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                //         <IconButton
                                                //             sx={{ px: 1, borderRadius: 0 }}
                                                //             onClick={() => handleOthersFilter(selectedOtherTemplate)}
                                                //         >
                                                //             <FilterListIcon sx={{ color: "#475467" }} />
                                                //         </IconButton>
                                                //     </Box>
                                                // ),
                                            }}
                                            onInput={(e) => setOtherSearchValue(e.target.value)}
                                            value={otherSearchValue}
                                            id="tableSearch"
                                            size="small"
                                            placeholder="Search"
                                            variant="outlined"
                                            className="profileSearchClass"
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    e.preventDefault();
                                                    handleOtherTemplateActions(selectedOtherTemplate, selectedRowData);
                                                }
                                            }}
                                            sx={{
                                                width: '250px',
                                                borderRadius: '6px',
                                                '& .MuiInputBase-input::placeholder': {
                                                    color: '#475467',
                                                    opacity: 1,
                                                    fontSize: '14px',
                                                    fontWeight: 400,
                                                    fontFamily: 'Roboto',
                                                },
                                            }}
                                        />
                                        {(otherSearchValue || othersFromDate || othersToDate || Object.keys(othersFilterData).length > 0) && (
                                            <Typography
                                                onClick={handleOtherClear}
                                                sx={{
                                                    fontSize: "13px",
                                                    fontWeight: "500",
                                                    textDecoration: "underline",
                                                    cursor: "pointer",
                                                    mt: 1,
                                                }}
                                            >
                                                Clear Search
                                            </Typography>
                                        )}
                                    </Box>


                                    <Box
                                    sx={{
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        gap: 1.5,
                                        justifyContent: 'flex-end',
                                        marginLeft: 'auto',
                                    }}
                                    >
                                    {!viewModeOnly && (
                                        <Button
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
                                            onClick={() => showOptionTemplate(selectedOtherTemplate?.table)}
                                        >
                                            Add New
                                        </Button>
                                    )}
                                    {/* <Button
                                        onClick={handleOpenExportPopup}
                                        sx={{

                                            height: 40,
                                            px: 2.8,
                                            fontWeight: 600,
                                            fontSize: 14,
                                            textTransform: 'none',
                                            borderRadius: '8px',
                                            backgroundColor: '#1976d2',
                                            color: '#fff',
                                            '&:hover': {
                                                backgroundColor: '#115293',
                                            },
                                            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1.2,
                                        }}
                                    >
                                        <ImportExportIcon sx={{ fontSize: 18 }} />
                                        Export / Import
                                    </Button> */}
                                    <Button
                                        variant="contained"
                                        color="success"
                                        onClick={handleSubmitPF}
                                        disabled={showSubmitPFButton}
                                    >
                                        Submit
                                    </Button>
                                    {/* {
                                        showMagazineView && 
                                        <Button
                                            onClick={()=>showMagazineView(false)}
                                            sx={{height: "38px", textTransform: 'none'}}
                                            className="whiteBorderedBtn"
                                        >
                                            Case Docket
                                        </Button>
                                    } */}
                                    {
                                        userPermissions && userPermissions?.[0]?.['bulk_upload'] === true &&
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
                            </Box>
                        </Box>

                        {/* Data Table */}
                        <TableView
                            rows={otherTemplateData}
                            columns={otherTemplateColumn}
                            totalPage={otherTemplatesTotalPage}
                            totalRecord={otherTemplatesTotalRecord}
                            paginationCount={otherTemplatesPaginationCount}
                            handlePagination={handleOtherPagination}
                            tableName={selectedOtherTemplate?.table}
                        />
                    </Box>
                </Box>
            </Box>

            {otherFormOpen && (
                <Dialog
                    open={otherFormOpen}
                    onClose={() => closeOtherForm}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                    maxWidth="xl"
                    fullWidth
                >
                    <DialogContent sx={{ minWidth: "400px", padding: '0' }}>
                        <DialogContentText id="alert-dialog-description">
                            <FormControl fullWidth>
                                <NormalViewForm
                                    table_row_id={otherRowId}
                                    template_id={otherTemplateId}
                                    template_name={selectedOtherTemplate?.name}
                                    table_name={selectedOtherTemplate?.table}
                                    readOnly={otherReadOnlyTemplateData}
                                    editData={otherEditTemplateData}
                                    initialData={otherInitialTemplateData}
                                    formConfig={optionFormTemplateData}
                                    stepperData={optionStepperData}
                                    onSubmit={otherAPPRTemplateSaveFunc}
                                    onUpdate={otherTemplateUpdateFunc}
                                    disableEditButton={disableEditButtonFlag}
                                    onError={onSaveTemplateError}
                                    closeForm={closeOtherForm}
                                    headerDetails={selectedRowData?.["field_cid_crime_no./enquiry_no"]}
                                />
                            </FormControl>
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions sx={{ padding: "12px 24px" }}>
                        <Button onClick={closeOtherForm}>
                            Cancel
                        </Button>
                    </DialogActions>
                </Dialog>
            )}

            {showExportPopup && (
                <Dialog
                    open={showExportPopup}
                    onClose={() => setShowExportPopup(false)}
                    maxWidth="md"
                    fullWidth
                    PaperProps={{
                        sx: {
                            p: 3,
                            borderRadius: 3,
                            bgcolor: "#f9fafb",
                            boxShadow: "0 6px 20px rgba(0,0,0,0.12)",
                            minHeight: 400,
                            maxHeight: "80vh",
                            display: "flex",
                            flexDirection: "column",
                        },
                    }}
                >
                    {/* Tabs */}
                    <Box
                        sx={{
                            display: "flex",
                            gap: 1.5,
                            justifyContent: "center",
                            mb: 2,
                        }}
                    >
                        {[0, 1].map((idx) => (
                            <Button
                                key={idx}
                                variant={tabIndex === idx ? "contained" : "outlined"}
                                color="primary"
                                onClick={() => setTabIndex(idx)}
                                sx={{
                                    borderRadius: "20px",
                                    textTransform: "none",
                                    px: 3,
                                    py: 1,
                                    fontWeight: 600,
                                    fontSize: 15,
                                    minWidth: 110,
                                }}
                            >
                                {idx === 0 ? "Export" : "Import"}
                            </Button>
                        ))}
                    </Box>

                    {/* Main Content */}
                    <Box
                        sx={{
                            bgcolor: "white",
                            borderRadius: 2,
                            boxShadow: "0 3px 10px rgba(0,0,0,0.05)",
                            p: 3,
                            flexGrow: 1,
                            display: "flex",
                            flexDirection: "column",
                            overflow: "hidden",
                        }}
                    >
                        {/* Export Content */}
                        {tabIndex === 0 && (
                            <>
                                <Typography variant="h6" sx={{ fontSize: 17, fontWeight: 600, mb: 2 }}>
                                    Exported Data
                                </Typography>

                                {exportableData.length === 0 ? (
                                    <Typography
                                        sx={{
                                            textAlign: "center",
                                            mt: 6,
                                            color: "#777",
                                            fontSize: 15,
                                            flexGrow: 1,
                                        }}
                                    >
                                        No data available to export.
                                    </Typography>
                                ) : (
                                    <Box sx={{ overflowX: "auto", flexGrow: 1 }}>
                                        <Table size="small" stickyHeader>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell sx={{ fontWeight: 700, minWidth: 40, py: 1 }}>S.no</TableCell>
                                                    {Object.keys(exportableData[0])
                                                        .filter(
                                                            (col) =>
                                                                ![
                                                                    "id",
                                                                    "created_at",
                                                                    "updated_at",
                                                                    "created_by",
                                                                    "sys_status",
                                                                    "ReadStatus",
                                                                ].includes(col)
                                                        )
                                                        .map((col) => {
                                                            let display = col.startsWith("field_") ? col.slice(6) : col;
                                                            display = display
                                                                .replace(/_/g, " ")
                                                                .split(" ")
                                                                .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                                                                .join(" ");
                                                            return (
                                                                <TableCell key={col} sx={{ fontWeight: 600, minWidth: 110, py: 1 }}>
                                                                    {display}
                                                                </TableCell>
                                                            );
                                                        })}
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {exportableData.map((row, idx) => (
                                                    <TableRow key={idx} hover>
                                                        <TableCell sx={{ py: 0.8 }}>{idx + 1}</TableCell>
                                                        {Object.keys(row)
                                                            .filter(
                                                                (col) =>
                                                                    ![
                                                                        "id",
                                                                        "created_at",
                                                                        "updated_at",
                                                                        "created_by",
                                                                        "sys_status",
                                                                        "ReadStatus",
                                                                    ].includes(col)
                                                            )
                                                            .map((col) => {
                                                                let val = row[col];
                                                                const isDateField =
                                                                    col.toLowerCase().includes("_date") || col.toLowerCase().endsWith("date");

                                                                if (
                                                                    isDateField &&
                                                                    typeof val === "string" &&
                                                                    !isNaN(Date.parse(val)) &&
                                                                    dayjs(val).isValid()
                                                                ) {
                                                                    val = dayjs(val).format("DD-MM-YYYY");
                                                                }
                                                                return (
                                                                    <TableCell key={col} sx={{ py: 0.8, fontSize: 13 }}>
                                                                        {val}
                                                                    </TableCell>
                                                                );
                                                            })}
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </Box>
                                )}
                            </>
                        )}

                        {/* Import Content */}
                        {tabIndex === 1 && (
                            <Box
                                sx={{
                                    flexGrow: 1,
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: 3,
                                }}
                            >
                                <Typography variant="h6" sx={{ fontWeight: 600, fontSize: 18 }}>
                                    Upload Excel to Import Data
                                </Typography>
                                <Box
                                    sx={{
                                        border: "1px dashed #ccc",
                                        borderRadius: 2,
                                        padding: "20px 30px",
                                        backgroundColor: "#f5f5f5",
                                        width: "100%",
                                        maxWidth: 400,
                                        textAlign: "center",
                                    }}
                                >
                                    <input type="file" accept=".xlsx,.xls,.csv" style={{ width: "100%" }} />
                                </Box>
                            </Box>
                        )}
                    </Box>

                    {/* Footer Buttons */}
                    <Box
                        sx={{
                            mt: 3,
                            display: "flex",
                            justifyContent: "flex-end",
                            alignItems: "center",
                            gap: 1.5,
                        }}
                    >
                        {tabIndex === 0 && (
                            <Button
                                variant="contained"
                                color="primary"
                                disabled={exportableData.length === 0}
                                onClick={() =>
                                    exportToExcel(
                                        exportableData,
                                        (selectedOtherTemplate?.name || "Exported_Data").replace(/\s+/g, "_")
                                    )
                                }
                            >
                                Download Excel
                            </Button>
                        )}

                        {tabIndex === 1 && (
                            <Button variant="contained" color="primary">
                                Import Data
                            </Button>
                        )}

                        <Button variant="outlined" color="secondary" onClick={() => setShowExportPopup(false)}>
                            Close
                        </Button>
                    </Box>

                </Dialog>
            )}

            {
                loading && <div className='parent_spinner' tabIndex="-1" aria-hidden="true">
                    <CircularProgress size={100} />
                </div>
            }
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
        </>
    );
};

export default PropertyForm;