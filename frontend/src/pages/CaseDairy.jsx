import {
    Box,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Typography,
    Button,
    TextField,
    IconButton,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    CircularProgress,
    InputAdornment,
} from "@mui/material";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { West } from '@mui/icons-material';
import TextFieldInput from "@mui/material/TextField";
import SearchIcon from "@mui/icons-material/Search";

import SaveIcon from "@mui/icons-material/Save";
import PrintIcon from "@mui/icons-material/Print";
import { useEffect, useRef, useState } from "react";
import api from "../services/api";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import TableView from "../components/table-view/TableView";
import NormalViewForm from "../components/dynamic-form/NormalViewForm";

const CaseDairy = ({ actionArray, ui_case_id, pt_case_id, closeForm }) => {
    const [loading, setLoading] = useState(false);

    const [dateWiseData, setDateWiseData] = useState([]);
    const [expandedDates, setExpandedDates] = useState([]);
    const [comments, setComments] = useState({});

    useEffect(() => {
        const filteredActions = actionArray.filter((action) => action.table);

        const gettingData = async () => {
            const payload = {
                table_name: filteredActions.map((e) => e.table),
                ui_case_id,
                pt_case_id,
            };
            try {
                const response = await api.post("/templateData/getDateWiseTableCounts", payload);
                if (response?.success) {
                    const transformedData = response.data.map((item) => ({
                        date: item.date,
                        tables: Object.entries(item)
                            .filter(([key]) => key !== "date")
                            .map(([table, count]) => ({
                                table,
                                count,
                                label: actionArray.find((a) => a.table === table)?.name || table,
                            })),
                    }));
                    setDateWiseData(transformedData);
                } else {
                    toast.error(response.message || "Failed to fetch data.", {
                        position: "top-right",
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

        if (filteredActions.length > 0) gettingData();
    }, [actionArray, ui_case_id, pt_case_id]);

    const handleAccordionChange = (date) => (_, isExpanded) => {
        setExpandedDates((prev) =>
            isExpanded ? [...prev, date] : prev.filter((d) => d !== date)
        );
    };

    const handleCommentChange = (date, table, value) => {
        setComments((prev) => ({
            ...prev,
            [date]: {
                ...(prev[date] || {}),
                [table]: value,
            },
        }));
    };

    const handleSave = (date) => {
        const dataToSave = comments[date] || {};
        console.log("Saving for:", date, dataToSave);
    };

    const handlePrint = (date) => {
        console.log("Print clicked for:", date);
    };


    const [tableShow, setTableShow] = useState(false);

    const paginationCount = useRef(1);
    const [searchValue, setSearchValue] = useState("");

    const [tableTotalPage, setTableTotalPage] = useState(0);
    const [tableTotalRecord, setTableTotalRecord] = useState(0);

    const [tableRowData, setTableRowData] = useState([]);
    const [tableColumnData, setTableColumnData] = useState([]);
    
    const [selectedObj, setSelectedObj] = useState({});
    
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

    const [formOpen, setFormOpen] = useState(false);
    const [selectedRowId, setSelectedRowId] = useState(null);
    const [selectedTemplateId, setSelectedTemplateId] = useState(null);
    const [selectedTableName, setSelectedTableName] = useState(null);
    const [selectedTemplateName, setSelectedTemplateName] = useState(null);
    const [readonlyForm, setReadonlyForm] = useState(null);
    const [editOnlyForm, setEditOnlyForm] = useState(null);

    const [formFields, setFormFields] = useState([]);
    const [initalFormData, setInitialFormData] = useState({});
    const [formStepperData, setFormStepperData] = useState([]);

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
                    setEditOnlyForm(false);
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

    const closeAddForm = async ()=>{
        setFormOpen(false);
    }


    const getIndividualTableData = async (table, date, clearFilter)=>{

        try {
            const payload = {
                table_name : table,
                date : date,
                ui_case_id,
                pt_case_id,
                limit: 10,
                page: clearFilter ? "1" : paginationCount.current,
                search: clearFilter ? "" : searchValue || ""
            }

            const response = await api.post("/templateData/getTemplateDataWithDate", payload);

            if(response?.success && response?.data){

                const { meta, data } = response.data;
                
                const totalPages = meta?.totalPages;
                const totalItems = meta?.totalItems;

                if (totalPages !== null && totalPages !== undefined) {
                    setTableTotalPage(totalPages);
                }
                
                if (totalItems !== null && totalItems !== undefined) {
                    setTableTotalRecord(totalItems);
                }

                const generateReadableHeader = (key) =>key.replace(/^field_/, "").replace(/_/g, " ").toLowerCase().replace(/^\w|\s\w/g, (c) => c.toUpperCase());
                
                const renderCellFunc = (key, count) => (params) => tableCellRender(key, params, params.value, count, table);

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
                            sl_no: (paginationCount.current - 1) * 10 + (index + 1),
                            ...(field.id ? {} : { id: "unique_id_" + index }),
                        };
                    });

                    setTableColumnData(updatedHeader);
                    setTableRowData(updatedTableData);
                }else{
                    setTableColumnData([]);
                    setTableRowData([]);
                }

                setTableShow(true);
                setSelectedObj({
                    table,
                    date
                })

            }else{
                
                setTableColumnData([]);
                setTableRowData([]);

                toast.error(response.message || "Failed to fetch data.", {
                    position: "top-right",
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

            setTableColumnData([]);
            setTableRowData([]);

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

    }
    
    const handlePagination = (page) => {
        paginationCount.current = page
        getIndividualTableData(selectedObj.table, selectedObj.date);
    }

    const searchTableData = ()=>{
        paginationCount.current = 1
        getIndividualTableData(selectedObj.table, selectedObj.date);
    }
    
    const handleClear = () => {
        paginationCount.current = 1
        setSearchValue("");
        getIndividualTableData(selectedObj.table, selectedObj.date, true);
    };

    return (
        <Box sx={{height : '100vh', overflowY: 'auto', p: 2}}>

            <Typography
                sx={{ fontSize: "19px", fontWeight: "500", color: "#171A1C", display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', mb: 2 }}
                className="Roboto"
                onClick={() => closeForm?.()}
            >
                <West />
                <Typography sx={{ fontSize: '19px', fontWeight: '500', color: '#171A1C' }} className='Roboto'>
                    {'Case Dairy'}
                </Typography>
            </Typography>    

            <Box
                sx={{
                    width: "100%",
                    borderRadius: 2,
                    overflow: "hidden",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
                    backgroundColor: "#fff",
                    paddingBottom: '100px'
                }}
            >
                {dateWiseData.length === 0 ? (
                    <Box sx={{ p: 3, textAlign: "center" }}>
                        <Typography variant="body2" color="text.secondary">
                            No case diary entries found
                        </Typography>
                    </Box>
                ) : (
                    dateWiseData.map(({ date, tables }, index) => (
                        <Accordion
                            key={date}
                            expanded={expandedDates.includes(date)}
                            onChange={handleAccordionChange(date)}
                            sx={{
                                "&:before": { display: "none" },
                                borderBottom: "1px solid #e2e8f0",
                                transition: "all 0.2s ease-in-out",
                            }}
                        >
                            <AccordionSummary
                                expandIcon={null}
                                sx={{
                                    background: '#f3f4f6',
                                    borderBottom: `1px solid #c4c4c433`,
                                    minHeight: "56px !important",
                                    px: 2,
                                }}
                            >
                                <Box
                                    sx={{
                                        width: "100%",
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                    }}
                                >
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        <Box
                                            sx={{
                                                borderRadius: "50%",
                                                border: `1px solid #14b473`,
                                                width: 15,
                                                height: 15,
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                transition: "all 0.3s ease-in-out",
                                            }}
                                        >
                                            {expandedDates.includes(date) ? (
                                                <ExpandLessIcon sx={{ fontSize: 20, color: "#14b473" }} />
                                            ) : (
                                                <ExpandMoreIcon sx={{ fontSize: 20, color: "#14b473" }} />
                                            )}
                                        </Box>
                                        <Typography
                                            variant="subtitle1"
                                            sx={{
                                                fontWeight: 500,
                                                fontSize: '15px',
                                                color: "#000",
                                            }}
                                        >
                                            {new Date(date).toLocaleDateString("en-GB", {
                                                day: "2-digit",
                                                month: "short",
                                                year: "numeric",
                                            }).replace(/ /g, "/")}
                                        </Typography>
                                    </Box>

                                    <Box sx={{ display: "flex", gap: 1 }}>
                                        <Button
                                            size="small"
                                            variant="contained"
                                            startIcon={<SaveIcon />}
                                            onClick={() => handleSave(date)}
                                            className="blueButton"
                                            sx={{ fontSize: "0.75rem", padding: "0px 16px", height: '30px !important' }}
                                        >
                                            Save
                                        </Button>
                                        <Tooltip title="Print">
                                            <IconButton
                                                size="small"
                                                onClick={() => handlePrint(date)}
                                                sx={{ color: "#475569" }}
                                            >
                                                <PrintIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                </Box>
                            </AccordionSummary>

                            <AccordionDetails sx={{ p: '8px 0px', bgcolor: "#fff" }}>
                                <Box
                                    component="table"
                                    sx={{
                                        width: "100%",
                                        borderCollapse: "collapse",
                                        border: '1px solid #e2e8f0',
                                        "& th, & td": {
                                            padding: "12px 16px",
                                            fontSize: "0.875rem",
                                        },
                                        "& th": {
                                            backgroundColor: "#488aec",
                                            color: "#FFFFFF",
                                            textAlign: "left",
                                            borderBottom: "1px solid #e2e8f0",
                                            fontWeight: 600,
                                            fontSize: "14px"
                                        },
                                        "& td": {
                                            borderBottom: "1px solid #e2e8f0",
                                        },
                                        "& tr:last-child td": {
                                            borderBottom: "none",
                                        },
                                        "& tr:nth-of-type(even)": {
                                            backgroundColor: "#f9fafb",
                                        },
                                    }}
                                >
                                    <thead>
                                        <tr>
                                            <th style={{fontSize: '16px', fontWeight: '600', width: '15%'}}>Investigations</th>
                                            <th style={{ width: '7%'}}>Count</th>
                                            <th>Remarks</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tables.map(({ table, count, label }) => (
                                            <tr key={table} sx={{border: '1px solid #e2e8f0'}}>
                                                <td style={{padding: "12px 16px", fontSize: "14px", fontWeight: 400}}>
                                                    <Box 
                                                        sx={{
                                                            color: '#0167F8', 
                                                            textDecoration: 'underline', 
                                                            cursor: 'pointer'
                                                        }}

                                                        onClick={()=> getIndividualTableData(table, date)}
                                                    >
                                                        {label}
                                                    </Box>
                                                </td>
                                                <td>
                                                    <Box
                                                        sx={{
                                                            backgroundColor: "#e2e8f0",
                                                            borderRadius: "50%",
                                                            width: 35,
                                                            height: 35,
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                            transition: "all 0.3s ease-in-out",
                                                        }}
                                                    >
                                                        {count}
                                                    </Box>
                                                </td>
                                                <td>
                                                    <TextField
                                                        fullWidth
                                                        size="small"
                                                        placeholder="Remarks"
                                                        inputProps={{
                                                            style: { fontSize: '14px' }
                                                        }}
                                                        value={comments?.[date]?.[table] || ""}
                                                        onChange={(e) =>
                                                            handleCommentChange(date, table, e.target.value)
                                                        }
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Box>
                            </AccordionDetails>
                        </Accordion>
                    ))
                )}
            </Box>

            {loading && (
                <div className="parent_spinner" tabIndex="-1" aria-hidden="true">
                    <CircularProgress size={100} />
                </div>
            )}

            {
                tableShow &&
                <Dialog
                    open={tableShow}
                    onClose={()=>setTableShow(false)}
                    maxWidth="xl"
                    fullWidth
                    fullScreen
                    sx={{marginLeft: '50px'}}
                >
                    <Box display="flex" justifyContent="space-between" alignItems="center" px={3} py={2}>
                        <DialogTitle sx={{ fontWeight: 600, fontSize: '20px', p: 0, cursor: 'pointer' }} onClick={()=>setTableShow(false)}>
                            <IconButton>
                                <West sx={{color: '#333'}} />
                            </IconButton>
                            {actionArray.find((a) => a.table === selectedObj.table)?.name || selectedObj.table}
                        </DialogTitle>
                        <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'end'}}>
                            <TextFieldInput
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon sx={{ color: '#475467' }} />
                                        </InputAdornment>
                                    )
                                }}
                                onInput={(e) => setSearchValue(e.target.value)}
                                value={searchValue}
                                id="tableSearch"
                                size="small"
                                placeholder='Search..'
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
                            {searchValue && (
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

                    <DialogContent sx={{paddingY: '0 !important'}}>    
                        <Box sx={{ width: '100%' }}>
                            <TableView
                                rows={tableRowData}
                                columns={tableColumnData}
                                totalPage={tableTotalPage}
                                totalRecord={tableTotalRecord}
                                paginationCount={paginationCount.current}
                                handlePagination={handlePagination}
                            />
                        </Box>
                    </DialogContent>
                </Dialog>
            }

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
                            closeForm={closeAddForm}
                            noPadding={true}
                            disableEditButton={true}
                        />
                    </DialogContent>
                </Dialog>
            )}

        </Box>
    );
};

export default CaseDairy;
