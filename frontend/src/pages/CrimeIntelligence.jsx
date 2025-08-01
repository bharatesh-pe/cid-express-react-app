import React, { useEffect, useRef, useState } from "react";
import {
    Box,
    CircularProgress,
    Collapse,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Paper,
    Tooltip,
    Typography,
    Chip,
    Button,
    IconButton,
    InputAdornment,
    Stack,
} from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import DashboardCustomizeIcon from '@mui/icons-material/DashboardCustomize';
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from '@mui/icons-material/Delete';
import TextFieldInput from "@mui/material/TextField";
import NormalViewForm from "../components/dynamic-form/NormalViewForm";
import TableView from "../components/table-view/TableView";
import api from "../services/api";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from 'sweetalert2';

const CrimeIntelligence = () => {
    const [investigationItems, setInvestigationItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [openInvestigation, setOpenInvestigation] = useState(true);
    const [activeSidebar, setActiveSidebar] = useState(null);

    // Table and form states
    const [tableViewFlag, setTableViewFlag] = useState(false);
    const [tableColumnData, setTableColumnData] = useState([{ field: 'sl_no', headerName: 'Sl. No.' }]);
    const [tableRowData, setTableRowData] = useState([]);
    const [tableSearchValue, setTableSearchValue] = useState("");
    const [tableTotalPage, setTableTotalPage] = useState(1);
    const [tableTotalRecord, setTableTotalRecord] = useState(0);
    const tablePaginationCount = useRef(1);

    // NormalViewForm states
    const [formOpen, setFormOpen] = useState(false);
    const [selectedRowId, setSelectedRowId] = useState(null);
    const [selectedTemplateId, setSelectedTemplateId] = useState(null);
    const [selectedTableName, setSelectedTableName] = useState(null);
    const [selectedTemplateName, setSelectedTemplateName] = useState(null);
    const [formFields, setFormFields] = useState([]);
    const [initalFormData, setInitialFormData] = useState({});
    const [formStepperData, setFormStepperData] = useState([]);
    const [readonlyForm, setReadonlyForm] = useState(null);
    const [editOnlyForm, setEditOnlyForm] = useState(null);

    // Fetch investigation sidebar items
    useEffect(() => {
        const fetchInvestigations = async () => {
            setLoading(true);
            try {
                const serverURL = process.env.REACT_APP_SERVER_URL;
                const token = localStorage.getItem("auth_token");
                const payloadObj = {
                    module: "ci_case",
                };
                const response = await fetch(`${serverURL}/action/get_actions`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        token,
                    },
                    body: JSON.stringify(payloadObj),
                });
                const data = await response.json();
                if (response.ok && data?.success && data?.data?.data) {
                    setInvestigationItems(data.data.data);
                    setActiveSidebar(data.data.data[0] || null);
                    if(data.data.data[0]){
                        getTableData(data.data.data[0]);
                    }
                } else {
                    setInvestigationItems([]);
                }
            } catch (err) {
                setInvestigationItems([]);
            } finally {
                setLoading(false);
            }
        };
        fetchInvestigations();
    }, []);

    // Table data fetch logic (like getTableData)
    const getTableData = async (options, noFilters) => {
        if (!options?.table) return;
        const getTemplatePayload = {
            table_name: options.table,
            limit: 10,
            page: tablePaginationCount.current,
            search: noFilters ? "" : tableSearchValue,
            // ...add other filters if needed...
            module: "ci_case",
            tab: "investigation"
        };
        setLoading(true);
        try {
            const getTemplateResponse = await api.post("/templateData/getTemplateData", getTemplatePayload);
            setLoading(false);
            if (getTemplateResponse && getTemplateResponse.success) {
                const { meta, data } = getTemplateResponse;
                setTableTotalPage(meta?.meta?.totalPages || 1);
                setTableTotalRecord(meta?.meta?.totalItems || 0);

                if (data?.length > 0) {
                    const excludedKeys = [
                        "created_at", "updated_at", "id", "deleted_at", "attachments",
                        "Starred", "ReadStatus", "linked_profile_info",
                        "ui_case_id", "pt_case_id", "sys_status", "task_unread_count"
                    ];
                    const generateReadableHeader = (key) => key.replace(/^field_/, "").replace(/_/g, " ").toLowerCase().replace(/^\w|\s\w/g, (c) => c.toUpperCase());
                    const updatedHeader = [
                        {
                            field: "sl_no",
                            headerName: "S.No",
                            resizable: false,
                            width: 65,
                        },
                        ...Object.keys(data[0]).filter((key) => !excludedKeys.includes(key))
                            .map((key, index) => ({
                                field: key,
                                headerName: generateReadableHeader(key),
                                width: generateReadableHeader(key).length < 15 ? 100 : 200,
                                resizable: true,
                            })),
                    ];
                    const updatedTableData = data.map((field, index) => ({
                        ...field,
                        sl_no: (tablePaginationCount.current - 1) * 10 + (index + 1),
                        ...(field.id ? {} : { id: "unique_id_" + index }),
                    }));
                    setTableColumnData(updatedHeader);
                    setTableRowData(updatedTableData);
                } else {
                    setTableColumnData([]);
                    setTableRowData([]);
                }
                setFormOpen(false);
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

    // Sidebar click handler
    const sidebarActive = (item) => {
        setActiveSidebar(item);
        setFormOpen(false);
        if (item?.viewAction) {
            setFormOpen(true);
            handleTemplateDataView(item);
        } else {
            setTableViewFlag(true);
            getTableData(item);
        }
    };

    // Handle row click for view (hyperlink)
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

    const handleActionDelete = async (row, options) => {
        if (!row?.id || !options?.table) {
            toast.error('Invalid Template ID', {
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
            text: "Do you want to delete this data?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel'
        });

        if (!result.isConfirmed) return;

        setLoading(true);
        try {
            const deleteTemplateData = {
                table_name: options.table,
                where: { id: row.id },
            };
            const deleteTemplateDataResponse = await api.post("templateData/deleteTemplateData", deleteTemplateData);
            setLoading(false);
            if (deleteTemplateDataResponse && deleteTemplateDataResponse.success) {
                toast.success(deleteTemplateDataResponse.message || "Template Deleted Successfully", {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    className: "toast-success",
                });
                getTableData(activeSidebar);
            } else {
                toast.error(deleteTemplateDataResponse.message || "Failed to delete the template. Please try again.", {
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

    // Add New Form logic (like showAddNewForm)
    const showAddNewForm = async () => {
        if (!activeSidebar?.table) {
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
            const viewTemplateResponse = await api.post("/templates/viewTemplate", viewTableData);
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
                const sections = viewTemplateResponse?.["data"]?.sections;
                const noOfSections = viewTemplateResponse?.["data"]?.no_of_sections;

                if (noOfSections && noOfSections > 0 && Array.isArray(sections)) {
                    setFormStepperData(sections);
                } else {
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
    };

    // Form submit logic
    const formSubmit = async (data, formOpen) => {
        if (!activeSidebar?.table || activeSidebar.table === "") {
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

        normalData.sys_status = "ci_case";
        formData.append("table_name", activeSidebar.table);
        formData.append("data", JSON.stringify(normalData));
        formData.append("transaction_id", `ci_${Date.now()}_${Math.floor(Math.random() * 10000)}`);
        formData.append("user_designation_id", localStorage.getItem('designation_id') || null);
        formData.append("others_data", JSON.stringify({}));

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
                        getTableData(activeSidebar, formOpen);
                    }
                });
                setFormOpen(false);
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

    // Form update logic
    const formCaseUpdate = async (data, formOpen) => {
        if (!activeSidebar?.table || activeSidebar.table === "") {
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

        normalData.sys_status = "ci_case";
        formData.append("table_name", activeSidebar.table);
        formData.append("data", JSON.stringify(normalData));
        formData.append("id", selectedRowId);
        formData.append("transaction_id", `ci_${Date.now()}_${Math.floor(Math.random() * 10000)}`);
        formData.append("user_designation_id", localStorage.getItem('designation_id') || null);
        formData.append("others_data", JSON.stringify({}));

        setLoading(true);

        try {
            const updateResponse = await api.post("/templateData/updateDataWithApprovalToTemplates", formData);
            setLoading(false);

            if (updateResponse && updateResponse.success) {
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
                        getTableData(activeSidebar, formOpen);
                    }
                });
                setFormOpen(false);
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

    // ...search, clear, pagination handlers (optional, similar to lokayuktaView)...

    return (
        <Stack direction="row" justifyContent="space-between">
            {/* Sidebar */}
            <Box
                sx={{
                    width: "280px",
                    minWidth: "280px",
                    height: "100vh",
                    borderRight: "1px solid #D0D5DD",
                    background: "#fff",
                }}
            >
                <Paper sx={{ height: "100vh", borderRadius: "0", boxShadow: "none" }}>
                    {/* Sidebar Header */}
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderBottom: "1px solid #D0D5DD",
                            height: "55.5px",
                            padding: "3px",
                        }}
                    >
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            Crime Intelligence
                        </Typography>
                    </Box>
                    <List sx={{ padding: "4px", height: "100vh", overflow: "auto" }}>
                        <Tooltip title={"Investigations"} arrow placement="right" key={"Investigations"}>
                            <ListItem
                                sx={{
                                    background: '#1F1DAC',
                                    color: '#FFFFFF',
                                    mt: 1,
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    overflow: 'hidden'
                                }}
                                onClick={() => setOpenInvestigation(!openInvestigation)}
                            >
                                <ListItemIcon sx={{ color: '#FFFFFF', minWidth: '35px' }}>
                                    <DashboardCustomizeIcon />
                                </ListItemIcon>
                                <ListItemText className="sidebarTextEllipsis" primary="Investigations" />
                                {openInvestigation ? <ExpandLess /> : <ExpandMore />}
                            </ListItem>
                        </Tooltip>
                        <Collapse in={openInvestigation} timeout="auto" unmountOnExit>
                            <List component="div" disablePadding className="sidebarChildContainer">
                                {loading ? (
                                    <ListItem>
                                        <CircularProgress size={24} />
                                    </ListItem>
                                ) : investigationItems.length > 0 ? (
                                    investigationItems.map((item, idx) => (
                                        <Tooltip title={item?.name} arrow placement="right" key={item?.name || idx}>
                                            <ListItem
                                                sx={{
                                                    cursor: "pointer",
                                                    borderRadius: '4px',
                                                    mb: 0.5,
                                                    fontWeight: activeSidebar?.name === item.name ? 600 : 400,
                                                }}
                                                className={`sidebarChildItem lokayuktaSidebarMenus menuColor_${idx + 2} ${activeSidebar?.name === item.name ? "active" : ""}`}
                                                onClick={() => sidebarActive(item)}
                                            >
                                                {item?.icon ? (
                                                    typeof item.icon === "function" ? (
                                                        item.icon()
                                                    ) : (
                                                    <span
                                                        className="tableActionIcon"
                                                        dangerouslySetInnerHTML={{ __html: item.icon }}
                                                    />
                                                    )
                                                ) : (
                                                    <span className="tableActionIcon" style={{ marginRight: 12 }}>
                                                        <svg width="24" height="24" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <circle cx="12" cy="12" r="12" fill="" />
                                                            <mask id={`mask0_${idx}`} style={{ maskType: 'alpha' }} maskUnits="userSpaceOnUse" x="4" y="4" width="16" height="16">
                                                                <rect x="4" y="4" width="16" height="16" fill="" />
                                                            </mask>
                                                            <g mask={`url(#mask0_${idx})`}>
                                                                <path d="M7.80523 17.2667C7.51045 17.2667 7.25812 17.1618 7.04823 16.9519C6.83834 16.742 6.7334 16.4897 6.7334 16.1949V7.80523C6.7334 7.51045 6.83834 7.25812 7.04823 7.04823C7.25812 6.83834 7.51045 6.7334 7.80523 6.7334H16.1949C16.4897 6.7334 16.742 6.83834 16.9519 7.04823C17.1618 7.25812 17.2667 7.51045 17.2667 7.80523V13.3629L13.3629 17.2667H7.80523ZM13.2001 16.4001L16.4001 13.2001H13.2001V16.4001ZM9.0949 13.0206H12.0001V12.1539H9.0949V13.0206ZM9.0949 10.6334H14.9052V9.76673H9.0949V10.6334Z" fill={activeSidebar?.name === item.name ? "#1F1DAC" : "#98A2B3"} />
                                                            </g>
                                                        </svg>
                                                    </span>
                                                )}
                                                <ListItemText primary={item?.name} />
                                            </ListItem>
                                        </Tooltip>
                                    ))
                                ) : (
                                    <ListItem sx={{ cursor: "pointer", textAlign: "center", pl: 4 }} className="lokayuktaSidebarMenus menuColor_2">
                                        <ListItemText primary="No Actions Found" />
                                    </ListItem>
                                )}
                            </List>
                        </Collapse>
                    </List>
                </Paper>
            </Box>
            {/* Main Content */}
            <Box flex={4} sx={{ overflow: "hidden" }}>
                {formOpen ? (
                    <Box sx={{ overflow: 'auto', height: '100vh', width: '100%' }}>
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
                            onUpdate={formCaseUpdate}
                            closeForm={() => setFormOpen(false)}
                        />
                    </Box>
                ) : (
                    <Box p={2}>
                        <Box pb={1} px={1} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                            <Typography
                                sx={{ fontSize: "19px", fontWeight: "500", color: "#171A1C", display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
                                className="Roboto"
                            >
                                {activeSidebar?.name ? activeSidebar.name : 'Form'}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
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
                                                    <IconButton sx={{ padding: "0 5px", borderRadius: "0" }}>
                                                        <FilterListIcon sx={{ color: "#475467" }} />
                                                    </IconButton>
                                                </Box>
                                            )
                                        }}
                                        onInput={(e) => setTableSearchValue(e.target.value)}
                                        value={tableSearchValue}
                                        id="tableSearch"
                                        size="small"
                                        placeholder='Search'
                                        variant="outlined"
                                        className="profileSearchClass"
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault();
                                                getTableData(activeSidebar);
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
                                </Box>
                                <Button
                                    onClick={showAddNewForm}
                                    sx={{ height: "38px", }}
                                    className="blueButton"
                                    startIcon={
                                        <AddIcon
                                            sx={{
                                                border: "1.3px solid #FFFFFF",
                                                borderRadius: "50%",
                                                background: "#4D4AF3 !important",
                                            }}
                                        />
                                    }
                                    variant="contained"
                                >
                                    Add New
                                </Button>
                            </Box>
                        </Box>
                        <Box sx={{ overflow: 'auto' }}>
                            <TableView
                                rows={tableRowData}
                                columns={
                                    tableColumnData.length > 0
                                        ? [
                                            {
                                                field: "sl_no",
                                                headerName: "S.No",
                                                resizable: false,
                                                width: 65,
                                                renderCell: (params) => (
                                                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "end", gap: "8px" }}>
                                                        {params.value}
                                                        <DeleteIcon
                                                            sx={{ cursor: "pointer", color: "red", fontSize: 20 }}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleActionDelete(params.row, activeSidebar);
                                                            }}
                                                        />
                                                    </Box>
                                                )
                                            },
                                            ...tableColumnData
                                                .filter(col => col.field !== "sl_no")
                                                .map((col, idx) => ({
                                                    ...col,
                                                    renderCell: (params) => {
                                                        // Hyperlink on first column
                                                        if (idx === 0) {
                                                            return (
                                                                <span
                                                                    style={{
                                                                        color: '#0167F8',
                                                                        textDecoration: 'underline',
                                                                        cursor: 'pointer'
                                                                    }}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleTemplateDataView(params.row, false, activeSidebar?.table);
                                                                    }}
                                                                >
                                                                    {params.value || "-"}
                                                                </span>
                                                            );
                                                        }
                                                        return params.value || "-";
                                                    }
                                                }))
                                        ]
                                        : []
                                }
                                totalPage={tableTotalPage}
                                totalRecord={tableTotalRecord}
                                paginationCount={tablePaginationCount.current}
                                handlePagination={(page) => {
                                    tablePaginationCount.current = page;
                                    getTableData(activeSidebar);
                                }}
                            />
                        </Box>
                    </Box>
                )}
                {loading && (
                    <div className="parent_spinner" tabIndex="-1" aria-hidden="true">
                        <CircularProgress size={100} />
                    </div>
                )}
            </Box>
        </Stack>
    );
};

export default CrimeIntelligence;
