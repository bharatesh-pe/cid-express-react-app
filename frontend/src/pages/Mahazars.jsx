import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import NormalViewForm from "../components/dynamic-form/NormalViewForm";
import TableView from "../components/table-view/TableView";
import api from "../services/api";
import { Chip, Tooltip } from "@mui/material";
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
import DeleteIcon from '@mui/icons-material/Delete';
import TextFieldInput from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
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
import React from "react";

const Mahazars = ({ templateName, headerDetails, rowId, options, selectedRowData, backNavigation }) => {
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

    const [skipPropertyForm, setSkipPropertyForm] = useState(false);
    const [propertyFormOpen, setPropertyFormOpen] = useState(false);
    const [pendingMahazarData, setPendingMahazarData] = useState(null);
    const [propertyFormConfig, setPropertyFormConfig] = useState([]);
    const [propertyFormTemplateId, setPropertyFormTemplateId] = useState(null);
    const [propertyFormInitialData, setPropertyFormInitialData] = useState({});
    const [propertyFormStepperData, setPropertyFormStepperData] = useState([]);

    const [loading, setLoading] = useState(false);
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


    const handleOtherTemplateActions = async (options, selectedRow, searchFlag) => {

        const randomId = `random_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        var disabledEditFlag = false;
        var disabledDeleteFlag = false;
        setRandomApprovalId(randomId);

        console.log("checking selectedRow", selectedRow);
        var getTemplatePayload = {
            table_name: options.table,
            ui_case_id: selectedRow.id,
            case_io_id: selectedRow?.field_io_name || "",
            pt_case_id: selectedRow?.pt_case_id || null,
            limit: 10,
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

                        const supervisorRecords = records.filter(
                            record => record.supervisior_designation_id == userDesigId
                        );


                        let allAPWithOutSupervisorSubmit = false;


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

                        const ioRecords = records.filter(
                            record =>
                                record.sys_status === "ui_case" &&
                                record.supervisior_designation_id != userDesigId
                        );

                        const allAPWithOutIOSubmit = ioRecords.length > 0 &&
                            ioRecords.every(
                                record => record.field_submit_status === "" || record.field_submit_status === null
                            );

                        if (allAPWithOutSupervisorSubmit || allAPWithOutIOSubmit) {
                            anySubmitAP = false;
                        }

                        if (allAPWithOutSupervisorSubmit) {
                            isSuperivisor = true;
                        }

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
                            "supervisior_designation_id",
                            "field_approval_done_by",
                            "field_property_form_id",
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
                                                        handleOthersDeleteTemplateData(params.row, options.table);
                                                    }}
                                                />
                                            )}
                                        </Box>
                                    );
                                }
                            },
                            ...(Object.keys(getTemplateResponse.data[0] || {}).includes("field_mahajar_type") ? [{
                                field: "field_mahajar_type",
                                headerName: "Mahajar Type",
                                width: 200,
                                resizable: true,
                                renderHeader: () => (
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                                        <span style={{ color: "#1D2939", fontSize: "15px", fontWeight: "500" }}>Mahajar Type</span>
                                    </div>
                                ),
                                renderCell: (params) => {
                                    return (
                                        <span
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleOthersTemplateDataView(params.row, false, options.table);
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

                            ...(Object.keys(getTemplateResponse.data[0] || {}).includes("field_property_form_id") ? [{
                                field: "property_form_button",
                                headerName: "Property Form",
                                width: 200,
                                resizable: false,
                                sortable: false,
                                filterable: false,
                                renderHeader: () => (
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                                        <span style={{ color: "#1D2939", fontSize: "15px", fontWeight: "500" }}>Property Form</span>
                                    </div>
                                ),
                                renderCell: (params) => {
                                    const propertyFormId = params.row.field_property_form_id;
                                    return (
                                        <Button
                                            variant="contained"
                                            size="small"
                                            disabled={!propertyFormId}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (propertyFormId) {
                                                    handleOthersTemplateDataView(
                                                        { id: propertyFormId },
                                                        false,
                                                        "cid_ui_case_property_form"
                                                    );
                                                }
                                            }}
                                            className="newStyleButton"
                                            >
                                            Property Form
                                        </Button>
                                    );
                                }
                            }] : []),

                            ...Object.keys(getTemplateResponse.data[0] || {})
                                .filter((key) =>
                                    !excludedKeys.includes(key) &&
                                    key !== "field_pf#" &&
                                    key !== "created_at" &&
                                    key !== "created_by" &&
                                    key !== "field_approval_done_by" &&
                                    key !== "field_mahajar_type"
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

        if (table_name === "cid_ui_case_property_form") {
            setLoading(true);
            try {
                const viewTemplateData = await api.post(
                    "/templateData/viewTemplateData",
                    { table_name, id: rowData.id }
                );
                setLoading(false);

                if (viewTemplateData && viewTemplateData.success) {
                    setLoading(true);
                    try {
                        const viewTemplateResponse = await api.post(
                            "/templates/viewTemplate",
                            { table_name }
                        );
                        setLoading(false);

                        if (viewTemplateResponse && viewTemplateResponse.success) {
                            setPropertyFormConfig(viewTemplateResponse.data.fields || []);
                            setPropertyFormTemplateId(viewTemplateResponse.data.template_id);
                            setPropertyFormStepperData(
                                viewTemplateResponse.data.no_of_sections > 0
                                    ? viewTemplateResponse.data.sections
                                    : []
                            );
                            setPropertyFormInitialData(viewTemplateData.data ? viewTemplateData.data : {});
                            setPropertyFormOpen({
                                open: true,
                                readOnly: !editData,
                                editData: editData
                            });
                                            setOtherReadOnlyTemplateData(!editData);
                setOtherEditTemplateData(editData);

                        } else {
                            toast.error(
                                viewTemplateResponse.message ||
                                    "Failed to load property form template.",
                                {
                                    position: "top-right",
                                    autoClose: 3000,
                                    className: "toast-error",
                                }
                            );
                        }
                    } catch (error) {
                        setLoading(false);
                        toast.error(
                            error?.response?.data?.message ||
                                "Failed to load property form template.",
                            {
                                position: "top-right",
                                autoClose: 3000,
                                className: "toast-error",
                            }
                        );
                    }
                } else {
                    toast.error(
                        viewTemplateData.message ||
                            "Failed to load property form data.",
                        {
                            position: "top-right",
                            autoClose: 3000,
                            className: "toast-error",
                        }
                    );
                }
            } catch (error) {
                setLoading(false);
                toast.error(
                    error?.response?.data?.message ||
                        "Failed to load property form data.",
                    {
                        position: "top-right",
                        autoClose: 3000,
                        className: "toast-error",
                    }
                );
            }
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

    const handleOthersDeleteTemplateData = (rowData, table_name) => {
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


                getAllOptionsforFilter(getOnlyDropdown, true);
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

    const mahazarTemplateSaveFunc = async (data, saveNewAction) => {
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

        console.log("Opening property form dialog, Mahazar data:", data, saveNewAction);
        setPendingMahazarData({ data, saveNewAction });

        setLoading(true);
        try {
            const res = await api.post("/templates/viewTemplate", { table_name: "cid_ui_case_property_form" });
            setLoading(false);
            if (res?.success && res.data) {
                setPropertyFormConfig(res.data.fields || []);
                setPropertyFormTemplateId(res.data.template_id);
                setPropertyFormStepperData(res.data.no_of_sections > 0 ? res.data.sections : []);
                setPropertyFormInitialData({});
                setPropertyFormOpen(true);
            } else {
                toast.error("Failed to load property form template.", {
                    position: "top-right",
                    autoClose: 3000,
                    className: "toast-error",
                });
            }
        } catch (err) {
            setLoading(false);
            toast.error("Failed to load property form template.", {
                position: "top-right",
                autoClose: 3000,
                className: "toast-error",
            });
        }
        return;
    };

    const handlePropertyFormSubmit = async (propertyFormData) => {
        if (!pendingMahazarData) return;
        setPropertyFormOpen(false);

        const { data: mahazarData, saveNewAction } = pendingMahazarData;
        const mahazarNormalData = {};
        let mahazarFolderAttachments = [];
        optionFormTemplateData.forEach((field) => {
            const val = mahazarData[field.name];
            if (val !== undefined && val !== null && val !== "") {
                if (field.type === "file" || field.type === "profilepicture") {
                    if (field.type === "file") {
                        if (Array.isArray(val)) {
                            const validFiles = val.filter(f => f.filename instanceof File);
                            const filteredMeta = validFiles.map(f => ({
                                ...f,
                                filename: f.filename.name,
                            }));
                            mahazarFolderAttachments = filteredMeta;
                        }
                    }
                } else {
                    mahazarNormalData[field.name] = Array.isArray(val) ? val.join(",") : val;
                }
            }
        });
        mahazarNormalData.sys_status = "ui_case";
        mahazarNormalData.field_submit_status = "";
        mahazarNormalData["ui_case_id"] = selectedRowData.id;

        const propertyNormalData = {};
        let propertyFolderAttachments = [];
        propertyFormConfig.forEach((field) => {
            const val = propertyFormData[field.name];
            if (val !== undefined && val !== null && val !== "") {
                if (field.type === "file" || field.type === "profilepicture") {
                    if (field.type === "file") {
                        if (Array.isArray(val)) {
                            const validFiles = val.filter(f => f.filename instanceof File);
                            const filteredMeta = validFiles.map(f => ({
                                ...f,
                                filename: f.filename.name,
                            }));
                            propertyFolderAttachments = filteredMeta;
                        }
                    }
                } else {
                    propertyNormalData[field.name] = Array.isArray(val) ? val.join(",") : val;
                }
            }
        });
        propertyNormalData.sys_status = "PF";
        propertyNormalData.field_submit_status = "";
        propertyNormalData["ui_case_id"] = selectedRowData.id;

        const formData = new FormData();
        formData.append("table_name", selectedOtherTemplate.table);
        formData.append("data", JSON.stringify(mahazarNormalData));
        formData.append("transaction_id", randomApprovalId);
        formData.append("user_designation_id", localStorage.getItem('designation_id') || null);
        if (mahazarFolderAttachments.length > 0) {
            formData.append("folder_attachment_ids", JSON.stringify(mahazarFolderAttachments));
            optionFormTemplateData.forEach((field) => {
                const val = mahazarData[field.name];
                if (field.type === "file" && Array.isArray(val)) {
                    val.filter(f => f.filename instanceof File).forEach(file => {
                        formData.append(field.name, file.filename);
                    });
                }
            });
        }
        formData.append("second_table_name", "cid_ui_case_property_form");
        formData.append("second_data", JSON.stringify(propertyNormalData));
        if (propertyFolderAttachments.length > 0) {
            formData.append("second_folder_attachment_ids", JSON.stringify(propertyFolderAttachments));
            propertyFormConfig.forEach((field) => {
                const val = propertyFormData[field.name];
                if (field.type === "file" && Array.isArray(val)) {
                    val.filter(f => f.filename instanceof File).forEach(file => {
                        formData.append(field.name, file.filename);
                    });
                }
            });
        }

        setLoading(true);
        try {
            const res = await api.post("/templateData/insertTwoTemplateData", formData);
            setLoading(false);

            if (res?.success) {
                toast.success("Mahazar and Property Form saved successfully.", {
                    position: "top-right",
                    autoClose: 3000,
                    className: "toast-success",
                });
                setOtherFormOpen(false);
                setPendingMahazarData(null);
                handleOtherTemplateActions(selectedOtherTemplate, selectedRowData);
            } else {
                toast.error(res?.message || "Failed to save Mahazar/Property Form.", {
                    position: "top-right",
                    autoClose: 3000,
                    className: "toast-error",
                });
            }
        } catch (err) {
            setLoading(false);
            toast.error(err?.message || "Failed to save Mahazar/Property Form.", {
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
    
            if (selectedOtherTemplate.table === "cid_ui_case_progress_report") {
                normalData["field_pr_status"] = "No";
            }
    
            formData.append("table_name", selectedOtherTemplate.table);
            formData.append("id", data.id);
            formData.append("data", JSON.stringify(normalData));
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
    
    const propertyTemplateUpdateFunc = async (data) => {
        if (!data || Object.keys(data).length === 0) {
            toast.warning("Data Is Empty Please Check Once", {
                position: "top-right",
                autoClose: true,
                className: "toast-warning",
            });
            return;
        }

        const formData = new FormData();
        let normalData = {};
        let filteredFileArray = [];

        propertyFormConfig.forEach((field) => {
            const val = data[field.name];
            if (val !== undefined && val !== null && val !== "") {
                if (field.type === "file" || field.type === "profilepicture") {
                    if (field.type === "file" && Array.isArray(val)) {
                        const hasFileInstance = val.some(
                            (file) => file.filename instanceof File
                        );
                        filteredFileArray = val.filter(
                            (file) => file.filename instanceof File
                        );

                        if (hasFileInstance) {
                            val.forEach((file) => {
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
                    }
                } else {
                    normalData[field.name] = Array.isArray(val) ? val.join(",") : val;
                }
            }
        });

        formData.append("table_name", "cid_ui_case_property_form");
        formData.append("id", data.id);
        formData.append("data", JSON.stringify(normalData));
        formData.append("transaction_id", randomApprovalId);
        formData.append("user_designation_id", localStorage.getItem("designation_id") || null);

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
                    className: "toast-success",
                    onOpen: () =>
                        handleOtherTemplateActions(selectedOtherTemplate, selectedRow),
                });

                setOtherEditTemplateData(false);
                setOtherReadOnlyTemplateData(false);
                setPropertyFormOpen(false);
            } else {
                const errorMessage =
                    updateRes.message || "Failed to update. Please try again.";
                toast.error(errorMessage, {
                    position: "top-right",
                    autoClose: 3000,
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
                    className: "toast-error",
                }
            );
        }
    };


    function handleSkipPropertyForm() {
        Swal.fire({
            title: "Are you sure?",
            text: "Are you sure you want to skip this and save only Mahazar?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, Save Only Mahazar",
            cancelButtonText: "No",
        }).then((result) => {
            if (result.isConfirmed) {
                setPropertyFormOpen(false);
                setSkipPropertyForm(true); 
                setPendingMahazarData(pendingMahazarData);
            }
        });
    }

    useEffect(() => {
        if (skipPropertyForm && pendingMahazarData) {
            (async () => {
                const { data: mahazarData, saveNewAction } = pendingMahazarData;
                const mahazarNormalData = {};
                let mahazarFolderAttachments = [];
                optionFormTemplateData.forEach((field) => {
                    const val = mahazarData[field.name];
                    if (val !== undefined && val !== null && val !== "") {
                        if (field.type === "file" || field.type === "profilepicture") {
                            if (field.type === "file") {
                                if (Array.isArray(val)) {
                                    const validFiles = val.filter(f => f.filename instanceof File);
                                    const filteredMeta = validFiles.map(f => ({
                                        ...f,
                                        filename: f.filename.name,
                                    }));
                                    mahazarFolderAttachments = filteredMeta;
                                }
                            }
                        } else {
                            mahazarNormalData[field.name] = Array.isArray(val) ? val.join(",") : val;
                        }
                    }
                });
                mahazarNormalData.sys_status = "ui_case";
                mahazarNormalData.field_submit_status = "";
                mahazarNormalData["ui_case_id"] = selectedRowData.id;

                const propertyNormalData = {};
                let propertyFolderAttachments = [];
                propertyFormConfig.forEach((field) => {
                });
                propertyNormalData.sys_status = "ui_case";
                propertyNormalData.field_submit_status = "";
                propertyNormalData["ui_case_id"] = selectedRowData.id;

                const formData = new FormData();
                formData.append("table_name", selectedOtherTemplate.table);
                formData.append("data", JSON.stringify(mahazarNormalData));
                formData.append("transaction_id", randomApprovalId);
                formData.append("user_designation_id", localStorage.getItem('designation_id') || null);
                if (mahazarFolderAttachments.length > 0) {
                    formData.append("folder_attachment_ids", JSON.stringify(mahazarFolderAttachments));
                    optionFormTemplateData.forEach((field) => {
                        const val = mahazarData[field.name];
                        if (field.type === "file" && Array.isArray(val)) {
                            val.filter(f => f.filename instanceof File).forEach(file => {
                                formData.append(field.name, file.filename);
                            });
                        }
                    });
                }

                setLoading(true);
                try {
                    const mahazarRes = await api.post("/templateData/insertTemplateData", formData);
                    setLoading(false);
                    if (mahazarRes?.success) {
                        toast.success("Mahazar saved successfully.", {
                            position: "top-right",
                            autoClose: 3000,
                            className: "toast-success",
                        });
                        setOtherFormOpen(false);
                        setPendingMahazarData(null);
                        setSkipPropertyForm(false);
                        handleOtherTemplateActions(selectedOtherTemplate, selectedRowData);
                    } else {
                        toast.error(mahazarRes?.message || "Failed to save Mahazar.", {
                            position: "top-right",
                            autoClose: 3000,
                            className: "toast-error",
                        });
                        setSkipPropertyForm(false);
                    }
                } catch (err) {
                    setLoading(false);
                    toast.error(err?.message || "Failed to save Mahazar.", {
                        position: "top-right",
                        autoClose: 3000,
                        className: "toast-error",
                    });
                    setSkipPropertyForm(false);
                }
            })();
        }
    }, [skipPropertyForm, pendingMahazarData]);

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

                                {selectedRowData?.["field_cid_crime_no./enquiry_no"] && (
                                    <Chip
                                        label={selectedRowData["field_cid_crime_no./enquiry_no"]}
                                        color="primary"
                                        variant="outlined"
                                        size="small"
                                        sx={{ fontWeight: 500, mt: '2px' }}
                                    />
                                )}

                                <Box className="totalRecordCaseStyle">
                                    {otherTemplatesTotalRecord} Records
                                </Box>

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
                                                endAdornment: (
                                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                        <IconButton
                                                            sx={{ px: 1, borderRadius: 0 }}
                                                            onClick={() => handleOthersFilter(selectedOtherTemplate)}
                                                        >
                                                            <FilterListIcon sx={{ color: "#475467" }} />
                                                        </IconButton>
                                                    </Box>
                                                ),
                                            }}
                                            onInput={(e) => setOtherSearchValue(e.target.value)}
                                            value={otherSearchValue}
                                            id="tableSearch"
                                            size="small"
                                            placeholder="Search anything"
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
                                                Clear Filter
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
                                            variant="outlined"
                                            sx={{ height: '40px' }}
                                            onClick={() => showOptionTemplate(selectedOtherTemplate?.table)}
                                        >
                                            Add
                                        </Button>
                                    )}
                                </Box>
                                </Box>     
                            </Box>
                                               </Box>

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
                                    onSubmit={mahazarTemplateSaveFunc}
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

            {/* Property Form Dialog */}
            {propertyFormOpen && (
                <Dialog
                    open={propertyFormOpen}
                    onClose={() => setPropertyFormOpen(false)}
                    aria-labelledby="property-form-dialog-title"
                    aria-describedby="property-form-dialog-description"
                    maxWidth="xl"
                    fullWidth
                >
                    <DialogContent sx={{ minWidth: "400px", padding: '0' }}>
                        <DialogContentText id="property-form-dialog-description">
                            <FormControl fullWidth>
                                <NormalViewForm
                                table_row_id={null}
                                template_id={propertyFormTemplateId}
                                template_name="Property Form"
                                table_name="cid_ui_case_property_form"
                                readOnly={otherReadOnlyTemplateData}
                                editData={otherEditTemplateData}
                                initialData={propertyFormInitialData}
                                formConfig={propertyFormConfig}
                                stepperData={propertyFormStepperData}
                                onSubmit={handlePropertyFormSubmit}
                                onUpdate={propertyTemplateUpdateFunc}
                                disableEditButton={false}
                                onError={onSaveTemplateError}
                                closeForm={() => setPropertyFormOpen(false)}
                                headerDetails={selectedRowData?.["field_cid_crime_no./enquiry_no"]}
                                onSkip={pendingMahazarData?.data?.field_mahajar_type === "Spot Mahazar" ? handleSkipPropertyForm : undefined}
                                skip = {handleSkipPropertyForm}
                                />

                            </FormControl>
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions sx={{ padding: "12px 24px" }}>
                        <Button onClick={() => setPropertyFormOpen(false)}>
                            Cancel
                        </Button>
                    </DialogActions>
                </Dialog>
            )}
 
 
        </>
    );
};

export default Mahazars;