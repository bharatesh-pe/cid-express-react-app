import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import NormalViewForm from "../components/dynamic-form/NormalViewForm";
import TableView from "../components/table-view/TableView";
import DeleteIcon from '@mui/icons-material/Delete';
import api from "../services/api";
import SaveIcon from '@mui/icons-material/Save';
import { Chip, Tooltip } from "@mui/material";
import { Box , Button, FormControl, InputAdornment, Typography, IconButton, Checkbox, Grid, Autocomplete, TextField} from "@mui/material";
import TextFieldInput from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle"
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import SearchIcon from "@mui/icons-material/Search";
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
import FilterListIcon from "@mui/icons-material/FilterList";
import MultiSelect from "../components/form/MultiSelect";
import AutocompleteField from "../components/form/AutoComplete";
import ShortText from "../components/form/ShortText";
import WestIcon from '@mui/icons-material/West';
import { Tabs, Tab } from '@mui/material';
import { CircularProgress } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

const ProgressReport = ({ templateName, headerDetails, rowId, options, selectedRowData, backNavigation, showMagazineView }) => {

  useEffect(() => {
    const fetchData = async () => {
      if (rowId) {
        await checkPdfEntryStatus(rowId);
        getUploadedFiles(rowId, options);
      }
    };

    fetchData();
  }, [rowId]);

  const [selectedTab, setSelectedTab] = useState(0);
  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };
  const location = useLocation();
  const navigate = useNavigate();
  const { pageCount, systemStatus } = location.state || {};
  const [aoFields, setAoFields] = useState([]);
  const [aoFieldId, setAoFieldId] = useState(selectedRowData);
  const [filterAoValues, setFilterAoValues] = useState({});
  var userPermissions = JSON.parse(localStorage.getItem("user_permissions")) || [];
  const templateActionAddFlag = useRef(false);
  const [disableEditButtonFlag, setDisableEditButtonFlag] = useState(false);
  const [showPtCaseModal, setShowPtCaseModal] = useState(false);
  const [ptCaseTableName, setPtCaseTableName] = useState(null);
  const [ptCaseTemplateName, setPtCaseTemplateName] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [filterDropdownObj, setfilterDropdownObj] = useState([]);
  const [filterValues, setFilterValues] = useState({});
  const [showReplacePdfButton, setShowReplacePdfButton] = useState(false);
  const [isSubmitAllowed, setIsSubmitAllowed] = useState(false);
  const [showSubmitAPButton, setShowSubmitAPButton] = useState(false);
  const [isImmediateSupervisior, setIsImmediateSupervisior] = useState(false);
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
  const [selectedParentId, setSelectedParentId] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const handleOtherPagination = (page) => {
    setOtherTemplatesPaginationCount(page)
  }
  const [paginationCount, setPaginationCount] = useState(pageCount ? pageCount : 1);
  const [isValid, setIsValid] = useState(false);
  const [table_name, setTable_name] = useState("");
  const [sysStatus, setSysSattus] = useState(systemStatus ? systemStatus : "ui_case");
  const [formTemplateData, setFormTemplateData] = useState([]);
  const [initialData, setInitialData] = useState({});
  const [viewReadonly, setviewReadonly] = useState(false);
  const [editTemplateData, setEditTemplateData] = useState(false);
  const [selectedRowIds, setSelectedRowIds] = useState([]);
  const [otherFormOpen, setOtherFormOpen] = useState(false);
  const [optionStepperData, setOptionStepperData] = useState([]);
  const [optionFormTemplateData, setOptionFormTemplateData] = useState([]);
  const [loading, setLoading] = useState(false);
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
  const PageSize = 5;
  const [monthwiseData, setMonthwiseData] = useState([]);
  const [monthwiseTotalRecord, setMonthwiseTotalRecord] = useState(0);
  const [monthwiseTotalPage, setMonthwiseTotalPage] = useState(1);
  const [monthwiseCurrentPage, setMonthwiseCurrentPage] = useState(1);
  const [selectedRow, setSelectedRow] = useState(selectedRowData);
  const [selectedOtherFields, setSelectedOtherFields] = useState(null);
  const [selectKey, setSelectKey] = useState(null);
  const [randomApprovalId, setRandomApprovalId] = useState(0);
  const hoverTableOptionsRef = useRef([]);
  const [submissionDateDialogOpen, setSubmissionDateDialogOpen] = useState(false);
  const [submissionDate, setSubmissionDate] = useState(null);

  const handleMonthwisePagination = (page) => {
    getMonthWiseFile(selectedRow, page);
  };

  const monthwiseColumns = [
    {
      headerName: "S.No",
      field: "serial_no",
      width: 70,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        const currentPage = monthwiseCurrentPage || 1;
        const pageSize = PageSize || 5;

        if (!params.row) {
          console.error("S.No - Row data is missing for serial number calculation.");
          return "-";
        }
        const rowIndex = monthwiseData.indexOf(params.row);
        const serialNumber = (currentPage - 1) * pageSize + rowIndex + 1;
        return "PR" + serialNumber;
      },
    },
    {
      headerName: "Month of Submission",
      field: "month_of_the_file",
      width: 250,
      renderCell: (params) => {
        const fileName = params.row.month_of_the_file || "";
        return fileName;
      },
    },
    {
      headerName: "File",
      field: "monthwise_file_name",
      width: 300,
      renderCell: (params) => {
        const fileName = params.row.monthwise_file_name;
        const filePath = params.row.monthwise_file_path;
        return fileUploadTableView("monthwise", { row: params.row }, fileName, filePath);
      },
    },
  ];

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
      return [];
    }

    var viewTemplatePayload = {
      table_name: table_name,
      id: rowData.id || rowData,
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

        console.log("AO Field Values Loaded:", formValues);  // Log form values for debugging
        return formValues;  // Ensure values are returned properly
      } else {
        toast.error(viewTemplateData.message || "Error loading template data.", {
          position: "top-right",
          autoClose: 3000,
          className: "toast-error",
        });
        return [];
      }
    } catch (error) {
      setLoading(false);
      toast.error("Error fetching template data. Please try again.", {
        position: "top-right",
        autoClose: 3000,
        className: "toast-error",
      });
      return [];
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

        const briefFactField = response.data.fields.find((f) => f.name === "field_brief_fact");
        const policeStationField = response.data.fields.find((f) => f.name === "field_investigation_carried_out_by_the_police_station");

        if (briefFactField && !aoOnlyFields.includes(briefFactField)) aoOnlyFields.push(briefFactField);
        if (policeStationField && !aoOnlyFields.includes(policeStationField)) aoOnlyFields.push(policeStationField);

          for (const field of aoOnlyFields) {
            if (field && field.api) {
              const payloadApi = field.api;
              const apiPayload = {};

              try {
                  if (field.api === "/templateData/getTemplateData") {
                  const table_name = field.table;
                  apiPayload.table_name = table_name;
                  const res = await api.post(payloadApi, apiPayload);
                  if (!res.data) {
                      field.options = [];
                      continue;
                  }
                  let headerName = "name";
                  let headerId = "id";
                  const updatedOptions = res.data.map((item) => {
                      headerName =
                      Object.keys(item).find(
                          (key) =>
                          !["id", "created_at", "updated_at"].includes(key)
                      ) || "name";
                      headerId = "id";
                      return {
                      name: item[headerName],
                      code: item[headerId],
                      };
                  });
                  field.options = updatedOptions;
                  continue;
                  }

                  const res = await api.post(payloadApi, apiPayload);
                  if (!res.data) {
                  field.options = [];
                  continue;
                  }
                  let headerName = "name";
                  let headerId = "id";
                  if (field.table === "users") {
                  headerName = "name";
                  headerId = "user_id";
                  } else if (field.api !== "/templateData/getTemplateData") {
                  headerName = field.table + "_name";
                  headerId = field.table + "_id";
                  }
                  const updatedOptions = res.data.map((item) => ({
                  name: item[headerName],
                  code: item[headerId],
                  }));
                  field.options = updatedOptions;
              } catch (err) {
                  console.error(`Error loading options for field ${field.name}`, err);
                  field.options = [];
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
  }, [selectedOtherTemplate, aoFieldId]);

  useEffect(() => {
    const fetchData = async () => {
      if (selectedTab === 0 || selectedTab === 1) {
        await handleOtherTemplateActions(options, selectedRowData, true, true);
      } else if (selectedTab === 2) {
        await getMonthWiseFile(rowId);
      }
    };

    fetchData();
  }, [selectedTab, rowId]);

  useEffect(() => {
    if (selectedTab === 3 && rowId && hasPdfEntry) {
      getUploadedFiles(rowId, options);
    }
  }, [selectedTab, rowId, hasPdfEntry]);


  const onSaveTemplateError = (error) => {
    setIsValid(false);
  };

  const toggleSelectRow = (id) => {
    setSelectedIds((prevSelectedIds) => {
      const updated = prevSelectedIds.includes(id)
        ? prevSelectedIds.filter((selectedId) => selectedId !== id)
        : [...prevSelectedIds, id];

      console.log("Updated selectedIds:", updated);
      return updated;
    });
  };

  const handleOtherTemplateActions = async (options, selectedRow, searchFlag, fromUploadedFiles) => {

    const randomId = `random_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    setRandomApprovalId(randomId);

    let disabledEditFlag = false;
    let disabledDeleteFlag = false;

    let getTemplatePayload = {
      table_name: options.table || options,
      ui_case_id: selectedRow.id || selectedRow,
      case_io_id: selectedRow.field_io_name || "",
      pt_case_id: selectedRow?.pt_case_id || null,
      limit: 10,
      page: !searchFlag ? otherTemplatesPaginationCount : 1,
      search: !searchFlag ? otherSearchValue : "",
      from_date: !searchFlag ? othersFromDate : null,
      to_date: !searchFlag ? othersToDate : null,
      filter: !searchFlag ? othersFilterData : {},
    };


    // Permissions handling
    if (options.permissions) {
      try {
        const parsedPermissions = JSON.parse(options.permissions);

        if (parsedPermissions?.["add"]) {
          const hasAddPermission = parsedPermissions["add"].some(
            (p) => userPermissions?.[0]?.[p] === true
          );
          templateActionAddFlag.current = hasAddPermission;
        } else {
          templateActionAddFlag.current = true;
        }

        if (parsedPermissions?.["edit"]) {
          const hasEditPermission = parsedPermissions["edit"].some(
            (p) => userPermissions?.[0]?.[p] === true
          );
          disabledEditFlag = hasEditPermission;
        } else {
          disabledEditFlag = true;
        }

        if (parsedPermissions?.["delete"]) {
          const hasDeletePermission = parsedPermissions["delete"].some(
            (p) => userPermissions?.[0]?.[p] === true
          );
          disabledDeleteFlag = hasDeletePermission;
        } else {
          disabledDeleteFlag = true;
        }
      } catch (e) {
        console.warn("Failed to parse permissions", e);
      }
    }

    setLoading(true);

    try {
      const getTemplateResponse = await api.post("/templateData/getTemplateData", getTemplatePayload);
      setLoading(false);

      if (getTemplateResponse && getTemplateResponse.success) {
        const { meta } = getTemplateResponse;

        const currentDate = meta?.currentDate;
        const dayOfMonth = new Date(currentDate).getDate();
        const isSubmitAllowed = dayOfMonth >= 1 && dayOfMonth <= 5;
        setIsSubmitAllowed(isSubmitAllowed);

        const totalPages = meta?.meta?.totalPages;
        const totalItems = meta?.meta?.totalItems;

        setOtherTemplatesTotalPage(totalPages);
        setOtherTemplatesTotalRecord(totalItems);

        const records = getTemplateResponse.data || [];

        // Show/hide Replace PDF Button
        let showReplacePdf = false;
        if (selectedOtherTemplate?.table || options.table === "cid_ui_case_progress_report") {
          const anyHasPRStatus = records.some(record => record.field_pr_status === "Yes");
          if (!anyHasPRStatus) {
            showReplacePdf = true;
          }
        }

        setShowReplacePdfButton(showReplacePdf);

        // Submit logic
        let APisSubmited = false;
        let anySubmitAP = true;
        let isSupervisor = false;
        const userDesigId = localStorage.getItem('designation_id');

        if (records.length > 0) {
          const allAPWithSameSupervisor = records.every(
            record => (record.field_submit_status === "" || record.field_submit_status === null) &&
              record.supervisior_designation_id == userDesigId
          );

          const allAPWithoutIOSubmit = records.every(
            record => (record.sys_status === "ui_case") &&
              (record.field_submit_status === "" || record.field_submit_status === null) &&
              record.supervisior_designation_id != userDesigId
          );

          if (allAPWithSameSupervisor || allAPWithoutIOSubmit) {
            anySubmitAP = false;
          }

          if (allAPWithSameSupervisor) isSupervisor = true;

          APisSubmited = records.every(
            record => record.sys_status === "ui_case" ||
              (record.sys_status === "IO" &&
                (record.field_submit_status === "" || record.field_submit_status === null) &&
                record.supervisior_designation_id != userDesigId)
          );
        }

        setShowSubmitAPButton(anySubmitAP);
        setIsImmediateSupervisior(isSupervisor);
        setAPIsSubmited(APisSubmited);

        if (records[0]) {
          const excludedKeys = [
            "updated_at", "id", "deleted_at", "attachments", "Starred", "ReadStatus",
            "linked_profile_info", "sys_status", "field_submit_status",
            "supervisior_designation_id"
          ];

           const updatedHeader = [
            {
              field: "select",
              headerName: "",
              width: 50,
              cellClassName: (params) => getCellClassName("sl_no", params, options.table),
              renderCell: (params) => {
                const isPdfUpdated = params.row.field_pr_status === "Yes";
                const isPdfUpdating = params.row.field_status === "Completed";

                return isPdfUpdated || !isPdfUpdating ? null : (
                  <div onClick={(e) => e.stopPropagation()}>
                    <Checkbox onChange={() => toggleSelectRow(params.row.id)} />
                  </div>
                );
              },
            },
            {
              field: "sl_no",
              headerName: "S.No",
              resizable: false,
              width: 75,
              renderCell: (params) => {
                const isPdfUpdated = params.row.field_pr_status === "Yes";
                const userPermissions = JSON.parse(localStorage.getItem("user_permissions")) || [];
                const canDelete = userPermissions[0]?.action_delete;
                const isViewAction = options.is_view_action === true;

                return (
                  <Box sx={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    {params.value}
                    {canDelete && !isViewAction && !isPdfUpdated && (
                      <DeleteIcon
                        sx={{ cursor: "pointer", color: "red", fontSize: 20 }}
                        onClick={(event) => {
                          event.stopPropagation();
                          handleOthersDeleteTemplateData(params.row, options.table);
                        }}
                      />
                    )}
                  </Box>
                );
              },
            },
            {
              field: "sys_status",
              headerName: "From",
              width: 140,
              resizable: true,
              sortable: true,
              cellClassName: (params) => getCellClassName("sl_no", params, options.table),
              sortComparator: (v1, v2) => {
                if (v1 === "AP" && v2 === "ui_case") return -1;
                if (v1 === "ui_case" && v2 === "AP") return 1;
                return 0;
              },
              renderCell: (params) => {
                const statusText = params.value === "AP" ? "Action Plan" : "Progress Report";
                const isUpdated = params.value === "AP";

                return (
                  <Chip
                    label={statusText}
                    size="small"
                    sx={{
                      width: '120px',
                      fontFamily: "Roboto",
                      fontWeight: 600,
                      fontSize: "12px",
                      color: "#1f2937",
                      backgroundColor: isUpdated ? "#bfdbfe" : "#fef3c7",
                      borderRadius: "6px",
                      padding: "3px",
                      border: isUpdated ? "1px dashed #3b82f6" : "1px dashed #f59e0b",
                      textTransform: "capitalize",
                    }}
                  />
                );
              },
            },

            {
              field: "field_action_item",
              headerName: "Action Item",
              width: 200,
              resizable: true,
              cellClassName: (params) => getCellClassName("field_action_item", params, options.table),
              renderHeader: () => (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                  <span style={{ color: "#1D2939", fontSize: "15px", fontWeight: "500" }}>Action Item</span>
                </div>
              ),
              renderCell: (params) => {
                const isPdfUpdated = params.row.field_pr_status === "Yes";
                const userPermissions = JSON.parse(localStorage.getItem("user_permissions")) || [];
                const canEdit = userPermissions[0]?.action_edit;
                const isViewAction = options.is_view_action === true;
                const isEditAllowed = canEdit && !isViewAction && !isPdfUpdated;

                return (
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOthersTemplateDataView(params.row, false, options.table, !isEditAllowed);
                    }}
                    style={{
                      color: '#2563eb',
                      textDecoration: 'underline',
                      cursor: 'pointer',
                      fontWeight: 400,
                      fontSize: '14px'
                    }}
                  >
                    {params.value || 'View'}
                  </span>
                );
              }
            },

            ...Object.keys(getTemplateResponse.data[0])
              .filter((key) =>
                !excludedKeys.includes(key) &&
                ![
                  "field_action_item",
                  "created_at",
                  "field_pt_case_id",
                  "field_ui_case_id",
                  "field_pr_status",
                  "field_evidence_file",
                  "created_by",
                  "field_last_updated",
                  "field_date_created",
                  "field_description",
                  "field_assigned_to_id",
                  "field_assigned_by_id",
                  "field_served_or_unserved",
                  "field_reappear",
                  "hasFieldPrStatus"
                ].includes(key)
              )
              .map((key) => {
                const updatedKeyName = key
                  .replace(/^field_/, "")
                  .replace(/_/g, " ")
                  .toLowerCase()
                  .replace(/^\w|\s\w/g, (c) => c.toUpperCase());

                return {
                  field: key,
                  headerName: updatedKeyName || "",
                  width: 200,
                  resizable: true,
                  cellClassName: (params) => getCellClassName(key, params, options.table),
                  renderHeader: () => (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                      <span style={{ color: "#1D2939", fontSize: "15px", fontWeight: "500" }}>
                        {updatedKeyName || "-"}
                      </span>
                    </div>
                  ),
                  renderCell: (params) => tableCellRender(key, params, params.value),
                };
              }),

            {
              field: "field_pr_status",
              headerName: "PDF Status",
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
                const statusText = isUpdated ? "PDF Updated" : "Not Updated";
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

            ...(Object.keys(getTemplateResponse.data[0]).includes("created_at") ? [{
              field: "created_at",
              headerName: "Created At",
              width: 200,
              resizable: true,
              renderHeader: () => (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                  <span style={{ color: "#1D2939", fontSize: "15px", fontWeight: "500" }}>Created At</span>
                </div>
              ),
              renderCell: (params) => tableCellRender("created_at", params, params.row.created_at)
            }] : [])
          ].filter(Boolean);



          setOtherTemplateColumn(updatedHeader);
        }

        const formatDate = (value) => {
          const parsed = Date.parse(value);
          return isNaN(parsed) ? value : new Date(parsed).toLocaleDateString("en-GB");
        };

        const updatedTableData = records.map((field, index) => {
          const updatedField = {};

          Object.keys(field).forEach((key) => {
            updatedField[key] = (field[key] && isValidISODate(field[key])) ? formatDate(field[key]) : field[key];
          });

          return {
            ...updatedField,
            sl_no: (otherTablePagination - 1) * 10 + (index + 1),
            ...(field.id ? {} : { id: `unique_id_${index}` }),
          };
          
        });

        setOtherTemplateData(updatedTableData);

        if (options.table === "cid_ui_case_progress_report" && options.is_pdf && !fromUploadedFiles) {
          await checkPdfEntryStatus(selectedRow.id);
          await getUploadedFiles(selectedRow, options);
        }

        setOtherTemplateModalOpen(true);
      } else {
        console.warn("API call failed or returned no success flag.");
      }

      setOtherFormOpen(false);
      setOptionStepperData([]);
      setOptionFormTemplateData([]);
    } catch (error) {
      console.error("API Error:", error);
      setLoading(false);
      toast.error(error?.response?.data?.message || "Please try again!", {
        position: "top-right",
      });
    }
  };

  const handleOthersTemplateDataView = async (
    rowData,
    editData,
    table_name,
    disableEditButton
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
            setDisableEditButtonFlag(disableEditButton);

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

  const closeOtherForm = () => {
    setOtherFormOpen(false)
    setShowPtCaseModal(false);
    if (selectedOtherTemplate?.table === "cid_ui_case_action_plan") {
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

    if (tableName && index !== null && index === 0) {
      highlightColor = { color: '#0167F8', textDecoration: 'underline', cursor: 'pointer' };

      onClickHandler = (event) => { event.stopPropagation(); handleTemplateDataView(params.row, false, tableName, hoverTableOptions) };
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
          transaction_id : "TXN_" + Date.now() + "_" + Math.floor(Math.random() * 1000000),
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

    if (!selectedRow) {
      console.error("Invalid selectedRow for file retrieval:", selectedRow);
      return;
    }
    try {
      const response = await api.post("/templateData/getUploadedFiles", {
        ui_case_id: selectedRow,
      });

      if (response && response.success) {
        setUploadedFiles(response.data);
        handleOtherTemplateActions(options, selectedRow, false, true);
      }
    } catch (error) {
      console.error("Error fetching uploaded files:", error);
    }
  };

  const getMonthWiseFile = async (ui_case_id, page = 1) => {
    if (!ui_case_id) {
      console.error("Invalid ui_case_id for file retrieval:", ui_case_id);
      return;
    }
    try {
      const response = await api.post("/templateData/getMonthWiseByCaseId", {
        ui_case_id,
        page,
        limit: PageSize,
      });

      if (response && response.success) {
        setMonthwiseData(response.data || []);
        setMonthwiseTotalRecord(response.totalRecords || 0);
        setMonthwiseTotalPage(Math.ceil((response.totalRecords || 0) / PageSize));
        setMonthwiseCurrentPage(page);
      }
    } catch (error) {
      console.error("Error fetching monthwise files:", error);
    }
  };

  useEffect(() => {
    if (selectedRow) {
      getMonthWiseFile(selectedRow, 1);
    }
  }, [selectedRow]);


  const fileUploadTableView = (type, rowData, attachment, filePath) => {
    if (attachment && attachment !== "") {
      var separateAttachment = attachment.split(",");
      return (
        <Box
          sx={{ display: "flex", alignItems: "center", gap: "4px", cursor: "pointer", height: '100%' }}
          onClick={(e) => {
            e.stopPropagation();
            const url = `${process.env.REACT_APP_SERVER_URL_FILE_VIEW}/${filePath}`;
            window.open(url, "_blank");
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

      const viewTemplateData = await api.post("/templateData/viewTemplateData", viewTemplatePayload);
      setLoading(false);

      if (viewTemplateData && viewTemplateData.success) {

        const viewTableData = {
          table_name: table_name,
        };

        setLoading(true);
        try {
          const viewTemplateResponse = await api.post("/templates/viewTemplate", viewTableData);
          setLoading(false);

          if (viewTemplateResponse && viewTemplateResponse.success) {

            var actionTemplateMenus = hoverTableOptionsRef.current.map((element) => {

              if (element?.icon && typeof element.icon === 'function') {
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
              template_id: viewTemplateResponse?.["data"]?.template_id,
              template_name: viewTemplateResponse?.["data"]?.template_name,
              table_name: table_name
            }

            navigate("/caseView", { state: stateObj });

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

  const handleOthersFilter = async (selectedOptions) => {

    if (!selectedOptions?.table) {
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
            ...(field.is_dependent === "true" && { options: existingField?.options ? [...existingField.options] : [] }),
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

  const handleOtherClear = () => {
    setOtherSearchValue('');
    setOtherTemplatesPaginationCount(1);
    setOthersFromDate(null);
    setOthersToDate(null);
    setOthersFiltersDropdown([]);
    setOthersFilterData({});
    handleOtherTemplateActions(selectedOtherTemplate, selectedRowData, true)
  }

  const showOptionTemplate = async (tableName, approved) => {

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

    if (othersFilter) {

      selectedFilterDropdown = othersFiltersDropdown
      updatedFormData = { ...othersFilterData, [field.name]: selectedValue };

      setOthersFilterData(updatedFormData);

    } else {

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

            if (othersFilter) {
              setOthersFiltersDropdown(
                selectedFilterDropdown.map((element) => element.id === dependent_field[0].id ? { ...element, ...userUpdateFields } : element)
              );
              dependent_field.map((data) => {
                delete othersFilterData[data.name];
              });

              setOthersFilterData(updatedFormData);
            } else {
              setfilterDropdownObj(
                selectedFilterDropdown.map((element) => element.id === dependent_field[0].id ? { ...element, ...userUpdateFields } : element)
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

      if (others) {
        setOthersFiltersDropdown(updatedFieldsDropdown)
      } else {
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
        setSelectedTab(1);
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

  const onPR_FieldsUpdate = async (table_name, data) => {

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
      "field_brief_fact",
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
    formData.append("transaction_id", "TXN_" + Date.now() + "_" + Math.floor(Math.random() * 1000000));

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

  const otherTemplateSaveFunc = async (data, saveNewAction) => {

    if ((!selectedOtherTemplate.table || selectedOtherTemplate.table === "")) {
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

    formData.append("table_name", showPtCaseModal ? ptCaseTableName : selectedOtherTemplate.table);
    formData.append("data", JSON.stringify(normalData));
    formData.append("others_data", JSON.stringify(othersData));
    formData.append("transaction_id", randomApprovalId);
    formData.append("user_designation_id", localStorage.getItem('designation_id') ? localStorage.getItem('designation_id') : null);

    setLoading(true);

    try {
      const overallSaveData = await api.post("/templateData/saveDataWithApprovalToTemplates", formData);

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

        if (saveNewAction) {
          await handleOtherTemplateActions(selectedOtherTemplate, selectedRow);
          showOptionTemplate(selectedOtherTemplate.table);
        } else {
          handleOtherTemplateActions(selectedOtherTemplate, selectedRow);
        }

        setOtherFormOpen(false);

        if (selectedOtherTemplate?.field) {
          var combinedData = {
            id: selectedRowData.id,
            [selectKey.name]: selectedOtherFields.code,
          };

          // update func
          onUpdateTemplateData(combinedData);

          setSelectKey(null);
          setSelectedRow(null);
          setSelectedOtherFields(null);
          setselectedOtherTemplate(null);
          setOtherTemplateModalOpen(false);
        } else {
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

    if (selectedOtherTemplate.table === "cid_ui_case_progress_report") {
      normalData["field_pr_status"] = "No";
    }

    formData.append("table_name", selectedOtherTemplate.table);
    formData.append("id", data.id);
    formData.append("data", JSON.stringify(normalData));
    formData.append("transaction_id", randomApprovalId);
    formData.append("user_designation_id", localStorage.getItem("designation_id") || null);

    let othersData = {};

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
        });

        setSelectKey(null);
        setSelectedRow([]);
        setSelectedOtherFields(null);
        setselectedOtherTemplate(null);
        setSelectedUser(null);
        setSelectedRowIds([]);
        setSelectedParentId(null);
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

  const isSubmissionForCurrentMonth = (data) => {
    const now = new Date();
    return data.some(item => {
      const date = new Date(item.submission_date);
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    });
  };

  const handleSubmitClick = async () => {
    try {
      const response = await api.post("/templateData/getMonthWiseByCaseId", {
        ui_case_id: rowId,
        page: 1,
        limit: PageSize,
      });

      if (response?.success) {
        const hasCurrentMonthSubmission = isSubmissionForCurrentMonth(response.data || []);
        if (hasCurrentMonthSubmission) {
          handleUpdatePdfClick({
            selectedOtherTemplate,
            rowId,
            selectedIds,
            prUpdatePdf,
            submissionDate: null,
          });
        } else {
          setSubmissionDateDialogOpen(true);
        }
      } else {
        console.error("Failed to fetch month-wise data.");
      }
    } catch (err) {
      console.error("Error checking submission date:", err);
    }
  };

  const handleUpdatePdfClick = async ({ selectedOtherTemplate, rowId, selectedIds, prUpdatePdf ,submissionDate}) => {
    const getTemplatePayload = {
      table_name: selectedOtherTemplate?.table,
      ui_case_id: rowId,
    };

    if (!selectedIds || selectedIds.length === 0) {
      toast.error("Please choose a record to append.", {
        position: "top-right",
        autoClose: 3000,
        className: "toast-warning",
      });
      return;
    }

    setLoading(true);

    try {
      const getTemplateResponse = await api.post("/templateData/getTemplateData", getTemplatePayload);

      if (!getTemplateResponse?.success) {
        throw new Error(getTemplateResponse.message || "Failed to fetch template data.");
      }

      const dataToAppend = getTemplateResponse.data.filter(
        (item) => item.field_pr_status === "No"
      );

      const filteredDataToAppend = dataToAppend.filter(
        (item) => selectedIds.includes(item.id)
      );

      if (filteredDataToAppend.length === 0) {
        toast.error("These records have already been updated to the PDF.", {
          position: "top-right",
          autoClose: 3000,
          className: "toast-warning",
        });
        return;
      }

      const aoFieldValues = (await loadValueField(rowId, false, "cid_under_investigation")) || {};


      const aoFieldsToInclude = [
        "field_cid_crime_no./enquiry_no",
        "field_crime_number_of_ps",
        "field_name_of_the_police_station",
        "field_referring_agency",
        "field_dept_unit",
        "field_division",
      ];

      const filteredAOFieldValues = {};


        aoFieldsToInclude.forEach((key) => {
            const value = aoFieldValues[key];
            if (value !== undefined) {
                filteredAOFieldValues[key] = value;
            
                const field = aoFields.find(
                    (f) => f?.name === key && f.field_name === "Dropdown" && Array.isArray(f.options)
                );
            
                if (field) {
                    const matchedOption = field.options.find(
                    (opt) => opt?.code == value
                    );
            
                    if (matchedOption?.name) {
                        filteredAOFieldValues[key] = matchedOption.name;
                    }
                }
            } else {
                console.warn(`Field ${key} is missing or undefined.`);
            }
        });
      

      await prUpdatePdf({
        appendText: filteredDataToAppend,
        aoFields: filteredAOFieldValues,
        selectedIds,
        selectedRow: rowId,
        submissionDate
      });

    } catch (error) {
      console.error("Error in handleUpdatePdfClick:", error);
      toast.error("Error fetching template data. Please try again.", {
        position: "top-right",
        autoClose: 3000,
        className: "toast-error",
      });
    } finally {
      setLoading(false);
    }
  };

  const prUpdatePdf = async ({ appendText, aoFields, selectedIds, selectedRow }) => {
    setLoading(true);

    try {
      const payload = {
        selected_row_id: selectedIds,
        ui_case_id: selectedRow,
        appendText,
        aoFields,
        created_by: localStorage.getItem("user_id"),
        submission_date: submissionDate, 
      };

      const saveTemplateData = await api.post(
        "/templateData/appendToLastLineOfPDF",
        payload
      );

      if (saveTemplateData?.success) {
        toast.success(saveTemplateData.message || "Data appended successfully.", {
          position: "top-right",
          autoClose: 3000,
          className: "toast-success",
        });

        setOtherTemplateModalOpen(false);
        setSelectedIds([]);
        handleOtherTemplateActions("cid_ui_case_progress_report", selectedRow, true, true);
        getUploadedFiles(selectedRow, options);
      } else {
        toast.error(saveTemplateData.message || "Failed to append data.", {
          position: "top-right",
          autoClose: true,
          className: "toast-error",
        });
      }
    } catch (error) {
      console.error("Error during PDF update:", error);
      toast.error(
        error?.response?.data?.message || "Error appending to PDF. Try again!",
        {
          position: "top-right",
          autoClose: 3000,
          className: "toast-error",
        }
      );
    } finally {
      setLoading(false);
    }
  };


  return (
    <>
    <Box sx={{  overflow: 'auto' , height: '100vh'}}>
        <Box py={1} px={2} sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'start',}}>
            <Box
                sx={{
                width: '100%',
                bgcolor: 'background.paper',
                borderRadius: 2,
                zIndex: 1,
                }}
            >
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

                    {/* {selectedRowData?.["field_cid_crime_no./enquiry_no"] && ( */}
                    <Chip
                        label={headerDetails}
                        color="primary"
                        variant="outlined"
                        size="small"
                        sx={{ fontWeight: 500, mt: '2px' }}
                    />
                    {/* )} */}

                    {/* <Box className="totalRecordCaseStyle">
                    {otherTemplatesTotalRecord} Records
                    </Box> */}

                    {/* {APIsSubmited && (
                    <Box className="notifyAtTopCaseStyle">
                        Submission request in progress. Awaiting SP approval.
                    </Box>
                    )} */}
                </Box>

                {/* {hasPdfEntry && ( */}
                    <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                    <Box
                        sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        alignItems: { xs: 'stretch', sm: 'center' },
                        justifyContent: 'space-between',
                        width: '100%',
                        gap: 2,
                        }}
                    >
                        <Box sx={{ display: 'none' }}></Box>

                        <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: { xs: 'stretch', sm: 'flex-end' },
                            flexGrow: 1,
                        }}
                        >
                        <TextFieldInput
                            InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                <SearchIcon sx={{ color: "#475467" }} />
                                </InputAdornment>
                            ),
                            // endAdornment: (
                            //     <Box sx={{ display: "flex", alignItems: "center" }}>
                            //     <IconButton
                            //         sx={{ px: 1, borderRadius: 0 }}
                            //         onClick={() => handleOthersFilter(selectedOtherTemplate)}
                            //     >
                            //         <FilterListIcon sx={{ color: "#475467" }} />
                            //     </IconButton>
                            //     </Box>
                            // ),
                            }}
                            onInput={(e) => setOtherSearchValue(e.target.value)}
                            value={otherSearchValue}
                            id="tableSearch"
                            size="small"
                            placeholder="Search"
                            variant="outlined"
                            className="profileSearchClass"
                            onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                handleOtherTemplateActions(selectedOtherTemplate, selectedRowData);
                            }
                            }}
                            sx={{
                            width: { xs: '100%', sm: '250px' },
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
                                textAlign: { xs: 'left', sm: 'right' },
                            }}
                            >
                            Clear Search
                            </Typography>
                        )}
                        </Box>

                        <Box
                        sx={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 1.5,
                            justifyContent: 'flex-end',
                            marginLeft: 'auto',
                        }}
                        >
                        <Button
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
                            onClick={() => showOptionTemplate(selectedOtherTemplate?.table)}
                        >
                            Add New
                        </Button>

                        {/* {showReplacePdfButton && (
                            <Button
                            variant="outlined"
                            component="label"
                            sx={{
                                height: '40px',
                                borderColor: '#d32f2f',
                                color: '#d32f2f',
                                textTransform: 'none',
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
                        )} */}

                        <Button
                            onClick={handleSubmitClick}
                            variant="contained"
                            disabled={!isSubmitAllowed}
                            sx={{
                            height: '38px',
                            backgroundColor: '#12B76A',
                            color: 'white',
                            textTransform: 'none',
                            marginLeft: 'auto',
                            mr: 3,
                            }}
                        >
                            Submit
                        </Button>
                        {/* {
                            showMagazineView && 
                            <Button
                                onClick={()=>showMagazineView(false)}
                                sx={{height: "38px", textTransform: 'none'}}
                                className="whiteBorderedBtn"
                            >
                                Case Docket
                            </Button>
                        } */}
                        </Box>
                    </Box>
                    </Box>
                {/* // )} */}

                </Box>

                {/* {!hasPdfEntry ? (
                <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    height="200px"
                >
                    <Typography>Please Upload your Progress Report Pdf</Typography>
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
                ) : ( */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                <Box pt={1} sx={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                  <Box className="parentFilterTabs">
                    {["General Info", "Actions", "Monthwise PDF", "Final PDF"].map((label, index) => (
                      <Box
                        key={label}
                        onClick={() => setSelectedTab(index)}
                        className={`filterTabs ${selectedTab === index ? "Active" : ""}`}
                      >
                        {label}
                      </Box>
                    ))}
                  </Box>
                </Box>


                    {selectedTab === 0 && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, marginBottom: '10px', marginTop: '30px' }}>
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
                                .map((field, index) => (
                                <Grid item xs={6} key={index}>
                                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                    <label style={{ fontWeight: 'bold', color: 'black', marginRight: '10px' }}>
                                        {field.label}
                                    </label>
                                    <Tooltip title="Save">
                                        <SaveIcon
                                        onClick={() => onPR_FieldsUpdate("cid_under_investigation", filterAoValues)}
                                        sx={{
                                            color: '#1570EF',
                                            padding: '0 1px',
                                            fontSize: '25px',
                                            verticalAlign: 'middle',
                                            cursor: 'pointer',
                                            pointerEvents: 'auto',
                                            marginBottom: '2px',
                                        }}
                                        />
                                    </Tooltip>
                                    </div>
                                    <TextField
                                    fullWidth
                                    multiline
                                    minRows={10}
                                    maxRows={10}
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
                </Box>
                {/* )} */}

                {selectedTab === 1 && (
                <Box>
                    <TableView
                    key={randomApprovalId}
                    rows={otherTemplateData}
                    columns={otherTemplateColumn}
                    totalPage={otherTemplatesTotalPage}
                    totalRecord={otherTemplatesTotalRecord}
                    paginationCount={otherTemplatesPaginationCount}
                    handlePagination={handleOtherPagination}
                    // handleRowClick={(row) =>
                    //   handleOthersTemplateDataView(row, false, selectedOtherTemplate?.table)
                    // }
                    tableName={selectedOtherTemplate?.table}
                    />
                </Box>
                )}

                {selectedTab === 2 && (
                <Box>
                    <TableView
                    rows={monthwiseData}
                    columns={monthwiseColumns}
                    totalPage={monthwiseTotalPage}
                    totalRecord={monthwiseTotalRecord}
                    paginationCount={monthwiseCurrentPage}
                    handlePagination={handleMonthwisePagination}
                    />
                </Box>
                )}

                {selectedTab === 3 && (
                  <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    marginTop="50px"
                  >
                    <Typography variant="h6">Preview Uploaded PDF</Typography>

                    {uploadedFiles.length > 0 && uploadedFiles[0].file_path ? (
                      (() => {
                        const filePath = uploadedFiles[0].file_path.replace(/\\/g, '/');
                        const fullUrl = `${process.env.REACT_APP_SERVER_URL_FILE_VIEW}/${filePath}`;
                        return (
                          <iframe
                            src={fullUrl}
                            width="100%"
                            height="500px"
                            style={{ border: 'none' }}
                            allow="fullscreen"
                            title="Uploaded PDF Preview"
                          />
                        );
                      })()
                    ) : (
                      <Typography>No PDF found.</Typography>
                    )}
                  </Box>
                )}

            </Box>
        </Box>
    </Box>


      {otherFormOpen && (
        <Dialog
          open={otherFormOpen}
          onClose={() => closeOtherForm}
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
                  onSubmit={otherTemplateSaveFunc}
                  onUpdate={otherTemplateUpdateFunc}
                  disableEditButton={disableEditButtonFlag}
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

      <Dialog 
        open={submissionDateDialogOpen} 
        onClose={() => setSubmissionDateDialogOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Select Submission Date</DialogTitle>
        <DialogContent>
          <TextField
            type="date"
            fullWidth
            value={submissionDate || ""}
            onChange={(e) => setSubmissionDate(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSubmissionDateDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={() => {
              setSubmissionDateDialogOpen(false);
              handleUpdatePdfClick({
                selectedOtherTemplate,
                rowId,
                selectedIds,
                prUpdatePdf,
                submissionDate
              });
            }}
            variant="contained"
            disabled={!submissionDate}
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>


      {loading && (
        <div className="parent_spinner" tabIndex="-1" aria-hidden="true">
          <CircularProgress size={100} />
        </div>
      )}


    </>
  );
};


export default ProgressReport;