import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import DynamicForm from "../components/dynamic-form/DynamicForm";
import NormalViewForm from "../components/dynamic-form/NormalViewForm";
import TableView from "../components/table-view/TableView";
import api from "../services/api";
import { InputLabel, Select, MenuItem } from "@mui/material";
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
import AddIcon from "@mui/icons-material/Add";
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
import ASC from "@mui/icons-material/North";
import DESC from "@mui/icons-material/South";
import GenerateProfilePdf from "./GenerateProfilePdf";
const Enquiries = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [showOptionModal, setShowOptionModal] = useState(false);
  const [paginationCount, setPaginationCount] = useState(1);
  const [tableSortOption, settableSortOption] = useState("DESC");
  const [tableSortKey, setTableSortKey] = useState("");
  const [tableData, setTableData] = useState([]);
  const [isValid, setIsValid] = useState(false);
  const [searchValue, setSearchValue] = useState(null);
  const [linkLeader, setLinkLeader] = useState(false);
  const [linkOrganization, setLinkOrganization] = useState(false);
  const [template_name, setTemplate_name] = useState("");
  const [table_name, setTable_name] = useState("");

  const [sysStatus, setSysSattus] = useState("eq_case");

  const [stepperData, setstepperData] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [formTemplateData, setFormTemplateData] = useState([]);
  const [initialData, setInitialData] = useState({});
  const [viewReadonly, setviewReadonly] = useState(false);
  const [editTemplateData, setEditTemplateData] = useState(false);
  const [selectedRowId, setSelectedRowId] = useState(null);
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

  const [StatusUpdateVisible, setStatusUpdateVisible] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [selectedRow, setSelectedRow] = useState({});

  const [loading, setLoading] = useState(false); // State for loading indicator

  const searchParams = new URLSearchParams(location.search);
  const [selectedRowData, setSelectedRowData] = useState(null);

  const [hoverTableOptions, setHoverTableOptions] = useState([]);
  // for approve states
  const [selectedOtherFields, setSelectedOtherFields] = useState(null);
  const [selectKey, setSelectKey] = useState(null);
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

  const handleApprovalSaveData = (name, value) => {
    setApprovalSaveData({
      ...approvalSaveData,
      [name]: value,
    });
  };
  const [viewTemplateTableColumns, setviewTemplateTableData] = useState([
    { field: "sl_no", headerName: "S.No" },
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
                handleTemplateDataView(params.row, false, table_name);
              }}
            >
              View
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={(event) => {
                event.stopPropagation();
                handleTemplateDataView(params.row, true, table_name);
              }}
            >
              Edit
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={(event) => {
                event.stopPropagation();
                handleDeleteTemplateData(params.row, table_name);
              }}
            >
              Delete
            </Button>
          </Box>
        );
      },
    },
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

  const [otherTablePagination, setOtherTablePagination] = useState(1);

  // filter states
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterDropdownObj, setfilterDropdownObj] = useState([]);
  const [filterValues, setFilterValues] = useState({});
  const [fromDateValue, setFromDateValue] = useState(null);
  const [toDateValue, setToDateValue] = useState(null);
  const [forceTableLoad, setForceTableLoad] = useState(false);

    const [isDownloadPdf, setIsDownloadPdf] = useState(false);
    const [downloadPdfFields, setDownloadPdfFields] = useState({});
    const [downloadPdfData, setDownloadPdfData] = useState([]);
    const [isPrint, setIsPrint] = useState(false);

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

  const changeSysStatus = async (selectedRow, status) => {
    var payloadSysStatus = {
      table_name: table_name,
      data: {
        id: selectedRow.id,
        sys_status: status,
        default_status: "eq_case",
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
        setStatusUpdateVisible(false);
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
            template_module: "eq_case",
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
    
                if (meta?.totalPages) {
                    setTotalPage(meta.totalPages);
                    if (meta.totalItems) setTotalRecord(meta.totalItems);
                }

                if (data?.length > 0) {
                    const excludedKeys = [
                        "created_at", "updated_at", "id", "deleted_at", "attachments",
                        "Starred", "ReadStatus", "linked_profile_info",
                        "ui_case_id", "pt_case_id", "sys_status"
                    ];
    
                    const generateReadableHeader = (key) =>
                        key
                            .replace(/^field_/, "")
                            .replace(/_/g, " ")
                            .toLowerCase()
                            .replace(/^\w|\s\w/g, (c) => c.toUpperCase());
    
                    const renderCellFunc = (key) => (params) => tableCellRender(key, params, params.value);
    
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
                        ...Object.keys(data[0])
                            .filter((key) => !excludedKeys.includes(key))
                            .map((key) => ({
                                field: key,
                                headerName: generateReadableHeader(key),
                                width: 150,
                                resizable: true,
                                renderHeader: () => (
                                    <div
                                        onClick={() => ApplySortTable(key)}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            width: "100%",
                                        }}
                                    >
                                        <span style={{ color: "#1D2939", fontSize: "15px", fontWeight: "500" }}>
                                            {generateReadableHeader(key)}
                                        </span>
                                    </div>
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

                if (meta?.table_name && meta?.template_name) {
                    setTemplate_name(meta.template_name);
                    setTable_name(meta.table_name);
                }
    
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

  const tableCellRender = (key, params, value) => {
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

    // if (params?.row?.linked_profile_info?.[0]?.field === key) {
    //     highlightColor = { color: '#0167F8', textDecoration: 'underline', cursor: 'pointer' };

    //     onClickHandler = (event) => {event.stopPropagation();hyperLinkShow(params.row.linked_profile_info[0])};
    // }

    return (
      <span
        style={highlightColor}
        onClick={onClickHandler}
        className={`tableValueTextView Roboto ${
          params?.row &&
          !params.row["ReadStatus"] &&
          localStorage.getItem("authAdmin") === "false"
            ? "unreadMsgText"
            : "read"
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

  const showOptionTemplate = async (table_name) => {
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
    setOtherReadOnlyTemplateData(false);
    setOtherEditTemplateData(false);
    setOtherRowId(null);
    setOtherTemplateId(null);
    setOtherInitialTemplateData({});

    try {
      const viewTemplateResponse = await api.post(
        "/templates/viewTemplate",
        viewTableData
      );
      setLoading(false);
      if (viewTemplateResponse && viewTemplateResponse.success) {
        setOtherFormOpen(true);
        setInitialData({});
        setviewReadonly(false);
        setEditTemplateData(false);
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

    const fieldStatusValue = data?.field_status || "";

    if (selectedOtherTemplate.table === "cid_eq_case_enquiry_order_copy") {
      normalData.sys_status = fieldStatusValue;
    } else {
      normalData.sys_status = "eq_case";
    }
    normalData["ui_case_id"] = selectedRowData.id || selectedRow.id;
    formData.append("data", JSON.stringify(normalData));
    setLoading(true);

    try {
      const saveTemplateData = await api.post(
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
          onOpen: () => {
            if (
              selectedOtherTemplate.table === "cid_eq_case_enquiry_order_copy"
            ) {
              changeSysStatus(selectedRowData, fieldStatusValue);
            }
            handleOtherTemplateActions(selectedOtherTemplate, selectedRowData);
          },
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
    const fieldStatusValue = data?.field_status || "";

    if (selectedOtherTemplate.table === "cid_eq_case_enquiry_order_copy") {
      normalData.sys_status = fieldStatusValue;
    } else {
      normalData.sys_status = "eq_case";
    }
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
          onOpen: () => {
            if (
              selectedOtherTemplate.table === "cid_eq_case_enquiry_order_copy"
            ) {
              changeSysStatus(selectedRowData, fieldStatusValue);
            }
            handleOtherTemplateActions(selectedOtherTemplate, selectedRowData);
          },
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
                onOpen: () => handleOtherTemplateActions(selectedOtherTemplate),
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
    normalData.sys_status = "eq_case";
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

  function createSvgIcon(svgString) {
    return () => (
      <span
        dangerouslySetInnerHTML={{ __html: svgString }}
        className="tableActionIcon"
      />
    );
  }

  // Advance filter functions

    const getActions = async () => {
        var payloadObj = {
            module: "eq_case",
            tab: sysStatus,
        };

        setLoading(true);

        try {
            const getActionsDetails = await api.post("/action/get_actions", payloadObj);

            setLoading(false);

            if (getActionsDetails && getActionsDetails.success) {
                if (getActionsDetails.data && getActionsDetails.data["data"]) {

                    var userPermissionsArray = JSON.parse(localStorage.getItem("user_permissions")) || [];

                    const userPermissions = userPermissionsArray[0] || {};

                    var updatedActions = getActionsDetails.data["data"].map((action) => {

                        if (action?.icon) {
                            action.icon = createSvgIcon(action.icon);
                        }

                        if (action.permissions) {
                            var parsedPermissions = JSON.parse(action.permissions);

                            const hasValidPermission = parsedPermissions.some(
                                (permission) => userPermissions[permission] === true
                            );

                            return hasValidPermission ? action : null;
                        }

                        return action;
                    }).filter(Boolean);

                    setHoverTableOptions(updatedActions);
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
                toast.error(error.response.data["message"] ? error.response.data["message"] : "Please Try Again !",{
                    position: "top-right",
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

  const handleOtherTemplateActions = async (options, selectedRow) => {
    setSelectedRowData(selectedRow);
    var getTemplatePayload = {
      table_name: options.table,
      ui_case_id: selectedRow.id,
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
                .filter(
                  (key) =>
                    !excludedKeys.includes(key) &&
                    key !== "field_pt_case_id" &&
                    key !== "field_ui_case_id" &&
                    key !== "field_pr_status" &&
                    key !== "field_evidence_file" &&
                    key !== "created_at" &&
                    key !== "field_last_updated" &&
                    key !== "field_date_created"
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
                    width: 250,
                    resizable: true,
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
                          {updatedKeyName ? updatedKeyName : ""}
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

  var userPermissions =
    JSON.parse(localStorage.getItem("user_permissions")) || [];

  var hoverExtraOptions = [
    userPermissions[0]?.view_enquiry
      ? {
          name: "View",
          onclick: (selectedRow) =>
            handleTemplateDataView(selectedRow, false, table_name),
          icon: () => (
            <span
              className="tableActionViewIcon"
              style={{
                marginTop: "1px",
                marginRight: "12px",
                marginLeft: "2px",
              }}
            >
              <svg
                width="50"
                height="50"
                viewBox="0 0 24 24"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 4.5C7.305 4.5 3.125 7.498 1 12c2.125 4.502 6.305 7.5 11 7.5s8.875-2.998 11-7.5c-2.125-4.502-6.305-7.5-11-7.5zm0 13c-3.038 0-5.5-2.462-5.5-5.5s2.462-5.5 5.5-5.5 5.5 2.462 5.5 5.5-2.462 5.5-5.5 5.5zm0-9c-1.932 0-3.5 1.568-3.5 3.5s1.568 3.5 3.5 3.5 3.5-1.568 3.5-3.5-1.568-3.5-3.5-3.5z" />
              </svg>
            </span>
          ),
        }
      : null,
    userPermissions[0]?.edit_enquiry
      ? {
          name: "Edit",
          onclick: (selectedRow) =>
            handleTemplateDataView(selectedRow, true, table_name),
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
    ...hoverTableOptions,

    userPermissions[0]?.delete_enquiry
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
        userPermissions[0]?.case_details_download ? 
            {
                name: "Download",
                onclick: (selectedRow) =>
                getPdfContentData(selectedRow, false, table_name),
            }
        : null,
        userPermissions[0]?.case_details_print ? 
            {
                name: "Print",
                onclick: (selectedRow) =>
                getPdfContentData(selectedRow, true, table_name),
            }
        : null,
    ].filter(Boolean);
  const showApprovalPage = async (approveData) => {
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

    if (selectedOtherTemplate?.approval_items) {
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
    var created_by_designation_id =
      localStorage.getItem("designation_id") || "";
    var created_by_division_id = localStorage.getItem("division_id") || "";

    var payloadApproveData = {
      ...approvalSaveData,
      case_id: selectedRow.id,
      case_type: "eq_case",
      module: "Enquiries",
      action: "Status Update",
      transaction_id: randomApprovalId,
      created_by_designation_id: created_by_designation_id,
      created_by_division_id: created_by_division_id,
      info: {
        module: "Enquiries",
        action: "Status Update",
      },
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
            onOpen: () => {
              changeSysStatus(selectedRow, selectedStatus);
              showApprovalPage(selectedRow);
            },
          }
        );

        var combinedData = {
          id: selectedRow.id,
          [selectKey.name]: selectedOtherFields.code,
        };

        // update func
        onUpdateTemplateData(combinedData);
        // reset states
        setSelectKey(null);
        setSelectedRow(null);
        setselectedOtherTemplate(null);

        setApprovalsData([]);
        setApprovalItem([]);
        setApprovalItemDisabled(false);
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
        <Dialog
          open={StatusUpdateVisible}
          onClose={() => setStatusUpdateVisible(false)}
          maxWidth="sm"
          fullWidth
          sx={{
            "& .MuiDialogPaper-root": { borderRadius: "12px", padding: "15px" },
          }}
        >
          <DialogTitle
            style={{ fontWeight: "600", fontSize: "18px", textAlign: "left" }}
          >
            Status Update
          </DialogTitle>

          <DialogContent
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            <FormControl fullWidth>
              <InputLabel>Choose Status</InputLabel>
              <Select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                label="Choose Status"
              >
                {["Completed", "Closed", "Disposal"].map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>

          <DialogActions
            style={{ justifyContent: "flex-end", padding: "10px 20px" }}
          >
            <Button
              variant="outlined"
              color="primary"
              onClick={() => setStatusUpdateVisible(false)}
              style={{ width: "150px" }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              style={{
                width: "150px",
                backgroundColor: "rgb(31, 29, 172)",
                color: "#fff",
                textTransform: "none",
              }}
              onClick={() => {
                showApprovalPage(selectedRow);
              }}
              disabled={!selectedStatus}
            >
              Update
            </Button>
          </DialogActions>
        </Dialog>

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
                  : "Enquiry"}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: "flex", alignItems: "start", gap: "12px" }}>

            {JSON.parse(localStorage.getItem("user_permissions")) &&
              JSON.parse(localStorage.getItem("user_permissions"))[0]
                .create_enquiry && (
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
                setSysSattus("eq_case");
                setPaginationCount(1);
              }}
              id="filterAll"
              className={`filterTabs ${sysStatus === "eq_case" ? "Active" : ""}`}
            >
              Enquiries
            </Box>
            <Box
              onClick={() => {
                setSysSattus("Completed");
                setPaginationCount(1);
              }}
              id="filterCompleted"
              className={`filterTabs ${
                sysStatus === "Completed" ? "Active" : ""
              }`}
            >
              Completed
            </Box>
            <Box
              onClick={() => {
                setSysSattus("Closed");
                setPaginationCount(1);
              }}
              id="filterClosed"
              className={`filterTabs ${sysStatus === "Closed" ? "Active" : ""}`}
            >
              Closed
            </Box>
            <Box
              onClick={() => {
                setSysSattus("Disposal");
                setPaginationCount(1);
              }}
              id="filterDisposal"
              className={`filterTabs ${
                sysStatus === "Disposal" ? "Active" : ""
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
            hoverTable={true}
            hoverTableOptions={hoverExtraOptions}
            hoverActionFuncHandle={handleOtherTemplateActions}
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
            />

        </Box>
      </>

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
      )}

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
          onClose={() => setOtherFormOpen(false)}
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
              <Button
                variant="outlined"
                onClick={() => {
                  showOptionTemplate(selectedOtherTemplate.table);
                }}
              >
                Add
              </Button>
              <IconButton
                aria-label="close"
                onClick={() => {
                  setOtherTemplateModalOpen(false);
                }}
                sx={{ color: (theme) => theme.palette.grey[500] }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              <Box py={2}>
                <TableView
                  rows={otherTemplateData}
                  columns={otherTemplateColumn}
                />
              </Box>
            </DialogContentText>
          </DialogContent>
        </Dialog>
      )}

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

        {isDownloadPdf && (
            <GenerateProfilePdf
                is_print={isPrint}
                templateData={downloadPdfData}
                templateFields={downloadPdfFields}
                template_name={template_name}
                onSave={handleOnSavePdf}
            />
        )}

    </Box>
  );
};

export default Enquiries;
