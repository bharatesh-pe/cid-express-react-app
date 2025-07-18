import { useEffect, useState, useRef } from 'react';
import ReactDOM from 'react-dom';

import { West } from '@mui/icons-material';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Link,
  Box,
  Typography,
  Chip,
  InputAdornment,
  IconButton,
  Tooltip,
  Button,
  CircularProgress,
} from '@mui/material';
import TextFieldInput from "@mui/material/TextField";

import NormalViewForm from "../components/dynamic-form/NormalViewForm";
import TableView from "../components/table-view/TableView";
import api from "../services/api";
import Swal from "sweetalert2";

import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from '@mui/icons-material/Close';

const AccusedSplitScreen = ({tableObj, selectedAccused, closeForm, ui_case_id, pt_case_id, module, mainTableName, directAddNew}) =>{

    console.log(mainTableName,"mainTableName");    

    const gettingFieldName = mainTableName === "cid_ui_case_accused" ? "field_accused_name" : "field_name";

    const [loading, setLoading] = useState(false);

    const [tableColumnData, setTableColumnData] = useState([
        { field: 'sl_no', headerName: 'Sl. No.' },
    ]);

    const [accusedHeaderName, setAccusedHeaderName] = useState(
        () => (selectedAccused || []).map(item => item?.[gettingFieldName]).join(', ')
    );

    const [isSaving, setIsSaving] = useState(false);

    const [tableRowData, setTableRowData] = useState([]);

    const tablePaginationCount = useRef(1);

    const [tableSearchValue, setTableSearchValue] = useState(null);
    const [tableTotalPage, setTableTotalPage] = useState(1);
    const [tableTotalRecord, setTableTotalRecord] = useState(0);

    const [tableFilterToDate, setTableFilterToDate] = useState(null);
    const [tableFilterFromDate, setTableFilterFromDate] = useState(null);
    const [tableFilterOtherFilters, setTableFilterOtherFilters] = useState({});

    const [formOpen, setFormOpen] = useState(false);
    const [selectedRowId, setSelectedRowId] = useState(null);
    const [selectedTemplateId, setSelectedTemplateId] = useState(null);
    const [selectedTableName, setSelectedTableName] = useState(null);
    const [selectedTemplateName, setSelectedTemplateName] = useState(null);
    const [readonlyForm, setReadonlyForm] = useState(null);
    const [editOnlyForm, setEditOnlyForm] = useState(null);

    const [rowData, setRowData] = useState({});

    
    const editedForm = useRef(false);

    const [formFields, setFormFields] = useState([]);
    const [initalFormData, setInitialFormData] = useState({});
    const [formStepperData, setFormStepperData] = useState([]);

    const [tableTabs, setTableTabs] = useState([]);
    const [selectedTableTabs, setSelectedTableTabs] = useState("all");

    const getTableData = async (options, reOpen, noFilters) => {

        const accusedId = (selectedAccused || []).map(accused => accused.id);

        var getTemplatePayload = {
            table_name: options.table_name || options,
            ui_case_id: ui_case_id,
            pt_case_id: pt_case_id,
            accused_ids:  accusedId,
            limit : 10,
            page : tablePaginationCount.current,
            search: noFilters ? "" : tableSearchValue,        
            from_date: noFilters ? null : tableFilterFromDate,
            to_date: noFilters ? null : tableFilterToDate,
            filter: noFilters ? {} : tableFilterOtherFilters,
            templateField : gettingFieldName
        };

        setLoading(true);
        try {

            const getTemplateResponse = await api.post("/templateData/getTemplateDataWithAccused",getTemplatePayload);
            setLoading(false);
            
            editedForm.current = false;

            if (getTemplateResponse && getTemplateResponse.success) {


                const { meta, data } = getTemplateResponse;
            
                const totalPages = meta?.totalPages;
                const totalItems = meta?.totalItems;
                const templateJson = meta?.template_json;
                
                if (totalPages !== null && totalPages !== undefined) {
                    setTableTotalPage(totalPages);
                }
                
                if (totalItems !== null && totalItems !== undefined) {
                    setTableTotalRecord(totalItems);
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
                
                const renderCellFunc = (key, count) => (params) => tableCellRender(key, params, params.value, count, options.table_name);

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
                            width: 65,
                            renderCell: (params) => (
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
                            ),
                        },
                        ...tabFields,
                    ];
                }

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
        if(directAddNew === true){
            showAddNewForm();
            return;
        }
    },[])

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
    
    const handleActionDelete = async (data, options)=>{

        if(!data?.id || !options?.table_name){
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
                    table_name: options?.table_name,
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

    const showAddNewForm = async ()=>{
        
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

        const viewTableData = {
            table_name: tableObj.table_name,
        };

        setLoading(true);
    
        try {

            const viewTemplateResponse = await api.post("/templates/viewTemplate",viewTableData);
            setLoading(false);

            if (viewTemplateResponse && viewTemplateResponse.success) {

                var multiSelect = false;

                var tabFields = []
                
                var updatedFields = viewTemplateResponse?.["data"]?.["fields"].map((field)=>{

                    if(field.type === "multidropdown"){
                        multiSelect = true
                    }

                    if(field.type === "tabs"){
                        tabFields.push(field)
                    }

                    return {
                        ...field
                    }
                });

                const accusedId = (selectedAccused || []).map(accused => accused.id).filter(Boolean);

                var initialFormConfig = {
                    [gettingFieldName] : accusedId[0]
                }

                if(multiSelect){
                    initialFormConfig[gettingFieldName] = accusedId
                }

                var accusedWitnessTabs = false;

                if(tabFields?.length > 0){
                    tabFields.map((element)=>{
                        if(element?.options){
                            if(element?.options.some(options => options.code === "Accused" || options.code === "Witness")){
                                accusedWitnessTabs = element?.name;
                            }
                        }
                    });
                }

                if(accusedWitnessTabs !== false && accusedWitnessTabs !== ""){
                    initialFormConfig[accusedWitnessTabs] = mainTableName === "cid_ui_case_accused" ? "Accused" : "Witness"

                    updatedFields = updatedFields.map((item)=>{

                        if(item.name === accusedWitnessTabs){                            
                            return{
                                ...item,
                                disabled : true
                            }
                        }
                        return{
                            ...item,
                        }
                    });
                }
                
                setSelectedTemplateId(viewTemplateResponse?.["data"]?.template_id);
                setSelectedTableName(viewTemplateResponse?.["data"]?.table_name);
                setSelectedTemplateName(viewTemplateResponse?.["data"]?.template_name);
                
                setReadonlyForm(false);
                setEditOnlyForm(false);
                
                setFormFields(updatedFields || []);
                setInitialFormData(initialFormConfig);

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
    
    const searchTableData = ()=>{
        tablePaginationCount.current = 1;
        getTableData(tableObj);
    }

    const handleClear = () => {
        tablePaginationCount.current = 1;
        setTableSearchValue("");
        setTableFilterToDate(null);
        setTableFilterFromDate(null);
        setTableFilterOtherFilters({});

        getTableData(tableObj, false, true);
    };

    const handlePagination = (page) => {
        tablePaginationCount.current = page
        getTableData(tableObj);
    }

    useEffect(()=>{
        if(tableObj?.table_name){
            getTableData(tableObj);
        }
    },[tableObj, selectedTableTabs]);

    const editedFormFlag = (edited)=>{
        editedForm.current = edited;
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
                if(directAddNew === true){
                    closeForm();
                    return;
                }
                setFormOpen(false);
                editedForm.current = false;
            }

        }else{
            if(directAddNew === true){
                closeForm();
                return;
            }
            setFormOpen(false);
            editedForm.current = false;
        }

    }

    const formSubmit = async (data, formOpen)=>{

        if (isSaving) 
            return;

        setIsSaving(true);

        if (!tableObj.table_name || tableObj.table_name === "") {
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
    
        normalData.sys_status = module ? module : "ui_case";

        normalData["ui_case_id"] = ui_case_id;
        normalData["pt_case_id"] = pt_case_id;

        var othersData = {};
        formData.append("table_name", tableObj.table_name);
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
                        if(directAddNew === true){
                            if(formOpen){
                                showAddNewForm();
                                return;
                            }
                            closeForm();
                            return;
                        }
                        getTableData(tableObj, formOpen);
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
        finally {
            setIsSaving(false);
        }

    };

    const formUpdate = async (data)=>{
        if (!tableObj.table_name || tableObj.table_name === "") {
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
        normalData["ui_case_id"] = ui_case_id;
        normalData["pt_case_id"] = pt_case_id;

        formData.append("table_name", tableObj.table_name);
        formData.append("data", JSON.stringify(normalData));
        formData.append("id", data.id);
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
                        getTableData(tableObj);
                    }
                });

                setFormOpen(false);

            } else {
                toast.error(updateResponse.message || "Failed to update case.");
            }
        } catch (error) {
            setLoading(false);
            toast.error(error?.response?.data?.message || "Please Try Again !");
        }

    }

    const formError = (data)=>{
        console.log(data,"data");
    }

    console.log(accusedHeaderName,"accusedHeaderName");    

    return (
        <Dialog
            open={true}
            maxWidth="sm"
            fullWidth
            fullScreen
            sx={{marginLeft: '50px'}}
        >
            <Box sx={{padding: 2}}>
                <Box pb={1} px={1} sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'start'}}>
                    <Typography
                        sx={{ fontSize: "19px", fontWeight: "500", color: "#171A1C", display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
                        className="Roboto"
                        onClick={() => closeForm?.()}
                    >
                        <West />
                        <Typography sx={{ fontSize: '19px', fontWeight: '500', color: '#171A1C' }} className='Roboto'>
                            {tableObj?.label || 'Form'}
                        </Typography>
                        {/* {headerDetails && ( */}
                            <Chip
                                label={accusedHeaderName || 'Accused Name'}
                                color="primary"
                                variant="outlined"
                                size="small"
                                sx={{ fontWeight: 500, marginTop: '2px' }}
                            />
                        {/* )} */}
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
                                    // endAdornment: (
                                    //     <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    //         <IconButton
                                    //             sx={{ padding: "0 5px", borderRadius: "0" }}
                                    //         >
                                    //             <FilterListIcon sx={{ color: "#475467" }} />
                                    //         </IconButton>
                                    //     </Box>
                                    // )
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

                
                {
                    tableTabs.length > 0 &&
                    <Box sx={{ display: "flex", alignItems: 'start'}} pl={1}>
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
                    </Box>
                }

                <Box>
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

            {formOpen && (
                <Dialog
                    open={formOpen}
                    onClose={closeAddForm}
                    maxWidth="xl"
                    fullWidth
                >
                    <DialogContent sx={{p: 0, mt: 2, pb: 2}}>
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
                            selectedRow={{
                                ...rowData,
                                ui_case_id: ui_case_id,
                                pt_case_id: pt_case_id
                            }}
                            editedForm={editedFormFlag}
                        />
                    </DialogContent>
                </Dialog>
            )}

            {loading && (
                <div className="parent_spinner" tabIndex="-1" aria-hidden="true">
                    <CircularProgress size={100} />
                </div>
            )}

            {isSaving && ReactDOM.createPortal(
            <div className="parent_spinner_2">
                <CircularProgress size={100} />
            </div>,
            document.body
            )}


        </Dialog>
    )
}

export default AccusedSplitScreen;