import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Grid } from '@mui/material';
import ShortText from "../components/form/ShortText";
import DateField from "../components/form/Date";
import AutocompleteField from "../components/form/AutoComplete";
import LongText from "../components/form/LongText.jsx";
import { Box, SvgIcon } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, } from "@mui/material";
import { Snackbar, Alert } from '@mui/material';

export default function Registeration() {
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    const navigate = useNavigate();
    const [date, setDate] = useState("");
    const [dateofpr, setDatePr] = useState("");
    const [dateofeo, setDateEo] = useState("");
    const [successVisibleModal, setSuccessModal] = useState(false);
    const [successMsg, setSuccessMsg] = useState(false);
    const [formData, setFormData] = useState({});
    const [errors, setErrors] = useState({});

    const showSuccessModal = (msg) => {
        setSuccessModal(true);
        setSuccessMsg(msg);
    };

    var onlycourt = [
        { name: "Court Hall 1", code: "CO" },
        { name: "Court Hall 2", code: "GO" },
        { name: "Court Hall 3", code: "HC" },
        { name: "Court Hall 4", code: "SC" },
        { name: "Court Hall 5", code: "NH" },
        { name: "Court Hall 6", code: "SH" },
    ];

    var Division = [
        { name: "Administration Division ", code: "CO" },
        { name: "Homicide and Burglary Division", code: "GO" },
        { name: "Special Enquiry Division", code: "HC" },
        { name: "Economic offences Division", code: "SC" },
        { name: "Financial Intelligence Division", code: "NH" },
        { name: "Deposit Fraud Investigation Division", code: "SH" },
        { name: "Cyber Crime Division", code: "CC" },
        { name: "Cyber Training & Research Division", code: "CT" },
        { name: "Narcotic and Organised Crime Division", code: "NO" },
        { name: "Forest and Wildlife Offenses Division", code: "FW" },
    ];

    var yes_no = [
        { name: "YES", code: "yes" },
        { name: "NO", code: "no" },
    ];

    var backToCase = () => {
        navigate("/trail");
    };

    const fields = [
        {
            type: "shortText",
            name: "cc_sc",
            label: "CC No",
            required: true,
            defaultValue: "305/2019",
        },
        {
            type: "shortText",
            name: "policestation",
            label: "Name of the PS",
            required: true,
            defaultValue: "PS6",
        },
        {
            type: "shortText",
            name: "policestation",
            label: "PS CR No",
            required: true,
            defaultValue: "119",
        },
        {
            type: "shortText",
            name: "cid_crime_number",
            label: "CID Crime Number",
            required: true,
            defaultValue: "305/2019",
        },
        {
            type: "shortText",
            name: "cid_crime_number",
            label: "Name of the HIO",
            required: true,
            defaultValue: "Sunil",
        },
        {
            type: "shortText",
            name: "cid_crime_number",
            label: "Name of the Court",
            required: true,
            defaultValue: "High Court 3",
        },
        {
            type: "shortText",
            name: "cid_crime_number",
            label: "Section of law for which charged",
            required: true,
        },
        {
            type: "divider",
        },
        {
            type: "date",
            name: "birth_date",
            label: "Hearing Date",
            required: true,
            stateSetter: setDatePr,
            defaultValue: dateofpr,
        },
        {
            type: "autocomplete",
            name: "court",
            label: "Process Type",
            options: onlycourt,
        },
        {
            type: "longText",
            name: "briefFact",
            label: "Name, address & Mobile Number of the CW",
            required: true,
            maxLength: 500
        },

        {
            type: "autocomplete",
            name: "cid_eo_dept_unit",
            label: "Recieved on",
            options: Division,
        },
        {
            type: "autocomplete",
            name: "cid_eo_dept_unit",
            label: "Served on",
            options: Division,
        },

        {
            type: "longText",
            name: "briefFact",
            label: "Reason",
            required: true,
            maxLength: 500
        },
        {
            type: "autocomplete",
            name: "framed",
            label: "CW attended the trail?(Yes/No)",
            options: yes_no
        },
        {
            type: "longText",
            name: "briefFact",
            label: "Trail Result",
            required: true,
            maxLength: 500
        },
        {
            type: "date",
            name: "dateofeo",
            label: "Next Hearing Date",
            required: true,
            stateSetter: setDateEo,
            defaultValue: dateofeo,
        },
    ];

    return (
        <div className="my-2 mx-3 p-3 bg-white border-round-sm">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "16px 0 16px 0" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <Box sx={{ ml: 1 }}>
                        <SvgIcon
                            component="svg"
                            className="cursor-pointer"
                            onClick={backToCase}
                            sx={{ width: 24, height: 24 }}
                        >
                            <path
                                d="M19 12H5M5 12L12 19M5 12L12 5"
                                stroke="#101828"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </SvgIcon>
                    </Box>

                </div>
            </div>
            <div className="flex align-items-center" style={{ justifyContent: "space-between" }}>
                <div className="flex items-center" style={{ gap: "8px", alignItems: "center", marginTop: "28px", marginLeft: "9px" }}>
                    <h1 style={{ fontSize: "1.25rem", fontWeight: "bold", color: "#2d3748", }}>
                        Annexure 4
                    </h1>
                </div>
            </div>

            <Box
                sx={{
                    px: 2,
                    py: 2,
                    maxHeight: "500px",
                    overflowY: "auto",
                    borderRadius: "8px",
                    backgroundColor: "white",
                    scrollbarWidth: "none",
                    "&::-webkit-scrollbar": {
                        display: "none",
                    },
                }}
            >
                <Grid container spacing={2}>
                    {fields.map((field, index) => (
                        field.type === "divider" ? (
                            <Grid item xs={12} key={index}>
                                <div
                                    style={{
                                        borderTop: "1px dashed #98A2B3",
                                        width: "100%",
                                        margin: "8px 0",
                                    }}
                                ></div>
                            </Grid>
                        ) : (
                            <React.Fragment key={index}>
                                {field.type === "longText" && (
                                    <Grid item xs={12} key={index}>
                                        <LongText
                                            field={{
                                                name: field.name,
                                                label: field.label,
                                                required: field.required,
                                                maxLength: field.maxLength,
                                                disabled: field.disabled || false,
                                                heading: field.heading,
                                                info: field.info,
                                                history: field.history,
                                            }}
                                            formData={formData}
                                            errors={errors}
                                            onChange={(e) => {
                                                setFormData({
                                                    ...formData,
                                                    [field.name]: e.target.value,
                                                });
                                            }}
                                            onHistory={field.onHistory}
                                        />
                                    </Grid>
                                )}
                                {field.type !== "longText" && (
                                    <Grid item xs={12} sm={6} key={index}>
                                        {field.type === "autocomplete" && (
                                            <AutocompleteField
                                                formData={formData}
                                                errors={errors}
                                                field={{
                                                    name: field.name,
                                                    label: field.label,
                                                    options: field.options,
                                                }}
                                                onChange={(name, value) => {
                                                    setFormData({
                                                        ...formData,
                                                        [name]: value,
                                                    });
                                                }}
                                            />
                                        )}
                                        {field.type === "shortText" && (
                                            <ShortText
                                                field={{
                                                    name: field.name,
                                                    label: field.label,
                                                    required: field.required,
                                                    maxLength: field.maxLength,
                                                    disabled: field.disabled || false,
                                                }}
                                                formData={{ [field.name]: field.defaultValue || "" }}
                                                errors={{}}
                                                onChange={(name, value) => {
                                                    setFormData({
                                                        ...formData,
                                                        [name]: value,
                                                    });
                                                }}
                                            />
                                        )}
                                        {field.type === "date" && (
                                            <DateField
                                                field={{
                                                    name: field.name,
                                                    label: field.label,
                                                    required: field.required,
                                                    disableFutureDate: "true",
                                                }}
                                                formData={{ [field.name]: field.defaultValue }}
                                                errors={{}}
                                                onChange={(e) => setDate(e.value)}
                                            />
                                        )}
                                    </Grid>
                                )}
                            </React.Fragment>
                        )
                    ))}
                </Grid>
            </Box>
            <div>

                <div
                    style={{
                        position: "fixed",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-end",
                        bottom: 0,
                        right: 0,
                        width: "100%",
                        maxWidth: "calc(100% - 20px)",
                        padding: "16px",
                        backgroundColor: "white",
                        borderTop: "1px solid #E4E4E7",
                        gap: "16px",
                    }}
                >
                    <Button
                        variant="outlined"
                        sx={{
                            color: "#b7bbc2",
                            width: "13vw",
                            borderColor: "#b7bbc2",
                            backgroundColor: "#f9fafb",
                            borderWidth: "2px",
                            fontWeight: "600",
                            textTransform: "none",
                            "&:hover": {
                                backgroundColor: "#f1f5f9",
                            },
                        }}
                        onClick={() => navigate("/PTCase")}
                    >
                        Cancel
                    </Button>

                    <Button
                        variant="outlined"
                        sx={{
                            color: "white",
                            width: "13vw",
                            borderColor: "#2563eb",
                            backgroundColor: "#2563eb",
                            borderWidth: "2px",
                            fontWeight: "700",
                            textTransform: "none",
                            "&:hover": {
                                backgroundColor: "#1d4ed8",
                            },
                        }}
                        onClick={() => {
                            setSnackbarMessage(`Annexure 4 Submitted for Approval Successfully`);
                            setSnackbarSeverity('success');
                            setOpenSnackbar(true);                        
                        }}
                    >
                        Submit for Approval
                    </Button>
                </div>
            </div>
            <div style={{ position: "relative", width: "300px", marginTop: "30px" }}>

                <Dialog
                    open={successVisibleModal}
                    onClose={() => {
                        if (!successVisibleModal) return;
                        setSuccessModal(false);
                    }}
                    maxWidth="sm"
                    fullWidth
                    sx={{
                        "& .MuiDialogPaper-root": {
                            borderRadius: "20px",
                        },
                        padding: "15px",
                    }}
                >
                    <DialogContent sx={{ display: "flex", textAlign: "left", flexDirection: "column" }}>
                        <CheckCircleIcon
                            sx={{
                                backgroundColor: "rgba(209, 250, 223, 1)",
                                border: "15px solid rgba(236, 253, 243, 1)",
                                borderRadius: "50%",
                                fontSize: "24px",
                                color: "green",
                                marginBottom: "2px",
                            }}
                        />
                        <div>
                            <p
                                style={{
                                    fontSize: "16px",
                                    color: "rgb(156, 163, 175)",
                                    margin: 0,
                                }}
                            >
                                {successMsg}
                            </p>
                        </div>
                    </DialogContent>
                    <DialogActions sx={{ justifyContent: "center", padding: "10px 20px" }}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => {
                                setSuccessModal(false);
                                navigate("/trail");
                            }}
                            sx={{ width: "100%", padding: "8px" }}
                        >
                            Done
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Notification bar */}
                <Snackbar
                    open={openSnackbar}
                    autoHideDuration={2000}
                    onClose={() => setOpenSnackbar(false)}
                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                >
                    <Alert
                        onClose={() => setOpenSnackbar(false)}
                        severity={snackbarSeverity}
                        sx={{ width: '100%' }}
                    > {snackbarMessage} </Alert>
                </Snackbar>
            </div>
        </div>
    );
}
