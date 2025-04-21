import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DynamicForm from '../components/dynamic-form/DynamicForm';
import NormalViewForm from '../components/dynamic-form/NormalViewForm';
import TableView from "../components/table-view/TableView";
import api from '../services/api';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from "dayjs";
import { Box, Button, FormControl, InputAdornment, Typography, IconButton, Checkbox, Grid, Autocomplete, TextField} from "@mui/material";
import TextFieldInput from '@mui/material/TextField';
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import pdfIcon from '../Images/pdfIcon.svg'
import docIcon from '../Images/docIcon.svg'
import xlsIcon from '../Images/xlsIcon.svg'
import pptIcon from '../Images/pptIcon.svg'
import jpgIcon from '../Images/jpgIcon.svg'
import pngIcon from '../Images/pngIcon.svg'
import CloseIcon from '@mui/icons-material/Close';
import { CircularProgress } from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import eyes from "../Images/eye.svg"
import edit from "../Images/tableEdit.svg";
import trash from "../Images/tableTrash.svg";
import ApprovalModal from '../components/dynamic-form/ApprovalModalForm';

const GovernmentOrder = () => {
    const location = useLocation();
    const navigate = useNavigate();
    // on save approval modal

    const [showApprovalModal, setShowApprovalModal] = useState(false);
    const [approvalItemsData, setApprovalItemsData] = useState([]);
    const [readonlyApprovalItems, setReadonlyApprovalItems] = useState(false);
    const [approvalDesignationData, setApprovalDesignationData] = useState([]);
    const [approvalFormData, setApprovalFormData] = useState({});
    const [approvalSaveCaseData, setApprovalSaveCaseData] = useState({});

    const [showOptionModal, setShowOptionModal] = useState(false)
    const [paginationCount, setPaginationCount] = useState(1);
    const [tableSortOption, settableSortOption] = useState('DESC');
    const [tableSortKey, setTableSortKey] = useState('');
    const [tableData, setTableData] = useState([]);
    const [isValid, setIsValid] = useState(false);
    const [searchValue, setSearchValue] = useState(null);
    const [linkLeader, setLinkLeader] = useState(false)
    const [linkOrganization, setLinkOrganization] = useState(false)
    const [template_name, setTemplate_name] = useState('')
    const [table_name, setTable_name] = useState('')
    const [stepperData, setstepperData] = useState([]);
    const [formOpen, setFormOpen] = useState(false);
    const [formTemplateData, setFormTemplateData] = useState([])
    const [initialData, setInitialData] = useState({});
    const [viewReadonly, setviewReadonly] = useState(false);
    const [editTemplateData, setEditTemplateData] = useState(false);
    const [selectedRowId, setSelectedRowId] = useState(null);
    const [selectedTemplateId, setSelectedTemplateId] = useState(null);
    const [otherFormOpen, setOtherFormOpen] = useState(false);
    const [optionStepperData, setOptionStepperData] = useState([]);
    const [optionFormTemplateData, setOptionFormTemplateData] = useState([])
    const [showDownloadModal, setShowDownloadModal] = useState(false);
    const [showDownloadData, setShowDownloadData] = useState([]);
    const [showSelectedDownloadData, setShowSelectedDownloadData] = useState({});
    const [showAttachmentModal, setShowAttachmentModal] = useState(false);
    const [showAttachmentKey, setShowAttachmentKey] = useState(null);
    const [showAttachmentData, setShowAttachmentData] = useState([]);
    const [starFlag, setStarFlag] = useState(null);
    const [readFlag, setReadFlag] = useState(null);
    const [loading, setLoading] = useState(false);
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
    const [selectedRow, setSelectedRow] = useState({});
    const [templateApproval, setTemplateApproval] = useState(false);
    const [selectedOtherFields, setSelectedOtherFields] = useState(null);
    const [selectKey, setSelectKey] = useState(null);
    const [isApprovalItemDisabled, setIsApprovalItemDisabled] = useState(false);


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
                        <Button variant="outlined" onClick={(event) => { event.stopPropagation(); handleTemplateDataView(params.row, false, table_name); }}>
                            View
                        </Button>
                        <Button variant="contained" color="primary" onClick={(event) => { event.stopPropagation(); handleTemplateDataView(params.row, true, table_name); }}>
                            Edit
                        </Button>
                        <Button variant="contained" color="error" onClick={(event) => { event.stopPropagation(); handleDeleteTemplateData(params.row, table_name); }}>
                            Delete
                        </Button>
                    </Box>
                );
            }
        }
    ]);

    const [otherTemplateModalOpen, setOtherTemplateModalOpen] = useState(false);
    const [selectedOtherTemplate, setselectedOtherTemplate] = useState({});
    const [otherTemplateData, setOtherTemplateData] = useState([]);
    const [otherInitialTemplateData, setOtherInitialTemplateData] = useState([]);
    const [otherReadOnlyTemplateData, setOtherReadOnlyTemplateData] = useState(false);
    const [otherEditTemplateData, setOtherEditTemplateData] = useState(false);
    const [otherRowId, setOtherRowId] = useState(null);
    const [otherTemplateId, setOtherTemplateId] = useState(null);
    const [otherTemplateColumn, setOtherTemplateColumn] = useState(
        [
            { field: 'sl_no', headerName: 'S.No' }
        ]
    );
    const [otherTablePagination, setOtherTablePagination] = useState(1)
    const [pendingUpdateData, setPendingUpdateData] = useState(null);
    const [pendingSaveData, setPendingSaveData] = useState(null);
    const [pendingDeleteData, setPendingDeleteData] = useState(null);
    const [approvalPurpose, setApprovalPurpose] = useState(null);
    
    const handleTemplateDataView = async (rowData, editData, table_name) => {

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

      const showApprovalPage = async (approveData) => {
        setSelectedRow(approveData);
        setFormOpen(false);
        var payloadObj = {
            case_id: approveData.id,
            approval_type: "gn_order",
        };

        setLoading(true);
    
        try {
          const getActionsDetails = await api.post("/ui_approval/get_ui_case_approvals", payloadObj);
    
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
    
            setApprovalsData(updatedOptions);
            setApprovalItem(getActionsDetails.data["approval_item"]);
            setDesignationData(getActionsDetails.data["designation"]);
    
            setAddApproveFlag(false);
            setApproveTableFlag(true);
    
            const randomId = `approval_${Date.now()}_${Math.floor(
              Math.random() * 1000
            )}`;
            setRandomApprovalId(randomId);
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
              error.response+["data"].message
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
    
      const showApprovalAddPage = (table) => {
        setAddApproveFlag(true);
        handleApprovalSaveData(
          "approval_item",
          Number(selectedOtherTemplate?.approval_items)
        );
      };
    
      const saveApprovalData = async (table) => {
        if (!approvalSaveData || !approvalSaveData["approval_item"]) {
            const defaultItem = approvalItem.find(
              (item) => (item.name || "").toLowerCase() === "government order"
            );
          
            if (defaultItem) {
              approvalSaveData["approval_item"] = defaultItem.approval_item_id;
            } else {
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
      
        var created_by_designation_id = localStorage.getItem("designation_id") || "";
        var created_by_division_id = localStorage.getItem("division_id") || "";
      
        var actionType = approvalPurpose === "delete" ? "Delete Government Order" : "Edit Government Order";
      
        var payloadApproveData = {
          ...approvalSaveData,
          case_id: selectedRow.id,
          case_type: "gn_order",
          module: "Government Order",
          action: actionType,
          transaction_id: randomApprovalId,
          created_by_designation_id,
          created_by_division_id,
          info: {
            module: "Government Order",
          },
        };
      
        setLoading(true);
      
        try {
          const chnageSysStatus = await api.post( "/ui_approval/create_ui_case_approval", payloadApproveData);
            
          if (chnageSysStatus && chnageSysStatus.success) {
            toast.success(
            "Approval Added Successfully",
              {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                className: "toast-success",
                onClose: () => {
                  setApproveTableFlag(false);
                  setAddApproveFlag(false);
                }
              }
            );
      
            if (approvalPurpose === "delete" && pendingDeleteData) {
              const { rowData, table_name } = pendingDeleteData;
              const deletePayload = {
                table_name,
                where: { id: rowData.id },
              };
      
              try {
                const deleteRes = await api.post("templateData/deleteTemplateData", deletePayload);
      
                if (deleteRes.success) {
                  toast.success(deleteRes.message || "Template Deleted Successfully", {
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
                        setApprovalSaveData({});
                        setApproveTableFlag(false);
                    }                  
                });
                } else {
                  toast.error(deleteRes.message || "Failed to delete the template.");
                }
              } catch (err) {
                setLoading(false);
                toast.error(err?.response?.data?.message || "Error deleting template.");
              }
      
              setPendingDeleteData(null);
              setApprovalPurpose(null);
            }
      
            if (pendingUpdateData && approvalPurpose !== "delete") {
                setApproveTableFlag(false);
                onUpdateTemplateData(pendingUpdateData);
            }
      
            // if (pendingSaveData) {
            //   onSaveTemplateData(pendingSaveData);
            // }
      
            var combinedData = {
              id: selectedRow.id,
              [selectKey.name]: selectedOtherFields.code,
            };
            
            setSelectKey(null);
            setSelectedRow(null);
            setselectedOtherTemplate(null);
            setApprovalsData([]);
            setApprovalItem([]);
            setDesignationData([]);
            setApprovalSaveData({});
            setAddApproveFlag(false);
            setApproveTableFlag(false);
          } else {
            const errorMessage = chnageSysStatus.message || "Failed to add approval. Please try again.";
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
              error.response["data"].message || "Please Try Again !",
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
         
      
        const showCaseApprovalPage = async (caseData, formData)=>{
        
                setLoading(true);
        
                try {
        
                    const getActionsDetails = await api.post("/ui_approval/get_ui_case_approvals");
        
                    setLoading(false);
        
                    if (getActionsDetails && getActionsDetails.success) {
        
                        setApprovalItemsData(getActionsDetails.data['approval_item']);
                        setApprovalDesignationData(getActionsDetails.data['designation']);
        
                        var getFurtherInvestigationItems = getActionsDetails.data['approval_item'].filter((data)=>{
                            if((data.name).toLowerCase() === 'government order'){
                                return data;
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
        
            const handleApprovalWithSave = async () => {
                if (!approvalFormData?.approval_item) {
                    toast.error("Please Select Approval Item !");
                    return;
                }
            
                if (!approvalFormData?.approved_by) {
                    toast.error("Please Select Designation !");
                    return;
                }
            
                if (!approvalFormData?.approval_date) {
                    toast.error("Please Select Approval Date !");
                    return;
                }
            
                if (!approvalFormData?.remarks) {
                    toast.error("Please Enter Comments !");
                    return;
                }
            
                const formData = new FormData();
            
                const approvalDetails = {
                    module_name: "Government Order",
                    action: "Create Government Order",
                };
            
                const sysStatus = {
                    id: approvalSaveCaseData?.caseData?.id || null,
                    sys_status: approvalSaveCaseData?.caseData?.sys_status || "Create Government Order",
                    default_status: "gn_order",
                };
            
                const approvalPayload = {
                    approval: approvalFormData,
                    approval_details: approvalDetails,
                    others_table_name: table_name,
                    sys_status: sysStatus,
                };
            
                for (let [key, value] of approvalSaveCaseData.formData.entries()) {
                    formData.append(key, value);
                }
            
                formData.append("data", JSON.stringify(approvalSaveCaseData.caseData));
                formData.append("others_data", JSON.stringify(approvalPayload));
            
                const transactionId = `gn_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
                formData.append("transaction_id", transactionId);
                formData.append("user_designation_id", localStorage.getItem("designation_id") || null);
            
                setLoading(true);
            
                try {
                    const response = await api.post("/templateData/saveDataWithApprovalToTemplates", formData);
                    setLoading(false);
            
                    console.log("response", response);
                    if (response?.success) {
                        toast.success(response.message || "Data Created Successfully", {
                            position: "top-right",
                            autoClose: 3000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                            progress: undefined,
                            className: "toast-success",
                        });
                        setShowApprovalModal(false);
                        setApprovalSaveCaseData({});
                        setApprovalItemsData([]);
                        setApprovalFormData({});
                        setApprovalDesignationData([]);
                        loadTableData(paginationCount);
                    } else {
                        toast.error(response?.message || 'Failed to change the status. Please try again !', {
                            position: "top-right",
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
                    toast.error(error?.response?.message || 'Please Try Again !', {
                        position: "top-right",
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
                              

    useEffect(() => {
        loadTableData(paginationCount);

    }, [paginationCount, tableSortKey, tableSortOption, starFlag, readFlag])

    const loadTableData = async (page, searchValue) => {

        var getTemplatePayload = {
            "page": page,
            "limit": 10,
            "sort_by": tableSortKey,
            "order": tableSortOption,
            "search": searchValue ? searchValue : '',
            "table_name": table_name,
            "is_starred": starFlag,
            "is_read": readFlag,
            "template_module": "governmentorder"
        }
        
        setLoading(true);

        try {
            const getTemplateResponse = await api.post("/templateData/paginateTemplateDataForOtherThanMaster", getTemplatePayload);
            setLoading(false);

            if (getTemplateResponse && getTemplateResponse.success) {
                if (getTemplateResponse.data && getTemplateResponse.data['data']) {

                    if(getTemplateResponse.data['data'][0]){
                        var excludedKeys = ["created_at", "updated_at", "id", "deleted_at", "attachments", "Starred", "ReadStatus", "linked_profile_info", "ui_case_id", "pt_case_id","task_unread_count"];

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
                            ...Object.keys(getTemplateResponse.data['data'][0])
                            .filter((key) => !excludedKeys.includes(key) && key !== 'created_by') // Exclude 'created_by'
                                .map((key) => {
                                    var updatedKeyName = key.replace(/^field_/, "").replace(/_/g, " ").toLowerCase().replace(/^\w|\s\w/g, (c) => c.toUpperCase())

                                    return {
                                        field: key,
                                        headerName: updatedKeyName ? updatedKeyName : '',
                                        width: 250,
                                        resizable: true,
                                        renderHeader: () => (
                                            <div onClick={() => ApplySortTable(key)} style={{ display: "flex", alignItems: "center", justifyContent: 'space-between', width: '100%' }}>
                                                <span style={{ color: '#1D2939', fontSize: '15px', fontWeight: '500' }}>{updatedKeyName ? updatedKeyName : ''}</span>
                                            </div>
                                        ),
                                        renderCell: (params) => {
                                            return tableCellRender(key, params, params.value)
                                        },
                                    };
                                }),
                            {
                                field: '',
                                headerName: 'Action',
                                resizable: false,
                                width: 350,
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
                                            onClick={(event) => { event.stopPropagation(); handleTemplateDataView(params.row, false, getTemplateResponse.data['meta'].table_name ? getTemplateResponse.data['meta'].table_name : '' ); }}                                                                >
                                            <img src={eyes} alt="View" style={{ width: "20px", height: "20px" }}/> <span>View</span>
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
                                            onClick={(event) => { event.stopPropagation(); handleTemplateDataView(params.row, true, getTemplateResponse.data['meta'].table_name ? getTemplateResponse.data['meta'].table_name : '' ); }}                                                                >
                                            <img src={edit} alt="Edit" style={{ width: "20px", height: "20px" }}/> <span>Edit</span>
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
                                            onClick={(event) => { event.stopPropagation(); handleDeleteTemplateData(params.row, getTemplateResponse.data['meta'].table_name ? getTemplateResponse.data['meta'].table_name : '' ); }}                                                                    >
                                            <img src={trash} alt="Delete" style={{ width: "20px", height: "20px" }} /> <span>Delete</span>
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

                        const formatDate = (fieldValue) => {
                            if (!fieldValue || typeof fieldValue !== "string") return fieldValue;

                            var dateValue = new Date(fieldValue);

                            if (isNaN(dateValue.getTime()) || !fieldValue.includes("-") && !fieldValue.includes("/")) {
                                return fieldValue;
                            }

                            if (isNaN(dateValue.getTime())) return fieldValue;

                            var dayValue = String(dateValue.getDate()).padStart(2, "0");
                            var monthValue = String(dateValue.getMonth() + 1).padStart(2, "0");
                            var yearValue = dateValue.getFullYear();
                            return `${dayValue}/${monthValue}/${yearValue}`;
                        };

                        const updatedField = {};

                        Object.keys(field).forEach((key) => {
                            if (field[key] && key !== 'id' && !isNaN(new Date(field[key]).getTime())) {
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
                    setviewReadonly(false);
                    setEditTemplateData(false);
                    setInitialData({});
                    setFormOpen(false)
                }

                if(getTemplateResponse.data && getTemplateResponse.data['meta']){
                    if(getTemplateResponse.data['meta'].table_name && getTemplateResponse.data['meta'].template_name){
                        setTemplate_name(getTemplateResponse.data['meta'].template_name);
                        setTable_name(getTemplateResponse.data['meta'].table_name);
                    }
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
                                template_name: template_name,
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

    const handleDeleteTemplateData = (rowData, table_name) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "Do you want to delete this profile?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, Delete it!',
            cancelButtonText: 'No',
        }).then((result) => {
            if (result.isConfirmed) {
                setApprovalPurpose("delete");
                setPendingDeleteData({ rowData, table_name });
                showApprovalPage(rowData);
            } else {
                console.log("Template deletion canceled.");
            }
        });
    };
    
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


    const showOptionTemplate = async (table_name) => {
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

                setOtherFormOpen(true);
                setInitialData({});
                setviewReadonly(false);
                setEditTemplateData(false);
                setOptionFormTemplateData(viewTemplateResponse.data['fields'] ? viewTemplateResponse.data['fields'] : []);
                if (viewTemplateResponse.data.no_of_sections && viewTemplateResponse.data.no_of_sections > 0) {
                    setOptionStepperData(viewTemplateResponse.data.sections ? viewTemplateResponse.data.sections : []);
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
    }

    const otherTemplateSaveFunc = async (data, alreadySavedApproval) => {

        if (!selectedOtherTemplate.table || selectedOtherTemplate.table === '') {
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
        formData.append("table_name", selectedOtherTemplate.table);

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

        formData.append("data", JSON.stringify(normalData));
        setLoading(true);

        try {
            const saveTemplateData = await api.post("/templateData/insertTemplateData", formData);
            setLoading(false);

            localStorage.removeItem(selectedOtherTemplate.name + '-formData');

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
                    onOpen: () => handleOtherTemplateActions(selectedOtherTemplate)
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

    const otherTemplateUpdateFunc = async (data) => {

        if (!selectedOtherTemplate.table || selectedOtherTemplate.table === '') {
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

        formData.append("table_name", selectedOtherTemplate.table);
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

        formData.append("data", JSON.stringify(normalData));
        formData.append("id", data.id);
        setLoading(true);

        try {
            const saveTemplateData = await api.post("/templateData/updateTemplateData", formData);
            setLoading(false);

            if (saveTemplateData && saveTemplateData.success) {

                localStorage.removeItem(selectedOtherTemplate.name + '-formData');

                toast.success(saveTemplateData.message || "Data Updated Successfully", {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    className: "toast-success",
                    onOpen: () => handleOtherTemplateActions(selectedOtherTemplate)
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

    const handleOthersTemplateDataView = async (rowData, editData, table_name) => {

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

                setOtherInitialTemplateData(viewTemplateData.data ? viewTemplateData.data : {});
                setOtherReadOnlyTemplateData(!editData);
                setOtherEditTemplateData(editData);
                setOtherRowId(null);
                setOtherTemplateId(null);

                const viewTableData = {
                    "table_name": table_name
                }

                setLoading(true);
                try {

                    const viewTemplateResponse = await api.post("/templates/viewTemplate", viewTableData);
                    setLoading(false);

                    if (viewTemplateResponse && viewTemplateResponse.success) {

                        setOtherFormOpen(true);
                        setOtherRowId(rowData.id);
                        setOtherTemplateId(viewTemplateResponse['data'].template_id);
                        setOptionFormTemplateData(viewTemplateResponse.data['fields'] ? viewTemplateResponse.data['fields'] : []);
                        if (viewTemplateResponse.data.no_of_sections && viewTemplateResponse.data.no_of_sections > 0) {
                            setOptionStepperData(viewTemplateResponse.data.sections ? viewTemplateResponse.data.sections : []);
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

    const handleOthersDeleteTemplateData = (rowData, table_name) => {

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
                            onOpen: () => handleOtherTemplateActions(selectedOtherTemplate)
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

    const onSaveTemplateData = async (data) => {

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

        normalData.sys_status = "gn_order";
        showCaseApprovalPage(normalData,formData);
        return;
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
                    onOpen: () => {
                        loadTableData(paginationCount);
                        setApprovalSaveData({});
                    }
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

    const handleClear = () => {
        setSearchValue('');
        loadTableData(paginationCount);
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

    const handleFilter = ()=> {
        console.log("hello calling func")
    }

    const handleOtherTemplateActions = async (options)=>{

        var getTemplatePayload = {
            "table_name": options.table,
        }

        setLoading(true);

        try {
            const getTemplateResponse = await api.post("/templateData/getTemplateData", getTemplatePayload);
            setLoading(false);

            if (getTemplateResponse && getTemplateResponse.success) {

                if (getTemplateResponse.data && getTemplateResponse.data) {

                    console.log("data inside")

                    if(getTemplateResponse.data[0]){

                        var excludedKeys = ["created_at", "updated_at", "id", "deleted_at", "attachments", "Starred", "ReadStatus", "linked_profile_info"];

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
                            ...Object.keys(getTemplateResponse.data[0])
                                .filter((key) => !excludedKeys.includes(key))
                                .map((key) => {
                                    var updatedKeyName = key.replace(/^field_/, "").replace(/_/g, " ").toLowerCase().replace(/^\w|\s\w/g, (c) => c.toUpperCase())

                                    return {
                                        field: key,
                                        headerName: updatedKeyName ? updatedKeyName : '',
                                        width: 150,
                                        resizable: true,
                                        renderHeader: () => (
                                            <div onClick={() => ApplySortTable(key)} style={{ display: "flex", alignItems: "center", justifyContent: 'space-between', width: '100%' }}>
                                                <span style={{ color: '#1D2939', fontSize: '15px', fontWeight: '500' }}>{updatedKeyName ? updatedKeyName : ''}</span>
                                            </div>
                                        ),
                                        renderCell: (params) => {
                                            return tableCellRender(key, params, params.value)
                                        },
                                    };
                                }),
                                {
                                    field: '',
                                    headerName: 'Action',
                                    flex: 1,
                                    renderCell: (params) => {
                                        return (
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px', height: '100%' }}>
                                                <Button variant="outlined" onClick={(event) => { event.stopPropagation(); handleOthersTemplateDataView(params.row, false, options.table); }}>
                                                    View
                                                </Button>
                                                <Button variant="contained" color="primary" onClick={(event) => { event.stopPropagation(); handleOthersTemplateDataView(params.row, true, options.table); }}>
                                                    Edit
                                                </Button>
                                                <Button variant="contained" color="error" onClick={(event) => { event.stopPropagation(); handleOthersDeleteTemplateData(params.row, options.table); }}>
                                                    Delete
                                                </Button>
                                            </Box>
                                        );
                                    }
                                }
                        ];

                        setOtherTemplateColumn(updatedHeader)
                    }else{
                        setOtherTemplateColumn([])
                    }

                    var updatedTableData = getTemplateResponse.data.map((field, index) => {

                        const formatDate = (fieldValue) => {
                            if (!fieldValue || typeof fieldValue !== "string") return fieldValue;

                            var dateValue = new Date(fieldValue);

                            if (isNaN(dateValue.getTime()) || !fieldValue.includes("-") && !fieldValue.includes("/")) {
                                return fieldValue;
                            }

                            if (isNaN(dateValue.getTime())) return fieldValue;

                            var dayValue = String(dateValue.getDate()).padStart(2, "0");
                            var monthValue = String(dateValue.getMonth() + 1).padStart(2, "0");
                            var yearValue = dateValue.getFullYear();
                            return `${dayValue}/${monthValue}/${yearValue}`;
                        };

                        const updatedField = {};

                        Object.keys(field).forEach((key) => {
                            if (field[key] && key !== 'id' && !isNaN(new Date(field[key]).getTime())) {
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
                    setOtherTemplateModalOpen(true);
                }

                setselectedOtherTemplate(options);

                setOtherFormOpen(false);
                setOptionStepperData([]);
                setOptionFormTemplateData([]);

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

    // Find the default item (Government Order)
const defaultGovernmentOrderItem = approvalItem.find(
    (item) => (item.name || "").toLowerCase() === "government order"
  );

  
    return (
        <Box p={2} inert={loading ? true : false}>
            <>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                        <Box sx={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
                            {/* <img src='./arrow-left.svg' /> */}
                            <Typography variant="h1" align="left" className='ProfileNameText'>
                                {template_name ? template_name.toLowerCase().replace(/^\w|\s\w/, (c) => c.toUpperCase()) : 'Government Order'}
                            </Typography>
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>

                        {            
                            localStorage.getItem('authAdmin') === "true" &&

                            <TextFieldInput 
                            
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon sx={{ color: '#475467' }} />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                            {searchValue && (
                                                <IconButton sx={{ padding: 0 }} onClick={handleClear} size="small">
                                                    <ClearIcon sx={{ color: '#475467' }} />
                                                </IconButton>
                                            )}
                                            <IconButton sx={{ padding: 0, border:'1px solid #D0D5DD', borderRadius: '0' }} onClick={handleFilter}>
                                                <FilterListIcon sx={{ color: '#475467' }} />
                                            </IconButton>
                                        </Box>
                                    )
                                }}

                                onInput={(e) => setSearchValue(e.target.value)}
                                value={searchValue}
                                id="tableSearch"
                                size="small"
                                placeholder='Search anything'
                                variant="outlined"
                                className="profileSearchClass"
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

                        }
                        <Button onClick={() => getTemplate(table_name)} sx={{ background: '#32D583', color: '#101828', textTransform: 'none', height: '38px' }} startIcon={<AddIcon sx={{ border: '1.3px solid #101828', borderRadius: '50%' }} />} variant="contained">
                            Add New
                        </Button>
                        {
                            localStorage.getItem('authAdmin') === "false" &&
                            <Button onClick={downloadReportModal} variant="contained" sx={{ background: '#32D583', color: '#101828', textTransform: 'none', height: '38px' }}>
                                Download Report
                            </Button>
                        }

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
                        placeholder='Search anything'
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
                    <TableView  rows={tableData} columns={viewTemplateTableColumns} backBtn={paginationCount !== 1} nextBtn={tableData.length === 10} handleBack={handlePrevPage} handleNext={handleNextPage} />
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
                    onUpdate={(data) => {
                        setPendingUpdateData(data);
                        showApprovalPage(data);
                      }}
                    formConfig={formTemplateData}
                    stepperData={stepperData}
                    initialData={initialData}
                    onSubmit={onSaveTemplateData}
                    onError={onSaveTemplateError}
                    closeForm={setFormOpen} />
            }

            {otherFormOpen &&

                <Dialog
                    open={otherFormOpen}
                    onClose={() => setOtherFormOpen(false)}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                    maxWidth="xl"
                    fullWidth
                >
                    <DialogContent sx={{ minWidth: '400px' }}>
                        <DialogContentText id="alert-dialog-description">
                            <FormControl fullWidth>
                                <NormalViewForm

                                    table_row_id={otherRowId}
                                    template_id={otherTemplateId}

                                    template_name={selectedOtherTemplate.name}

                                    readOnly={otherReadOnlyTemplateData}
                                    editData={otherEditTemplateData}

                                    initialData={otherInitialTemplateData}

                                    formConfig={optionFormTemplateData}
                                    stepperData={optionStepperData}

                                    onSubmit={otherTemplateSaveFunc}
                                    onUpdate={otherTemplateUpdateFunc}
                                    onError={onSaveTemplateError}
                                    closeForm={setOtherFormOpen} 

                                />
                            </FormControl>
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions sx={{ padding: '12px 24px' }}>
                        <Button onClick={() => setOtherFormOpen(false)}>Cancel</Button>
                    </DialogActions>
                </Dialog>
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


            {/* other templates ui */}

            {otherTemplateModalOpen &&
                <Dialog
                    open={otherTemplateModalOpen}
                    onClose={() => setOtherTemplateModalOpen(false)}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                    maxWidth="md"
                    fullWidth
                    sx={{zIndex:'1'}}
                >
                    <DialogTitle id="alert-dialog-title" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} >
                        {selectedOtherTemplate && selectedOtherTemplate.name }
                        <Box>
                            <Button variant="outlined" onClick={() => {showOptionTemplate(selectedOtherTemplate.table)}}>Add</Button>
                            <IconButton
                                aria-label="close"
                                onClick={() => setOtherTemplateModalOpen(false)}
                                sx={{ color: (theme) => theme.palette.grey[500] }}
                            >
                                <CloseIcon />
                            </IconButton>
                        </Box>

                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            <Box py={2}>
                                <TableView rows={otherTemplateData} columns={otherTemplateColumn} />
                            </Box>
                        </DialogContentText>
                    </DialogContent>
                </Dialog>
            }

                  {approveTableFlag && (
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
                        <Box>
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
                          <Box py={2}>
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
                                value={
                                    approvalItem.find(
                                    (option) =>
                                        option.approval_item_id ===
                                        (approvalSaveData && approvalSaveData["approval_item"])
                                    ) || defaultGovernmentOrderItem || null
                                }
                                onChange={(e, value) =>
                                    handleApprovalSaveData("approval_item", value?.approval_item_id)
                                }
                                disabled = {true}
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
                  )}
            
    <ApprovalModal
        open={showApprovalModal}
        onClose={() => setShowApprovalModal(false)}
        onSave={handleApprovalWithSave}
        
        approvalItem={approvalItemsData}
        disabledApprovalItems={readonlyApprovalItems}

        designationData={approvalDesignationData}
        
        formData={approvalFormData}
        onChange={caseApprovalOnChange}
    />

        </Box>
    )
};

export default GovernmentOrder;