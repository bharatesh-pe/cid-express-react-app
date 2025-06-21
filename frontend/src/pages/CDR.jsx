import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import NormalViewForm from "../components/dynamic-form/NormalViewForm";
import TableView from "../components/table-view/TableView";
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import api from "../services/api";
import { Chip, Tooltip } from "@mui/material";
import {
    Box,
    Button,
    FormControl,
    InputAdornment,
    Typography,
    IconButton,
    Checkbox,
    Grid,
    TextField,
} from "@mui/material";
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
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import DialogTitle from "@mui/material/DialogTitle";
import Autocomplete from "@mui/material/Autocomplete";
import { Add } from "@mui/icons-material";
import dayjs from "dayjs";

const CDR = ({ templateName, headerDetails, rowId, options, selectedRowData, backNavigation, module }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { pageCount, systemStatus } = location.state || {};
    const [disableEditButtonFlag, setDisableEditButtonFlag] = useState(false);
    const [viewModeOnly, setViewModeOnly] = useState(false);
    var userPermissions = JSON.parse(localStorage.getItem("user_permissions")) || [];
    const templateActionAddFlag = useRef(false);
    const [totalPage, setTotalPage] = useState(0);
    const [totalRecord, setTotalRecord] = useState(0);
    const [filterDropdownObj, setfilterDropdownObj] = useState([]);
    const [filterValues, setFilterValues] = useState({});
    const [fromDateValue, setFromDateValue] = useState(null);
    const [toDateValue, setToDateValue] = useState(null);
    const [showSubmitAPButton, setShowSubmitAPButton] = useState(false);
    const [isImmediateSupervisior, setIsImmediateSupervisior] = useState(false);
    const [ioSubmitted, setIoSubmitted] = useState(false);
    const [spSubmitted, setSpSubmitted] = useState(false);
    const [ImmediateSupervisiorId, setImmediateSupervisiorId] = useState(0);
    const [otherTemplatesTotalPage, setOtherTemplatesTotalPage] = useState(0);
    const [otherTemplatesTotalRecord, setOtherTemplatesTotalRecord] = useState(0);
    const [APIsSubmited, setAPIsSubmited] = useState(false);
    const [allData, setAllData] = useState([]);
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
    const [otherFormOpenCDR, setOtherFormOpenCDR] = useState(false);
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
    const [approveDropdownAnchorEl, setApproveDropdownAnchorEl] = useState(null);
    const [cdrUpdateDialogOpen, setCdrUpdateDialogOpen] = useState(false);
    const [cdrUpdateStatus, setCdrUpdateStatus] = useState("");
    const [cdrUpdateFiles, setCdrUpdateFiles] = useState([]);
    const [cdrUpdateId, setCdrUpdateId] = useState(null);
    const [cdrUpdateStatusOptions] = useState([
        { label: "Pending", value: "Pending" },
        { label: "Provided", value: "Provided" },
        { label: "Rejected", value: "Rejected" },
    ]);


    const [enableSubmit, setEnableSubmit] = useState(false);
    const [approvalDone, setApprovalDone] = useState(false);
    const [approvalFieldArray, setApprovalFieldArray] = useState([]);
    const [approvalStepperArray, setApprovalStepperArray] = useState([]);
    const [canAdd, setCanAdd] = useState(true);
    const [canEdit, setCanEdit] = useState(true);
    const [canDeletePermission, setCanDeletePermission] = useState(true);
    const [canSubmit, setCanSubmit] = useState(true);
    const [showApproveAndSend, setShowApproveAndSend] = useState(false);
    const [showSubmitMenu, setShowSubmitMenu] = useState(false);
    const [showStatusUpdate, setShowStatusUpdate] = useState(false);

    const canEditRef = useRef(true);
    const canDeletePermissionRef = useRef(true);

    var roleTitle = JSON.parse(localStorage.getItem("role_title")) || "";
    var designationName = localStorage.getItem("designation_name") || "";
    var gettingDesignationName = ""

    if (roleTitle.toLowerCase() === "investigation officer") {
        gettingDesignationName = "io";
    } else {
        var splitingValue = designationName.split(" ");
        if (splitingValue?.[0]) {
            gettingDesignationName = splitingValue[0].toLowerCase();
        }
    }

    const userDesignationName = useRef(gettingDesignationName);

    const editableStage = (() => {
        if (approvalStepperArray.length === 0) return ""
        if (!approvalFieldArray || approvalFieldArray.length === 0) return approvalStepperArray?.[0];

        const lastStage = approvalFieldArray[approvalFieldArray.length - 1];
        const nextIndex = approvalStepperArray.indexOf(lastStage) + 1;

        return approvalStepperArray[nextIndex] || null;
    })();

    useEffect(() => {
        if (userDesignationName?.current) {
            const userRole = userDesignationName.current.toUpperCase();

            setEnableSubmit(userRole === editableStage);

            const lastApprovedRole = approvalFieldArray[0];
            const lastApprovedIndex = approvalStepperArray.indexOf(lastApprovedRole);

            const approvedStages = approvalStepperArray.slice(0, lastApprovedIndex + 1);

            setApprovalDone(approvedStages.includes(userRole));
        }
    }, [approvalFieldArray, approvalStepperArray]);


    useEffect(() => {
        handleOtherTemplateActions(selectedOtherTemplate, selectedRowData)
    }, [otherTemplatesPaginationCount]);



    const onSaveTemplateError = (error) => {
        setIsValid(false);
    };

    // Role/Designation flags
    const [isIO, setIsIO] = useState(false);
    const [isSPDivision, setIsSPDivision] = useState(false);
    const [isSPCCD, setIsSPCCD] = useState(false);
    const [isCDR, setIsCDR] = useState(false);

    // Update role flags whenever getTemplateData runs (i.e., after handleOtherTemplateActions)
    const updateRoleFlags = () => {
        const userDesignationId = (localStorage.getItem("designation_name") || "").toUpperCase();
        const userRole = (localStorage.getItem("role_title") || "").trim().toLowerCase();

        setIsIO(userRole.replace(/['"]+/g, '').trim() === "investigation officer");
        setIsSPDivision(isImmediateSupervisior);
        setIsSPCCD(userDesignationId === "SPCCD CDR");
        setIsCDR(userDesignationId === "CDR" || userRole === "cdr cell");
    };

    // Call updateRoleFlags after getTemplateData (i.e., after handleOtherTemplateActions)
    useEffect(() => {
        updateRoleFlags();
        // eslint-disable-next-line
    }, [allData, isImmediateSupervisior]);

    // Check if any row has field_submit_spdivision === "SP"
    const hasSpSubmitted = Array.isArray(otherTemplateData) && otherTemplateData.some(row => row.field_submit_spdivision === "SP");
    // Check if any row has field_submit_reject === "REJECT"
    const hasRejectSubmitted = Array.isArray(otherTemplateData) && otherTemplateData.some(row => row.field_submit_reject === "REJECT");

    const hasCDRCell = Array.isArray(otherTemplateData) && otherTemplateData.some(row => row.field_submit_cdr === "CDR");

    const handleOtherTemplateActions = async (options, selectedRow, searchFlag) => {

        const randomId = `random_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        var disabledEditFlag = false;
        var disabledDeleteFlag = false;
        setRandomApprovalId(randomId);

        var getTemplatePayload = {
            table_name: "cid_ui_case_cdr_ipdr",
            ui_case_id: selectedRow.id,
            case_io_id: selectedRow?.field_io_name || "",
            pt_case_id: selectedRow?.pt_case_id || null,
            limit: 10,
            page: !searchFlag ? otherTemplatesPaginationCount : 1,
            search: !searchFlag ? otherSearchValue : "",
            from_date: !searchFlag ? othersFromDate : null,
            to_date: !searchFlag ? othersToDate : null,
            filter: !searchFlag ? othersFilterData : {},
            checkRandomColumn: "field_approval_done_by",
        };

        // if (options.permissions) {
        //     const parsedPermissions = JSON.parse(options.permissions);

        //     if (parsedPermissions && typeof parsedPermissions === 'object' && !Array.isArray(parsedPermissions)) {

        //         if(parsedPermissions?.['add'].length > 0){
        //             const hasAddPermission = parsedPermissions?.['add'].some(
        //                 (permission) => userPermissions?.[0]?.[permission] === true
        //             );

        //             templateActionAddFlag.current = hasAddPermission;
        //         }else{
        //             templateActionAddFlag.current = true;
        //         }

        //         if(parsedPermissions?.['edit'].length > 0){
        //             const hasEditPermission = parsedPermissions?.['edit'].some(
        //                 (permission) => userPermissions?.[0]?.[permission] === true
        //             );

        //             disabledEditFlag = hasEditPermission
        //         }else{
        //             disabledEditFlag = true;
        //         }

        //         if(parsedPermissions?.['delete'].length > 0){
        //             const hasDeletePermission = parsedPermissions?.['delete'].some(
        //                 (permission) => userPermissions?.[0]?.[permission] === true
        //             );

        //             disabledDeleteFlag = hasDeletePermission
        //         }else{
        //             disabledDeleteFlag = true;
        //         }

        //     }else{
        //         disabledEditFlag = true;
        //         disabledDeleteFlag = true;
        //     }

        // }
        templateActionAddFlag.current = true;

        setLoading(true);

        try {
            const getTemplateResponse = await api.post("/templateData/getTemplateData", getTemplatePayload);

            setLoading(false);

            if (getTemplateResponse && getTemplateResponse.success) {

                const { meta } = getTemplateResponse;
                const totalPages = meta?.meta?.totalPages;
                const totalItems = meta?.meta?.totalItems;
                const checkRandomColumnValues = meta?.meta?.checkRandomColumnValues;

                if (checkRandomColumnValues) {
                    setApprovalFieldArray(checkRandomColumnValues);
                } else {
                    setApprovalFieldArray([]);
                }

                setApprovalStepperArray((options?.is_approval && options?.approval_steps) ? JSON.parse(options.approval_steps) : []);


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
                    let ioSubmitted = false;
                    let spSubmitted = false;
                    const userDesigId = localStorage.getItem('designation_id');
                    if (records && records.length > 0) {

                        // Get supervisor-specific records
                        const supervisorRecords = records.filter(
                            record => record.supervisior_designation_id == userDesigId
                        );

                        // Assign the first matched supervisor_designation_id (if available)
                        if (supervisorRecords.length > 0) {
                            setImmediateSupervisiorId(supervisorRecords[0].supervisior_designation_id);
                        }

                        let allAPWithOutSupervisorSubmit = false;

                        for (let i = 0; i < supervisorRecords.length; i++) {
                            const status = supervisorRecords[i]['field_done_by'];
                            if (status === "IO" || status === null) {
                                allAPWithOutSupervisorSubmit = true;
                                break;
                            }
                        }

                        // Get non-supervisor records with sys_status "ui_case"
                        const ioRecords = records.filter(
                            record =>
                                record.sys_status === "ui_case" &&
                                record.supervisior_designation_id != userDesigId
                        );

                        if (ioRecords.length > 0) {
                            setImmediateSupervisiorId(ioRecords[0].supervisior_designation_id);
                        }

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
                            // record.sys_status === "ui_case" ||
                            // (
                            record.sys_status === "IO" &&
                            (record.field_submit_status === "" || record.field_submit_status === null) &&
                            record.supervisior_designation_id != userDesigId
                            // )
                        );

                    } else {
                        anySubmitAP = false;
                    }

                    const ioSubmittedRecords = records.filter(
                        record => record.field_submit_status === "IO"
                    );

                    const spSubmittedRecords = records.filter(
                        record => record.field_submit_spdivision === "SP"
                    );

                    setShowSubmitAPButton(anySubmitAP);
                    setIsImmediateSupervisior(isSuperivisor);
                    setIoSubmitted(ioSubmittedRecords);
                    setSpSubmitted(spSubmittedRecords);
                    setAPIsSubmited(APisSubmited);
                    setAllData(records);

                    console.log("outside data", canDeletePermission)

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
                            "field_done_by",
                            "field_need_to_do_by"
                        ];


                        const updatedHeader = [
                            {
                                field: "sl_no",
                                headerName: "S.No",
                                resizable: false,
                                width: 75,
                                renderCell: (params) => {
                                    console.log("canDeletecanDelete", canDeletePermission);
                                    const userPermissions = JSON.parse(localStorage.getItem("user_permissions")) || [];
                                    // const canDelete = userPermissions[0]?.action_delete;
                                    const isViewAction = options.is_view_action === true;
                                    let isActionPlan = false;

                                    if (params.row.sys_status === 'IO' && params.row.supervisior_designation_id != localStorage.getItem('designation_id')) {
                                        isActionPlan = true;
                                    } else if ((params.row.sys_status === 'IO' || params.row.sys_status === 'ui_case') && params.row.field_submit_status === '' && params.row.supervisior_designation_id == localStorage.getItem('designation_id')) {
                                        isActionPlan = false;
                                    } else if (params.row.field_submit_status === 'submit' || params.row.sys_status === 'IO') {
                                        isActionPlan = true;
                                    }

                                    // FIX: For SPCCD user, show edit/delete only when Approve and Send to SPCCD is visible (!hasSpSubmitted)
                                    // Hide edit/delete when Submit is visible (hasSpSubmitted)
                                    let allowDelete = canDeletePermissionRef.current;

                                    // if (isSPCCD) {
                                    //     allowDelete = !hasSpSubmitted && ((canDelete && !isViewAction && !isActionPlan) || isSPDivision) && !hasRejectSubmitted;
                                    // } else {
                                    //     allowDelete = ((canDelete && !isViewAction && !isActionPlan) || isSPDivision) && !hasRejectSubmitted;
                                    // }

                                    return (
                                        <Box sx={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                            {params.value}
                                            {allowDelete && (
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
                                },
                            },
                            ...Object.keys(getTemplateResponse.data[0]).filter(
                                (key) =>
                                    !excludedKeys.includes(key) &&
                                    ![
                                        "field_pt_case_id",
                                        "field_ui_case_id",
                                        "field_pr_status",
                                        "field_evidence_file",
                                        "created_by",
                                        "created_at",
                                        "field_last_updated",
                                        "field_date_created",
                                        "field_description",
                                        "field_assigned_to_id",
                                        "field_assigned_by_id",
                                        "field_served_or_unserved",
                                        "field_reappear",
                                        "hasFieldPrStatus"
                                    ].includes(key)
                            ).map((key) => {
                                const updatedKeyName = key.replace(/^field_/, "").replace(/_/g, " ").toLowerCase().replace(/^\w|\s\w/g, (c) => c.toUpperCase());

                                return {
                                    field: key,
                                    headerName: updatedKeyName || "",
                                    width: 250,
                                    resizable: true,
                                    renderHeader: () => (
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                                            <span style={{ color: "#1D2939", fontSize: "15px", fontWeight: "500" }}>
                                                {updatedKeyName || "-"}
                                            </span>
                                        </div>
                                    ),
                                    renderCell: (params) => {
                                        if (key === "field_mobile_no") {
                                            const userPermissions = JSON.parse(localStorage.getItem("user_permissions")) || [];
                                            // const canEdit = userPermissions[0]?.action_edit;
                                            const isViewAction = options.is_view_action === true;
                                            let isActionPlan = false;

                                            if (params.row.sys_status === "IO" && params.row.supervisior_designation_id != localStorage.getItem("designation_id")) {
                                                isActionPlan = true;
                                            } else if (
                                                (params.row.sys_status === "IO" || params.row.sys_status === "ui_case") &&
                                                params.row.field_submit_status === "" &&
                                                params.row.supervisior_designation_id == localStorage.getItem("designation_id")
                                            ) {
                                                isActionPlan = false;
                                            } else if (params.row.field_submit_status === "submit" || params.row.sys_status === "IO") {
                                                isActionPlan = true;
                                            }

                                            const isEditAllowed = canEditRef.current;

                                            // if (isSPCCD) {
                                            //     isEditAllowed = !hasSpSubmitted && ((canEdit && !isViewAction && !isActionPlan) || isSPDivision) && !hasRejectSubmitted;
                                            // } else {
                                            //     isEditAllowed = ((canEdit && !isViewAction && !isActionPlan) || isSPDivision) && !hasRejectSubmitted;
                                            // }

                                            return (
                                                <span
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleOthersTemplateDataView(params.row, false, options.table, !isEditAllowed);
                                                    }}
                                                    style={{
                                                        color: "#2563eb",
                                                        textDecoration: "underline",
                                                        cursor: "pointer",
                                                        fontWeight: 400,
                                                        fontSize: "14px",
                                                    }}
                                                >
                                                    {params.value || "View"}
                                                </span>
                                            );
                                        }

                                        return tableCellRender(key, params, params.value);
                                    }
                                };
                            }),
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
        if (selectedOtherTemplate?.table === "cid_ui_case_cdr_ipdr") {
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
            const userRole = localStorage.getItem("role_title");

            const normalize = (str) => str?.trim().replace(/^"+|"+$/g, '').replace(/\s+/g, ' ').toLowerCase();


            const normalizedRole = normalize(userRole);

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
                const userDesignationId = (localStorage.getItem("designation_name") || "").toUpperCase();

                // if (normalizedRole === "investigation officer") {
                //     // IO: Only show 3 fields
                //     const filteredFields = getCaseIdFields.filter(
                //         f =>
                //             f.name === "field_to_date" ||
                //             f.name === "field_from_date" ||
                //             f.name === "field_mobile_no"
                //     );
                //     setOptionFormTemplateData(filteredFields);
                // }  else {
                //     setOptionFormTemplateData(getCaseIdFields ? getCaseIdFields : []);
                // }

                const filteredFields = getCaseIdFields.filter(
                    f =>
                        f.name === "field_to_date" ||
                        f.name === "field_from_date" ||
                        f.name === "field_mobile_no"
                );
                setOptionFormTemplateData(filteredFields);
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

                setOtherFormOpen(true);
                setOtherInitialTemplateData(initialData);
                setviewReadonly(false);
                setEditTemplateData(false);
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

    const handleSubmitAp = async ({ id }) => {
        const user_divisio_id = localStorage.getItem("division_id") || null;
        const user_designation_id = localStorage.getItem("designation_id") || null;

        if (!id || id.length === 0) {
            toast.error("Please select at least one record to submit.", {
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
        var result;
        if (isImmediateSupervisior) {
            result = await Swal.fire({
                title: 'Are you sure?',
                text: "Do you want to submit this CDR/IPDR? Once submitted, you won't be able to Update the record.",
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Yes, submit it!',
                cancelButtonText: 'Cancel',
            });
        } else {
            result = await Swal.fire({
                title: 'Are you sure?',
                text: "Do you want to submit this CDR/IPDR? Once submitted, you won't be able to Update the record.",
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Yes, submit it!',
                cancelButtonText: 'Cancel',
            });
        }

        if (result.isConfirmed) {
            try {
                setLoading(true);
                // Get all records for this case in cid_ui_case_cdr_ipdr
                const getAllRecordsPayload = {
                    table_name: "cid_ui_case_cdr_ipdr",
                    ui_case_id: selectedRowData?.id
                };
                const getAllRecordsRes = await api.post("/templateData/getTemplateData", getAllRecordsPayload);

                if (getAllRecordsRes && getAllRecordsRes.success && Array.isArray(getAllRecordsRes.data)) {
                    // Update sys_status to IO for all records
                    for (const row of getAllRecordsRes.data) {
                        const updateStatusForm = new FormData();
                        updateStatusForm.append("table_name", "cid_ui_case_cdr_ipdr");
                        updateStatusForm.append("id", row.id);
                        updateStatusForm.append("data", JSON.stringify({ field_done_by: 'IO', field_need_to_do_by: 'SP' }));
                        await api.post("/templateData/updateTemplateData", updateStatusForm);
                    }
                }

                toast.success("The Action Plan has been submitted", {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    className: "toast-success",
                    onOpen: () => {
                        handleOtherTemplateActions(selectedOtherTemplate, selectedRow);
                    },
                });
                setShowSubmitAPButton(true);
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


    const otherTemplateSaveFunc = async (data, saveNewAction) => {

        if ((!selectedOtherTemplate.table || selectedOtherTemplate.table === "")) {
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

        var normalData = {}; // Non-file upload fields

        optionFormTemplateData.forEach((field) => {
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
        // Determine sys_status based on user role/designation
        const userRole = (localStorage.getItem("role_title") || "").trim().toLowerCase();
        const userDesignationId = localStorage.getItem("designation_id");
        // Fix: Remove quotes for comparison
        const isIO = userRole.replace(/['"]+/g, '').trim() === "investigation officer";
        // normalData.sys_status = isIO ? "IO" : (isImmediateSupervisior ? "SP" : "ui_case");
        normalData.sys_status = "ui_case";
        normalData.field_submit_status = "";

        normalData["ui_case_id"] = selectedRowData.id;

        var othersData = {};


        formData.append("table_name", selectedOtherTemplate.table);
        formData.append("data", JSON.stringify(normalData));
        formData.append("others_data", JSON.stringify(othersData));
        formData.append("transaction_id", randomApprovalId);
        formData.append("user_designation_id", localStorage.getItem('designation_id') ? localStorage.getItem('designation_id') : null);

        setLoading(true);

        try {
            const overallSaveData = await api.post("/templateData/saveDataWithApprovalToTemplates", formData);

            setLoading(false);

            if (overallSaveData && overallSaveData.success) {

                toast.success(overallSaveData.message ? overallSaveData.message : "Case Updated Successfully", {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    className: "toast-success",
                });

                if (saveNewAction) {
                    await handleOtherTemplateActions(selectedOtherTemplate, selectedRow);
                    showOptionTemplate('cid_ui_case_cdr_ipdr');
                } else {
                    handleOtherTemplateActions(selectedOtherTemplate, selectedRow);
                }

                setOtherFormOpen(false);

                if (selectedOtherTemplate?.field) {
                    var combinedData = {
                        id: selectedRowData.id,
                        [selectKey.name]: selectedOtherFields.code,
                    };

                    // update func
                    onUpdateTemplateData(combinedData);

                    setSelectKey(null);
                    setSelectedRow(null);
                    setSelectedOtherFields(null);
                    setselectedOtherTemplate(null);
                } else {
                    return;
                }

            } else {
                const errorMessage = overallSaveData.message ? overallSaveData.message : "Failed to change the status. Please try again.";
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

                            formData.append("folder_attachment_ids", JSON.stringify(folderInfo));
                        }
                    } else {
                        formData.append(field.name, data[field.name]);
                    }
                } else {
                    normalData[field.name] = Array.isArray(data[field.name]) ? data[field.name].join(",") : data[field.name]
                }
            }
        });
        normalData.sys_status = "ui_case";
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


    const handleApproveAndSendToSPCCD = async ({ id }) => {
        const user_divisio_id = localStorage.getItem("division_id") || null;
        const user_designation_id = localStorage.getItem("designation_id") || null;

        if (!id || id.length === 0) {
            toast.error("Please select at least one record to submit.", {
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
        var result;
        if (isImmediateSupervisior) {
            result = await Swal.fire({
                title: 'Are you sure?',
                text: "Do you want to Approve and Send To SP CCD ? Once submitted, you won't be able to Update the record. It will be move to the CDR CELL.",
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Yes, submit it!',
                cancelButtonText: 'Cancel',
            });
        } else {
            result = await Swal.fire({
                title: 'Are you sure?',
                text: "Do you want to submit this Approve and Send To SP CCD? Once submitted, you won't be able to Update the record.",
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Yes, submit it!',
                cancelButtonText: 'Cancel',
            });
        }

        if (result.isConfirmed) {
            try {
                setLoading(true);
                const getAllRecordsPayload = {
                    table_name: "cid_ui_case_cdr_ipdr",
                    ui_case_id: selectedRowData?.id
                };
                const getAllRecordsRes = await api.post("/templateData/getTemplateData", getAllRecordsPayload);

                if (getAllRecordsRes && getAllRecordsRes.success && Array.isArray(getAllRecordsRes.data)) {
                    for (const row of getAllRecordsRes.data) {
                        const updateStatusForm = new FormData();
                        updateStatusForm.append("table_name", "cid_ui_case_cdr_ipdr");
                        updateStatusForm.append("id", row.id);
                        updateStatusForm.append("data", JSON.stringify({ field_done_by: 'SP', field_need_to_do_by: 'SPCCD CDR' }));
                        await api.post("/templateData/updateTemplateData", updateStatusForm);
                    }
                }

                toast.success("The Approve and Send to SP CCD has been submitted", {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    className: "toast-success",
                    onOpen: () => {
                        handleOtherTemplateActions(selectedOtherTemplate, selectedRow);
                    },
                });
                setShowSubmitAPButton(true);
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

    const handleCDR = async ({ id }) => {
        const user_divisio_id = localStorage.getItem("division_id") || null;
        const user_designation_id = localStorage.getItem("designation_id") || null;

        if (!id || id.length === 0) {
            toast.error("Please select at least one record to submit.", {
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
        let result;
        if (isImmediateSupervisior) {
            result = await Swal.fire({
                title: 'Are you sure?',
                text: "Do you want to Return this to Review? Once submitted, for IO it will get the Access to Edit.",
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Yes, submit it!',
                cancelButtonText: 'Cancel',
            });
        } else {
            result = await Swal.fire({
                title: 'Are you sure?',
                text: "Do you want to Return this to Review? Once submitted, for IO it will get the Access to Edit.",
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Yes, submit it!',
                cancelButtonText: 'Cancel',
            });
        }

        if (result.isConfirmed) {
            try {
                setLoading(true);
                const getAllRecordsPayload = {
                    table_name: "cid_ui_case_cdr_ipdr",
                    ui_case_id: selectedRowData?.id
                };
                const getAllRecordsRes = await api.post("/templateData/getTemplateData", getAllRecordsPayload);

                if (getAllRecordsRes && getAllRecordsRes.success && Array.isArray(getAllRecordsRes.data)) {
                    for (const row of getAllRecordsRes.data) {
                        const updateStatusForm = new FormData();
                        updateStatusForm.append("table_name", "cid_ui_case_cdr_ipdr");
                        updateStatusForm.append("id", row.id);
                        updateStatusForm.append("data", JSON.stringify({ field_done_by: 'SPCCD CDR', field_need_to_do_by: 'CDR' }));
                        await api.post("/templateData/updateTemplateData", updateStatusForm);
                    }
                }

                toast.success("The CDR/IPDR has been sent to Review", {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    className: "toast-success",
                    onOpen: () => {
                        handleOtherTemplateActions(selectedOtherTemplate, selectedRow);
                    },
                });
                setShowSubmitAPButton(true);
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



    const handleReturnForReview = async ({ id }) => {
        const user_divisio_id = localStorage.getItem("division_id") || null;
        const user_designation_id = localStorage.getItem("designation_id") || null;

        if (!id || id.length === 0) {
            toast.error("Please select at least one record to submit.", {
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
        var result;
        if (isImmediateSupervisior) {
            result = await Swal.fire({
                title: 'Are you sure?',
                text: "Do you want to Return this to Review? Once submitted, for IO it will get the Access to Edit.",
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Yes, submit it!',
                cancelButtonText: 'Cancel',
            });
        } else {
            result = await Swal.fire({
                title: 'Are you sure?',
                text: "Do you want to Return this to Review? Once submitted, for IO it will get the Access to Edit.",
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Yes, submit it!',
                cancelButtonText: 'Cancel',
            });
        }

        if (result.isConfirmed) {
            try {
                setLoading(true);
                const getAllRecordsPayload = {
                    table_name: "cid_ui_case_cdr_ipdr",
                    ui_case_id: selectedRowData?.id
                };
                const getAllRecordsRes = await api.post("/templateData/getTemplateData", getAllRecordsPayload);

                if (getAllRecordsRes && getAllRecordsRes.success && Array.isArray(getAllRecordsRes.data)) {
                    for (const row of getAllRecordsRes.data) {
                        const updateStatusForm = new FormData();
                        updateStatusForm.append("table_name", "cid_ui_case_cdr_ipdr");
                        updateStatusForm.append("id", row.id);
                        updateStatusForm.append("data", JSON.stringify({ field_done_by: 'SPCCD CDR', field_need_to_do_by: 'IO' }));
                        await api.post("/templateData/updateTemplateData", updateStatusForm);
                    }
                }

                toast.success("The CDR/IPDR has been sent to Review", {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    className: "toast-success",
                    onOpen: () => {
                        handleOtherTemplateActions(selectedOtherTemplate, selectedRow);
                    },
                });
                setShowSubmitAPButton(true);
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



    const handleReject = async ({ id }) => {
        const user_divisio_id = localStorage.getItem("division_id") || null;
        const user_designation_id = localStorage.getItem("designation_id") || null;

        if (!id || id.length === 0) {


            toast.error("Please select at least one record to submit.", {
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
        var result;
        if (isImmediateSupervisior) {
            result = await Swal.fire({
                title: 'Are you sure?',
                text: "Do you want to Reject this CDR/IPDR? Once Rejected, you won't be able to Update the record.",
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Yes, submit it!',
                cancelButtonText: 'Cancel',
            });
        } else {
            result = await Swal.fire({
                title: 'Are you sure?',
                text: "Do you want to Reject this CDR/IPDR? Once Rejected, you won't be able to Update the record.",
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Yes, submit it!',
                cancelButtonText: 'Cancel',
            });
        }

        if (result.isConfirmed) {
            try {
                setLoading(true);
                const getAllRecordsPayload = {
                    table_name: "cid_ui_case_cdr_ipdr",
                    ui_case_id: selectedRowData?.id
                };
                const getAllRecordsRes = await api.post("/templateData/getTemplateData", getAllRecordsPayload);

                if (getAllRecordsRes && getAllRecordsRes.success && Array.isArray(getAllRecordsRes.data)) {
                    for (const row of getAllRecordsRes.data) {
                        const updateStatusForm = new FormData();
                        updateStatusForm.append("table_name", "cid_ui_case_cdr_ipdr");
                        updateStatusForm.append("id", row.id);
                        updateStatusForm.append("data", JSON.stringify({ field_done_by: 'SPCCD CDR', field_need_to_do_by: 'Rejected' }));
                        await api.post("/templateData/updateTemplateData", updateStatusForm);
                    }
                }

                toast.success("The CDR/IPDR has been Rejected", {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    className: "toast-success",
                    onOpen: () => {
                        handleOtherTemplateActions(selectedOtherTemplate, selectedRow);
                    },
                });
                setShowSubmitAPButton(true);
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

    const handleApproveAndSendToCDRCELL = async ({ id }) => {
        setCdrUpdateId(id);
        setCdrUpdateStatus("");
        setCdrUpdateFiles([]);
        setCdrUpdateDialogOpen(true);
    };

    const handleCDRDialogUpdate = async () => {
        if (!cdrUpdateId) return;
        setLoading(true);
        try {
            const getAllRowsPayload = {
                table_name: "cid_ui_case_cdr_ipdr",
                ui_case_id: cdrUpdateId
            };
            const getAllRowsRes = await api.post("/templateData/getTemplateData", getAllRowsPayload);

            if (getAllRowsRes && getAllRowsRes.success && Array.isArray(getAllRowsRes.data)) {
                for (const row of getAllRowsRes.data) {
                    const updateStatusForm = new FormData();
                    updateStatusForm.append("table_name", "cid_ui_case_cdr_ipdr");
                    updateStatusForm.append("id", row.id);

                    const dataObj = { field_done_by: 'CDR', field_need_to_do_by: 'Completed' };
                    if (cdrUpdateStatus) {
                        dataObj.field_status_update = cdrUpdateStatus;
                    }
                    updateStatusForm.append("data", JSON.stringify(dataObj));

                    if (cdrUpdateFiles && cdrUpdateFiles.length > 0) {
                        let filteredFileArray = [];
                        let hasFileInstance = false;
                        if (Array.isArray(cdrUpdateFiles)) {
                            hasFileInstance = cdrUpdateFiles.some(file => file instanceof File);
                            filteredFileArray = cdrUpdateFiles.filter(file => file instanceof File);
                            for (const file of filteredFileArray) {
                                updateStatusForm.append("field_upload_the_cdr_copy", file);
                            }
                            if (hasFileInstance) {
                                const folderInfo = filteredFileArray.map(file => ({
                                    filename: file.name,
                                }));
                                updateStatusForm.append("folder_attachment_ids", JSON.stringify(folderInfo));
                            }
                        }
                    }

                    updateStatusForm.append("transaction_id", randomApprovalId);
                    updateStatusForm.append("user_designation_id", localStorage.getItem("designation_id") || null);

                    await api.post("/templateData/updateTemplateData", updateStatusForm);
                }
            }

            toast.success("The CDR Copy and Status has been Updated", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                className: "toast-success",
            });

            await handleOtherTemplateActions(selectedOtherTemplate, selectedRow);
            setShowSubmitAPButton(true);
            setCdrUpdateDialogOpen(false);
        } catch (error) {
            toast.error("Submission failed. Please try again.", {
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
    };


    useEffect(() => {
        // Only run when allData is loaded and has at least one record
        if (!Array.isArray(allData) || allData.length === 0) {
            setCanAdd(true);
            setCanEdit(true);
            setCanDeletePermission(true);
            setCanSubmit(true);
            setShowApproveAndSend(false);
            setShowSubmitMenu(false);
            setShowStatusUpdate(false);
            return;
        }

        const field_done_by = allData?.[0]?.field_done_by || "";
        const field_need_to_do_by = allData?.[0]?.field_need_to_do_by || "";

        let _canAdd = false;
        let _canEdit = false;
        let _canDeletePermission = false;
        let _canSubmit = false;
        let _showApproveAndSend = false;
        let _showSubmitMenu = false;
        let _showStatusUpdate = false;

        // If need_to_do_by is IO, treat as initial state (IO can add/edit/delete/submit)
        if (
            (field_done_by === "" || field_done_by === null) &&
            (field_need_to_do_by === "" || field_need_to_do_by === null)
        ) {
            if (isIO) {
                _canAdd = true;
                _canEdit = true;
                _canDeletePermission = true;
                _canSubmit = true;
            }
        } else if (field_need_to_do_by === "IO") {
            // Restart: IO can add/edit/delete/submit again
            if (isIO) {
                _canAdd = true;
                _canEdit = true;
                _canDeletePermission = true;
                _canSubmit = true;
            }
        } else if (field_done_by === "IO" && field_need_to_do_by === "SP") {
            if (isIO) {
                _canAdd = false;
                _canEdit = false;
                _canDeletePermission = false;
                _canSubmit = false;
            }
            if (isSPDivision) {
                _canAdd = false;
                _canEdit = true;
                _canDeletePermission = true;
                _canSubmit = false;
                _showApproveAndSend = true;
            }
        }
        // SP & SPCCD CDR
        else if (field_done_by === "SP" && field_need_to_do_by === "SPCCD CDR") {
            if (isSPDivision) {
                _canAdd = false;
                _canEdit = false;
                _canDeletePermission = false;
                _canSubmit = false;
            }
            if (isSPCCD) {
                _canAdd = false;
                _canEdit = false;
                _canDeletePermission = false;
                _canSubmit = false;
                _showSubmitMenu = true;

                console.log("SPCCD CDR Stepper Render: _canDeletePermission:", _canDeletePermission,);
            }
        }
        else if (isSPCCD) {
            _canAdd = false;
            _canEdit = false;
            _canDeletePermission = false;
            _canSubmit = false;

            console.log("SPCCD CDR Stepper Render: _canDeletePermission:", _canDeletePermission,);
        }
        // SPCCD CDR & CDR
        else if (field_done_by === "SPCCD CDR" && field_need_to_do_by === "CDR") {
            if (isCDR) {
                _canAdd = false;
                _canEdit = false;
                _canDeletePermission = false;
                _canSubmit = false;
                _showStatusUpdate = true;
            }
        }
        // SPCCD CDR & IO (restart)
        else if (field_done_by === "SPCCD CDR" && field_need_to_do_by === "IO") {
            _canAdd = false;
            _canEdit = false;
            _canDeletePermission = false;
            _canSubmit = false;
        }
        // SPCCD CDR & Reject
        else if (field_done_by === "SPCCD CDR" && (field_need_to_do_by === "Reject" || field_need_to_do_by === "Rejected")) {
            _canAdd = false;
            _canEdit = false;
            _canDeletePermission = false;
            _canSubmit = false;
        }

        setCanAdd(_canAdd);
        setCanEdit(_canEdit);
        setCanDeletePermission(_canDeletePermission);
        setCanSubmit(_canSubmit);
        setShowApproveAndSend(_showApproveAndSend);
        setShowSubmitMenu(_showSubmitMenu);
        setShowStatusUpdate(_showStatusUpdate);
        canEditRef.current = _canEdit;
        canDeletePermissionRef.current = _canDeletePermission;

    }, [allData, isIO, isSPDivision, isSPCCD, isCDR]);

    return (
        <>
            <Box sx={{ overflow: 'auto', height: '100vh' }}>
                {
                    <Box sx={{ display: "flex", justifyContent: 'center', alignItems: 'center', my: 2 }}>
                        {['IO', 'SP', 'SPCCD', 'CDR'].map((step, index) => {
                            var selected = false;
                            var roleTitle = JSON.parse(localStorage.getItem("role_title")) || "";
                            var designationName = localStorage.getItem("designation_name") || "";
                            var stepperValue = "";

                            if (roleTitle.toLowerCase() === "investigation officer") {
                                stepperValue = "io";
                            } else {
                                var splitingValue = designationName.split(" ");
                                if (splitingValue?.[0]) {
                                    stepperValue = splitingValue[0].toLowerCase();
                                }
                            }

                            var alreadySubmited = false;
                            var nextStageStep = false;
                            var rejectSubmitted = false;

                            let sysStatus = allData[0]?.sys_status;
                            let fieldSubmitStatus = allData[0]?.field_done_by;
                            let fieldNeedToStatus = allData[0]?.field_need_to_do_by;
                            let stepLower = step.toLowerCase();

                            let statusLabel = "Not Assigned";
                            let statusClass = "submissionNotAssigned";


                            // Restart: If need_to_do_by is IO, treat as initial state (IO can add/edit/delete/submit)
                            if (fieldNeedToStatus === "IO") {
                                if (stepLower === "io") {
                                    nextStageStep = true;
                                    statusLabel = "Pending";
                                    statusClass = "submissionPending";
                                } else {
                                    alreadySubmited = false;
                                    statusLabel = "Not Assigned";
                                    statusClass = "submissionNotAssigned";
                                }
                            }
                            // SPCCD CDR & Reject: Show SPCCD as Rejected in Red color
                            else if (
                                (fieldSubmitStatus === "SPCCD CDR" && (String(fieldNeedToStatus).toLowerCase() === "reject" || String(fieldNeedToStatus).toLowerCase() === "rejected")) ||
                                (String(fieldSubmitStatus).toLowerCase() === "rejected" && stepLower === "spccd")
                            ) {
                                if (stepLower === "spccd") {
                                    alreadySubmited = false;
                                    rejectSubmitted = true;
                                    statusLabel = "Rejected";
                                    statusClass = "submissionRejected";
                                } else if (stepLower === "io" || stepLower === "sp") {
                                    alreadySubmited = true;
                                    statusLabel = "Submitted";
                                    statusClass = "submissionCompleted";
                                } else {
                                    alreadySubmited = false;
                                    statusLabel = "Not Assigned";
                                    statusClass = "submissionNotAssigned";
                                }
                            }
                            // Normal flow
                            else {
                                // Mark IO as submitted if sys_status is IO or field_submit_status is IO
                                if (
                                    (fieldSubmitStatus === "IO" || fieldSubmitStatus === 'SP' || fieldSubmitStatus === 'SPCCD CDR' || fieldSubmitStatus === 'CDR' || fieldSubmitStatus === 'Rejected' || fieldSubmitStatus === 'Completed') &&
                                    stepLower === "io"
                                ) {
                                    alreadySubmited = true;
                                    statusLabel = "Submitted";
                                    statusClass = "submissionCompleted";
                                }
                                if (
                                    (fieldSubmitStatus === 'SP' || fieldSubmitStatus === 'SPCCD CDR' || fieldSubmitStatus === 'CDR' || fieldSubmitStatus === 'Rejected' || fieldSubmitStatus === 'Completed') &&
                                    stepLower === "sp"
                                ) {
                                    alreadySubmited = true;
                                    statusLabel = "Submitted";
                                    statusClass = "submissionCompleted";
                                }
                                if (
                                    (fieldSubmitStatus === 'SPCCD CDR' || fieldSubmitStatus === 'CDR' || fieldSubmitStatus === 'Rejected' || fieldSubmitStatus === 'Completed') &&
                                    stepLower === "spccd"
                                ) {
                                    alreadySubmited = true;
                                    statusLabel = "Submitted";
                                    statusClass = "submissionCompleted";
                                }
                                if (
                                    fieldSubmitStatus === 'CDR' &&
                                    stepLower === "cdr"
                                ) {
                                    alreadySubmited = true;
                                    statusLabel = "Submitted";
                                    statusClass = "submissionCompleted";
                                }

                                // Next stage logic
                                if (
                                    (fieldSubmitStatus === "" || fieldSubmitStatus === null) &&
                                    stepLower === "io"
                                ) {
                                    nextStageStep = true;
                                    statusLabel = "Pending";
                                    statusClass = "submissionPending";
                                }
                                if (
                                    fieldSubmitStatus === "IO" &&
                                    stepLower === "sp"
                                ) {
                                    nextStageStep = true;
                                    statusLabel = "Pending";
                                    statusClass = "submissionPending";
                                }
                                if (
                                    fieldSubmitStatus === "SP" &&
                                    stepLower === "spccd"
                                ) {
                                    nextStageStep = true;
                                    statusLabel = "Pending";
                                    statusClass = "submissionPending";
                                }
                                if (
                                    fieldSubmitStatus === "SPCCD CDR" &&
                                    stepLower === "cdr"
                                ) {
                                    nextStageStep = true;
                                    statusLabel = "Pending";
                                    statusClass = "submissionPending";
                                }

                                const lastApprovedRole = approvalFieldArray[0];
                                const lastApprovedIndex = approvalStepperArray.indexOf(lastApprovedRole);

                                const approvedStages = approvalStepperArray.slice(0, lastApprovedIndex + 1);

                                const nextStepIndex = lastApprovedIndex + 1;
                                const nextStep = approvalStepperArray[nextStepIndex];

                                // Fix: If IO is submitted (sys_status or field_submit_status is IO), show as Submitted
                                if (
                                    (stepLower === "io" && (sysStatus === "IO" || fieldSubmitStatus === "IO")) ||
                                    approvedStages.includes(step)
                                ) {
                                    alreadySubmited = true;
                                    statusLabel = "Submitted";
                                    statusClass = "submissionCompleted";
                                } else if (step === nextStep) {
                                    nextStageStep = true;
                                    statusLabel = "Pending";
                                    statusClass = "submissionPending";
                                } else if (selected) {
                                    statusLabel = "In Progress";
                                    statusClass = "submissionInProgress";
                                }
                            }

                            if (step.toLowerCase() === stepperValue) {
                                selected = true;
                            }

                            var StepperTitle = "";
                            switch (step.toLowerCase()) {
                                case "io":
                                    StepperTitle = "Investigation Officer";
                                    break;
                                case "sp":
                                    StepperTitle = "Superintendent of Police";
                                    break;
                                case "spccd":
                                    StepperTitle = "SP CCD";
                                    break;
                                case "cdr":
                                    StepperTitle = "CDR CELL";
                                    break;
                                default:
                                    StepperTitle = "";
                                    break;
                            }

                            // Assign label properly
                            let label = "";
                            switch (step.toLowerCase()) {
                                case "io":
                                    label = "IO";
                                    break;
                                case "sp":
                                    label = "SP";
                                    break;
                                case "spccd":
                                    label = "SP CCD";
                                    break;
                                case "cdr":
                                    label = "CDR CELL";
                                    break;
                                default:
                                    label = step;
                                    break;
                            }


                            return (
                                <React.Fragment key={step}>
                                    <Button
                                        variant="contained"
                                        sx={() => {
                                            var backgroundColor = "#f0f0f0";
                                            var color = "#333";
                                            var boxShadow = "0 2px 6px rgba(0, 0, 0, 0.1)";

                                            if (alreadySubmited) {
                                                backgroundColor = "#27ae60";
                                                color = "#fff";
                                                boxShadow = "0 0 0 5px #d4f7e8";
                                            } else if (nextStageStep) {
                                                backgroundColor = "#ffd230";
                                                color = "#333";
                                                boxShadow = "0 0 0 5px #fff4cc ";
                                            } else if (selected) {
                                                backgroundColor = "#1570ef";
                                                color = "#fff";
                                                boxShadow = "0 0 0 5px #dcebff ";
                                            } else if (rejectSubmitted) {
                                                backgroundColor = "#e74c3c";
                                                color = "#fff";
                                                boxShadow = "0 0 0 5px #f8d7da";
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
                                        {label}
                                    </Button>
                                    <Box px={2}>
                                        <div className="investigationStepperTitle" style={{ marginBottom: '4px' }}>
                                            {StepperTitle}
                                        </div>
                                        <div className={`stepperCompletedPercentage ${statusClass}`}>
                                            {statusLabel}
                                        </div>
                                    </Box>
                                    {index < 3 && (
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

                <Box pb={1} px={2} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', }}>
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
                                mt: 2,
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

                                {APIsSubmited && !isImmediateSupervisior && (
                                    <Box className="notifyAtTopCaseStyle">
                                        Submission request in progress. Awaiting SP approval.
                                    </Box>
                                )}
                            </Box>

                            {/* Actions Section */}
                            <Box sx={{ display: 'flex', alignItems: 'center', marginRight: '16px' }}>
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
                                                width: '350px',
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

                                    {/* IO: Only show Add button if not submitted (showSubmitAPButton === false) */}
                                    {canAdd && !viewModeOnly && templateActionAddFlag.current && (
                                        <Button
                                            variant="outlined"
                                            sx={{ height: '40px' }}
                                            onClick={() => showOptionTemplate('cid_ui_case_cdr_ipdr')}
                                        >
                                            Add
                                        </Button>
                                    )}

                                    {/* IO: Only show Submit button if not submitted and at least one record exists */}
                                    {canSubmit && isIO && otherTemplatesTotalRecord > 0 && (
                                        <Button
                                            variant="contained"
                                            color="success"
                                            onClick={() => handleSubmitAp({ id: selectedRowData?.id })}
                                            disabled={otherTemplatesTotalRecord === 0}
                                        >
                                            Submit
                                        </Button>
                                    )}

                                    {/* IO: Hide Add/Submit/Edit/Delete after submit (showSubmitAPButton === true) */}
                                    {isIO && showSubmitAPButton && (
                                        null
                                    )}

                                    {/* SPDivision: Approve and Send to SPCCD, allow edit */}
                                    {showApproveAndSend && (
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={() => handleApproveAndSendToSPCCD({ id: selectedRowData?.id })}
                                            disabled={otherTemplatesTotalRecord === 0}
                                        >
                                            Approve and Send to SPCCD
                                        </Button>
                                    )}

                                    {/* SPCCD: Show Approve and Send to CDRCELL, Return for Review, Reject */}
                                    {showSubmitMenu && (
                                        <Box sx={{ position: "relative" }}>
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                id="approve-dropdown-btn"
                                                aria-controls="approve-dropdown-menu"
                                                aria-haspopup="true"
                                                onClick={(e) => setApproveDropdownAnchorEl(e.currentTarget)}
                                                disabled={otherTemplatesTotalRecord === 0}
                                            >
                                                Submit
                                            </Button>
                                            <Menu
                                                id="approve-dropdown-menu"
                                                anchorEl={approveDropdownAnchorEl}
                                                open={Boolean(approveDropdownAnchorEl)}
                                                onClose={() => setApproveDropdownAnchorEl(null)}
                                                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                                                transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                                            >
                                                <MenuItem
                                                    onClick={() => {
                                                        handleCDR({ id: selectedRowData?.id });
                                                        setApproveDropdownAnchorEl(null);
                                                    }}
                                                    disabled={otherTemplatesTotalRecord === 0}
                                                >
                                                    Approve and Send to CDRCELL
                                                </MenuItem>
                                                <MenuItem
                                                    onClick={() => {
                                                        setApproveDropdownAnchorEl(null);
                                                        handleReturnForReview({ id: selectedRowData?.id });
                                                    }}
                                                    disabled={otherTemplatesTotalRecord === 0}
                                                >
                                                    Return for Review
                                                </MenuItem>
                                                <MenuItem
                                                    onClick={() => {
                                                        setApproveDropdownAnchorEl(null);
                                                        handleReject({ id: selectedRowData?.id });
                                                    }}
                                                    disabled={otherTemplatesTotalRecord === 0}
                                                >
                                                    Reject
                                                </MenuItem>
                                            </Menu>
                                        </Box>
                                    )}

                                    {/* CDR: Status Update */}
                                    {showStatusUpdate && (
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={() => handleApproveAndSendToCDRCELL({ id: selectedRowData?.id })}
                                            disabled={otherTemplatesTotalRecord === 0}
                                        >
                                            Status Update
                                        </Button>
                                    )}
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
                                    onSubmit={otherTemplateSaveFunc}
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

            {/* Replace NormalViewForm for CDR update with custom dialog */}
            {cdrUpdateDialogOpen && (
                <Dialog
                    open={cdrUpdateDialogOpen}
                    onClose={() => setCdrUpdateDialogOpen(false)}
                    aria-labelledby="cdr-update-dialog-title"
                    maxWidth="sm"
                    fullWidth
                >
                    <DialogTitle id="cdr-update-dialog-title">
                        Status Update and Upload CDR Copy
                    </DialogTitle>
                    <DialogContent>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 1 }}>
                            {/* Status Update Label + Dropdown */}
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
                                    Status Update
                                </Typography>
                                <Autocomplete
                                    options={cdrUpdateStatusOptions}
                                    value={cdrUpdateStatusOptions.find(opt => opt.value === cdrUpdateStatus) || null}
                                    onChange={(_, val) => setCdrUpdateStatus(val ? val.value : "")}
                                    getOptionLabel={option => option.label || ""}
                                    isOptionEqualToValue={(option, value) => option.value === value.value}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            placeholder="Select status"
                                            fullWidth
                                        />
                                    )}
                                    sx={{ minWidth: 200 }}
                                />
                            </Box>

                            {/* Upload Label + Button + File Previews */}
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
                                    Upload CDR Copy
                                </Typography>

                                <Tooltip title="Upload CDR Copy">
                                    <Button
                                        variant="outlined"
                                        component="label"
                                        startIcon={<Add />}
                                        sx={{
                                            minWidth: 220,
                                            maxWidth: 220,
                                            whiteSpace: "nowrap",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis"
                                        }}
                                    >
                                        Upload CDR Copy
                                        <input
                                            type="file"
                                            hidden
                                            multiple
                                            onChange={e => setCdrUpdateFiles(Array.from(e.target.files))}
                                        />
                                    </Button>
                                </Tooltip>

                                {cdrUpdateFiles && cdrUpdateFiles.length > 0 && (
                                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 1 }}>
                                        {cdrUpdateFiles.map((file, idx) => (
                                            <Tooltip key={idx} title={file.name}>
                                                <Box
                                                    sx={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 0.5,
                                                        cursor: "pointer",
                                                        border: "1px solid #e0e0e0",
                                                        borderRadius: "4px",
                                                        px: 1,
                                                        py: 0.5,
                                                        bgcolor: "#f9f9f9",
                                                        width: "fit-content"
                                                    }}
                                                    onClick={() => {
                                                        const url = URL.createObjectURL(file);
                                                        window.open(url, "_blank", "noopener,noreferrer");
                                                    }}
                                                >
                                                    <Box sx={{ color: "#1976d2" }}>
                                                        <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zm1 7V3.5L20.5 9z" />
                                                        </svg>
                                                    </Box>
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            fontSize: 13,
                                                            maxWidth: 200,
                                                            whiteSpace: "nowrap",
                                                            overflow: "hidden",
                                                            textOverflow: "ellipsis"
                                                        }}
                                                    >
                                                        {file.name}
                                                    </Typography>
                                                </Box>
                                            </Tooltip>
                                        ))}
                                    </Box>
                                )}
                            </Box>
                        </Box>
                    </DialogContent>

                    <DialogActions>
                        <Button onClick={() => setCdrUpdateDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleCDRDialogUpdate}
                            disabled={loading}
                        >
                            Update
                        </Button>
                    </DialogActions>
                </Dialog>
            )}
        </>
    )
};

export default CDR;
