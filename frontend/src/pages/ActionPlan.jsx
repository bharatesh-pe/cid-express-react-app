import {  useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import NormalViewForm from "../components/dynamic-form/NormalViewForm";
import TableView from "../components/table-view/TableView";
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import api from "../services/api";
import {  Chip, Tooltip } from "@mui/material";
import {
  Box,
  Button,
  FormControl,
  InputAdornment,
  Typography,
  IconButton,
  Checkbox,
  Grid,
  TextField,
} from "@mui/material";
import TextFieldInput from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import SearchIcon from "@mui/icons-material/Search";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import FilterListIcon from "@mui/icons-material/FilterList";
import MultiSelect from "../components/form/MultiSelect";
import AutocompleteField from "../components/form/AutoComplete";
import ShortText from "../components/form/ShortText";
import WestIcon from '@mui/icons-material/West';

const ActionPlan = ({templateName, headerDetails, rowId, options, selectedRowData, backNavigation}) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { pageCount, systemStatus } = location.state || {};
    const [disableEditButtonFlag, setDisableEditButtonFlag] = useState(false);
    const [aoFields, setAoFields] = useState([]);
    const [aoFieldId,setAoFieldId] = useState(selectedRowData);
    const [filterAoValues, setFilterAoValues] = useState({});
    const [viewModeOnly,setViewModeOnly] = useState(false);
    const [isFromEdit, setIsFromEdit] = useState(false);
    const [selectedApprovalEdit,setSelectedApprovalEdit] = useState(null);
    var userPermissions = JSON.parse(localStorage.getItem("user_permissions")) || [];
    const templateActionAddFlag = useRef(false);
    const attachmentEditFlag = useRef(false);
    const [totalPage, setTotalPage] = useState(0);
    const [totalRecord, setTotalRecord] = useState(0);
    const [filterDropdownObj, setfilterDropdownObj] = useState([]);
    const [filterValues, setFilterValues] = useState({});
    const [fromDateValue, setFromDateValue] = useState(null);
    const [toDateValue, setToDateValue] = useState(null);
    const [showSubmitAPButton, setShowSubmitAPButton] = useState(false);
    const [isImmediateSupervisior, setIsImmediateSupervisior] = useState(false); 
    const [ImmediateSupervisiorId, setImmediateSupervisiorId] = useState(0); 
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
    const handleOtherPagination = (page) => {
        setOtherTemplatesPaginationCount(page)
    }   
    const [paginationCount, setPaginationCount] = useState(pageCount ? pageCount : 1);
    const [tableSortOption, settableSortOption] = useState("DESC");
    const [tableSortKey, setTableSortKey] = useState("");
    const [tableData, setTableData] = useState([]);
    const [isValid, setIsValid] = useState(false);
    const [searchValue, setSearchValue] = useState(null);
    const [table_name, setTable_name] = useState("");
    const [sysStatus, setSysSattus] = useState(systemStatus ? systemStatus : "ui_case");
    const [formOpen, setFormOpen] = useState(false);
    const [formTemplateData, setFormTemplateData] = useState([]);
    const [initialData, setInitialData] = useState({});
    const [viewReadonly, setviewReadonly] = useState(false);
    const [editTemplateData, setEditTemplateData] = useState(false);
    const [selectedRowIds, setSelectedRowIds] = useState([]);
    const [otherFormOpen, setOtherFormOpen] = useState(false);
    const [optionStepperData, setOptionStepperData] = useState([]);
    const [optionFormTemplateData, setOptionFormTemplateData] = useState([]);
    const [starFlag, setStarFlag] = useState(null);
    const [readFlag, setReadFlag] = useState(null);
    const [loading, setLoading] = useState(false); // State for loading indicator
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
    const [hoverTableOptions, setHoverTableOptions] = useState([]);
    const [otherTablePagination, setOtherTablePagination] = useState(1);
    const [selectedRow, setSelectedRow] = useState(selectedRowData);
    const [selectedOtherFields, setSelectedOtherFields] = useState(null);
    const [selectKey, setSelectKey] = useState(null);
    const [randomApprovalId, setRandomApprovalId] = useState(0);
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
    }, []);

    useEffect(()=>{
        handleOtherTemplateActions(selectedOtherTemplate, selectedRowData)
    },[otherTemplatesPaginationCount]);

    

    const onSaveTemplateError = (error) => {
        setIsValid(false);
    };

    const handleOtherTemplateActions = async (options, selectedRow, searchFlag) => {

        const randomId = `random_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        var disabledEditFlag = false;
        var disabledDeleteFlag = false;  
        setRandomApprovalId(randomId);

        console.log("checking selectedRow",selectedRow);
        var getTemplatePayload = {
            table_name: options.table,
            ui_case_id: selectedRow.id,
            case_io_id: selectedRow?.field_io_name || "",
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
                    if (records && records.length > 0) {

                        // Get supervisor-specific records
                        const supervisorRecords = records.filter(
                            record => record.supervisior_designation_id == userDesigId
                        );

                        // Assign the first matched supervisor_designation_id (if available)
                        if (supervisorRecords.length > 0) {
                            setImmediateSupervisiorId(supervisorRecords[0].supervisior_designation_id);
                        }
                        
                        let allAPWithOutSupervisorSubmit = false;

                        for (let i = 0; i < supervisorRecords.length; i++) {
                            const status = supervisorRecords[i]['field_submit_status'];
                            if (status === "" || status === null) {
                                allAPWithOutSupervisorSubmit = true;
                                console.log("Set allAPWithOutSupervisorSubmit to true");
                                break;
                            }
                        }
                    
                        // Get non-supervisor records with sys_status "ui_case"
                        const ioRecords = records.filter(
                            record =>
                                record.sys_status === "ui_case" &&
                                record.supervisior_designation_id != userDesigId
                        );
                    
                        // Check if all IO records are NOT submitted
                        const allAPWithOutIOSubmit = ioRecords.length > 0 &&
                            ioRecords.every(
                                record => record.field_submit_status === "" || record.field_submit_status === null
                            );
                    
                        // Set flags accordingly
                        if (allAPWithOutSupervisorSubmit || allAPWithOutIOSubmit) {
                            anySubmitAP = false;
                        }
                    
                        if (allAPWithOutSupervisorSubmit) {
                            isSuperivisor = true;
                        }
                    
                        // APisSubmited logic with clear grouping
                        APisSubmited = records.every(record =>
                            record.sys_status === "ui_case" ||
                            (
                                record.sys_status === "IO" &&
                                (record.field_submit_status === "" || record.field_submit_status === null) &&
                                record.supervisior_designation_id != userDesigId
                            )
                        );
                    
                    } else {
                        anySubmitAP = false;
                    }

                    
                    console.log('anySubmitAP',anySubmitAP);

                    console.log('isSuperivisor',isSuperivisor)
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
                            {
                                field: "sl_no",
                                headerName: "S.No",
                                resizable: false,
                                width: 75,
                                renderCell: (params) => {
                                    const userPermissions = JSON.parse(localStorage.getItem("user_permissions")) || [];
                                    const canDelete = userPermissions[0]?.action_delete;
                                    const isViewAction = options.is_view_action === true;
                                    let isActionPlan = false;

                                    if (params.row.sys_status === 'IO' && params.row.supervisior_designation_id != localStorage.getItem('designation_id')) {
                                        isActionPlan = true;
                                    } else if ((params.row.sys_status === 'IO' || params.row.sys_status === 'ui_case') && params.row.field_submit_status === '' && params.row.supervisior_designation_id == localStorage.getItem('designation_id')) {
                                        isActionPlan = false;
                                    } else if (params.row.field_submit_status === 'submit' || params.row.sys_status === 'IO') {
                                        isActionPlan = true;
                                    }

                                    return (
                                        <Box sx={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                            {params.value}
                                            {canDelete && !isViewAction && !isActionPlan && (
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

                            ...Object.keys(getTemplateResponse.data[0]).filter(
                                (key) =>
                                    !excludedKeys.includes(key) &&
                                    ![
                                        "field_pt_case_id",
                                        "field_ui_case_id",
                                        "field_pr_status",
                                        "field_evidence_file",
                                        "created_by",
                                        "created_at",
                                        "field_last_updated",
                                        "field_date_created",
                                        "field_description",
                                        "field_assigned_to_id",
                                        "field_assigned_by_id",
                                        "field_served_or_unserved",
                                        "field_reappear",
                                        "hasFieldPrStatus"
                                    ].includes(key)
                            ).map((key) => {
                                const updatedKeyName = key.replace(/^field_/, "").replace(/_/g, " ").toLowerCase().replace(/^\w|\s\w/g, (c) => c.toUpperCase());

                                return {
                                    field: key,
                                    headerName: updatedKeyName || "",
                                    width: 250,
                                    resizable: true,
                                    renderHeader: () => (
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                                            <span style={{ color: "#1D2939", fontSize: "15px", fontWeight: "500" }}>
                                                {updatedKeyName || "-"}
                                            </span>
                                        </div>
                                    ),
                                    renderCell: (params) => {
                                        if (key === "field_action_item") {
                                            const userPermissions = JSON.parse(localStorage.getItem("user_permissions")) || [];
                                            const canEdit = userPermissions[0]?.action_edit;
                                            const isViewAction = options.is_view_action === true;
                                            let isActionPlan = false;

                                            if (params.row.sys_status === "IO" && params.row.supervisior_designation_id != localStorage.getItem("designation_id")) {
                                                isActionPlan = true;
                                            } else if (
                                                (params.row.sys_status === "IO" || params.row.sys_status === "ui_case") &&
                                                params.row.field_submit_status === "" &&
                                                params.row.supervisior_designation_id == localStorage.getItem("designation_id")
                                            ) {
                                                isActionPlan = false;
                                            } else if (params.row.field_submit_status === "submit" || params.row.sys_status === "IO") {
                                                isActionPlan = true;
                                            }

                                            const isEditAllowed = canEdit && !isViewAction && !isActionPlan;

                                            return (
                                                <span
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleOthersTemplateDataView(params.row, false, options.table, !isEditAllowed);
                                                    }}
                                                    style={{
                                                        color: "#2563eb",
                                                        textDecoration: "underline",
                                                        cursor: "pointer",
                                                        fontWeight: 400,
                                                        fontSize: "14px",
                                                    }}
                                                >
                                                    {params.value || "View"}
                                                </span>
                                            );
                                        }

                                        return tableCellRender(key, params, params.value);
                                    }
                                };
                            }),

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
                    if(options.is_view_action === true){
                        setViewModeOnly(true)
                    }
                    else{
                        setViewModeOnly(false)
                    }
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

    const closeOtherForm = ()=>{
        setOtherFormOpen(false)
        if(selectedOtherTemplate?.table === "cid_ui_case_action_plan"){
            handleOtherTemplateActions(selectedOtherTemplate, selectedRowData)
        }
    }

    const tableCellRender = (key, params, value, index, tableName) => {
    
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
                  
                    if(!selectedOtherTemplate?.field){
                        handleOtherTemplateActions(selectedOtherTemplate, selectedRow)
                    }else{
                        loadTableData(paginationCount);
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
                    handleOtherTemplateActions("cid_ui_case_action_plan");
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
    
        if ((!selectedOtherTemplate.table || selectedOtherTemplate.table === "")) {
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
      
        
        normalData.sys_status = isImmediateSupervisior ? "IO" : "ui_case";
        normalData.field_submit_status = "";
        normalData["ui_case_id"] = selectedRowData.id;
        formData.append("table_name", selectedOtherTemplate.table);
        formData.append("data", JSON.stringify(normalData));
        formData.append("transaction_id", randomApprovalId);
        formData.append("user_designation_id", localStorage.getItem('designation_id') || null);
        formData.append("immediate_supervisior_id", ImmediateSupervisiorId || null);
      
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
              showOptionTemplate('cid_ui_case_action_plan');
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
        normalData.sys_status = "ui_case";
        normalData["ui_case_id"] = selectedRowData.id;
    
        var othersData = {};
    
    
        formData.append("table_name", selectedOtherTemplate.table);
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
    
               if(saveNewAction){
                  await handleOtherTemplateActions(selectedOtherTemplate, selectedRow);   
                  showOptionTemplate('cid_ui_case_action_plan');
                }else{
                  handleOtherTemplateActions(selectedOtherTemplate, selectedRow);
                }
    
                setOtherFormOpen(false);
    
                if(selectedOtherTemplate?.field){
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
              onOpen: () => {
                  loadTableData(paginationCount);
              },
            });
    
            setSelectKey(null);
            setSelectedRow([]);
            setSelectedOtherFields(null);
            setselectedOtherTemplate(null);
            setSelectedRowIds([]);
    
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

 
    return (
        <>
        <Box sx={{  overflow: 'auto' , height: '100vh'}}>
            <Box pb={1} px={1} sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'start',}}>
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

                            {APIsSubmited && !isImmediateSupervisior && (
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
                                        onClick={() => showOptionTemplate('cid_ui_case_action_plan')}
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
            <DialogContent sx={{ minWidth: "400px", padding: '0'}}>
                <DialogContentText id="alert-dialog-description">
                <FormControl fullWidth>
                    <NormalViewForm
                    table_row_id={otherRowId}
                    template_id={otherTemplateId}
                    template_name={ selectedOtherTemplate?.name}
                    table_name={selectedOtherTemplate?.table}
                    readOnly={otherReadOnlyTemplateData}
                    editData={otherEditTemplateData}
                    initialData={otherInitialTemplateData}
                    formConfig={optionFormTemplateData}
                    stepperData={optionStepperData}
                    onSubmit={otherAPPRTemplateSaveFunc}
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
        </>
    );    
};

export default ActionPlan;