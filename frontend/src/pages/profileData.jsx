import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import DynamicForm from '../components/dynamic-form/DynamicForm';
import TableView from "../components/table-view/TableView";
import api from '../services/api';

import { Box, Button, FormControl, InputAdornment, Typography, IconButton, Checkbox, Grid, Link } from "@mui/material";
import TextFieldInput from '@mui/material/TextField';
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
import ASC from '@mui/icons-material/North';
import DESC from '@mui/icons-material/South';
import AddIcon from '@mui/icons-material/Add';
import filterLines from '../Images/filterLines.svg';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import pdfIcon from '../Images/pdfIcon.svg'
import docIcon from '../Images/docIcon.svg'
import docxIcon from "../Images/docxIcon.svg";
import xlsIcon from '../Images/xlsIcon.svg'
import pptIcon from '../Images/pptIcon.svg'
import jpgIcon from '../Images/jpgIcon.svg'
import pngIcon from '../Images/pngIcon.svg'
import CloseIcon from '@mui/icons-material/Close';
import { CircularProgress } from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import FilterListIcon from "@mui/icons-material/FilterList";
import eyes from "../Images/eye.svg"
import edit from "../Images/tableEdit.svg";
import trash from "../Images/tableTrash.svg";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import * as XLSX from 'xlsx';
import UploadFileIcon from '@mui/icons-material/UploadFile';

const ProfileData = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { table_name, template_name, pagination, selectedFields, selected_template_id, profileDatapagination } = location.state || {};

    const [showOptionModal, setShowOptionModal] = useState(false)
    const [paginationCount, setPaginationCount] = useState(profileDatapagination ? profileDatapagination : 1);
    const [tableSortOption, settableSortOption] = useState('DESC');
    const [tableSortKey, setTableSortKey] = useState('');
    const [tableData, setTableData] = useState([]);
    const [isValid, setIsValid] = useState(false);
    const [searchValue, setSearchValue] = useState(null);
    const [linkLeader, setLinkLeader] = useState(false)
    const [linkOrganization, setLinkOrganization] = useState(false)


    const [stepperData, setstepperData] = useState([]);
    const [formOpen, setFormOpen] = useState(false);
    const [formTemplateData, setFormTemplateData] = useState([])
    const [initialData, setInitialData] = useState({});
    const [viewReadonly, setviewReadonly] = useState(false);
    const [editTemplateData, setEditTemplateData] = useState(false);
    const [selectedRowId, setSelectedRowId] = useState(null);
    const [selectedTemplateId, setSelectedTemplateId] = useState(null);


    const [showDownloadModal, setShowDownloadModal] = useState(false);
    const [showDownloadData, setShowDownloadData] = useState([]);
    const [showSelectedDownloadData, setShowSelectedDownloadData] = useState({});

    const [showAttachmentModal, setShowAttachmentModal] = useState(false);
    const [showAttachmentKey, setShowAttachmentKey] = useState(null);
    const [showAttachmentData, setShowAttachmentData] = useState([]);

    const [starFlag, setStarFlag] = useState(null);
    const [readFlag, setReadFlag] = useState(null);

    const [loading, setLoading] = useState(false); // State for loading indicator

    const [showFilterModal, setShowFilterModal] = useState(false);
    const [filterDropdownObj, setfilterDropdownObj] = useState([]);
    const [filterValues, setFilterValues] = useState({});
    const [fromDateValue, setFromDateValue] = useState(null);
    const [toDateValue, setToDateValue] = useState(null);
    const [forceTableLoad, setForceTableLoad] = useState(false);

    const [totalPage, setTotalPage] = useState(0);
    const [totalRecord, setTotalRecord] = useState(0);
        
    const [saveNew, setSaveNew] = useState(null);
     
    const handlePagination = (page) => {
        setPaginationCount(page)
    }

    const searchParams = new URLSearchParams(location.search);

    const [viewTemplateTableColumns, setviewTemplateTableData] = useState([
        { field: 'sl_no', headerName: 'S.No' },
        {
            field: '',
            headerName: 'Action',
            flex: 1,
            renderCell: (params) => {
                return (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px', height: '100%' }}>
                        <Button variant="outlined" onClick={(event) => { event.stopPropagation(); handleTemplateDataView(params.row, false); }}>
                            View
                        </Button>
                        <Button variant="contained" color="primary" onClick={(event) => { event.stopPropagation(); handleTemplateDataView(params.row, true); }}>
                            Edit
                        </Button>
                        <Button variant="contained" color="error" onClick={(event) => { event.stopPropagation(); handleDeleteTemplateData(params.row); }}>
                            Delete
                        </Button>
                    </Box>
                );
            }
        }
    ]);

    const handleTemplateDataView = async (rowData, editData) => {
        if (!table_name || table_name === '') {
            toast.warning('Please Check Table Name', {
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

        var viewTemplatePayload = {
            "table_name": table_name,
            "id": rowData.id,
        }
        setLoading(true);
        try {

            const viewTemplateData = await api.post("/templateData/viewTemplateData", viewTemplatePayload);
            setLoading(false);

            if (viewTemplateData && viewTemplateData.success) {

                setInitialData(viewTemplateData.data ? viewTemplateData.data : {});
                setviewReadonly(!editData);
                setEditTemplateData(editData);
                setLinkLeader(false);
                setLinkOrganization(false);
                setSelectedRowId(null);
                setSelectedTemplateId(null);

                const viewTableData = {
                    "table_name": table_name
                }

                setLoading(true);
                try {

                    const viewTemplateResponse = await api.post("/templates/viewTemplate", viewTableData);
                    setLoading(false);

                    if (viewTemplateResponse && viewTemplateResponse.success) {

                        console.log(viewTemplateResponse['data'], "viewTemplateResponse")

                        if (viewTemplateResponse['data'].is_link_to_leader === true) {
                            setLinkLeader(true);
                        } else if (viewTemplateResponse['data'].is_link_to_organization === true) {
                            setLinkOrganization(true);
                        }

                        setFormOpen(true);
                        setSelectedRowId(rowData.id);
                        setSelectedTemplateId(viewTemplateResponse['data'].template_id);
                        setFormTemplateData(viewTemplateResponse.data['fields'] ? viewTemplateResponse.data['fields'] : []);
                        if (viewTemplateResponse.data.no_of_sections && viewTemplateResponse.data.no_of_sections > 0) {
                            setstepperData(viewTemplateResponse.data.sections ? viewTemplateResponse.data.sections : []);
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
                const errorMessage = viewTemplateData.message ? viewTemplateData.message : "Failed to create the template. Please try again.";
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

    const handleMagazineView = async (rowData, editData) => {
        if (!table_name || table_name === '') {
            toast.warning('Please Check Table Name', {
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

        var viewTemplatePayload = {
            "table_name": table_name,
            "id": rowData.id,
        }
        setLoading(true);

        try {

            const viewTemplateData = await api.post("/templateData/viewMagazineTemplateData", viewTemplatePayload);
            setLoading(false);

            if (viewTemplateData && viewTemplateData.success) {

                const viewTableData = {
                    "table_name": table_name
                }

                setLoading(true);
                try {

                    const viewTemplateResponse = await api.post("/templates/viewTemplate", viewTableData);
                    setLoading(false);

                    if (viewTemplateResponse && viewTemplateResponse.success) {

                        navigate('/profile-view', {
                            state: {
                                formData: viewTemplateData.data ? viewTemplateData.data : {},
                                fields: viewTemplateResponse.data['fields'] ? viewTemplateResponse.data['fields'] : [],
                                profileDatapagination: paginationCount,
                                table_name: table_name,
                                selected_template_id: selected_template_id,
                                template_name: template_name,
                                selectedFields: selectedFields,
                                table_row_id: rowData.id,
                                template_id: viewTemplateResponse.data['template_id'] ? viewTemplateResponse.data['template_id'] : '',
                                linkToLeader: viewTemplateResponse['data'].is_link_to_leader ? viewTemplateResponse['data'].is_link_to_leader : false,
                                linkToOrganization: viewTemplateResponse['data'].is_link_to_organization ? viewTemplateResponse['data'].is_link_to_organization : false
                            }
                        });

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
                const errorMessage = viewTemplateData.message ? viewTemplateData.message : "Failed to create the template. Please try again.";
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


    useEffect(() => {
        // if (!table_name || table_name === '') {
        //     navigate('/Profile', { state: { pagination: pagination } });
        // }
        loadTableData(paginationCount);

    }, [paginationCount, tableSortKey, tableSortOption, starFlag, readFlag, forceTableLoad])

    const toggleStarIcon = async (row) => {

        var payload = {
            "template_id": selected_template_id,
            "table_row_id": row.id
        }

        setLoading(true);
        try {

            const updateStar = await api.post("/templateStars/toggleTemplateStar", payload);
            setLoading(false);

            if (updateStar && updateStar.success) {

                toast.success(updateStar.message ? updateStar.message : "Starred Updated Successfully", {
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
                const errorMessage = updateStar.message ? updateStar.message : "Failed to update star for this profile. Please try again.";
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

    const loadTableData = async (page) => {

        if (!table_name || table_name === '') {
            // navigate('/Profile', { state: { pagination: pagination } });
            return;
        }

        var getTemplatePayload = {
            "page": page,
            "limit": 10,
            "sort_by": tableSortKey,
            "order": tableSortOption,
            "search": searchValue || '',
            "table_name": table_name,
            "is_starred": starFlag,
            "is_read": readFlag,
            "from_date": fromDateValue,
            "to_date": toDateValue,
            "filter": filterValues,
        }
        setLoading(true);

        try {
            const getTemplateResponse = await api.post("/templateData/paginateTemplateData", getTemplatePayload);
            setLoading(false);

            if (getTemplateResponse && getTemplateResponse.success) {
                if (getTemplateResponse.data && getTemplateResponse.data['data']) {

                    const { meta } = getTemplateResponse.data;

                    const totalPages = meta?.totalPages || 1;
                    const totalItems = meta?.totalItems || 0;

                    const templateConfig = meta?.template || []
                    
                    if (totalPages !== null && totalPages !== undefined) {
                        setTotalPage(totalPages);
                    }
                    
                    if (totalItems !== null && totalItems !== undefined) {
                        setTotalRecord(totalItems);
                    }

                    if (getTemplateResponse.data['data'][0]) {
                        var excludedKeys = ["created_at", "updated_at", "id", "deleted_at", "attachments", "Starred", "ReadStatus", "linked_profile_info","created_by"];

                        const updatedHeader = [
                            {
                                field: 'sl_no',
                                headerName: 'S.No',
                                resizable: false,
                                width: 75,
                                renderCell: (params) => {
                                    return (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            {params.value}
                                        </Box>
                                    )
                                },
                            },
                            ...(localStorage.getItem('authAdmin') === "false" ?
                                [{
                                    field: 'extra_star_field',
                                    headerName: '',
                                    resizable: false,
                                    width: 20,
                                    renderCell: (params) => {
                                        return (
                                            <Box sx={{ display: 'flex', alignItems: 'center', height: '100%', gap: '4px' }} onClick={() => toggleStarIcon(params.row)}>
                                                {params.value}
                                                {params.row?.Starred ? (
                                                    <StarIcon style={{ color: 'gold', fontSize: 18, marginBottom: 1 }} />
                                                ) : (
                                                    <StarBorderIcon style={{ fontSize: 18, marginBottom: 1 }} />
                                                )}
                                            </Box>
                                        );
                                    },
                                }]
                                :
                                []
                            ),
                            ...Object.keys(getTemplateResponse.data['data'][0])
                                .filter((key) => !excludedKeys.includes(key))
                                .map((key) => {
                                    var updatedKeyName = key.replace(/^field_/, "").replace(/_/g, " ").toLowerCase().replace(/^\w|\s\w/g, (c) => c.toUpperCase())
                                    const fieldData = (templateConfig || []).find((data) => data.name === key);
                                    console.log("updatedKeyName",updatedKeyName)
                                    return {
                                        field: key,
                                        headerName: updatedKeyName ? updatedKeyName : '',
                                        width: fieldData && ['file', 'profilepicture'].includes(fieldData.type) ? 250 : 150,
                                        resizable: fieldData && ['file', 'profilepicture'].includes(fieldData.type) ? false : true,
                                        renderHeader: () => (
                                            <div onClick={() => ApplySortTable(key)} style={{ display: "flex", alignItems: "center", justifyContent: 'space-between', width: '100%' }}>
                                                <span style={{ color: '#1D2939', fontSize: '15px', fontWeight: '500' }}>{updatedKeyName ? updatedKeyName : ''}</span>
                                                {fieldData && !['file', 'profilepicture'].includes(fieldData.type) && (
                                                    tableSortKey === key
                                                        ? (tableSortOption === 'ASC'
                                                            ? <ASC sx={{ color: '#475467', width: '18px' }} />
                                                            : <DESC sx={{ color: '#475467', width: '18px' }} />)
                                                        : <DESC sx={{ color: '#475467', width: '18px' }} />
                                                )}
                                            </div>
                                        ),
                                        renderCell: (params) => {
                                            if (fieldData && ['file', 'profilepicture'].includes(fieldData.type)) {
                                                return fileUploadTableView(key, params, params.value);
                                            } else {
                                                return tableCellRender(key, params, params.value)
                                            }
                                        },
                                    };
                                }),
                            {
                                field: '',
                                headerName: 'Action',
                                resizable: false,
                                width: 300,
                                renderCell: (params) => {
                                    return (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px', height: '100%' }}>
                                                                    <Button
                                                                        style={{
                                                                            background: "transparent",
                                                                            border: "none",
                                                                            padding: "0",
                                                                            boxShadow: "none",
                                                                            display: "flex",
                                                                            alignItems: "center",
                                                                            gap: "6px",
                                                                            color: "black",
                                                                            fontSize: "14px",
                                                                            textAlign: "center",
                                                                            textTransform: "none",
                                                                        }}
                                                                        onClick={(event) => { event.stopPropagation(); handleTemplateDataView(params.row, false); }}                                                                    >
                                                                        <img
                                                                            src={eyes}
                                                                            alt="View"
                                                                            style={{ width: "20px", height: "20px" }}
                                                                        />
                                                                        <span>View</span>
                                                                    </Button>
                                                                    <Button
                                                                        style={{
                                                                            background: "transparent",
                                                                            border: "none",
                                                                            padding: "0",
                                                                            boxShadow: "none",
                                                                            display: "flex",
                                                                            alignItems: "center",
                                                                            gap: "6px",
                                                                            color: "black",
                                                                            fontSize: "14px",
                                                                            textAlign: "center",
                                                                            textTransform: "none",
                                                                        }}
                                                                        onClick={(event) => { event.stopPropagation(); handleTemplateDataView(params.row, true); }}                                                                    >
                                                                        <img
                                                                            src={edit}
                                                                            alt="Edit"
                                                                            style={{ width: "20px", height: "20px" }}
                                                                        />
                                                                        <span>Edit</span>
                                                                    </Button>
                                                                    <Button
                                                                        style={{
                                                                            background: "transparent",
                                                                            border: "none",
                                                                            padding: "0",
                                                                            boxShadow: "none",
                                                                            display: "flex",
                                                                            alignItems: "center",
                                                                            gap: "6px",
                                                                            color: "Red",
                                                                            fontSize: "14px",
                                                                            textAlign: "center",
                                                                            textTransform: "none",
                                                                        }}
                                                                        onClick={(event) => { event.stopPropagation(); handleDeleteTemplateData(params.row); }}                                                                    >
                                                                        <img
                                                                            src={trash}
                                                                            alt="Delete"
                                                                            style={{ width: "20px", height: "20px" }}
                                                                        />
                                                                        <span>Delete</span>
                                                                    </Button>
                                        </Box>
                                    );
                                }
                            }
                        ];

                        if (Array.isArray(getTemplateResponse.data['columns'])) {

                            var updatedHeaderData = getTemplateResponse.data['columns']
                                .filter((key) => key.name && key.name.trim() !== '')
                                .map((key) => key.name);

                            setShowDownloadData(updatedHeaderData);
                            setShowSelectedDownloadData({
                                downloadHeaders: updatedHeaderData.map((data) => data)
                            });

                        } else {
                            setShowDownloadData([]);
                            setShowSelectedDownloadData({});
                        }

                        setviewTemplateTableData(updatedHeader)
                    }

                    var updatedTableData = getTemplateResponse.data['data'].map((field, index) => {

                        const formatTime = (value) => {
                            const parsed = Date.parse(value);
                            if (isNaN(parsed)) return value;
                            
                            const date = new Date(parsed);
                            let hours = date.getHours();
                            const ampm = hours >= 12 ? 'PM' : 'AM';
                            
                            hours = hours % 12;
                            hours = hours ? hours : 12;
                            
                            return `${hours.toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')} ${ampm}`;
                        };

                        const formatDateTime = (value) => {
                            const parsed = Date.parse(value);
                            if (isNaN(parsed)) return value;
                            
                            const date = new Date(parsed);
                            let hours = date.getHours();
                            const ampm = hours >= 12 ? 'PM' : 'AM';
                            
                            hours = hours % 12;
                            hours = hours ? hours : 12;
                            
                            return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()} ${hours.toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')} ${ampm}`;
                        };

                        const formatDate = (value) => {
                            const parsed = Date.parse(value);
                            if (isNaN(parsed)) return value;
                            return new Date(parsed).toLocaleDateString("en-GB");
                        };

                        const updatedField = {};

                        Object.keys(field).forEach((key) => {

                            const fieldData = (templateConfig || []).find((data) => data.name === key);

                            if (fieldData?.type === "time"){
                                updatedField[key] = formatTime(field[key]);
                            }else if(fieldData?.type === "date"){
                                updatedField[key] = formatDate(field[key]);
                            }else if (fieldData?.type === "datetime") {
                                updatedField[key] = formatDateTime(field[key]);
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
                    setviewReadonly(false);
                    setEditTemplateData(false);
                    setInitialData({});
                    setFormOpen(false)
                }

            } else {
                const errorMessage = getTemplateResponse.message ? getTemplateResponse.message : "Failed to create the template. Please try again.";
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

    const tableCellRender = (key, params, value) => {
        let highlightColor = {};
        let onClickHandler = null;
    
        if (params?.row?.linked_profile_info?.[0]?.field === key) {
            highlightColor = { color: '#0167F8', textDecoration: 'underline', cursor: 'pointer' };
            
            onClickHandler = (event) => {event.stopPropagation();hyperLinkShow(params.row.linked_profile_info[0])};
        }
    
        return (
            <span 
                style={highlightColor}
                onClick={onClickHandler}
                className={`tableValueTextView Roboto ${
                    params?.row && !params.row['ReadStatus'] && localStorage.getItem('authAdmin') === "false"
                        ? 'unreadMsgText'
                        : 'read'
                }`}
            >
                {value}
            </span>
        );
    };

    const hyperLinkShow = async (params)=> {
        
        if(!params.table || !params.id){
            toast.error('Invalid Data Please Try Again !', {
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

        const hyperLinkPayload = {
            "table_name": params.table,
            "id":params.id
        }

        setLoading(true);

        try {
            const hyperLinkResponse = await api.post("templateData/viewMagazineTemplateData", hyperLinkPayload);
            setLoading(false);

            if (hyperLinkResponse && hyperLinkResponse.success) {
                const viewTableData = {
                    "table_name": params.table
                }

                setLoading(true);
                try {

                    const viewTemplateResponse = await api.post("/templates/viewTemplate", viewTableData);
                    setLoading(false);

                    if (viewTemplateResponse && viewTemplateResponse.success) {

                        navigate('/profile-view', {
                            state: {
                                formData: hyperLinkResponse.data ? hyperLinkResponse.data : {},
                                fields: viewTemplateResponse.data['fields'] ? viewTemplateResponse.data['fields'] : [],
                                profileDatapagination: paginationCount,
                                table_name: params.table,
                                hyperLinkTableName: searchParams.get("tableName") ? searchParams.get("tableName") : table_name,
                                selected_template_id: searchParams.get("template_id") ? searchParams.get("template_id") : selected_template_id,
                                template_name: template_name,
                                selectedFields: selectedFields,
                                table_row_id: searchParams.get("id") ? searchParams.get("id") : params.id,
                                template_id: viewTemplateResponse.data['template_id'] ? viewTemplateResponse.data['template_id'] : '',
                                linkToLeader: viewTemplateResponse['data'].is_link_to_leader ? viewTemplateResponse['data'].is_link_to_leader : false,
                                linkToOrganization: viewTemplateResponse['data'].is_link_to_organization ? viewTemplateResponse['data'].is_link_to_organization : false
                            }
                        });

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
                const errorMessage = hyperLinkResponse.message ? hyperLinkResponse.message : "Failed to get data. Please try again.";
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

    const getFileIcon = (fileName) => {
        fileName = fileName.split('.').pop().toLowerCase()
        switch (fileName) {
            case 'pdf':
                return <img src={pdfIcon} />;
            case 'jpg':
            case 'jpeg':
                return <img src={jpgIcon} />;
            case 'png':
            case 'svg':
            case 'gif':
                return <img src={pngIcon} />;
            case 'xls':
            case 'xlsx':
                return <img src={xlsIcon} />;
            case 'csv':
            case 'docx':
                return <img src={docxIcon} />;
            case 'doc':
                return <img src={docIcon} />;
            case 'ppt':
                return <img src={pptIcon} />;
            default:
                return <InsertDriveFileIcon />;
        }
    };

    const fileUploadTableView = (type, rowData, attachment) => {

        if (attachment && attachment !== '') {
            var separateAttachment = attachment.split(',');
            return (
                <Box mt={1} sx={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }} onClick={(e) => { e.stopPropagation(); showAttachmentFileModal(type, rowData.row) }}>
                    <Box className="Roboto attachmentTableBox">
                        <span style={{ display: 'flex' }}>{getFileIcon(separateAttachment[0])}</span>
                        <span className="Roboto attachmentTableName">{separateAttachment[0]}</span>
                    </Box>
                    {separateAttachment.length > 1 && <button className="Roboto attachmentTableBtn">{separateAttachment.length - 1}+</button>}
                </Box>
            )
        }

    }

    const showAttachmentFileModal = (type, row) => {
        if (row[type]) {
            var attachments = row[type].split(',')
            setShowAttachmentModal(true);
            setShowAttachmentKey(row)
            setShowAttachmentData(attachments);
        } else {
            console.log("no attachments found")
        }
    }

    const handleDeleteTemplateData = (rowData) => {

        Swal.fire({
            title: 'Are you sure?',
            text: "Do you want to delete this profile ?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, Delete it!',
            cancelButtonText: 'No',
        }).then(async (result) => {
            if (result.isConfirmed) {
                const deleteTemplateData = {
                    "table_name": table_name,
                    "where": { id: rowData.id }
                }
                setLoading(true);

                try {
                    const deleteTemplateDataResponse = await api.post("templateData/deleteTemplateData", deleteTemplateData);
                    setLoading(false);

                    if (deleteTemplateDataResponse && deleteTemplateDataResponse.success) { 
                        toast.success(deleteTemplateDataResponse.message ? deleteTemplateDataResponse.message : "Template Deleted Successfully", {
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

    const ApplySortTable = (key) => {
        settableSortOption((prevOption) => (prevOption === 'DESC' ? 'ASC' : 'DESC'));
        setTableSortKey(key);
    }

    const getTemplate = async (table_name) => {
        if (!table_name || table_name === '') {
            toast.warning('Please Check The Template', {
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
            "table_name": table_name
        }
        setLoading(true);

        try {

            const viewTemplateResponse = await api.post("/templates/viewTemplate", viewTableData);
            setLoading(false);
            if (viewTemplateResponse && viewTemplateResponse.success) {

                setFormOpen(true);
                setInitialData({});
                setviewReadonly(false);
                setEditTemplateData(false);
                setFormTemplateData(viewTemplateResponse.data['fields'] ? viewTemplateResponse.data['fields'] : []);
                if (viewTemplateResponse.data.no_of_sections && viewTemplateResponse.data.no_of_sections > 0) {
                    setstepperData(viewTemplateResponse.data.sections ? viewTemplateResponse.data.sections : []);
                }
                setSaveNew(null);

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

    const onSaveTemplateData = async (data, saveNew) => {

        if (!table_name || table_name === '') {
            toast.warning('Please Check The Template', {
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

        if (Object.keys(data).length === 0) {
            toast.warning('Data Is Empty Please Check Once', {
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
                    if (field.type === 'file') {
                        if (Array.isArray(data[field.name])) {
                            const hasFileInstance = data[field.name].some(file => file.filename instanceof File);
                            var filteredArray = data[field.name].filter(file => file.filename instanceof File);
                            if (hasFileInstance) {
                                data[field.name].forEach((file) => {
                                    if (file.filename instanceof File) {
                                        formData.append(field.name, file.filename);
                                    }
                                });

                                filteredArray = filteredArray.map((obj) => {
                                    return {
                                        ...obj,
                                        filename: obj.filename['name']
                                    }
                                });

                                formData.append('folder_attachment_ids', JSON.stringify(filteredArray));

                            }
                        }
                    } else {
                        formData.append(field.name, data[field.name]);
                    }
                } else {
                    // Add non-file fields to normalData
                    normalData[field.name] = field.type === 'checkbox' || field.type === 'multidropdown' ? Array.isArray(data[field.name]) ? data[field.name].join(',') : data[field.name] : data[field.name];
                }
            }
        });

        formData.append("data", JSON.stringify(normalData));
        setSaveNew(saveNew);
        setLoading(true);

        try {
            const saveTemplateData = await api.post("/templateData/insertTemplateData", formData);
            setLoading(false);
            localStorage.removeItem(template_name + '-formData');

            if (saveTemplateData && saveTemplateData.success) {

                toast.success(saveTemplateData.message || "Data Created Successfully", {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    className: "toast-success",
                    onOpen: () => {
                        if (saveNew === true) {
                        getTemplate(table_name);
                        setFormOpen(false);
                        return;
                        }else {
                        loadTableData(paginationCount);
                        }
                    },
                });

            } else {
                const errorMessage = saveTemplateData.message ? saveTemplateData.message : "Failed to create the profile. Please try again.";
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

    const onUpdateTemplateData = async (data) => {

        if (!table_name || table_name === '') {
            toast.warning('Please Check The Template', {
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

        if (Object.keys(data).length === 0) {
            toast.warning('Data Is Empty Please Check Once', {
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
                    if (field.type === 'file') {
                        if (Array.isArray(data[field.name])) {
                            const hasFileInstance = data[field.name].some(file => file.filename instanceof File);
                            var filteredArray = data[field.name].filter(file => file.filename instanceof File);
                            if (hasFileInstance) {
                                data[field.name].forEach((file) => {
                                    if (file.filename instanceof File) {
                                        formData.append(field.name, file.filename);
                                    }
                                });

                                filteredArray = filteredArray.map((obj) => {
                                    return {
                                        ...obj,
                                        filename: obj.filename['name']
                                    }
                                });
                                formData.append('folder_attachment_ids', JSON.stringify(filteredArray));
                            }
                        }
                    } else {
                        formData.append(field.name, data[field.name]);
                    }
                } else {
                    // Add non-file fields to normalData
                    normalData[field.name] = field.type === 'checkbox' || field.type === 'multidropdown' ? Array.isArray(data[field.name]) ? data[field.name].join(',') : data[field.name] : data[field.name];
                }
            }
        });

        formData.append("data", JSON.stringify(normalData));
        formData.append("id", data.id);
        setLoading(true);

        try {
            const saveTemplateData = await api.post("/templateData/updateTemplateData", formData);
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
                    onOpen: () => loadTableData(paginationCount)
                });
            } else {
                const errorMessage = saveTemplateData.message ? saveTemplateData.message : "Failed to create the profile. Please try again.";
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

    const onSaveTemplateError = (error) => {
        setIsValid(false);
    }

    const handleNextPage = () => {
        setPaginationCount((prev) => prev + 1)
    }

    const handlePrevPage = () => {
        setPaginationCount((prev) => prev - 1)
    }

    const showIndivitualAttachment = async (attachmentName) => {
        if (showAttachmentKey['attachments'] && showAttachmentKey['attachments'].length > 0) {
            var payloadFile = showAttachmentKey['attachments'].filter((attachment) => attachment.attachment_name === attachmentName);

            if (payloadFile && payloadFile[0] && payloadFile[0].profile_attachment_id) {
                setLoading(true);
                try {
                    var response = await api.post("/templateData/downloadDocumentAttachments/" + payloadFile[0].profile_attachment_id);
                    setLoading(false);
                    if (response && response instanceof Blob) {
                        let fileUrl = URL.createObjectURL(response);
                        let newTab = window.open();
                        newTab.document.body.innerHTML = `<embed src="${fileUrl}" width="100%" height="100%" />`;
                    } else {
                        console.log('Unexpected response format:', response);
                    }
                } catch (error) {
                    setLoading(false);
                    console.log(error, "error");
                }
            } else {
                console.log("cant get the file");
            }
        }
    }

    const downloadReportModal = () => {
        setShowDownloadModal(true)
    }

    const handleCheckBoxChange = (fieldName, fieldCode, selectedValue) => {
        setShowSelectedDownloadData(prevData => {
            const updatedField = prevData[fieldName] || [];

            if (selectedValue) {
                if (!updatedField.includes(fieldCode)) {
                    return {
                        ...prevData,
                        [fieldName]: [...updatedField, fieldCode],
                    };
                }
            } else {
                return {
                    ...prevData,
                    [fieldName]: updatedField.filter(code => code !== fieldCode),
                };
            }

            return prevData;
        });
    };

    const callDownloadReportApi = async () => {

        if (!showSelectedDownloadData || !showSelectedDownloadData['downloadHeaders'] || showSelectedDownloadData['downloadHeaders'].length === 0) {
            toast.error('Please Select Atleast One Field Before Download  !', {
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
            "table_name": table_name,
            "fields": showSelectedDownloadData['downloadHeaders']
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
                a.download = `${table_name}_Report.xlsx`;

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

    useEffect(()=>{

        if(searchParams){
            const searchParamsid = searchParams.get("id");
            const searchParamsTableName = searchParams.get("tableName");
    
            if((searchParamsid && searchParamsid !== '') || (searchParamsTableName && searchParamsTableName !== '')){
    
                hyperLinkShow({
                    id : searchParamsid,
                    table : searchParamsTableName
                });
            }
        }
    },[])


    // Advance filter functions


    const setFilterData = () => {
        setPaginationCount(1);
        setShowFilterModal(false);
        setForceTableLoad((prev) => !prev);
    };

    const handleFilter = async () => {            
        setShowFilterModal(true);
    };

    const handleClear = () => {
        setSearchValue("");
        setFromDateValue(null);
        setToDateValue(null);
        setForceTableLoad((prev) => !prev);
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
        
        if(!table_name){
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
            "table_name": table_name,
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
                a.download = `${table_name}_Report.xlsx`;

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

        if(!table_name){
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

            const rowExcelData = jsonData.map(({ __rowNum__, ...rest }) => ({...rest }));

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
                "table_name" : table_name,
                "rowData" : rowExcelData,
                "columnData": headerColumn,
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
                        onOpen: () => { loadTableData(paginationCount) }
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
        <Box p={2} inert={loading ? true : false}>
            <>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                        <Box onClick={() => navigate(-1, { state: { pagination: pagination } })} sx={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
                            <img src='./arrow-left.svg' />
                            <Typography variant="h1" align="left" className='ProfileNameText'>
                                {template_name ? template_name.toLowerCase().replace(/^\w|\s\w/, (c) => c.toUpperCase()) : 'Back'}
                            </Typography>
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "end",
                            }}
                        >
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
                                                sx={{ padding: "0 5px", borderRadius: "0" }}
                                                onClick={handleFilter}
                                            >
                                                <FilterListIcon sx={{ color: "#475467" }} />
                                            </IconButton>
                                        </Box>
                                    ),
                                }}
                                onInput={(e) => setSearchValue(e.target.value)}
                                value={searchValue}
                                id="tableSearch"
                                size="small"
                                placeholder="Search"
                                variant="outlined"
                                className="profileSearchClass"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        setFilterData()
                                    }
                                }}
                                sx={{
                                    width: "350px",
                                    borderRadius: "6px",
                                    outline: "none",
                                    "& .MuiInputBase-input::placeholder": {
                                        color: "#475467",
                                        opacity: "1",
                                        fontSize: "14px",
                                        fontWeight: "400",
                                        fontFamily: "Roboto",
                                    },
                                }}
                            />
                            {(  searchValue ||
                                fromDateValue ||
                                toDateValue ||
                                Object.keys(filterValues).length > 0) && (
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
                            onClick={() => getTemplate(table_name)}
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

                        {
                            localStorage.getItem('authAdmin') === "false" &&
                            <Button onClick={downloadReportModal} variant="contained" sx={{ background: '#32D583', color: '#101828', textTransform: 'none', height: '38px' }}>
                                Download Report
                            </Button>
                        }

                        <Button
                            variant="contained"
                            color="success"
                            size="large"
                            sx={{ height: "38px" }}
                            onClick={showBulkUploadScreen}
                        >
                            Bulk Upload
                        </Button>

                    </Box>
                </Box>
                {
                        localStorage.getItem('authAdmin') === "false" &&
                <Box pt={1} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

                        <Box className="parentFilterTabs">
                            <Box onClick={() => { setStarFlag(null); setReadFlag(null); setPaginationCount(1) }} id="starNull" className={`filterTabs ${(starFlag === null && readFlag === null) ? 'Active' : ''}`} >
                                All
                            </Box>
                            <Box onClick={() => { setStarFlag(true); setReadFlag(null); setPaginationCount(1) }} id="starTrue" className={`filterTabs ${starFlag === true ? 'Active' : ''}`} >
                                Starred
                            </Box>
                            <Box onClick={() => { setStarFlag(null); setReadFlag(true); setPaginationCount(1) }} id="dataUbRead" className={`filterTabs ${readFlag === true ? 'Active' : ''}`} >
                                Read
                            </Box>
                            <Box onClick={() => { setStarFlag(null); setReadFlag(false); setPaginationCount(1) }} id="dataUbRead" className={`filterTabs ${readFlag === false ? 'Active' : ''}`} >
                                Unread
                            </Box>
                        </Box>

                    <TextFieldInput InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon sx={{ color: '#475467' }} />
                            </InputAdornment>
                        ),
                        endAdornment: (
                            searchValue && (
                                <IconButton sx={{ padding: 0 }} onClick={handleClear} size="small">
                                    <ClearIcon sx={{ color: '#475467' }} />
                                </IconButton>
                            )
                        )
                    }}
                        onInput={(e) => setSearchValue(e.target.value)}
                        value={searchValue}
                        id="tableSearch"
                        size="small"
                        placeholder='Search'
                        variant="outlined"
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                loadTableData(paginationCount, e.target.value);
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
                }
                <Box py={2}>
                    <TableView 
                        rows={tableData} 
                        columns={viewTemplateTableColumns} 
                        totalPage={totalPage} 
                        totalRecord={totalRecord} 
                        paginationCount={paginationCount} 
                        handlePagination={handlePagination} 
                    />
                </Box>
            </>
            {formOpen &&
                <DynamicForm
                    table_row_id={selectedRowId}
                    template_id={selectedTemplateId}
                    linkToLeader={linkLeader}
                    linkToOrganization={linkOrganization}
                    table_name={table_name}
                    template_name={template_name}
                    readOnly={viewReadonly}
                    editData={editTemplateData}
                    onUpdate={onUpdateTemplateData}
                    formConfig={formTemplateData}
                    stepperData={stepperData}
                    initialData={initialData}
                    onSubmit={onSaveTemplateData}
                    onError={onSaveTemplateError}
                    closeForm={() => {
                        setFormOpen(false);
                        setSaveNew(null);
                    }}
                />
            }

            {showOptionModal &&
                <Dialog
                    open={showOptionModal}
                    onClose={() => setShowOptionModal(false)}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">Filters</DialogTitle>
                    <DialogContent sx={{ minWidth: '400px' }}>
                        <DialogContentText id="alert-dialog-description">
                            <FormControl fullWidth>

                            </FormControl>
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions sx={{ padding: '12px 24px' }}>
                        <Button onClick={() => setShowOptionModal(false)}>Cancel</Button>
                        <Button className='fillPrimaryBtn'>Submit</Button>
                    </DialogActions>
                </Dialog>
            }

            {showAttachmentModal &&
                <Dialog
                    open={showAttachmentModal}
                    onClose={() => setShowAttachmentModal(false)}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} >
                        Attachments
                        <IconButton
                            aria-label="close"
                            onClick={() => setShowAttachmentModal(false)}
                            sx={{ color: (theme) => theme.palette.grey[500] }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </DialogTitle>
                    <DialogContent sx={{ minWidth: '400px' }}>
                        <DialogContentText id="alert-dialog-description">
                            <FormControl fullWidth>
                                {
                                    showAttachmentData && showAttachmentData.length > 0 && showAttachmentData.map((data, i) => (
                                        <Box onClick={() => showIndivitualAttachment(data)} key={i} my={1} px={2} sx={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                            <span style={{ display: 'flex' }}>{getFileIcon(data)}</span>
                                            <span className="Roboto attachmentTableName">{data}</span>
                                        </Box>
                                    ))
                                }
                            </FormControl>
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions sx={{ padding: '12px 24px' }}>
                        <Button onClick={() => setShowAttachmentModal(false)}>Close</Button>
                    </DialogActions>
                </Dialog>
            }

            {showDownloadModal &&
                <Dialog
                    open={showDownloadModal}
                    onClose={() => setShowDownloadModal(false)}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                    maxWidth="md"
                    fullWidth
                >
                    <DialogTitle id="alert-dialog-title" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} >
                        Download Report
                        <IconButton
                            aria-label="close"
                            onClick={() => setShowDownloadModal(false)}
                            sx={{ color: (theme) => theme.palette.grey[500] }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            <FormControl fullWidth>
                                <h4 className="form-field-heading">Columns of Reports</h4>
                                <Grid container spacing={2}>
                                    {
                                        showDownloadData && showDownloadData.map((fieldName, index) => {
                                            return (
                                                <Grid item xs={12} md={6} key={index}>
                                                    <Checkbox
                                                        name="downloadHeaders"
                                                        id={fieldName}
                                                        value={fieldName}
                                                        checked={showSelectedDownloadData['downloadHeaders']?.includes(fieldName) || false}
                                                        onChange={(e) =>
                                                            handleCheckBoxChange('downloadHeaders', fieldName, e.target.checked)
                                                        }
                                                    />
                                                    <label htmlFor={fieldName} style={{ fontSize: '14px' }}>
                                                        {fieldName.replace(/^field_/, "").replace(/_/g, " ").toLowerCase().replace(/^\w|\s\w/g, (c) => c.toUpperCase()) || ""}
                                                    </label>
                                                </Grid>
                                            )
                                        })
                                    }
                                </Grid>
                            </FormControl>
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions sx={{ padding: '12px 24px' }}>
                        <Button onClick={() => setShowDownloadModal(false)}>Close</Button>
                        <Button variant="outlined" onClick={() => callDownloadReportApi()}>Download</Button>
                    </DialogActions>
                </Dialog>
            }

            {
                loading && <div className='parent_spinner' tabIndex="-1" aria-hidden="true">
                    <CircularProgress size={100} />
                </div>
            }

            {showFilterModal && (
                <Dialog
                    open={showFilterModal}
                    onClose={() => setShowFilterModal(false)}
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
                        onClick={() => setShowFilterModal(false)}
                        sx={{ color: (theme) => theme.palette.grey[500] }}
                    >
                        <CloseIcon />
                    </IconButton>
                    </DialogTitle>
                    <DialogContent sx={{ minWidth: "400px" }}>
                    <DialogContentText id="alert-dialog-description">
                        <Grid container sx={{ alignItems: "center" }}>
                        <Grid item xs={12} md={6} p={2}>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                                format="DD-MM-YYYY"
                                sx={{
                                width: "100%",
                                }}
                                label="From Date"
                                value={fromDateValue ? dayjs(fromDateValue) : null}
                                onChange={(e) =>
                                setFromDateValue(e ? e.format("YYYY-MM-DD") : null)
                                }
                            />
                            </LocalizationProvider>
                        </Grid>
        
                        <Grid item xs={12} md={6} p={2}>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                                format="DD-MM-YYYY"
                                sx={{
                                width: "100%",
                                }}
                                label="To Date"
                                value={toDateValue ? dayjs(toDateValue) : null}
                                onChange={(e) =>
                                setToDateValue(e ? e.format("YYYY-MM-DD") : null)
                                }
                            />
                            </LocalizationProvider>
                        </Grid>
                        </Grid>
                    </DialogContentText>
                    </DialogContent>
                    <DialogActions sx={{ padding: "12px 24px" }}>
                    <Button onClick={() => setShowFilterModal(false)}>Close</Button>
                    <Button
                        className="fillPrimaryBtn"
                        sx={{ minWidth: "100px" }}
                        onClick={() => setFilterData()}
                    >
                        Apply
                    </Button>
                    </DialogActions>
                </Dialog>
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
                            Please check Excel header before upload. If needed,
                            <Link onClick={downloadExcelHeader} underline="hover" sx={{cursor: 'pointer'}}>
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

        </Box>
    )
};

export default ProfileData;