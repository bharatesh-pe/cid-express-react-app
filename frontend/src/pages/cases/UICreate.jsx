import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ShortText from "../../components/form/ShortText.jsx";
import { Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { Button } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Checkbox, Grid } from '@mui/material';
import { Snackbar, Alert } from '@mui/material';
import { Box, SvgIcon } from "@mui/material";
import AutocompleteField from "../../components/form/AutoComplete";
import DateField from "../../components/form/Date";
import LongText from "../../components/form/LongText.jsx";
export default function UnderInvestigation() {
  const navigate = useNavigate();
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [dateofsub, setDateOToSUB] = useState("");
  const [dateofcc, setDateOToCC] = useState("");
  const [date, setDate] = useState("");

  var ShowModalBox = () => {
    setSnackbarMessage(` Case saved Successfully.`);
    setSnackbarSeverity('success');
    setOpenSnackbar(true);
  };

  var ShowdraftBox = () => {
    setSnackbarMessage(` Case Drafted Successfully.`);
    setSnackbarSeverity('success');
    setOpenSnackbar(true);
  };

  var backToCase = () => {
    navigate("/UICases");
  };


  var IO = [
    { name: "Sub Inspector ", code: "CO" },
    { name: "Inspector", code: "GO" },
    { name: "Deputy Superintendent of Police", code: "HC" },
    { name: "Superintendent of Police", code: "SC" },
    { name: "Deputy Inspector General of Police", code: "NH" },
    { name: "Inspector General of Police", code: "SH" },
  ];
  var present_status = [
    { name: "Under Investigation" },
    { name: "Under Enquiry" },
    { name: "Charge-Sheet Filed" },
    { name: "Case Closed" },
    { name: "Pending in Court" },
    { name: "Conviction" },
    { name: "Acquittal" },
    { name: "Referred Back for Further Investigation" },
    { name: "Transferred to Another Agency" },
    { name: "Abated" },
    { name: "Compromised/Settled" },
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

  var Enquiry = [
    { name: "Human Trafficking ", code: "CO" },
    { name: "Drug Trafficking and Possession", code: "GO" },
    { name: "Domestic Violence", code: "HC" },
    { name: "Missing Persons", code: "SC" },
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

  var Disposal = [
    { name: "A ", code: "CO" },
    { name: "B", code: "GO" },
    { name: "C", code: "HC" },
    { name: "D", code: "SC" },
    { name: "E", code: "NH" },
    { name: "Other", code: "OT" },
  ];

  var Court = [
    { name: "Court 1 ", code: "CO" },
    { name: "Court 2", code: "GO" },
    { name: "Court 3", code: "HC" },
    { name: "Court 4", code: "SC" },
    { name: "Court 5", code: "NH" },
    { name: "Court 6", code: "OT" },
  ];

  const fields = [
    {
      type: "autocomplete",
      name: "division",
      label: "CID & EO Dept Unit",
      options: Division,
    },
    {
      type: "shortText",
      name: "caseType",
      label: "Case Type",
      disabled: true,
      defaultValue: "Under Investigation",
    },
    {
      type: "shortText",
      name: "psRangeName",
      label: "Name of PS/Range",
      disabled: false,
      required: true
    },
    {
      type: "shortText",
      name: "crimeNumber",
      label: "Crime Number of PS/Range",
      required: true
    },
    {
      type: "shortText",
      name: "cidCrimeNumber",
      label: "CID Crime Number/Enquiry Number",
      required: true
    },
    {
      type: "shortText",
      name: "section_of_law",
      label: "Section of Law",
      required: true,
      maxLength: 10
    },
    {
      type: "autocomplete",
      name: "presentStatus",
      label: "Present Status of Investigation/Enquiry",
      options: present_status,
    },
    {
      type: "shortText",
      name: "caseEnquiryNature",
      label: "Case/ Enquiry Nature ",
      required: true
    },
    {
      type: "autocomplete",
      name: "enquiryKeyword",
      label: "Case/Enquiry Keyword",
      options: Enquiry,
    },
    {
      type: "autocomplete",
      name: "referringAgency",
      label: "Referring Agency",
      options: agency,
    },
    {
      type: "date",
      name: "birth_date",
      label: "Date of Registration by PS/Range",
      required: true,
    },
    {
      type: "date",
      name: "dateofeo",
      label: "Date of Entrustment to CID",
      required: true,
    },
    {
      type: "date",
      name: "dateofcid",
      label: "Date of Taking Over by CID",
      required: true,
    },
    {
      type: "date",
      name: "dateofio",
      label: "Date of Taking Over by Present IO",
      required: true,
    },
    {
      type: "shortText",
      name: "name_of_io",
      label: "Name of IO",
      required: true,
      maxLength: 10,
    },
    {
      type: "autocomplete",
      name: "io_rank",
      label: "IO Rank",
      options: IO
    },
    {
      type: "shortText",
      name: "io_code_kgid",
      label: "IO Code/KGID Number",
      required: true,
      maxLength: 10,
    },
    {
      type: "divider",
    },
    {
      type: "shortText",
      name: "number_of_accused",
      label: "Number of Accused",
      required: true,
      maxLength: 10,
    },
    {
      type: "shortText",
      name: "num_arrested_on_bail",
      label: "Number of arrested accused on bail",
      required: true,
      maxLength: 10,
    },
    {
      type: "shortText",
      name: "num_arrested_in_pc",
      label: "Number of arrested accused in PC",
      required: true,
      maxLength: 10,
    },
    {
      type: "shortText",
      name: "num_arrested_in_jc",
      label: "Number of arrested accused in JC",
      required: true,
      maxLength: 10,
    },
    {
      type: "autocomplete",
      name: "disposal",
      label: "Nature of Disposal",
      options: Disposal
    },
    {
      type: "date",
      name: "dateofsub",
      label: "Date of Submission of FIR to court",
      required: true,
      stateSetter: setDateOToSUB,
      defaultValue: dateofsub,
    },
    {
      type: "autocomplete",
      name: "court",
      label: "Name of Court Place",
      options: Court
    },
    {
      type: "shortText",
      name: "furtherinvestigation",
      label: "Further Investigation under 173(8) CRPC",
      required: true,
      maxLength: 10,
    },
    {
      type: "date",
      name: "dateofcc",
      label: "Date of filling last supplementary chargesheet",
      required: true,
      stateSetter: setDateOToCC,
      defaultValue: dateofcc,
    },
    {
      type: "shortText",
      name: "cc/sc",
      label: "CC/SC/ACC No/Awaited",
      required: true,
      maxLength: 10,
    },
    {
      type: "shortText",
      name: "status_of_appeal",
      label: "Status of appeal in STAY QUASH cases",
      required: true,
      maxLength: 10,
    },
    {
      type: "shortText",
      name: "pending_court_petition",
      label: "Pending court Petition & their status",
      required: true,
      maxLength: 10,
    },
    {
      type: "shortText",
      name: "last_progress_report",
      label: "Last Progress Report Submitted (Month)",
      required: true,
      maxLength: 10,
    },
    {
      type: "divider",
    },
    {
      type: "date",
      name: "articles",
      label: "List of Articles Sent to FSL",
      required: true,
    },
    {
      type: "date",
      name: "sending",
      label: "FSL Sending Date",
      required: true,
    },
    {
      type: "date",
      name: "due",
      label: "Due Date",
      required: true,
    },
    {
      type: "date",
      name: "reminders",
      label: "Date of Reminders sent",
      required: true,
    },
    {
      type: "shortText",
      name: "petition",
      label: "Petition No/Year",
      required: true,
      maxLength: 10,
    },
    {
      type: "shortText",
      name: "courtname",
      label: "Court Name",
      required: true,
      maxLength: 10,
    },
    {
      type: "date",
      name: "date",
      label: "Date",
      required: true,
    },
    {
      type: "shortText",
      name: "petitionername",
      label: "Petitioner name",
      required: true,
      maxLength: 10,
    },
    {
      type: "divider",
    },
    {
      type: "longText",
      name: "briefFact",
      label: "Brief Fact",
      info: "Please provide a brief description of the case fact.",
      required: true,
      maxLength: 500
    },
    {
      type: "longText",
      name: "remarks",
      label: "Remarks",
      info: "Please provide a Remarks for the case.",
      required: true,
      maxLength: 500
    },
  ];

  return (
    <div
      className="my-2 mx-3 p-3 bg-white border-round-sm relative"
      style={{ height: "85vh" }}
    >
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

      <div className="flex align-items-center" style={{ display: "flex", justifyContent: "space-between" }}>
        <div className="flex flex-column">
          <div className="flex items-center" style={{ display: "flex", gap: "8px", alignItems: "center", marginTop: "28px", marginLeft: "9px" }}>
            <h1 style={{ fontSize: "1.25rem", fontWeight: "bold", color: "#2d3748", margin: "0 0.5rem 0 0" }}>
              Create New Under Investigation Case
            </h1>
          </div>
        </div>
        <div
          className="button-container"
          style={{
            display: "flex",
            gap: "16px",
            justifyContent: "flex-end",
            width: "auto",
            marginTop: "28px",
            marginRight: "5px",
            marginBottom: "10px",
          }}
        >
          <>
            <Button
              variant="outlined"
              color="primary"
              sx={{
                textTransform: 'none',
              }}
              startIcon={
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g clipPath="url(#clip0_37_4402)">
                    <path
                      d="M9 6V12M6 9H12M16.5 9C16.5 13.1421 13.1421 16.5 9 16.5C4.85786 16.5 1.5 13.1421 1.5 9C1.5 4.85786 4.85786 1.5 9 1.5C13.1421 1.5 16.5 4.85786 16.5 9Z"
                      stroke="#2A55E5"
                      strokeWidth="1.35"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_37_4402">
                      <rect width="18" height="18" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
              }
              onClick={ShowdraftBox}
            >
              Save as Draft
            </Button>

            <Button
              variant="outlined"
              sx={{
                borderColor: "rgb(208, 213, 221)",
                color: "black",
                textTransform: "none",
                marginRight: "24px",
                "&:hover": {
                  backgroundColor: "#f3f4f6",
                  color: "black",
                },
              }}
            >
              View Drafts
            </Button>
          </>
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
          onClick={backToCase}
        >
          Cancel
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
          onClick={ShowModalBox}
        >
          Save & Close
        </Button>
      </div>
      <div>

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
