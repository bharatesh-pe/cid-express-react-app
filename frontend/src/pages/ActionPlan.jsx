import { use, useEffect, useRef, useState } from "react";
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
import SaveIcon from '@mui/icons-material/Save';
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

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import ImportExportIcon from '@mui/icons-material/ImportExport';

const ActionPlan = ({templateName, headerDetails, rowId, options, selectedRowData, backNavigation}) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { pageCount, systemStatus } = location.state || {};

    const [aoFields, setAoFields] = useState([]);
    const [aoFieldId,setAoFieldId] = useState(selectedRowData);
    const [filterAoValues, setFilterAoValues] = useState({});
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
    var userPermissions = JSON.parse(localStorage.getItem("user_permissions")) || [];

    const templateActionAddFlag = useRef(false);
    const fieldActionAddFlag = useRef(false);
    const attachmentEditFlag = useRef(false);

    const [showFileAttachment, setShowFileAttachments] = useState(false);

    const [showPtCaseModal, setShowPtCaseModal] = useState(false);
    const [ptCaseTableName, setPtCaseTableName] = useState(null);
    const [ptCaseTemplateName, setPtCaseTemplateName] = useState(null);

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
    const [isImmediateSupervisior, setIsImmediateSupervisior] = useState(false);

    const [showSubmitPFButton, setShowSubmitPFButton] = useState(false);
    // for pdf download
    const [isDownloadPdf, setIsDownloadPdf] = useState(false);
    const [downloadPdfFields, setDownloadPdfFields] = useState({});
    const [downloadPdfData, setDownloadPdfData] = useState([]);
    const [isPrint, setIsPrint] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);
        
        
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


    // const [isIoAuthorized, setIsIoAuthorized] = useState(true);
    const [exportableData, setExportableData] = useState([]);
    const [showExportPopup, setShowExportPopup] = useState(false);
    const [tabIndex, setTabIndex] = useState(0);

    //   new further investigation func states
    const [newApprovalPage, setNewApprovalPage] = useState(false);
    const [singleApiData, setSingleApiData] = useState({});
    const [disabledApprovalItems, setDisabledApprovalItems] = useState(false);

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
    

    const [saveNew, setSaveNew] = useState(null);
    const [saveNewAction, setSaveNewAction] = useState(null);

    const showNatureOfDisposal = (selectedRow) => {
        setNatureOfDisposalValue(null);
        setNatureOfDisposalModal(true);
    };

    const showOrderCopyCourt =  (selectedRow, tableName, approved)=> {
        setApprovedByCourt(approved);
        setShowOrderCopy(true);
        showNewApprovalPage("B Report");
    }
    
    const handleOtherPagination = (page) => {
        setOtherTemplatesPaginationCount(page)
    }

    // on save approval modal

    const [showApprovalModal, setShowApprovalModal] = useState(false);
    const [approvalItemsData, setApprovalItemsData] = useState([]);
    const [readonlyApprovalItems, setReadonlyApprovalItems] = useState(false);
    const [approvalDesignationData, setApprovalDesignationData] = useState([]);
    const [approvalFormData, setApprovalFormData] = useState({});
    const [approvalSaveCaseData, setApprovalSaveCaseData] = useState({});
            
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

    const [sysStatus, setSysSattus] = useState(systemStatus ? systemStatus : "ui_case");

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
    const [hasPdfEntry, setHasPdfEntry] = useState(false);
    const [hoverTableOptions, setHoverTableOptions] = useState([]);
    const [otherTablePagination, setOtherTablePagination] = useState(1);

    // for actions

    const [selectedRow, setSelectedRow] = useState(selectedRowData);
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

    const hoverTableOptionsRef = useRef([]);

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
          let aoOnlyFields = response.data.fields.filter(
            (field) =>
              field.ao_field === true &&
              field.hide_from_ux === false &&
              field.name !== "field_act" &&
              field.name !== "field_section"
          );
    
          const briefFactField = response.data.fields.find((f) => f.name === "field_breif_fact");
          const policeStationField = response.data.fields.find((f) => f.name === "field_investigation_carried_out_by_the_police_station");
    
          if (briefFactField && !aoOnlyFields.includes(briefFactField)) aoOnlyFields.push(briefFactField);
          if (policeStationField && !aoOnlyFields.includes(policeStationField)) aoOnlyFields.push(policeStationField);
    
          for (const field of aoOnlyFields) {
            if (field && field.api) {
              const payloadApi = field.api;
              const apiPayload = {}; // Define this as needed
    
              try {
                const res = await api.post(payloadApi, apiPayload);
                if (!res.data) continue;
    
                const updatedOptions = res.data.map((item) => {
                    const nameKey = Object.keys(item).find((key) => !["id", "created_at", "updated_at"].includes(key));
                    var headerName = nameKey;
                    var headerId = 'id';
    
                    if(field.table === "users"){
                        headerName = "name"
                        headerId =  "user_id"
                    }else if(field.api !== "/templateData/getTemplateData"){
                        headerName = field.table + "_name"
                        headerId =  field.table + "_id"
                    }
    
                    return {
                        name: item[headerName],
                        code: item[headerId],
                    };
                });
    
                field.options = updatedOptions;
              } catch (err) {
                console.error(`Error loading options for field ${field.name}`, err);
              }
            }
          }
    
          setAoFields(aoOnlyFields);
          loadValueField(aoFieldId, false, "cid_under_investigation");
        }
      } catch (error) {
        toast.error("Failed to load AO fields", {
          position: "top-right",
          autoClose: 3000,
          className: "toast-error",
        });
      } finally {
        setLoading(false);
      }
    };
    
    useEffect(() => {
          loadAOFields();
    }, [selectedOtherTemplate,aoFieldId]);

    useEffect(()=>{
        handleOtherTemplateActions(selectedOtherTemplate, selectedRowData)
    },[otherTemplatesPaginationCount]);

    

    const onSaveTemplateError = (error) => {
        setIsValid(false);
    };

    const handleOtherTemplateActions = async (options, selectedRow, searchFlag,fromUploadedFiles) => {

        const randomId = `random_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        var disabledEditFlag = false;
        var disabledDeleteFlag = false;  
        setRandomApprovalId(randomId);

        console.log(selectedRow);
        var getTemplatePayload = {
            table_name: options.table,
            ui_case_id: selectedRow.id,
            case_io_id: selectedRow.field_io_name || "",
            pt_case_id: selectedRow?.pt_case_id || null,
            limit : 10,
            page : !searchFlag ? otherTemplatesPaginationCount : 1,
            search: !searchFlag ? otherSearchValue : "",        
            from_date: !searchFlag ? othersFromDate : null,
            to_date: !searchFlag ? othersToDate : null,
            filter: !searchFlag ? othersFilterData : {},
        };

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

                    if(records && records.length > 0)
                    {
                        const allAPWithSameSupervisor = records.every(
                            record =>
                            record.field_submit_status === "" || record.field_submit_status === null &&
                            record.supervisior_designation_id == userDesigId
                        );
                        
                        const allAPWithOutIOSubmit = records.every(
                            record =>
                            record.sys_status === "ui_case" &&
                            record.field_submit_status === "" || record.field_submit_status === null &&
                            record.supervisior_designation_id != userDesigId
                        );
                        
                        if (allAPWithSameSupervisor || allAPWithOutIOSubmit) {
                            anySubmitAP = false;
                        }
            
                        if(allAPWithSameSupervisor)
                            isSuperivisor = true;

                        APisSubmited = records.every(
                            record =>
                            record.sys_status === "ui_case" ||
                            record.sys_status === "IO" &&
                            record.field_submit_status === "" || record.field_submit_status === null &&
                            record.supervisior_designation_id != userDesigId
                        );
                    }

                    setShowSubmitAPButton(anySubmitAP);
                    setIsImmediateSupervisior(isSuperivisor);
                    setAPIsSubmited(APisSubmited);
                    
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

                    
                        const updatedHeader = ([                   
                            ...Object.keys(getTemplateResponse.data[0]).filter(
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
                                ).map((key) => {
                                    var updatedKeyName = key.replace(/^field_/, "").replace(/_/g, " ").toLowerCase().replace(/^\w|\s\w/g, (c) => c.toUpperCase());

                                    return {
                                        field: key,
                                        headerName: updatedKeyName ? updatedKeyName : "",
                                        width: 250,
                                        resizable: true,
                                        cellClassName: (params) => getCellClassName(key, params, 'cid_ui_case_action_plan'),
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
                                {
                                    field: "",
                                    headerName: "Action",
                                    width: 300,
                                    cellClassName: (params) => getCellClassName("sl_no", params, options.table),
                                    renderCell: (params) => {
                                    
                                        const userPermissions = JSON.parse(localStorage.getItem("user_permissions")) || [];
                                        const canEdit = userPermissions[0]?.action_edit;
                                        const canDelete = userPermissions[0]?.action_delete;
                                        const isViewAction = options.is_view_action === true
                                        var isActionPlan = false;

                                        if(params.row.sys_status === 'IO' && params.row.supervisior_designation_id != localStorage.getItem('designation_id'))
                                        {
                                            isActionPlan =true;
                                        }
                                        else if((params.row.sys_status === 'IO' || params.row.sys_status === 'ui_case') && params.row.field_submit_status === '' && params.row.supervisior_designation_id == localStorage.getItem('designation_id'))
                                        {
                                            isActionPlan =false;
                                        }
                                        else if(params.row.field_submit_status === 'submit' || params.row.sys_status === 'IO' )
                                        {
                                            isActionPlan =true;
                                        }
                                        
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
                                                        handleOthersTemplateDataView(params.row, false, 'cid_ui_case_action_plan');
                                                    }}
                                                >
                                                    View
                                                </Button>
                                    
                                                {canEdit&& ( !isActionPlan && ( !isViewAction && (
                                                    <Button
                                                        variant="contained"
                                                        color="primary"
                                                        onClick={async (event) => {
                                                        event.stopPropagation();
                                                        setIsFromEdit(true);
                                                        setSelectedApprovalEdit(params.row);
                                                        if (options.is_approval) {
                                                            // await showApprovalPage(params.row, options);
                                                        } else {
                                                            handleOthersTemplateDataView(params.row, true, options.table);
                                                        }
                                                        }}
                                                    
                                                    >
                                                        Edit
                                                    </Button>
                                                )))}

                                                {canDelete&& ( !isActionPlan && ( !isViewAction && ( !isChildMergedLoading && (
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
                                                ))))}
                                            </Box>
                                        );
                                    },
                                }                
                        ]).filter(Boolean);

                        setOtherTemplateColumn(updatedHeader);
                        setOtherTemplateModalOpen(true);
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

    const closeOtherForm = ()=>{
        setOtherFormOpen(false)
        setShowPtCaseModal(false);
        if(selectedOtherTemplate?.table === "cid_ui_case_action_plan"){
            handleOtherTemplateActions(selectedOtherTemplate, selectedRowData)
        }
    }


    const getCellClassName = (key, params, table) => {
        // Example condition: unread rows for a specific table
        // if (table === "cid_ui_case_progress_report" && !params?.row?.ReadStatus) {
        //     return "unreadBackground";
        // }
    
        // Add more logic if needed based on `key` or `params`
        return "";
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
    
            onClickHandler = (event) => {event.stopPropagation();handleTemplateDataView(params.row, false, tableName, hoverTableOptions)};
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

    function createSvgIcon(svgString) {
        return () => (
        <span
            dangerouslySetInnerHTML={{ __html: svgString }}
            className="tableActionIcon"
        />
        );
    }

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

        // showApprovalAddPage(Options);
        // setApprovalsData(updatedOptions);
        // setApprovalItem(getActionsDetails.data["approval_item"]);
        // setDesignationData(getActionsDetails.data["designation"]);

        // setApproveTableFlag(true);

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
                                headerDetails: rowData?.["field_cid_crime_no./enquiry_no"] || null,
                                backNavigation: "/case/ui_case",
                                paginationCount: paginationCount,
                                sysStatus: sysStatus,
                                rowData: viewTemplateData?.["data"] || {},
                                tableFields: viewTemplateResponse?.["data"]?.["fields"] || [],
                                stepperData: viewTemplateResponse?.["data"]?.no_of_sections > 0 && viewTemplateResponse?.["data"]?.sections ? viewTemplateResponse?.["data"].sections : [],
                                template_id : viewTemplateResponse?.["data"]?.template_id,
                                template_name : viewTemplateResponse?.["data"]?.template_name,
                                table_name: table_name
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
                        "ui_case_id", "pt_case_id", "sys_status", "task_unread_count" , "field_cid_crime_no./enquiry_no", "field_io_name","field_io_name_id"
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
                        {
                            field: "field_io_name",
                            headerName: "Assign To IO",
                            width: 200,
                            resizable: true,
                            cellClassName: 'justify-content-start',
                            renderHeader: (params) => (
                                tableHeaderRender(params, "field_io_name")
                            ),
                            renderCell: renderCellFunc("field_io_name", 0),
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
                        "ui_case_id", "pt_case_id", "sys_status", "task_unread_count" , "field_cid_crime_no./enquiry_no","field_io_name" , "field_io_name_id"
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
                            renderCell: renderCellFunc("field_io_name", ),
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

    const handleOtherClear = ()=>{
        setOtherSearchValue('');
        setOtherTemplatesPaginationCount(1);
        setOthersFromDate(null);
        setOthersToDate(null);
        setOthersFiltersDropdown([]);
        setOthersFilterData({});
        handleOtherTemplateActions(selectedOtherTemplate, selectedRowData, true)
    }

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
    
        if (isLoading) {
            setIsChildMergedLoading(true);
        }
    
        setListApprovalsColumn((prev) => {
            const withoutActions = prev.filter((col) => col.field !== "actions");
            return [...withoutActions, listApprovalActionColumn];
        });

        setListApprovalCaseData(rowData);

        showApprovalListPage(rowData)
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
            "created_at", "updated_at", "deleted_at", "attachments", "task_unread_count", "id", "field_cid_crime_no./enquiry_no", "field_io_name" ,"field_io_name_id"
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
          {
            field: "field_io_name",
            headerName: "Assign To IO",
            width: 200,
            resizable: true,
            cellClassName: 'justify-content-start',
            renderHeader: (params) => (
                tableHeaderRender(params, "field_io_name")
            ),
            renderCell: renderCellFunc("field_io_name", 0),
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
    
                    var extraActions = [
                        {
                            name: "Crime Investigation",
                            caseView : true,
                            viewAction : true
                        },
                        ...(sysStatus !== "b_Report" ? updatedActions : []),
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
                            sysStatus !== "b_Report" && sysStatus !== 'merge_cases' && sysStatus !== 'disposal' ?{
                                name: "Nature of Disposal",
                                onclick: (selectedRow) => showNatureOfDisposal(selectedRow, table_name),
                            } : null,
                            sysStatus === "b_Report" ?
                            {
                                name: "Accepted By Court",
                                onclick: (selectedRow) => showOrderCopyCourt(selectedRow, table_name, true),
                            } : null,
                            sysStatus === "b_Report" ? 
                            {
                                name: "Rejected By Court",
                                onclick: (selectedRow) => showOrderCopyCourt(selectedRow, table_name, false),
                            } : null,
                        userPermissions?.delete_case
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
        
                    setHoverTableOptions(extraActions);
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

    const getIoUsers = async () => {
        const res = await api.post("cidMaster/getIoUsers");
        return res?.data || [];
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
                    showNewApprovalPage();
                } else {
                    console.log("sys status updation canceled.");
                }
            });
        }
    };
    
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
        var result ;
        if(isImmediateSupervisior)
        {
            result = await Swal.fire({
              title: 'Are you sure?',
              text: "Do you want to submit this Action Plan? Once submitted, you won't be able to Update the record. It will be move to the Progress Report.",
              icon: 'question',
              showCancelButton: true,
              confirmButtonText: 'Yes, submit it!',
              cancelButtonText: 'Cancel',
            });
        }
        else
        {
            result = await Swal.fire({
                title: 'Are you sure?',
                text: "Do you want to submit this Action Plan? Once submitted, you won't be able to Update the record.",
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Yes, submit it!',
                cancelButtonText: 'Cancel',
              });
        }
      
        if (result.isConfirmed) {
          const payload = {
            transaction_id: `submitap_${Math.floor(Math.random() * 1000000)}`,
            ui_case_id: id,
            isSupervisior : isImmediateSupervisior
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

    const otherAPPRTemplateSaveFunc = async (data, saveNewAction) => {
    
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
        
        console.log("isImmediateSupervisior",isImmediateSupervisior);
        normalData.sys_status = selectedOtherTemplate.table === "cid_ui_case_property_form" ? "PF" : isImmediateSupervisior ? "IO" : "ui_case";
        normalData.field_submit_status = "";
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
            if(saveNewAction){
              await handleOtherTemplateActions(selectedOtherTemplate, selectedRowData);   
              showOptionTemplate(selectedOtherTemplate.table);
            }else{
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
    
    const otherTemplateSaveFunc = async (data, saveNewAction) => {
    
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
                });
    
                if (sysStatus === "merge_cases") {
                  loadMergedCasesData(paginationCount);
                }else if(saveNewAction){
                  await handleOtherTemplateActions(selectedOtherTemplate, selectedRow);   
                  showOptionTemplate(selectedOtherTemplate.table);
                }else{
                  handleOtherTemplateActions(selectedOtherTemplate, selectedRow);
                }
    
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
                    selectedOtherTemplate?.table === "cid_ui_case_action_plan" ||selectedOtherTemplate?.table === "cid_ui_case_property_form"
                    ? otherAPPRTemplateSaveFunc
                    : otherTemplateSaveFunc 
                }
                onUpdate={otherTemplateUpdateFunc}
                    disableEditButton={
                    (selectedOtherTemplate.table === "cid_ui_case_action_plan") ||
                    (selectedOtherTemplate.table === "cid_ui_case_property_form")
                }
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

    return (
        <>
            <Box
                sx={{
                    width: '100%',
                    p: 2,
                    bgcolor: 'background.paper',
                    borderRadius: 2,
                    boxShadow: 2,
                    zIndex: 1,
                }}
            >
                {/* Header Section */}
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "start",
                        justifyContent: "space-between",
                        mb: 2
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

                        {APIsSubmited && (
                            <Box className="notifyAtTopCaseStyle">
                                Submission request in progress. Awaiting SP approval.
                            </Box>
                        )}
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

                            {!viewModeOnly && !showSubmitAPButton && templateActionAddFlag.current === true && (
                                <Button
                                    variant="outlined"
                                    sx={{ height: '40px' }}
                                    onClick={() => showOptionTemplate(selectedOtherTemplate?.table)}
                                >
                                    Add
                                </Button>
                            )}
                            {!showSubmitAPButton && (
                                <Button
                                    variant="contained"
                                    color="success"
                                    onClick={() => handleSubmitAp({ id: selectedRowData?.id })}
                                    disabled={otherTemplatesTotalRecord === 0}
                                >
                                    Submit
                                </Button>
                            )}
                        </Box>
                    </Box>
                </Box>

                {/* AO Fields & Table Section */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                    {aoFields.length > 0 ? (
                        <Grid container spacing={2}>
                            {aoFields.slice(0, 6).map((field, index) => (
                                <Grid item xs={12} md={4} key={index}>
                                    {field.type === 'text' && (
                                        <ShortText key={field.id} field={field} formData={filterAoValues} disabled />
                                    )}
                                    {field.type === 'multidropdown' && (
                                        <MultiSelect
                                            key={field.id}
                                            field={field}
                                            formData={filterAoValues}
                                            onChange={(name, selectedCode) => handleAutocomplete(field, selectedCode)}
                                            disabled
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
                                                return field.options.find(opt => String(opt.code) === String(fieldValue)) || null;
                                            })()}
                                            disabled
                                        />
                                    )}
                                </Grid>
                            ))}

                            {/* Text Areas */}
                            <Grid container item xs={12} spacing={2} alignItems="flex-start">
                                {aoFields
                                    .slice(4)
                                    .filter(f => f.type === 'textarea')
                                    .map((field, index) => (
                                        <Grid item xs={6} key={index}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                <Typography sx={{ fontWeight: 'bold', color: 'black', mr: 1 }}>
                                                    {field.label}
                                                </Typography>
                                                <Tooltip title="Save">
                                                    <SaveIcon
                                                        onClick={() => onActionPlanUpdate("cid_under_investigation", filterAoValues)}
                                                        sx={{
                                                            color: '#1570EF',
                                                            p: '0 1px',
                                                            fontSize: '25px',
                                                            cursor: 'pointer',
                                                            mb: '2px'
                                                        }}
                                                    />
                                                </Tooltip>
                                            </Box>
                                            <TextField
                                                fullWidth
                                                multiline
                                                minRows={10}
                                                maxRows={10}
                                                variant="outlined"
                                                value={filterAoValues[field.name] || ""}
                                                onChange={(e) =>
                                                    setFilterAoValues(prev => ({
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
        </>
    );    
};


export default ActionPlan;