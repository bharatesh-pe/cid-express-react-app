import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import DynamicForm from "../components/dynamic-form/DynamicForm";
import NormalViewForm from "../components/dynamic-form/NormalViewForm";
import TableView from "../components/table-view/TableView";
import api from "../services/api";
import VerifiedIcon from '@mui/icons-material/Verified';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import HistoryIcon from '@mui/icons-material/History';
import PersonOffIcon from '@mui/icons-material/PersonOff';

import {
  Box,
  Button,
  FormControl,
  InputAdornment,
  Typography,
  IconButton,
  Checkbox,
  Grid,
  Autocomplete,
  TextField,
  Tooltip,
  Chip,
} from "@mui/material";
import TextFieldInput from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

import SelectAllIcon from '@mui/icons-material/SelectAll';
import ClearIcon from "@mui/icons-material/Clear";
import SearchIcon from "@mui/icons-material/Search";
import ASC from "@mui/icons-material/North";
import DESC from "@mui/icons-material/South";
import AddIcon from "@mui/icons-material/Add";
import filterLines from "../Images/filterLines.svg";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import pdfIcon from "../Images/pdfIcon.svg";
import docIcon from "../Images/docIcon.svg";
import docxIcon from "../Images/docxIcon.svg";
import xlsIcon from "../Images/xlsIcon.svg";
import pptIcon from "../Images/pptIcon.svg";
import jpgIcon from "../Images/jpgIcon.svg";
import pngIcon from "../Images/pngIcon.svg";
import CloseIcon from "@mui/icons-material/Close";
import { CircularProgress } from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import FilterListIcon from "@mui/icons-material/FilterList";

import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import SelectField from "../components/form/Select";
import MultiSelect from "../components/form/MultiSelect";
import AutocompleteField from "../components/form/AutoComplete";
import DateField from "../components/form/Date";
import LongText from "../components/form/LongText";
import ApprovalModal from '../components/dynamic-form/ApprovalModalForm';
import GenerateProfilePdf from "./GenerateProfilePdf";
import WestIcon from '@mui/icons-material/West';
import FileInput from "../components/form/FileInput";
import DateTimeField from "../components/form/DateTime";
import TimeField from "../components/form/Time";

const UnderInvestigation = () => {
  const location = useLocation();
  const navigate = useNavigate();

    const { pageCount, record_id, dashboardName, actionKey } = location.state || {};

    const [dashboardTileName, setDashboardTileName] = useState(dashboardName ? dashboardName : "");
    const [dashboardRecordId, setDashboardRecordId] = useState(record_id ? JSON.parse(record_id) : []);

    const [saveNew, setSaveNew] = useState(null);

  const [showOptionModal, setShowOptionModal] = useState(false);
  const [paginationCount, setPaginationCount] = useState(pageCount ? pageCount : 1);
  const [tableSortOption, settableSortOption] = useState("DESC");
  const [tableSortKey, setTableSortKey] = useState("");
  const [isCheckboxSelected, setIsCheckboxSelected] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [isValid, setIsValid] = useState(false);
  const [searchValue, setSearchValue] = useState(null);
  const [linkLeader, setLinkLeader] = useState(false);
  const [linkOrganization, setLinkOrganization] = useState(false);
  const [template_name, setTemplate_name] = useState("");
  const [table_name, setTable_name] = useState("");

  const [sysStatus, setSysSattus] = useState("pt_case");

  const [stepperData, setstepperData] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [formTemplateData, setFormTemplateData] = useState([]);
  const [initialData, setInitialData] = useState({});
  const [viewReadonly, setviewReadonly] = useState(false);
  const [editTemplateData, setEditTemplateData] = useState(false);
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [selectedRowIds, setSelectedRowIds] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);

  const [otherFormOpen, setOtherFormOpen] = useState(false);
  const [optionStepperData, setOptionStepperData] = useState([]);
  const [optionFormTemplateData, setOptionFormTemplateData] = useState([]);

  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [showDownloadData, setShowDownloadData] = useState([]);
  const [showSelectedDownloadData, setShowSelectedDownloadData] = useState({});

  const [showAttachmentModal, setShowAttachmentModal] = useState(false);
  const [showAttachmentKey, setShowAttachmentKey] = useState(null);
  const [showAttachmentData, setShowAttachmentData] = useState([]);

  const [starFlag, setStarFlag] = useState(null);
  const [readFlag, setReadFlag] = useState(null);

  const [loading, setLoading] = useState(false); // State for loading indicator

  const searchParams = new URLSearchParams(location.search);

  const [viewTemplateTableColumns, setviewTemplateTableData] = useState([
    { field: "sl_no", headerName: "S.No" },
  ]);

  const [otherTemplateModalOpen, setOtherTemplateModalOpen] = useState(false);
  const [selectedOtherTemplate, setselectedOtherTemplate] = useState({});
  const [otherTemplateData, setOtherTemplateData] = useState([]);
  const [otherInitialTemplateData, setOtherInitialTemplateData] = useState([]);
  const [otherReadOnlyTemplateData, setOtherReadOnlyTemplateData] =
    useState(false);
  const [otherEditTemplateData, setOtherEditTemplateData] = useState(false);
  const [otherRowId, setOtherRowId] = useState(null);
  const [otherTemplateId, setOtherTemplateId] = useState(null);
  const [otherTemplateColumn, setOtherTemplateColumn] = useState([
    { field: "sl_no", headerName: "S.No" },
  ]);

  const [hoverTableOptions, setHoverTableOptions] = useState([]);

  const [otherTablePagination, setOtherTablePagination] = useState(1);
  // const [isIoAuthorized, setIsIoAuthorized] = useState(true);
  // for actions

  const [selectedRow, setSelectedRow] = useState({});
  const [templateApproval, setTemplateApproval] = useState(false);
  const [templateApprovalData, setTemplateApprovalData] = useState({});
  const [disposalUpdate, setDisposalUpdate] = useState(false);

  // transfer to other division states

  const [showOtherTransferModal, setShowOtherTransferModal] = useState(false);
  const [otherTransferField, setOtherTransferField] = useState([]);
  const [selectedOtherFields, setSelectedOtherFields] = useState(null);
  const [selectKey, setSelectKey] = useState(null);

  // for approve states

  const [approveTableFlag, setApproveTableFlag] = useState(false);
  const [addApproveFlag, setAddApproveFlag] = useState(false);

  const [approvalsData, setApprovalsData] = useState([]);
  const [approvalsColumn, setApprovalsColumn] = useState([
    { field: "sl_no", headerName: "S.No" },
    { field: "approvalItem", headerName: "Approval Item", flex: 1 },
    { field: "approvedBy", headerName: "Approved By", flex: 1 },
    { field: "approval_date", headerName: "Approval Date", flex: 1 },
    { field: "remarks", headerName: "Remarks", flex: 1 },
  ]);
  const [approvalItem, setApprovalItem] = useState([]);
  const [designationData, setDesignationData] = useState([]);

  const [randomApprovalId, setRandomApprovalId] = useState(0);

  const [approvalSaveData, setApprovalSaveData] = useState({});

  const handleApprovalSaveData = (name, value) => {
    setApprovalSaveData({
      ...approvalSaveData,
      [name]: value,
    });
  };

  const [showPtCaseModal, setShowPtCaseModal] = useState(false);
  const [ptCaseTableName, setPtCaseTableName] = useState(null);
  const [ptCaseTemplateName, setPtCaseTemplateName] = useState(null);

  const [selectedRowData, setSelectedRowData] = useState(null);

  // change sys_status

  // filter states
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterDropdownObj, setfilterDropdownObj] = useState([]);
  const [filterValues, setFilterValues] = useState({});
  const [fromDateValue, setFromDateValue] = useState(null);
  const [toDateValue, setToDateValue] = useState(null);
  const [forceTableLoad, setForceTableLoad] = useState(false);

  const [furtherInvestigationPtCase, setFurtherInvestigationPtCase] = useState(false);
  const [furtherInvestigationSelectedRow, setFurtherInvestigationSelectedRow] = useState([]);
  const [furtherInvestigationSelectedValue, setFurtherInvestigationSelectedValue] = useState(null);
  const [disabledApprovalItems, setDisabledApprovalItems] = useState(false);

  const [newApprovalPage, setNewApprovalPage] = useState(false);
  const [approvalItemDisabled, setApprovalItemDisabled] = useState(false);

    // on save approval modal
    const [isFromEdit, setIsFromEdit] = useState(false);
    const [selectedApprovalEdit,setSelectedApprovalEdit] = useState(null);

    const [showApprovalModal, setShowApprovalModal] = useState(false);
    const [approvalItemsData, setApprovalItemsData] = useState([]);
    const [readonlyApprovalItems, setReadonlyApprovalItems] = useState(false);
    const [approvalDesignationData, setApprovalDesignationData] = useState([]);
    const [approvalFormData, setApprovalFormData] = useState({});
    const [approvalSaveCaseData, setApprovalSaveCaseData] = useState({});

  const [singleApiData, setSingleApiData] = useState({});

    const [isDownloadPdf, setIsDownloadPdf] = useState(false);
    const [downloadPdfFields, setDownloadPdfFields] = useState({});
    const [downloadPdfData, setDownloadPdfData] = useState([]);
    const [isPrint, setIsPrint] = useState(false);

    const [otherTemplatesTotalPage, setOtherTemplatesTotalPage] = useState(0);
    const [otherTemplatesTotalRecord, setOtherTemplatesTotalRecord] = useState(0);
    const [otherTemplatesPaginationCount, setOtherTemplatesPaginationCount] = useState(1);
    const [otherSearchValue, setOtherSearchValue] = useState('');

    const [othersFilterModal, setOthersFilterModal] = useState(false);
    const [othersFromDate, setOthersFromDate] = useState(null);
    const [othersToDate, setOthersToDate] = useState(null);
    const [othersFiltersDropdown, setOthersFiltersDropdown] = useState([]);
    const [othersFilterData, setOthersFilterData] = useState({});
    const [listApprovalsData, setListApprovalsData] = useState([]);
    const [listApproveTableFlag, setListApproveTableFlag] = useState(false);
    const [listAddApproveFlag, setListAddApproveFlag] = useState(false);
    const [listApprovalCaseNo, setListApprovalCaseNo] = useState("");
    const [listApprovalsColumn, setListApprovalsColumn] = useState([
        { field: "sl_no", headerName: "S.No", width: 80 },
        { field: "approvalItem", headerName: "Approval Item", width: 150 },
        { field: "approvedBy", headerName: "Approved By", width: 140 },
        { field: "approval_date", headerName: "Approval Date", width: 150 },
        { field: "remarks", headerName: "Remarks", width: 120 },
    ]);
    const [listApprovalCaseData, setListApprovalCaseData] = useState({});
    const [logs, setLogs] = useState([]);
    const [openLogDialog, setOpenLogDialog] = useState(false);
    const [LogDialogTitle, SetLogDialogTitle] = useState("");
    const [activityLogs,setActivityLogs] = useState([]);
    const [openActivityLogDialog, setOpenActivityLogDialog] = useState(false);
    const [listApprovalCaseId, setListApprovalCaseId] = useState(null);
    const approvalFieldHistoryHeader = [
      { field: "sno", headerName: "S.No", width: 70 },
      { field: "old_value", headerName: "Old Value", width: 150 },
      { field: "updated_value", headerName: "New Value", width: 150 },
      { field: "created_by", headerName: "Created By", width: 150 },
      { field: "created_at", headerName: "Updated At", width: 200 }
    ];
    
    const approvalFieldHistory = logs.map((log, index) => ({
      id: index,
      sno: index + 1,
      old_value: log.old_value,
      updated_value: log.updated_value,
      created_by: log.created_by,
      created_at: new Date(log.created_at).toLocaleString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).replace(",", "").replace(":", ".")
    }));
    

    const approvalActivityHistoryHeader = [
      { field: "sno", headerName: "S.No", width: 70 },
      { field: "approval_item_id", headerName: "Approval Item", width: 150 },
      { field: "approved_by", headerName: "Approved By", width: 150 },
      // { field: "approved_date", headerName: "Approved Date", width: 150 },
      { field: "created_by", headerName: "Created By", width: 150 },
      { field: "created_at", headerName: "Created At", width: 200 }
    ];
    
    const approvalActivityHistory = activityLogs.map((log, index) => ({
      id: index,
      sno: index + 1,
      approval_item_id: log.approval_item_id,
      approved_by: log.approved_by,
      // approved_date: log.approved_date,
      created_by: log.created_by,
      created_at: new Date(log.created_at).toLocaleString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }).replace(",", "").replace(":", ".")
    }));
    
    const listApprovalActionColumn = {
        field: "actions",
        headerName: "Actions",
        width: 300,
        sortable: false,
        renderCell: (params) => {
            const row = params.row;

            const handleListApprovalView = () => {
                setListApprovalSaveData(row);
                setListApprovalItemDisabled(true);
                setListAddApproveFlag(true);
                setListApproveTableFlag(true);
            };

            const handleListApprovalEdit = () => {
                setListApprovalSaveData(row);
                setListApprovalItemDisabled(false);
                setListAddApproveFlag(true);
                setListApproveTableFlag(true);
            };

            const handleListApprovalDelete = async () => {
                const result = await Swal.fire({
                    title: "Are you sure?",
                    text: "This action will permanently delete the approval record.",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonText: "Yes, Delete it!",
                    cancelButtonText: "No",
                });

                if (result.isConfirmed) {
                    setLoading(true);
                    try {
                        const response = await api.post("/ui_approval/delete_ui_case_approval", {
                            approval_id: row.approval_id,
                            transaction_id: `approval_delete_${Date.now()}`,
                        });

                        if (response && response.success) {
                            toast.success('The approval record has been deleted.', {
                                position: "top-right",
                                autoClose: 3000,
                                hideProgressBar: false,
                                closeOnClick: true,
                                pauseOnHover: true,
                                draggable: true,
                                progress: undefined,
                                className: "toast-success",
                            });
                            // showApprovalListPage(row)
                            setListApprovalTotalRecord(0);
                            setListApprovalTotalPage(0);
                            setListApproveTableFlag(false);
                        } else {
                            toast.error(response?.message || "Could not delete the record.", {
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
                         setLoading(false);
                    } catch (error) {
                        console.error("Delete error:", error);
                        toast.error('Something went wrong during deletion.', {
                            position: "top-right",
                            autoClose: 3000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                            progress: undefined,
                            className: "toast-error",
                        });
                         setLoading(false);
                    }
                }
            };

            return (
                <Box sx={{ display: "flex", gap: 1 , marginTop: '4px' }}>
                    <Button variant="outlined" onClick={handleListApprovalView}>
                        View
                    </Button>
                    <Button variant="contained" color="primary" onClick={handleListApprovalEdit} >
                        Edit
                    </Button>
                    <Button variant="contained" color="error" onClick={handleListApprovalDelete}>
                        Delete
                    </Button>
                </Box>
            );
        }
    };

  
    const [listApprovalItem, setListApprovalItem] = useState([]);
    const [listApprovalItemDisabled, setListApprovalItemDisabled] = useState(false);
    const [listDesignationData, setListDesignationData] = useState([]);
    const [listRandomApprovalId, setListRandomApprovalId] = useState(0);
    const [listApprovalSaveData, setListApprovalSaveData] = useState({});
    const [listApprovalTotalRecord, setListApprovalTotalRecord] = useState(0);
    const [listApprovalTotalPage, setListApprovalTotalPage] = useState(0);
    const [listApprovalPaginationCount, setListApprovalPaginationCount] = useState(1);
    const listApprovalPagination = (page) => {
        setListApprovalPaginationCount(page)
    }
    const [listApprovalSearchValue,setListApprovalSearchValue] =  useState('');
    const [listApprovalFromDate,setListApprovalFromDate] =  useState(null);
    const [listApprovalToDate,setListApprovalToDate] =  useState(null);
    const [listApprovalFiltersDropdown,setListApprovalFiltersDropdown] =  useState([]);
    const [listApprovalFilterData,setListApprovalFilterData] =  useState({});
    const [viewModeOnly,setViewModeOnly] = useState(false);
    const [isApprovalSaveMode, setIsApprovalSaveMode] = useState(true);
    const [forceListApprovalTableLoad, setForceListApprovalTableLoad] = useState(false);

    var userPermissions = JSON.parse(localStorage.getItem("user_permissions")) || [];

    const templateActionAddFlag = useRef(false);
    const fieldActionAddFlag = useRef(false);
    const attachmentEditFlag = useRef(false);

    const [showFileAttachment, setShowFileAttachments] = useState(false);

    const hoverTableOptionsRef = useRef([]);
    
    useEffect(() => {
        var filteredActions =  hoverTableOptions || [];
        hoverTableOptionsRef.current = filteredActions;
    }, [hoverTableOptions]);

     useEffect(() => {
            setListApprovalSearchValue("");
            showApprovalListPage(listApprovalCaseData);
    }, [forceListApprovalTableLoad]);

    const handleListApprovalClear = ()=>{
        setListApprovalSearchValue("");
        setListApprovalPaginationCount(1);
        setListApprovalFromDate(null);
        setListApprovalToDate(null);
        setListApprovalFiltersDropdown([]);
        setListApprovalFilterData({});
        setForceListApprovalTableLoad((prev) => !prev);
    }

    const handleListApprovalSaveData = (name, value) => {
        setListApprovalSaveData({
        ...listApprovalSaveData,
        [name]: value,
        });
    };

    const handleUpdateApproval = async () => {
        setLoading(true);

        try {
            const { approval_item, approved_by, approval_date, remarks, approval_id } = listApprovalSaveData;
            
            // Ensure DD/MM/YYYY format is parsed properly
            const parsedDate = dayjs(approval_date, "DD/MM/YYYY", true);
            const formattedApprovalDate = parsedDate.isValid() ? parsedDate.toISOString() : null;

            if (!approval_item || !approved_by || !formattedApprovalDate) {
                toast.error('Please fill in all required fields.', {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    className: "toast-error",
                });
                setLoading(false);
                return;
            }

            const payloadObj = {
            approval_id,
            approval_item,
            approved_by,
            approval_date:formattedApprovalDate,
            remarks,
            module: "ui_case_module",
            action: "update",    
            transaction_id:  `approval_${Date.now()}_${Math.floor( Math.random() * 1000 )}`, 
            created_by_designation_id: localStorage.getItem("designation_id") ? localStorage.getItem("designation_id") : "",
            created_by_division_id: localStorage.getItem("division_id") ? localStorage.getItem("division_id") : "",
            case_id : listApprovalCaseId,
            };

            const response = await api.post(
            "/ui_approval/update_ui_case_approval",
            payloadObj
            );

            setLoading(false);

            if (response && response.success)
            {
                toast.success('Approval updated successfully', {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    className: "toast-success",
                });
                // showApprovalListPage(listApprovalSaveData)
                setListApproveTableFlag(false);
            } else {
                toast.error('Failed to update approval', {
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
            console.error("Update error:", error);
            toast.error('Something went wrong', {
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
    };

    const handleOtherPagination = (page) => {
        setOtherTemplatesPaginationCount(page)
    }

    useEffect(()=>{
        handleOtherTemplateActions(selectedOtherTemplate, selectedRowData)
    },[otherTemplatesPaginationCount, ]);

    const handleOtherClear = ()=>{
        setOtherSearchValue('');
        setOtherTemplatesPaginationCount(1);
        setOthersFromDate(null);
        setOthersToDate(null);
        setOthersFiltersDropdown([]);
        setOthersFilterData({});
        handleOtherTemplateActions(selectedOtherTemplate, selectedRowData, true)
    }

    const setOtherFilterData = () => {
        setOtherTemplatesPaginationCount(1);
        setOthersFilterModal(false);
        handleOtherTemplateActions(selectedOtherTemplate, selectedRowData)
    };

    const handleOthersFilter = async (selectedOptions)=>{

        if(!selectedOptions?.table){
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

     const otherTemplateTrailUpdate = async (data) => {
      
        if (!data.id || !data.options?.table) {
          toast.warning("Please Check the Template", {
            position: "top-right",
            autoClose: 3000,
            className: "toast-warning",
          });
          return;
        }
      
        const updateFields = {};
      
        if (data.hasOwnProperty("field_served_or_unserved")) {
          updateFields.field_served_or_unserved = data.field_served_or_unserved;
        }
        
        if (data.hasOwnProperty("field_reappear")) {
          updateFields.field_reappear = data.field_reappear;
        }
        
        
        const formData = new FormData();
        formData.append("table_name", data.options.table);
        formData.append("id", data.id);
        formData.append("data", JSON.stringify(updateFields));
      
        setLoading(true);
      
        try {
          const saveTemplateData = await api.post(
            "/templateData/updateTemplateData",
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );
        
          setLoading(false);
      
          if (saveTemplateData && saveTemplateData.success) {
            localStorage.removeItem(data.name + "-formData");
      
            toast.success(saveTemplateData.message || "Data Updated Successfully", {
              position: "top-right",
              autoClose: 3000,
              className: "toast-success",
            });
      
            handleOtherTemplateActions(data.options, selectedRow);
      
            setOtherEditTemplateData(false);
            setOtherReadOnlyTemplateData(false);
            setTemplateApprovalData({});
            setTemplateApproval(false);
            setAddApproveFlag(false);
            setApproveTableFlag(false);
            setApprovalSaveData({});
          } else {
            const errorMessage = saveTemplateData?.message || "Failed to update the template. Please try again.";
            toast.error(errorMessage, {
              position: "top-right",
              autoClose: 3000,
              className: "toast-error",
            });
          }
        } catch (error) {
          setLoading(false);
          console.error("API Error:", error);
      
          toast.error(
            error?.response?.data?.message || error?.message || "Please Try Again!",
            {
              position: "top-right",
              autoClose: 3000,
              className: "toast-error",
            }
          );
        }
      };
      
      const handleServedUnserved = (row, options) => {
        Swal.fire({
          title: "Mark as Served?",
          text: "Do you want to mark this case as Served?",
          icon: "question",
          showCancelButton: true,
          confirmButtonText: "Served",
          cancelButtonText: "UnServed",
          reverseButtons: false,
        }).then((result) => {
          if (result.isConfirmed) {
            const updatedRow = {
              id: row.id,
              options: options,
              field_served_or_unserved: "Yes",
            };
            otherTemplateTrailUpdate(updatedRow);
          } else if (result.dismiss === Swal.DismissReason.cancel) {
            const updatedRow = {
              id: row.id,
              options: options,
              field_served_or_unserved: "No",
            };
            otherTemplateTrailUpdate(updatedRow);
          }
        });
      };  
      
      const handleReappear = (row, options) => {
        Swal.fire({
          title: "Mark for Reappear?",
          text: "Do you want to mark this case as Reappear?",
          icon: "question",
          showCancelButton: true,
          confirmButtonText: "Yes, Reappear it!",
          cancelButtonText: "No",
          reverseButtons: false,
        }).then((result) => {
          if (result.isConfirmed) {
            const updatedRow = {
              id: row.id,
              options: options,
              field_reappear: "Yes",
            };
            otherTemplateTrailUpdate(updatedRow);
          }else if (result.dismiss === Swal.DismissReason.cancel) {
            const updatedRow = {
              id: row.id,
              options: options,
              field_reappear: "No",
            };
            otherTemplateTrailUpdate(updatedRow);
          }
        });
      };
    const [totalPage, setTotalPage] = useState(0);
    const [totalRecord, setTotalRecord] = useState(0);
    
    const handlePagination = (page) => {
        setPaginationCount(page)
    }
    
    const handleOnSavePdf = () => {
        setIsDownloadPdf(false);
        setLoading(false);
        setIsPrint(false);
    };

    const getPdfContentData = async (rowData, isPrint, table_name) => {
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
            const viewTemplateData = await api.post("/templateData/viewMagazineTemplateData",viewTemplatePayload);
            setLoading(false);

            if (viewTemplateData && viewTemplateData.success) {

                const viewTableData = { table_name: table_name};
                setLoading(true);

                try {

                    const viewTemplateResponse = await api.post("/templates/viewTemplate",viewTableData);
                    setLoading(false);

                    if (viewTemplateResponse && viewTemplateResponse.success) {
                        setDownloadPdfData(viewTemplateData.data ? viewTemplateData.data : {});
                        setDownloadPdfFields(viewTemplateResponse.data["fields"] ? viewTemplateResponse.data["fields"] : []);
                        setIsDownloadPdf(true);
                        setLoading(true);
                        setIsPrint(isPrint);
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

    const changeSysStatus = async (data, value, text)=>{

        if(data.ui_case_id !== null && data.ui_case_id !== undefined){

            Swal.fire({
                title: 'Are you sure?',
                text: text,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes !',
                cancelButtonText: 'No',
            }).then(async (result) => {
                if (result.isConfirmed) {

                    var payloadSysStatus = {
                        table_name: table_name,
                        data: {
                            "id": data.id,
                            "sys_status": value,
                            "ui_case_id": data.ui_case_id,
                            "default_status": "pt_case"
                        },
                    };
            
                    setLoading(true);

                    try {
                        const chnageSysStatus = await api.post( "/templateData/caseSysStatusUpdation", payloadSysStatus);
                        setLoading(false);
                        if (chnageSysStatus && chnageSysStatus.success) {
                            toast.success( chnageSysStatus.message ? chnageSysStatus.message : "Status Changed Successfully", {
                                position: "top-right",
                                autoClose: 3000,
                                hideProgressBar: false,
                                closeOnClick: true,
                                pauseOnHover: true,
                                draggable: true,
                                progress: undefined,
                                className: "toast-success",
                                onOpen: () => loadTableData(paginationCount),
                            });
                        } else {
                            const errorMessage = chnageSysStatus.message ? chnageSysStatus.message : "Failed to change the status. Please try again.";
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
                            toast.error( error.response["data"].message ? error.response["data"].message : "Please Try Again !", {
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
                    console.log("sys status updation canceled.");
                }
            });
        }else{
            Swal.fire({
                title: 'Are you sure?',
                text: text,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes !',
                cancelButtonText: 'No',
            }).then(async (result) => {
                if (result.isConfirmed) {
                    setFurtherInvestigationSelectedRow(data);
                    showNewApprovalPage();
                } else {
                    console.log("sys status updation canceled.");
                }
            });
        }
    };

    const showInvestigationPtCase = async ()=>{

        var getTemplatePayload = {
            "table_name": table_name,
            "id": furtherInvestigationSelectedRow.id,
            "template_module": "ui_case"
        }
        
        setLoading(true);

        try {
            const getTemplateResponse = await api.post("/templateData/viewTemplateData", getTemplatePayload);
            setLoading(false);

            if (getTemplateResponse && getTemplateResponse.success) {
                
                if(getTemplateResponse.data && getTemplateResponse.data['template_module_data']){

                    if (!getTemplateResponse.data['template_module_data'].table_name || getTemplateResponse.data['template_module_data'].table_name === '') {
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
                        "table_name": getTemplateResponse.data['template_module_data'].table_name
                    }
                    setLoading(true);

                        try {

                            const viewTemplateResponse = await api.post("/templates/viewTemplate", viewTableData);

                            setLoading(false);
                            if (viewTemplateResponse && viewTemplateResponse.success) {

                                setFurtherInvestigationPtCase(true);

                                setOtherReadOnlyTemplateData(false);
                                setOtherEditTemplateData(false);

                                setOptionFormTemplateData(viewTemplateResponse.data['fields'] ? viewTemplateResponse.data['fields'] : []);
                                if (viewTemplateResponse.data.no_of_sections && viewTemplateResponse.data.no_of_sections > 0) {
                                    setOptionStepperData(viewTemplateResponse.data.sections ? viewTemplateResponse.data.sections : []);
                                }

                                setPtCaseTableName(getTemplateResponse.data['template_module_data'].table_name);
                                setPtCaseTemplateName(getTemplateResponse.data['template_module_data'].template_name);

                                setFurtherInvestigationSelectedValue("178_cases");
                                setShowPtCaseModal(true);

                                var sys_status = {
                                    "id": furtherInvestigationSelectedRow.id, 
                                    "sys_status": "178_cases",
                                    "default_status": "pt_case"
                                }

                                setSingleApiData({...singleApiData, sys_status : sys_status});

                                var PreDefinedData = {}

                                if(getTemplateResponse.data){
                                    viewTemplateResponse.data['fields'].map((element)=>{
                                        if(element.name && getTemplateResponse.data[element.name] !== null && getTemplateResponse.data[element.name] !== undefined){
                                            PreDefinedData[element.name] = getTemplateResponse.data[element.name];
                                        }
                                    })
                                }

                                setOtherInitialTemplateData(PreDefinedData);

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
            const viewTemplateData = await api.post("/templateData/viewTemplateData",viewTemplatePayload);
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
                    table_name: table_name,
                };

                setLoading(true);
                try {
                    const viewTemplateResponse = await api.post("/templates/viewTemplate",viewTableData);
                    setLoading(false);

                    if (viewTemplateResponse && viewTemplateResponse.success) {

                        var actionTemplateMenus = hoverTableOptionsRef.current.map((element)=>{

                            if(element?.icon && typeof element.icon === 'function'){
                                element.icon = element?.icon();
                            }

                            return element;

                        });

                        var stateObj = {
                            contentArray: JSON.stringify(actionTemplateMenus),
                            headerDetails: rowData?.["field_cc_no./sc_no"] || null,
                            backNavigation: "/case/pt_case",
                            paginationCount: paginationCount,
                            sysStatus: sysStatus,
                            rowData: viewTemplateData?.["data"] || {},
                            tableFields: viewTemplateResponse?.["data"]?.["fields"] || [],
                            stepperData: viewTemplateResponse?.["data"]?.no_of_sections > 0 && viewTemplateResponse?.["data"]?.sections ? viewTemplateResponse?.["data"].sections : [],
                            template_id : viewTemplateResponse?.["data"]?.template_id,
                            template_name : viewTemplateResponse?.["data"]?.template_name,
                            table_name: table_name,
                            module : "pt_case",
                            overAllReadonly : !viewTemplateData?.["data"]?.field_io_name ? true : false,
                            record_id : dashboardRecordId ? JSON.stringify(dashboardRecordId) : [],
                            dashboardName : dashboardTileName,
                            actionKey: actionKey
                        }

                        navigate("/caseView", {state: stateObj});

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
    };

  useEffect(() => {
    loadTableData(paginationCount);
  }, [
    paginationCount,
    tableSortKey,
    tableSortOption,
    starFlag,
    readFlag,
    sysStatus,
    forceTableLoad,
  ]);

  const handleCheckboxChangeField = (event, row) => {
    const isSelected = event.target.checked;
    setTableData((prevData) =>
      prevData.map((data) =>
        data.id === row.id ? { ...data, isSelected } : data
      )
    );
    if (isSelected) {
      setSelectedRowIds((prevIds) => [...prevIds, row.id]);
    } else {
      setSelectedRowIds((prevIds) => prevIds.filter((id) => id !== row.id));
    }
  };
  useEffect(() => {
    const anySelected = tableData.some((data) => data.isSelected);
    setIsCheckboxSelected(anySelected);
  }, [tableData]);

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
            template_module: "pt_case",
            sys_status: sysStatus,
            from_date: fromDateValue,
            to_date: toDateValue,
            filter: filterValues,
        };
    
        setLoading(true);
    
        try {
            const getTemplateResponse = await api.post( "/templateData/paginateTemplateDataForOtherThanMaster", getTemplatePayload);
    
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
                    setTemplate_name(meta.template_name);
                    setTable_name(meta.table_name);
                }
  
                if (data?.length > 0) {
                    const excludedKeys = [
                        "created_at", "updated_at", "id", "deleted_at", "attachments",
                        "Starred", "ReadStatus", "linked_profile_info",
                        "ui_case_id", "pt_case_id", "sys_status", "task_unread_count", "field_cc_no./sc_no", "field_io_name",
                        "field_name_of_the_police_station", "field_division", "field_case/enquiry_keyword"
                    ];
    
                    const generateReadableHeader = (key) =>
                        key
                            .replace(/^field_/, "")
                            .replace(/_/g, " ")
                            .toLowerCase()
                            .replace(/^\w|\s\w/g, (c) => c.toUpperCase());
    
                    const renderCellFunc = (key, count) => (params) => tableCellRender(key, params, params.value, count, meta.table_name);
    
                    const updatedHeader = [
                        // {
                        //     field: "select",
                        //     headerName: <Tooltip title="Select All"><SelectAllIcon sx={{ color: "", fill: "#1f1dac" }} /></Tooltip>,
                        //     width: 50,
                        //     resizable: false,
                        //     renderCell: (params) => (
                        //         <Box display="flex" justifyContent="center" alignItems="center" width="100%">                                
                        //             <Checkbox
                        //                 checked={params.row.isSelected || false}
                        //                 onChange={(event) => handleCheckboxChangeField(event, params.row)}
                        //             />
                        //         </Box>
                        //     ),
                        // },
                          {
                              field: "approval",
                              headerName: "Approval",
                              width: 50,
                              resizable: true,
                              cellClassName: 'justify-content-start',
                              renderHeader: (params) => (
                                  <Tooltip title="Approval"><VerifiedIcon sx={{ color: "", fill: "#1f1dac" }} /></Tooltip>
                              ),                            
                              renderCell: (params) => (
                                  <Button
                                      variant="contained"
                                      color="transparent"
                                      size="small"
                                      sx={{
                                          padding: 0,
                                          fontSize: '0.75rem',
                                          textTransform: 'none',
                                          boxShadow: 'none',
                                          '&:hover':{
                                              boxShadow: 'none',
                                          }
                                      }}
                                  >
                                      <Tooltip title="Approval"><VerifiedUserIcon color="success" onClick={()=>handleActionShow(params?.row)}  sx={{fontSize:'26px'}} /></Tooltip>
                                  </Button>
                              )
                          },
                          {
                            field: "field_cc_no./sc_no",
                            headerName: "Cc No./Sc No",
                            width: 180,
                            resizable: true,
                            cellClassName: 'justify-content-start',
                            renderHeader: (params) => (
                                tableHeaderRender(params, "field_cc_no./sc_no")
                            ),
                            renderCell: renderCellFunc("field_cc_no./sc_no", 0),
                        },
                            {
                                field: "field_io_name",
                                headerName: "Assign To IO",
                                width: 150,
                                resizable: true,
                                cellClassName: 'justify-content-start',
                                renderHeader: (params) => (
                                    tableHeaderRender(params, "field_io_name")
                                ),
                                renderCell: renderCellFunc("field_io_name"),
                            },
                            {
                                field: "field_name_of_the_police_station",
                                headerName: "Police Station",
                                width: 200,
                                resizable: true,
                                cellClassName: 'justify-content-start',
                                renderHeader: (params) => (
                                    tableHeaderRender(params, "field_name_of_the_police_station")
                                ),
                                renderCell: renderCellFunc("field_name_of_the_police_station"),
                            },
                            {
                                field: "field_division",
                                headerName: "Divisions",
                                width: 200,
                                resizable: true,
                                cellClassName: 'justify-content-start',
                                renderHeader: (params) => (
                                    tableHeaderRender(params, "field_division")
                                ),
                                renderCell: renderCellFunc("field_division"),
                            },
                            {
                                field: "field_case/enquiry_keyword",
                                headerName: "Keyword",
                                width: 200,
                                resizable: true,
                                cellClassName: 'justify-content-start',
                                renderHeader: (params) => (
                                    tableHeaderRender(params, "field_case/enquiry_keyword")
                                ),
                                renderCell: renderCellFunc("field_case/enquiry_keyword"),
                            },
                        ...Object.keys(data[0])
                            .filter((key) => !excludedKeys.includes(key))
                            .map((key) => ({
                                field: key,
                                headerName: generateReadableHeader(key),
                                width: generateReadableHeader(key).length < 15 ? 100 : 180,
                                resizable: true,
                                renderHeader: (params) => (
                                    tableHeaderRender(params)
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

                }else{
                    setTableData([]);
                }

                setviewReadonly(false);
                setEditTemplateData(false);
                setInitialData({});
                setFormOpen(false);
    
                await getActions();
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

    function isValidISODate(value) {
        return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value) && !isNaN(new Date(value).getTime());
    }

  const tableCellRender = (key, params, value, index, tableName) => {
    if (params?.row?.attachments) {
      var attachmentField = params.row.attachments.find(
        (data) => data.field_name === key
      );
      if (attachmentField) {
        return fileUploadTableView(key, params, params.value);
      }
    }

    let highlightColor = {};
    let onClickHandler = null;

    if (tableName && index !== null && index === 0) {
        highlightColor = { color: '#0167F8', textDecoration: 'underline', cursor: 'pointer' };

        onClickHandler = (event) => {event.stopPropagation();handleTemplateDataView(params.row, false, tableName)};
    }

    return (
        <Tooltip title={value} placement="top">
            {
                (key === "field_io_name" && (value === "" || !value)) ? (
                    <span className="io-alert-flashy" onClick={onClickHandler}>
                        <span className="flashy-dot"></span>
                        ASSIGN IO
                    </span>                  
                ) : (key === "field_cc_no./sc_no" && (value === "" || !value)) ? (
                    <span className="io-alert-flashy" onClick={onClickHandler}>
                        <span className="flashy-dot"></span>
                        CC Pending
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

  const hyperLinkShow = async (params) => {
    if (!params.table || !params.id) {
      toast.error("Invalid Data Please Try Again !", {
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
      table_name: params.table,
      id: params.id,
    };

    setLoading(true);

    try {
      const hyperLinkResponse = await api.post(
        "templateData/viewMagazineTemplateData",
        hyperLinkPayload
      );
      setLoading(false);

      if (hyperLinkResponse && hyperLinkResponse.success) {
        const viewTableData = {
          table_name: params.table,
        };

        setLoading(true);
        try {
          const viewTemplateResponse = await api.post(
            "/templates/viewTemplate",
            viewTableData
          );
          setLoading(false);

          if (viewTemplateResponse && viewTemplateResponse.success) {
            navigate("/profile-view", {
              state: {
                formData: hyperLinkResponse.data ? hyperLinkResponse.data : {},
                fields: viewTemplateResponse.data["fields"]
                  ? viewTemplateResponse.data["fields"]
                  : [],
                profileDatapagination: paginationCount,
                table_name: params.table,
                hyperLinkTableName: searchParams.get("tableName")
                  ? searchParams.get("tableName")
                  : table_name,
                template_name: template_name,
                table_row_id: searchParams.get("id")
                  ? searchParams.get("id")
                  : params.id,
                template_id: viewTemplateResponse.data["template_id"]
                  ? viewTemplateResponse.data["template_id"]
                  : "",
                linkToLeader: viewTemplateResponse["data"].is_link_to_leader
                  ? viewTemplateResponse["data"].is_link_to_leader
                  : false,
                linkToOrganization: viewTemplateResponse["data"]
                  .is_link_to_organization
                  ? viewTemplateResponse["data"].is_link_to_organization
                  : false,
              },
            });
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
        const errorMessage = hyperLinkResponse.message
          ? hyperLinkResponse.message
          : "Failed to get data. Please try again.";
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

  const getFileIcon = (fileName) => {
    fileName = fileName.split(".").pop().toLowerCase();
    switch (fileName) {
      case "pdf":
        return <img src={pdfIcon} />;
      case "jpg":
      case "jpeg":
        return <img src={jpgIcon} />;
      case "png":
      case "svg":
      case "gif":
        return <img src={pngIcon} />;
      case "xls":
      case "xlsx":
        return <img src={xlsIcon} />;
      case "csv":
      case "docx":
        return <img src={docxIcon} />;
      case "doc":
        return <img src={docIcon} />;
      case "ppt":
        return <img src={pptIcon} />;
      default:
        return <InsertDriveFileIcon />;
    }
  };

  const fileUploadTableView = (type, rowData, attachment) => {
    if (attachment && attachment !== "") {
      var separateAttachment = attachment.split(",");
      return (
        <Box
            sx={{ display: "flex", alignItems: "center", gap: "4px", cursor: "pointer", height: '100%' }}
            onClick={(e) => {
                e.stopPropagation();
                showAttachmentFileModal(type, rowData.row);
            }}
        >
          <Box className="Roboto attachmentTableBox">
            <span style={{ display: "flex" }}>
              {getFileIcon(separateAttachment[0])}
            </span>
            <span className="Roboto attachmentTableName">
              {separateAttachment[0]}
            </span>
          </Box>
          {separateAttachment.length > 1 && (
            <button className="Roboto attachmentTableBtn">
              {separateAttachment.length - 1}+
            </button>
          )}
        </Box>
      );
    }
  };

  const showAttachmentFileModal = (type, row) => {
    if (row[type]) {
      var attachments = row[type].split(",");
      setShowAttachmentModal(true);
      setShowAttachmentKey(row);
      setShowAttachmentData(attachments);
    } else {
      console.log("no attachments found");
    }
  };

  const handleDeleteTemplateData = (rowData, table_name) => {
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
                onOpen: () => loadTableData(paginationCount),
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

  const ApplySortTable = (key) => {
    settableSortOption((prevOption) =>
      prevOption === "DESC" ? "ASC" : "DESC"
    );
    setTableSortKey(key);
  };

    const handleActionShow = (rowData)=>{
      
          if(!rowData){
              toast.error("Please Check Case Data !",{
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
  
          console.log(rowData)
  
    
          setListApprovalsColumn((prev) => {
              const withoutActions = prev.filter((col) => col.field !== "actions");
              return [...withoutActions, listApprovalActionColumn];
          });
          
           setListApprovalCaseData(rowData);

          showApprovalListPage(rowData)
  
      }

      
          const getApprovalFieldLog = async (fieldName, row) => {
            console.log("row", row)
            if (!row) {
              toast.error("Please check the case", {
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
          
            setLoading(true);
            const payload = { approval_id: row };
          
            try {
              const getActionsDetails = await api.post("/ui_approval/get_approval_field_log", payload);
              setLoading(false);
          
              if (getActionsDetails && getActionsDetails.success) {
                const allLogs = getActionsDetails.data || [];
          
                const fieldLogs = allLogs
                  .filter(log => log.field_name === fieldName)
                  .map(log => ({
                    old_value: log.old_value || '-',
                    updated_value: log.updated_value || '-',
                    created_at: log.created_at || '-',
                    created_by: log.created_by || '-',
                  }));
          
                if (fieldLogs.length === 0) {
                  toast.info("No logs found for this field.", {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    className: "toast-info",
                  });
                  return;
                }
          
                setLogs(fieldLogs);
                SetLogDialogTitle(fieldName.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase()));
                setOpenLogDialog(true);
          
              } else {
                toast.error(getActionsDetails.message || "Failed to fetch approval log. Please try again.", {
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
            } catch (err) {
              setLoading(false);
              const errorMessage =
                err.response?.data?.message === "No activity logs found for the given approval_id"
                  ? "No activity logs found"
                  : err.response?.data?.message || "An error occurred while fetching the approval log.";
      
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
          };
          
          
          const showApprovalLog = async (row) => {
            if (!row) {
              toast.error("Please check the case", {
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
          
            setLoading(true);
            const payload = { case_id: row , approval_type: 'pt_case' };
          
            try {
              const getActionsDetails = await api.post("/ui_approval/get_approval_activity_log", payload);
              setLoading(false);
          
              if (getActionsDetails && getActionsDetails.success) {
      
                const allLogs = getActionsDetails.data || [];
          
                const fieldLogs = allLogs
                  .map(activityLogs => ({
                    approval_item_id: activityLogs.approval_item_id || '-',
                    approved_by: activityLogs.approved_by || '-',
                    approved_date: activityLogs.approved_date || '-',
                    created_at: activityLogs.created_at || '-',
                    created_by: activityLogs.created_by || '-',
                  }));
          
                if (fieldLogs.length === 0) {
                  toast.info("No logs found for this field.", {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    className: "toast-info",
                  });
                  return;
                }
          
                setActivityLogs(fieldLogs);
                setOpenActivityLogDialog(true);
                toast.success(getActionsDetails.message || "Approval Log Fetched Successfully", {
                  position: "top-right",
                  autoClose: 3000,
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: true,
                  draggable: true,
                  progress: undefined,
                  className: "toast-success",
                });
              } else {
                toast.error(getActionsDetails.message || "Failed to fetch approval log. Please try again.", {
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
            } catch (err) {
              setLoading(false);
              const errorMessage =
              err.response?.data?.message === "No activity logs found for the given case_id and approval_type"
                ? "No activity logs found"
                : err.response?.data?.message || "An error occurred while fetching the approval log.";
      
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
          };
          
    const showApprovalListPage = async (approveData) => {
      setListApprovalCaseId(approveData.id);
        if(!approveData  || Object.keys(approveData).length === 0){
            setListAddApproveFlag(false);
            setListApproveTableFlag(false);
            return;
        }


        var payloadObj = {
            case_id: approveData.id,
            page: listApprovalPaginationCount,
            limit: 10,
            search: listApprovalSearchValue || "",
        };

        setListApprovalTotalRecord(0);
        setListApprovalTotalPage(0);

        setLoading(true);

        try {
            const getActionsDetails = await api.post(
                "/ui_approval/get_ui_case_approvals",
                payloadObj
            );
    
            setLoading(false);
    
            if (getActionsDetails && getActionsDetails.success) {
                var updatedOptions = [];
    
                if (getActionsDetails.data["approvals"].length > 0) {
                    updatedOptions = getActionsDetails.data["approvals"].map(
                        (data, index) => {
                        const formatDate = (fieldValue) => {
                            if (!fieldValue || typeof fieldValue !== "string")
                            return fieldValue;
        
                            var dateValue = new Date(fieldValue);
        
                            if (
                            isNaN(dateValue.getTime()) ||
                            (!fieldValue.includes("-") && !fieldValue.includes("/"))
                            ) {
                            return fieldValue;
                            }
        
                            if (isNaN(dateValue.getTime())) return fieldValue;
        
                            var dayValue = String(dateValue.getDate()).padStart(2, "0");
                            var monthValue = String(dateValue.getMonth() + 1).padStart(
                            2,
                            "0"
                            );
                            var yearValue = dateValue.getFullYear();
                            return `${dayValue}/${monthValue}/${yearValue}`;
                        };
        
                        const updatedField = {};
        
                        Object.keys(data).forEach((key) => {
                            if (
                            data[key] &&
                            key !== "id" &&
                            !isNaN(new Date(data[key]).getTime())
                            ) {
                            updatedField[key] = formatDate(data[key]);
                            } else {
                            updatedField[key] = data[key];
                            }
                        });
        
                        return {
                            ...updatedField,
                            sl_no: index + 1,
                            id: data.approval_id,
                        };
                        }
                    );

                    const approvalMetaData = getActionsDetails.data["meta"]

                    if(approvalMetaData && approvalMetaData.totalItems && approvalMetaData.totalItems > 0){
                        setListApprovalTotalRecord(approvalMetaData.totalItems);
                    }

                    if(approvalMetaData && approvalMetaData.totalPages && approvalMetaData.totalPages > 0 )
                    {
                        setListApprovalTotalPage(approvalMetaData.totalPages)
                    }

                }
    
                setListApprovalsData(updatedOptions);
                setListApprovalItem(getActionsDetails.data["approval_item"]);
                setListDesignationData(getActionsDetails.data["designation"]);
    
                setListAddApproveFlag(false);
                setListApproveTableFlag(true);
                setListApprovalCaseNo(approveData["field_cid_crime_no./enquiry_no"] || "")
    
                const randomId = `approval_${Date.now()}_${Math.floor(
                Math.random() * 1000
                )}`;
                setListRandomApprovalId(randomId);
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
      
  const getTemplate = async (table_name) => {
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
        setFormOpen(true);
        setInitialData({});
        setviewReadonly(false);
        setEditTemplateData(false);
        setFormTemplateData(
          viewTemplateResponse.data["fields"]
            ? viewTemplateResponse.data["fields"]
            : []
        );
        if (
          viewTemplateResponse.data.no_of_sections &&
          viewTemplateResponse.data.no_of_sections > 0
        ) {
          setstepperData(
            viewTemplateResponse.data.sections
              ? viewTemplateResponse.data.sections
              : []
          );
        }
        setSaveNew(null);
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

  
    const closeAddForm = ((flag)=>{

        loadTableData(paginationCount);
        setFormOpen(false);
        setSaveNew(null);

    });

  const showOptionTemplate = async (tableName, approved) => {

    if(selectedOtherTemplate.is_approval && !approved){
        setApprovalSaveData({});
        showApprovalPage(selectedRowData, selectedOtherTemplate);
        return;
    }

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

    try {
      const viewTemplateResponse = await api.post(
        "/templates/viewTemplate",
        viewTableData
      );
      setLoading(false);
      if (viewTemplateResponse && viewTemplateResponse.success) {
        var caseFields = [];
        var getCaseIdFields = viewTemplateResponse.data["fields"].map(
          (field) => {
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

    const otherTemplateSaveFunc = async (data) => {

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
            normalData[field.name] =  Array.isArray(data[field.name]) ? data[field.name].join(",") : data[field.name]
            }
        }
        });

        if (selectedOtherTemplate.table === "cid_ui_case_progress_report") {
            normalData["field_pr_status"] = "No";
        }

        normalData.sys_status = showPtCaseModal ? "ui_case" : "pt_case";
        normalData["pt_case_id"] = selectedRowData.id;

        var othersData = {};

        if(Object.keys(approvalSaveData).length > 0 ){
            othersData['approval'] = approvalSaveData;

            var approvalItems = {
                id : selectedRowData.id,
                module_name : 'Under Investigation',
                action : selectedOtherTemplate.name ? selectedOtherTemplate.name : 'Action'
            }

            othersData = {
                            ...othersData, 
                            approval_details : approvalItems
                        }
        }

        formData.append("table_name", showPtCaseModal ? ptCaseTableName : selectedOtherTemplate.table);
        formData.append("data", JSON.stringify(normalData));
        formData.append("others_data", JSON.stringify(othersData));
        formData.append("transaction_id", randomApprovalId);
        formData.append("user_designation_id", localStorage.getItem('designation_id') ? localStorage.getItem('designation_id') : null);

        setLoading(true);

        try {
            const overallSaveData = await api.post("/templateData/saveDataWithApprovalToTemplates",formData);

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
                    onOpen: () => loadTableData(paginationCount),
                });

                setOtherFormOpen(false);
                setAddApproveFlag(false);
                setApproveTableFlag(false);
                setOtherTemplateModalOpen(false);
                setApprovalSaveData({});

                if(selectedOtherTemplate?.field){
                    var combinedData = {
                        id: selectedRowData.id,
                        [selectKey.name]: selectedOtherFields.code,
                    };
            
                    // update func
                    onUpdateTemplateData(combinedData);

                    setSelectKey(null);
                    setSelectedRow(null);
                    setOtherTransferField([]);
                    setShowOtherTransferModal(false);
                    setSelectedOtherFields(null);
                    setselectedOtherTemplate(null);
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

        return;
        formData.append("data", JSON.stringify(normalData));
        setLoading(true);

        try {
        let saveTemplateData;
        saveTemplateData = await api.post(
            "/templateData/insertTemplateData",
            formData
        );
        setLoading(false);

        localStorage.removeItem(selectedOtherTemplate.name + "-formData");

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
            ...(!showPtCaseModal && {
                onOpen: () =>
                handleOtherTemplateActions(selectedOtherTemplate, selectedRow),
            }),
            });

            setTemplateApprovalData({});
            setTemplateApproval(false);
            setAddApproveFlag(false);
            setApproveTableFlag(false);
            setApprovalSaveData({});

            if (showPtCaseModal) {
            setPtCaseTableName(null);
            setShowPtCaseModal(false);
            setOtherFormOpen(false);
            setOptionStepperData([]);
            setOptionFormTemplateData([]);

            if (
                selectedOtherTemplate &&
                selectedOtherTemplate["field"] &&
                selectedOtherTemplate["field"] !== "field_nature_of_disposal"
            ) {
                // update func
                var combinedData = {
                id: selectedRow.id,
                [selectKey.name]: selectedOtherFields.code,
                };

                onUpdateTemplateData(combinedData);

                // reset states
                setSelectKey(null);
                setSelectedRow(null);
                setOtherTransferField([]);
                setShowOtherTransferModal(false);
                setSelectedOtherFields(null);
                setselectedOtherTemplate(null);

                return;
            }

            var payloadSysStatus = {
                table_name: table_name,
                data: {
                id: selectedRow.id,
                sys_status: "disposal",
                },
            };

            setLoading(true);

            try {
                const chnageSysStatus = await api.post(
                "/templateData/caseSysStatusUpdation",
                payloadSysStatus
                );

                setLoading(false);

                if (chnageSysStatus && chnageSysStatus.success) {
                toast.success(
                    chnageSysStatus.message
                    ? chnageSysStatus.message
                    : "Status Changed Successfully",
                    {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    className: "toast-success",
                    }
                );

                // update func
                var combinedData = {
                    id: selectedRow.id,
                    [selectKey.name]: selectedOtherFields.code,
                };

                onUpdateTemplateData(combinedData);

                // reset states
                setSelectKey(null);
                setSelectedRow(null);
                setOtherTransferField([]);
                setShowOtherTransferModal(false);
                setSelectedOtherFields(null);
                setselectedOtherTemplate(null);
                } else {
                const errorMessage = chnageSysStatus.message
                    ? chnageSysStatus.message
                    : "Failed to change the status. Please try again.";
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
            setPtCaseTableName(null);
            setShowPtCaseModal(false);
            setOtherFormOpen(false);
            setOptionStepperData([]);
            setOptionFormTemplateData([]);

            // reset states
            setSelectKey(null);
            setOtherTransferField([]);
            setShowOtherTransferModal(false);
            setSelectedOtherFields(null);
            setselectedOtherTemplate(null);
            }
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
            normalData[field.name] =  Array.isArray(data[field.name]) ? data[field.name].join(",") : data[field.name]
          }
        }
      });
    
      formData.append("table_name", selectedOtherTemplate.table);
      formData.append("id", data.id);
      formData.append("data", JSON.stringify(normalData));
      formData.append("transaction_id", randomApprovalId);
      formData.append( "user_designation_id", localStorage.getItem("designation_id") || null);
    
      let othersData = {};
    
      if (Object.keys(approvalSaveData).length > 0) {
        const approvalDetails = {
          id: selectedRowData.id,
          type: 'pt_case',
          module_name: "Pending Trail",
          action: selectedOtherTemplate.name || "Action",
        };
    
        othersData = {
          approval: approvalSaveData,
          approval_details: approvalDetails,
        };
    
        formData.append("others_data", JSON.stringify(othersData));
      }
    
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
          setTemplateApprovalData({});
          setTemplateApproval(false);
          setAddApproveFlag(false);
          setApproveTableFlag(false);
          setApprovalSaveData({});
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
  const handleOthersTemplateDataView = async (
    rowData,
    editData,
    table_name
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
            setOtherFormOpen(true);
            setOtherRowId(rowData.id);
            setOtherTemplateId(viewTemplateResponse["data"].template_id);
            setOptionFormTemplateData(
              viewTemplateResponse.data["fields"]
                ? viewTemplateResponse.data["fields"]
                : []
            );
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

  const onSaveTemplateData = async (data, saveNew) => {
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
    normalData.sys_status = "pt_case";

    setSaveNew(saveNew);
    showCaseApprovalPage(normalData,formData, true);
    return;

    formData.append("data", JSON.stringify(normalData));
    setLoading(true);

    try {
      const saveTemplateData = await api.post(
        "/templateData/insertTemplateData",
        formData
      );
      setLoading(false);
      localStorage.removeItem(template_name + "-formData");

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
          onOpen: () => loadTableData(paginationCount),
        });
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
  const onCaseUpdateTemplateData = async (data) => {
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
          normalData[field.name] =  Array.isArray(data[field.name]) ? data[field.name].join(",") : data[field.name]
        }
      }
    });
    normalData["id"] = data.id;
    formData.append("id", data.id);
    showCaseApprovalPage(normalData,formData, false);
    return;

    formData.append("data", JSON.stringify(normalData));
    formData.append("id", data.id);
    setLoading(true);

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
          onOpen: () => loadTableData(paginationCount),
        });
        setApprovalSaveData({});
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

    formData.append("data", JSON.stringify(normalData));
    formData.append("id", data.id);
    setLoading(true);

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
          onOpen: () => loadTableData(paginationCount),
        });
        setApprovalSaveData({});
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

  const onSaveTemplateError = (error) => {
    setIsValid(false);
  };

  const handleNextPage = () => {
    setPaginationCount((prev) => prev + 1);
  };

  const handlePrevPage = () => {
    setPaginationCount((prev) => prev - 1);
  };

  const showIndivitualAttachment = async (attachmentName) => {
    if (
      showAttachmentKey["attachments"] &&
      showAttachmentKey["attachments"].length > 0
    ) {
      var payloadFile = showAttachmentKey["attachments"].filter(
        (attachment) => attachment.attachment_name === attachmentName
      );

      if (
        payloadFile &&
        payloadFile[0] &&
        payloadFile[0].profile_attachment_id
      ) {
        setLoading(true);
        try {
          var response = await api.post(
            "/templateData/downloadDocumentAttachments/" +
              payloadFile[0].profile_attachment_id
          );
          setLoading(false);
          if (response && response instanceof Blob) {
            let fileUrl = URL.createObjectURL(response);
            let newTab = window.open();
            newTab.document.body.innerHTML = `<embed src="${fileUrl}" width="100%" height="100%" />`;
          } else {
            console.log("Unexpected response format:", response);
          }
        } catch (error) {
          setLoading(false);
          console.log(error, "error");
        }
      } else {
        console.log("cant get the file");
      }
    }
  };

  const downloadReportModal = () => {
    setShowDownloadModal(true);
  };

  const handleCheckBoxChange = (fieldName, fieldCode, selectedValue) => {
    setShowSelectedDownloadData((prevData) => {
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
          [fieldName]: updatedField.filter((code) => code !== fieldCode),
        };
      }

      return prevData;
    });
  };

  const callDownloadReportApi = async () => {
    if (
      !showSelectedDownloadData ||
      !showSelectedDownloadData["downloadHeaders"] ||
      showSelectedDownloadData["downloadHeaders"].length === 0
    ) {
      toast.error("Please Select Atleast One Field Before Download  !", {
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
      table_name: table_name,
      fields: showSelectedDownloadData["downloadHeaders"],
    };
    setLoading(true);

    try {
      const downloadReportResponse = await api.post(
        "templateData/downloadExcelData",
        downloadReport
      );
      setLoading(false);

      if (downloadReportResponse) {
        const blob = new Blob([downloadReportResponse], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${table_name}_Report.xlsx`;

        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        window.URL.revokeObjectURL(url);
      } else {
        const errorMessage = downloadReportResponse.message
          ? downloadReportResponse.message
          : "Failed to download report. Please try again.";
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

  useEffect(() => {
    if (searchParams) {
      const searchParamsid = searchParams.get("id");
      const searchParamsTableName = searchParams.get("tableName");

      if (
        (searchParamsid && searchParamsid !== "") ||
        (searchParamsTableName && searchParamsTableName !== "")
      ) {
        hyperLinkShow({
          id: searchParamsid,
          table: searchParamsTableName,
        });
      }
    }
  }, []);

    function createSvgIcon(svgString) {
        return () => (
            <span
                dangerouslySetInnerHTML={{ __html: svgString }}
                className="tableActionIcon"
            />
        );
    }

    const getActions = async () => {
        var payloadObj = {
            module: actionKey ? actionKey : "pt_case",
            tab: sysStatus,
        };

        setLoading(true);

        try {
            const getActionsDetails = await api.post( "/action/get_actions", payloadObj);

            setLoading(false);

            if (getActionsDetails && getActionsDetails.success) {
                if (getActionsDetails.data && getActionsDetails.data["data"]) {
                    var userPermissionsArray = JSON.parse(localStorage.getItem("user_permissions")) || [];

                    const userPermissions = userPermissionsArray[0] || {};

                    const updatedActions = getActionsDetails.data.data.map((action) => {
                            if (action?.icon) action.icon = createSvgIcon(action.icon);
        
                            if (action.permissions) {
                                const parsedPermissions = JSON.parse(action.permissions);

                                if (parsedPermissions && typeof parsedPermissions === 'object' && !Array.isArray(parsedPermissions) && parsedPermissions?.['show']) {

                                    const hasValidPermission = parsedPermissions?.['show'].some(
                                        (permission) => userPermissions[permission] === true
                                    );
                                    return hasValidPermission ? action : null;

                                }else{
                                    const hasValidPermission = parsedPermissions.some(
                                        (permission) => userPermissions[permission] === true
                                    );
                                    return hasValidPermission ? action : null;
                                }
                            }
        
                        return action;
                    }).filter(Boolean);

                    var hoverExtraOptions = [
                        {
                            name: "PT Case",
                            caseView : true,
                            viewAction : true
                        },
                        userPermissions?.delete_pt
                        ? {
                                name: "Delete",
                                onclick: (selectedRow) =>
                                handleDeleteTemplateData(selectedRow, table_name),
                                icon: () => (
                                    <span className="tableActionIcon">
                                        <svg
                                            width="50"
                                            height="50"
                                            viewBox="0 0 34 34"
                                            fill=""
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <circle cx="12" cy="12" r="12" fill="" />
                                            <mask
                                                id="mask0_1120_40636"
                                                style={{ maskType: "alpha" }}
                                                maskUnits="userSpaceOnUse"
                                                x="4"
                                                y="4"
                                                width="16"
                                                height="16"
                                            >
                                                <rect x="4" y="4" width="16" height="16" fill="" />
                                            </mask>
                                            <g mask="url(#mask0_1120_40636)">
                                                <path
                                                    d="M9.40504 17.2666C9.10493 17.2666 8.85126 17.163 8.64404 16.9558C8.43681 16.7486 8.3332 16.4949 8.3332 16.1948V8.39997H7.5332V7.5333H10.3999V6.8103H13.5999V7.5333H16.4665V8.39997H15.6665V16.1876C15.6665 16.4959 15.5629 16.7527 15.3557 16.9583C15.1485 17.1639 14.8948 17.2666 14.5947 17.2666H9.40504ZM10.6692 15.2H11.5357V9.59997H10.6692V15.2ZM12.464 15.2H13.3305V9.59997H12.464V15.2Z"
                                                    fill=""
                                                />
                                            </g>
                                        </svg>
                                    </span>
                                ),
                            }
                        : null,
                        ...updatedActions,
                        {
                            name: "Preliminary Charge Sheet - 173 (8)",
                            onclick: (selectedRow) =>
                            changeSysStatus(
                                selectedRow,
                                "178_cases",
                                "Do you want to update this case to 173(8) ?"
                            ),
                        },
                        userPermissions?.case_details_download ? 
                        {
                            name: "Download",
                            onclick: (selectedRow) =>
                            getPdfContentData(selectedRow, false, table_name),
                        }
                        : null,
                        userPermissions?.case_details_print ? 
                        {
                            name: "Print",
                            onclick: (selectedRow) =>
                            getPdfContentData(selectedRow, true, table_name),
                        }
                        : null,
                    ].filter(Boolean);

                    setHoverTableOptions(hoverExtraOptions);
                }
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
            if (error && error.response && error.response.data) {
                toast.error(error.response.data["message"] ? error.response.data["message"] : "Please Try Again !", {
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

  const handleFileUpload = async (event) => {
    console.log("File upload initiated.");

    const file = event.target.files[0];

    if (!file) {
      Swal.fire("Error", "Please select a file.", "error");
      return;
    }

    if (!selectedRowData || !selectedRowData.id) {
      console.log(
        "Invalid selectedRow inside handleFileUpload:",
        selectedRowData
      );
      Swal.fire("Error", "Invalid case ID.", "error");
      return;
    }

    const caseId = selectedRowData.id;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("pt_case_id", caseId);
    formData.append("created_by", "0");

    try {
      const response = await api.post("/templateData/uploadFile", formData);

      if (response.success) {
        Swal.fire("Success", "File uploaded successfully.", "success");
        checkPdfEntryStatus(caseId);
        getUploadedFiles(selectedRowData);
      } else {
        Swal.fire("Error", response.message || "Upload failed.", "error");
      }
    } catch (error) {
      console.error("Upload error:", error);
      Swal.fire("Error", "Failed to upload file.", "error");
    }
  };

  const [uploadedFiles, setUploadedFiles] = useState([]);

  const getUploadedFiles = async (selectedRow, options) => {
    console.log("for getting uploaded files", selectedRow);
    if (!selectedRow || !selectedRow.id) {
      console.error("Invalid selectedRow for file retrieval:", selectedRow);
      return;
    }

    try {
      const response = await api.post("/templateData/getUploadedFiles", {
        pt_case_id: selectedRow.id,
      });

      if (response && response.success) {
        console.log("Uploaded files:", response.data);
        setUploadedFiles(response.data);
        handleOtherTemplateActions(options, selectedRow, false, true);
        console.error("Failed to fetch uploaded files:", response.message);
      }
    } catch (error) {
      console.error("Error fetching uploaded files:", error);
    }
  };

  const [hasPdfEntry, setHasPdfEntry] = useState(false);

  const checkPdfEntryStatus = async (caseId) => {
    if (!caseId) {
      console.log("Invalid caseId inside checkPdfEntryStatus:", caseId);
      setHasPdfEntry(false);
      return;
    }

    console.log("Checking PDF entry for caseId:", caseId);

    try {
      const response = await api.post("/templateData/checkPdfEntry", {
        pt_case_id: caseId,
        is_pdf: true,
      });

      if (response.success && response.data) {
        setHasPdfEntry(true);
      } else {
        setHasPdfEntry(false);
      }
    } catch (error) {
      console.error("Error checking PDF entry:", error);
      setHasPdfEntry(false);
    }
  };

  // const handleAssignToIo = async (selectedRow, table_name) => {
  //   if (!table_name || table_name === "") {
  //     toast.warning("Please Check Table Name");
  //     return false;
  //   }

  //   const viewTemplatePayload = {
  //     table_name: table_name,
  //     id: selectedRow.id,
  //   };

  //   setLoading(true);
  //   try {
  //     const viewTemplateData = await api.post(
  //       "/templateData/viewTemplateData",
  //       viewTemplatePayload
  //     );
  //     setLoading(false);

  //     if (viewTemplateData && viewTemplateData.success) {
  //       const user_id = localStorage.getItem("user_id");
  //       const field_io_name = viewTemplateData?.data?.field_io_name;

  //       if (String(user_id) === String(field_io_name)) {
  //         setIsIoAuthorized(true);
  //         return true; 
  //       } else {
  //         setIsIoAuthorized(false);
  //         return false;
  //       }
  //     } else {
  //       toast.error("Failed to fetch template data");
  //       return false;
  //     }
  //   } catch (error) {
  //     setLoading(false);
  //     toast.error(error?.response?.data?.message || "An error occurred.");
  //     return false;
  //   }
  // };

  const getCellClassName = (key, params, table) => {
    // Example condition: unread rows for a specific table
    if (table === "cid_ui_case_progress_report" && !params?.row?.ReadStatus) {
        return "unreadBackground";
    }

    // Add more logic if needed based on `key` or `params`
    return "";
};
   const handleOtherTemplateActions = async (options, selectedRow, searchFlag,fromUploadedFiles) => {
      fromUploadedFiles = fromUploadedFiles ?? false;
  
      if(!selectedRow || Object.keys(selectedRow).length === 0 || !options || Object.keys(options).length === 0){
          return false
      }
  
      const randomId = `random_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  
      setRandomApprovalId(randomId);
  
      // const isAuthorized = await handleAssignToIo(selectedRow, "cid_under_investigation");
      // setIsIoAuthorized(isAuthorized);    
  
      setSelectedRowData(selectedRow);
      setselectedOtherTemplate(options);
      setApprovalSaveData({});
  
  
      if (options.table && options.field) {
          const selectedFieldValue = options.field;
          showTransferToOtherDivision(options, selectedRow, selectedFieldValue);
          return;
      }
  
      setSelectedRow(selectedRow);
      var getTemplatePayload = {
          table_name: options.table,
          ui_case_id: selectedRow?.ui_case_id || null,
          pt_case_id: selectedRow.id,
          limit : 10,
          page : !searchFlag ? otherTemplatesPaginationCount : 1,
          search: !searchFlag ? otherSearchValue : "",        
          from_date: !searchFlag ? othersFromDate : null,
          to_date: !searchFlag ? othersToDate : null,
          filter: !searchFlag ? othersFilterData : {},
      };

        var disabledEditFlag = false;
        var disabledDeleteFlag = false;

        if (options.permissions) {

            const parsedPermissions = JSON.parse(options.permissions);

            if (parsedPermissions && typeof parsedPermissions === 'object' && !Array.isArray(parsedPermissions)) {

                if(parsedPermissions?.['add'].length > 0){
                    const hasAddPermission = parsedPermissions?.['add'].some(
                        (permission) => userPermissions?.[0]?.[permission] === true
                    );
    
                    templateActionAddFlag.current = hasAddPermission;
                }else{
                    templateActionAddFlag.current = true;
                }

                if(parsedPermissions?.['edit'].length > 0){
                    const hasEditPermission = parsedPermissions?.['edit'].some(
                        (permission) => userPermissions?.[0]?.[permission] === true
                    );

                    disabledEditFlag = hasEditPermission
                }else{
                    disabledEditFlag = true;
                }


                if(parsedPermissions?.['delete'].length > 0){
                    const hasDeletePermission = parsedPermissions?.['delete'].some(
                        (permission) => userPermissions?.[0]?.[permission] === true
                    );

                    disabledDeleteFlag = hasDeletePermission
                }else{
                    disabledDeleteFlag = true;
                }

            }else{
                templateActionAddFlag.current = true;
                disabledEditFlag = true;
                disabledDeleteFlag = true;
            }

        }
  
      setLoading(true);
  
      try {
        const getTemplateResponse = await api.post(
          "/templateData/getTemplateData",
          getTemplatePayload
        );
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
  
            let showReplacePdf = false;
  
            if (selectedOtherTemplate?.table === "cid_ui_case_progress_report") {
              const anyHasPRStatus = records.some(record => record.hasFieldPrStatus === true);
            
              // Show button only if no one has PR status true
              if (!anyHasPRStatus) {
                showReplacePdf = true;
              }
            }
                        
          
            
            if (getTemplateResponse.data[0]) {
              var excludedKeys = [
                "updated_at",
                "id",
                "deleted_at",
                "attachments",
                "Starred",
                "ReadStatus",
                "linked_profile_info",
              ];
  
              if (options.table !== "cid_ui_case_progress_report") {
                excludedKeys.push("created_at");
                excludedKeys.push("hasFieldPrStatus");
              }
              if (options.table === "cid_pt_case_trail_monitoring") {
                excludedKeys.push("field_witness");
                excludedKeys.push("field_accused");
                excludedKeys.push("field_accused/witness");
                excludedKeys.push("field_cw_attended_the_trial");
                excludedKeys.push("field_hearing_date");
                excludedKeys.push("field_next_hearing_date");
                excludedKeys.push("field_notice_received_on");
                excludedKeys.push("field_notice_served_on");
                excludedKeys.push("field_number_of_notice_executed");
                excludedKeys.push("field_number_of_notice_not_executed");
                excludedKeys.push("field_number_of_proclamation_executed");
                excludedKeys.push("field_number_of_proclamation_not_executed");
                excludedKeys.push("field_number_of_summons_executed");
                excludedKeys.push("field_number_of_summons_not_executed");
                excludedKeys.push("field_number_of_warrant_executed");
                excludedKeys.push("field_number_of_warrant_not_executed");
                excludedKeys.push("field_process_type");
                excludedKeys.push("field_proclamation_received_on");
                excludedKeys.push("field_proclamation_served_on");
                excludedKeys.push("field_reappear");
                excludedKeys.push("field_reason");
                excludedKeys.push("field_summons_received_on");
                excludedKeys.push("field_summons_served_on");
                excludedKeys.push("field_trialresult");
                excludedKeys.push("field_warrant_received_on");
                excludedKeys.push("field_warrant_served_on");
              }
  
              const updatedHeader = ([

                ...(options.table !== "cid_ui_case_progress_report"
                  ? [
                      {
                        field: "sl_no",
                        headerName: "S.No",
                        resizable: false,
                        width: 75,
                        renderCell: (params) => {
                          return (
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                              }}
                            >
                              {params.value}
                            </Box>
                          );
                        },
                      },
                    ]
                  : []),
                ...Object.keys(getTemplateResponse.data[0])
                  .filter(
                    (key) =>
                      !excludedKeys.includes(key) &&
                      key !== "field_pt_case_id" &&
                      key !== "field_ui_case_id" &&
                      key !== "field_pr_status" &&
                      key !== "field_evidence_file" &&
                      key !== "created_by" &&
                      key !== "field_last_updated" &&
                      key !== "field_date_created" &&
                      key !== "field_description" &&
                      key !== "field_assigned_to_id"&&
                      key !== "field_assigned_by_id"&&
                      key !== "field_served_or_unserved"&&
                      key !== "field_reappear"&&
                      key !== "hasFieldPrStatus"       
                  )
                  .map((key) => {
                    var updatedKeyName = key
                      .replace(/^field_/, "")
                      .replace(/_/g, " ")
                      .toLowerCase()
                      .replace(/^\w|\s\w/g, (c) => c.toUpperCase());
  
                    return {
                      field: key,
                      headerName: updatedKeyName ? updatedKeyName : "",
                      width: updatedKeyName.length < 15 ? 100 : 180,
                      resizable: true,
                      cellClassName: (params) => getCellClassName(key, params, options.table),
                      renderHeader: () => (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            width: "100%",
                          }}
                        >
                          <span
                            style={{
                              color: "#1D2939",
                              fontSize: "15px",
                              fontWeight: "500",
                            }}
                          >
                            {updatedKeyName ? updatedKeyName : "-"}
                          </span>
                        </div>
                      ),
                      renderCell: (params) => {
                        return tableCellRender(key, params, params.value);
                      },
                    };
                  }),
                ...(options.table === "cid_ui_case_progress_report"
                  ? [
                      {
                        field: "field_pr_status",
                        headerName: "Status",
                        width: 150,
                        resizable: true,
                        sortable: true,
                        cellClassName: (params) => getCellClassName("sl_no", params, options.table),
                        sortComparator: (v1, v2) => {
                          if (v1 === "Yes" && v2 === "No") return -1;
                          if (v1 === "No" && v2 === "Yes") return 1;
                          return 0;
                        },
                        renderCell: (params) => {
                          const isUpdated = params.value === "Yes";
                          const statusText = isUpdated
                            ? "PDF Updated"
                            : "Not Updated";
                          const statusColor = isUpdated ? "#22c55e" : "#ef4444";
                          const borderColor = isUpdated ? "#34D399" : "#EF4444";
  
                          return (
                            <Chip
                              label={statusText}
                              size="small"
                              sx={{
                                fontFamily: "Roboto",
                                fontWeight: 400,
                                color: "white",
                                borderColor: borderColor,
                                borderRadius: "4px",
                                backgroundColor: statusColor,
                                textTransform: "capitalize",
                                borderStyle: "solid",
                                borderWidth: "1px",
                              }}
                            />
                          );
                        },
                      },
                    ]
                  : []),
                  ,
                ...(options.table === "cid_pt_case_trail_monitoring"
                  ? [
                    {
                      field: "field_served_or_unserved",
                      headerName: "Served/UnServed",
                      width: 150,
                      resizable: true,
                      sortable: true,
                      // headerAlign: "center",
                      // align: "center",    
                      sortComparator: (v1, v2) => {
                        if (v1 === "Yes" && v2 === "No") return -1;
                        if (v1 === "No" && v2 === "Yes") return 1;
                        return 0;
                      },
                      renderCell: (params) => {
                        const value = params.value;
                        const isYes = value === "Yes";
                        const isNo = value === "No";
                    
                        if (!isYes && !isNo) {
                          return (
                            <Box
                              sx={{
                                fontFamily: "Roboto",
                                width: "100%",
                                display: "flex",
                                justifyContent: "center",
                                }}
                            >
                              -
                            </Box>
                          );
                        }
                    
                        const statusText = isYes ? "Served" : "UnServed";
                        const statusColor = isYes ? "#22c55e" : "#ef4444";
                        const borderColor = isYes ? "#34D399" : "#EF4444";
                    
                        return (
                          <div
                            style={{
                              width: "100%",
                              display: "flex",
                              justifyContent: "center",
                              paddingTop: "8px",
                            }}
                          >
                            <Chip
                              label={statusText}
                              size="small"
                              sx={{
                                fontFamily: "Roboto",
                                fontWeight: 400,
                                color: "white",
                                borderColor: borderColor,
                                borderRadius: "4px",
                                backgroundColor: statusColor,
                                textTransform: "capitalize",
                                borderStyle: "solid",
                                borderWidth: "1px",
                                minWidth: "80px",
                                textAlign: "center",
                                justifyContent: "center",
                                display: "flex",
                              }}
                            />
                          </div>
                        );
                        
                      },
                    }
                  ]
                  : []),,
                  ...(options.table === "cid_pt_case_trail_monitoring"
                    ? [
                      {
                        field: "field_reappear",
                        headerName: "Reappear",
                        width: 100,
                        resizable: true,
                        sortable: true,
                        sortComparator: (v1, v2) => {
                          if (v1 === "Yes" && v2 === "No") return -1;
                          if (v1 === "No" && v2 === "Yes") return 1;
                          return 0;
                        },
                        // renderCell: (params) => {
                        //   const value = params.value;
                        //   const isYes = value === "Yes";
                        //   const isNo = value === "No";
                      
                        //   if (!isYes && !isNo) {
                        //     return (
                        //       <Box
                        //         sx={{
                        //           fontFamily: "Roboto",
                        //           width: "100%",
                        //           marginLeft: "15px",
                        //         }}
                        //       >
                        //         -
                        //       </Box>
                        //     );
                        //   }
                                          
                        //   return (
                        //     <Box
                        //       sx={{
                        //         display: "flex",
                        //         alignItems: "center",
                        //         justifyContent: "flex-start",
                        //         height: "100%",
                        //         pl: 1,
                        //       }}
                        //     >
                        //       {isYes ? (
                        //         <CheckCircleIcon sx={{ color: "#22c55e" }} />
                        //       ) : (
                        //         <CancelIcon sx={{ color: "#ef4444" }} />
                        //       )}
                        //     </Box>
                        //   );
                          
                      
                        // },
                        renderCell: (params) => {
                          const value = params.value;
                          const isYes = value === "Yes";
                          const isNo = value === "No";
                      
                          if (!isYes && !isNo) {
                            return (
                              <Box
                                sx={{
                                  fontFamily: "Roboto",
                                  width: "100%",
                                  display: "flex",
                                  justifyContent: "center",
                                  }}
                              >
                                -
                              </Box>
                            );
                          }
                      
                          const statusText = isYes ? "Yes" : "No";
                          const statusColor = isYes ? "#22c55e" : "#ef4444";
                          const borderColor = isYes ? "#34D399" : "#EF4444";
                      
                          return (
                            <div
                              style={{
                                width: "100%",
                                display: "flex",
                                justifyContent: "center",
                                paddingTop: "8px",
                              }}
                            >
                              <Chip
                                label={statusText}
                                size="small"
                                sx={{
                                  fontFamily: "Roboto",
                                  fontWeight: 400,
                                  color: "white",
                                  borderColor: borderColor,
                                  borderRadius: "4px",
                                  backgroundColor: statusColor,
                                  textTransform: "capitalize",
                                  borderStyle: "solid",
                                  borderWidth: "1px",
                                  minWidth: "40px",
                                  textAlign: "center",
                                  justifyContent: "center",
                                  display: "flex",
                                }}
                              />
                            </div>
                          );
                          
                        },
                      },      
                      ]
                    : []),
                  {
                    field: "",
                    headerName: "Action",
                    flex: 1,
                    cellClassName: (params) => getCellClassName("sl_no", params, options.table),
                    renderCell: (params) => {
                      const isPdfUpdated =
                        options.table === "cid_ui_case_progress_report" &&
                        params.row.field_pr_status === "Yes";
                  
                      // const isAssignedUser =
                      //   String(localStorage.getItem("user_id")) ===
                      //   String(params.row.field_assigned_to_id);
                  
                      // const showEditAndDeleteButtons =
                      //   options.table === "cid_ui_case_progress_report"
                      //     ? !isPdfUpdated && (isAuthorized || isAssignedUser)
                      //     : !isPdfUpdated && isAuthorized;
                  
                      const userPermissions = JSON.parse(localStorage.getItem("user_permissions")) || [];
                      const canEdit = userPermissions[0]?.action_edit;
                      const canDelete = userPermissions[0]?.action_delete;
                      const checkserved =
                        options.table === "cid_pt_case_trail_monitoring" &&
                        params.row.field_served_or_unserved === "Yes";
  
                      const checkUnServed = 
                        options.table === "cid_pt_case_trail_monitoring" &&
                        params.row.field_served_or_unserved === "No";
  
  
                      const checkreappear =
                        options.table === "cid_pt_case_trail_monitoring" &&
                        params.row.field_reappear === "Yes" || params.row.field_reappear === "No";
  
                        const isViewAction = options.is_view_action === true
  
                      return (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            height: "100%",
                          }}
                        >
                          <Button
                            variant="outlined"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleOthersTemplateDataView(params.row, false, options.table);
                            }}
                          >
                            View
                          </Button>
                  
                          {disabledEditFlag && (
                            !isViewAction && (
                              !isPdfUpdated && (
                                <Button
                                  variant="contained"
                                  color="primary"
                                  onClick={async (event) => {
                                    event.stopPropagation();
                                    setIsFromEdit(true);
                                    setSelectedApprovalEdit(params.row);
                                    if (options.is_approval) {
                                      await showApprovalPage(params.row, options);
                                    } else {
                                      handleOthersTemplateDataView(params.row, true, options.table);
                                    }
                                  }}
                                >
                                  Edit
                                </Button>
                              ))
                            )}
                          {disabledDeleteFlag && (
                            !isViewAction && (
                              !isPdfUpdated && (
                                <Button
                                  variant="contained"
                                  color="error"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    handleOthersDeleteTemplateData(params.row, options.table);
                                  }}
                                >
                                  Delete
                                </Button>
                            ))
                          )}
                          {options.table === "cid_pt_case_trail_monitoring" && (
                            <>
                              {!checkserved && !checkUnServed &&(
                                <Button
                                  variant="contained"
                                  color = "success"
                                  disabled={checkserved}
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    handleServedUnserved(params.row, options);
                                  }}
                                >
                                  Served/Unserved
                                </Button>
                              )}
                              {checkserved && !checkreappear && (
                                <Button
                                  variant="contained"
                                  // style={{
                                  //   backgroundColor: checkreappear ? "#d6d6d6" : "#ffc107",
                                  //   color: checkreappear ? "#a6a6a6" : "black",
                                  //   cursor: checkreappear ? "not-allowed" : "pointer",
                                  // }}
                                  color = "warning"
                                  disabled={checkreappear}
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    handleReappear(params.row, options);
                                  }}
                                >
                                  Reappear
                                </Button>
                              )}
                            </>
                          )}
  
                        </Box>
                      );
                    },
                  }
                                  
              ]).filter(Boolean);
  
              setOtherTemplateColumn(updatedHeader);
            } else {
              setOtherTemplateColumn([]);
            }
  
          var updatedTableData = getTemplateResponse.data.map((field, index) => {
              const formatDate = (fieldValue) => {
  
                  if (!fieldValue || typeof fieldValue !== "string")
                      return fieldValue;
  
                  var dateValue = new Date(fieldValue);
  
                  if (isNaN(dateValue.getTime()) || (!fieldValue.includes("-") && !fieldValue.includes("/"))) {
                      return fieldValue;
                  }
  
                  if (isNaN(dateValue.getTime())) return fieldValue;
  
                  var dayValue = String(dateValue.getDate()).padStart(2, "0");
                  var monthValue = String(dateValue.getMonth() + 1).padStart(2,"0");
                  var yearValue = dateValue.getFullYear();
                  return `${dayValue}/${monthValue}/${yearValue}`;
              };
  
              const updatedField = {};
  
              Object.keys(field).forEach((key) => {
                  if (field[key] && key !== "id" && !isNaN(new Date(field[key]).getTime())) {
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
          if (options.table === "cid_ui_case_progress_report" && options.is_pdf && !fromUploadedFiles) {
            await checkPdfEntryStatus(selectedRow.id);
              await getUploadedFiles(selectedRow, options);
          }
          if(options.is_view_action === true){
            setViewModeOnly(true)
          }
          else{
            setViewModeOnly(false)
          }
  
          setOtherTemplateModalOpen(true);
      }
  
          setOtherFormOpen(false);
          setOptionStepperData([]);
          setOptionFormTemplateData([]);
        } else {
          const errorMessage = getTemplateResponse.message
            ? getTemplateResponse.message
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

  const showTransferToOtherDivision = async (options, selectedRow, selectedFieldValue, approved) => {

    if(options.is_approval && !approved){
        setApprovalSaveData({});
        showApprovalPage(selectedRow, options);
        return;
    }

    const selectedFieldData = selectedRow[selectedFieldValue];
  
    const viewTableData = {
      table_name: options.table,
    };

    if (options.permissions) {

        const parsedPermissions = JSON.parse(options.permissions);

        if (parsedPermissions && typeof parsedPermissions === 'object' && !Array.isArray(parsedPermissions)) {
            
            if(parsedPermissions?.['edit'].length > 0){
                const hasAddPermission = parsedPermissions?.['edit'].some(
                    (permission) => userPermissions?.[0]?.[permission] === true
                );

                fieldActionAddFlag.current = hasAddPermission;
            }else{
                fieldActionAddFlag.current = true;
            }

        }else{
            fieldActionAddFlag.current = true;
        }
    }
  
    setLoading(true);
    try {
      const viewTemplateResponse = await api.post(
        "/templates/viewTemplate",
        viewTableData
      );
      setLoading(false);
  
      if (
        viewTemplateResponse &&
        viewTemplateResponse.success &&
        viewTemplateResponse["data"]
      ) {
        if (viewTemplateResponse["data"].fields) {
          setFormTemplateData(viewTemplateResponse["data"].fields);
  
          const getDivisionField = viewTemplateResponse["data"].fields.filter(
            (data) => data.name === options.field
          );
  
          if (getDivisionField.length > 0) {

            if(getDivisionField[0].type === "file"){
                showAttachmentField(options, selectedRow);
                return;
            }
  
            if (getDivisionField[0].api) {
              setLoading(true);
  
              const payloadApi = {
                table_name: getDivisionField[0].table,
              };
  
              try {
                const getOptionsValue = await api.post(getDivisionField[0].api, payloadApi);
                setLoading(false);
  
                let updatedOptions = [];
  
                if (getOptionsValue && getOptionsValue.data) {
                  if (getDivisionField[0].api === "/templateData/getTemplateData") {
                    updatedOptions = getOptionsValue.data.map((templateData) => {
                      const nameKey = Object.keys(templateData).find(
                        (key) => !["id", "created_at", "updated_at"].includes(key)
                      );
                      return {
                        name: nameKey ? templateData[nameKey] : "",
                        code: templateData.id,
                      };
                    });
                  } else {
                    updatedOptions = getOptionsValue.data.map((field) => ({
                      name:
                      getDivisionField[0].table === "users"
                          ? field.name
                          : field[getDivisionField[0].table + "_name"],
                      code:
                      getDivisionField[0].table === "users"
                          ? field.user_id
                          : field[getDivisionField[0].table + "_id"],
                    }));
                  }
  
                  const matchedOption = updatedOptions.find(
                    (option) =>
                      (option.code === selectedFieldData || option.name === selectedFieldData)
                  );
                  console.log("Pre-selected value:", matchedOption);
                  setSelectedOtherFields(matchedOption || null);
  
                  setSelectKey({ name: options.field, title: options.name });
                //   setSelectedRow(selectedRow);
                //   setselectedOtherTemplate(options);
                  setOtherTransferField(updatedOptions);
                  setShowOtherTransferModal(true);
                }
              } catch (error) {
                setLoading(false);
                if (error?.response?.data) {
                  toast.error(
                    error.response.data.message || "Division not found",
                    {
                      position: "top-right",
                      autoClose: 3000,
                      className: "toast-error",
                    }
                  );
                }
              }
            } else {
              const staticOptions = getDivisionField[0].options || [];
  
              const matchedOption = staticOptions.find(
                (option) => option.code === selectedFieldData
              );
              setSelectedOtherFields(matchedOption || null);
  
              setSelectKey({ name: options.field, title: options.name });
            //   setSelectedRow(selectedRow);
            //   setselectedOtherTemplate(options);
              setOtherTransferField(staticOptions);
              setShowOtherTransferModal(true);
            }
          } else {
            toast.error("Can't able to find Division field", {
              position: "top-right",
              autoClose: 3000,
              className: "toast-error",
            });
          }
        }
      } else {
        toast.error(
          viewTemplateResponse.message || "Failed to get Template. Please try again.",
          {
            position: "top-right",
            autoClose: 3000,
            className: "toast-error",
          }
        );
      }
    } catch (error) {
      setLoading(false);
      if (error?.response?.data) {
        toast.error(
          error.response.data.message || "Please Try Again!",
          {
            position: "top-right",
            autoClose: 3000,
            className: "toast-error",
          }
        );
      }
    }
  };

  const showApprovalPage = async (approveData, Options) => {
    var payloadObj = {
      case_id: approveData.id,
    };

    setLoading(true);

    try {
      const getActionsDetails = await api.post(
        "/ui_approval/get_ui_case_approvals",
        payloadObj
      );

      setLoading(false);

      if (getActionsDetails && getActionsDetails.success) {
        var updatedOptions = [];

        if (getActionsDetails.data["approvals"].length > 0) {
          updatedOptions = getActionsDetails.data["approvals"].map(
            (data, index) => {
              const formatDate = (fieldValue) => {
                if (!fieldValue || typeof fieldValue !== "string")
                  return fieldValue;

                var dateValue = new Date(fieldValue);

                if (
                  isNaN(dateValue.getTime()) ||
                  (!fieldValue.includes("-") && !fieldValue.includes("/"))
                ) {
                  return fieldValue;
                }

                if (isNaN(dateValue.getTime())) return fieldValue;

                var dayValue = String(dateValue.getDate()).padStart(2, "0");
                var monthValue = String(dateValue.getMonth() + 1).padStart(
                  2,
                  "0"
                );
                var yearValue = dateValue.getFullYear();
                return `${dayValue}/${monthValue}/${yearValue}`;
              };

              const updatedField = {};

              Object.keys(data).forEach((key) => {
                if (
                  data[key] &&
                  key !== "id" &&
                  !isNaN(new Date(data[key]).getTime())
                ) {
                  updatedField[key] = formatDate(data[key]);
                } else {
                  updatedField[key] = data[key];
                }
              });

              return {
                ...updatedField,
                sl_no: index + 1,
                id: data.approval_id,
              };
            }
          );
        }

        showApprovalAddPage(Options);
        setApprovalsData(updatedOptions);
        setApprovalItem(getActionsDetails.data["approval_item"]);
        setDesignationData(getActionsDetails.data["designation"]);

        
        setApproveTableFlag(true);

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

  const showApprovalAddPage = (Options) => {

    console.log(Options,"Options Options Options");

    setAddApproveFlag(true);
    handleApprovalSaveData(
      "approval_item",
      Number(Options?.approval_items)
    );

    if (Options?.approval_items) {
      setApprovalItemDisabled(true);
    } else {
      setApprovalItemDisabled(false);
    }
  };

  const saveApprovalData = async (table) => {

    if (!approvalSaveData || !approvalSaveData["approval_item"]) {
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

    if (!approvalSaveData || !approvalSaveData["approved_by"]) {
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

    if (!approvalSaveData || !approvalSaveData["approval_date"]) {
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

    if (!approvalSaveData || !approvalSaveData["remarks"]) {
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

    if (selectedOtherTemplate.table && selectedOtherTemplate.field) {
        showTransferToOtherDivision(selectedOtherTemplate, selectedRowData, selectedOtherTemplate.field, true);
    }else if (isFromEdit ) {
      handleOthersTemplateDataView(selectedApprovalEdit, true, table);
      setIsFromEdit(false);
    }else{
        showOptionTemplate(table, true);
    }

    return;
};

    const handleSaveDivisionChange = async () => {

      if (!selectedOtherFields || !selectedOtherFields.code) {
            toast.error("Please Select Data !", {
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

        if ((selectedOtherTemplate?.["field"] === "field_nature_of_disposal" || selectedOtherTemplate?.["field"] === "field_prosecution_sanction" || selectedOtherTemplate?.["field"] === "field_17a_pc_act") && selectedOtherFields?.["name"]) {
            checkDisposalValues();
            return;
        }

        if(selectedOtherTemplate.is_approval){

            var payloadApproveData = {
                ...approvalSaveData,
                case_id: furtherInvestigationSelectedRow?.id || selectedRowData.id,
                case_type: "ui_case",
                module: "Under Investiation",
                action: "Under Investiation Action",
                transaction_id: randomApprovalId,
                created_by_designation_id: localStorage.getItem("designation_id") ? localStorage.getItem("designation_id") : "",
                created_by_division_id: localStorage.getItem("division_id") ? localStorage.getItem("division_id") : "",
                info: {
                    module: "Under Investiation",
                    action: "Under Investiation Action",
                },
            };
        
            setLoading(true);
    
            try {
                const chnageSysStatus = await api.post( "/ui_approval/create_ui_case_approval",payloadApproveData);
        
                setLoading(false);
        
                if (chnageSysStatus && chnageSysStatus.success) {

                    toast.success( chnageSysStatus.message ? chnageSysStatus.message : "Approval Added Successfully Successfully",{
                        position: "top-right",
                        autoClose: 3000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        className: "toast-success"
                    });
        
                    var combinedData = {
                        id: selectedRowData.id,
                        [selectKey.name]: selectedOtherFields.code,
                    };
        
                    // update func
                    onUpdateTemplateData(combinedData);
            
                    // reset states
                    setAddApproveFlag(false);
                    setApproveTableFlag(false);
                    setShowOtherTransferModal(false);

                } else {
                    const errorMessage = chnageSysStatus.message ? chnageSysStatus.message : "Failed to add approval. Please try again.";
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
                        className: "toast-error"
                    });
                }
            }

        }else{     
    
            var combinedData = {
                id: selectedRowData.id,
                [selectKey.name]: selectedOtherFields.code,
            };

            // update func
            onUpdateTemplateData(combinedData);

            // reset states
            setAddApproveFlag(false);
            setApproveTableFlag(false);
            setShowOtherTransferModal(false);

        }
    };

    const showPtCaseTemplate = async () => {
        var getTemplatePayload = {
            "table_name": table_name,
            "id": selectedRowData.id,
            "template_module": "ui_case"
        }

        setLoading(true);

        try {
            const getTemplateResponse = await api.post("/templateData/viewTemplateData",getTemplatePayload);
            setLoading(false);

            if (getTemplateResponse && getTemplateResponse.success) {
                if (getTemplateResponse.data && getTemplateResponse.data["template_module_data"]) {
                if (
                    !getTemplateResponse.data["template_module_data"].table_name ||
                    getTemplateResponse.data["template_module_data"].table_name === ""
                ) {
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
            table_name: getTemplateResponse.data["template_module_data"].table_name,
          };
          setLoading(true);

          try {
            const viewTemplateResponse = await api.post(
              "/templates/viewTemplate",
              viewTableData
            );

            setLoading(false);
            if (viewTemplateResponse && viewTemplateResponse.success) {
              setOtherFormOpen(true);

              setOtherReadOnlyTemplateData(false);
              setOtherEditTemplateData(false);

              setOptionFormTemplateData(
                viewTemplateResponse.data["fields"]
                  ? viewTemplateResponse.data["fields"]
                  : []
              );
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

              setPtCaseTableName(getTemplateResponse.data["template_module_data"].table_name);
              setPtCaseTemplateName(
                getTemplateResponse.data["template_module_data"].template_name
              );
              setShowPtCaseModal(true);

              var PreDefinedData = {}

              if(getTemplateResponse.data){
                  viewTemplateResponse.data['fields'].map((element)=>{
                      if(element.name && getTemplateResponse.data[element.name] !== null && getTemplateResponse.data[element.name] !== undefined){
                          PreDefinedData[element.name] = getTemplateResponse.data[element.name];
                      }
                  })
              }
              setOtherInitialTemplateData(PreDefinedData);

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
        }
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

    const furtherInvestigationPtCaseSave = async (data)=>{

        if (!ptCaseTableName || ptCaseTableName === '') {
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

        var ui_case = data;
        setSingleApiData((prev) => ({
            ...prev,
            ui_case: ui_case,
        }));

        saveOverallData(false, ui_case);

        return;
    }

    const showNewApprovalPage = async ()=>{

        setLoading(true);

        try {

            const getActionsDetails = await api.post("/ui_approval/get_ui_case_approvals");

            setLoading(false);

            if (getActionsDetails && getActionsDetails.success) {

                setApprovalItem(getActionsDetails.data['approval_item']);
                setDesignationData(getActionsDetails.data['designation']);

                var getFurtherInvestigationItems = getActionsDetails.data['approval_item'].filter((data)=>{
                    if((data.name).toLowerCase() === 'further investigation'){
                        return data;
                    }
                });

                if(getFurtherInvestigationItems?.[0]){
                    approvalNewDataSave('approval_item', getFurtherInvestigationItems[0].approval_item_id);
                    setDisabledApprovalItems(true);
                }else{
                    approvalNewDataSave('approval_item', null);
                    setDisabledApprovalItems(false);
                }

                setApprovalSaveData({});
                setNewApprovalPage(true);

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

    const approvalNewDataSave = (name, value)=>{
        setSingleApiData((prev)=>{
            return{
                ...prev,
                approval : {
                    ...prev.approval,
                    [name] : value
                }
            }
        });
    }

    const saveOverallData = async (approvedSave, data) => {

        if (!singleApiData['approval'] || !singleApiData['approval']["approval_item"]) {
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
    
        if (!singleApiData['approval'] || !singleApiData['approval']["approved_by"]) {
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

        if (!singleApiData['approval'] || !singleApiData['approval']["approval_date"]) {
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
    
        if (!singleApiData['approval'] || !singleApiData['approval']["remarks"]) {
    
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

        if(approvedSave){
            showInvestigationPtCase();
            return;
        }

        const formData = new FormData();
        formData.append("table_name", ptCaseTableName);
        var normalData = {}; // Non-file upload fields

        optionFormTemplateData.forEach((field) => {

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

        normalData.sys_status = '178_cases';
        normalData['pt_case_id'] = furtherInvestigationSelectedRow.id;

        var othersData = Object.fromEntries(
            Object.entries(singleApiData).filter(([key]) => key !== 'ui_case')
        );

        if(othersData?.['approval']){
            var approvalItems = {
                id : othersData['sys_status']?.id,
                module_name : 'Pending Trail',
                action : othersData['sys_status']?.sys_status
            }

            othersData = {
                            ...othersData, 
                            approval_details : approvalItems,
                            others_table_name : table_name
                        }
        }
          
        formData.append("data", JSON.stringify(normalData));
        formData.append("others_data", JSON.stringify(othersData));
        var transitionId = `pt_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
        formData.append("transaction_id", transitionId);
        formData.append("user_designation_id", localStorage.getItem('designation_id') ? localStorage.getItem('designation_id') : null);

        setLoading(true);

        try {
            const overallSaveData = await api.post("/templateData/saveDataWithApprovalToTemplates",formData);

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
                    onOpen: () => loadTableData(paginationCount),
                });

                setSingleApiData({});
                setNewApprovalPage(false);
                setFurtherInvestigationSelectedValue(null);
                setFurtherInvestigationSelectedRow([]);
                setFurtherInvestigationPtCase(false);
                setDisabledApprovalItems(false);
                setApprovalSaveData({});

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



    const checkDisposalValues = async () => {
        if (selectedOtherTemplate?.["field"] === "field_nature_of_disposal" && selectedOtherFields?.["name"]) {
            if (selectedOtherFields && selectedOtherFields["name"] === "A") {
                showPtCaseTemplate();
                setDisposalUpdate(true);
            } else {
                Swal.fire({
                    title: selectedOtherFields["name"] === "B" ? "Approved by Court" : "Are You Sure ?",
                    text: selectedOtherFields["name"] === "B" ? "" : "Do you want to move this case !",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonText: "Yes !",
                    cancelButtonText: "No",
                }).then(async (result) => {
                    if (result.isConfirmed) {
                        if (selectedOtherTemplate && selectedOtherTemplate.is_approval) {

                            var payloadApproveData = {
                                ...approvalSaveData,
                                case_id: furtherInvestigationSelectedRow?.id || selectedRowData.id,
                                case_type: "ui_case",
                                module: "Under Investiation",
                                action: selectedOtherTemplate?.name || "Action",
                                transaction_id: randomApprovalId,
                                created_by_designation_id: localStorage.getItem("designation_id") ? localStorage.getItem("designation_id") : "",
                                created_by_division_id: localStorage.getItem("division_id") ? localStorage.getItem("division_id") : "",
                                info: {
                                    module: "Under Investiation",
                                    action: selectedOtherTemplate?.name || "Action",
                                },
                            };
                        
                            setLoading(true);
                      
                            try {
                                const chnageSysStatus = await api.post( "/ui_approval/create_ui_case_approval",payloadApproveData);
                        
                                setLoading(false);
                        
                                if (chnageSysStatus && chnageSysStatus.success) {
                
                                    toast.success( chnageSysStatus.message ? chnageSysStatus.message : "Approval Added Successfully Successfully",{
                                        position: "top-right",
                                        autoClose: 3000,
                                        hideProgressBar: false,
                                        closeOnClick: true,
                                        pauseOnHover: true,
                                        draggable: true,
                                        progress: undefined,
                                        className: "toast-success"
                                    });
                        
                                    updateSysStatusDisposal();

                                    // reset states
                                    setSelectKey(null);
                                    setSelectedRow(null);
                                    setOtherTransferField([]);
                                    setShowOtherTransferModal(false);
                                    setSelectedOtherFields(null);
                                    setselectedOtherTemplate(null);
                                    setAddApproveFlag(false);
                                    setApproveTableFlag(false);
                                    setShowOtherTransferModal(false);
                                    setApprovalSaveData({});
                
                                } else {
                                    const errorMessage = chnageSysStatus.message ? chnageSysStatus.message : "Failed to add approval. Please try again.";
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
                                        className: "toast-error"
                                    });
                                }
                            }
                            return;
                        }
                    } else {
                        setSelectKey(null);
                        setSelectedRow(null);
                        setOtherTransferField([]);
                        setShowOtherTransferModal(false);
                        setSelectedOtherFields(null);
                        setselectedOtherTemplate(null);
                        setAddApproveFlag(false);
                        setApproveTableFlag(false);
                        setShowOtherTransferModal(false);
                    }
                });
            }
        } else if ((selectedOtherTemplate?.["field"] === "field_prosecution_sanction" || selectedOtherTemplate?.["field"] === "field_17a_pc_act") && selectedOtherFields?.["name"]) {
            if (selectedOtherFields?.["name"].toLowerCase() === "yes" && selectedOtherTemplate?.["field"] === "field_prosecution_sanction") {

                showActionsOptionsTemplate("cid_ui_case_order_of_prosecution_sanction");
                return;

            } else if (selectedOtherFields?.["name"].toLowerCase() === "yes" && selectedOtherTemplate?.["field"] === "field_17a_pc_act") {

                showActionsOptionsTemplate("cid_ui_case_order_of_17a_pc_act");
                return;

            } else {

                if (selectedOtherTemplate && selectedOtherTemplate.is_approval) {

                    var payloadApproveData = {
                        ...approvalSaveData,
                        case_id: furtherInvestigationSelectedRow?.id || selectedRowData.id,
                        case_type: "ui_case",
                        module: "Under Investiation",
                        action: selectedOtherTemplate?.name || "Action",
                        transaction_id: randomApprovalId,
                        created_by_designation_id: localStorage.getItem("designation_id") ? localStorage.getItem("designation_id") : "",
                        created_by_division_id: localStorage.getItem("division_id") ? localStorage.getItem("division_id") : "",
                        info: {
                            module: "Under Investiation",
                            action: selectedOtherTemplate?.name || "Action",
                        },
                    };
                
                    setLoading(true);
            
                    try {
                        const chnageSysStatus = await api.post( "/ui_approval/create_ui_case_approval",payloadApproveData);
                
                        setLoading(false);
                
                        if (chnageSysStatus && chnageSysStatus.success) {
        
                            toast.success( chnageSysStatus.message ? chnageSysStatus.message : "Approval Added Successfully Successfully",{
                                position: "top-right",
                                autoClose: 3000,
                                hideProgressBar: false,
                                closeOnClick: true,
                                pauseOnHover: true,
                                draggable: true,
                                progress: undefined,
                                className: "toast-success"
                            });
                
                            var combinedData = {
                                id: selectedRowData.id,
                                [selectKey.name]: selectedOtherFields.code,
                            };
            
                            onUpdateTemplateData(combinedData);
            
                            // reset states
                            setSelectKey(null);
                            setSelectedRow(null);
                            setOtherTransferField([]);
                            setShowOtherTransferModal(false);
                            setSelectedOtherFields(null);
                            setselectedOtherTemplate(null);
                            setAddApproveFlag(false);
                            setApproveTableFlag(false);
                            setShowOtherTransferModal(false);
                            setApprovalSaveData({});
        
                        } else {
                            const errorMessage = chnageSysStatus.message ? chnageSysStatus.message : "Failed to add approval. Please try again.";
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
                                className: "toast-error"
                            });
                        }
                    }
                }else{
                    var combinedData = {
                        id: selectedRowData.id,
                        [selectKey.name]: selectedOtherFields.code,
                    };
    
                    onUpdateTemplateData(combinedData);
    
                    // reset states
                    setSelectKey(null);
                    setSelectedRow(null);
                    setOtherTransferField([]);
                    setShowOtherTransferModal(false);
                    setSelectedOtherFields(null);
                    setselectedOtherTemplate(null);
                    setAddApproveFlag(false);
                    setApproveTableFlag(false);
                    setShowOtherTransferModal(false);
                }
            }
        }
    };

    const updateSysStatusDisposal = async () => {
        var payloadSysStatus = {
            table_name: table_name,
            data: {
                id: selectedRowData.id,
                sys_status: "disposal",
                default_status: "ui_case",
            }
        };

        setLoading(true);

        try {
            const chnageSysStatus = await api.post("/templateData/caseSysStatusUpdation",payloadSysStatus);

            setLoading(false);

            if (chnageSysStatus && chnageSysStatus.success) {
                toast.success( chnageSysStatus.message ? chnageSysStatus.message : "Status Changed Successfully",{
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    className: "toast-success",
                });

                // update func
                var combinedData = {
                    id: selectedRowData.id,
                    [selectKey.name]: selectedOtherFields.code,
                };

                onUpdateTemplateData(combinedData);

                setDisposalUpdate(false);

                // reset states
                setSelectKey(null);
                setSelectedRow(null);
                setOtherTransferField([]);
                setShowOtherTransferModal(false);
                setSelectedOtherFields(null);
                setselectedOtherTemplate(null);

                setApprovalsData([]);
                setApprovalItem([]);
                setApprovalItemDisabled(false);
                setDesignationData([]);

                setAddApproveFlag(false);
                setApproveTableFlag(false);
                setApprovalSaveData({});

            } else {
                const errorMessage = chnageSysStatus.message ? chnageSysStatus.message : "Failed to change the status. Please try again.";
                toast.error(errorMessage, {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    className: "toast-error"
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
    };

      const showActionsOptionsTemplate = async (table) => {
        const viewTableData = {
          table_name: table,
        };
    
        setLoading(true);
    
        try {
          const viewTemplateResponse = await api.post(
            "/templates/viewTemplate",
            viewTableData
          );
    
          setLoading(false);
          if (viewTemplateResponse && viewTemplateResponse.success) {
            setOtherFormOpen(true);
            setOtherInitialTemplateData({});
    
            setOtherReadOnlyTemplateData(false);
            setOtherEditTemplateData(false);
    
            setOptionFormTemplateData(
              viewTemplateResponse.data["fields"]
                ? viewTemplateResponse.data["fields"]
                : []
            );
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
    
            setPtCaseTableName(table);
            setPtCaseTemplateName(viewTemplateResponse?.data?.template_name);
            setShowPtCaseModal(true);
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

  const [isUpdatePdf, setIsUpdatePdf] = useState(false);

  const handleFilter = async () => {
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

      if (
        viewTemplateResponse &&
        viewTemplateResponse.success &&
        viewTemplateResponse.data
      ) {
        var templateFields = viewTemplateResponse.data["fields"]
          ? viewTemplateResponse.data["fields"]
          : [];

        var validFilterFields = ["dropdown", "autocomplete", "multidropdown", "date", "datetime", "time"];

        var getOnlyDropdown = templateFields
          .filter((element) => validFilterFields.includes(element.type))
          .map((field) => {
            const existingField = filterDropdownObj?.find(
              (item) => item.name === field.name
            );
            return {
              ...field,
              history: false,
              info: false,
              required: false,
              ...(field.is_dependent === "true" && {
                options: existingField?.options
                  ? [...existingField.options]
                  : [],
              }),
            };
          });

        // const today = dayjs().format("YYYY-MM-DD");

        getAllOptionsforFilter(getOnlyDropdown);
        // if(fromDateValue == null || toDateValue === null){
        //     setFromDateValue(today);
        //     setToDateValue(today);
        // }

        setShowFilterModal(true);
      } else {
        const errorMessage = viewTemplateResponse.message
          ? viewTemplateResponse.message
          : "Failed to Get Template. Please try again.";
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

        if(others){
            setOthersFiltersDropdown(updatedFieldsDropdown)
        }else{
            setfilterDropdownObj(updatedFieldsDropdown);
        }

    } catch (error) {
      setLoading(false);
      console.error("Error fetching template data:", error);
    }
  };

  const handleClear = () => {
    setSearchValue("");
    setFilterValues({});
    setFromDateValue(null);
    setToDateValue(null);
    setForceTableLoad((prev) => !prev);
  };

  const setFilterData = () => {
    setPaginationCount(1);
    setShowFilterModal(false);
    setForceTableLoad((prev) => !prev);
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


  const showCaseApprovalPage = async (caseData, formData,isSave)=>{

    setIsApprovalSaveMode(isSave);
        setLoading(true);

        try {

            const getActionsDetails = await api.post("/ui_approval/get_ui_case_approvals");

            setLoading(false);

            if (getActionsDetails && getActionsDetails.success) {

                setApprovalItemsData(getActionsDetails.data['approval_item']);
                setApprovalDesignationData(getActionsDetails.data['designation']);

                var getFurtherInvestigationItems = getActionsDetails.data['approval_item'].filter((data)=>{
                  if(!isSave){
                    if((data.name).toLowerCase() === 'case updation'){
                        return data;
                    }
                  }
                  else{
                    if((data.name).toLowerCase() === 'case registration'){
                      return data;
                  }
                  }
                });

                if(getFurtherInvestigationItems?.[0]){
                    caseApprovalOnChange('approval_item', getFurtherInvestigationItems[0].approval_item_id);
                    setReadonlyApprovalItems(true);
                }else{
                    caseApprovalOnChange('approval_item', null);
                    setReadonlyApprovalItems(false);
                }

                setShowApprovalModal(true);
                setApprovalSaveCaseData({
                    caseData : caseData,
                    formData : formData
                });

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

    const handleApprovalWithSave = async ()=>{

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
            module_name : 'Pending Trail',
            action : 'Create Case'
        }

        var approvalData = {
                        approval : approvalFormData, 
                        approval_details : approvalItems,
                        others_table_name : table_name
                    }

        for (let [key, value] of approvalSaveCaseData.formData.entries()) {
            formData.append(key, value);
        }

        formData.append("data", JSON.stringify(approvalSaveCaseData['caseData']));
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
                    onOpen: () => {

                        if(saveNew === true){
                            getTemplate(table_name);
                            setFormOpen(false);
                            setShowApprovalModal(false);
                            setApprovalSaveCaseData({});
                            setApprovalItemsData([]);
                            setApprovalDesignationData([]);
                            setApprovalSaveData({});
                            return;
                        }else{
                            loadTableData(paginationCount);
                        }

                    },
                });

                setShowApprovalModal(false);
                setApprovalSaveCaseData({});
                setApprovalItemsData([]);
                setApprovalDesignationData([]);
                setApprovalSaveData({});

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

    
          const handleApprovalWithUpdate = async () => {
            if (!approvalFormData || !approvalFormData["approval_item"]) {
                toast.error("Please Select Approval Item!", {
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
                toast.error("Please Select Designation!", {
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
                toast.error("Please Select Approval Date!", {
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
                toast.error("Please Enter Comments!", {
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
              id: approvalSaveCaseData.caseData.id,
              type: 'pt_case',
                module_name: 'Pending Trail',
                action: 'Update Case',
            };
        
            const approvalData = {
                approval: approvalFormData,
                approval_details: approvalItems,
            };
        
            for (let [key, value] of approvalSaveCaseData.formData.entries()) {
                formData.append(key, value);
            }
        
            formData.append("data", JSON.stringify(approvalSaveCaseData['caseData']));
            formData.append("others_data", JSON.stringify(approvalData));
        
            const transitionId = `pt_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
            formData.append("transaction_id", transitionId);
            formData.append("user_designation_id", localStorage.getItem('designation_id') || null);
        
            setLoading(true);
        
            try {
                const overallUpdateData = await api.post("/templateData/updateDataWithApprovalToTemplates", formData);
        
                setLoading(false);
        
                if (overallUpdateData && overallUpdateData.success) {
                    toast.success(overallUpdateData.message || "Case Updated Successfully", {
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
        
                    setShowApprovalModal(false);
                    setApprovalSaveCaseData({});
                    setApprovalItemsData([]);
                    setApprovalDesignationData([]);
                    setApprovalSaveData({});
                } else {
                    const errorMessage = overallUpdateData.message || "Failed to update the case. Please try again.";
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
                    toast.error(error.response["data"].message || "Please Try Again!", {
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

        const showAttachmentField = (options, selectedRow) => {

            if (options.permissions) {

                const parsedPermissions = JSON.parse(options.permissions);

                if (parsedPermissions && typeof parsedPermissions === 'object' && !Array.isArray(parsedPermissions)) {

                    if(parsedPermissions?.['edit'].length > 0){
                        const hasAddPermission = parsedPermissions?.['edit'].some(
                            (permission) => userPermissions?.[0]?.[permission] === true
                        );

                        attachmentEditFlag.current = hasAddPermission;
                    }else{
                        attachmentEditFlag.current = true;
                    }

                }else{
                    attachmentEditFlag.current = true;
                }
            }

            setShowFileAttachments(true);
        }

        const setUnAssignedIo = ()=>{
            setFilterValues(prev => ({
                ...(prev || {}),
                field_io_name: ""
            }));
            setForceTableLoad((prev) => !prev);
        }

  return (
    <Box p={2} inert={loading ? true : false}>
      <>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
            }}
          >
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                cursor: "pointer",
                gap: '6px'
              }}
            >
              {/* <img src='./arrow-left.svg' /> */}
              <Typography variant="h1" align="left" className="ProfileNameText">
                {dashboardTileName ? dashboardTileName : template_name
                  ? template_name
                      .toLowerCase()
                      .replace(/\b\w/g, (c) => c.toUpperCase())
                  : "Pending Trail"}
              </Typography>
                <Box className="totalRecordCaseStyle">
                    {totalRecord} Cases
                </Box>
            </Box>
          </Box>
          <Box sx={{ display: "flex", alignItems: "start", gap: "12px" }}>
            {isCheckboxSelected && (
              <>
                <Button
                  variant="contained"
                  startIcon={
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 20 18"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M1 18V12H3V16H7V18H1ZM13 18V16H17V12H19V18H13ZM5.175 12.825L3.75 11.425L5.175 10H0V8H5.175L3.75 6.575L5.175 5.175L9 9L5.175 12.825ZM14.825 12.825L11 9L14.825 5.175L16.25 6.575L14.825 8H20V10H14.825L16.25 11.425L14.825 12.825ZM1 6V0H7V2H3V6H1ZM17 6V2H13V0H19V6H17Z"
                        fill="black"
                      />
                    </svg>
                  }
                  sx={{
                    background: "#32D583",
                    color: "#101828",
                    textTransform: "none",
                    height: "38px",
                  }}
                >
                  Merge
                </Button>
                <Button
                  variant="contained"
                  startIcon={
                    <svg
                      fill="#000000"
                      width="22"
                      height="22"
                      viewBox="0 0 20 18"
                      xmlns="http://www.w3.org/2000/svg"
                      class="cf-icon-svg"
                    >
                      <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                      <g
                        id="SVGRepo_tracerCarrier"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      ></g>
                      <g id="SVGRepo_iconCarrier">
                        <path d="M5.857 3.882v3.341a1.03 1.03 0 0 1-2.058 0v-.97a5.401 5.401 0 0 0-1.032 2.27 1.03 1.03 0 1 1-2.02-.395A7.462 7.462 0 0 1 2.235 4.91h-.748a1.03 1.03 0 1 1 0-2.058h3.34a1.03 1.03 0 0 1 1.03 1.03zm-3.25 9.237a1.028 1.028 0 0 1-1.358-.523 7.497 7.497 0 0 1-.37-1.036 1.03 1.03 0 1 1 1.983-.55 5.474 5.474 0 0 0 .269.751 1.029 1.029 0 0 1-.524 1.358zm2.905 2.439a1.028 1.028 0 0 1-1.42.322 7.522 7.522 0 0 1-.885-.652 1.03 1.03 0 0 1 1.34-1.563 5.435 5.435 0 0 0 .643.473 1.03 1.03 0 0 1 .322 1.42zm3.68.438a1.03 1.03 0 0 1-1.014 1.044h-.106a7.488 7.488 0 0 1-.811-.044 1.03 1.03 0 0 1 .224-2.046 5.41 5.41 0 0 0 .664.031h.014a1.03 1.03 0 0 1 1.03 1.015zm.034-12.847a1.03 1.03 0 0 1-1.029 1.01h-.033a1.03 1.03 0 0 1 .017-2.06h.017l.019.001a1.03 1.03 0 0 1 1.009 1.05zm3.236 11.25a1.029 1.029 0 0 1-.3 1.425 7.477 7.477 0 0 1-.797.453 1.03 1.03 0 1 1-.905-1.849 5.479 5.479 0 0 0 .578-.328 1.03 1.03 0 0 1 1.424.3zM10.475 3.504a1.029 1.029 0 0 1 1.41-.359l.018.011a1.03 1.03 0 1 1-1.06 1.764l-.01-.006a1.029 1.029 0 0 1-.358-1.41zm4.26 9.445a7.5 7.5 0 0 1-.315.56 1.03 1.03 0 1 1-1.749-1.086 5.01 5.01 0 0 0 .228-.405 1.03 1.03 0 1 1 1.836.93zm-1.959-6.052a1.03 1.03 0 0 1 1.79-1.016l.008.013a1.03 1.03 0 1 1-1.79 1.017zm2.764 2.487a9.327 9.327 0 0 1 0 .366 1.03 1.03 0 0 1-1.029 1.005h-.025A1.03 1.03 0 0 1 13.482 9.7a4.625 4.625 0 0 0 0-.266 1.03 1.03 0 0 1 1.003-1.055h.026a1.03 1.03 0 0 1 1.029 1.004z"></path>
                      </g>
                    </svg>
                  }
                  sx={{
                    background: "#32D583",
                    color: "#101828",
                    textTransform: "none",
                    height: "38px",
                  }}
                  onClick={() =>
                    showTransferToOtherDivision(
                      {
                        table: "cid_under_investigation",
                        field: "field_division",
                        name: "Massive Division",
                      },
                      { id: selectedRowIds }
                    )
                  }
                >
                  Mass Change Of Division
                </Button>
              </>
            )}

            <Button
                variant="outlined"
                startIcon={<PersonOffIcon />}
                onClick={setUnAssignedIo}
                sx={{
                    borderColor: '#eb2f06',
                    backgroundColor: '#FFF5F5',
                    color: '#eb2f06',
                    height: 38,
                    fontWeight: 500,
                    textTransform: 'uppercase',
                    '&:hover': {
                        borderColor: '#e55039',
                        backgroundColor: '#FFE8E8',
                        color: '#e55039'
                    },
                    '& .MuiSvgIcon-root': {
                        color: '#eb2f06'
                    }
                }}
            >
                Unassigned IO
            </Button>

            {JSON.parse(localStorage.getItem("user_permissions")) &&
              JSON.parse(localStorage.getItem("user_permissions"))[0]
                .create_pt && (
                <Button
                  onClick={() => getTemplate(table_name)}
                  className="blueButton"
                  startIcon={
                    <AddIcon
                      sx={{
                        border: "1.3px solid #FFFFFF",
                        color: "#FFFFFF",
                        borderRadius: "50%",
                      }}
                    />
                  }
                  variant="contained"
                >
                  Add New
                </Button>
              )}
            {localStorage.getItem("authAdmin") === "false" && (
              <Button
                onClick={downloadReportModal}
                variant="contained"
                sx={{
                  background: "#32D583",
                  color: "#101828",
                  textTransform: "none",
                  height: "38px",
                }}
              >
                Download Report
              </Button>
            )}
          </Box>
        </Box>

        <Box
          pt={1}
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "start",
          }}
        >
          <Box className="parentFilterTabs">
            {/* <Box
              onClick={() => {
                setSysSattus("all");
                setPaginationCount(1);
              }}
              id="filterAll"
              className={`filterTabs ${sysStatus === "all" ? "Active" : ""}`}
            >
              All
            </Box> */}
            <Box
              onClick={() => {
                setSysSattus("pt_case");
                setPaginationCount(1);
              }}
              id="filterUiCase"
              className={`filterTabs ${
                sysStatus === "pt_case" ? "Active" : ""
              }`}
            >
              PT Cases
            </Box>
            <Box
              onClick={() => {
                setSysSattus("178_cases");
                setPaginationCount(1);
              }}
              id="filter178Cases"
              className={`filterTabs ${
                sysStatus === "178_cases" ? "Active" : ""
              }`}
            >
              Preliminary Charge Sheet - 173 (8)
            </Box>
            <Box
              onClick={() => {
                setSysSattus("disposal");
                setPaginationCount(1);
              }}
              id="filterDisposal"
              className={`filterTabs ${
                sysStatus === "disposal" ? "Active" : ""
              }`}
            >
              Disposal
            </Box>
          </Box>
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
              {(searchValue ||
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
                  View All / Clear Filter
                </Typography>
              )}
            </Box>
        </Box>

        <Box py={2}>
            <TableView 
                hoverTable={true}
                hoverTableOptions={hoverTableOptions}
                hoverActionFuncHandle={handleOtherTemplateActions}
                height={true} 
                rows={tableData} 
                columns={viewTemplateTableColumns}
                totalPage={totalPage} 
                totalRecord={totalRecord} 
                paginationCount={paginationCount} 
                handlePagination={handlePagination} 
                getRowClassName={(params) => {
                  return !params.row["field_io_name"]
                      ? "row-red-background"
                      : "";
              }}
            />
        </Box>
      </>
      {formOpen && (
        <DynamicForm
          table_row_id={selectedRowId}
          template_id={selectedTemplateId}
          linkToLeader={linkLeader}
          linkToOrganization={linkOrganization}
          table_name={table_name}
          template_name={template_name}
          readOnly={viewReadonly}
          editData={editTemplateData}
          onUpdate={onCaseUpdateTemplateData}
          formConfig={formTemplateData}
          stepperData={stepperData}
          initialData={initialData}
          onSubmit={onSaveTemplateData}
          onError={onSaveTemplateError}
          closeForm={closeAddForm}
        />
      )}

      {otherFormOpen && (
        <Dialog
          open={otherFormOpen}
          onClose={() => {
            setOtherFormOpen(false);
            setShowPtCaseModal(false);
          }}
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
                  template_name={
                    showPtCaseModal
                      ? ptCaseTemplateName
                      : selectedOtherTemplate?.name
                  }
                  table_name={
                    showPtCaseModal
                      ? ptCaseTableName
                      : selectedOtherTemplate?.table
                  }
                  readOnly={otherReadOnlyTemplateData}
                  editData={otherEditTemplateData}
                  initialData={otherInitialTemplateData}
                  formConfig={optionFormTemplateData}
                  stepperData={optionStepperData}
                  onSubmit={otherTemplateSaveFunc}
                  onUpdate={otherTemplateUpdateFunc}
                  onError={onSaveTemplateError}
                  closeForm={setOtherFormOpen}
                  headerDetails={selectedRowData?.["field_cc_no./sc_no"]}
                  selectedRow={selectedRowData}
                  showCaseLog={true}
                />
              </FormControl>
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ padding: "12px 24px" }}>
            <Button onClick={() => setOtherFormOpen(false)}>Cancel</Button>
          </DialogActions>
        </Dialog>
      )}

      {showOptionModal && (
        <Dialog
          open={showOptionModal}
          onClose={() => setShowOptionModal(false)}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">Filters</DialogTitle>
          <DialogContent sx={{ minWidth: "400px" }}>
            <DialogContentText id="alert-dialog-description">
              <FormControl fullWidth></FormControl>
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ padding: "12px 24px" }}>
            <Button onClick={() => setShowOptionModal(false)}>Cancel</Button>
            <Button className="fillPrimaryBtn">Submit</Button>
          </DialogActions>
        </Dialog>
      )}

      {showAttachmentModal && (
        <Dialog
          open={showAttachmentModal}
          onClose={() => setShowAttachmentModal(false)}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle
            id="alert-dialog-title"
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            Attachments
            <IconButton
              aria-label="close"
              onClick={() => setShowAttachmentModal(false)}
              sx={{ color: (theme) => theme.palette.grey[500] }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ minWidth: "400px" }}>
            <DialogContentText id="alert-dialog-description">
              <FormControl fullWidth>
                {showAttachmentData &&
                  showAttachmentData.length > 0 &&
                  showAttachmentData.map((data, i) => (
                    <Box
                      onClick={() => showIndivitualAttachment(data)}
                      key={i}
                      my={1}
                      px={2}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        cursor: "pointer",
                      }}
                    >
                      <span style={{ display: "flex" }}>
                        {getFileIcon(data)}
                      </span>
                      <span className="Roboto attachmentTableName">{data}</span>
                    </Box>
                  ))}
              </FormControl>
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ padding: "12px 24px" }}>
            <Button onClick={() => setShowAttachmentModal(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      )}

      {showDownloadModal && (
        <Dialog
          open={showDownloadModal}
          onClose={() => setShowDownloadModal(false)}
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
                  {showDownloadData &&
                    showDownloadData.map((fieldName, index) => {
                      return (
                        <Grid item xs={12} md={6} key={index}>
                          <Checkbox
                            name="downloadHeaders"
                            id={fieldName}
                            value={fieldName}
                            checked={
                              showSelectedDownloadData[
                                "downloadHeaders"
                              ]?.includes(fieldName) || false
                            }
                            onChange={(e) =>
                              handleCheckBoxChange(
                                "downloadHeaders",
                                fieldName,
                                e.target.checked
                              )
                            }
                          />
                          <label
                            htmlFor={fieldName}
                            style={{ fontSize: "14px" }}
                          >
                            {fieldName
                              .replace(/^field_/, "")
                              .replace(/_/g, " ")
                              .toLowerCase()
                              .replace(/^\w|\s\w/g, (c) => c.toUpperCase()) ||
                              ""}
                          </label>
                        </Grid>
                      );
                    })}
                </Grid>
              </FormControl>
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ padding: "12px 24px" }}>
            <Button onClick={() => setShowDownloadModal(false)}>Close</Button>
            <Button variant="outlined" onClick={() => callDownloadReportApi()}>
              Download
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {loading && (
        <div className="parent_spinner" tabIndex="-1" aria-hidden="true">
          <CircularProgress size={100} />
        </div>
      )}

    {/* other templates ui */}
    {otherTemplateModalOpen && (
        <Dialog
          open={otherTemplateModalOpen}
          onClose={() => setOtherTemplateModalOpen(false)}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        //   maxWidth="2xl"
          fullScreen
          fullWidth
          sx={{ zIndex: "1", marginLeft: '260px' }}
        >
          <DialogTitle
            id="alert-dialog-title"
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }} onClick={() => setOtherTemplateModalOpen(false)}>
                <WestIcon />
    
                <Typography variant="body1" fontWeight={500}>
                    {selectedOtherTemplate?.name}
                </Typography>
    
                {selectedRowData["field_cc_no./sc_no"] && (
                    <Chip
                        label={selectedRowData["field_cc_no./sc_no"]}
                        color="primary"
                        variant="outlined"
                        size="small"
                        sx={{ fontWeight: 500, marginTop: '2px' }}
                    />
                )}
    
            </Box>
            <Box sx={{display: 'flex', alignItems: 'center'}}>
              {selectedOtherTemplate?.table ===
              "cid_ui_case_progress_report" ? (
                hasPdfEntry &&(
                  <>
                    <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'end'}}>
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
                                        onClick={()=>handleOthersFilter(selectedOtherTemplate)}
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
                        placeholder='Search'
                        variant="outlined"
                        className="profileSearchClass"
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                handleOtherTemplateActions(selectedOtherTemplate, selectedRowData)
                            }
                        }}
                        
                        sx={{
                            width: '350px', borderRadius: '6px', outline: 'none',
                            '& .MuiInputBase-input::placeholder': {
                                color: '#475467',
                                opacity: '1',
                                fontSize: '14px',
                                fontWeight: '400',
                                fontFamily: 'Roboto'
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
                            }}
                            mt={1}
                        >
                            View All / Clear Filter
                        </Typography>
                    )}
                    </Box>
                    {/* {isIoAuthorized && ( */}
                    {!viewModeOnly && templateActionAddFlag.current === true (
                      <Button
                        variant="outlined"
                        onClick={() => {
                          showOptionTemplate(selectedOtherTemplate?.table);
                        }}
                      >
                        Add
                      </Button>
                      )}
                    {/* )} */}
                  </>
                )
              ) : ( 
                <Box sx={{display: 'flex', alignItems: 'start' ,justifyContent: 'space-between', gap: '12px'}}>
                    <Box>
                    </Box>
                    <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'end'}}>
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
                                        onClick={()=>handleOthersFilter(selectedOtherTemplate)}
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
                        placeholder='Search'
                        variant="outlined"
                        className="profileSearchClass"
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                handleOtherTemplateActions(selectedOtherTemplate, selectedRowData)
                            }
                        }}
                        
                        sx={{
                            width: '350px', borderRadius: '6px', outline: 'none',
                            '& .MuiInputBase-input::placeholder': {
                                color: '#475467',
                                opacity: '1',
                                fontSize: '14px',
                                fontWeight: '400',
                                fontFamily: 'Roboto'
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
                            }}
                            mt={1}
                        >
                            View All / Clear Filter
                        </Typography>
                    )}
                    </Box>
                    {templateActionAddFlag.current === true && (
                        <Button
                            variant="outlined"
                            sx={{height: '40px'}}
                            onClick={() =>
                                showOptionTemplate(selectedOtherTemplate?.table)
                            }
                        >
                            Add
                        </Button>
                    )}
                </Box>
              )}
            </Box>
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              <Box>
                {selectedOtherTemplate?.table ===
                "cid_ui_case_progress_report" ? (
                  hasPdfEntry ? (
                    uploadedFiles.length > 0 ? (
                      <>
                        <Box>
                            <TableView
                                rows={otherTemplateData}
                                columns={otherTemplateColumn}
                                totalPage={otherTemplatesTotalPage} 
                                totalRecord={otherTemplatesTotalRecord} 
                                paginationCount={otherTemplatesPaginationCount} 
                                handlePagination={handleOtherPagination} 
                            />
                        </Box>
                        <Box
                          display="flex"
                          flexDirection="column"
                          alignItems="center"
                          justifyContent="center"
                          marginTop={"10px"}
                        >
                          <Typography variant="h6">
                            Preview Uploaded PDF
                          </Typography>
                          <iframe
                            src={`${process.env.REACT_APP_SERVER_URL_FILE_VIEW}/${uploadedFiles[0].file_path}`}
                            width="100%"
                            height="500px"
                            style={{ border: "none" }}
                          />
                        </Box>
                      </>
                    ) : (
                      <Typography>No PDF found.</Typography>
                    )
                  ) : (
                    <Box
                      display="flex"
                      flexDirection="column"
                      alignItems="center"
                      justifyContent="center"
                      height="200px"
                    >
                      <Typography>
                        Please Upload your Progress Report Pdf
                      </Typography>
                      <Button variant="contained" component="label">
                        Upload File
                        <input
                          type="file"
                          hidden
                          accept="application/pdf"
                          onChange={(event) => handleFileUpload(event)}
                        />
                      </Button>
                    </Box>
                  )
                ) : (
                    <Box>                    
                        <TableView
                            rows={otherTemplateData}
                            columns={otherTemplateColumn}
                            totalPage={otherTemplatesTotalPage} 
                            totalRecord={otherTemplatesTotalRecord} 
                            paginationCount={otherTemplatesPaginationCount} 
                            handlePagination={handleOtherPagination} 
                        />
                    </Box>
                )}
              </Box>
            </DialogContentText>
          </DialogContent>
        </Dialog>
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
                                        formData={filterValues}
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
                                        formData={filterValues}
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
                                        formData={filterValues}
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

            {approveTableFlag && (
            <Dialog
              open={approveTableFlag}
              onClose={() => { setApprovalSaveData({}); setApproveTableFlag(false); }}
              aria-labelledby="alert-dialog-title"
              aria-describedby="alert-dialog-description"
              maxWidth="md"
              fullWidth
              PaperProps={{
                sx: {
                  zIndex: 1,
                  borderRadius: 2,
                  borderLeft: '8px solid #12B76A',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  overflow: 'hidden',
                }
              }}
            >
              <DialogTitle
                id="alert-dialog-title"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: 'linear-gradient(to right, #E6F4EA, #F6FFFB)',
                  fontWeight: 'bold',
                  fontSize: '20px',
                  color: 'black',
                }}
              >
                Approval
                <Box>
                  <Button
                    variant="contained"
                    sx={{ backgroundColor: '#12B76A', color: 'white', mr: 1, textTransform: 'none' }}
                    onClick={() => saveApprovalData(selectedOtherTemplate.table)}
                  >
                    Submit
                  </Button>
                  <IconButton
                    aria-label="close"
                    onClick={() => { setApprovalSaveData({}); setApproveTableFlag(false); }}
                    sx={{ color: '#344054' }}
                  >
                    <CloseIcon />
                  </IconButton>
                </Box>
              </DialogTitle>
      
              <DialogContent sx={{ backgroundColor: 'white', padding: 3 }}>
                <DialogContentText id="alert-dialog-description" component="div">
                  <Box sx={{ display: 'flex',
                    justifyContent: 'center',
                    fontWeight: 500,
                    fontSize: '18px',
                    mb: 2,
                    textAlign: 'center' 
                  }}>
                    <span style={{ color: '#F04438' }}>Approval needed to proceed with: </span>
                    <span style={{ color: '#1570EF' }}>
                      {approvalItem.find(option => option.approval_item_id === approvalSaveData?.approval_item)?.name || "Approval Item"}
                    </span>
                  </Box>
      
                  <Box sx={{ display: 'none' }}>
                    <Autocomplete
                      options={approvalItem}
                      getOptionLabel={(option) => option.name || ""}
                      name={"approval_item"}
                      disabled={approvalItemDisabled}
                      value={approvalItem.find((option) => option.approval_item_id === approvalSaveData?.approval_item) || null}
                      onChange={(e, value) => handleApprovalSaveData("approval_item", value?.approval_item_id)}
                      renderInput={(params) => (
                        <TextField {...params} label={"Approval Item"} />
                      )}
                    />
                  </Box>
      
                  <Box sx={{ display: 'flex', gap: '16px', flexWrap: 'wrap', mb: 3 }}>
                    <Box sx={{ flex: 1, minWidth: '200px' }}>
                      <AutocompleteField
                        formData={approvalSaveData}
                        options={designationData}
                        field={{
                          heading: 'Officer Approved',
                          label: 'Officer Approved',
                          name: 'approved_by',
                          options: designationData.map(item => ({
                            ...item,
                            code: item.designation_id,
                            name: item.designation_name,
                          })),
                          required: true,
                          info: 'Select the Officer Designation approving this item.',
                          supportingText: 'Select the Officer Designation approving this item.',      
                          supportingTextColor: 'green'
                        }}
                        onChange={(name, value) => handleApprovalSaveData(name, value)}
                        value={designationData.find(option => option.designation_id === approvalSaveData?.approved_by) || null}
                      />
                    </Box>
      
                    <Box sx={{ flex: 1, minWidth: '200px' }}>
                      <DateField
                        field={{
                          heading: 'Date of Approval',
                          name: 'approval_date',
                          label: 'Date of Approval',
                          required: true,
                          disableFutureDate: 'true',
                          info: 'Pick the date on which the approval is being granted.',
                          supportingText: 'Pick the date on which the approval is being granted.',
                          supportingTextColor: 'green',
                          selectTodayDate : true
                        }}
                        formData={approvalSaveData}
                        value={approvalSaveData["approval_date"] ? dayjs(approvalSaveData["approval_date"]) : null}
                        onChange={(value) => handleApprovalSaveData('approval_date', value)}
                      />
                    </Box>
                  </Box>
      
                  <LongText
                    field={{
                      heading: 'Remarks of Approval Officer',
                      name: 'remarks',
                      label: 'Remarks of Approval Officer',
                      required: true,
                      info:'Provide any comments or reasoning related to this approval.',
                      supportingText: 'Provide any comments or reasoning related to this approval.',
                      supportingTextColor: 'green'
                    }}
                    value={approvalSaveData["remarks"]}
                    formData={approvalSaveData}
                    onChange={(e) => handleApprovalSaveData("remarks", e.target.value)}
                  />
                </DialogContentText>
              </DialogContent>
            </Dialog>
            )}

      <Dialog
        open={showOtherTransferModal}
        onClose={() => setShowOtherTransferModal(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title"></DialogTitle>
        <DialogContent sx={{ width: "400px" }}>
          <DialogContentText id="alert-dialog-description">
            <h4 className="form-field-heading">{selectKey?.title}</h4>
            <FormControl fullWidth>
              <Autocomplete
                id=""
                options={otherTransferField}
                getOptionLabel={(option) => option.name || ""}
                value={
                  otherTransferField.find(
                    (option) =>
                      option.code ===
                      (selectedOtherFields && selectedOtherFields.code)
                  ) || null
                }
                disabled={fieldActionAddFlag.current === false}
                onChange={(event, newValue) => setSelectedOtherFields(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    className="selectHideHistory"
                    label={selectKey?.title}
                  />
                )}
              />
            </FormControl>
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ padding: "12px 24px" }}>
          <Button onClick={() => setShowOtherTransferModal(false)}>
            Cancel
          </Button>
            {
                fieldActionAddFlag.current === true && 
                <Button className="fillPrimaryBtn" onClick={handleSaveDivisionChange}>
                    Submit
                </Button>
            }
        </DialogActions>
      </Dialog>

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
                   <h4 className="form-field-heading">From Date</h4>
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
                  <h4 className="form-field-heading">To Date</h4>
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

                {filterDropdownObj.map((field) => {
                  switch (field.type) {
                    case "dropdown":
                      return (
                        <Grid item xs={12} md={6} p={2}>
                          <div className="form-field-wrapper_selectedField">
                            <SelectField
                              key={field.id}
                              field={field}
                              formData={filterValues}
                              onChange={(value) =>
                                handleAutocomplete(field, value.target.value)
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
                            formData={filterValues}
                            onChange={(name, selectedCode) =>
                              handleAutocomplete(field, selectedCode)
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
                            formData={filterValues}
                            onChange={(name, selectedCode) =>
                              handleAutocomplete(field, selectedCode)
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
                                        formData={filterValues}
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
                                        formData={filterValues}
                                        onChange={(date) => {
                                            const formattedDateTime = date
                                                ? dayjs(date).format("YYYY-MM-DD HH:mm:ss")
                                                : null;
                                            setFilterValues((prev) => ({
                                                ...prev,
                                                [field.name]: formattedDateTime,
                                            }));
                                        }}
                                    />
                                </div>
                            </Grid>
                        );
                       
                      case "time":
                          return (
                              <Grid item xs={12} md={6} p={2} key={field.id}>
                                  <div className="form-field-wrapper_selectedField">
                                      <TimeField
                                          key={field.id}
                                          field={field}
                                          formData={filterValues}
                                          onChange={(time) => {
                                              const formattedTime = time
                                                  ? dayjs(time).format("HH:mm:ss")
                                                  : null;
                                              setFilterValues((prev) => ({
                                                  ...prev,
                                                  [field.name]: formattedTime,
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


          {listApproveTableFlag && (
              <Dialog
                open={listApproveTableFlag}
                onClose={() => setListApproveTableFlag(false)}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                fullScreen
                fullWidth
                sx={{ zIndex: "1", marginLeft: '260px' }}

              >
                <DialogTitle
                    id="alert-dialog-title"
                    sx={{
                    display: "flex",
                    alignItems: "start",
                    justifyContent: "space-between",
                    }}
                >
                    {listAddApproveFlag ? (
                        <Box 
                            sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }} 
                            onClick={() => {  setListAddApproveFlag(false) }}
                        >
                            <WestIcon />
                            <Typography variant="body1" fontWeight={500}>
                                Approval
                            </Typography>
                            {listApprovalCaseNo && (
                                <Chip
                                    label={listApprovalCaseNo}
                                    color="primary"
                                    variant="outlined"
                                    size="small"
                                    sx={{ fontWeight: 500, marginTop: '2px' }}
                                />
                            )}
                            {!listAddApproveFlag &&
                            (
                                <Box className="totalRecordCaseStyle">
                                    {listApprovalTotalRecord} Records
                                </Box>
                            )}
                        </Box>
                    ) : (
                        <Box 
                            sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }} 
                            onClick={() => { setListApproveTableFlag(false) }}
                        >
                            <WestIcon />
                            <Typography variant="body1" fontWeight={500}>
                                Approval
                            </Typography>
                            {listApprovalCaseNo && (
                                <Chip
                                    label={listApprovalCaseNo}
                                    color="primary"
                                    variant="outlined"
                                    size="small"
                                    sx={{ fontWeight: 500, marginTop: '2px' }}
                                />
                            )}
                            {!listAddApproveFlag &&
                            (
                                <Box className="totalRecordCaseStyle">
                                    {listApprovalTotalRecord} Records
                                </Box>
                            )}
                        </Box>
                    )}

                    <Box sx={{display: 'flex', alignItems: 'center'}}>
                        <Box sx={{display: 'flex', alignItems: 'start' ,justifyContent: 'space-between', gap: '12px'}}>
                            <Box>
                            </Box>
                            {!listAddApproveFlag &&
                            (
                                   <Button
                                      variant="outlined"
                                      sx={{marginLeft: "10px", height: '40px'}}
                                      onClick = {() => {showApprovalLog(listApprovalCaseId)}}
                                    >
                                      Approval Log
                                  </Button>
                            )}
                            {!listAddApproveFlag &&
                            (
                                <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'end'}}>
                                    <TextFieldInput 
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <SearchIcon sx={{ color: "#475467" }} />
                                                </InputAdornment>
                                            ),
                                            // endAdornment: (
                                            //     // <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                            //     //     <IconButton
                                            //     //         sx={{ padding: "0 5px", borderRadius: "0" }}
                                            //     //         onClick={()=>handleOthersFilter(selectedOtherTemplate)}
                                            //     //     >
                                            //     //         <FilterListIcon sx={{ color: "#475467" }} />
                                            //     //     </IconButton>
                                            //     // </Box>
                                            // ),
                                        }}

                                        // onInput={(e) => setListApprovalSearchValue(e.target.value)}
                                        onChange={(e) => setListApprovalSearchValue(e.target.value)}
                                        value={listApprovalSearchValue}
                                        id="tableSearch"
                                        size="small"
                                        placeholder='Search'
                                        variant="outlined"
                                        className="profileSearchClass"
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault();
                                                showApprovalListPage(listApprovalCaseData);
                                            }
                                        }}
                                        
                                        sx={{
                                            width: '350px', borderRadius: '6px', outline: 'none',
                                            '& .MuiInputBase-input::placeholder': {
                                                color: '#475467',
                                                opacity: '1',
                                                fontSize: '14px',
                                                fontWeight: '400',
                                                fontFamily: 'Roboto'
                                            },
                                        }}
                                    />
                                    {(listApprovalSearchValue || listApprovalFromDate || listApprovalToDate || Object.keys(listApprovalFilterData).length > 0) && (
                                        <Typography
                                            onClick={handleListApprovalClear}
                                            sx={{
                                                fontSize: "13px",
                                                fontWeight: "500",
                                                textDecoration: "underline",
                                                cursor: "pointer",
                                            }}
                                            mt={1}
                                        >
                                            View All / Clear Filter
                                        </Typography>
                                    )}
                                </Box>
                            )}
                                {listAddApproveFlag && !listApprovalItemDisabled && (
                                    <Button
                                        variant="outlined"
                                        onClick={handleUpdateApproval}
                                    >
                                        Update
                                    </Button>
                                )}
                        </Box>
                        {/* <IconButton
                            aria-label="close"
                            onClick={() => setListApproveTableFlag(false)}
                            sx={{ color: (theme) => theme.palette.grey[500] }}
                        >
                            <CloseIcon />
                        </IconButton> */}
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        <Box py={2} sx={{ width: '100%'}}>
                            {!listAddApproveFlag ? (
                                <TableView 
                                    rows={listApprovalsData} 
                                    columns={listApprovalsColumn}
                                    totalPage={listApprovalTotalPage} 
                                    totalRecord={listApprovalTotalRecord} 
                                    paginationCount={listApprovalPaginationCount} 
                                    handlePagination={listApprovalPagination} 
                                />
                            ) : (
                            <Box
                                py={2}
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "18px",
                                }}
                            >

                                <AutocompleteField
                                  formData={{ approval_item: listApprovalSaveData?.approval_item }}
                                  errors={{}}
                                  field={{
                                      heading: 'Approval Item',
                                      name: 'approval_item',
                                      label: 'Approval Item',
                                      options: listApprovalItem.map(item => ({
                                          ...item,
                                          code: item.approval_item_id
                                      })),
                                      disabled: true,
                                      required: true ,
                                      history: true
                                  }}
                                  value={listApprovalSaveData?.approval_item}
                                  onHistory={() => getApprovalFieldLog("approval_item", listApprovalSaveData?.approval_id)}
                                  onChange={(fieldName, newValue) => {
                                      handleListApprovalSaveData(fieldName, newValue);
                                  }}
                                  onFocus={() => {}}
                                  isFocused={false}
                              />
        
                                <AutocompleteField
                                    formData={{ approved_by: listApprovalSaveData?.approved_by }}
                                    errors={{}} 
                                    field={{
                                        heading: 'Designation',
                                        name: 'approved_by',
                                        label: 'Designation',
                                        options: listDesignationData.map(item => ({
                                            ...item,
                                            code: item.designation_id,
                                            name: item.designation_name
                                        })),
                                        disabled: listApprovalItemDisabled,
                                        required: true,
                                        history: true
                                    }}
                                    onHistory={() => getApprovalFieldLog("approval_designation",listApprovalSaveData?.approval_id)}
                                    value={listApprovalSaveData?.approved_by}
                                    onChange={(fieldName, newValue) => {
                                        handleListApprovalSaveData(fieldName, newValue);
                                    }}
                                    onFocus={() => {}}
                                    isFocused={false}
                                />
       
                              <Box>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                  {<h4 className='form-field-heading'>Approval Date</h4>}
                                  <DemoContainer components={['DatePicker']}>
                                  <DatePicker
                                    className='selectHideHistory'
                                    label={
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                      <span>Approval Date</span>
                                      <span
                                      style={{
                                        padding: '0px 0px 0px 5px',
                                        verticalAlign: 'middle'
                                      }}
                                      className='MuiFormLabel-asterisk MuiInputLabel-asterisk css-1ljffdk-MuiFormLabel-asterisk'
                                      >
                                      *
                                      </span>
                                      <HistoryIcon
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        getApprovalFieldLog("approval_date", listApprovalSaveData?.approval_id);
                                      }}
                                      className='historyIcon'
                                      sx={{
                                        color: '#1570EF',
                                        padding: '0 1px',
                                        fontSize: '20px',
                                        verticalAlign: 'middle',
                                        cursor: 'pointer',
                                        pointerEvents: 'auto',
                                        marginBottom: '3px'
                                      }}
                                      />
                                    </div>
                                    }
                                    format="DD/MM/YYYY"
                                    disabled={listApprovalItemDisabled}
                                    required={true}
                                    sx={{ width: '100%' }}
                                    value={
                                    listApprovalSaveData?.approval_date
                                      ? dayjs(listApprovalSaveData.approval_date, 'DD/MM/YYYY')
                                      : null
                                    }
                                    onChange={(newVal) =>
                                    handleListApprovalSaveData(
                                      'approval_date',
                                      newVal ? newVal.format('DD/MM/YYYY') : null
                                    )
                                    }
                                    maxDate={dayjs()}
                                  />
                                  </DemoContainer>
                                </LocalizationProvider>
                                </Box>

                                <LongText
                                  field={{
                                      heading: 'Comments',
                                      name: 'remarks',
                                      label: 'Comments',
                                      required: true,
                                      history: true,
                                      disabled: listApprovalItemDisabled,
                                  }}
                                  formData={listApprovalSaveData}
                                  onChange={(e) => handleListApprovalSaveData("remarks", e.target.value)}
                                  onHistory={() => getApprovalFieldLog("remarks", listApprovalSaveData?.approval_id)}
                                  onFocus={() => {}}
                                  isFocused={false}
                              />

                            </Box>)}
                        </Box>
                    </DialogContentText>
                </DialogContent>
              </Dialog>
        )}
    {furtherInvestigationPtCase &&
        <Dialog
            open={furtherInvestigationPtCase}
            onClose={() => {setFurtherInvestigationPtCase(false);}}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            maxWidth="xl"
            fullWidth
        >
            <DialogContent sx={{ minWidth: '400px', padding: '0'  }}>
                <DialogContentText id="alert-dialog-description">
                    <FormControl fullWidth>
                        <NormalViewForm

                            table_row_id={otherRowId}
                            template_id={otherTemplateId}

                            template_name={showPtCaseModal && ptCaseTemplateName ? ptCaseTemplateName : selectedOtherTemplate?.name}
                            table_name={showPtCaseModal && ptCaseTableName ? ptCaseTableName : selectedOtherTemplate?.table}

                            readOnly={otherReadOnlyTemplateData}
                            editData={otherEditTemplateData}

                            initialData={otherInitialTemplateData}

                            formConfig={optionFormTemplateData}
                            stepperData={optionStepperData}

                            onSubmit={furtherInvestigationPtCaseSave}
                            onError={onSaveTemplateError}
                            closeForm={setFurtherInvestigationPtCase} 

                            headerDetails={selectedRowData?.["field_cc_no./sc_no"]}

                        />
                    </FormControl>
                </DialogContentText>
            </DialogContent>
            <DialogActions sx={{ padding: '12px 24px' }}>
                <Button onClick={() => setFurtherInvestigationPtCase(false)}>Cancel</Button>
            </DialogActions>
        </Dialog>
    }

    {newApprovalPage &&
        <Dialog
            open={newApprovalPage}
            onClose={() => setNewApprovalPage(false)}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            maxWidth="lg"
            fullWidth
            sx={{zIndex:'1'}}
        >
            <DialogTitle id="alert-dialog-title" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} >
                Approval
                <Box>
                    <Button variant="outlined" onClick={() => {saveOverallData(true)}}>Save</Button>
                    <IconButton
                        aria-label="close"
                        onClick={() => setNewApprovalPage(false)}
                        sx={{ color: (theme) => theme.palette.grey[500] }}
                    >
                        <CloseIcon />
                    </IconButton>
                </Box>

            </DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    <Box py={2}>
                        {
                            <Box sx={{display: 'flex', flexDirection: 'column', gap: '18px'}}>

                                <Autocomplete
                                    id=""
                                    options={approvalItem}
                                    getOptionLabel={(option) => option.name || ''}
                                    name={'approval_item'}
                                    disabled={disabledApprovalItems}
                                    value={approvalItem.find((option) => option.approval_item_id === (singleApiData?.['approval'] && singleApiData?.['approval']?.['approval_item'])) || null}
                                    onChange={(e,value)=>approvalNewDataSave('approval_item',value?.approval_item_id)}
                                    renderInput={(params) =>
                                        <TextField
                                            {...params}
                                            className='selectHideHistory'
                                            label={'Approval Item'}
                                        />
                                    }
                                />

                                <Autocomplete
                                    id=""
                                    options={designationData}
                                    getOptionLabel={(option) => option.designation_name || ''}
                                    name={'approved_by'}
                                    value={designationData.find((option) => option.designation_id === (singleApiData?.['approval'] && singleApiData?.['approval']?.['approved_by'])) || null}
                                    onChange={(e,value)=>approvalNewDataSave('approved_by',value?.designation_id)}
                                    renderInput={(params) =>
                                        <TextField
                                            {...params}
                                            className='selectHideHistory'
                                            label={'Designation'}
                                        />
                                    }
                                />

                                <LocalizationProvider dateAdapter={AdapterDayjs} sx={{width:'100%'}}>
                                    <DemoContainer components={['DatePicker']} sx={{width:'100%'}}>
                                        <DatePicker 
                                            label="Approval Date" 
                                            value={singleApiData?.['approval']?.['approval_date'] ? dayjs(singleApiData?.['approval']?.['approval_date']) : null} 
                                            name="approval_date" 
                                            format="DD/MM/YYYY"
                                            sx={{width:'100%'}}
                                            onChange={(newValue) => {
                                                if (newValue && dayjs.isDayjs(newValue)) {
                                                    approvalNewDataSave("approval_date", newValue.toISOString());
                                                } else {
                                                    approvalNewDataSave("approval_date", null);
                                                }
                                            }}
                                        />
                                    </DemoContainer>
                                </LocalizationProvider>

                                <TextField
                                    rows={8}
                                    label={'Comments'}
                                    sx={{width:'100%'}}
                                    name="remarks"
                                    value={singleApiData?.['approval']?.['remarks']}
                                    onChange={(e)=>approvalNewDataSave('remarks', e.target.value)}
                                />

                            </Box>
                        }
                    </Box>
                </DialogContentText>
            </DialogContent>
        </Dialog>
    }

        <ApprovalModal
            open={showApprovalModal}
            onClose={() => setShowApprovalModal(false)}
            onSave={isApprovalSaveMode ? handleApprovalWithSave : handleApprovalWithUpdate}
            
            approvalItem={approvalItemsData}
            disabledApprovalItems={readonlyApprovalItems}

            designationData={approvalDesignationData}
            
            formData={approvalFormData}
            onChange={caseApprovalOnChange}
        />

        {isDownloadPdf && (
            <GenerateProfilePdf
                is_print={isPrint}
                templateData={downloadPdfData}
                templateFields={downloadPdfFields}
                template_name={template_name}
                onSave={handleOnSavePdf}
            />
        )}
      
            {/* Dialog for displaying logs */}
            <Dialog
        open={openLogDialog}
        onClose={() => setOpenLogDialog(false)}
        fullWidth
        maxWidth="md"
        scroll="paper"
      >
        <DialogTitle>
          {LogDialogTitle} Logs
          <IconButton
            edge="end"
            color="inherit"
            onClick={() => setOpenLogDialog(false)}
            aria-label="close"
            sx={{ position: "absolute", right: 20, top: 12 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
      
        <DialogContent
          // dividers
          sx={{
            maxHeight: "60vh",
            overflowY: "auto",
          }}
        >
          <Box py={2}>
            <TableView rows={approvalFieldHistory} columns={approvalFieldHistoryHeader} />
          </Box>
        </DialogContent>
            </Dialog>
      
            <Dialog
              open={openActivityLogDialog}
              onClose={() => setOpenActivityLogDialog(false)}
              fullWidth
              maxWidth="md"
              scroll="paper"
            >
              <DialogTitle>
                Approval Logs
                <IconButton
                  edge="end"
                  color="inherit"
                  onClick={() => setOpenActivityLogDialog(false)}
                  aria-label="close"
                  sx={{ position: "absolute", right: 20, top: 12 }}
                >
                  <CloseIcon />
                </IconButton>
              </DialogTitle>
      
              <DialogContent
                // dividers
                sx={{
                  maxHeight: "60vh",
                  overflowY: "auto",
                }}
              >
                <Box py={2}>
                  <TableView rows={approvalActivityHistory} columns={approvalActivityHistoryHeader} />
                </Box>
              </DialogContent>
            </Dialog>

            {showFileAttachment &&
                <Dialog
                    open={showFileAttachment}
                    onClose={() => setShowFileAttachments(false)}
                    fullWidth
                    maxWidth="sm"
                >
                    <DialogTitle>
                        {selectedOtherTemplate?.['name']?.charAt(0).toUpperCase() + selectedOtherTemplate?.['name']?.slice(1) || "Attachment View"}
                        <IconButton
                            edge="end"
                            color="inherit"
                            onClick={() => setShowFileAttachments(false)}
                            aria-label="close"
                            sx={{ position: "absolute", right: 20, top: 12 }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </DialogTitle>

                    <DialogContent
                        sx={{
                            maxHeight: "60vh",
                            overflowY: "auto",
                        }}
                    >
                        <Box pt={2}>
                            <FileInput
                                field={{
                                    name : selectedOtherTemplate?.['field'] || "",
                                    disabled: true,
                                    label : selectedOtherTemplate?.['name'] || "",
                                }}
                                formData={selectedRowData}
                            />
                        </Box>
                    </DialogContent>
                </Dialog>
            }
    </Box>
  );
};

export default UnderInvestigation;
