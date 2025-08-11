import React, { useEffect, useRef, useState } from "react";

import { Box, Button,Grid, Chip, CircularProgress, IconButton, InputAdornment, Tooltip, Typography } from "@mui/material";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from '@mui/material';

import { West } from "@mui/icons-material";
import DeleteIcon from '@mui/icons-material/Delete';
import TextFieldInput from "@mui/material/TextField";
import AddIcon from "@mui/icons-material/Add";

import NormalViewForm from "../components/dynamic-form/NormalViewForm";
import TableView from "../components/table-view/TableView";
import api from "../services/api";
import Swal from "sweetalert2";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import SelectField from "../components/form/Select";
import MultiSelect from "../components/form/MultiSelect";
import AutocompleteField from "../components/form/AutoComplete";
import DateField from "../components/form/Date";
import CloseIcon from '@mui/icons-material/Close';
import dayjs from "dayjs";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";

const CaseDairy = ({headerDetails, backToForm, showMagazineView, rowData, selectedRowData,module, actionArray, record_id, options}) => {

    const [disabledDateArray, setDisabledDateArray] = useState([]);

    const [filterDropdownObj, setfilterDropdownObj] = useState([]);
    const [othersFilterModal, setOthersFilterModal] = useState(false);
    const [othersFromDate, setOthersFromDate] = useState(null);
    const [othersToDate, setOthersToDate] = useState(null);
    const [othersFiltersDropdown, setOthersFiltersDropdown] = useState([]);
    const [othersFilterData, setOthersFilterData] = useState({});
    const [filterValues, setFilterValues] = useState(record_id ? {"record_id": JSON.parse(record_id)} : {});
    const [selectedOtherTemplate, setselectedOtherTemplate] = useState(options);
    const [selectedRow, setSelectedRow] = useState(selectedRowData);
    const [tableFilterToDate, setTableFilterToDate] = useState(null);
    const [tableFilterFromDate, setTableFilterFromDate] = useState(null);
    const [tableFilterOtherFilters, setTableFilterOtherFilters] = useState({});
    
    const [tableColumnData, setTableColumnData] = useState([
        { field: 'sl_no', headerName: 'Sl. No.' },
    ]);

    const [tableRowData, setTableRowData] = useState([]);

    const tablePaginationCount = useRef(1);
    
    const [tableSearchValue, setTableSearchValue] = useState(null);
    const [tableTotalPage, setTableTotalPage] = useState(1);
    const [tableTotalRecord, setTableTotalRecord] = useState(0);

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
    
    const [loading, setLoading] = useState(false);

    const editedForm = useRef(false);

    useEffect(()=>{
        getTableData({table:"cid_ui_case_case_diary"})
    },[]);

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
            from_date: noFilters?.from_date ?? tableFilterFromDate,
            to_date: noFilters?.to_date ?? tableFilterToDate,
            filter: noFilters || tableFilterOtherFilters,
            module: module ? module : 'ui_case',
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
                const templateJson = meta?.meta?.template_json;
                
                if (totalPages !== null && totalPages !== undefined) {
                    setTableTotalPage(totalPages);
                }
                
                if (totalItems !== null && totalItems !== undefined) {
                    setTableTotalRecord(totalItems);
                }

                const generateReadableHeader = (key) =>key.replace(/^field_/, "").replace(/_/g, " ").toLowerCase().replace(/^\w|\s\w/g, (c) => c.toUpperCase());
                
                const renderCellFunc = (key, count) => (params) => tableCellRender(key, params, params.value, count, options.table || options);

                let disabledDateList = [];

                if (data?.length > 0) {
                    disabledDateList = data
                        .map(item => item.field_date)
                        .filter(val => !!val)
                        .map(val => {
                            const parsed = Date.parse(val);
                            if (isNaN(parsed)) return null;

                            const date = new Date(parsed);
                            return date.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
                        })
                        .filter(date => date !== null);
                }

                setDisabledDateArray(disabledDateList);


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
                         {
                                field: "action",
                                headerName: "Action",
                                width: 100,
                                sortable: false,
                                filterable: false,
                                align: "left",
                                renderCell: (params) => (
                                    <Button
                                        variant="contained" 
                                        color="primary" 
                                        size="small"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleTemplateDataView(params.row, true, options.table);
                                        }}
                                    >
                                        Edit
                                    </Button>
                                ),
                            }
                        ];

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

                    setTableColumnData(updatedHeader);
                    setTableRowData(updatedTableData);
                }else{
                    setTableColumnData([]);
                    setTableRowData([]);
                }

                setFormOpen(false);

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

        const setOtherFilterData = () => {
            setOthersFilterModal(false);
            getTableData("cid_ui_case_case_diary",false,{from_date: othersFromDate,to_date: othersToDate,...othersFilterData}
            );
        };
        
        const handleOthersFilter = async (selectedOtherTemplate)=>{
    
            if(!selectedOtherTemplate){
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
    
            const viewTableData = { table_name: selectedOtherTemplate };
            
            setLoading(true);
            try {
                const viewTemplateResponse = await api.post("/templates/viewTemplate", viewTableData);
                setLoading(false);
            
                if (viewTemplateResponse && viewTemplateResponse.success && viewTemplateResponse.data) {
                    var templateFields = viewTemplateResponse.data["fields"] ? viewTemplateResponse.data["fields"] : [];
                    var validFilterFields = ["dropdown", "autocomplete", "multidropdown", "date", "datetime", "time"];
            
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
            
        const getAllOptionsforFilter = async (dropdownFields, others) => {
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
            setOthersFiltersDropdown(updatedFieldsDropdown);
            } else {
            setfilterDropdownObj(updatedFieldsDropdown);
            }
        } catch (error) {
            setLoading(false);
            console.error("Error fetching template data:", error);
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

    const tableCellRender = (key, params, value, index, tableName) => {

        let highlightColor = {};
        let onClickHandler = null;

        if (tableName && index !== null && index === 0 ) {
            highlightColor = { color: '#0167F8', textDecoration: 'underline', cursor: 'pointer' };
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
                    setReadonlyForm(!editData);
                    setEditOnlyForm(!!editData);
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

    const showAddNewForm = async ()=>{

        const viewTableData = {
            table_name: "cid_ui_case_case_diary",
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

        normalData.sys_status = module ? module : "ui_case";

        var ui_case_id = rowData?.id;
        var pt_case_id = rowData?.pt_case_id;

        if(module === "pt_case"){
            ui_case_id = rowData?.ui_case_id
            pt_case_id = rowData?.id
        }

        normalData["ui_case_id"] = ui_case_id;
        normalData["pt_case_id"] = pt_case_id;

        var othersData = {};

        formData.append("table_name", "cid_ui_case_case_diary");
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
                        getTableData({table:"cid_ui_case_case_diary"}, formOpen);
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

        return;
    }

    
    const handleClear = () => {
        tablePaginationCount.current = 1;
        setTableSearchValue("");
        setTableFilterToDate(null);
        setTableFilterFromDate(null);
        setTableFilterOtherFilters({});
        setOthersFilterData({});
        setOthersFromDate(null);
        setOthersToDate(null);

        getTableData({table:"cid_ui_case_case_diary"}, false, true);
    };

    const searchTableData = ()=>{
        tablePaginationCount.current = 1;
        getTableData({table:"cid_ui_case_case_diary"});
    }

    const handlePagination = (page) => {
        tablePaginationCount.current = page
        getTableData({table:"cid_ui_case_case_diary"});
    }

    const formError = (error)=>{
        console.log(error,"error");
    }

    const editedFormFlag = (edited)=>{
        editedForm.current = edited;
    }

    const formUpdate = async (data) => {
    
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


        normalData.sys_status = module ? module : "ui_case";    
        
        var ui_case_id = rowData?.id;
        var pt_case_id = rowData?.pt_case_id;

        if(module === "pt_case"){
            ui_case_id = rowData?.ui_case_id
            pt_case_id = rowData?.id
        }

        normalData["ui_case_id"] = ui_case_id;
        normalData["pt_case_id"] = pt_case_id;

        formData.append("table_name", "cid_ui_case_case_diary");
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
                        getTableData({table:"cid_ui_case_case_diary"});    
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

    return (
        <Box p={2}>
            <Box pb={1} px={1} sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'start'}}>
                <Typography
                    sx={{ fontSize: "19px", fontWeight: "500", color: "#171A1C", display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
                    className="Roboto"
                    onClick={backToForm}
                >
                    <West />
                    <Typography sx={{ fontSize: '19px', fontWeight: '500', color: '#171A1C' }} className='Roboto'>
                        Case Diary
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
                                            onClick={() => handleOthersFilter("cid_ui_case_case_diary")}
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

                    {/* <Button
                        onClick={()=>showMagazineView(false)}
                        sx={{height: "38px", textTransform: 'none'}}
                        className="whiteBorderedBtn"
                    >
                        Case Docket
                    </Button> */}

                </Box>
            </Box>

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

            {formOpen && (
                <Dialog
                    open={formOpen}
                    onClose={closeAddForm}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                    fullScreen
                    fullWidth
                    sx={{ marginLeft: '50px' }}
                >
                    <DialogContent sx={{padding: 0}}>
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
                            editedForm={editedFormFlag}
                            caseDiary={true}
                            disabledDates={disabledDateArray}
                            caseDiaryArray={actionArray}
                            caseDairy_ui_case_id={module === "pt_case" ? rowData?.ui_case_id : rowData?.id}
                            caseDairy_pt_case_id={module === "pt_case" ? rowData?.id : rowData?.pt_case_id}
                        />
                    </DialogContent>
                </Dialog>
            )}

            {loading && (
                <div className="parent_spinner" tabIndex="-1" aria-hidden="true">
                    <CircularProgress size={100} />
                </div>
            )}

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
        </Box>
    )
};

export default CaseDairy;