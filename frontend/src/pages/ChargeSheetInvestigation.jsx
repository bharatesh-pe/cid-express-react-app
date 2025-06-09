import { West } from "@mui/icons-material";
import { Box, Button, Chip, CircularProgress, TextField, Typography, Table, TableBody, TableCell, TableRow, TextareaAutosize, } from "@mui/material";
import { useEffect, useState } from 'react';
import dayjs from "dayjs";
import DateField from "../components/form/Date";
import TableView from "../components/table-view/TableView";
import { toast } from "react-toastify";
import api from "../services/api";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import RichTextEditor from "../components/form/RichTextEditor";
import DynamicForm from "../components/dynamic-form/DynamicForm";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import pdfIcon from "../Images/pdfIcon.svg";
import docIcon from "../Images/docIcon.svg";
import xlsIcon from "../Images/xlsIcon.svg";
import pptIcon from "../Images/pptIcon.svg";
import jpgIcon from "../Images/jpgIcon.svg";
import pngIcon from "../Images/pngIcon.svg";
import FileInput from "../components/form/FileInput";


const ChargeSheetInvestigation = ({ template_name, headerDetails, tableRowId, options, rowData, module, backNavigation, overAllTemplateActions, cs_fir_cases_data }) => {

    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({});
    const [alreadySaved, setAlreadySaved] = useState(false);
    const [accusedList, setAccusedList] = useState([]);
    const [accusedTemplate, setAccusedTemplate] = useState(null);
    const [witnessList, setWitnessList] = useState([]);
    const [fslList, setFslList] = useState([]);
    const [chargeSheetFields, setChargeSheetFields] = useState([]);

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
    
const saveChargeSheetApi = async () => {
    if (!rowData?.id || !module) {
        console.warn("Missing rowData.id or module");
        return;
    }

    const fieldMap = {
        cs_case_number: "field_cid_crime_no./enquiry_no",
        cs_section_of_law: "field_sections_of_law",
        cs_incident_location: "field_incident_location",
        cs_incident_date: "field_incident_date",
        cs_cid_case_number: "field_cid_crime_no./enquiry_no",
        cs_cid_initiated_date: "field_cid_initiated_date",
        cs_io_name: "field_investigating_officer_name",
        cs_io_designation: "field_investigating_officer_designation",
        cs_allegations_info: "field_brief_information_about_allegations",
        cs_investigation_outcome: "field_outcome_of_investigation",
        cs_accused_justification: "field_description/justification_provided_by_accused_individuals",
        cs_evidence_to_refute: "field_evidences_available_to_refute_description/justification_provided_by_accused_individuals",
        cs_evidence_compilation: "field_compilation_of_evidences",
        cs_conclusion: "field_conclusion",
        cs_recommendation: "field_recommendation",
        cs_police_station: "field_name_of_the_police_station",
        cs_case_filed_date: "created_at"
    };

    const dataToSave = {};
    if (Array.isArray(chargeSheetFields)) {
        chargeSheetFields.forEach(field => {
            const uiKey = Object.keys(fieldMap).find(k => fieldMap[k] === field.name);
            let value;
            if (uiKey && formData.hasOwnProperty(uiKey)) {
                value = formData[uiKey];
            } else if (formData.hasOwnProperty(field.name)) {
                value = formData[field.name];
            }
            if (value !== undefined) {
                dataToSave[field.name] = value;
            }
        });
    }
    Object.keys(formData).forEach(key => {
        const mappedKey = fieldMap[key] || key;
        if (!dataToSave.hasOwnProperty(mappedKey)) {
            dataToSave[mappedKey] = formData[key];
        }
    });

    const formPayload = new FormData();
    formPayload.append("table_name", "cid_under_investigation");
    formPayload.append("id", String(rowData.id));
    formPayload.append("data", JSON.stringify(dataToSave));

    if (Array.isArray(formData.cs_supporting_documents)) {
        formData.cs_supporting_documents.forEach((file) => {
            formPayload.append("cs_supporting_documents", file);
        });
    }

    for (let pair of formPayload.entries()) {
    }

    setLoading(true);
    try {
        const response = await api.post("/chargeSheet/saveChargeSheetData", formPayload, {
            headers: { "Content-Type": "multipart/form-data" }
        });

        setLoading(false);

        if (response?.success) {
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
        } else {
            toast.error(response?.message || "Please Try Again!", {
                position: "top-right",
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
        toast.error("Please Try Again!", {
            position: "top-right",
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

    const chargeSheetGroups = [
        {
            heading: "1. Case number, police station, and the date the case was filed",
            fields: [
                { id: "cs_case_number", label: "Case Number" },
                { id: "cs_police_station", label: "Police Station" },
                { id: "cs_case_filed_date", label: "Date Filed" }
            ]
        },
        {
            heading: "2. Section of the law",
            fields: [
                { id: "cs_section_of_law", label: "Section of the Law" }
            ]
        },
        {
            heading: "3. Incident location and date",
            fields: [
                { id: "cs_incident_location", label: "Incident Location" },
                { id: "cs_incident_date", label: "Incident Date" }
            ]
        },
        {
            heading: "4. CID case number and the date investigation was initiated by CID",
            fields: [
                { id: "cs_cid_case_number", label: "CID Case Number" },
                { id: "cs_cid_initiated_date", label: "CID Investigation Initiated Date" }
            ]
        },
        {
            heading: "5. Name and designation of the investigating officer",
            fields: [
                { id: "cs_io_name", label: "Investigating Officer Name" },
                { id: "cs_io_designation", label: "Investigating Officer Designation" }
            ]
        },
        {
            heading: "6. Details of the accused individuals",
            fields: []
        },
        {
            heading: "7. Brief information about the allegations",
            fields: [
                { id: "cs_allegations_info", label: "Brief Information about Allegations" }
            ]
        },
        {
            heading: "8. Outcome of the investigation",
            fields: [
                { id: "cs_investigation_outcome", label: "Outcome of Investigation" }
            ]
        },
        {
            heading: "9. Description/justification provided by the accused individuals",
            fields: [
                { id: "cs_accused_justification", label: "Description/Justification by Accused" }
            ]
        },
        {
            heading: "10. Evidences available to refute the description/justification provided by the accused individuals",
            fields: [
                { id: "cs_evidence_to_refute", label: "Evidences to Refute Accused Justification" }
            ]
        },
        {
            heading: "11. Compilation of evidences (both oral and recorded)",
            fields: [
                { id: "cs_evidence_compilation", label: "Compilation of Evidences" }
            ]
        },
        {
            heading: "12. Conclusion",
            fields: [
                { id: "cs_conclusion", label: "Conclusion" }
            ]
        },
        {
            heading: "13. Recommendation (separately for each accused)",
            fields: [
                { id: "cs_recommendation", label: "Recommendation" }
            ]
        },
        {
            heading: "14. Witness Details",
            fields: [
                { id: "cs_witness_details", label: "Witness Details" }
            ]
        },
        {
            heading: "15. Supporting Documents",
            fields: [
                { id: "cs_supporting_documents", label: "Supporting Documents" }
            ]
        }
    ];

    // Fetch charge sheet, accused, and FSL details
    const getFullDetails = async () => {
        
        if (!rowData?.id) return;
        setLoading(true);
        try {
            const response = await api.post("/chargeSheet/getChargeSheetFullDetails", { id: rowData.id });
            setLoading(false);
            if (response.success) {
                setAccusedList(Array.isArray(response.accusedData) ? response.accusedData : []);
                setAccusedTemplate(response.accusedTemplate || null);
                setFslList(Array.isArray(response.fslData) ? response.fslData : []);
                setWitnessList(Array.isArray(response.witnessData) ? response.witnessData : []);
                let allUIFields = [];
                let allUIDataObj = {};
                if (response.allUIData && Array.isArray(response.allUIData.allUIFields)) {
                    setChargeSheetFields(response.allUIData.allUIFields);
                    allUIFields = response.allUIData.allUIFields;
                    allUIDataObj = response.allUIData;
                } else if (Array.isArray(response.allUIFields)) {
                    setChargeSheetFields(response.allUIFields);
                    allUIFields = response.allUIFields;
                    allUIDataObj = response.allUIData || {};
                } else if (Array.isArray(response.allUIData)) {
                    setChargeSheetFields(response.allUIData);
                    allUIFields = response.allUIData;
                    allUIDataObj = {};
                } else {
                    setChargeSheetFields([]);
                    allUIFields = [];
                    allUIDataObj = {};
                }

                if (allUIFields && typeof allUIDataObj === "object" && allUIDataObj !== null) {
                    const newFormData = {};
                    if (allUIDataObj["field_cid_crime_no./enquiry_no"]) {
                        newFormData["cs_case_number"] = allUIDataObj["field_cid_crime_no./enquiry_no"];
                    }
                    if (allUIDataObj["field_sections_of_law"]) {
                        newFormData["cs_section_of_law"] = allUIDataObj["field_sections_of_law"];
                    }
                    if (allUIDataObj["field_incident_location"]) {
                        newFormData["cs_incident_location"] = allUIDataObj["field_incident_location"];
                    }
                    if (allUIDataObj["field_incident_date"]) {
                        newFormData["cs_incident_date"] = dayjs(allUIDataObj["field_incident_date"]).format("YYYY-MM-DD");
                    }
                    if (allUIDataObj["field_cid_crime_no./enquiry_no"]) {
                        newFormData["cs_cid_case_number"] = allUIDataObj["field_cid_crime_no./enquiry_no"];
                    }
                    if (allUIDataObj["field_cid_initiated_date"]) {
                        newFormData["cs_cid_initiated_date"] = dayjs(allUIDataObj["field_cid_initiated_date"]).format("YYYY-MM-DD");
                    }
                    if (allUIDataObj["field_investigating_officer_name"]) {
                        newFormData["cs_io_name"] = allUIDataObj["field_investigating_officer_name"];
                    }
                    if (allUIDataObj["field_investigating_officer_designation"]) {
                        newFormData["cs_io_designation"] = allUIDataObj["field_investigating_officer_designation"]; 
                    }
                    if (allUIDataObj["field_brief_information_about_allegations"]) {
                        newFormData["cs_allegations_info"] = allUIDataObj["field_brief_information_about_allegations"];
                    }    
                    if (allUIDataObj["field_outcome_of_investigation"]) {
                        newFormData["cs_investigation_outcome"] = allUIDataObj["field_outcome_of_investigation"];
                    }
                    if (allUIDataObj["field_description/justification_provided_by_accused_individuals"]) {
                        newFormData["cs_accused_justification"] = allUIDataObj["field_description/justification_provided_by_accused_individuals"];
                    }
                    if (allUIDataObj["field_evidences_available_to_refute_description/justification_provided_by_accused_individuals"]) {
                        newFormData["cs_evidence_to_refute"] = allUIDataObj["field_evidences_available_to_refute_description/justification_provided_by_accused_individuals"];
                    }
                    if (allUIDataObj["field_compilation_of_evidences"]) {
                        newFormData["cs_evidence_compilation"] = allUIDataObj["field_compilation_of_evidences"];
                    }
                    if (allUIDataObj["field_conclusion"]) {
                        newFormData["cs_conclusion"] = allUIDataObj["field_conclusion"];
                    }
                    if (allUIDataObj["field_recommendation"]) {
                        newFormData["cs_recommendation"] = allUIDataObj["field_recommendation"];
                    }
                    // Map for cs_police_station
                    const policeStationField = allUIFields.find(
                        f => f.name === "field_name_of_the_police_station" || f.field_name === "field_name_of_the_police_station"
                    );
                    if (policeStationField) {
                        const val = allUIDataObj["field_name_of_the_police_station"];
                        if (val !== undefined && val !== null) {
                            newFormData["cs_police_station"] = val;
                        }
                    }
                    // Map for cs_case_filed_date (show as date)
                    if (allUIDataObj["created_at"]) {
                        newFormData["cs_case_filed_date"] = dayjs(allUIDataObj["created_at"]).format("YYYY-MM-DD");
                    }
                    // ...add similar logic for other fields if needed...
                    setFormData(prev => ({ ...prev, ...newFormData }));
                }
            } else {
                setAccusedList([]);
                setAccusedTemplate(null);
                setFslList([]);
                setWitnessList([]);
                setChargeSheetFields([]);
            }
        } catch (error) {
            setLoading(false);
            setAccusedList([]);
            setAccusedTemplate(null);
            setWitnessList([]);
            setFslList([]);
            setChargeSheetFields([]);
        }
    };

    useEffect(() => {
           getFullDetails()
    }, []);

const getDropdownOptions = (fieldName) => {
    let allUIFields = [];
    if (Array.isArray(chargeSheetFields)) {
        allUIFields = chargeSheetFields;
    } else if (chargeSheetFields && Array.isArray(chargeSheetFields.allUIFields)) {
        allUIFields = chargeSheetFields.allUIFields;
    }
    const fieldDef = allUIFields.find(
        f =>
            (f.name === fieldName || f.field_name === fieldName) &&
            (f.type === "dropdown" || f.data_type === "Dropdown") &&
            Array.isArray(f.options)
    );
    return fieldDef ? fieldDef.options : [];
};

const getFileIcon = (fileName) => {
    fileName = fileName.split('.').pop().toLowerCase();
    switch (fileName) {
        case 'pdf':
            return <img src={pdfIcon} alt="pdf" />;
        case 'jpg':
        case 'jpeg':
            return <img src={jpgIcon} alt="jpg" />;
        case 'png':
        case 'svg':
        case 'gif':
            return <img src={pngIcon} alt="img" />;
        case 'xls':
        case 'xlsx':
            return <img src={xlsIcon} alt="xls" />;
        case 'csv':
        case 'docx':
        case 'doc':
            return <img src={docIcon} alt="doc" />;
        case 'ppt':
            return <img src={pptIcon} alt="ppt" />;
        default:
            return <InsertDriveFileIcon />;
    }
};

const openFileInNewTab = async (file, formData, setLoading, toast, api, row) => {
    if (row && Array.isArray(row.attachments) && row.attachments.length > 0) {
        const payloadFile = row.attachments.find(
            (attachment) => attachment.attachment_name === file
        );
        if (payloadFile && payloadFile.profile_attachment_id) {
            setLoading(true);
            try {
                const url = `/templateData/downloadDocumentAttachments/${payloadFile.profile_attachment_id}`;
                const res = await fetch(url, { method: "GET" });
                setLoading(false);
                if (res.ok) {
                    const blob = await res.blob();
                    const fileUrl = URL.createObjectURL(blob);
                    window.open(fileUrl, "_blank");
                } else {
                    toast.error('Unable to preview file!', {
                        position: "top-right",
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
                toast.error('Please Try Again !', {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    className: "toast-error",
                });
            }
            return;
        }
    }
    const url = `/templateData/downloadDocumentAttachments?file_name=${encodeURIComponent(file)}`;
    window.open(url, "_blank");
};

    return (
        <Box sx={{ overflow: 'auto' , height: '100vh'}}>
        <Box p={2} pb={8}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                {!alreadySaved ? (
                    <Button
                        variant="contained"
                        color="success"
                        size="large"
                        sx={{ fontWeight: 500, height: 40, margin: 0 }}
                        onClick={saveChargeSheetApi}
                    >
                        Save
                    </Button>
                ) : (
                    <Button
                        variant="contained"
                        color="success"
                        size="large"
                        sx={{ fontWeight: 500, height: 40, margin: 0 }}
                        onClick={updateChargeSheetApi}
                    >
                        Update
                    </Button>
                )}
            </Box>

            {loading && (
                <div className="parent_spinner" tabIndex="-1" aria-hidden="true">
                    <CircularProgress size={100} />
                </div>
            )}

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
            <Typography
                sx={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#0B5ED7',
                    mb: 1,
                    textAlign: 'center',
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase',
                }}
                className="Roboto"
            >
                Charge Sheet
            </Typography>

                            <Box sx={{ mt: 0, mb: 2 }}>
                                <Typography sx={{ fontWeight: 600, mb: 1, color: "#0B5ED7" }}>Accused</Typography>
                        {accusedList.length > 0 ? (
                                <Box sx={{ overflowX: 'auto', maxWidth: '100%' }}>
                                    <Table size="small" sx={{ minWidth: 600 }}>
                                        <TableBody>
                                            <TableRow>
                                                {Object.keys(accusedList[0]).map((key, idx) => (
                                                    <TableCell key={idx} sx={{ fontWeight: 600 }}>{key}</TableCell>
                                                ))}
                                            </TableRow>
                                            {accusedList.map((row, rowIdx) => (
                                                <TableRow key={rowIdx}>
                                                    {Object.keys(row).map((key, colIdx) => (
                                                        <TableCell key={colIdx}>
                                                            {row[key] || ""}
                                                        </TableCell>
                                                    ))}
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </Box>
                        ) : (
                            <Box sx={{ color: "#B71C1C", fontWeight: 500, mt: 1 }}>
                                No data found
                            </Box>
                        )
                        }
                            </Box>

                        <Box sx={{ mt: 0, mb: 2 }}>
                            <Typography sx={{ fontWeight: 600, mb: 1, color: "#0B5ED7" }}>FSL</Typography>
                            {fslList.length > 0 ? (
                                <Box sx={{ overflowX: 'auto', maxWidth: '100%' }}>
                                    <Table size="small" sx={{ minWidth: 600 }}>
                                        <TableBody>
                                            <TableRow>
                                                {Object.keys(fslList[0]).map((key, idx) => (
                                                    <TableCell key={idx} sx={{ fontWeight: 600 }}>{key}</TableCell>
                                                ))}
                                            </TableRow>
                                            {fslList.map((row, rowIdx) => (
                                                <TableRow key={rowIdx}>
                                                    {Object.keys(row).map((key, colIdx) => (
                                                        <TableCell key={colIdx}>
                                                            {row[key] || ""}
                                                        </TableCell>
                                                    ))}
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </Box>
                            ) : (
                                <Typography sx={{ color: "#B71C1C", fontWeight: 500, mt: 1 }}>No data found</Typography>
                            )}
                        </Box>
                        <Box sx={{ mt: 0, mb: 2 }}>
                            <Typography sx={{ fontWeight: 600, mb: 1, color: "#0B5ED7" }}>Witness</Typography>
                            {witnessList.length > 0 ? (
                                <Box sx={{ overflowX: 'auto', maxWidth: '100%' }}>
                                    <Table size="small" sx={{ minWidth: 600 }}>
                                        <TableBody>
                                            <TableRow>
                                                {Object.keys(witnessList[0]).map((key, idx) => (
                                                    <TableCell key={idx} sx={{ fontWeight: 600 }}>{key}</TableCell>
                                                ))}
                                            </TableRow>
                                            {witnessList.map((row, rowIdx) => (
                                                <TableRow key={rowIdx}>
                                                    {Object.keys(row).map((key, colIdx) => (
                                                        <TableCell key={colIdx}>
                                                            {row[key] || ""}
                                                        </TableCell>
                                                    ))}
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </Box>
                            ) : (
                                <Typography sx={{ color: "#B71C1C", fontWeight: 500, mt: 1 }}>No data found</Typography>
                            )}
                        </Box>

        {/* Render each group as a heading and a table of fields */}
        {chargeSheetGroups.map((group, idx) => (
    <Box key={group.heading} sx={{ mb: 3 }}>
        <Typography sx={{ fontWeight: 600, mb: 1, color: "#0B5ED7" }}>{group.heading}</Typography>
        {/* Special handling for Accused table in point 6 */}
        {group.heading === "6. Details of the accused individuals" ? (
            accusedList.length > 0 && accusedTemplate && accusedTemplate.fields ? (
                (() => {
                    // Parse accusedTemplate fields if it's a string
                    let accusedFields = [];
                    try {
                        accusedFields = typeof accusedTemplate.fields === "string"
                            ? JSON.parse(accusedTemplate.fields)
                            : accusedTemplate.fields;
                    } catch {
                        accusedFields = [];
                    }
                    // Only show fields that are present in accusedList[0]
                    const displayFields = accusedFields.filter(f =>
                        Object.keys(accusedList[0]).includes(f.name)
                    );
                    return (
                        <Box sx={{ overflowX: 'auto', maxWidth: '100%' }}>
                            <Table size="small" sx={{ minWidth: 900 }}>
                                <TableBody>
                                    <TableRow>
                                        {displayFields.map((field, idx) => {
                                            // Format header: remove "field_" and underscores, capitalize words
                                            let header = field.name.replace(/^field_/, '').replace(/_/g, ' ');
                                            header = header.charAt(0).toUpperCase() + header.slice(1);
                                            return (
                                                <TableCell
                                                    key={idx}
                                                    sx={{
                                                        fontWeight: 600,
                                                        whiteSpace: 'nowrap',
                                                        minWidth: 160,
                                                        maxWidth: 300,
                                                        px: 1
                                                    }}
                                                >
                                                    {header}
                                                </TableCell>
                                            );
                                        })}
                                        <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap', minWidth: 100 }}>Actions</TableCell>
                                    </TableRow>
                                    {accusedList.map((row, rowIdx) => (
                                        <TableRow key={rowIdx}>
                                            {displayFields.map((field, colIdx) => {
                                                const key = field.name;
                                                // Dropdown/Autocomplete
                                                if (
                                                    (field.type === "dropdown" || field.type === "autocomplete" || field.data_type === "Dropdown" || field.data_type === "Autocomplete") &&
                                                    Array.isArray(field.options)
                                                ) {
                                                    return (
                                                        <TableCell key={colIdx} sx={{ minWidth: 160, px: 1 }}>
                                                            <TextField
                                                                select
                                                                value={row[key] || ""}
                                                                size="small"
                                                                fullWidth
                                                                SelectProps={{ native: true }}
                                                                onChange={e => {
                                                                    const updated = [...accusedList];
                                                                    updated[rowIdx][key] = e.target.value;
                                                                    setAccusedList(updated);
                                                                }}
                                                            >
                                                                <option value="">Select</option>
                                                                {field.options.map(opt => (
                                                                    <option key={opt.code ?? opt.value ?? opt.name} value={opt.code ?? opt.value ?? opt.name}>
                                                                        {opt.name ?? opt.label ?? opt.value ?? opt.code}
                                                                    </option>
                                                                ))}
                                                            </TextField>
                                                        </TableCell>
                                                    );
                                                }
                                                // Date
                                                if (field.type === "date" || field.data_type === "Date") {
                                                    return (
                                                        <TableCell key={colIdx} sx={{ minWidth: 160, px: 1 }}>
                                                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                                <DatePicker
                                                                    inputFormat="YYYY-MM-DD"
                                                                    value={row[key] ? dayjs(row[key]) : null}
                                                                    onChange={date => {
                                                                        const updated = [...accusedList];
                                                                        updated[rowIdx][key] = date ? dayjs(date).format("YYYY-MM-DD") : "";
                                                                        setAccusedList(updated);
                                                                    }}
                                                                    renderInput={(params) => (
                                                                        <TextField
                                                                            {...params}
                                                                            fullWidth
                                                                            size="small"
                                                                        />
                                                                    )}
                                                                />
                                                            </LocalizationProvider>
                                                        </TableCell>
                                                    );
                                                }
                                                // Number
                                                if (field.type === "number" || field.data_type === "Number") {
                                                    return (
                                                        <TableCell key={colIdx} sx={{ minWidth: 120, px: 1 }}>
                                                            <TextField
                                                                type="number"
                                                                value={row[key] || ""}
                                                                size="small"
                                                                fullWidth
                                                                onChange={e => {
                                                                    const updated = [...accusedList];
                                                                    updated[rowIdx][key] = e.target.value;
                                                                    setAccusedList(updated);
                                                                }}
                                                            />
                                                        </TableCell>
                                                    );
                                                }
                                                // Textarea/Long text
                                                if (field.type === "textarea" || field.formType === "Long text") {
                                                    return (
                                                        <TableCell key={colIdx} sx={{ minWidth: 180, px: 1 }}>
                                                            <TextField
                                                                multiline
                                                                minRows={2}
                                                                value={row[key] || ""}
                                                                size="small"
                                                                fullWidth
                                                                onChange={e => {
                                                                    const updated = [...accusedList];
                                                                    updated[rowIdx][key] = e.target.value;
                                                                    setAccusedList(updated);
                                                                }}
                                                            />
                                                        </TableCell>
                                                    );
                                                }
                                                // File/Attachment (show as label or upload if needed)
                                                if (field.type === "file" || field.data_type === "Attachments") {
                                                    const val = row[key];
                                                    if (val && typeof val === "string" && val !== "") {
                                                        const files = val.split(",");
                                                        return (
                                                            <TableCell key={colIdx} sx={{ minWidth: 120, px: 1 }}>
                                                                <Box sx={{ display: "flex", alignItems: "center", gap: "4px", height: '100%' }}>
                                                                    {files.map((file, fileIdx) => (
                                                                        <span
                                                                            key={fileIdx}
                                                                            style={{
                                                                                display: "flex",
                                                                                alignItems: "center",
                                                                                cursor: "pointer",
                                                                                marginRight: "8px",
                                                                                color: "#1976d2",
                                                                                textDecoration: "underline"
                                                                            }}
                                                                            onClick={async (e) => {
                                                                                e.stopPropagation();
                                                                                await openFileInNewTab(file, formData, setLoading, toast, api, row);
                                                                            }}
                                                                        >
                                                                            {getFileIcon(file)}
                                                                            <span style={{ marginLeft: 4 }}>{file.split('/').pop()}</span>
                                                                        </span>
                                                                    ))}
                                                                </Box>
                                                            </TableCell>
                                                        );
                                                    }
                                                    return (
                                                        <TableCell key={colIdx} sx={{ minWidth: 120, px: 1 }}>
                                                            {/* No file */}
                                                        </TableCell>
                                                    );
                                                }
                                                // Default: text
                                                return (
                                                    <TableCell key={colIdx} sx={{ minWidth: 120, px: 1 }}>
                                                        <TextField
                                                            value={row[key] || ""}
                                                            size="small"
                                                            fullWidth
                                                            onChange={e => {
                                                                const updated = [...accusedList];
                                                                updated[rowIdx][key] = e.target.value;
                                                                setAccusedList(updated);
                                                            }}
                                                        />
                                                    </TableCell>
                                                );
                                            })}
                                            <TableCell sx={{ minWidth: 100, px: 1 }}>
                                                <Button
                                                    color="error"
                                                    size="small"
                                                    onClick={() => {
                                                        const updated = accusedList.filter((_, i) => i !== rowIdx);
                                                        setAccusedList(updated);
                                                    }}
                                                >
                                                    Delete
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    <TableRow>
                                        <TableCell colSpan={displayFields.length + 1}>
                                            <Button
                                                color="primary"
                                                size="small"
                                                onClick={() => {
                                                    // Add a new empty row based on field keys
                                                    const newRow = {};
                                                    displayFields.forEach(f => newRow[f.name] = "");
                                                    setAccusedList([...accusedList, newRow]);
                                                }}
                                            >
                                                Add Row
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </Box>
                    );
                })()
            ) : (
                <Typography sx={{ color: "#B71C1C", fontWeight: 500, mt: 1 }}>No data found</Typography>
            )
        ) : group.heading === "14. Witness Details" ? (
            witnessList.length > 0 ? (
                <Box sx={{ overflowX: 'auto', maxWidth: '100%' }}>
                    <Table size="small" sx={{ minWidth: 900 }}>
                        <TableBody>
                            <TableRow>
                                {/* Editable headers */}
                                {Object.keys(witnessList[0]).map((key, idx) => {
                                    let header = key.replace(/^field_/, '').replace(/_/g, ' ');
                                    header = header.charAt(0).toUpperCase() + header.slice(1);
                                    return (
                                        <TableCell
                                            key={idx}
                                            sx={{
                                                fontWeight: 600,
                                                whiteSpace: 'nowrap',
                                                minWidth: 160,
                                                maxWidth: 300,
                                                px: 1
                                            }}
                                        >
                                            {header}
                                        </TableCell>
                                    );
                                })}
                                <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap', minWidth: 100 }}>Actions</TableCell>
                            </TableRow>
                            {witnessList.map((row, rowIdx) => (
                                <TableRow key={rowIdx}>
                                    {Object.keys(row).map((key, colIdx) => (
                                        <TableCell key={colIdx} sx={{ minWidth: 120, px: 1 }}>
                                            <TextField
                                                value={row[key] || ""}
                                                size="small"
                                                fullWidth
                                                onChange={e => {
                                                    const updated = [...witnessList];
                                                    updated[rowIdx][key] = e.target.value;
                                                    setWitnessList(updated);
                                                }}
                                            />
                                        </TableCell>
                                    ))}
                                    <TableCell sx={{ minWidth: 100, px: 1 }}>
                                        <Button
                                            color="error"
                                            size="small"
                                            onClick={() => {
                                                const updated = witnessList.filter((_, i) => i !== rowIdx);
                                                setWitnessList(updated);
                                            }}
                                        >
                                            Delete
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            <TableRow>
                                <TableCell colSpan={Object.keys(witnessList[0]).length + 1}>
                                    <Button
                                        color="primary"
                                        size="small"
                                        onClick={() => {
                                            // Add a new empty row based on field keys
                                            const newRow = {};
                                            Object.keys(witnessList[0]).forEach(f => newRow[f] = "");
                                            setWitnessList([...witnessList, newRow]);
                                        }}
                                    >
                                        Add Row
                                    </Button>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </Box>
            ) : (
                <Typography sx={{ color: "#B71C1C", fontWeight: 500, mt: 1 }}>No data found</Typography>
            )
        ) : group.heading === "15. Supporting Documents" ? (
            // Use FileInput component for supporting documents
            <Box>
                <FileInput
                    field={{
                        name: "cs_supporting_documents",
                        label: "Supporting Documents",
                        multiple: true,
                        required: false,
                        // Add any other props as needed
                    }}
                    formData={formData}
                    errors={{}}
                    onChange={(name, files) => {
                        setFormData(prev => ({
                            ...prev,
                            [name]: files
                        }));
                    }}
                    readOnly={false}
                />
            </Box>
        ) : (
            <Table size="small" sx={{ maxWidth: 700, border: '1px solid #e0e0e0' }}>
                <TableBody>
                    <TableRow>
                        {group.fields.map(field => (
                            <TableCell key={field.id} sx={{ fontWeight: 500, width: 200 }}>{field.label}</TableCell>
                        ))}
                    </TableRow>
                    <TableRow>
                        {group.fields.map(field => {
                            // Special handling for Police Station dropdown
                            if (field.id === "cs_police_station") {
                                const dropdownOptions = getDropdownOptions("field_name_of_the_police_station");
                                return (
                                    <TableCell key={field.id}>
                                        {dropdownOptions.length > 0 ? (
                                            <TextField
                                                select
                                                id={field.id}
                                                fullWidth
                                                size="small"
                                                value={formData[field.id] || ""}
                                                onChange={handleInput}
                                                SelectProps={{ native: true }}
                                            >
                                                <option value="">Select</option>
                                                {dropdownOptions.map(opt => (
                                                    <option key={opt.code ?? opt.value ?? opt.name} value={opt.code ?? opt.value ?? opt.name}>
                                                        {opt.name ?? opt.label ?? opt.value ?? opt.code}
                                                    </option>
                                                ))}
                                            </TextField>
                                        ) : (
                                            <TextField
                                                id={field.id}
                                                fullWidth
                                                size="small"
                                                value={formData[field.id] || ""}
                                                onChange={handleInput}
                                            />
                                        )}
                                    </TableCell>
                                );
                            }
                            // Special handling for Date field
                            if (field.id === "cs_case_filed_date" || field.id === "cs_incident_date" || field.id === "cs_cid_initiated_date") {
                                return (
                                    <TableCell key={field.id}>
                                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                                            <DatePicker
                                                inputFormat="YYYY-MM-DD"
                                                value={formData[field.id] ? dayjs(formData[field.id]) : null}
                                                onChange={date => {
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        [field.id]: date ? dayjs(date).format("YYYY-MM-DD") : ""
                                                    }));
                                                }}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        id={field.id}
                                                        fullWidth
                                                        size="small"
                                                    />
                                                )}
                                            />
                                        </LocalizationProvider>
                                    </TableCell>
                                );
                            }
                            // Default: normal text field
                            return (
                                <TableCell key={field.id}>
                                    <TextField
                                        id={field.id}
                                        fullWidth
                                        size="small"
                                        value={formData[field.id] || ""}
                                        onChange={handleInput}
                                    />
                                </TableCell>
                            );
                        })}
                    </TableRow>
                </TableBody>
            </Table>
        )}
    </Box>
))}
   
         </Box>
        </Box>
    );
};

export default ChargeSheetInvestigation;
