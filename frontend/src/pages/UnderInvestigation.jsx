import { use, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import DynamicForm from "../components/dynamic-form/DynamicForm";
import NormalViewForm from "../components/dynamic-form/NormalViewForm";
import TableView from "../components/table-view/TableView";
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import SelectAllIcon from '@mui/icons-material/SelectAll';

import VerifiedIcon from '@mui/icons-material/Verified';
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import HistoryIcon from '@mui/icons-material/History';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

import api from "../services/api";
import { Badge, Chip, Tooltip } from "@mui/material";
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
} from "@mui/material";
import TextFieldInput from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

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
import xlsIcon from "../Images/xlsIcon.svg";
import pptIcon from "../Images/pptIcon.svg";
import jpgIcon from "../Images/jpgIcon.svg";
import pngIcon from "../Images/pngIcon.svg";
import CloseIcon from "@mui/icons-material/Close";
import { CircularProgress } from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import FilterListIcon from "@mui/icons-material/FilterList";
import TaskIcon from '@mui/icons-material/Task';
import AssignmentIcon from '@mui/icons-material/Assignment';

import AddTaskIcon from '@mui/icons-material/AddTask';
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import SelectField from "../components/form/Select";
import MultiSelect from "../components/form/MultiSelect";
import AutocompleteField from "../components/form/AutoComplete";
import { InputLabel, Select, MenuItem } from '@mui/material';
import NumberField from "../components/form/NumberField";
import ShortText from "../components/form/ShortText";
import LongText from "../components/form/LongText";
import DateField from "../components/form/Date";
import GenerateProfilePdf from "./GenerateProfilePdf";

import ApprovalModal from '../components/dynamic-form/ApprovalModalForm';
import WestIcon from '@mui/icons-material/West';
import FileInput from "../components/form/FileInput";

const UnderInvestigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // const [isIoAuthorized, setIsIoAuthorized] = useState(true);

    //   new further investigation func states
    const [newApprovalPage, setNewApprovalPage] = useState(false);
    const [singleApiData, setSingleApiData] = useState({});
    const [disabledApprovalItems, setDisabledApprovalItems] = useState(false);

    // on save approval modal

    const [showApprovalModal, setShowApprovalModal] = useState(false);
    const [approvalItemsData, setApprovalItemsData] = useState([]);
    const [readonlyApprovalItems, setReadonlyApprovalItems] = useState(false);
    const [approvalDesignationData, setApprovalDesignationData] = useState([]);
    const [approvalFormData, setApprovalFormData] = useState({});
    const [approvalSaveCaseData, setApprovalSaveCaseData] = useState({});

  const [showOptionModal, setShowOptionModal] = useState(false);
  const [paginationCount, setPaginationCount] = useState(1);
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

  const [sysStatus, setSysSattus] = useState("ui_case");

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
  const [hasPdfEntry, setHasPdfEntry] = useState(false);
  const [hoverTableOptions, setHoverTableOptions] = useState([]);
  const [otherTablePagination, setOtherTablePagination] = useState(1);

  // for actions

  const [selectedRow, setSelectedRow] = useState({});
  const [templateApproval, setTemplateApproval] = useState(false);
  const [templateApprovalData, setTemplateApprovalData] = useState({});
  const [disposalUpdate, setDisposalUpdate] = useState(false);

  // transfer to other division states

  const [showOtherTransferModal, setShowOtherTransferModal] = useState(false);
  const [showMassiveTransferModal, setShowMassiveTransferModal] = useState(false);

  const [otherTransferField, setOtherTransferField] = useState([]);
  const [selectedOtherFields, setSelectedOtherFields] = useState(null);
  const [selectKey, setSelectKey] = useState(null);
  const [mergeDialogData, setMergeDialogData] = useState([]);

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
  const [approvalItemDisabled, setApprovalItemDisabled] = useState(false);
  const [designationData, setDesignationData] = useState([]);

  const [randomApprovalId, setRandomApprovalId] = useState(0);

  const [approvalSaveData, setApprovalSaveData] = useState({});

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
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }).replace(",", "").replace(":", ".")
    }));
    

    const approvalActivityHistoryHeader = [
      { field: "sno", headerName: "S.No", width: 70 },
      { field: "approval_item_id", headerName: "Approval Item", width: 150 },
      { field: "approved_by", headerName: "Approved By", width: 150 },
      { field: "approved_date", headerName: "Approved Date", width: 150 },
      { field: "created_by", headerName: "Created By", width: 150 },
      { field: "created_at", headerName: "Created At", width: 200 }
    ];
    
    const approvalActivityHistory = activityLogs.map((log, index) => ({
      id: index,
      sno: index + 1,
      approval_item_id: log.approval_item_id,
      approved_by: log.approved_by,
      approved_date: log.approved_date,
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

            console.log("isChildMergedLoading from approval:", isChildMergedLoading);

            return (
                <Box sx={{ display: "flex", gap: 1, marginTop: '4px' }}>
                    <Button variant="outlined" onClick={handleListApprovalView}>
                        View
                    </Button>
                    {!isChildMergedLoading && (
                      <>
                    <Button variant="contained" color="primary" onClick={handleListApprovalEdit} >
                        Edit
                    </Button>
                    <Button variant="contained" color="error" onClick={handleListApprovalDelete}>
                        Delete
                    </Button>
                    </>
                    )}
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
    const [forceListApprovalTableLoad, setForceListApprovalTableLoad] = useState(false);

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

        console.log("listApprovalSaveData", listApprovalSaveData);
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
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const [totalPage, setTotalPage] = useState(0);
  const [totalRecord, setTotalRecord] = useState(0);

  // filter states
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterDropdownObj, setfilterDropdownObj] = useState([]);
  const [filterValues, setFilterValues] = useState({});
  const [fromDateValue, setFromDateValue] = useState(null);
  const [toDateValue, setToDateValue] = useState(null);
  const [forceTableLoad, setForceTableLoad] = useState(false);

  const [furtherInvestigationPtCase, setFurtherInvestigationPtCase] =
    useState(false);
  const [furtherInvestigationSelectedRow, setFurtherInvestigationSelectedRow] =
    useState([]);
  const [
    furtherInvestigationSelectedValue,
    setFurtherInvestigationSelectedValue,
  ] = useState(null);
  const [showReplacePdfButton, setShowReplacePdfButton] = useState(false);
  const [showSubmitAPButton, setShowSubmitAPButton] = useState(false);

  // for pdf download
  const [isDownloadPdf, setIsDownloadPdf] = useState(false);
  const [downloadPdfFields, setDownloadPdfFields] = useState({});
  const [downloadPdfData, setDownloadPdfData] = useState([]);
  const [isPrint, setIsPrint] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);


    const [otherTemplatesTotalPage, setOtherTemplatesTotalPage] = useState(0);
    const [otherTemplatesTotalRecord, setOtherTemplatesTotalRecord] = useState(0);
    const [otherTemplatesPaginationCount, setOtherTemplatesPaginationCount] = useState(1);
    const [otherSearchValue, setOtherSearchValue] = useState('');

    const [othersFilterModal, setOthersFilterModal] = useState(false);
    const [othersFromDate, setOthersFromDate] = useState(null);
    const [othersToDate, setOthersToDate] = useState(null);
    const [othersFiltersDropdown, setOthersFiltersDropdown] = useState([]);
    const [othersFilterData, setOthersFilterData] = useState({});
    const [selectedMergeRowData, setSelectedMergeRowData] = useState([]);
    const [showMergeModal, setShowMergeModal] = useState(false);
    const [selectedParentId, setSelectedParentId] = useState("");
    const [usersBasedOnDivision, setUsersBasedOnDivision] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [childMergedDialogOpen, setChildMergedDialogOpen] = useState(false);
    const [childMergedData, setChildMergedData] = useState([]);
    const [childMergedColumns, setChildMergedColumns] = useState([]);
    const [childMergedPagination, setChildMergedPagination] = useState(1);
    const [childMergedTotalPages, setChildMergedTotalPages] = useState(0);
    const [childMergedTotalRecords, setChildMergedTotalRecords] = useState(0);
    const [childMergedCaseTitle, setChildMergedCaseTitle] = useState("");
    const [childMergedCaseCID, setChildMergedCaseCID] = useState("");
    const [isChildMergedLoading, setIsChildMergedLoading] = useState(false);
    const [hasApproval, setHasApproval] = useState(false);

    const handleOtherPagination = (page) => {
        setOtherTemplatesPaginationCount(page)
    }
    const handleChildMergePagination = (page) => {
      setChildMergedPagination(page);
    };
    
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

    
    // nature of disposal state
    const [natureOfDisposalModal, setNatureOfDisposalModal] = useState(false);
    const [natureOfDisposalValue, setNatureOfDisposalValue] = useState(null);
    const [overallDisposalData, setOverallDisposalData] = useState({});
    const [approvedByCourt, setApprovedByCourt] = useState(false);
    const [showOrderCopy, setShowOrderCopy] = useState(false);

    // more then one template state
    const [moreThenTemplate, setMoreThenTemplate] = useState(false);
    const [moreThenTemplateTableName, setMoreThenTemplateTableName] = useState(null);
    const [moreThenTemplateTemplateName, setMoreThenTemplateTemplateName] = useState(null);
    const [moreThenTemplateTemplateFields, setMoreThenTemplateTemplateFields] = useState(null);
    const [moreThenTemplateStepperData, setMoreThenTemplateStepperData] = useState([]);
    const [moreThenTemplateInitialData, setMoreThenTemplateInitialData] = useState([]);
    const [viewModeOnly,setViewModeOnly] = useState(false);
    const [isApprovalSaveMode, setIsApprovalSaveMode] = useState(true);
    const [isFromEdit, setIsFromEdit] = useState(false);
    const [selectedApprovalEdit,setSelectedApprovalEdit] = useState(null);

    const [natureOfDisposalFileUpload, setNatureOfDisposalFileUpload] = useState({});

    const handleFileUploadChange = (fieldName, files) => {
        setNatureOfDisposalFileUpload((prevData) => {
            return {
                ...prevData,
                [fieldName]: files,
            };
        });
    };

    const [aoFields, setAoFields] = useState([]);
    const [aoFieldId,setAoFieldId] = useState([]);
    const [filterAoValues, setFilterAoValues] = useState({});
    
    const showNatureOfDisposal = (selectedRow) => {
        setSelectedRowData(selectedRow);
        setNatureOfDisposalValue(null);
        setNatureOfDisposalModal(true);
    };

    const showOrderCopyCourt =  (selectedRow, tableName, approved)=> {
        setSelectedRowData(selectedRow);
        setApprovedByCourt(approved);
        setShowOrderCopy(true);
        showNewApprovalPage("B Report");
    }

    const handleNatureOfDisposalSubmit = () => {
        if (natureOfDisposalValue) {
            
            if(natureOfDisposalValue?.code){
                switch (natureOfDisposalValue?.code) {
                    case "disposal":
                        showMorethenOneTemplate("cid_ui_case_charge_sheet");
                        break;
                    case "178_cases":
                        showPtCaseTemplate();
                        break;
                    case "b_Report":
                        natureOfDisposalSysStatus("b_Report");
                        break;
                    case "c_Report":
                        natureOfDisposalSysStatus("disposal")
                        break;
                    default:
                        setNatureOfDisposalModal(false);
                        setNatureOfDisposalValue(null);
                        break;
                }
            }else{
                setNatureOfDisposalModal(false);
                setNatureOfDisposalValue(null);
            }

        }else{
            setNatureOfDisposalModal(false);
            setNatureOfDisposalValue(null);
        }
    };

    const showMorethenOneTemplate = async (table)=>{
        const viewTableData = {
            table_name: table,
        };
        
        setLoading(true);
    
        try {
            const viewTemplateResponse = await api.post("/templates/viewTemplate",viewTableData);
        
            setLoading(false);
            if (viewTemplateResponse && viewTemplateResponse.success) {
                
                setMoreThenTemplate(true);
                setMoreThenTemplateInitialData(overallDisposalData?.['charge_sheet'] || {});
        
                setMoreThenTemplateTemplateFields(viewTemplateResponse.data["fields"]? viewTemplateResponse.data["fields"]: []);
                
                if (viewTemplateResponse.data.no_of_sections && viewTemplateResponse.data.no_of_sections > 0) {
                    setMoreThenTemplateStepperData(viewTemplateResponse.data.sections? viewTemplateResponse.data.sections: []);
                }
        
                setMoreThenTemplateTableName(table);
                setMoreThenTemplateTemplateName(viewTemplateResponse?.data?.template_name);

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

    const moreThenTemplateSaveFunc = (data)=> {
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

        if(natureOfDisposalModal){
        
            setOverallDisposalData({
                ...overallDisposalData,
                "charge_sheet": data,
            });
        
            showPtCaseTemplate();
            return
        }
    }

    const moreThenTemplateErrorFunc = (data)=> {
        console.log(data,"data data");
    }

    const moreThenTemplateCloseFunc = (data)=> {
        setMoreThenTemplate(false);
    }

    const natureOfDisposalFinalReport = async (data)=>{

        const formData = new FormData();
        var normalData = {};

        optionFormTemplateData.forEach((field) => {

            if (data[field.name]) {
                if (field.type === "file" || field.type === "profilepicture") {

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
                    normalData[field.name] = field.type === 'checkbox' || field.type === 'multidropdown' ? Array.isArray(data[field.name]) ? data[field.name].join(',') : data[field.name] : data[field.name];
                }
            }
        });
        
        normalData['ui_case_id'] = selectedRowData.id;

        formData.append("table_name", ptCaseTableName);
        formData.append("data", JSON.stringify(normalData));

        if(moreThenTemplate && overallDisposalData?.['charge_sheet']){

            var secondNormalData = {};
    
            moreThenTemplateTemplateFields.forEach((field) => {
    
                if (overallDisposalData['charge_sheet'][field.name]) {
                    if (field.type === "file" || field.type === "profilepicture") {
    
                        if (field.type === 'file') {
                            if (Array.isArray(overallDisposalData['charge_sheet'][field.name])) {
                                const hasFileInstance = overallDisposalData['charge_sheet'][field.name].some(file => file.filename instanceof File);
                                var filteredArray = overallDisposalData['charge_sheet'][field.name].filter(file => file.filename instanceof File);
                                if (hasFileInstance) {
                                    overallDisposalData['charge_sheet'][field.name].forEach((file) => {
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
    
                                    formData.append('second_folder_attachment_ids', JSON.stringify(filteredArray));
    
                                }
                            }
                        } else {
                            formData.append(field.name, overallDisposalData['charge_sheet'][field.name]);
                        }
                    } else {
                        secondNormalData[field.name] = field.type === 'checkbox' || field.type === 'multidropdown' ? Array.isArray(overallDisposalData['charge_sheet'][field.name]) ? overallDisposalData['charge_sheet'][field.name].join(',') : overallDisposalData['charge_sheet'][field.name] : overallDisposalData['charge_sheet'][field.name];
                    }
                }
            });

            secondNormalData['ui_case_id'] = selectedRowData.id;
    
            formData.append("second_table_name", moreThenTemplateTableName);
            formData.append("second_data", JSON.stringify(secondNormalData));

        }

        var othersUpdateData = {
            id : selectedRowData.id,
            sys_status : natureOfDisposalValue.code,
            default_status : "ui_case"
        }

        if(natureOfDisposalValue?.code === "disposal" || natureOfDisposalValue?.code === "178_cases"){
            if (Array.isArray(natureOfDisposalFileUpload?.['field_19_prosecution_sanction_done'])) {
                const hasFileInstance = natureOfDisposalFileUpload?.['field_19_prosecution_sanction_done'].some(file => file.filename instanceof File);
                var filteredArray = natureOfDisposalFileUpload?.['field_19_prosecution_sanction_done'].filter(file => file.filename instanceof File);
                if (hasFileInstance) {
                    natureOfDisposalFileUpload?.['field_19_prosecution_sanction_done'].forEach((file) => {
                        if (file.filename instanceof File) {
                            formData.append('field_19_prosecution_sanction_done', file.filename);
                        }
                    });

                    filteredArray = filteredArray.map((obj) => {
                        return {
                            ...obj,
                            filename: obj.filename['name']
                        }
                    });

                    formData.append('others_folder_attachment_ids', JSON.stringify(filteredArray));
                }
            }
        }

        var othersData = { 
            "sys_status" : othersUpdateData,
            "others_table_name" : table_name
        }

        if(singleApiData?.['approval']){
            var approvalItems = {
                id : selectedRowData.id,
                module_name : 'Under Investigation',
                action : 'Disposal Change'
            }

            othersData = {
                            ...othersData, 
                            ...singleApiData,
                            approval_details : approvalItems,
                        }
        }


        formData.append("others_data", JSON.stringify(othersData));
        var transitionId = `ui_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
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

                setNatureOfDisposalModal(false);
                setSingleApiData({});
                setNewApprovalPage(false);
                setMoreThenTemplate(false);
                setOtherFormOpen(false);
                setNatureOfDisposalValue(null);
                setNatureOfDisposalFileUpload({});

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
    
    const natureOfDisposalSysStatus = async (sys_status)=>{

        var othersUpdateData = {
            id : selectedRowData.id,
            sys_status : sys_status,
            default_status : "ui_case"
        }
        
        var othersData = { 
            "sys_status" : othersUpdateData,
            "others_table_name" : table_name
        }

        if(singleApiData?.['approval']){
            var approvalItems = {
                id : selectedRowData.id,
                module_name : 'Under Investigation',
                action : 'B Report Change'
            }

            othersData = {
                            ...othersData, 
                            ...singleApiData,
                            approval_details : approvalItems,
                        }
        }

        const formData = new FormData();
        formData.append("others_data", JSON.stringify(othersData));
        var transitionId = `ui_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
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

                setNatureOfDisposalModal(false);
                setSingleApiData({});
                setNewApprovalPage(false);
                setMoreThenTemplate(false);
                setOtherFormOpen(false);
                setNatureOfDisposalValue(null);

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

    // order copy from action

    const natureOfDisposalOrderCopy = async (data)=>{

        const formData = new FormData();
        var normalData = {};

        optionFormTemplateData.forEach((field) => {

            if (data[field.name]) {
                if (field.type === "file" || field.type === "profilepicture") {

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
                    normalData[field.name] = field.type === 'checkbox' || field.type === 'multidropdown' ? Array.isArray(data[field.name]) ? data[field.name].join(',') : data[field.name] : data[field.name];
                }
            }
        });

        var othersUpdateData = {
            id : selectedRowData.id,
            sys_status : approvedByCourt ? 'disposal' : 'ui_case',
            default_status : "ui_case"
        }
        
        var othersData = { 
            "sys_status" : othersUpdateData,
            "others_table_name" : table_name
        }

        if(singleApiData?.['approval']){
            var approvalItems = {
                id : selectedRowData.id,
                module_name : 'Under Investigation',
                action : 'Disposal Change'
            }

            othersData = {
                            ...othersData, 
                            ...singleApiData,
                            approval_details : approvalItems,
                        }
        }

        normalData['ui_case_id'] = selectedRowData.id;
        
        formData.append("table_name", ptCaseTableName);
        formData.append("data", JSON.stringify(normalData));

        formData.append("others_data", JSON.stringify(othersData));
        var transitionId = `ui_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
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

                setNatureOfDisposalModal(false);
                setSingleApiData({});
                setNewApprovalPage(false);
                setShowOrderCopy(false);
                setMoreThenTemplate(false);
                setOtherFormOpen(false);
                setNatureOfDisposalValue(null);

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

  const toggleSelectRow = (id) => {
    setSelectedIds((prevSelectedIds) => {
      const updated = prevSelectedIds.includes(id)
        ? prevSelectedIds.filter((selectedId) => selectedId !== id)
        : [...prevSelectedIds, id];

      return updated;
    });
  };

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
      const viewTemplateData = await api.post(
        "/templateData/viewMagazineTemplateData",
        viewTemplatePayload
      );
      setLoading(false);

      if (viewTemplateData && viewTemplateData.success) {
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
            setDownloadPdfData(
              viewTemplateData.data ? viewTemplateData.data : {}
            );
            setDownloadPdfFields(
              viewTemplateResponse.data["fields"]
                ? viewTemplateResponse.data["fields"]
                : []
            );
            setIsDownloadPdf(true);
            setLoading(true);
            setIsPrint(isPrint);
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

  // change sys_status

    const changeSysStatus = async (data, value, text)=>{

        if((data.pt_case_id !== null && data.pt_case_id !== undefined) || value === 'Reinvestigation'){

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
                            "pt_case_id": data.pt_case_id,
                            "default_status": "ui_case"
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
                                onOpen: () => {
                                  if (sysStatus === "merge_cases") {
                                    loadMergedCasesData(paginationCount);
                                  } else {
                                    loadTableData(paginationCount);
                                  }
                                },
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
                    setSelectedRowData(selectedRow);
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
            "template_module": "pt_case"
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
                                    "default_status": "ui_case"
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

        var pt_case = data;
        setSingleApiData((prev) => ({
            ...prev,
            pt_case: pt_case,
        }));

        saveOverallData(false, pt_case);

        return;
    }

    const showNewApprovalPage = async (approvalItem)=>{

        setLoading(true);
        // var payload = {
        //     page:listApprovalPaginationCount,
        //     limit: 10,
        //     search: searchValue || "",
        // }


        try {

            const getActionsDetails = await api.post("/ui_approval/get_ui_case_approvals" );

            setLoading(false);

            if (getActionsDetails && getActionsDetails.success) {

                setApprovalItem(getActionsDetails.data['approval_item']);
                setDesignationData(getActionsDetails.data['designation']);

                var approvalItemName = "further investigation"

                if(natureOfDisposalModal || showOrderCopy){
                    approvalItemName = "Change of Disposal Type"
                }

                if(approvalItem){
                    approvalItemName = approvalItem
                }

                var getFurtherInvestigationItems = getActionsDetails.data['approval_item'].filter((data)=>{
                    if((data.name).toLowerCase() === approvalItemName.toLowerCase()){
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

        if(natureOfDisposalModal){
            handleNatureOfDisposalSubmit();
            return
        }

        if(showOrderCopy){
            showActionsOptionsTemplate("cid_ui_case_court_order_copy");
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
        normalData['ui_case_id'] = furtherInvestigationSelectedRow.id;

        var othersData = Object.fromEntries(
            Object.entries(singleApiData).filter(([key]) => key !== 'pt_case')
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
        var transitionId = `ui_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
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
                    onOpen: () => {
                      if (sysStatus === "merge_cases") {
                        loadMergedCasesData(paginationCount);
                      } else {
                        loadTableData(paginationCount);
                      }
                    },
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
      const viewTemplateData = await api.post(
        "/templateData/viewTemplateData",
        viewTemplatePayload
      );
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
          const viewTemplateResponse = await api.post(
            "/templates/viewTemplate",
            viewTableData
          );
          setLoading(false);

          if (viewTemplateResponse && viewTemplateResponse.success) {
            if (viewTemplateResponse["data"].is_link_to_leader === true) {
              setLinkLeader(true);
            } else if (
              viewTemplateResponse["data"].is_link_to_organization === true
            ) {
              setLinkOrganization(true);
            }

            setFormOpen(true);
            setSelectedRowId(rowData.id);
            setSelectedTemplateId(viewTemplateResponse["data"].template_id);
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
  
  const handleCheckboxChangeField = (event, row) => {
    const isSelected = event.target.checked;
  
    setTableData((prevData) =>
      prevData.map((data) =>
        data.id === row.id ? { ...data, isSelected } : data
      )
    );
  
    if (isSelected) {
      setSelectedRowIds((prevIds) => [...prevIds, row.id]);
      setSelectedMergeRowData((prev) => [...prev, row]);
    } else {
      setSelectedRowIds((prevIds) => prevIds.filter((id) => id !== row.id));
      setSelectedMergeRowData((prev) => prev.filter((r) => r.id !== row.id));
    }
  };
 
  const handleConfirmMerge = async () => {
    if (!selectedParentId || selectedParentId.length === 0) {
      Swal.fire({
        title: 'Error',
        text: "Select a parent case before merging!",
        icon: 'warning',
        confirmButtonText: 'OK',
      });
      return;
    }
  
    setLoading(true);
    setShowMergeModal(false);
  
    try {
      const allCaseIdsToMerge = selectedMergeRowData
        .filter(row => row?.id !== undefined)
        .map(row => row.id);
  
      const payloadSysStatus = {
        table_name: table_name,
        data: {
          id: allCaseIdsToMerge,
          sys_status: "merge_cases",
          default_status: "ui_case",
        },
      };
  
      const sysStatusResponse = await api.post("/templateData/caseSysStatusUpdation", payloadSysStatus);
  
      if (!sysStatusResponse?.success) {
        throw new Error(sysStatusResponse.message || "Failed to update case status.");
      }
  
      const mergeDataPayload = allCaseIdsToMerge.map(caseId => ({
        case_id: caseId,
        parent_case_id: selectedParentId.id,
        merged_status: caseId === selectedParentId.id ? "parent" : "child",
      }));
  
      const mergeResponse = await api.post("/templateData/insertMergeData", {
        table_name: "ui_merged_cases",
        data: mergeDataPayload,
      });
  
      if (!mergeResponse?.success) {
        throw new Error(mergeResponse.message || "Failed to insert merge data.");
      }
    
      toast.success("Merged Successfully",
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
      setSelectedRowIds([]);
      setSelectedMergeRowData([]);
      setSelectedParentId(null);
  
      await loadTableData();
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong during merge"|| err,
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
    } finally {
      setLoading(false);
    }
  };
  
  
  const handleConfirmDemerge = async () => {
    if (!selectedRowIds || selectedRowIds.length === 0) {
      Swal.fire({
        title: 'Error',
        text: "Select at least one case to demerge!",
        icon: 'warning',
        confirmButtonText: 'OK',
      });
      return;
    }
  
    const confirmation = await Swal.fire({
      title: 'Are you sure?',
      text: "Are you sure you want to demerge the selected cases?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Demerge',
      cancelButtonText: 'Cancel',
    });
  
    if (!confirmation.isConfirmed) return;
    setChildMergedDialogOpen(false);

    setLoading(true);
    const randomDateId = `txn_${new Date().toISOString().replace(/[-:.TZ]/g, '')}_${Math.random().toString(36).substring(2, 8)}`;
  
    try {
      const demergePayload = {
        template_module: 'ui_case',
        transaction_id: randomDateId,
        case_id: selectedRowIds.length
          ? selectedRowIds.map(String)
          : [String(selectedMergeRowData.id)],
      };
      
  
      const demergeResponse = await api.post("/templateData/deMergeCaseData", demergePayload);
  
      if (!demergeResponse?.success) {
        throw new Error(demergeResponse.message || "Failed to demerge selected cases.");
      }
  
      toast.success("Demerged Successfully",
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
  
      setSelectedRowIds([]);
      setSelectedRowData([]);
      setSelectedMergeRowData([]);
      await loadMergedCasesData("1");
      setChildMergedDialogOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong during merge"|| err,
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
    } finally {
      setLoading(false);
    }
  };
  
  
  
    useEffect(() => {
        const anySelected = tableData.some((data) => data.isSelected);
        setIsCheckboxSelected(anySelected);
    }, [tableData]);

    useEffect(() => {
      if (sysStatus === "merge_cases") {
          loadMergedCasesData(paginationCount);
      } else {
          loadTableData(paginationCount);
      }
  }, [
      paginationCount,
      tableSortKey,
      tableSortOption,
      starFlag,
      readFlag,
      sysStatus,
      forceTableLoad,
  ]);

const handleCheckboxDemerge = (event, row) => {
  const isSelected = event.target.checked;

  setTableData((prevData) =>
    prevData.map((data) =>
      data.id === row.id ? { ...data, isSelected } : data
    )
  );

  setSelectedRowIds((prevIds) => {
    if (isSelected) {
      return [...prevIds, row.id];
    } else {
      return prevIds.filter((id) => id !== row.id);
    }
  });

  setSelectedMergeRowData((prevData) => {
    if (isSelected) {
      return [...prevData, row];
    } else {
      return prevData.filter((r) => r.id !== row.id);
    }
  });
};

const loadChildMergedCasesData = async (page, caseId) => {
  setIsChildMergedLoading(true); 
  setLoading(true);

  const payload = {
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
    case_id: String(caseId),
  };

  try {
    const response = await api.post("/templateData/getMergeChildData", payload);

    if (response?.success) {
      const { data, meta } = response.data;

      const processedData = data.map((row) => ({
        ...row,
        isSelected: false,
      }));

      setTableData(processedData);

      const excludedKeys = [
        "created_at", "updated_at", "deleted_at", "attachments", "task_unread_count", "id", "field_cid_crime_no./enquiry_no"
      ];

      const generateReadableHeader = (key) =>
        key
          .replace(/^field_/, "")
          .replace(/_/g, " ")
          .toLowerCase()
          .replace(/^\w|\s\w/g, (c) => c.toUpperCase());

      const renderCellFunc = (key, count) => (params) =>
        tableCellRender(key, params, params.value, count, meta.table_name);

    //   {
    //     field: "task_child",
    //     headerName: "",
    //     width: 50,
    //     resizable: true,
    //     renderHeader: (params) => (
    //         <Tooltip title="Add Task" sx={{ color: "", fill: "#1f1dac" }}><AssignmentIcon /></Tooltip>
    //     ),
    //     renderCell: (params) => (
    //         <Badge
    //             badgeContent={params?.row?.['task_unread_count']}
    //             color="primary"
    //             sx={{ '& .MuiBadge-badge': { minWidth: 17, maxWidth: 20, height: 17, borderRadius: '50%', fontSize: '10px',backgroundColor:'#f23067 !important' } }}
    //         >
    //             <Tooltip title="Add Task"><AddTaskIcon onClick={()=>handleTaskShow(params?.row)} sx={{margin: 'auto', cursor: 'pointer',color:'rgb(242 186 5); !important'}} /></Tooltip>
    //         </Badge>
    //     ),
    // },

      const updatedHeader = [
        {
          field: "select_child",
          headerName: (
            <Tooltip title="Select All">
              <SelectAllIcon sx={{ fill: "#1f1dac" }} />
            </Tooltip>
          ),
          width: 50,
          resizable: false,
          renderCell: (params) => (
            <Box display="flex" justifyContent="center" alignItems="center" width="100%">
              <Checkbox
                onChange={(event) => {
                  handleCheckboxDemerge(event, params.row);
                }}
              />
            </Box>
          ),
        }
        ,
      {
          field: "approval_child",
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
                  <Tooltip title="Approval"><VerifiedUserIcon color="success" onClick={() => {
                    setIsChildMergedLoading(true);
                    handleActionShow(params?.row, true);
                  }}
                  sx={{fontSize:'26px'}} /></Tooltip>
              </Button>
          )
      },
      {
          field: "field_cid_crime_no./enquiry_no",
          headerName: "Cid Crime No./Enquiry No",
          width: 200,
          resizable: true,
          cellClassName: 'justify-content-start',
          renderHeader: (params) => (
              tableHeaderRender(params, "field_cid_crime_no./enquiry_no")
          ),
          renderCell: renderCellFunc("field_cid_crime_no./enquiry_no", 0),
      },
        ...Object.keys(data[0])
          .filter((key) => !excludedKeys.includes(key))
          .map((key) => ({
            field: key,
            headerName: generateReadableHeader(key),
            width: generateReadableHeader(key).length < 15 ? 120 : 180,
            resizable: true,
            renderHeader: (params) => tableHeaderRender(params, key),
            renderCell: renderCellFunc(key),
          })),
      ];

      setChildMergedData(data || []);
      setChildMergedColumns(updatedHeader);
      setChildMergedPagination(page);
      setChildMergedTotalPages(meta?.totalPages || 0);
      setChildMergedTotalRecords(meta?.totalItems || 0);
      setChildMergedDialogOpen(true);
      setChildMergedCaseCID(data?.[0]?.["field_cid_crime_no./enquiry_no"] || "");
      setChildMergedCaseTitle(selectedOtherTemplate?.name || "");
    } else {
      toast.error(response?.message || "Failed to load child merged cases.");
    }
  } catch (error) {
    toast.error(error?.message || "Something went wrong.");
  }
  finally {
    setLoading(false);
  }
};

 
  
  const loadMergedCasesData = async (page) => {
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
        const getTemplateResponse = await api.post( "/templateData/getMergeParentData", getTemplatePayload);

        setLoading(false);

        if (getTemplateResponse?.success && getTemplateResponse?.message !== "No merged case found") {
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
                    "ui_case_id", "pt_case_id", "sys_status", "task_unread_count" , "field_cid_crime_no./enquiry_no"
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
                //     renderCell: (params) => (
                //         <Badge
                //             badgeContent={params?.row?.['task_unread_count']}
                //             color="primary"
                //             sx={{ '& .MuiBadge-badge': { minWidth: 17, maxWidth: 20, height: 17, borderRadius: '50%', fontSize: '10px',backgroundColor:'#f23067 !important' } }}
                //         >
                //             <Tooltip title="Add Task"><AddTaskIcon onClick={()=>handleTaskShow(params?.row)} sx={{margin: 'auto', cursor: 'pointer',color:'rgb(242 186 5); !important'}} /></Tooltip>
                //         </Badge>
                //     ),
                // },

                const updatedHeader = [
                    
                    {
                        field: "select",
                        headerName: <Tooltip title="Select All"><SelectAllIcon sx={{ color: "", fill: "#1f1dac" }} /></Tooltip>,
                        width: 50,
                        resizable: false,
                        renderCell: (params) => (
                            <Box display="flex" justifyContent="center" alignItems="center" width="100%">
                                <Checkbox
                                    checked={params.row.isSelected || false}
                                    onChange={(event) => handleCheckboxChangeField(event, params.row)}
                                />
                            </Box>
                        ),
                    },
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
                        field: "field_cid_crime_no./enquiry_no",
                        headerName: "Cid Crime No./Enquiry No",
                        width: 200,
                        resizable: true,
                        cellClassName: 'justify-content-start',
                        renderHeader: (params) => (
                            tableHeaderRender(params, "field_cid_crime_no./enquiry_no")
                        ),
                        renderCell: renderCellFunc("field_cid_crime_no./enquiry_no", 0),
                    },
                    ...(sysStatus === "merge_cases"
                      ? [
                          {
                            field: "child_case",
                            headerName: "Child Case",
                            width: 100,
                            resizable: true,
                            renderCell: (params) => {
                              const childCount = params.row.childCount || 0;
                              const caseId = params.row.id;

                              const handleClick = async () => {
                                loadChildMergedCasesData("1", caseId);
                              };
                              
                              const statusColor = "#3b82f6";
                              const borderColor = "#2563eb";
                  
                              return (
                                <Chip
                                  label={childCount}
                                  size="small"
                                  onClick={handleClick} 
                                  sx={{
                                    fontFamily: "Roboto",
                                    fontWeight: 500,
                                    color: "white",
                                    borderColor: borderColor,
                                    borderRadius: "4px",
                                    backgroundColor: statusColor,
                                    borderStyle: "solid",
                                    borderWidth: "1px",
                                  }}
                                />
                              );
                            },
                          },
                        ]
                      : []),
                    ...Object.keys(data[0])
                        .filter((key) => !excludedKeys.includes(key))
                        .map((key) => ({
                            field: key,
                            headerName: generateReadableHeader(key),
                            width: generateReadableHeader(key).length < 15 ? 100 : 180,
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

                    for (const [key, val] of Object.entries(field)) {
                        if (val && typeof val === "string" && (val.includes("-") || val.includes("/"))) {
                            updatedField[key] = formatDate(val);
                        } else {
                            updatedField[key] = val;
                        }
                    }

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
            setSelectedRow(null);
            setSelectedParentId([]);

            await getActions();
        }else if (getTemplateResponse?.success && getTemplateResponse?.message === "No merged case found") {
          setTableData([]);
      }  else {
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
                        "ui_case_id", "pt_case_id", "sys_status", "task_unread_count" , "field_cid_crime_no./enquiry_no"
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
                            field: "select",
                            headerName: <Tooltip title="Select All"><SelectAllIcon sx={{ color: "", fill: "#1f1dac" }} /></Tooltip>,
                            width: 50,
                            resizable: false,
                            renderCell: (params) => {
                                const isDisabled = !params?.row?.["field_io_name"];
                                return (
                                <Box display="flex" justifyContent="center" alignItems="center" width="100%">
                                    <Checkbox
                                        checked={params.row.isSelected || false}
                                        onChange={(event) => handleCheckboxChangeField(event, params.row)}
                                        disabled={isDisabled}
                                    />
                                </Box>
                            )},
                        },
                        {
                            field: "approval",
                            headerName: "Approval",
                            width: 50,
                            resizable: true,
                            cellClassName: 'justify-content-start',
                            renderHeader: (params) => (
                                <Tooltip title="Approval"><VerifiedIcon sx={{ color: "", fill: "#1f1dac" }} /></Tooltip>
                            ),                            
                            renderCell: (params) => {
                              const isDisabled = !params?.row?.["field_io_name"];
                              return(
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
                                    <Tooltip title="Approval"><VerifiedUserIcon color="success" onClick={isDisabled ? undefined : ()=>handleActionShow(params?.row)}  sx={{fontSize:'26px'}} /></Tooltip>
                                </Button>
                            )}
                        },
                        {
                            field: "field_cid_crime_no./enquiry_no",
                            headerName: "Cid Crime No./Enquiry No",
                            width: 200,
                            resizable: true,
                            cellClassName: 'justify-content-start',
                            renderHeader: (params) => (
                                tableHeaderRender(params, "field_cid_crime_no./enquiry_no")
                            ),
                            renderCell: renderCellFunc("field_cid_crime_no./enquiry_no", 0),
                        },
                        ...Object.keys(data[0])
                            .filter((key) => !excludedKeys.includes(key))
                            .map((key) => ({
                                field: key,
                                headerName: generateReadableHeader(key),
                                width: generateReadableHeader(key).length < 15 ? 100 : 180,
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
                }else{
                    setTableData([]);
                }

                setviewReadonly(false);
                setEditTemplateData(false);
                setInitialData({});
                setFormOpen(false);
                setSelectedRow(null);
                setSelectedParentId([]);
    
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
  

    const getActions = async () => {
        const payloadObj = {
            module: "ui_case",
            tab: sysStatus,
        };
    
        setLoading(true);
    
        try {
            const getActionsDetails = await api.post("/action/get_actions", payloadObj);
    
            setLoading(false);

            if (getActionsDetails?.success && getActionsDetails.data?.data) {
                const userPermissionsArray = JSON.parse(localStorage.getItem("user_permissions")) || [];
                const userPermissions = userPermissionsArray[0] || {};
    
                const updatedActions = getActionsDetails.data.data
                    .map((action) => {
                        if (action?.icon) action.icon = createSvgIcon(action.icon);
    
                        if (action.permissions) {
                            const parsedPermissions = JSON.parse(action.permissions);
                            const hasValidPermission = parsedPermissions.some(
                                (permission) => userPermissions[permission] === true
                            );
                            return hasValidPermission ? action : null;
                        }
    
                        return action;
                    })
                    .filter(Boolean);
    
                setHoverTableOptions(updatedActions);
            } else {
                setLoading(false);
                toast.error(getActionsDetails.message || "Failed to fetch actions.", {
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

    if (tableName && index !== null && index === 0 ) {
        highlightColor = { color: '#0167F8', textDecoration: 'underline', cursor: 'pointer' };

        onClickHandler = (event) => {event.stopPropagation();handleTemplateDataView(params.row, false, tableName)};
    }


    return (
        <Tooltip title={value} placement="top">
            <span
                style={highlightColor}
                onClick={onClickHandler}
                className={`tableValueTextView Roboto ${ params?.row && !params.row["ReadStatus"] ? "" : ""}`}
            >
                {value || "-"}
            </span>
        </Tooltip>
    );
  };
  

    const tableHeaderRender = (params, key)=>{
        return (
            <Tooltip title={params.colDef.headerName} arrow placement="top">
                <Typography
                    className="MuiDataGrid-columnHeaderTitle"
                    noWrap
                    sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        width: '100%',
                        color: "#1D2939", 
                        fontSize: "15px", 
                        fontWeight: "500"
                    }}
                >
                    {params.colDef.headerName}
                </Typography>
            </Tooltip>
        )
    }

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
                onOpen: () => {
                  if (sysStatus === "merge_cases") {
                    loadMergedCasesData(paginationCount);
                  } else {
                    loadTableData(paginationCount);
                  }
                },
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
  const loadValueField = async (rowData, editData, table_name) => {
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
        const formValues = viewTemplateData.data ? viewTemplateData.data : {};

        setInitialData(formValues);
        setFilterAoValues(formValues); 
        setviewReadonly(!editData);
        setEditTemplateData(editData);

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

            console.log("viewtemplaterespose", viewTemplateResponse)
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
  const loadAOFields = async () => {
    setLoading(true);
    try {
      const response = await api.post("/templates/viewTemplate", {
        table_name: "cid_under_investigation",
      });
      if (response.success && response.data?.fields) {
        let aoOnlyFields = response.data.fields.filter(field =>
          field.ao_field === true &&
          field.hide_from_ux === false &&
          field.name !== 'field_act' &&
          field.name !== 'field_section'
        );
                
        const briefFactField = response.data.fields.find(field => field.name === 'field_breif_fact');
        const policeStationField = response.data.fields.find(field => field.name === 'field_investigation_carried_out_by_the_police_station');
        
        if (briefFactField && !aoOnlyFields.includes(briefFactField)) {
            aoOnlyFields.push(briefFactField);
        }
        
        if (policeStationField && !aoOnlyFields.includes(policeStationField)) {
            aoOnlyFields.push(policeStationField);
        }
        
        setAoFields(aoOnlyFields);
        
        loadValueField(aoFieldId, false, "cid_under_investigation");
        setLoading(false);
    }
    
    } catch (error) {
      toast.error("Failed to load AO fields", {
        position: "top-right",
        autoClose: 3000,
        className: "toast-error",
      });
    }
  };
  useEffect(() => {
    if (selectedOtherTemplate?.table === "cid_ui_case_action_plan" || selectedOtherTemplate?.table === 'cid_ui_case_progress_report' ) {
      loadAOFields();
    }
  }, [selectedOtherTemplate]);
  
  const onActionPlanUpdate = async (table_name, data) => {
    
    if (!table_name || table_name === "") {
      toast.warning("Please Check The Template");
      return;
    }
  
    if (!data || Object.keys(data).length === 0) {
      toast.warning("Data Is Empty Please Check Once");
      return;
    }
  
    const formData = new FormData();
    formData.append("table_name", table_name);
  
    let normalData = {};
  
    const allowedFields = [
      "field_breif_fact",
      "field_investigation_carried_out_by_the_police_station"
    ];
  
    allowedFields.forEach((key) => {
      const value = data[key];
      if (value !== undefined && value !== null && value !== "") {
        normalData[key] = value;
      }
    });
    
    formData.append("id", data.id);
    formData.append("data", JSON.stringify(normalData));
  
    try {
      setLoading(true);
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
            if (sysStatus === "merge_cases") {
              loadMergedCasesData(paginationCount);
            } else {
              handleOtherTemplateActions("cid_ui_case_action_plan");
            }
          },
        });
      } else {
        toast.error(saveTemplateData.message || "Failed to update the data.");
      }
    } catch (error) {
      setLoading(false);
      toast.error(
        error?.response?.data?.message || "Update failed. Please try again."
      );
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
        console.log("viewtemplaterespose", viewTemplateResponse)
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

  const getIoUsers = async () => {
    const res = await api.post("cidMaster/getIoUsers");
    return res?.data || [];
  };
  
  const showOptionTemplate = async (tableName, approved) => {

    if(selectedOtherTemplate.is_approval && !approved ){
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
    setOtherReadOnlyTemplateData(false);
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


  const handleUpdatePdfClick = async ({
    selectedOtherTemplate,
    selectedRowData,
    selectedIds,
    prUpdatePdf,
  }) => {
    const getTemplatePayload = {
      table_name: selectedOtherTemplate?.table,
      ui_case_id: selectedRowData?.id,
    };
  
    setLoading(true);
    try {
      const getTemplateResponse = await api.post(
        "/templateData/getTemplateData",
        getTemplatePayload
      );
      setLoading(false);
  
      if (getTemplateResponse && getTemplateResponse.success) {
        const dataToAppend = getTemplateResponse.data.filter(
          (item) => item.field_pr_status === "No"
        );
  
        if (!selectedIds || selectedIds.length === 0) {
          toast.error("Please choose a record to append.", {
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
  
        const filteredDataToAppend = dataToAppend.filter(
          (item) =>
            selectedIds.includes(item.id) && item.field_pr_status === "No"
        );
  
        if (filteredDataToAppend.length > 0) {
          const appendText = JSON.stringify(filteredDataToAppend);
          await prUpdatePdf({ appendText });
        } else {
          toast.error("Already this records are Updated to PDF", {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            className: "toast-warning",
          });
        }
      } else {
        toast.error("Failed to fetch template data. Please try again.", {
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
      toast.error("Error fetching template data. Please try again.", {
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
  
  const prUpdatePdf = async (data) => {
    try {
      setLoading(true);

      const parsedAppendText = JSON.parse(data.appendText);

      const payload = {
        selected_row_id: selectedIds,
        ui_case_id: selectedRow.id,
        appendText: JSON.stringify(parsedAppendText),
      };

      const saveTemplateData = await api.post(
        "/templateData/appendToLastLineOfPDF",
        payload
      );

      setLoading(false);

      if (saveTemplateData && saveTemplateData.success) {
        toast.success(
          saveTemplateData.message || "Data appended successfully.",
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
        setOtherTemplateModalOpen(false);
        setSelectedIds([]);
      } else {
        const errorMessage =
          saveTemplateData.message ||
          "Failed to append data. Please try again.";
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
      if (error?.response?.data) {
        toast.error(error.response.data.message || "Please try again!", {
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


  const handleSubmitAp = async ({ id }) => {

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
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "Do you want to submit this Action Item? Once submitted, you won't be able to Update the record. It will be move to the Progress Report.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, submit it!',
      cancelButtonText: 'Cancel',
    });
  
    if (result.isConfirmed) {
      const payload = {
        transaction_id: `submitap_${Math.floor(Math.random() * 1000000)}`,
        ui_case_id: id,
      };
  
      try {
        setLoading(true);
        const response = await api.post('/templateData/submitActionPlanPR', payload);
  
        if (response.success) {
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
              if (sysStatus === "merge_cases") {
                loadMergedCasesData(paginationCount);
              } else {
                if(!selectedOtherTemplate?.field){
                    handleOtherTemplateActions(selectedOtherTemplate, selectedRow)
                }else{
                    loadTableData(paginationCount);
                }
              }
            },
        });
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
      }finally{
        setLoading(false);
      }
    }
  };

  const otherAPPRTemplateSaveFunc = async (data) => {
    if ((!natureOfDisposalModal && !showOrderCopy) &&
        (!selectedOtherTemplate.table || selectedOtherTemplate.table === "")) {
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
  
    if (natureOfDisposalModal) {
      natureOfDisposalFinalReport(data);
      return;
    }
  
    if (showOrderCopy) {
      natureOfDisposalOrderCopy(data);
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
  
    if (selectedOtherTemplate.table === "cid_ui_case_progress_report") {
      normalData["field_pr_status"] = "No";
    }
  
    normalData.sys_status = "AP";
    normalData.field_status = "";
    normalData["ui_case_id"] = selectedRowData.id;
  
    formData.append("table_name", showPtCaseModal ? ptCaseTableName : selectedOtherTemplate.table);
    formData.append("data", JSON.stringify(normalData));
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
  
        if (selectedOtherTemplate?.field) {
          const combinedData = {
            id: selectedRowData.id,
            [selectKey.name]: selectedOtherFields.code,
          };
          onUpdateTemplateData(combinedData);
        }
        await handleOtherTemplateActions(selectedOtherTemplate, selectedRowData);

        showOptionTemplate(selectedOtherTemplate.table);
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

  const otherTemplateSaveFunc = async (data) => {

    if ((!natureOfDisposalModal && !showOrderCopy) && (!selectedOtherTemplate.table || selectedOtherTemplate.table === "")) {
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

    if(natureOfDisposalModal){
        natureOfDisposalFinalReport(data);
        return;
    }
    if(showOrderCopy){
        natureOfDisposalOrderCopy(data);
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

    if (selectedOtherTemplate.table === "cid_ui_case_progress_report") {
        normalData["field_pr_status"] = "No";
    }

    normalData.sys_status = showPtCaseModal ? "pt_case" : "ui_case";
    normalData["ui_case_id"] = selectedRowData.id;

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
                onOpen: () => {
                  if (sysStatus === "merge_cases") {
                    loadMergedCasesData(paginationCount);
                  } else {
                    if(!selectedOtherTemplate?.field){
                        handleOtherTemplateActions(selectedOtherTemplate, selectedRow)
                    }else{
                        loadTableData(paginationCount);
                    }
                  }
                },
            });

            setOtherFormOpen(false);
            setAddApproveFlag(false);
            setApproveTableFlag(false);
          //   if (Object.keys(othersData).length > 0) {
          //     setOtherTemplateModalOpen(false);
          //   }
          //   else{
          //   setOtherTemplateModalOpen(true);
          //   handleOtherTemplateActions(selectedOtherTemplate, selectedRowData);

          // }
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
                setOtherTemplateModalOpen(false);
            }else{
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

    if(selectedOtherTemplate.table === "cid_ui_case_progress_report"){
        normalData["field_pr_status"] = "No";
    }
  
    formData.append("table_name", selectedOtherTemplate.table);
    formData.append("id", data.id);
    formData.append("data", JSON.stringify(normalData));
    formData.append("transaction_id", randomApprovalId);
    formData.append( "user_designation_id", localStorage.getItem("designation_id") || null);
  
    let othersData = {};
  
    if (Object.keys(approvalSaveData).length > 0) {
      const approvalDetails = {
        id: selectedRowData.id,
        type: 'ui_case',
        module_name: "Under Investigation",
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

  const onSaveTemplateData = async (data) => {
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
    normalData.sys_status = "ui_case";
    
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
          normalData[field.name] = Array.isArray(data[field.name]) ? data[field.name].join(",") : data[field.name]
        }
      }
    });
    normalData["id"] = data.id;
    formData.append("id", data.id);
    showCaseApprovalPage(normalData,formData, false);
    return;
    setLoading(true);
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
            if (sysStatus === "merge_cases") {
              loadMergedCasesData(paginationCount);
            } else {
              loadTableData(paginationCount);
            }
          },
        });

        setSelectKey(null);
        setSelectedRow([]);
        setOtherTransferField([]);
        setSelectedOtherFields(null);
        setselectedOtherTemplate(null);
        setUsersBasedOnDivision([]);
        setSelectedUser(null);
        setSelectedRowIds([]);
        setSelectedMergeRowData([]); 
        setSelectedParentId(null);    
        setApprovalSaveData({});
        setHasApproval(false);

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

    console.log("dataaa", data)
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
            if (sysStatus === "merge_cases") {
              loadMergedCasesData(paginationCount);
            } else {
              loadTableData(paginationCount);
            }
          },
        });

        setSelectKey(null);
        setSelectedRow([]);
        setOtherTransferField([]);
        setSelectedOtherFields(null);
        setselectedOtherTemplate(null);
        setUsersBasedOnDivision([]);
        setSelectedUser(null);
        setSelectedRowIds([]);
        setSelectedMergeRowData([]); 
        setSelectedParentId(null);    
        setApprovalSaveData({});
        setHasApproval(false);

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

    const handlePagination = (page) => {
        setPaginationCount(page)
    }

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


  const handleFileUpload = async (event) => {
    setLoading(true);
    const file = event.target.files[0];

    if (!file) {
      Swal.fire("Error", "Please select a file.", "error");
      return;
    }

    if (!selectedRowData || !selectedRowData.id) {
      Swal.fire("Error", "Invalid case ID.", "error");
      return;
    }

    const caseId = selectedRowData.id;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("ui_case_id", caseId);
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
    } finally {
      setLoading(false);
    }
  };

  const getUploadedFiles = async (selectedRow, options) => {

    if (!selectedRow || !selectedRow.id) {
      console.error("Invalid selectedRow for file retrieval:", selectedRow);
      return;
    }
    try {
      const response = await api.post("/templateData/getUploadedFiles", {
        ui_case_id: selectedRow.id,
      });

      if (response && response.success) {
        setUploadedFiles(response.data);
        handleOtherTemplateActions(options, selectedRow, false, true);
      }
    } catch (error) {
      console.error("Error fetching uploaded files:", error);
    }
  };

  const checkPdfEntryStatus = async (caseId) => {
    if (!caseId) {
      setHasPdfEntry(false);
      return;
    }
    try {
      const response = await api.post("/templateData/checkPdfEntry", {
        ui_case_id: caseId,
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

    const getCellClassName = (key, params, table) => {
        // Example condition: unread rows for a specific table
        if (table === "cid_ui_case_progress_report" && !params?.row?.ReadStatus) {
            return "unreadBackground";
        }
    
        // Add more logic if needed based on `key` or `params`
        return "";
    };
  
  
  const handleOtherTemplateActions = async (options, selectedRow, searchFlag,fromUploadedFiles) => {
    setAoFieldId(selectedRow);
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
    if(options?.table !== "cid_ui_case_progress_report"){
        setApprovalSaveData({});
    }

    if (options.table && options.field) {
        const selectedFieldValue = options.field;
        showTransferToOtherDivision(options, selectedRow, selectedFieldValue);
        return;
    }

    setSelectedRow(selectedRow);
    var getTemplatePayload = {
        table_name: options.table,
        ui_case_id: selectedRow.id,
        pt_case_id: selectedRow?.pt_case_id || null,
        limit : 10,
        page : !searchFlag ? otherTemplatesPaginationCount : 1,
        search: !searchFlag ? otherSearchValue : "",        
        from_date: !searchFlag ? othersFromDate : null,
        to_date: !searchFlag ? othersToDate : null,
        filter: !searchFlag ? othersFilterData : {},
    };

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

          if (selectedOtherTemplate?.table || options.table === "cid_ui_case_progress_report") {
            const anyHasPRStatus = records.some(record => record.field_pr_status === "Yes");
          
            // Show button only if no one has PR status true
            if (!anyHasPRStatus) {
              showReplacePdf = true;
            }
          }
          
          setShowReplacePdfButton(showReplacePdf);
          
          let anySubmitAP = false;

          if (options.table === "cid_ui_case_action_plan") {
            anySubmitAP = records.some(record => record.field_status === "submit");
          }

          setShowSubmitAPButton(anySubmitAP);

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
            if (options.table === "cid_ui_case_action_plan") {
              excludedKeys.push("field_status");
            }
            if (options.table === "cid_ui_case_trail_monitoring") {
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
              ...(options.table === "cid_ui_case_progress_report"
                ? [
                  {
                    field: "select",
                    headerName: "",
                    width: 50,
                    cellClassName: (params) => getCellClassName("sl_no", params, options.table),
                    renderCell: (params) => {
                      const isPdfUpdated = params.row.field_pr_status === "Yes";
                      const isPdfUpdating = params.row.field_status === "Completed";
                      // const isAssignedUser = String(params.row.field_assigned_to_id);
                      // const isAssignedUserId = String(localStorage.getItem("user_id"));
                    
                      // const isAssignedBy = String(params.row.field_assigned_by_id);
                      // const isAuthorized = isAssignedUserId === isAssignedUser;
                      // const isAuthorizedBy = isAssignedBy === isAssignedUserId;
                                        
                      // if (isPdfUpdated) return null;
                    
                      // const bothUnauthorized = !isAuthorized && !isAuthorizedBy;
                    
                      return isPdfUpdated || !isPdfUpdating ? null : (
                        <div onClick={(e) => e.stopPropagation()}>
                        <Checkbox onChange={() => toggleSelectRow(params.row.id)} />
                      </div>
                      );
                    }
                    
                  }
                  
                  ]
                : []),
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
                    width: options.table === 'cid_ui_case_action_plan'
                      ? 250
                      : (updatedKeyName.length < 15 ? 100 : 180),
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
              ...(options.table === "cid_ui_case_trail_monitoring"
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
                ...(options.table === "cid_ui_case_trail_monitoring"
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
                  width: 300,
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
                      options.table === "cid_ui_case_trail_monitoring" &&
                      params.row.field_served_or_unserved === "Yes";

                    const checkUnServed = 
                      options.table === "cid_ui_case_trail_monitoring" &&
                      params.row.field_served_or_unserved === "No";


                    const checkreappear =
                      options.table === "cid_ui_case_trail_monitoring" &&
                      params.row.field_reappear === "Yes" || params.row.field_reappear === "No";

                    const isViewAction = options.is_view_action === true
                    
                    const isActionPlan = options.table === "cid_ui_case_action_plan" && params.row.field_status === 'submit';
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
                
                        {canEdit&& (
                          !isActionPlan && (
                          !isViewAction && (
                            !isPdfUpdated && (
                               !isChildMergedLoading && (
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
                            )
                            )))
                          )}
                        {canDelete&& (
                          !isActionPlan && (
                          !isViewAction && (
                            !isPdfUpdated && (
                              !isChildMergedLoading && (
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
                           )
                          )))
                        )}
                        {options.table === "cid_ui_case_trail_monitoring" && (
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

  const showMassiveDivision = async (options, selectedRow, selectedFieldValue) => {
    const selectedFieldData = selectedRow[selectedFieldValue];
  
    const viewTableData = {
      table_name: options.table,
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
        viewTemplateResponse["data"]
      ) {
        if (viewTemplateResponse["data"].fields) {
          setFormTemplateData(viewTemplateResponse["data"].fields);
  
          const getDivisionField = viewTemplateResponse["data"].fields.filter(
            (data) => data.name === options.field
          );
  
          if (getDivisionField.length > 0) {
  
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
                  setSelectedRow(selectedRow);
                  setselectedOtherTemplate(options);
                  setOtherTransferField(updatedOptions);
                  setShowMassiveTransferModal(true);
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
              setSelectedRow(selectedRow);
              setselectedOtherTemplate(options);
              setOtherTransferField(staticOptions);
              setShowMassiveTransferModal(true);
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

  const showTransferToOtherDivision = async (options, selectedRow, selectedFieldValue, approved) => {

    if(options.is_approval && !approved){
        setApprovalSaveData({});
        setHasApproval(true); 
        showApprovalPage(selectedRow, options);
        return;
    }

    const selectedFieldData = selectedRow[selectedFieldValue];
  
    const viewTableData = {
      table_name: options.table,
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
        viewTemplateResponse["data"]
      ) {
        if (viewTemplateResponse["data"].fields) {
          setFormTemplateData(viewTemplateResponse["data"].fields);
  
          const getDivisionField = viewTemplateResponse["data"].fields.filter(
            (data) => data.name === options.field
          );
  
          if (getDivisionField.length > 0) {
  
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
                  const preSelectedDivision = matchedOption || null;
                  setSelectedOtherFields(preSelectedDivision);

                  
                  if (options.name.trim().toLowerCase() == "transfer to other division" || options.name.trim().toLowerCase() == "reassign io" && preSelectedDivision?.code) {
                    api
                      .post("cidMaster/getIoUsersBasedOnDivision", {
                        division_ids: [preSelectedDivision.code],
                        role_id: null,
                      })
                      .then((res) => {
                        setUsersBasedOnDivision(res.data || []);
                      })
                      .catch((err) => {
                        console.error("Failed to load users based on division", err);
                        setUsersBasedOnDivision([]);
                      });
                  }
                    
                  setSelectKey({ name: options.field, title: options.name });
                //   setSelectedRow(selectedRow);
                //   setselectedOtherTemplate(options);
                  setOtherTransferField(updatedOptions);
                  if (options.name.trim().toLowerCase() == "transfer to other division" || options.name.trim().toLowerCase() == "reassign io") {
                    setShowMassiveTransferModal(true);
                    setSelectedRowIds([selectedRow.id])
                  } else {
                    setShowOtherTransferModal(true);
                  }
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
              const preSelectedDivision = matchedOption || null;
              setSelectedOtherFields(preSelectedDivision);
              
              if (options.name.trim().toLowerCase() == "transfer to other division" || options.name.trim().toLowerCase() == "reassign io" && preSelectedDivision?.code) {
                api
                  .post("cidMaster/getIoUsersBasedOnDivision", {
                    division_ids: [preSelectedDivision.code],
                    role_id: null,
                  })
                  .then((res) => {
                    setUsersBasedOnDivision(res.data || []);
                  })
                  .catch((err) => {
                    console.error("Failed to load users based on division", err);
                    setUsersBasedOnDivision([]);
                  });
              }
                
              setSelectKey({ name: options.field, title: options.name });
            //   setSelectedRow(selectedRow);
            //   setselectedOtherTemplate(options);
              setOtherTransferField(staticOptions);
              if (options.name.trim().toLowerCase() == "transfer to other division".toLowerCase() || options.name.trim().toLowerCase() == "reassign io") {
                setShowMassiveTransferModal(true);
              } else {
                setShowOtherTransferModal(true);
              }
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

        if(Options.table === "cid_ui_case_progress_report" && !Options?.approval_items){

            var getFurtherInvestigationItems = getActionsDetails.data['approval_item'].filter((data)=>{
                if((data.name).toLowerCase() === "progress report approval"){
                    return data;
                }
            });

            if(getFurtherInvestigationItems?.[0]){
                Options['approval_items'] = getFurtherInvestigationItems?.[0].approval_item_id
            }
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
        }
        else if (isFromEdit ) {
          handleOthersTemplateDataView(selectedApprovalEdit, true, table);
          setIsFromEdit(false);
      } else {
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
    
            // update func
            onUpdateTemplateData(combinedData);
    
            // reset states
            setAddApproveFlag(false);
            setApproveTableFlag(false);
            setShowOtherTransferModal(false);

        }
  };

  
  const handleMassiveDivisionChange = async () => {
    if (!selectedOtherFields || !selectedOtherFields.code) {
      toast.error("Please Select Division!", {
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
  
    if (!selectedUser || !selectedUser.user_id) {
      toast.error("Please select IO User!", {
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
  
    if (
      selectedOtherTemplate &&
      selectedOtherTemplate["field"] &&
      (selectedOtherTemplate["field"] === "field_nature_of_disposal" ||
        selectedOtherTemplate["field"] === "field_prosecution_sanction" ||
        selectedOtherTemplate["field"] === "field_17a_pc_act") &&
      selectedOtherFields &&
      selectedOtherFields["name"]
    ) {
      checkDisposalValues();
      return;
    }
    
    if (selectedOtherTemplate && selectedOtherTemplate.is_approval && !hasApproval) {
      setApprovalSaveData({});
      showApprovalPage(selectedRow, selectedOtherTemplate);
      return;
    }
  
    var combinedData = {
      id: selectedRowIds.join(","),
      [selectKey.name]: selectedOtherFields.code,
      field_io_name: selectedUser?.user_id,
    };
  
    if (selectedOtherTemplate.is_approval) {
      var payloadApproveData = {
        ...approvalSaveData,
        case_id: selectedRowData?.id || selectedRowIds[0],
        case_type: "ui_case",
        module: "Under Investigation",
        action: "Under Investigation Action",
        transaction_id: randomApprovalId,
        created_by_designation_id: localStorage.getItem("designation_id") || "",
        created_by_division_id: localStorage.getItem("division_id") || "",
        info: {
          module: "Under Investigation",
          action: "Under Investigation Action",
        },
      };
  
      setLoading(true);
  
      try {
        const approvalResponse = await api.post("/ui_approval/create_ui_case_approval", payloadApproveData);
  
        setLoading(false);
  
        if (approvalResponse && approvalResponse.success) {
          toast.success(approvalResponse.message || "Approval Added Successfully", {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            className: "toast-success",
          });
  
          onUpdateTemplateData(combinedData);
  
          // reset states
          setAddApproveFlag(false);
          setApproveTableFlag(false);
          setShowOtherTransferModal(false);
          setApprovalSaveData({});
          setShowMassiveTransferModal(false);
          setSelectKey(null);
          setSelectedRow([]);
          setOtherTransferField([]);
          setSelectedOtherFields(null);
          setselectedOtherTemplate(null);
          setUsersBasedOnDivision([]);
          setSelectedRowIds([]);
          setSelectedUser(null);
          setSelectedRowIds([]);
          setSelectedMergeRowData([]);
          setSelectedParentId(null);
          setTableData((prevData) =>
            prevData.map((item) => ({ ...item, isSelected: false }))
          );
          setHasApproval(false);
        } else {
          toast.error(approvalResponse.message || "Failed to add approval. Please try again.", {
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
        toast.error(error?.response?.data?.message || "Error during approval!", {
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
      onUpdateTemplateData(combinedData);
  
      // reset states
      setShowMassiveTransferModal(false);
      setSelectKey(null);
      setSelectedRow([]);
      setOtherTransferField([]);
      setSelectedOtherFields(null);
      setselectedOtherTemplate(null);
      setUsersBasedOnDivision([]);
      setSelectedRowIds([]);
      setSelectedUser(null);
      setSelectedRowIds([]);
      setSelectedMergeRowData([]);
      setSelectedParentId(null);
      setTableData((prevData) =>
        prevData.map((item) => ({ ...item, isSelected: false }))
      );
      setAddApproveFlag(false);
      setApproveTableFlag(false);
      setShowOtherTransferModal(false);
      setApprovalSaveData({});
      setHasApproval(false);
    }
  };
  

  const showPtCaseTemplate = async () => {

    var getTemplatePayload = {
        "table_name": table_name,
        "id": selectedRowData.id,
        "template_module": "pt_case"
    }

    setLoading(true);

    try {
      const getTemplateResponse = await api.post(
        "/templateData/viewTemplateData",
        getTemplatePayload
      );
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

    const checkDisposalValues = async () => {
        if (selectedOtherTemplate?.["field"] === "field_nature_of_disposal" && selectedOtherFields?.["name"]) {
            if (selectedOtherFields && selectedOtherFields["name"] === "A") {
                showPtCaseTemplate();
                setDisposalUpdate(true);
            } else {
                Swal.fire({
                    title: "Are You Sure ?",
                    text: "Do you want to move this case !",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonText: "Yes !",
                    cancelButtonText: "No",
                }).then(async (result) => {
                    if (result.isConfirmed) {
                        if (selectedOtherTemplate && selectedOtherTemplate.is_approval) {

                            var payloadApproveData = {
                                ...approvalSaveData,
                                case_id: selectedRowData.id,
                                case_type: "ui_case",
                                module: "Under Investiation",
                                action: "Nature Of Disposal",
                                transaction_id: randomApprovalId,
                                created_by_designation_id: localStorage.getItem("designation_id") ? localStorage.getItem("designation_id") : "",
                                created_by_division_id: localStorage.getItem("division_id") ? localStorage.getItem("division_id") : "",
                                info: {
                                    module: "Under Investiation",
                                    action: "Nature Of Disposal",
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

  var userPermissions =
    JSON.parse(localStorage.getItem("user_permissions")) || [];
  var hoverExtraOptions = [
      
    userPermissions[0]?.edit_case
      ?  isChildMergedLoading
      ? null
      : {
          name: "Edit",
          onclick: (selectedRow) => {
            handleTemplateDataView(selectedRow, true, table_name);
          },
        
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
                  id="mask0_1120_40631"
                  style={{ maskType: "alpha" }}
                  maskUnits="userSpaceOnUse"
                  x="4"
                  y="4"
                  width="16"
                  height="16"
                >
                  <rect x="4" y="4" width="16" height="16" fill="" />
                </mask>
                <g mask="url(#mask0_1120_40631)">
                  <path
                    d="M5.6001 20V17.4666H18.4001V20H5.6001ZM7.53343 15.1423V13.177L14.2399 6.4628C14.3365 6.36625 14.4368 6.29875 14.5409 6.2603C14.6452 6.22186 14.7524 6.20264 14.8628 6.20264C14.9774 6.20264 15.0856 6.22186 15.1873 6.2603C15.2889 6.29875 15.3865 6.3638 15.4801 6.45547L16.2129 7.18464C16.3053 7.28119 16.3717 7.3803 16.4123 7.48197C16.4528 7.58375 16.4731 7.69325 16.4731 7.81047C16.4731 7.91769 16.4531 8.02453 16.4131 8.13097C16.3731 8.23753 16.308 8.33586 16.2179 8.42597L9.5001 15.1423H7.53343ZM14.7438 8.67314L15.6064 7.8103L14.8654 7.0693L14.0026 7.93197L14.7438 8.67314Z"
                    fill=""
                  />
                </g>
              </svg>
            </span>
          ),
        }
      : null,
    ...(sysStatus !== "b_Report" ? hoverTableOptions : []),
    // sysStatus === "ui_case" || sysStatus === "all"
    //   ? {
    //       name: "Preliminary Charge Sheet - 173 (8)",
    //       onclick: (selectedRow) =>
    //         changeSysStatus(
    //           selectedRow,
    //           "178_cases",
    //           "Do you want to update this case to 173(8) ?"
    //         ),
    //     }
    //   : null,

    sysStatus === "disposal"
      ? {
          name: "Re Open",
          onclick: (selectedRow) =>
            changeSysStatus(
              selectedRow,
              "Reinvestigation",
              "Do you want to update this case to Reinvestigation ?"
            ),
        }
      : null,
        sysStatus !== "b_Report" && sysStatus !== 'merge_cases' ?{
            name: "Nature of Disposal",
            onclick: (selectedRow) => showNatureOfDisposal(selectedRow, table_name),
        } : null,
        sysStatus === "b_Report" ?
        {
            name: "Approved By Court",
            onclick: (selectedRow) => showOrderCopyCourt(selectedRow, table_name, true),
        } : null,
        sysStatus === "b_Report" ? 
        {
            name: "Rejected By Court",
            onclick: (selectedRow) => showOrderCopyCourt(selectedRow, table_name, false),
        } : null,
    userPermissions[0]?.case_details_download
      ? {
          name: "Download",
          onclick: (selectedRow) =>
            getPdfContentData(selectedRow, false, table_name),
        }
      : null,
    userPermissions[0]?.case_details_print
      ? {
          name: "Print",
          onclick: (selectedRow) =>
            getPdfContentData(selectedRow, true, table_name),
        }
      : null,
      userPermissions[0]?.delete_case
      ?  isChildMergedLoading
      ? null
      : {
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
  ].filter(Boolean);

  // Advance filter functions

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

        var validFilterFields = ["dropdown", "autocomplete", "multidropdown"];

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
        //  var payload = {
        //     page,
        //     limit: 10,
        //     search: searchValue || "",
        // }
  
          try {
  
              const getActionsDetails = await api.post("/ui_approval/get_ui_case_approvals" );
  
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

                  setApprovalFormData({})

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
  console.log("approvalformdataa", approvalFormData)
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
              module_name : 'Under Investigation',
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
                        if (sysStatus === "merge_cases") {
                          loadMergedCasesData(paginationCount);
                        } else {
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
          type: 'ui_case',
            module_name: 'Under Investigation',
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
                        if (sysStatus === "merge_cases") {
                            loadMergedCasesData(paginationCount); 
                        } else {
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
    
    const handleTaskShow = (rowData)=>{

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

        var options = {
            name : "Progress Report",
            module : "ui_case",
            table : "cid_ui_case_progress_report",
            is_pdf: true,
            // is_approval: true
        }

        handleOtherTemplateActions(options, rowData);
    }

    const handleActionShow = (rowData, isLoading)=>{
    
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

        if (isLoading) {
          console.log(isLoading, "isloadinggg coming inside")

          setIsChildMergedLoading(true);
      }
  
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
      const payload = { case_id: row , approval_type: 'ui_case' };
    
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
          // toast.success(getActionsDetails.message || "Approval Log Fetched Successfully", {
          //   position: "top-right",
          //   autoClose: 3000,
          //   hideProgressBar: false,
          //   closeOnClick: true,
          //   pauseOnHover: true,
          //   draggable: true,
          //   progress: undefined,
          //   className: "toast-success",
          // });
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
      console.log("approvedataa", approveData)
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
                setListApprovalCaseNo(approveData?.["field_cid_crime_no./enquiry_no"] || "")
    
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

    const closeOtherForm = ()=>{
        setOtherFormOpen(false)
        setShowPtCaseModal(false);
        if(selectedOtherTemplate?.table === "cid_ui_case_action_plan"){
            handleOtherTemplateActions(selectedOtherTemplate, selectedRowData)
        }
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
                {template_name
                  ? template_name
                      .toLowerCase()
                      .replace(/\b\w/g, (c) => c.toUpperCase())
                      : "Under Investigation"}
              </Typography>
                <Box className="totalRecordCaseStyle">
                    {totalRecord} Cases
                </Box>
            </Box>
          </Box>
          <Box sx={{ display: "flex", alignItems: "start", gap: "12px" }}>


            {isCheckboxSelected && sysStatus !== 'merge_cases' && (
              <>
                <Button
                  variant="contained"
                  className="blueButton"
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
                        fill="#ffffff"
                      />
                    </svg>
                  }
                  onClick={() => {
                    setShowMergeModal(true);
                    setMergeDialogData(selectedMergeRowData); 
                  }}
                  >
                  Merge
                </Button>
                <Button
                  variant="contained"
                  className="blueButton"
                  startIcon={
                    <svg
                      fill="#ffffff"
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
                  
                  onClick={() =>
                    showMassiveDivision(
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


          {isCheckboxSelected && sysStatus === 'merge_cases' && (
              <>
              <Button 
                variant="contained"
                style={{ backgroundColor: '#DC2626', color: '#ffffff' }}
                startIcon={
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M9.172 14.828a4 4 0 1 1 0-5.656M14.828 9.172a4 4 0 1 1 0 5.656M4 20l5.5-5.5M20 4l-5.5 5.5"
                      stroke="#ffffff"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                }
                onClick={() => {
                  handleConfirmDemerge();
                }}
              >
                De-Merge
              </Button>
              </>
            )}

            {JSON.parse(localStorage.getItem("user_permissions")) && JSON.parse(localStorage.getItem("user_permissions"))[0].create_case && !isCheckboxSelected && (
                <Button
                    onClick={() => getTemplate(table_name)}
                    className="blueButton"
                    startIcon={
                        <AddIcon
                            sx={{
                                border: "1.3px solid #FFFFFF",
                                borderRadius: "50%",
                                background:"#4D4AF3 !important"
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

        <Box pt={1} sx={{ display: "flex", justifyContent: "space-between", alignItems: 'start' }}>
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
                setSysSattus("ui_case");
                setPaginationCount(1);
              }}
              id="filterUiCase"
              className={`filterTabs ${
                sysStatus === "ui_case" ? "Active" : ""
              }`}
            >
              UI Cases
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
                setSysSattus("merge_cases");
                setPaginationCount(1);
              }}
              id="filterMergeCases"
              className={`filterTabs ${
                sysStatus === "merge_cases" ? "Active" : ""
              }`}
            >
              Merged Cases
            </Box>
            <Box
                onClick={() => {
                    setSysSattus("b_Report");
                    setPaginationCount(1);
                }}
                id="filterReinvestigation"
                className={`filterTabs ${sysStatus === "b_Report" ? "Active" : ""}`}
            >
                B Report
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
            <Box
              onClick={() => {
                setSysSattus("Reinvestigation");
                setPaginationCount(1);
              }}
              id="filterReinvestigation"
              className={`filterTabs ${
                sysStatus === "Reinvestigation" ? "Active" : ""
              }`}
            >
              ReInvestigation
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
                placeholder="Search anything"
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
                  Clear Filter
                </Typography>
              )}
            </Box>
        </Box>

        <Box py={2}>
          {/* <TableView

            rows={tableData}
            columns={viewTemplateTableColumns}
            backBtn={paginationCount !== 1}
            nextBtn={tableData.length === 10}
            handleBack={handlePrevPage}
            handleNext={handleNextPage}
          /> */}

        <TableView 
            hoverTable={true}
            hoverTableOptions={hoverExtraOptions}
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
          closeForm={setFormOpen}
        />
      )}

      <Dialog
        open={showMergeModal}
        onClose={() => setShowMergeModal(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Select Parent Case</DialogTitle>
        <DialogContent sx={{ width: "500px" }}>
          <FormControl fullWidth>
            <Autocomplete
              id="parent-case-autocomplete"
              options={
                Array.isArray(selectedMergeRowData)
                  ? selectedMergeRowData
                      .filter(row => row?.id !== undefined)
                      .filter((value, index, self) => 
                        index === self.findIndex((t) => t.id === value.id)
                      )
                  : []
              }
              
              getOptionLabel={(option) => {
                return (
                  option?.["field_cid_crime_no./enquiry_no"] ||
                  `Case ${option?.id}`
                );
              }}
              value={
                selectedParentId
                  ? selectedMergeRowData.find((r) => r.id === selectedParentId.id)
                  : null
              }
              onChange={(event, newValue) => {
                setSelectedParentId(newValue);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Parent Case"
                  className="selectHideHistory"
                />
              )}
              isOptionEqualToValue={(option, value) => {
                return option?.id === value?.id;
              }}
            />
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ padding: "12px 24px" }}>
          <Button onClick={() => setShowMergeModal(false)}>Cancel</Button>
          <Button className="fillPrimaryBtn" onClick={handleConfirmMerge}>
            Merge
          </Button>
        </DialogActions>
      </Dialog>


      {otherFormOpen && (
        <Dialog
          open={otherFormOpen}
          onClose={() => closeOtherForm}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          maxWidth="xl"
          fullWidth
        >
          <DialogContent sx={{ minWidth: "400px", padding: '0'}}>
            <DialogContentText id="alert-dialog-description">
              <FormControl fullWidth>
                <NormalViewForm
                  table_row_id={otherRowId}
                  template_id={otherTemplateId}
                  template_name={
                    showPtCaseModal && ptCaseTemplateName
                      ? ptCaseTemplateName
                      : selectedOtherTemplate?.name
                  }
                  table_name={
                    showPtCaseModal && ptCaseTableName
                      ? ptCaseTableName
                      : selectedOtherTemplate?.table
                  }
                  readOnly={otherReadOnlyTemplateData}
                  editData={otherEditTemplateData}
                  initialData={otherInitialTemplateData}
                  formConfig={optionFormTemplateData}
                  stepperData={optionStepperData}
                  onSubmit={
                    selectedOtherTemplate?.table === "cid_ui_case_action_plan"
                      ? otherAPPRTemplateSaveFunc
                      : otherTemplateSaveFunc 
                  }
                  onUpdate={otherTemplateUpdateFunc}
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
          sx={{ zIndex: "1", marginLeft: '50px' }}
        >
          <DialogTitle
            id="alert-dialog-title"
            sx={{
              display: "flex",
              alignItems: "start",
              justifyContent: "space-between",
            }}
          >
            <Box 
                sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }} 
                onClick={() => {
                    setOtherTemplateModalOpen(false);
                    
                    if (selectedOtherTemplate?.table === "cid_ui_case_progress_report") {
                        if (sysStatus === "merge_cases") {
                          loadMergedCasesData(paginationCount);
                        } else {
                          loadTableData(paginationCount);
                        }
                    }
                }}
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
                        sx={{ fontWeight: 500, marginTop: '2px' }}
                    />
                )}

                <Box className="totalRecordCaseStyle">
                    {otherTemplatesTotalRecord} Records
                </Box>

            </Box>
            <Box sx={{display: 'flex', alignItems: 'center'}}>
              {selectedOtherTemplate?.table ===
              "cid_ui_case_progress_report" ? (
                hasPdfEntry &&(
                  <Box sx={{display: 'flex', alignItems: 'start'}}>
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
                        placeholder='Search anything'
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
                            Clear Filter
                        </Typography>
                    )}
                    </Box>
                    {/* {isIoAuthorized && ( */}
                    {!isChildMergedLoading && (
                      <Button
                        variant="outlined"
                        sx={{
                          marginLeft: "10px",
                          height: '40px',
                          borderColor: '#1976d2',
                          color: '#1976d2',
                        }}
                        onClick={() => {
                          showOptionTemplate(selectedOtherTemplate?.table);
                        }}
                      >
                        Add
                      </Button>
                    )}
                    {/* )} */}
                    <Button
                      variant="outlined"
                      onClick={() =>
                        handleUpdatePdfClick({
                          selectedOtherTemplate,
                          selectedRowData,
                          selectedIds,
                          prUpdatePdf,
                        })
                      }
                      sx={{
                        marginLeft: "10px",
                        height: '40px',
                        borderColor: '#2e7d32',
                        color: '#2e7d32',
                      }}
                    >
                      Update PDF
                    </Button>
                    {showReplacePdfButton && (
                      <Button variant="outlined" 
                      component="label"
                      sx={{
                        marginLeft: "10px",
                        height: '40px',
                        borderColor: '#d32f2f',
                        color: '#d32f2f',
                      }}
                  >
                      Replace PDF
                      <input
                        type="file"
                        hidden
                        accept="application/pdf"
                        onChange={(event) => handleFileUpload(event)}
                      />
                    </Button>
 
                  )}

                  </Box>
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
                        placeholder='Search anything'
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
                            Clear Filter
                        </Typography>
                    )}
                    </Box>
                    {/* {isIoAuthorized && ( */}
                    {!viewModeOnly && (
                    !isChildMergedLoading && (
                      !showSubmitAPButton && (
                        <Button
                            variant="outlined"
                            sx={{height: '40px'}}
                            onClick={() =>
                                showOptionTemplate(selectedOtherTemplate?.table)
                            }
                        >
                            Add
                        </Button>
                    )))}
                    {/* )} */}
                    {selectedOtherTemplate?.table === 'cid_ui_case_action_plan' && (
                      ! showSubmitAPButton&& (
                      <Button
                      variant="contained"
                      sx={{ backgroundColor: '#12B76A', color: 'white', mr: 1, textTransform: 'none' }}
                      onClick={() => {
                          console.log('selectedRowData:', selectedRowData);
                          handleSubmitAp({ id: selectedRowData?.id });
                        }}
                      >
                        Submit
                      </Button>
                    ))}
                </Box>
              )}
              {/* <IconButton
                aria-label="close"
                onClick={() => setOtherTemplateModalOpen(false)}
                sx={{ color: (theme) => theme.palette.grey[500] }}
              >
                <CloseIcon />
              </IconButton> */}
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
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, marginBottom: '10px' }}>
                        {aoFields.length > 0 ? (
                            <Grid container spacing={2}>
                              {aoFields.slice(0, 6).map((field, index) => (
                                <Grid item xs={12} md={4} key={index}>
                                  {field.type === 'text' && (
                                    <ShortText
                                      key={field.id}
                                      field={field}
                                      formData={filterAoValues}
                                      disabled={true}
                                    />
                                  )}
                                  {field.type === 'multidropdown' && (
                                    <MultiSelect
                                      key={field.id}
                                      field={field}
                                      formData={filterAoValues}
                                      onChange={(name, selectedCode) => handleAutocomplete(field, selectedCode)}
                                      disabled={true}
                                    />
                                  )}
                                  {(field.type === 'dropdown' || field.type === 'autocomplete') && (
                                    <AutocompleteField
                                      key={field.id}
                                      field={field}
                                      formData={filterAoValues}
                                      onChange={(name, selectedCode) => handleAutocomplete(field, selectedCode)}
                                      value={(() => {
                                        const fieldValue = filterAoValues?.[field.name];

                                        const selectedOption = field.options.find(
                                          (option) => String(option.code) === String(fieldValue)
                                        );

                                        return selectedOption || null;
                                      })()}
                                      disabled={true}
                                    />
                                  )}
                                </Grid>
                              ))}
                              <Grid container item xs={12} spacing={2} alignItems="flex-start">
                              {aoFields
                                .slice(4)
                                .filter(f => f.type === 'textarea')
                                .map((field, index, array) => (
                                  <Grid item xs={6} key={index}>
                                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                      <label style={{ fontWeight: 'bold', color: 'black', marginRight: '10px' }}>
                                        {field.label}
                                      </label>
                                      {index === array.length - 1 && (
                                        <Button
                                          variant="outlined"
                                          color="primary"
                                          size="small"
                                          onClick={() =>
                                            onActionPlanUpdate("cid_under_investigation", filterAoValues)
                                          }
                                          style={{ marginLeft: 'auto' }}
                                        >
                                          Update
                                        </Button>
                                      )}
                                    </div>

                                    <TextField
                                      fullWidth
                                      multiline
                                      minRows={8}
                                      variant="outlined"
                                      value={filterAoValues[field.name] || ""}
                                      onChange={(e) =>
                                        setFilterAoValues((prev) => ({
                                          ...prev,
                                          [field.name]: e.target.value,
                                        }))
                                      }
                                    />
                                  </Grid>
                                ))}
                              </Grid>
                            </Grid>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              No AO Fields Available
                            </Typography>
                          )}
 
                        </Box>
                            <TableView
                                rows={otherTemplateData}
                                columns={otherTemplateColumn}
                                totalPage={otherTemplatesTotalPage} 
                                totalRecord={otherTemplatesTotalRecord} 
                                paginationCount={otherTemplatesPaginationCount} 
                                handlePagination={handleOtherPagination} 
                                handleRowClick={(row) => handleOthersTemplateDataView(row, false, selectedOtherTemplate?.table)}
                                tableName={selectedOtherTemplate?.table}
                                />
                        </Box>
                        <Box
                          display="flex"
                          flexDirection="column"
                          alignItems="center"
                          justifyContent="center"
                          marginTop={"50px"} 
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
                      <Button variant="contained" component="label"  disabled={isChildMergedLoading}>
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
                      {selectedOtherTemplate?.table === "cid_ui_case_action_plan" && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, marginBottom: '10px' }}>
                          {aoFields.length > 0 ? (
                            <Grid container spacing={2}>
                              {aoFields.slice(0, 6).map((field, index) => (
                                <Grid item xs={12} md={4} key={index}>
                                  {field.type === 'text' && (
                                    <ShortText
                                      key={field.id}
                                      field={field}
                                      formData={filterAoValues}
                                      disabled={true}
                                    />
                                  )}
                                  {field.type === 'multidropdown' && (
                                    <MultiSelect
                                      key={field.id}
                                      field={field}
                                      formData={filterAoValues}
                                      onChange={(name, selectedCode) => handleAutocomplete(field, selectedCode)}
                                      disabled={true}
                                    />
                                  )}
                                  {(field.type === 'dropdown' || field.type === 'autocomplete') && (
                                    <AutocompleteField
                                      key={field.id}
                                      field={field}
                                      formData={filterAoValues}
                                      onChange={(name, selectedCode) => handleAutocomplete(field, selectedCode)}
                                      value={(() => {
                                        const fieldValue = filterAoValues?.[field.name];

                                        const selectedOption = field.options.find(
                                          (option) => String(option.code) === String(fieldValue)
                                        );

                                        return selectedOption || null;
                                      })()}
                                      disabled={true}
                                    />
                                  )}
                                </Grid>
                              ))}
                            <Grid container item xs={12} spacing={2} alignItems="flex-start">
                              {aoFields
                                .slice(4)
                                .filter(f => f.type === 'textarea')
                                .map((field, index, array) => (
                                  <Grid item xs={6} key={index}>
                                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                      <label style={{ fontWeight: 'bold', color: 'black', marginRight: '10px' }}>
                                        {field.label}
                                      </label>
                                      {index === array.length - 1 && (
                                        <Button
                                          variant="outlined"
                                          color="primary"
                                          size="small"
                                          onClick={() =>
                                            onActionPlanUpdate("cid_under_investigation", filterAoValues)
                                          }
                                          style={{ marginLeft: 'auto' }}
                                        >
                                          Update
                                        </Button>
                                      )}
                                    </div>

                                    <TextField
                                      fullWidth
                                      multiline
                                      minRows={8}
                                      variant="outlined"
                                      value={filterAoValues[field.name] || ""}
                                      onChange={(e) =>
                                        setFilterAoValues((prev) => ({
                                          ...prev,
                                          [field.name]: e.target.value,
                                        }))
                                      }
                                    />
                                  </Grid>
                                ))}
                            </Grid>
                            </Grid>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              No AO Fields Available
                            </Typography>
                          )}
                        </Box>
                      )}

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
                )}
              </Box>
            </DialogContentText>
          </DialogContent>
        </Dialog>
      )}
  
      <Dialog
        open={childMergedDialogOpen}
        onClose={() => {
          setIsChildMergedLoading(true);
          setChildMergedDialogOpen(false);
          setTimeout(() => setIsChildMergedLoading(false), 300);
        }}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        fullScreen
        fullWidth
        sx={{ marginLeft: '260px' }}
        >
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
              onClick={() => {
                setIsChildMergedLoading(true);
                setChildMergedDialogOpen(false);
                setTimeout(() => setIsChildMergedLoading(false), 300);
                loadMergedCasesData('1');
              }}
            >
              <WestIcon sx={{ color: 'black' }}/>
              <Typography sx={{ fontSize: '15px', fontWeight: 600, color: 'black' }}>
                Child Merged Cases
              </Typography>
              {childMergedCaseCID && (
                <Chip
                  label={childMergedCaseCID}
                  color="primary"
                  variant="outlined"
                  size="small"
                  sx={{ fontSize: '12px', fontWeight: 500, marginTop: '2px' }}
                />
              )}
              <Box className="totalRecordCaseStyle" sx={{ fontSize: '12px' }}>
                {childMergedTotalRecords} Records
              </Box>
            </Box>

            {selectedRowIds.length > 0 && (
            <Box>
              <Button 
                variant="contained"
                style={{ backgroundColor: '#DC2626', color: '#ffffff' }}
                startIcon={
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M9.172 14.828a4 4 0 1 1 0-5.656M14.828 9.172a4 4 0 1 1 0 5.656M4 20l5.5-5.5M20 4l-5.5 5.5"
                      stroke="#ffffff"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                }
                onClick={() => {
                  handleConfirmDemerge();
                }}
              >
                De-Merge
              </Button>
            </Box>
              )}
          </Box>
        </DialogTitle>

        <DialogContent sx={{ overflowY: 'auto', maxHeight: 'calc(100vh - 64px)' }}>
          {childMergedData.length > 0 ? (
            <TableView
              hoverTable={true}
              hoverTableOptions={hoverExtraOptions}
              hoverActionFuncHandle={handleOtherTemplateActions}
              height={true}
              rows={childMergedData}
              columns={childMergedColumns}
              totalPage={childMergedTotalPages}
              totalRecord={childMergedTotalRecords}
              paginationCount={childMergedPagination}
              handlePagination={handleChildMergePagination}
            />
          ) : (
            <Typography>No child merged cases found.</Typography>
          )}
        </DialogContent>
      </Dialog>

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

        <DialogContent sx={{ backgroundColor: '#FAFEF9', padding: 3 }}>
          <DialogContentText id="alert-dialog-description" component="div">
            <Box sx={{ fontWeight: 500, fontSize: '16px', mb: 2 }}>
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
                    supportingTextColor: 'green'
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
                value={selectedOtherFields || null}
                onChange={(event, newValue) => setSelectedOtherFields(newValue)}
                disabled={isChildMergedLoading}
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
          <Button onClick={() => setShowOtherTransferModal(false)} 
          >
            Cancel
          </Button>
          {!isChildMergedLoading && (
            <>
              <Button className="fillPrimaryBtn" onClick={handleSaveDivisionChange}>
                Submit
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>


      <Dialog
        open={showMassiveTransferModal}
        onClose={() => {
          setShowMassiveTransferModal(false);
          setSelectKey(null);
          // setSelectedRow([]);
          setOtherTransferField([]);
          // setSelectedOtherFields(null);
          // setselectedOtherTemplate(null);
          setUsersBasedOnDivision([]);
          // setSelectedUser(null);
          // setSelectedRowIds([]);
          setSelectedMergeRowData([]); 
          setSelectedParentId(null);
          setTableData((prevData) =>
            prevData.map((item) => ({ ...item, isSelected: false }))
          );
          // setHasApproval(false);
        }}
          aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title"></DialogTitle>
        <DialogContent sx={{ width: "400px" }}>
          <DialogContentText id="alert-dialog-description">
            <h4 className="form-field-heading">{selectKey?.title}</h4>
            <FormControl fullWidth>
              <Autocomplete
                options={otherTransferField}
                getOptionLabel={(option) => option.name || ""}             
                value={selectedOtherFields || null}
                onChange={(event, newValue) => {
                  setSelectedOtherFields(newValue);
                  setSelectedUser(null); 

                  if (newValue && newValue.code) {
                    api.post("cidMaster/getIoUsersBasedOnDivision", {
                      division_ids: [newValue.code],
                      role_id: null,
                    }).then((res) => {
                      setUsersBasedOnDivision(res.data || []);
                    }).catch((err) => {
                      console.error("Failed to load users based on division", err);
                      setUsersBasedOnDivision([]);
                    });
                  } else {
                    setUsersBasedOnDivision([]);
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    className="selectHideHistory"
                    label={selectKey?.title.trim() == "Reassign IO" ? "Division" : selectKey?.title}
                    />
                )}
              />
            </FormControl>

              <>
                <h4 className="form-field-heading" style={{ marginTop: "20px" }}>IO User</h4>
                <FormControl fullWidth>
                  <Autocomplete
                    options={usersBasedOnDivision}
                    getOptionLabel={(option) => option.name || ""}
                    value={selectedUser || null}
                    onChange={(event, newValue) => setSelectedUser(newValue)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        className="selectHideHistory"
                        label="IO User"
                      />
                    )}
                  />
                </FormControl>
              </>
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ padding: "12px 24px" }}>
          <Button 
            onClick={() => {
              setShowMassiveTransferModal(false);
              setSelectKey(null);
              setSelectedRow([]);
              setOtherTransferField([]);
              // setSelectedOtherFields(null);
              // setselectedOtherTemplate(null);
              setUsersBasedOnDivision([]);
              // setSelectedUser(null);
              // setSelectedRowIds([]);
              setSelectedMergeRowData([]); 
              setSelectedParentId(null);
              setTableData((prevData) =>
                prevData.map((item) => ({ ...item, isSelected: false }))
              );
              // setHasApproval(false);
            }}
            >Cancel
          </Button>
          <Button
            className="fillPrimaryBtn"
            onClick={() => {
              handleMassiveDivisionChange();
            }}
          >
            Submit
          </Button>
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

      {/* {approveTableFlag && (
        <Dialog
          open={approveTableFlag}
          onClose={() => setApproveTableFlag(false)}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          maxWidth="lg"
          fullWidth
          sx={{ zIndex: "1" }}
        >
          <DialogTitle
            id="alert-dialog-title"
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            Approval
            <Box >
              {!addApproveFlag ? (
                <Button
                  variant="outlined"
                  onClick={() => {
                    showApprovalAddPage(selectedOtherTemplate.table);
                  }}
                >
                  Add
                </Button>
              ) : (
                <Button
                  variant="outlined"
                  onClick={() => {
                    saveApprovalData(selectedOtherTemplate.table);
                  }}
                >
                  Save
                </Button>
              )}
              <IconButton
                aria-label="close"
                onClick={() => setApproveTableFlag(false)}
                sx={{ color: (theme) => theme.palette.grey[500] }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              <Box py={2} sx={{ width: '90%'}}>
                {!addApproveFlag ? (
                  <TableView rows={approvalsData} columns={approvalsColumn} />
                ) : (
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "18px",
                    }}
                  >                    
                    <Autocomplete
                      id=""
                      options={approvalItem}
                      getOptionLabel={(option) => option.name || ""}
                      name={"approval_item"}
                      disabled={approvalItemDisabled}
                      value={
                        approvalItem.find(
                          (option) =>
                            option.approval_item_id ===
                            (approvalSaveData &&
                              approvalSaveData["approval_item"])
                        ) || null
                      }
                      onChange={(e, value) =>
                        handleApprovalSaveData(
                          "approval_item",
                          value?.approval_item_id
                        )
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          className="selectHideHistory"
                          label={"Approval Item"}
                        />
                      )}
                    />
                    <Autocomplete
                      id=""
                      options={designationData}
                      getOptionLabel={(option) => option.designation_name || ""}
                      name={"approved_by"}
                      value={
                        designationData.find(
                          (option) =>
                            option.designation_id ===
                            (approvalSaveData &&
                              approvalSaveData["approved_by"])
                        ) || null
                      }
                      onChange={(e, value) =>
                        handleApprovalSaveData(
                          "approved_by",
                          value?.designation_id
                        )
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          className="selectHideHistory"
                          label={"Designation"}
                        />
                      )}
                    />
                    <LocalizationProvider
                      dateAdapter={AdapterDayjs}
                      sx={{ width: "100%" }}
                    >
                      <DemoContainer
                        components={["DatePicker"]}
                        sx={{ width: "100%" }}
                      >
                        <DatePicker
                          label="Approval Date"
                          value={
                            approvalSaveData["approval_date"]
                              ? dayjs(approvalSaveData["approval_date"])
                              : null
                          }
                          name="approval_date"
                          format="DD/MM/YYYY"
                          sx={{ width: "100%" }}
                          onChange={(newValue) => {
                            if (newValue && dayjs.isDayjs(newValue)) {
                              handleApprovalSaveData(
                                "approval_date",
                                newValue.toISOString()
                              );
                            } else {
                              handleApprovalSaveData("approval_date", null);
                            }
                          }}
                        />
                      </DemoContainer>
                    </LocalizationProvider>
                    <TextField
                      rows={8}
                      label={"Comments"}
                      sx={{ width: "100%" }}
                      name="remarks"
                      value={approvalSaveData["remarks"]}
                      onChange={(e) =>
                        handleApprovalSaveData("remarks", e.target.value)
                      }
                    />
                  </Box>
                )}
              </Box>
            </DialogContentText>
          </DialogContent>
        </Dialog>
      )} */}

        {listApproveTableFlag && (
              <Dialog
                open={listApproveTableFlag}
                onClose={() => setListApproveTableFlag(false)}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                fullScreen
                fullWidth
                sx={{ zIndex: "1", marginLeft: '50px' }}

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
                                        placeholder='Search anything'
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
                                            onClick={() => {
                                                setListApprovalSearchValue('');
                                                handleListApprovalClear();
                                            }}
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
                                  onHistory={() => getApprovalFieldLog("approval_item", listApprovalSaveData?.approval_id)}
                                  value={listApprovalSaveData?.approval_item}
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
       
                                {/* <DateField
                                  field={{
                                    heading: "Approval Date",
                                    name: "approval_date",
                                    label: "Approval Date",
                                    required: true,
                                    history: true,
                                    disableFutureDate: 'true',
                                    disabled: listApprovalItemDisabled,
                                  }}
                                  format="DD/MM/YYYY"
                                  formData={listApprovalSaveData}
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
  

                                  onHistory={() => {
                                    console.log("Show approval_date history");
                                  }}
                                  onFocus={() => {}}
                                  isFocused={false}
                                /> */}

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

                            headerDetails={selectedRowData?.["field_cid_crime_no./enquiry_no"]}
                        />
                    </FormControl>
                </DialogContentText>
            </DialogContent>
            <DialogActions sx={{ padding: '12px 24px' }}>
                <Button onClick={() => setFurtherInvestigationPtCase(false)}>Cancel</Button>
            </DialogActions>
        </Dialog>
    }

      {isDownloadPdf && (
        <GenerateProfilePdf
          is_print={isPrint}
          templateData={downloadPdfData}
          templateFields={downloadPdfFields}
          template_name={template_name}
          onSave={handleOnSavePdf}
        />
      )}

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

        {newApprovalPage &&
            <Dialog
                open={newApprovalPage}
                onClose={() => {setNewApprovalPage(false);setSingleApiData({});}}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                maxWidth="lg"
                fullWidth
                sx={{zIndex:'1'}}
            >
                <DialogTitle id="alert-dialog-title" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} >
                    <Box sx={{display: 'flex', alignItems: 'center', gap: '4px'}}>
                        Approval
                        {selectedRowData?.["field_cid_crime_no./enquiry_no"] && (
                            <Chip
                                label={selectedRowData["field_cid_crime_no./enquiry_no"]}
                                color="primary"
                                variant="outlined"
                                size="small"
                                sx={{ fontWeight: 500, marginTop: '2px' }}
                            />
                        )}
                    </Box>
                    <Box>
                        <Button variant="outlined" onClick={() => {saveOverallData(true)}}>Save</Button>
                        <IconButton
                            aria-label="close"
                            onClick={() => {setNewApprovalPage(false);setSingleApiData({});}}
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
    
                                    <Box>
                                    <label
                                      htmlFor="approval-item"
                                      style={{
                                        margin: "0",
                                        padding: 0, 
                                        fontSize: "16px",
                                        fontWeight: 500,
                                        color: "#475467",
                                        textTransform: "capitalize",
                                      }}
                                    >
                                      Approval Item
                                    </label>
                                    <Autocomplete
                                        id=""
                                        options={approvalItem}
                                        getOptionLabel={(option) => option.name || ''}
                                        name={'approval_item'}
                                        disabled={disabledApprovalItems}
                                        sx={{marginTop: '8px' }}
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
                                    </Box>
                                    <Box>
                                    <label
                                      htmlFor="designation"
                                      style={{
                                        margin: "0",
                                        padding: 0, 
                                        fontSize: "16px",
                                        fontWeight: 500,
                                        color: "#475467",
                                        textTransform: "capitalize",
                                      }}
                                    >
                                      Designation
                                    </label>
    
                                    <Autocomplete
                                        id=""
                                        options={designationData}
                                        getOptionLabel={(option) => option.designation_name || ''}
                                        name={'approved_by'}
                                        sx={{marginTop: '8px' }}
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
                                    </Box>
                                    <Box>
                                    <label
                                      htmlFor="approval-date"
                                      style={{
                                        margin: "0",
                                        padding: 0, 
                                        fontSize: "16px",
                                        fontWeight: 500,
                                        color: "#475467",
                                        textTransform: "capitalize",
                                      }}
                                    >
                                      Approval Date
                                    </label>

                                    <LocalizationProvider dateAdapter={AdapterDayjs} sx={{width:'100%'}}>
                                        <DemoContainer components={['DatePicker']} sx={{width:'100%'}}>
                                            <DatePicker 
                                                label="Approval Date" 
                                                value={singleApiData?.['approval']?.['approval_date'] ? dayjs(singleApiData?.['approval']?.['approval_date']) : null} 
                                                name="approval_date" 
                                                format="DD/MM/YYYY"
                                                sx={{width:'100%', marginTop: '8px' }}
                                                maxDate={dayjs()}
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
                                    </Box>
                                    <Box>
                                    <label
                                        htmlFor="designation"
                                        style={{
                                            margin: "0",
                                            padding: 0, 
                                            fontSize: "16px",
                                            fontWeight: 500,
                                            color: "#475467",
                                            textTransform: "capitalize",
                                        }}
                                    >
                                      Remarks
                                    </label>

                                    <TextField
                                        rows={8}
                                        label={'Comments'}
                                        sx={{width:'100%', marginTop: '8px' }}
                                        name="remarks"
                                        value={singleApiData?.['approval']?.['remarks']}
                                        onChange={(e)=>approvalNewDataSave('remarks', e.target.value)}
                                    />
                                    </Box>
                                </Box>
                            }
                        </Box>
                    </DialogContentText>
                </DialogContent>
            </Dialog>
        }

        {natureOfDisposalModal && (
            <Dialog
                open={natureOfDisposalModal}
                onClose={() => {setNatureOfDisposalModal(false);setNatureOfDisposalValue(null);}}
                aria-labelledby="nature-of-disposal-dialog-title"
                aria-describedby="nature-of-disposal-dialog-description"
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle id="nature-of-disposal-dialog-title">
                    <Box sx={{display: 'flex', alignItems: 'center', gap: '4px'}}>
                        Nature of Disposal
                        {selectedRowData?.["field_cid_crime_no./enquiry_no"] && (
                            <Chip
                                label={selectedRowData["field_cid_crime_no./enquiry_no"]}
                                color="primary"
                                variant="outlined"
                                size="small"
                                sx={{ fontWeight: 500, marginTop: '2px' }}
                            />
                        )}
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="nature-of-disposal-dialog-description">
                        <FormControl fullWidth>
                            <Autocomplete
                                options={[
                                    { name: "A Final Charge Sheet", code: "disposal" },
                                    { name: "A Preliminary Charge Sheet", code: "178_cases" },
                                    { name: "B Report", code: "b_Report" },
                                    { name: "C Report", code: "c_Report" },
                                ]}
                                getOptionLabel={(option) => option.name || ""}
                                value={natureOfDisposalValue || null}
                                onChange={(event, newValue) => setNatureOfDisposalValue(newValue)}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Select Nature of Disposal"
                                        className="selectHideHistory"
                                    />
                                )}
                            />
                            {
                               ( natureOfDisposalValue?.code === "disposal" || natureOfDisposalValue?.code === "178_cases") &&
                                <Box pt={2}>
                                    <FileInput
                                        field={{
                                            name : 'field_19_prosecution_sanction_done',
                                            required: true,
                                            label : '19 Prosecution sanction Done',
                                        }}
                                        formData={natureOfDisposalFileUpload}
                                        onChange={handleFileUploadChange}
                                    />
                                </Box>
                            }
                        </FormControl>
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => {setNatureOfDisposalModal(false);setNatureOfDisposalValue(null);}}>Cancel</Button>
                    <Button
                        className="fillPrimaryBtn"
                        onClick={()=>{
                            if (!natureOfDisposalValue) {
                                toast.error("Please fill the required value",{
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
                            if (natureOfDisposalValue?.code === "disposal") {
                                if(!natureOfDisposalFileUpload?.['field_19_prosecution_sanction_done'] || natureOfDisposalFileUpload?.['field_19_prosecution_sanction_done'].length === 0){
                                    toast.error("Please Fill 19 Prosecution Sanction Field ",{
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
                            }
                            showNewApprovalPage();
                        }}
                    >
                        Submit
                    </Button>
                </DialogActions>
            </Dialog>
        )}

        {moreThenTemplate && (
            <Dialog
                open={moreThenTemplate}
                onClose={() => setMoreThenTemplate(false)}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                maxWidth="xl"
                fullWidth
            >
                <DialogContent sx={{ minWidth: "400px", padding: '0'}}>
                    <DialogContentText id="alert-dialog-description">
                        <FormControl fullWidth>
                            <NormalViewForm
                                table_row_id={selectedRowData.id}
                                template_id={selectedRowData.id}
                                template_name={moreThenTemplateTemplateName}
                                table_name={moreThenTemplateTableName}
                                readOnly={false}
                                editData={false}
                                initialData={moreThenTemplateInitialData}
                                formConfig={moreThenTemplateTemplateFields}
                                stepperData={moreThenTemplateStepperData}
                                onSubmit={moreThenTemplateSaveFunc}
                                onError={moreThenTemplateErrorFunc}
                                closeForm={moreThenTemplateCloseFunc}
                                headerDetails={selectedRowData?.["field_cid_crime_no./enquiry_no"]}
                            />
                        </FormControl>
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ padding: "12px 24px" }}>
                    <Button onClick={()=>setMoreThenTemplate(false)}>
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>
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
    </Box>
  );
};

export default UnderInvestigation;