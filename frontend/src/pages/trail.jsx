import React, { useState, useRef, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import TableView from "../components/table-view/TableView";
import FilterListIcon from '@mui/icons-material/FilterList';
import { Button } from '@mui/material';
import AutocompleteField from "../components/form/AutoComplete";
import { Typography, Box } from '@mui/material';
import DateField from "../components/form/Date";
import { useNavigate } from "react-router-dom";

const Report = () => {
    const [pageSize, setPageSize] = useState(5);
    const [currentPage, setCurrentPage] = useState(0);
    const [formData, setFormData] = useState({});
    const [errors, setErrors] = useState({});
    const [date, setDate] = useState("");
    const navigate = useNavigate();

    const [users, setUsers] = useState([
        {
            id: 1,
            caseType: "Under Investigation",
            crimeNo: "04/2008",
            fir: "FIR",
            psCrimeNo: "123",
            psName: "PS2",
            department: "CID",
            division: "Homicide & Burglary",
            referingagency: "A",
        },
        {
            id: 2,
            caseType: "Pending Trial",
            crimeNo: "05/2009",
            fir: "FOC",
            psCrimeNo: "124",
            psName: "PS1",
            department: "EO",
            division: "Special Enquiries",
            referingagency: "A",
        },
        {
            id: 3,
            caseType: "Under Investigation",
            crimeNo: "06/2010",
            fir: "UDR",
            psCrimeNo: "125",
            psName: "PS3",
            department: "CID",
            division: "Homicide & Burglary",
            referingagency: "A",
        },
        {
            id: 4,
            caseType: "Pending Trial",
            crimeNo: "07/2011",
            fir: "FOC",
            psCrimeNo: "126",
            psName: "PS4",
            department: "EO",
            division: "Special Enquiries",
            referingagency: "A",
        },
        {
            id: 5,
            caseType: "Under Investigation",
            crimeNo: "08/2012",
            fir: "FIR",
            psCrimeNo: "127",
            psName: "PS5",
            department: "CID",
            division: "Homicide & Burglary",
            referingagency: "A",
        },
    ]);


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

    var agency = [
        { name: "CO-DG ", code: "CO" },
        { name: "GOVT", code: "GO" },
        { name: "High Court", code: "HC" },
        { name: "Supreme Court", code: "SC" },
        { name: "NHRC", code: "NH" },
        { name: "SHRC", code: "SH" },
        { name: "Other", code: "OT" },
        { name: "CCPS", code: "CC" },
    ];

    var present_status = [
        { name: "Under Investigation", code: "UDR" },
        { name: "Under Enquiry", code: "FIR" },
        { name: "Charge-Sheet Filed", code: "UDR" },
        { name: "Case Closed", code: "UDR" },
        { name: "Pending in Court", code: "UDR" },
        { name: "Conviction", code: "UDR" },
        { name: "Acquittal", code: "UDR" },
        { name: "Referred Back for Further Investigation", code: "UDR" },
        { name: "Transferred to Another Agency", code: "UDR" },
        { name: "Abated", code: "UDR" },
        { name: "Compromised/Settled", code: "UDR" },
    ];

    var CaseType = [
        { name: "Enquiry", code: "EQ" },
    ];

    const [successVisible, setSuccessVisible] = useState(false);

    const tableBodyTemplate = (field, color, fontWeight, textDecoration) => {
        return (rowData) => (
            <span
                className="Roboto"
                style={{
                    fontSize: "14px",
                    lineHeight: "14px",
                    fontWeight: fontWeight || "500",
                    color: color || "#1D2939",
                    textDecoration: textDecoration || "none",
                }}
            >
                {rowData[field]}
            </span>
        );
    };

    const columns = [
        {
            field: 'caseType',
            headerName: 'Case Type',
            width: 200,
            sortable: true,
            renderCell: (params) => tableBodyTemplate("caseType", "#475467", "400")(params.row)
        },
        {
            field: 'crimeNo',
            headerName: 'CID Crime No',
            width: 150,
            sortable: true,
            renderCell: (params) => tableBodyTemplate("crimeNo")(params.row)
        },
        {
            field: 'fir',
            headerName: 'FIR/UDR/FOC/MFA',
            width: 200,
            sortable: true,
            renderCell: (params) => tableBodyTemplate("fir", "#475467", "400", "underline")(params.row)
        },
        {
            field: 'psCrimeNo',
            headerName: 'PS Crime No',
            width: 150,
            sortable: true,
            renderCell: (params) => tableBodyTemplate("psCrimeNo")(params.row)
        },
        {
            field: 'psName',
            headerName: 'PS Name',
            width: 100,
            sortable: true,
            renderCell: (params) => tableBodyTemplate("psName")(params.row)
        },
        {
            field: 'division',
            headerName: 'Division',
            width: 200,
            sortable: true,
            renderCell: (params) => tableBodyTemplate("division")(params.row)
        },
        {
            field: 'department',
            headerName: 'Department',
            width: 150,
            sortable: true,
            renderCell: (params) => tableBodyTemplate("department")(params.row)
        },
        {
            field: 'Referring Agency',
            headerName: 'Referring Agency',
            width: 150,
            sortable: true,
            renderCell: (params) => tableBodyTemplate("referingagency")(params.row)
        },
        {
            field: 'date',
            headerName: 'Date',
            width: 100,
            sortable: true,
            renderCell: (params) => tableBodyTemplate("department")(params.row)
        },
        {
            field: 'Present IO',
            headerName: 'Present IO',
            width: 150,
            sortable: true,
            renderCell: (params) => tableBodyTemplate("department")(params.row)
        },
        {
            field: 'Present IO Designation',
            headerName: 'Present IO Designation',
            width: 200,
            sortable: true,
            renderCell: (params) => tableBodyTemplate("department")(params.row)
        },
        {
            field: 'Present Status',
            headerName: 'Present Status',
            width: 150,
            sortable: true,
            renderCell: (params) => tableBodyTemplate("department")(params.row)
        },
        {
            field: 'Court Name',
            headerName: 'Court Name',
            width: 150,
            sortable: true,
            renderCell: (params) => tableBodyTemplate("department")(params.row)
        },
        {
            field: 'Court Location',
            headerName: 'Court Location',
            width: 150,
            sortable: true,
            renderCell: (params) => tableBodyTemplate("department")(params.row)
        },
        {
            field: 'CC/SC/ACC',
            headerName: 'CC/SC/ACC',
            width: 150,
            sortable: true,
            renderCell: (params) => tableBodyTemplate("department")(params.row)
        }
    ];

    const handleSelectionChange = (selectedRow) => {
        navigate("/annexure", {
            state: { caseDetails: selectedRow },
        });
    };

    const totalPages = Math.ceil(users.length / pageSize);
    const currentPageRows = users.slice(currentPage * pageSize, (currentPage + 1) * pageSize);

    const handleNext = () => {
        if (currentPage < totalPages - 1) setCurrentPage(currentPage + 1);
    };

    const handleBack = () => {
        if (currentPage > 0) setCurrentPage(currentPage - 1);
    };

    var showFilterBox = () => {
        setSuccessVisible(true);
    };


    return (
        <Box p={2}>
            <div className="m-3 ml-4 p-3 bg-white border-round-sm">
                <div className="flex align-items-center" style={{ display: "flex", justifyContent: "space-between", alignItems: 'center' }}>
                    <div className="flex flex-column">
                        <div className="flex items-center" style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                            <h1 style={{ fontSize: "24px", fontWeight: "bold", color: "#2d3748", margin: "0" }}>
                                Trial Monitoring
                            </h1>
                        </div>
                    </div>
                    <div
                        className="button-container"
                        style={{
                            display: "flex",
                            gap: "16px",
                            justifyContent: "end"
                        }}
                    >
                        <>
                            <Button
                                variant="outlined"
                                startIcon={<FilterListIcon />}
                                onClick={showFilterBox}
                                sx={{
                                    height: "38px",
                                    border: "1px solid #D0D5DD",
                                    borderRadius: "6px",
                                    gap: "8px",
                                    color: "#1D2939",
                                    fontWeight: "600",
                                    textTransform: 'none',
                                    "&:hover": {
                                        backgroundColor: "transparent",
                                    },
                                }}
                            >
                                Filter
                            </Button>
                        </>
                    </div>
                </div>
            </div>

            <div className="pt-4" style={{ overflowX: "auto" }}>
                <div style={{ height: 400, width: '100%' }}>
                    <TableView rows={currentPageRows} columns={columns}
                        handleRowClick={handleSelectionChange}
                        handleNext={handleNext} handleBack={handleBack} backBtn={currentPage > 0} nextBtn={currentPage < totalPages - 1} />
                </div>
            </div>
            <Dialog
                open={successVisible}
                onClose={() => {
                    if (!successVisible) return;
                    setSuccessVisible(false);
                }}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        width: '50vw',
                        color: '#000',
                        background: '#fff',
                        borderRadius: '12px',
                    },
                }}
            >
                <DialogTitle sx={{ borderBottom: '1px solid #E5E7EB', pb: 2 }}>
                    <Box display="flex" alignItems="center" gap={1}>
                        <svg
                            width="18"
                            height="18"
                            viewBox="0 0 18 18"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M4.5 9H13.5M2.25 4.5H15.75M6.75 13.5H11.25"
                                stroke="#1D2939"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                        <Typography variant="subtitle1" fontWeight="bold">
                            Case Filters
                        </Typography>
                    </Box>
                </DialogTitle>

                <DialogContent
                    sx={{
                        borderBottom: "1px solid #E5E7EB",
                        paddingBottom: "16px",
                        marginTop: "16px",
                    }}
                >
                    <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gap={2}>
                        <AutocompleteField
                            formData={formData}
                            errors={errors}
                            field={{
                                name: "io_name",
                                label: "IO Name",
                                options: [
                                    { name: "Manjunath DR", code: "Manjunath DR" },
                                    { name: "Sandeep Kumar", code: "Sandeep Kumar" },
                                    { name: "Neha Reddy", code: "Neha Reddy" },
                                    { name: "Karan Yadav", code: "Karan Yadav" },
                                    { name: "Vikram Singh", code: "Vikram Singh" },
                                ],
                            }}
                            onChange={(name, value) => {
                                setFormData((prev) => ({ ...prev, [name]: value }));
                            }}
                        />

                        <AutocompleteField
                            formData={formData}
                            errors={errors}
                            field={{ name: "present_status", label: "Present Status", options: present_status }}
                            onChange={(name, value) => {
                                setFormData((prev) => ({ ...prev, [name]: value }));
                            }}
                        />

                        <AutocompleteField
                            formData={formData}
                            errors={errors}
                            field={{ name: "case_type", label: "Case Type", options: CaseType }}
                            onChange={(name, value) => {
                                setFormData((prev) => ({ ...prev, [name]: value }));
                            }}
                        />

                        <AutocompleteField
                            formData={formData}
                            errors={errors}
                            field={{ name: "division", label: "Division", options: Division }}
                            onChange={(name, value) => {
                                setFormData((prev) => ({ ...prev, [name]: value }));
                            }}
                        />

                        <AutocompleteField
                            formData={formData}
                            errors={errors}
                            field={{
                                name: "cid_crime_no", label: "CID Crime No.", options: [
                                    { name: "104/2014", code: "104/2014" },
                                    { name: "108/2015", code: "108/2015" },
                                    { name: "111/2008", code: "111/2008" },
                                    { name: "124/2014", code: "124/2014" },
                                    { name: "144/2015", code: "144/2015" },
                                    { name: "169/2015", code: "169/2015" },
                                    { name: "222/2008", code: "222/2008" },
                                    { name: "224/2008", code: "224/2008" },
                                ]
                            }}
                            onChange={(name, value) => {
                                setFormData((prev) => ({ ...prev, [name]: value }));
                            }}
                        />
                        <Box position="relative">
                            <DateField
                                field={{
                                    name: "fromDate",
                                    label: "From Date",
                                    required: true,
                                }}
                                formData={{ fromDate: date }}
                                errors={{ fromDate: "" }}
                                onChange={(date) => setDate(date)}
                                isFocused={false}
                            />
                        </Box>

                        <Box position="relative">
                            <DateField
                                field={{
                                    name: "toDate",
                                    label: "To Date",
                                    required: true,
                                }}
                                formData={{ toDate: date }}
                                errors={{ toDate: "" }}
                                onChange={(newDate) => setDate(newDate)}
                                isFocused={false}
                            />
                        </Box>

                        <AutocompleteField
                            formData={formData}
                            errors={errors}
                            field={{
                                name: "police_station_name", label: "Police Station Name",
                                options: [
                                    { name: "PS1", code: "PS1" },
                                    { name: "PS2", code: "PS2" },
                                    { name: "PS3", code: "PS3" },
                                    { name: "PS4", code: "PS4" },
                                    { name: "PS5", code: "PS5" },
                                ]
                            }}
                            onChange={(name, value) => {
                                setFormData((prev) => ({ ...prev, [name]: value }));
                            }}
                        />

                        <AutocompleteField
                            formData={formData}
                            errors={errors}
                            field={{
                                name: "ps_crime_no", label: "PS Crime No.",
                                options: [
                                    { name: "122", code: "122" },
                                    { name: "248", code: "248" },
                                    { name: "155", code: "155" },
                                    { name: "136", code: "136" },
                                    { name: "166", code: "166" },
                                    { name: "133", code: "133" },
                                    { name: "128", code: "128" },
                                ]
                            }}
                            onChange={(name, value) => {
                                setFormData((prev) => ({ ...prev, [name]: value }));
                            }}
                        />

                        <AutocompleteField
                            formData={formData}
                            errors={errors}
                            field={{ name: "referring_agency", label: "Referring Agency", options: agency }}
                            onChange={(name, value) => {
                                setFormData((prev) => ({ ...prev, [name]: value }));
                            }}
                        />

                        <AutocompleteField
                            formData={formData}
                            errors={errors}
                            field={{ name: "trial_result", label: "Trial Result", options: [] }}
                            onChange={(name, value) => {
                                setFormData((prev) => ({ ...prev, [name]: value }));
                            }}
                        />
                    </Box>
                </DialogContent>

                <DialogActions>
                    <div className="space-x-2 w-full custom-footer" style={{ marginTop: "24px" }}>
                        <Button
                            variant="outlined"
                            sx={{
                                color: "#b7bbc2",
                                width: "10vw",
                                borderColor: "#b7bbc2",
                                backgroundColor: "#f9fafb",
                                borderWidth: "2px",
                                fontWeight: "600",
                                textTransform: "none",
                                "&:hover": {
                                    backgroundColor: "#f1f5f9",
                                },
                            }}
                            onClick={() => setSuccessVisible(false)}
                        >
                            Reset All
                        </Button>

                        <Button
                            variant="outlined"
                            sx={{
                                color: "white",
                                width: "10vw",
                                borderColor: "#2563eb",
                                backgroundColor: "#2563eb",
                                borderWidth: "2px",
                                fontWeight: "700",
                                textTransform: "none",
                                "&:hover": {
                                    backgroundColor: "#1d4ed8",
                                },
                            }}
                            onClick={() => setSuccessVisible(false)}            >
                            Set Filters
                        </Button>
                    </div>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Report;
