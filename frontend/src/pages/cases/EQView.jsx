import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ShortText from "../../components/form/ShortText";
import DateField from "../../components/form/Date";
import AutocompleteField from "../../components/form/AutoComplete";
import { Grid } from '@mui/material';
import { Box, SvgIcon } from "@mui/material";
import { Dialog, DialogTitle, DialogContent, DialogActions, Radio, FormControlLabel, RadioGroup, Button, TextField, } from "@mui/material";
import { Snackbar, Alert } from '@mui/material';

export default function EQView() {
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [ProgressReportVisible, setProgressReportVisible] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(false);
  const [dateofpr, setDatePr] = useState("");
  const [dateofeo, setDateEo] = useState("");
  const [dateofcid, setDateOToCID] = useState("");
  const [dateofio, setDateOToIO] = useState("");
  const [successVisible, setSuccessVisible] = useState(false);
  const [updateVisible, setUpdateVisible] = useState(false);
  const [caseCategoryValue, setCaseCategoryValue] = useState("");
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);
  const [modeType, setModeType] = useState("");
  const dropdownRef = useRef(null);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();

  useEffect(() => {
    const caseDetails = location.state?.caseDetails;
    setModeType(location.state?.mode);
    if (caseDetails) {
      setCaseCategoryValue(caseDetails);
    }
  }, [location]);
  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

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

  var Enquiry = [
    { name: "Human Trafficking ", code: "CO" },
    { name: "Drug Trafficking and Possession", code: "GO" },
    { name: "Domestic Violence", code: "HC" },
    { name: "Missing Persons", code: "SC" },
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

  var IO = [
    { name: "Sub Inspector ", code: "CO" },
    { name: "Inspector", code: "GO" },
    { name: "Deputy Superintendent of Police", code: "HC" },
    { name: "Superintendent of Police", code: "SC" },
    { name: "Deputy Inspector General of Police", code: "NH" },
    { name: "Inspector General of Police", code: "SH" },
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

  const fields = [
    {
      type: "autocomplete",
      name: "present_status",
      label: "Present Status of Investigation/Enquiry",
      options: present_status,
    },
    {
      type: "shortText",
      name: "case_type",
      label: "Case Type",
      required: true,
      maxLength: 10,
      disabled: true,
      defaultValue: "Enquiry",
    },
    {
      type: "autocomplete",
      name: "cid_eo_dept_unit",
      label: "CID & EO Dept Unit",
      options: Division,
    },
    {
      type: "shortText",
      name: "crime_number",
      label: "Crime Number of PS/Range",
      required: true,
      maxLength: 10,
    },
    {
      type: "shortText",
      name: "name_of_ps_range",
      label: "Name of PS/Range",
      required: true,
      maxLength: 10
    },
    {
      type: "shortText",
      name: "cid_crime_number",
      label: "CID Crime Number/Enquiry Number",
      required: true,
      maxLength: 10
    },
    {
      type: "shortText",
      name: "section_of_law",
      label: "Section of Law",
      required: true,
      maxLength: 10
    },
    {
      type: "shortText",
      name: "case_enquiry_nature",
      label: "Case/Enquiry Nature",
      required: true,
      maxLength: 10
    },
    {
      type: "autocomplete",
      name: "case_enquiry_keyword",
      label: "Case/Enquiry Keyword",
      options: Enquiry
    },
    {
      type: "autocomplete",
      name: "referring_agency",
      label: "Referring Agency",
      options: agency
    },
    {
      type: "date",
      name: "birth_date",
      label: "Date of Registration by PS/Range",
      required: true,
      stateSetter: setDatePr,
      defaultValue: dateofpr,
    },
    {
      type: "date",
      name: "dateofeo",
      label: "Date of Entrustment to CID",
      required: true,
      stateSetter: setDateEo,
      defaultValue: dateofeo,
    },
    {
      type: "date",
      name: "dateofcid",
      label: "Date of Taking Over by CID",
      required: true,
      stateSetter: setDateOToCID,
      defaultValue: dateofcid,
    },
    {
      type: "date",
      name: "dateofio",
      label: "Date of Taking Over by Present IO",
      required: true,
      stateSetter: setDateOToIO,
      defaultValue: dateofio,
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

  ];

  const UpdateModalBox = () => {
    setSnackbarMessage(`Status Updated to ${selectedStatus} Successfully..`);
    setSnackbarSeverity('success');
    setOpenSnackbar(true);
    setProgressReportVisible(false)
  };

  var ShowModalBox = () => {
    setSnackbarMessage(`Enquiry Details Updated Successfully..`);
    setSnackbarSeverity('success');
    setOpenSnackbar(true);
    setTimeout(() => {
      navigate("/EQCases");
    }, 1500);
  };

  const dropDownToggle = () => {
    setShowDropdown(!showDropdown);
  };

  var backToCase = () => {
    navigate("/EQCases");
  };

  return (
    <div className="my-2 mx-3 p-3 bg-white border-round-sm">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "16px 0 16px 0" }}>
        <div style={{ display: "flex", alignItems: "start", cursor: 'pointer' }} onClick={backToCase}>
          <Box sx={{ ml: 1 }}>
            <SvgIcon
              component="svg"
              className="cursor-pointer"
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
          <p style={{ margin: '1px', fontSize: "20px", fontWeight: "600", fontFamily: "Roboto", color: "#1D2939" }}>
            {caseCategoryValue.cidCrimeNo}
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px", paddingRight: "16px" }}>
          <button
            style={{
              display: "flex",
              cursor: "pointer",
              backgroundColor: "white",
              color: "#1F1DAC",
              borderRadius: "8px",
              padding: "8px 16px",
              border: "1px solid #EEEEEE",
              fontSize: "15px",
              fontWeight: "500",
              alignItems: "center",
            }}
          >
            View Logs
          </button>
          <button
            onClick={dropDownToggle}
            style={{
              display: "flex",
              cursor: "pointer",
              backgroundColor: "#1F1DAC",
              color: "#fff",
              borderRadius: "8px",
              padding: "8px 16px",
              border: "none",
              fontSize: "15px",
              fontWeight: "500",
              alignItems: "center",
            }}
          >
            More{" "}
            <svg
              style={{ marginLeft: "8px" }}
              width="11"
              height="5"
              viewBox="0 0 11 5"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M5.75 5L0.75 0H10.75L5.75 5Z" fill="white" />
            </svg>
          </button>

          <div style={{ position: "relative" }}>
            {showDropdown && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  marginTop: "16px",
                  right: "0",
                  width: "150px",
                  backgroundColor: "white",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                  zIndex: 10,
                }}
                ref={dropdownRef}
              >
                <div style={{ fontSize: "14px", color: "#374151" }}>
                  <p
                    style={{
                      padding: "8px 16px",
                      margin: 0,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      backgroundColor: "transparent",
                    }}
                    onMouseEnter={(e) => (e.target.style.backgroundColor = "#FFEDD5")}
                    onMouseLeave={(e) => (e.target.style.backgroundColor = "transparent")}
                    onClick={() => setProgressReportVisible(true)}
                  >
                    <svg
                      fill="#000000"
                      width="20"
                      height="20"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="-7.68 -7.68 39.36 39.36"
                    >
                      <rect x="-7.68" y="-7.68" width="39.36" height="39.36" rx="19.68" fill="#F4F4F4"></rect>
                      <path d="M12,0C5.37,0,0,5.37,0,12s5.37,12,12,12s12-5.37,12-12S18.63,0,12,0z M13.5,18h-3v-8h3V18z M13.5,8h-3V5h3V8z"></path>
                    </svg>
                    Status Update
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog
        open={ProgressReportVisible}
        onClose={() => setProgressReportVisible(false)}
        maxWidth="sm"
        fullWidth
        sx={{
          "& .MuiDialogPaper-root": { borderRadius: "12px", padding: "15px" },
        }}
      >
        <DialogTitle style={{ fontWeight: "600", fontSize: "18px", textAlign: "left" }}>
          Status Update
        </DialogTitle>

        <DialogContent style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <RadioGroup
            row
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            {["Complete", "Close", "Other Disposal"].map((status) => (
              <FormControlLabel key={status} value={status} control={<Radio />} label={status} />
            ))}
          </RadioGroup>

          {selectedStatus && (
            <div style={{ marginTop: "16px", borderRadius: "8px", }}>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "bold", color: "#000", marginBottom: "8px" }}>
                  Upload Order Copy
                </label>
                <input type="file" className="file-input" style={{ marginTop: "8px" }} />
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "bold", color: "#000", marginBottom: "8px" }}>
                  Remark
                </label>
                <TextField
                  fullWidth
                  variant="outlined"
                  name="remark"
                  label="Enter your remark..."
                  multiline
                  maxRows={4}
                  value={formData.remark || ""}
                  onChange={handleChange}
                  style={{ fontFamily: "Arial, sans-serif" }}
                />
              </div>
            </div>
          )}
        </DialogContent>

        <DialogActions style={{ justifyContent: "flex-end", padding: "10px 20px" }}>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => setProgressReportVisible(false)}
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
            onClick={UpdateModalBox}
            disabled={!selectedStatus}
          >
            {selectedStatus || "Submit"}
          </Button>
        </DialogActions>
      </Dialog>

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
                    onChange={handleChange}
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
                    onChange={(newDate) => field.stateSetter(newDate)}
                  />
                )}
              </Grid>
            )
          ))}
        </Grid>
      </Box>

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
        className={modeType === "edit" ? "" : "hidden"}
      >
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
          onClick={() => navigate("/EQCases")}
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
          Update
        </Button>
      </div>

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
  );
}
