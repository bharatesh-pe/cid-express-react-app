import { West } from "@mui/icons-material";
import { Autocomplete, Box, Button, Chip, CircularProgress, TextField, Typography, Table, TableBody, TableCell, TableRow, TextareaAutosize, } from "@mui/material";
import { useState } from 'react';
import dayjs from "dayjs";
import DateField from "../components/form/Date";
import TableView from "../components/table-view/TableView";
import { useEffect } from "react";
import { toast } from "react-toastify";
import api from "../services/api";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import RichTextEditor from "../components/form/RichTextEditor";


const ChargeSheetInvestigation = ({ template_name, headerDetails, tableRowId, options, rowData, module, backNavigation, overAllTemplateActions, cs_fir_cases_data }) => {

    const [loading, setLoading] = useState(false);

    const [fromDate, setFromDate] = useState(dayjs().format("YYYY-MM-DD"));
    const [toDate, setToDate] = useState(dayjs().format("YYYY-MM-DD"));

    const [investigationArray, setInvestigationArray] = useState([]);
    const [selectedInvestigation, setSelectedInvestigation] = useState(null);

    // investigation table states

    const [investigationViewTableRows, setInvestigationViewTableRows] = useState([]);
    const [investigationViewTableColumns, setInvestigationViewTableColumns] = useState(
        [
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
            {
                field: "investigation_module",
                headerName: "Investigation Module",
                width: 200,
                resizable: true,
                cellClassName: 'justify-content-start',
            },
        ]
    );

    const [investigationTablePagination, setInvestigationTablePagination] = useState(1);
    const [investigationTableRowCount, setInvestigationTableRowCount] = useState(0);
    const [investigationTableTotalPageCount, setInvestigationTableTotalPageCount] = useState(1);

    const [formData, setFormData] = useState({});
    const [alreadySaved, setAlreadySaved] = useState(false);

    const handlePagination = (page) => {
        setInvestigationTablePagination(page)
    }

    useEffect(()=>{

        if(overAllTemplateActions){
            var parsedArray = JSON.parse(overAllTemplateActions);

            var filteredInvestigationArray = parsedArray.filter((element)=>{

                if(element.table){
                    return element
                }

            });
    
            if(filteredInvestigationArray){
                setInvestigationArray(filteredInvestigationArray);
            }

        }

    },[overAllTemplateActions]);


    const getSelectedInvestigationData = async ()=>{

        if(!selectedInvestigation || !selectedInvestigation?.table){
            toast.error("Please Select Investigation Before Getting Data", {
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

        var ui_case_id = rowData?.id;
        var pt_case_id = rowData?.pt_case_id;

        if(module === "pt_case"){
            ui_case_id = rowData?.ui_case_id
            pt_case_id = rowData?.id
        }

        var getTemplatePayload = {
            table_name: selectedInvestigation.table,
            ui_case_id: ui_case_id,
            case_io_id: rowData?.field_io_name_id || "",
            pt_case_id: pt_case_id,
            limit : 10,
            page : investigationTablePagination,     
            from_date:  fromDate,
            to_date:  toDate,
            module: module ? module : 'ui_case'
        };

        setLoading(true);
        try {

            const getTemplateResponse = await api.post("/templateData/getTemplateData",getTemplatePayload);
            setLoading(false);

            if (getTemplateResponse && getTemplateResponse.success) {

                const { meta, data } = getTemplateResponse;
            
                const totalPages = meta?.meta?.totalPages;
                const totalItems = meta?.meta?.totalItems;
                
                if (totalPages !== null && totalPages !== undefined) {
                    setInvestigationTableTotalPageCount(totalPages);
                }
                
                if (totalItems !== null && totalItems !== undefined) {
                    setInvestigationTableRowCount(totalItems);
                }

                if (data?.length > 0) {

                    const excludedKeys = [
                        "created_at", "updated_at", "id", "deleted_at", "attachments",
                        "Starred", "ReadStatus", "linked_profile_info",
                        "ui_case_id", "pt_case_id", "sys_status", "task_unread_count" , "field_cid_crime_no./enquiry_no","field_io_name" , "field_io_name_id"
                    ];

                    const generateReadableHeader = (key) =>key.replace(/^field_/, "").replace(/_/g, " ").toLowerCase().replace(/^\w|\s\w/g, (c) => c.toUpperCase());

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
                        {
                            field: "investigation_module",
                            headerName: "Investigation Module",
                            width: 200,
                            resizable: true,
                            cellClassName: 'justify-content-start',
                        },
                        ...Object.keys(data[0]).filter((key) => !excludedKeys.includes(key))
                        .map((key, index) => ({
                            field: key,
                            headerName: generateReadableHeader(key),
                            width: generateReadableHeader(key).length < 15 ? 100 : 200,
                            resizable: true,
                        })),
                    ]

                    const formatDate = (value) => {
                        const parsed = Date.parse(value);
                        if (isNaN(parsed)) return value;
                        return new Date(parsed).toLocaleDateString("en-GB");
                    };
                    
                    function isValidISODate(value) {
                        return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value) && !isNaN(new Date(value).getTime());
                    }

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
                            sl_no: (investigationTablePagination - 1) * 10 + (index + 1),
                            investigation_module:  selectedInvestigation?.name || "",
                            ...(field.id ? {} : { id: "unique_id_" + index }),
                        };
                    });

                    setInvestigationViewTableColumns(updatedHeader);
                    setInvestigationViewTableRows(updatedTableData);
                }else{
                    setInvestigationViewTableColumns([]);
                    setInvestigationViewTableRows([]);
                }
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
    }

    const getValue = (field) => cs_fir_cases_data?.[0]?.[field] || '';

    const getFormattedDate = (dateString) =>
        dateString ? dateString.split(' ')[0].split('-').reverse().join('-') : '';

    const handleInput = (e) => {
        setFormData((prev)=>({
            ...prev,
            [e.target.id] : e.target.value
        }))
    };
    const handleRichTextEditorInput = (id, value) => {
        setFormData((prev)=>({
            ...prev,
            [id] : value
        }))
    };

    const gettingChargeSheetApi = async ()=>{

        if(!rowData?.id || !module){
            return
        }

        setLoading(true);
        try {
            
            const response = await api.post("/chargeSheet/getChargeSheet",{
                case_id : rowData?.id ? String(rowData?.id) : '',
                module : module
            });
            setLoading(false);

            if(response.success){
                setFormData(response.data ? response.data : {})
                setAlreadySaved(true);
            }else{
                setFormData({})
                setAlreadySaved(false);
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
    
    const saveChargeSheetApi = async ()=>{

        if(!rowData?.id || !module){
            return
        }

        if(Object.keys(formData).length === 0){
            toast.error("Data is Empty !", {
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

        formData['case_id'] = rowData?.id
        formData['module'] = module ? module : 'ui_case'

        setLoading(true);
        try {
    
            const response = await api.post("/chargeSheet/saveChargeSheet",{
                data : formData
            });
            setLoading(false);

            if(response.success){
                toast.success("Data Created Successfully", {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    className: "toast-success"
                });
                gettingChargeSheetApi();
                return
            }else{
                toast.error(response.message ? response.message : "Please Try Again !", {
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

    const updateChargeSheetApi = async ()=>{

        if(!formData?.id){
            return
        }

        if(Object.keys(formData).length === 0){
            toast.error("Data is Empty !", {
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
        try {
    
            const response = await api.post("/chargeSheet/updateChargeSheet",{
                data : formData,
                id : formData.id
            });
            setLoading(false);

            if(response.success){
                toast.success("Data Updated Successfully", {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    className: "toast-success"
                });
                gettingChargeSheetApi();
                return
            }else{
                toast.error(response.message ? response.message : "Please Try Again !", {
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

    useEffect(()=>{
        gettingChargeSheetApi();
    },[]);

    return (
        <Box sx={{ overflow: 'auto' , height: '100vh'}}>
        <Box p={2} pb={8}>
            <Box px={1} mb={2} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <Typography
                    sx={{ fontSize: "19px", fontWeight: "500", color: "#171A1C", display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
                    className="Roboto"
                    onClick={backNavigation}
                >
                    <West />
                    <Typography sx={{ fontSize: '19px', fontWeight: '500', color: '#171A1C' }} className='Roboto'>
                        Charge Sheet
                    </Typography>
                    {headerDetails && (
                        <Chip
                            label={headerDetails}
                            color="primary"
                            variant="outlined"
                            size="small"
                            sx={{ fontWeight: 500, marginTop: '2px' }}
                        />
                    )}
                </Typography>
            </Box>

            <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}  mb={2}>
                <Box display="flex" alignItems="center" gap={2}>
                    <Box>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                                format="DD-MM-YYYY"
                                sx={{
                                    width: "100%",
                                }}
                                label="From Date"
                                value={fromDate ? dayjs(fromDate) : null}
                                onChange={(e) =>
                                    setFromDate(e ? e.format("YYYY-MM-DD") : null)
                                }
                                maxDate={dayjs()}
                            />
                        </LocalizationProvider>
                    </Box>
                    <Box>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                                format="DD-MM-YYYY"
                                sx={{
                                    width: "100%",
                                }}
                                label="To Date"
                                value={toDate ? dayjs(toDate) : null}
                                onChange={(e) =>
                                    setToDate(e ? e.format("YYYY-MM-DD") : null)
                                }
                                maxDate={dayjs()}
                            />
                        </LocalizationProvider>
                    </Box>

                    <Box>
                        <Autocomplete
                            options={investigationArray}
                            getOptionLabel={(option) => option.name || ""}
                            name="select_investigation"
                            sx={{width: '250px'}}
                            value={
                                investigationArray.find((opt) => opt.id === selectedInvestigation?.id ) || null
                            }
                            onChange={(e, value) =>
                                setSelectedInvestigation(value)
                            }
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    className="selectHideHistory"
                                    label="Select Investigation"
                                />
                            )}
                        />
                    </Box>

                    <Box>
                        <Button
                            variant="contained"
                            color="primary"
                            size="large"
                            sx={{ fontWeight: 500, height: 40, margin: 0 }}
                            onClick={getSelectedInvestigationData}
                        >
                            Fetch
                        </Button>
                    </Box>
                </Box>

                {
                    !alreadySaved ?
                    <Button
                        variant="contained"
                        color="success"
                        size="large"
                        sx={{ fontWeight: 500, height: 40, margin: 0 }}
                        onClick={saveChargeSheetApi}
                    >
                        Save
                    </Button>

                    :

                    <Button
                        variant="contained"
                        color="success"
                        size="large"
                        sx={{ fontWeight: 500, height: 40, margin: 0 }}
                        onClick={updateChargeSheetApi}
                    >
                        Update
                    </Button>

                }

            </Box>

            <Box>

                <TableView
                    rows={investigationViewTableRows} 
                    columns={investigationViewTableColumns}
                    totalPage={investigationTableTotalPageCount} 
                    totalRecord={investigationTableRowCount} 
                    paginationCount={investigationTablePagination} 
                    handlePagination={handlePagination} 
                />

            </Box>

            <Box>
                <Table size="small">
                    <TableBody>
                    <TableRow>
                        <TableCell colSpan={2}>ಕರ್ನಾಟಕ ರಾಜ್ಯ ಲೋಕಾಯುಕ್ತ ಪೊಲೀಸ್</TableCell>
                        <TableCell colSpan={2}>ದೋಷಾರೋಪಣ ಪತ್ರ</TableCell>
                        <TableCell colSpan={2}>[ ಆದೇಶ ಸಂಖ್ಯೆ: 1539 ಮತ್ತು 1540 ]</TableCell>
                        <TableCell rowSpan={4} style={{ width: 150, verticalAlign: 'top' }}>
                        <Typography variant="body2">( ಪಿ.ಎಂ. 281)</Typography>
                        <Typography variant="body2">( ಪೊಲೀಸರಿಗೆ ನೀಡಿದ ಮಾಹಿತಿ )</Typography>
                        <Box mt={10}><Typography variant="body2">ಜಿಲ್ಲೆ</Typography></Box>
                        </TableCell>
                    </TableRow>

                    <TableRow>
                        <TableCell colSpan={2}>ನಮೂನೆ ಸಂಖ್ಯೆ: 157</TableCell>
                        <TableCell colSpan={4}></TableCell>
                    </TableRow>

                    <TableRow>
                        <TableCell colSpan={2}>ಜಿಲ್ಲೆ</TableCell>
                        <TableCell colSpan={2}>
                        ದೋಷಾರೋಪಣ ಸಂಖ್ಯೆ
                        <TextField id="cs_no" size="small" fullWidth onChange={handleInput} value={formData['cs_no'] ? formData['cs_no'] : '' } />
                        </TableCell>
                        <TableCell colSpan={2}>
                        ದಿನಾಂಕ
                        <TextField id="CS_field_date" size="small" fullWidth type="date" onChange={handleInput} value={formData['CS_field_date'] ? formData['CS_field_date'].split('T')[0] : ''} />
                        </TableCell>
                    </TableRow>

                    <TableRow>
                        <TableCell colSpan={2}>ಪೋಲೀಸ್ ಠಾಣೆ</TableCell>
                        <TableCell colSpan={2}>ಪ್ರಥಮ ಮಾಹಿತಿ ಸಂಖ್ಯೆ <span id="CS_fir_no" /></TableCell>
                        <TableCell colSpan={2}>ದಿನಾಂಕ</TableCell>
                    </TableRow>

                    <TableRow>
                        <TableCell colSpan={3}>ದೂರು ಅಥವಾ ಮಾಹಿತಿ ನೀಡಿದವರ ಹೆಸರು, ವಿಳಾಸ ಮತ್ತು ವೃತ್ತಿ</TableCell>
                        <TableCell colSpan={3}>
                        <TextField
                            id="name_addr_informant"
                            fullWidth
                            multiline
                            size="small"
                            value={formData['name_addr_informant'] ? formData['name_addr_informant'] : ''}
                            onChange={handleInput}
                        />
                        </TableCell>
                        <TableCell />
                    </TableRow>

                    <TableRow>
                        <TableCell rowSpan={2}>ತಲೆ ಮರೆಸಿಕೊಂಡವರೂ ಸೇರಿದಂತೆ...</TableCell>
                        <TableCell colSpan={2}>ವಿಚಾರಣೆಗೆ ಕಳುಹಿಸಿದ ಆಪಾದಿತರ ಹೆಸರುಗಳು ಮತ್ತು ವಿಳಾಸಗಳು</TableCell>
                        <TableCell rowSpan={2}>ಸ್ವತ್ತಿನ ವಿವರ</TableCell>
                        <TableCell rowSpan={2}>ಸಾಕ್ಷಿಗಳ ಹೆಸರುಗಳು</TableCell>
                        <TableCell rowSpan={2}>ಆಪಾದನೆ ಅಥವಾ ಮಾಹಿತಿ</TableCell>
                        <TableCell rowSpan={4}>
                            <Typography>ಪೋಲೀಸ್ ಠಾಣೆ: {getValue('police_station')}</Typography>
                            <TextField
                                label="ದೋಷಾರೋಪಣ ಪತ್ರ ಸಂಖ್ಯೆ"
                                size="small"
                                fullWidth
                                onChange={handleInput}
                                margin="dense"
                            />
                            <TextField
                                label="ಪ್ರಥಮ ಮಾಹಿತಿ ವರದಿ ಸಂಖ್ಯೆ"
                                size="small"
                                fullWidth
                                onChange={handleInput}
                                margin="dense"
                            />
                            <Typography>ಮೊ.ಸಂಖ್ಯೆ: {getValue('crime_no')}</Typography>
                            <Typography>ದಿನಾಂಕ: {getFormattedDate(getValue('crime_date'))}</Typography>
                            <TextField
                                label="ಮ್ಯಾಜಿಸ್ಟ್ರೇಟರ ಪ್ರಕರಣ ಸಂಖ್ಯೆ"
                                id="magistrate_case_no"
                                size="small"
                                fullWidth
                                onChange={handleInput}
                                value={formData['magistrate_case_no'] ? formData['magistrate_case_no'] : ''}
                                margin="dense"
                            />
                            <TextField
                                label="ಸರಕಾರ ವಿರುದ್ದ ಆಪಾದಿತ"
                                id="accused_name_per_gov"
                                size="small"
                                fullWidth
                                onChange={handleInput}
                                value={formData['accused_name_per_gov'] ? formData['accused_name_per_gov'] : ''}
                                margin="dense"
                            />
                            <TextField
                                label="ಮ್ಯಾಜಿಸ್ಟ್ರೇಟರು"
                                id="magistrate"
                                size="small"
                                fullWidth
                                onChange={handleInput}
                                value={formData['magistrate'] ? formData['magistrate'] : ''}
                                margin="dense"
                            />
                        </TableCell>
                    </TableRow>

                    <TableRow>
                        <TableCell>ವಶದಲ್ಲಿರುವವರು</TableCell>
                        <TableCell>ಜಾಮಿನು ಮೇಲೆ ಅಥವಾ ಮುಚ್ಚಳಿಕೆ ಪತ್ರದ ಮೇಲೆ</TableCell>
                    </TableRow>

                    <TableRow>
                        <TableCell align="center">2</TableCell>
                        <TableCell align="center">3</TableCell>
                        <TableCell align="center">4</TableCell>
                        <TableCell align="center">5</TableCell>
                        <TableCell align="center">6</TableCell>
                        <TableCell align="center">7</TableCell>
                    </TableRow>

                        <TableRow>
                            {['det_accused_or_not_ind_absconders', 'custody', 'on_bail_or_bond', 'prop_desc', 'name_addr_witnesses', 'det_circumstances'].map((id) => (
                                <TableCell key={id} align="center">
                                <div
                                    style={{
                                        width: '130px',
                                        height: '130px',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        border: '1px solid #ccc',
                                    }}
                                >
                                    <textarea
                                        id={id}
                                        onChange={handleInput}
                                        value={formData[id] ? formData[id] : ''}
                                        style={{
                                            width: '130px',
                                            height: '130px',
                                            transform: 'rotate(-90deg)',
                                            transformOrigin: 'center',
                                            position: 'absolute',
                                            top: '0',
                                            left: '0',
                                            resize: 'none',
                                            border: 'none',
                                            padding: '8px',
                                            boxSizing: 'border-box',
                                        }}
                                    />
                                </div>
                                </TableCell>
                            ))}
                        </TableRow>

                    </TableBody>
                </Table>

                <Box mt={4}>
                    <Typography align="center">ಕಾಲಂ ನಂ 5 ಮುಂದುವರೆದಿದೆ</Typography>
                    <RichTextEditor
                        field={{
                            name: 'textEditor_01'
                        }}
                        onChange={(value)=>handleRichTextEditorInput("textEditor_01", value)}
                        formData={formData}
                    />
                </Box>
                <Box mt={4}>
                    <Typography align="center">ಕಾಲಂ ನಂ 6 ಮುಂದುವರೆದಿದೆ</Typography>
                    <RichTextEditor
                        field={{
                            name: 'textEditor_02'
                        }}
                        onChange={(value)=>handleRichTextEditorInput("textEditor_02", value)}
                        formData={formData}
                    />
                </Box>
                <Box mt={4}>
                    <Typography align="center">ಕಾಲಂ ನಂ 7 ಮುಂದುವರೆದಿದೆ</Typography>
                    <RichTextEditor
                        field={{
                            name: 'textEditor_03'
                        }}
                        onChange={(value)=>handleRichTextEditorInput("textEditor_03", value)}
                        formData={formData}
                    />
                </Box>

                <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    gap={5}
                    my={5}
                >
                    <Box display="flex" flexDirection="column" gap={3}>

                        <Box display="flex" alignItems="center" gap={5}>
                            <Typography>ಸ್ಥಳ:</Typography>
                            <TextField
                                id="place"
                                size="small"
                                onInput={handleInput}
                                variant="outlined"
                                fullWidth
                                value={formData['place'] ? formData['place'] : ''}
                            />
                        </Box>

                        <Box display="flex" alignItems="center" gap={2.5}>
                            <Typography>ದಿನಾಂಕ:</Typography>
                            <TextField
                                id="cs_fields_date2"
                                type="date"
                                size="small"
                                onChange={handleInput}
                                variant="outlined"
                                fullWidth
                                value={formData['cs_fields_date2'] ? formData['cs_fields_date2'].split('T')[0] : ''}
                            />
                        </Box>
                    </Box>

                    <Box>
                        <Typography>(ತನಿಖಾಧಿಕಾರಿಯ ಸಹಿ)</Typography>
                        <Typography>ಪದನಾಮ</Typography>
                        <Typography>ಹುದ್ದೆ</Typography>
                    </Box>

                </Box>
   
                </Box>

            {loading && (
                <div className="parent_spinner" tabIndex="-1" aria-hidden="true">
                    <CircularProgress size={100} />
                </div>
            )}

        </Box>
        </Box>
    );
};

export default ChargeSheetInvestigation;
