import { West } from "@mui/icons-material";
import { Box, Button, Chip, CircularProgress, TextField, Typography, Table, TableBody, TableCell, TableRow, TextareaAutosize, } from "@mui/material";
import { useEffect, useState } from 'react';
import dayjs from "dayjs";
import { toast } from "react-toastify";
import api from "../services/api";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import pdfIcon from "../Images/pdfIcon.svg";
import docIcon from "../Images/docIcon.svg";
import xlsIcon from "../Images/xlsIcon.svg";
import pptIcon from "../Images/pptIcon.svg";
import jpgIcon from "../Images/jpgIcon.svg";
import pngIcon from "../Images/pngIcon.svg";
import FileInput from "../components/form/FileInput";


const ChargeSheetInvestigation = ({ template_name, headerDetails, tableRowId, options, rowData, module, backNavigation, overAllTemplateActions, cs_fir_cases_data, showMagazineView }) => {

    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({});
    const [alreadySaved, setAlreadySaved] = useState(false);
    const [accusedList, setAccusedList] = useState([]);
    const [accusedTemplate, setAccusedTemplate] = useState(null);
    const [witnessList, setWitnessList] = useState([]);
    const [fslList, setFslList] = useState([]);
    const [chargeSheetFields, setChargeSheetFields] = useState([]);
    const [allUIDataObj, setAllUIDataObj] = useState({});

    const handleInput = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.id]: e.target.value
        }))
    };

    const hiddenColumns = [
        "id",
        "sys_status",
        "created_by",
        "updated_by",
        "created_at",
        "updated_at",
        "created_by_id",
        "updated_by_id",
        "ui_case_id",
        "pt_case_id"
    ];


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
            cs_allegations_info: "field_brief_information_about_the_allegations",
            cs_investigation_outcome: "field_outcome_of_the_investigation",
            cs_accused_justification: "field_description/justification_provided_by_accused_individuals",
            cs_evidence_to_refute: "field_evidences_available_to_refute_description/justification_provided_by_accused_individuals",
            cs_evidence_compilation: "field_compilation_of_evidences",
            cs_conclusion: "field_conclusion",
            cs_recommendation: "field_recommendation",
            cs_police_station: "field_name_of_the_police_station",
            cs_supporting_documents: "field_supporting_documents",
            cs_case_filed_date: "created_at"
        };

        let normalData = {};
        const formPayload = new FormData();

        let supportingFiles = [];
        let supportingFileNames = [];
        if (formData.cs_supporting_documents && Array.isArray(formData.cs_supporting_documents)) {
            supportingFiles = formData.cs_supporting_documents.filter(f => f instanceof File || (f && f.filename instanceof File));
            supportingFiles.forEach(fileObj => {
                if (fileObj instanceof File) {
                    formPayload.append("field_supporting_documents", fileObj);
                    supportingFileNames.push(fileObj.name);
                } else if (fileObj && fileObj.filename instanceof File) {
                    formPayload.append("field_supporting_documents", fileObj.filename);
                    supportingFileNames.push(fileObj.filename.name);
                }
            });
        }

        if (Array.isArray(chargeSheetFields)) {
            chargeSheetFields.forEach(field => {
                const uiKey = Object.keys(fieldMap).find(k => fieldMap[k] === field.name);
                let value;
                if (uiKey && formData.hasOwnProperty(uiKey)) {
                    value = formData[uiKey];
                } else if (formData.hasOwnProperty(field.name)) {
                    value = formData[field.name];
                }
                if (field.name === "cs_supporting_documents" || field.name === "field_supporting_documents") return;
                if (value !== undefined) {
                    normalData[field.name] = Array.isArray(value) ? value.join(",") : value;
                }
            });
        }

        Object.keys(formData).forEach(key => {
            const mappedKey = fieldMap[key] || key;
            if (
                !normalData.hasOwnProperty(mappedKey) &&
                key !== "cs_supporting_documents" &&
                key !== "field_supporting_documents" &&
                !(formData[key] instanceof File)
            ) {
                normalData[mappedKey] = Array.isArray(formData[key]) ? formData[key].join(",") : formData[key];
            }
        });

        formPayload.append("table_name", "cid_under_investigation");
        formPayload.append("id", String(rowData.id));
        formPayload.append("data", JSON.stringify(normalData));

        setLoading(true);
        try {
            const response = await api.post("/templateData/updateTemplateData", formPayload, {
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
                setAlreadySaved(true);
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

    const updateChargeSheetApi = async () => {
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
            cs_allegations_info: "field_brief_information_about_the_allegations",
            cs_investigation_outcome: "field_outcome_of_the_investigation",
            cs_accused_justification: "field_description/justification_provided_by_accused_individuals",
            cs_evidence_to_refute: "field_evidences_available_to_refute_description/justification_provided_by_accused_individuals",
            cs_evidence_compilation: "field_compilation_of_evidences",
            cs_conclusion: "field_conclusion",
            cs_recommendation: "field_recommendation",
            cs_police_station: "field_name_of_the_police_station",
            cs_supporting_documents: "field_supporting_documents",
            cs_case_filed_date: "created_at"
        };

        let normalData = {};
        const formPayload = new FormData();

        let supportingFiles = [];
        let supportingFileNames = [];
        if (formData.cs_supporting_documents && Array.isArray(formData.cs_supporting_documents)) {
            supportingFiles = formData.cs_supporting_documents.filter(f => f instanceof File || (f && f.filename instanceof File));
            supportingFiles.forEach(fileObj => {
                if (fileObj instanceof File) {
                    formPayload.append("field_supporting_documents", fileObj);
                    supportingFileNames.push(fileObj.name);
                } else if (fileObj && fileObj.filename instanceof File) {
                    formPayload.append("field_supporting_documents", fileObj.filename);
                    supportingFileNames.push(fileObj.filename.name);
                }
            });
        }

        if (Array.isArray(chargeSheetFields)) {
            chargeSheetFields.forEach(field => {
                const uiKey = Object.keys(fieldMap).find(k => fieldMap[k] === field.name);
                let value;
                if (uiKey && formData.hasOwnProperty(uiKey)) {
                    value = formData[uiKey];
                } else if (formData.hasOwnProperty(field.name)) {
                    value = formData[field.name];
                }
                if (field.name === "cs_supporting_documents" || field.name === "field_supporting_documents") return;
                if (value !== undefined) {
                    normalData[field.name] = Array.isArray(value) ? value.join(",") : value;
                }
            });
        }

        Object.keys(formData).forEach(key => {
            const mappedKey = fieldMap[key] || key;
            if (
                !normalData.hasOwnProperty(mappedKey) &&
                key !== "cs_supporting_documents" &&
                key !== "field_supporting_documents" &&
                !(formData[key] instanceof File)
            ) {
                normalData[mappedKey] = Array.isArray(formData[key]) ? formData[key].join(",") : formData[key];
            }
        });

        formPayload.append("table_name", "cid_under_investigation");
        formPayload.append("id", String(rowData.id));
        formPayload.append("data", JSON.stringify(normalData));

        setLoading(true);
        try {
            const response = await api.post("/templateData/updateTemplateData", formPayload, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            setLoading(false);

            if (response?.success) {
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
                let localAllUIDataObj = {};
                if (response.allUIData && Array.isArray(response.allUIData.allUIFields)) {
                    setChargeSheetFields(response.allUIData.allUIFields);
                    allUIFields = response.allUIData.allUIFields;
                    localAllUIDataObj = response.allUIData;
                } else if (Array.isArray(response.allUIFields)) {
                    setChargeSheetFields(response.allUIFields);
                    allUIFields = response.allUIFields;
                    localAllUIDataObj = response.allUIData || {};
                } else if (Array.isArray(response.allUIData)) {
                    setChargeSheetFields(response.allUIData);
                    allUIFields = response.allUIData;
                    localAllUIDataObj = {};
                } else {
                    setChargeSheetFields([]);
                    allUIFields = [];
                    localAllUIDataObj = {};
                }

                setAllUIDataObj(localAllUIDataObj);

                if (allUIFields && typeof localAllUIDataObj === "object" && localAllUIDataObj !== null) {
                    const newFormData = {};
                    if (localAllUIDataObj["field_cid_crime_no./enquiry_no"]) {
                        newFormData["cs_case_number"] = localAllUIDataObj["field_cid_crime_no./enquiry_no"];
                    }
                    if (localAllUIDataObj["field_sections_of_law"]) {
                        newFormData["cs_section_of_law"] = localAllUIDataObj["field_sections_of_law"];
                    }
                    if (localAllUIDataObj["field_incident_location"]) {
                        newFormData["cs_incident_location"] = localAllUIDataObj["field_incident_location"];
                    }
                    if (localAllUIDataObj["field_incident_date"]) {
                        newFormData["cs_incident_date"] = dayjs(localAllUIDataObj["field_incident_date"]).format("YYYY-MM-DD");
                    }
                    if (localAllUIDataObj["field_cid_crime_no./enquiry_no"]) {
                        newFormData["cs_cid_case_number"] = localAllUIDataObj["field_cid_crime_no./enquiry_no"];
                    }
                    if (localAllUIDataObj["field_cid_initiated_date"]) {
                        newFormData["cs_cid_initiated_date"] = dayjs(localAllUIDataObj["field_cid_initiated_date"]).format("YYYY-MM-DD");
                    }
                    if (localAllUIDataObj["field_investigating_officer_name"]) {
                        newFormData["cs_io_name"] = localAllUIDataObj["field_investigating_officer_name"];
                    }
                    if (localAllUIDataObj["field_investigating_officer_designation"]) {
                        newFormData["cs_io_designation"] = localAllUIDataObj["field_investigating_officer_designation"];
                    }
                    if (localAllUIDataObj["field_brief_information_about_the_allegations"]) {
                        newFormData["cs_allegations_info"] = localAllUIDataObj["field_brief_information_about_the_allegations"];
                    }
                    if (localAllUIDataObj["field_outcome_of_the_investigation"]) {
                        newFormData["cs_investigation_outcome"] = localAllUIDataObj["field_outcome_of_the_investigation"];
                    }
                    if (localAllUIDataObj["field_description/justification_provided_by_accused_individuals"]) {
                        newFormData["cs_accused_justification"] = localAllUIDataObj["field_description/justification_provided_by_accused_individuals"];
                    }
                    if (localAllUIDataObj["field_evidences_available_to_refute_description/justification_provided_by_accused_individuals"]) {
                        newFormData["cs_evidence_to_refute"] = localAllUIDataObj["field_evidences_available_to_refute_description/justification_provided_by_accused_individuals"];
                    }
                    if (localAllUIDataObj["field_compilation_of_evidences"]) {
                        newFormData["cs_evidence_compilation"] = localAllUIDataObj["field_compilation_of_evidences"];
                    }
                    if (localAllUIDataObj["field_conclusion"]) {
                        newFormData["cs_conclusion"] = localAllUIDataObj["field_conclusion"];
                    }
                    if (localAllUIDataObj["field_recommendation"]) {
                        newFormData["cs_recommendation"] = localAllUIDataObj["field_recommendation"];
                    }
                    const policeStationField = allUIFields.find(
                        f => f.name === "field_name_of_the_police_station" || f.field_name === "field_name_of_the_police_station"
                    );
                    if (policeStationField) {
                        const val = allUIDataObj["field_name_of_the_police_station"];
                        if (val !== undefined && val !== null) {
                            newFormData["cs_police_station"] = val;
                        }
                    }
                    if (localAllUIDataObj["created_at"]) {
                        newFormData["cs_case_filed_date"] = dayjs(localAllUIDataObj["created_at"]).format("YYYY-MM-DD");
                    }
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

    const openFileInNewTab = async (file, formData, setLoading, toast, api, row = {}, fieldNameOverride = null) => {
        let tableRowId = row.id || formData.id || formData.tableRowId || rowData?.id || null;
        if (!tableRowId) {
            toast.error("Table row ID missing!", { className: "toast-error" });
            return;
        }

        let fieldName = fieldNameOverride || "field_supporting_documents";
        if (file && typeof file === "object") {
            if (file.field_name) fieldName = file.field_name;
        }

        setLoading(true);

        try {
            const profileRes = await api.post("/chargeSheet/getProfileAttachment", {
                tableRowId,
                fieldName,
            });

            if (!profileRes.success || !profileRes.profile_attachment_id) {
                setLoading(false);
                toast.error("Profile attachment ID not found!", { className: "toast-error" });
                return;
            }

            const attachmentId = profileRes.profile_attachment_id;

            const fileRes = await api.post(
                `/templateData/downloadDocumentAttachments/${attachmentId}`,
                {},
                { responseType: "blob" }
            );

            console.log("File response:", fileRes);
            setLoading(false);

            if (fileRes) {
                const fileUrl = URL.createObjectURL(fileRes);
                console.log("File URL:", fileUrl);
                const newTab = window.open();
                newTab.document.body.innerHTML = `<embed src="${fileUrl}" width="100%" height="100%" />`;
            } else {
                toast.error("Failed to download file!", { className: "toast-error" });
            }
        } catch (error) {
            setLoading(false);
            toast.error("Error loading file, please try again.", { className: "toast-error" });
            console.error(error);
        }
    };

    const formatDateCell = (value) => {
        if (value === undefined || value === null || value === "") return "-";
        if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
            return dayjs(value).format("YYYY-MM-DD");
        }
        return value;
    };

    const getAccusedAttachmentFields = () => {
        if (!accusedTemplate || !accusedTemplate.fields) return [];
        let fieldsArr = [];
        try {
            fieldsArr = typeof accusedTemplate.fields === "string"
                ? JSON.parse(accusedTemplate.fields)
                : accusedTemplate.fields;
        } catch {
            fieldsArr = [];
        }
        return fieldsArr
            .filter(f =>
                (f.data_type && f.data_type.toLowerCase() === "attachments") ||
                (f.type && f.type.toLowerCase() === "file")
            )
            .map(f => f.name);
    };


    return (
        <Box sx={{ overflow: 'auto', height: '100vh' }}>
            <Box p={2} pb={8}>

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
                            Final Report
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
                    {
                        showMagazineView && 
                        <Button
                            onClick={()=>showMagazineView(false)}
                            sx={{height: "38px", textTransform: 'none'}}
                            className="whiteBorderedBtn"
                        >
                            View Magazine
                        </Button>
                    }
                </Box>
                {/* <Typography
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
                </Typography> */}

                {/* <Box sx={{ mt: 0, mb: 2 }}>
                    <Typography sx={{ fontWeight: 600, mb: 1, color: "#0B5ED7" }}>Accused</Typography>
                    {accusedList.length > 0 ? (
                        <Box sx={{ overflowX: 'auto', maxWidth: '100%' }}>
                            <Table
                                size="small"
                                sx={{
                                    minWidth: 900,
                                    border: "1.5px solid #bdbdbd",
                                    borderCollapse: "collapse",
                                    '& th, & td': {
                                        border: "1px solid #bdbdbd"
                                    }
                                }}
                            >
                                <TableBody>
                                    <TableRow>
                                        {Object.keys(accusedList[0])
                                            .filter(key => !hiddenColumns.includes(key))
                                            .map((key, idx) => {
                                                let header = key.replace(/^field_/, '').replace(/_/g, ' ');
                                                header = header.charAt(0).toUpperCase() + header.slice(1);
                                                return (
                                                    <TableCell
                                                        key={idx}
                                                        sx={{
                                                            fontWeight: 600,
                                                            whiteSpace: 'normal',
                                                            wordBreak: 'break-word',
                                                            maxWidth: 180,
                                                            minWidth: 120,
                                                            px: 1
                                                        }}
                                                    >
                                                        {header}
                                                    </TableCell>
                                                );
                                            })}
                                    </TableRow>
                                    {accusedList.map((row, rowIdx) => (
                                        <TableRow key={rowIdx}>
                                            {Object.keys(row)
                                                .filter(key => !hiddenColumns.includes(key))
                                                .map((key, colIdx) => {
                                                    let value = row[key];
                                                    if (value === undefined || value === null || value === "") value = "-";
                                                    // Dynamically check if this key is an attachment field
                                                    const attachmentFields = getAccusedAttachmentFields();
                                                    if (attachmentFields.includes(key)) {
                                                        return (
                                                            <TableCell key={colIdx} sx={{ minWidth: 120, px: 1 }}>
                                                                {value !== "-" ? (
                                                                    <Box
                                                                        sx={{
                                                                            display: "flex",
                                                                            alignItems: "center",
                                                                            gap: 1,
                                                                            cursor: "pointer",
                                                                            border: "1px solid #e0e0e0",
                                                                            borderRadius: 1,
                                                                            px: 1,
                                                                            py: 0.5,
                                                                            background: "#f8f9fa",
                                                                            maxWidth: 220,
                                                                            overflow: "hidden"
                                                                        }}
                                                                        onClick={e => {
                                                                            e.stopPropagation();
                                                                            openFileInNewTab(
                                                                                value,
                                                                                formData,
                                                                                setLoading,
                                                                                toast,
                                                                                api,
                                                                                row,
                                                                                key // fieldNameOverride
                                                                            );
                                                                        }}
                                                                        title="Click to preview"
                                                                    >
                                                                        {getFileIcon(value)}
                                                                        <span style={{
                                                                            marginLeft: 6,
                                                                            whiteSpace: "nowrap",
                                                                            overflow: "hidden",
                                                                            textOverflow: "ellipsis",
                                                                            maxWidth: 170,
                                                                            display: "inline-block"
                                                                        }}>
                                                                            {typeof value === "string" ? value.split("/").pop() : ""}
                                                                        </span>
                                                                    </Box>
                                                                ) : (
                                                                    <span>-</span>
                                                                )}
                                                            </TableCell>
                                                        );
                                                    }
                                                    return (
                                                        <TableCell key={colIdx} sx={{ minWidth: 120, px: 1 }}>
                                                            {value}
                                                        </TableCell>
                                                    );
                                                })}
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
                            <Table
                                size="small"
                                sx={{
                                    minWidth: 900,
                                    border: "1.5px solid #bdbdbd",
                                    borderCollapse: "collapse",
                                    '& th, & td': {
                                        border: "1px solid #bdbdbd"
                                    }
                                }}
                            >
                                <TableBody>
                                    <TableRow>
                                        {Object.keys(fslList[0])
                                            .filter(
                                                key =>
                                                    ![
                                                        "sys_status",
                                                        "id",
                                                        "created_at",
                                                        "updated_at",
                                                        "created_by",
                                                        "updated_by",
                                                        "created_by_id",
                                                        "updated_by_id",
                                                        "ui_case_id",
                                                        "pt_case_id"
                                                    ].includes(key)
                                            )
                                            .map((key, idx) => {
                                                let header = key.replace(/^field_/, '').replace(/_/g, ' ');
                                                header = header.charAt(0).toUpperCase() + header.slice(1);
                                                return (
                                                    <TableCell
                                                        key={idx}
                                                        sx={{
                                                            fontWeight: 600,
                                                            whiteSpace: 'normal',
                                                            wordBreak: 'break-word',
                                                            maxWidth: 180,
                                                            minWidth: 120,
                                                            px: 1
                                                        }}
                                                    >
                                                        {header}
                                                    </TableCell>
                                                );
                                            })}
                                    </TableRow>
                                    {fslList.map((row, rowIdx) => (
                                        <TableRow key={rowIdx}>
                                            {Object.keys(row)
                                                .filter(
                                                    key =>
                                                        ![
                                                            "sys_status",
                                                            "id",
                                                            "created_at",
                                                            "updated_at",
                                                            "created_by",
                                                            "updated_by",
                                                            "created_by_id",
                                                            "updated_by_id",
                                                            "ui_case_id",
                                                            "pt_case_id"
                                                        ].includes(key)
                                                )
                                                .map((key, colIdx) => (
                                                    <TableCell
                                                        key={colIdx}
                                                        sx={{
                                                            whiteSpace: 'normal',
                                                            wordBreak: 'break-word',
                                                            maxWidth: 180,
                                                            minWidth: 120,
                                                            px: 1
                                                        }}
                                                    >
                                                        {formatDateCell(row[key])}
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
                            <Table
                                size="small"
                                sx={{
                                    minWidth: 900,
                                    border: "1.5px solid #bdbdbd",
                                    borderCollapse: "collapse",
                                    '& th, & td': {
                                        border: "1px solid #bdbdbd"
                                    }
                                }}
                            >
                                <TableBody>
                                    <TableRow>
                                        {Object.keys(witnessList[0])
                                            .filter(key => !hiddenColumns.includes(key))
                                            .map((key, idx) => {
                                                let header = key.replace(/^field_/, '').replace(/_/g, ' ');
                                                header = header.charAt(0).toUpperCase() + header.slice(1);
                                                return (
                                                    <TableCell
                                                        key={idx}
                                                        sx={{
                                                            fontWeight: 600,
                                                            whiteSpace: 'normal',
                                                            wordBreak: 'break-word',
                                                            maxWidth: 180,
                                                            minWidth: 120,
                                                            px: 1
                                                        }}
                                                    >
                                                        {header}
                                                    </TableCell>
                                                );
                                            })}
                                    </TableRow>
                                    {witnessList.map((row, rowIdx) => (
                                        <TableRow key={rowIdx}>
                                            {Object.keys(row)
                                                .filter(key => !hiddenColumns.includes(key))
                                                .map((key, colIdx) => (
                                                    <TableCell
                                                        key={colIdx}
                                                        sx={{
                                                            whiteSpace: 'normal',
                                                            wordBreak: 'break-word',
                                                            maxWidth: 180,
                                                            minWidth: 120,
                                                            px: 1
                                                        }}
                                                    >
                                                        {formatDateCell(row[key])}
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
                </Box> */}

                {chargeSheetGroups.map((group, idx) => (
                    <Box key={group.heading} sx={{ mb: 3 }}>
                        <Typography sx={{ fontWeight: 600, mb: 1, color: "#0B5ED7" }}>{group.heading}</Typography>
                        {group.heading === "6. Details of the accused individuals" ? (
                            accusedList.length > 0 && accusedTemplate && accusedTemplate.fields ? (
                                (() => {
                                    let accusedFields = [];
                                    try {
                                        accusedFields = typeof accusedTemplate.fields === "string"
                                            ? JSON.parse(accusedTemplate.fields)
                                            : accusedTemplate.fields;
                                    } catch {
                                        accusedFields = [];
                                    }
                                    const displayFields = accusedFields.filter(f =>
                                        Object.keys(accusedList[0]).includes(f.name) && !hiddenColumns.includes(f.name)
                                    );
                                    return (
                                        <Box sx={{ overflowX: 'auto', maxWidth: '100%' }}>
                                            <Table
                                                size="small"
                                                sx={{
                                                    minWidth: 900,
                                                    border: "1.5px solid #bdbdbd",
                                                    borderCollapse: "collapse",
                                                    '& th, & td': {
                                                        border: "1px solid #bdbdbd"
                                                    }
                                                }}
                                            >
                                                <TableBody>
                                                    <TableRow>
                                                        {displayFields.map((field, idx) => {
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
                                                    </TableRow>
                                                    {accusedList.map((row, rowIdx) => (
                                                        <TableRow key={rowIdx}>
                                                            {displayFields.map((field, colIdx) => {
                                                                const key = field.name;
                                                                let value = row[key];
                                                                if (value === undefined || value === null || value === "") value = "-";
                                                                const attachmentFields = getAccusedAttachmentFields();
                                                                if (attachmentFields.includes(key)) {
                                                                    return (
                                                                        <TableCell key={colIdx} sx={{ minWidth: 120, px: 1 }}>
                                                                            {value !== "-" ? (
                                                                                <Box
                                                                                    sx={{
                                                                                        display: "flex",
                                                                                        alignItems: "center",
                                                                                        gap: 1,
                                                                                        cursor: "pointer",
                                                                                        border: "1px solid #e0e0e0",
                                                                                        borderRadius: 1,
                                                                                        px: 1,
                                                                                        py: 0.5,
                                                                                        background: "#f8f9fa",
                                                                                        maxWidth: 220,
                                                                                        overflow: "hidden"
                                                                                    }}
                                                                                    onClick={e => {
                                                                                        e.stopPropagation();
                                                                                        openFileInNewTab(
                                                                                            value,
                                                                                            formData,
                                                                                            setLoading,
                                                                                            toast,
                                                                                            api,
                                                                                            row,
                                                                                            key // fieldNameOverride
                                                                                        );
                                                                                    }}
                                                                                    title="Click to preview"
                                                                                >
                                                                                    {getFileIcon(value)}
                                                                                    <span style={{
                                                                                        marginLeft: 6,
                                                                                        whiteSpace: "nowrap",
                                                                                        overflow: "hidden",
                                                                                        textOverflow: "ellipsis",
                                                                                        maxWidth: 170,
                                                                                        display: "inline-block"
                                                                                    }}>
                                                                                        {typeof value === "string" ? value.split("/").pop() : ""}
                                                                                    </span>
                                                                                </Box>
                                                                            ) : (
                                                                                <span>-</span>
                                                                            )}
                                                                        </TableCell>
                                                                    );
                                                                }
                                                                return (
                                                                    <TableCell key={colIdx} sx={{ minWidth: 120, px: 1 }}>
                                                                        {value}
                                                                    </TableCell>
                                                                );
                                                            })}
                                                        </TableRow>
                                                    ))}
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
                                    <Table
                                        size="small"
                                        sx={{
                                            minWidth: 900,
                                            border: "1.5px solid #bdbdbd",
                                            borderCollapse: "collapse",
                                            '& th, & td': {
                                                border: "1px solid #bdbdbd"
                                            }
                                        }}
                                    >
                                        <TableBody>
                                            <TableRow>
                                                {Object.keys(witnessList[0])
                                                    .filter(key => !hiddenColumns.includes(key))
                                                    .map((key, idx) => {
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
                                            </TableRow>
                                            {witnessList.map((row, rowIdx) => (
                                                <TableRow key={rowIdx}>
                                                    {Object.keys(row)
                                                        .filter(key => !hiddenColumns.includes(key))
                                                        .map((key, colIdx) => {
                                                            let value = row[key];
                                                            if (value === undefined || value === null || value === "") value = "-";
                                                            return (
                                                                <TableCell key={colIdx} sx={{ minWidth: 120, px: 1 }}>
                                                                    {value}
                                                                </TableCell>
                                                            );
                                                        })}
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </Box>
                            ) : (
                                <Typography sx={{ color: "#B71C1C", fontWeight: 500, mt: 1 }}>No data found</Typography>
                            )
                        ) : group.heading === "15. Supporting Documents" ? (
                            // ...existing code for supporting documents...
                            <Box>
                                {/* Preview already uploaded files (from backend) */}
                                {(() => {
                                    let fileString = formData.field_supporting_documents || formData.cs_supporting_documents;
                                    if (!fileString && typeof allUIDataObj === "object" && allUIDataObj.field_supporting_documents) {
                                        fileString = allUIDataObj.field_supporting_documents;
                                    }
                                    if (Array.isArray(fileString)) fileString = fileString.join(",");
                                    let fileList = [];
                                    if (typeof fileString === "string" && fileString.trim() !== "") {
                                        if (fileString.trim().startsWith("[") && fileString.trim().endsWith("]")) {
                                            try {
                                                const arr = JSON.parse(fileString);
                                                if (Array.isArray(arr)) {
                                                    fileList = arr.map(f =>
                                                        typeof f === "string"
                                                            ? f
                                                            : (f && (f.filename || f.name))
                                                    ).filter(Boolean);
                                                }
                                            } catch {
                                                fileList = fileString.split(",").map(f => f && typeof f === "string" ? f.trim() : "").filter(f => !!f && f !== "[object Object]");
                                            }
                                        } else {
                                            fileList = fileString.split(",").map(f => f && typeof f === "string" ? f.trim() : "").filter(f => !!f && f !== "[object Object]");
                                        }
                                    }
                                    // Show preview boxes with onClick to preview
                                    return fileList.length > 0 ? (
                                        <Box sx={{ mb: 1, display: "flex", flexWrap: "wrap", gap: 2 }}>
                                            {fileList.map((file, idx) => (
                                                <Box
                                                    key={idx}
                                                    sx={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        border: "1px solid #e0e0e0",
                                                        borderRadius: 1,
                                                        px: 1.5,
                                                        py: 0.5,
                                                        background: "#f8f9fa",
                                                        fontSize: 14,
                                                        color: "#333",
                                                        gap: 1,
                                                        maxWidth: 220,
                                                        overflow: "hidden",
                                                        cursor: "pointer"
                                                    }}
                                                    onClick={async (e) => {
                                                        e.stopPropagation();
                                                        await openFileInNewTab(file, formData, setLoading, toast, api, {});
                                                    }}
                                                    title="Click to preview"
                                                >
                                                    {getFileIcon(file)}
                                                    <span style={{
                                                        marginLeft: 6,
                                                        whiteSpace: "nowrap",
                                                        overflow: "hidden",
                                                        textOverflow: "ellipsis",
                                                        maxWidth: 170,
                                                        display: "inline-block"
                                                    }}>
                                                        {typeof file === "string"
                                                            ? file.split("/").pop() || file
                                                            : (file && file.name) || ""}
                                                    </span>
                                                </Box>
                                            ))}
                                        </Box>
                                    ) : null;
                                })()}
                                <FileInput
                                    field={{
                                        name: "cs_supporting_documents",
                                        label: "Supporting Documents",
                                        multiple: true,
                                        required: false,
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
                            <Table size="small" sx={{ maxWidth: '100%', border: '1px solid #e0e0e0' }}>
                                <TableBody>
                                    <TableRow>
                                        {group.fields.map(field => (
                                            <TableCell key={field.id} sx={{ fontWeight: 500, width: 200 }}>{field.label}</TableCell>
                                        ))}
                                    </TableRow>
                                    <TableRow>
                                        {group.fields.map(field => {
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

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                    <Button
                        variant="contained"
                        color="success"
                        size="large"
                        sx={{ fontWeight: 500, height: 40, margin: 0 }}
                        onClick={alreadySaved ? updateChargeSheetApi : saveChargeSheetApi}
                    >
                        {alreadySaved ? "Update" : "Save"}
                    </Button>
                </Box>

            </Box>
        </Box>
    );
};

export default ChargeSheetInvestigation;
