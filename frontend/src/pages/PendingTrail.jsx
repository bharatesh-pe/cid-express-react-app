import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import DynamicForm from "../components/dynamic-form/DynamicForm";
import NormalViewForm from "../components/dynamic-form/NormalViewForm";
import TableView from "../components/table-view/TableView";
import api from "../services/api";

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

import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import SelectField from "../components/form/Select";
import MultiSelect from "../components/form/MultiSelect";
import AutocompleteField from "../components/form/AutoComplete";

const UnderInvestigation = () => {
  const location = useLocation();
  const navigate = useNavigate();

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

  const [sysStatus, setSysSattus] = useState("all");

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

  const changeSysStatus = async (data, value, text) => {
    Swal.fire({
      title: "Are you sure?",
      text: text,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes !",
      cancelButtonText: "No",
    }).then(async (result) => {
      if (result.isConfirmed) {
        var payloadSysStatus = {
          table_name: table_name,
          data: {
            id: data.id,
            sys_status: value,
            default_status: "pt_case",
            ui_case_id: data.ui_case_id ? data.ui_case_id : null,
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
                onOpen: () => loadTableData(paginationCount),
              }
            );
          } else {
            const errorMessage = chnageSysStatus.message
              ? chnageSysStatus.message
              : "Failed to change the data. Please try again.";
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
        console.log("sys status updation canceled.");
      }
    });
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

  const loadTableData = async (page, searchValue) => {
    var getTemplatePayload = {
      page: page,
      limit: 10,
      sort_by: tableSortKey,
      order: tableSortOption,
      search: searchValue ? searchValue : "",
      table_name: table_name,
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
      const getTemplateResponse = await api.post(
        "/templateData/paginateTemplateDataForOtherThanMaster",
        getTemplatePayload
      );
      setLoading(false);

      if (getTemplateResponse && getTemplateResponse.success) {
        if (getTemplateResponse.data && getTemplateResponse.data["data"]) {
          if (getTemplateResponse.data["data"][0]) {
            var excludedKeys = [
              "created_at",
              "updated_at",
              "id",
              "deleted_at",
              "attachments",
              "Starred",
              "ReadStatus",
              "linked_profile_info",
              "ui_case_id",
              "pt_case_id",
              "sys_status"
            ];

            const updatedHeader = [
              {
                field: "select",
                headerName: "",
                width: 50,
                renderCell: (params) => {
                  return (
                    <Checkbox
                      checked={params.row.isSelected || false}
                      onChange={(event) =>
                        handleCheckboxChangeField(event, params.row)
                      }
                    />
                  );
                },
              },
              ...Object.keys(getTemplateResponse.data['data'][0])
              .filter((key) => !excludedKeys.includes(key))
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
            ];

            if (Array.isArray(getTemplateResponse.data["columns"])) {
              var updatedHeaderData = getTemplateResponse.data["columns"]
                .filter((key) => key.name && key.name.trim() !== "")
                .map((key) => key.name);

              setShowDownloadData(updatedHeaderData);
              setShowSelectedDownloadData({
                downloadHeaders: updatedHeaderData.map((data) => data),
              });
            } else {
              setShowDownloadData([]);
              setShowSelectedDownloadData({});
            }

            setviewTemplateTableData(updatedHeader);
          }

          var updatedTableData = getTemplateResponse.data["data"].map(
            (field, index) => {
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

              Object.keys(field).forEach((key) => {
                if (
                  field[key] &&
                  key !== "id" &&
                  !isNaN(new Date(field[key]).getTime())
                ) {
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
            }
          );

          setTableData(updatedTableData);
          setviewReadonly(false);
          setEditTemplateData(false);
          setInitialData({});
          setFormOpen(false);
        }

        if (getTemplateResponse.data && getTemplateResponse.data["meta"]) {
          if (
            getTemplateResponse.data["meta"].table_name &&
            getTemplateResponse.data["meta"].template_name
          ) {
            setTemplate_name(getTemplateResponse.data["meta"].template_name);
            setTable_name(getTemplateResponse.data["meta"].table_name);
          }
        }
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

    const tableCellRender = (key, params, value) => {

        if(params?.row?.attachments){
            var attachmentField = params.row.attachments.find((data) => data.field_name === key)
            if(attachmentField){
                return fileUploadTableView(key, params, params.value);
            }
        }

        let highlightColor = {};
        let onClickHandler = null;

        // if (params?.row?.linked_profile_info?.[0]?.field === key) {
        //     highlightColor = { color: '#0167F8', textDecoration: 'underline', cursor: 'pointer' };
            
        //     onClickHandler = (event) => {event.stopPropagation();hyperLinkShow(params.row.linked_profile_info[0])};
        // }

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
          mt={1}
          sx={{ display: "inline-flex", alignItems: "center", gap: "4px" }}
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

  const showOptionTemplate = async (tableName) => {
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
      console.log(
        "viewTemplateResponseviewTemplateResponse",
        viewTemplateResponse
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

  const otherTemplateSaveFunc = async (data, alreadySavedApproval) => {
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

    if (
      selectedOtherTemplate &&
      selectedOtherTemplate.is_approval &&
      !alreadySavedApproval
    ) {
      showApprovalPage(selectedRow);
      setTemplateApprovalData(data);
      setTemplateApproval(true);
      return;
    }

    const formData = new FormData();
    formData.append(
      "table_name",
      showPtCaseModal ? ptCaseTableName : selectedOtherTemplate.table
    );

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
          normalData[field.name] =
            field.type === "checkbox" || field.type === "multidropdown"
              ? Array.isArray(data[field.name])
                ? data[field.name].join(",")
                : data[field.name]
              : data[field.name];
        }
      }
    });
    normalData.sys_status = "pt_case";
    normalData["pt_case_id"] = selectedRowData.id;
    normalData["ui_case_id"] = selectedRowData?.ui_case_id;

    formData.append("data", JSON.stringify(normalData));
    setLoading(true);

    try {
      let saveTemplateData;
      if (isUpdatePdf) {
        const appendText = JSON.stringify(normalData);
        saveTemplateData = await api.post(
          "/templateData/appendToLastLineOfPDF",
          { pt_case_id: selectedRowData.id, appendText }
        );
      } else {
        saveTemplateData = await api.post(
          "/templateData/insertTemplateData",
          formData
        );
      }
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

    formData.append("table_name", selectedOtherTemplate.table);
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
          normalData[field.name] =
            field.type === "checkbox" || field.type === "multidropdown"
              ? Array.isArray(data[field.name])
                ? data[field.name].join(",")
                : data[field.name]
              : data[field.name];
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
        localStorage.removeItem(selectedOtherTemplate.name + "-formData");

        toast.success(saveTemplateData.message || "Data Updated Successfully", {
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
          normalData[field.name] =
            field.type === "checkbox" || field.type === "multidropdown"
              ? Array.isArray(data[field.name])
                ? data[field.name].join(",")
                : data[field.name]
              : data[field.name];
        }
      }
    });
    normalData.sys_status = "pt_case";
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
          normalData[field.name] =
            field.type === "checkbox" || field.type === "multidropdown"
              ? Array.isArray(data[field.name])
                ? data[field.name].join(",")
                : data[field.name]
              : data[field.name];
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

  useEffect(() => {
    const getActions = async () => {
      var payloadObj = {
        module: "pt_case",
        tab: sysStatus,
      };

      setLoading(true);

      try {
        const getActionsDetails = await api.post(
          "/action/get_actions",
          payloadObj
        );

        setLoading(false);

        if (getActionsDetails && getActionsDetails.success) {
          if (getActionsDetails.data && getActionsDetails.data["data"]) {
            var userPermissionsArray =
              JSON.parse(localStorage.getItem("user_permissions")) || [];
            const userPermissions = userPermissionsArray[0] || {};
            var updatedActions = getActionsDetails.data["data"].filter(
              (action) => {
                if (action.permissions) {
                  var parsedPermissions = JSON.parse(action.permissions);

                  const hasValidPermission = parsedPermissions.some(
                    (permission) => userPermissions[permission] === true
                  );

                  return hasValidPermission;
                }

                return true;
              }
            );

            setHoverTableOptions(updatedActions);
          }
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
        if (error && error.response && error.response.data) {
          toast.error(
            error.response.data["message"]
              ? error.response.data["message"]
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
    getActions();
  }, [sysStatus]);

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

  const getUploadedFiles = async (selectedRow) => {
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

  const handleOtherTemplateActions = async (options, selectedRow) => {
    setSelectedRowData(selectedRow);

    if (options.table && options.field) {
      showTransferToOtherDivision(options, selectedRow);
      return;
    }

    setSelectedRow(selectedRow);

    var getTemplatePayload = {
      table_name: options.table,
      pt_case_id: selectedRow.id,
      ui_case_id: selectedRow?.ui_case_id,
    };

    setLoading(true);

    try {
      const getTemplateResponse = await api.post(
        "/templateData/getTemplateData",
        getTemplatePayload
      );
      setLoading(false);

      if (getTemplateResponse && getTemplateResponse.success) {
        if (getTemplateResponse.data && getTemplateResponse.data) {
          if (getTemplateResponse.data[0]) {
            var excludedKeys = [
              "created_at",
              "updated_at",
              "id",
              "deleted_at",
              "attachments",
              "Starred",
              "ReadStatus",
              "linked_profile_info",
            ];

            const updatedHeader = [
              {
                field: "sl_no",
                headerName: "S.No",
                resizable: false,
                width: 75,
                renderCell: (params) => {
                  return (
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: "4px" }}
                    >
                      {params.value}
                    </Box>
                  );
                },
              },
              ...Object.keys(getTemplateResponse.data[0])
              .filter((key) => !excludedKeys.includes(key))
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
                field: "",
                headerName: "Action",
                flex: 1,
                renderCell: (params) => {
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
                          handleOthersTemplateDataView(
                            params.row,
                            false,
                            options.table
                          );
                        }}
                      >
                        View
                      </Button>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleOthersTemplateDataView(
                            params.row,
                            true,
                            options.table
                          );
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleOthersDeleteTemplateData(
                            params.row,
                            options.table
                          );
                        }}
                      >
                        Delete
                      </Button>
                    </Box>
                  );
                },
              },
            ];

            setOtherTemplateColumn(updatedHeader);
          } else {
            setOtherTemplateColumn([]);
          }

          var updatedTableData = getTemplateResponse.data.map(
            (field, index) => {
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

              Object.keys(field).forEach((key) => {
                if (
                  field[key] &&
                  key !== "id" &&
                  !isNaN(new Date(field[key]).getTime())
                ) {
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
            }
          );

          setOtherTemplateData(updatedTableData);
          if (
            options.table === "cid_ui_case_progress_report" &&
            options.is_pdf
          ) {
            await checkPdfEntryStatus(selectedRow.id);
            await getUploadedFiles(selectedRow);
          }

          setOtherTemplateModalOpen(true);
        }

        setselectedOtherTemplate(options);

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

  const showTransferToOtherDivision = async (options, selectedRow) => {
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

          var getDivisionField = viewTemplateResponse["data"].fields.filter(
            (data) => {
              if (data.name === options.field) {
                return data;
              }
            }
          );

          if (getDivisionField.length > 0) {
            if (getDivisionField[0].api) {
              setLoading(true);

              var payloadApi = {
                table_name: getDivisionField[0].table,
              };

              try {
                var getOptionsValue = await api.post(
                  getDivisionField[0].api,
                  payloadApi
                );

                setLoading(false);

                var updatedOptions = [];

                if (getOptionsValue && getOptionsValue.data) {
                  if (
                    getDivisionField[0].api === "/templateData/getTemplateData"
                  ) {
                    updatedOptions = getOptionsValue.data.map(
                      (templateData) => {
                        var nameKey = Object.keys(templateData).find(
                          (key) =>
                            !["id", "created_at", "updated_at"].includes(key)
                        );

                        return {
                          name: nameKey ? templateData[nameKey] : "",
                          code: templateData.id,
                        };
                      }
                    );
                  } else {
                    updatedOptions = getOptionsValue.data.map((field, i) => {
                      return {
                        name: field[
                          getDivisionField[0].table === "users"
                            ? "name"
                            : getDivisionField[0].table + "_name"
                        ],
                        code: field[
                          getDivisionField[0].table === "users"
                            ? "user_id"
                            : getDivisionField[0].table + "_id"
                        ],
                      };
                    });
                  }

                  setSelectKey({ name: options.field, title: options.name });
                  setSelectedRow(selectedRow);
                  setselectedOtherTemplate(options);
                  setOtherTransferField(updatedOptions);
                  setShowOtherTransferModal(true);
                }
              } catch (error) {
                setLoading(false);

                if (error && error.response && error.response.data) {
                  toast.error(
                    error.response.data["message"]
                      ? error.response.data["message"]
                      : "Division not found",
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
            } else {
              setSelectKey({ name: options.field, title: options.name });
              setSelectedRow(selectedRow);
              setselectedOtherTemplate(options);
              setOtherTransferField(getDivisionField[0].options);
              setShowOtherTransferModal(true);
            }
          } else {
            const errorMessage = "Can't able to find Division field";
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
        }
      } else {
        const errorMessage = viewTemplateResponse.message
          ? viewTemplateResponse.message
          : "Failed to get Template. Please try again.";
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

  const showApprovalPage = async (approveData) => {
    var payloadObj = {
      pt_case_id: approveData.id,
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

  const showApprovalAddPage = (table) => {
    setAddApproveFlag(true);
    handleApprovalSaveData(
      "approval_item",
      Number(selectedOtherTemplate?.approval_items)
    );
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

    var created_by_designation_id =
      localStorage.getItem("designation_id") || "";

    var created_by_division_id = localStorage.getItem("division_id") || "";

    var payloadApproveData = {
      ...approvalSaveData,
      pt_case_id: selectedRow.id,
      transaction_id: randomApprovalId,
      created_by_designation_id: created_by_designation_id,
      created_by_division_id: created_by_division_id,
    };

    setLoading(true);

    try {
      const chnageSysStatus = await api.post(
        "/ui_approval/create_ui_case_approval",
        payloadApproveData
      );

      setLoading(false);

      if (chnageSysStatus && chnageSysStatus.success) {
        toast.success(
          chnageSysStatus.message
            ? chnageSysStatus.message
            : "Approval Added Successfully Successfully",
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

        if (
          (selectedOtherTemplate.field === null ||
            selectedOtherTemplate.field === "field_nature_of_disposal") &&
          templateApproval
        ) {
          otherTemplateSaveFunc(templateApprovalData, true);
          return;
        }

        if (disposalUpdate) {
          updateSysStatusDisposal();
          return;
        }

        var combinedData = {
          id: selectedRow.id,
          [selectKey.name]: selectedOtherFields.code,
        };

        // update func
        onUpdateTemplateData(combinedData);

        // reset states
        setSelectKey(null);
        setSelectedRow(null);
        setOtherTransferField([]);
        setShowOtherTransferModal(false);
        setSelectedOtherFields(null);
        setselectedOtherTemplate(null);

        setApprovalsData([]);
        setApprovalItem([]);
        setDesignationData([]);

        setAddApproveFlag(false);
        setApproveTableFlag(false);
        setApprovalSaveData({});
      } else {
        const errorMessage = chnageSysStatus.message
          ? chnageSysStatus.message
          : "Failed to add approval. Please try again.";
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

    if (
      selectedOtherTemplate &&
      selectedOtherTemplate["field"] &&
      selectedOtherTemplate["field"] === "field_nature_of_disposal" &&
      selectedOtherFields &&
      selectedOtherFields["name"]
    ) {
      checkDisposalValues();
      return;
    }

    if (selectedOtherTemplate && selectedOtherTemplate.is_approval) {
      showApprovalPage(selectedRow);
      return;
    }

    var combinedData = {
      id: selectedRow.id,
      [selectKey.name]: selectedOtherFields.code,
    };

    // update func
    onUpdateTemplateData(combinedData);

    // reset states
    setSelectKey(null);
    setSelectedRow(null);
    setOtherTransferField([]);
    setShowOtherTransferModal(false);
    setSelectedOtherFields(null);
    setselectedOtherTemplate(null);
  };

  const showPtCaseTemplate = async () => {
    var getTemplatePayload = {
      page: 1,
      limit: 0,
      template_module: "pt_case",
    };

    setLoading(true);

    try {
      const getTemplateResponse = await api.post(
        "/templateData/paginateTemplateDataForOtherThanMaster",
        getTemplatePayload
      );
      setLoading(false);

      if (getTemplateResponse && getTemplateResponse.success) {
        if (getTemplateResponse.data && getTemplateResponse.data["meta"]) {
          if (
            !getTemplateResponse.data["meta"].table_name ||
            getTemplateResponse.data["meta"].table_name === ""
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
            table_name: getTemplateResponse.data["meta"].table_name,
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

              setPtCaseTableName(getTemplateResponse.data["meta"].table_name);
              setPtCaseTemplateName(
                getTemplateResponse.data["meta"].template_name
              );
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

  const checkDisposalValues = () => {
    if (
      selectedOtherTemplate &&
      selectedOtherTemplate["field"] &&
      selectedOtherTemplate["field"] === "field_nature_of_disposal" &&
      selectedOtherFields &&
      selectedOtherFields["name"]
    ) {
      if (selectedOtherFields && selectedOtherFields["name"] === "A") {
        showPtCaseTemplate();
        setDisposalUpdate(true);
      } else {
        Swal.fire({
          title:
            selectedOtherFields["name"] === "B"
              ? "Approved by Court"
              : "Are You Sure ?",
          text:
            selectedOtherFields["name"] === "B"
              ? ""
              : "Do you want to move this case !",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Yes !",
          cancelButtonText: "No",
        }).then(async (result) => {
          if (result.isConfirmed) {
            if (selectedOtherTemplate && selectedOtherTemplate.is_approval) {
              showApprovalPage(selectedRow);
              setDisposalUpdate(true);
              return;
            }

            updateSysStatusDisposal();
          } else {
            setSelectKey(null);
            setSelectedRow(null);
            setOtherTransferField([]);
            setShowOtherTransferModal(false);
            setSelectedOtherFields(null);
            setselectedOtherTemplate(null);
          }
        });
      }
    }
  };

  const updateSysStatusDisposal = async () => {
    var payloadSysStatus = {
      table_name: table_name,
      data: {
        id: selectedRow.id,
        sys_status: "disposal",
        default_status: "pt_case",
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
        setDesignationData([]);

        setAddApproveFlag(false);
        setApproveTableFlag(false);
        setApprovalSaveData({});
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
  };

  const [isUpdatePdf, setIsUpdatePdf] = useState(false);

  var userPermissions =
    JSON.parse(localStorage.getItem("user_permissions")) || [];

  var hoverExtraOptions = [
    userPermissions[0]?.view_pt
      ? {
          name: "View",
          onclick: (selectedRow) =>
            handleTemplateDataView(selectedRow, false, table_name),
        }
      : null,
    userPermissions[0]?.edit_pt_case
      ? {
          name: "Edit",
          onclick: (selectedRow) =>
            handleTemplateDataView(selectedRow, true, table_name),
        }
      : null,
    userPermissions[0]?.delete_pt
      ? {
          name: "Delete",
          onclick: (selectedRow) =>
            handleDeleteTemplateData(selectedRow, table_name),
        }
      : null,
    ...hoverTableOptions,
    {
      name: "Further Investigation 173(8) Case",
      onclick: (selectedRow) =>
        changeSysStatus(
          selectedRow,
          "178_cases",
          "Do you want to update this case to 173(8) ?"
        ),
    },
    {
      name: "Download and Print",
      onclick: (selectedRow) =>
        handleTemplateDataView(selectedRow, false, table_name),
    },
  ].filter(Boolean);

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

  const getAllOptionsforFilter = async (dropdownFields) => {
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

      setfilterDropdownObj(updatedFieldsDropdown);
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

  const handleAutocomplete = (field, selectedValue) => {
    let updatedFormData = { ...filterValues, [field.name]: selectedValue };

    setFilterValues(updatedFormData);

    if (field?.api && field?.table) {
      var dependent_field = filterDropdownObj.filter((element) => {
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
          var dependentFields = filterDropdownObj.filter((element) => {
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

            setfilterDropdownObj(
              filterDropdownObj.map((element) =>
                element.id === dependent_field[0].id
                  ? { ...element, ...userUpdateFields }
                  : element
              )
            );

            dependent_field.map((data) => {
              delete filterValues[data.name];
            });

            dependent_field.forEach((data) => {
              delete updatedFormData[data.name];
            });

            setFilterValues(updatedFormData);
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
              }}
            >
              {/* <img src='./arrow-left.svg' /> */}
              <Typography variant="h1" align="left" className="ProfileNameText">
                {template_name
                  ? template_name
                      .toLowerCase()
                      .replace(/^\w|\s\w/, (c) => c.toUpperCase())
                  : "Pending Trail"}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: "flex", alignItems: "start", gap: "12px" }}>
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
                    loadTableData(paginationCount, e.target.value);
                  }
                }}
                sx={{
                  width: "300px",
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
                  Massive Division
                </Button>
              </>
            )}

            {JSON.parse(localStorage.getItem("user_permissions")) &&
              JSON.parse(localStorage.getItem("user_permissions"))[0]
                .create_pt && (
                <Button
                  onClick={() => getTemplate(table_name)}
                  sx={{
                    background: "#32D583",
                    color: "#101828",
                    textTransform: "none",
                    height: "38px",
                  }}
                  startIcon={
                    <AddIcon
                      sx={{
                        border: "1.3px solid #101828",
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
            alignItems: "center",
          }}
        >
          <Box className="parentFilterTabs">
            <Box
              onClick={() => {
                setSysSattus("all");
                setPaginationCount(1);
              }}
              id="filterAll"
              className={`filterTabs ${sysStatus === "all" ? "Active" : ""}`}
            >
              All
            </Box>
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
              Further Investigation 173(8) Case
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
        </Box>

        <Box py={2}>
          <TableView
            hoverTable={true}
            hoverTableOptions={hoverExtraOptions}
            hoverActionFuncHandle={handleOtherTemplateActions}
            rows={tableData}
            columns={viewTemplateTableColumns}
            backBtn={paginationCount !== 1}
            nextBtn={tableData.length === 10}
            handleBack={handlePrevPage}
            handleNext={handleNextPage}
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
          onUpdate={onUpdateTemplateData}
          formConfig={formTemplateData}
          stepperData={stepperData}
          initialData={initialData}
          onSubmit={onSaveTemplateData}
          onError={onSaveTemplateError}
          closeForm={setFormOpen}
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
          <DialogContent sx={{ minWidth: "400px" }}>
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
          maxWidth="md"
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
            {selectedOtherTemplate && selectedOtherTemplate.name}
            <Box>
              {selectedOtherTemplate.table === "cid_ui_case_progress_report" ? (
                hasPdfEntry && (
                  <>
                    <Button
                      variant="outlined"
                      onClick={() => {
                        setIsUpdatePdf(false);
                        showOptionTemplate(selectedOtherTemplate.table);
                      }}
                    >
                      Add
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => {
                        setIsUpdatePdf(true);
                        showOptionTemplate(selectedOtherTemplate.table);
                      }}
                      style={{ marginLeft: "10px" }}
                    >
                      Update PDF
                    </Button>
                  </>
                )
              ) : (
                <Button
                  variant="outlined"
                  onClick={() =>
                    showOptionTemplate(selectedOtherTemplate.table)
                  }
                >
                  Add
                </Button>
              )}
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
                {selectedOtherTemplate.table ===
                "cid_ui_case_progress_report" ? (
                  hasPdfEntry ? (
                    uploadedFiles.length > 0 ? (
                      <>
                        <TableView
                          rows={otherTemplateData}
                          columns={otherTemplateColumn}
                        />
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
                  <TableView
                    rows={otherTemplateData}
                    columns={otherTemplateColumn}
                  />
                )}
              </Box>
            </DialogContentText>
          </DialogContent>
        </Dialog>
      )}

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
          <Button className="fillPrimaryBtn" onClick={handleSaveDivisionChange}>
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
    </Box>
  );
};

export default UnderInvestigation;
