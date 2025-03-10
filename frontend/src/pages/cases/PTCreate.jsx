import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import ShortText from '../../components/form/ShortText';
import DateField from '../../components/form/Date';
import AutocompleteField from "../../components/form/AutoComplete";
import { Dialog, DialogActions, DialogContent, DialogTitle, Button , TextField} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Checkbox, Grid } from '@mui/material';
import { Box, SvgIcon } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import LongText from "../../components/form/LongText.jsx";

import {
    Card,
    CardContent,
    Typography,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    TableContainer,
    Paper,
    IconButton,
  } from "@mui/material";
  
export default function EnquiryCase() {
  const navigate = useNavigate();
  const [successVisible, setSuccessVisible] = useState(false);
    const [date, setDate] = useState("");
  const [draftVisible, setDraftVisible] = useState(false);
  const [dateofpr, setDatePr] = useState("");
  const [dateofeo, setDateEo] = useState("");
  const [dateofcid, setDateOToCID] = useState("");
  const [dateofio, setDateOToIO] = useState("");
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [selectedCase, setSelectedCase] = useState(null);

  var ShowModalBox = () => {
    setSuccessVisible(true)
  }
  var DraftModalBox = () => {
    setDraftVisible(true)
  }

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
 
  var onlycourt = [
    { name: "Court Hall 1", code: "CO" },
    { name: "Court Hall 2", code: "GO" },
    { name: "Court Hall 3", code: "HC" },
    { name: "Court Hall 4", code: "SC" },
    { name: "Court Hall 5", code: "NH" },
    { name: "Court Hall 6", code: "SH" },
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

  var backToCase = () => {
    navigate('/PTCase')
  }



  const AccusedTable = ({ accusedList, handleChangeAccusedReportsList, handleAccusedDeleteRowList, addAccusedRowList, modeType }) => {
    return (
      <Card sx={{ margin: 2, borderRadius: 2, boxShadow: 3 }}>
        <CardContent>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="h6" sx={{ fontWeight: "bold", color: "#1D2939" }}>
              Accused
            </Typography>

            {modeType === "edit" && (
              <Button variant="outlined" startIcon={<AddIcon />} onClick={addAccusedRowList}>
                Add Accused
              </Button>
            )}
          </div>

          <TableContainer component={Paper} sx={{ marginTop: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Sections of Law Charge Sheet</TableCell>
                  <TableCell>Name of Accused</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(accusedList && accusedList.length > 0 ? accusedList : [{ id: 0, accused_section: "", accused_name: "" }]).map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <TextField
                        fullWidth
                        label="Sections of Law Charge Sheet"
                        variant="outlined"
                        size="small"
                        value={row.accused_section ?? ""} // Default to empty string
                        onChange={(e) => handleChangeAccusedReportsList(row.id, "accused_section", e)}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        label="Name of Accused"
                        variant="outlined"
                        size="small"
                        value={row.accused_name ?? ""} // Default to empty string
                        onChange={(e) => handleChangeAccusedReportsList(row.id, "accused_name", e)}
                      />
                    </TableCell>
                    <TableCell align="center">
                      {row.id !== 0 && (
                        <>
                          <IconButton color="error" onClick={() => handleAccusedDeleteRowList(row.id)}>
                            <DeleteIcon />
                          </IconButton>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>


            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    );
  };

  var result_of_judgement = [
    { name: "DIS", code: "DIS" },
    { name: "ACQ", code: "ACQ" },
    { name: "CON", code: "CON" },
  ];


  var Whether = [
    { name: "Yes", code: "Yes" },
    { name: "No", code: "No" },
  ];

  const fields = [
    {
      type: "shortText",
      name: "cc_sc",
      label: "CC No./SC No ",
      required: true,
    },
    {
      type: "shortText",
      name: "policestation",
      label: "Name of the Police Station",
      required: true,
    },
    {
      type: "autocomplete",
      name: "court",
      label: "Name of the Court",
      options: onlycourt,
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
      label: "PS Crime Number",
      required: true,
    },
    {
      type: "shortText",
      name: "cid_crime_number",
      label: "CID Crime Number",
      required: true,
    },
    {
      type: "date",
      name: "birth_date",
      label: "Date of Filling Charge Sheet",
      required: true,
      stateSetter: setDatePr,
      defaultValue: dateofpr,
    },
    {
      type: "divider",
    },
    {
      type: "accusedTable"
    },
    {
      type: "divider",
    },
    {
      type: "shortText",
      name: "accused",
      label: "Total number of accused persons",
      disabled: true,
      defaultValue: "2",
    },
    {
      type: "shortText",
      name: "accused",
      label: "Total number of accused persons in custody",
      disabled: true,
      defaultValue: "2",
    },
    {
      type: "shortText",
      name: "chargesheet",
      label: "Name of the IO who filed charge sheet",
      required: true,
    },
    {
      type: "shortText",
      name: "chargesheet",
      label: "Rank of IO who filed charge sheet",
      required: true,
    },
    {
      type: "shortText",
      name: "chargesheet",
      label: "IO Code (KGID NO)",
    },
    {
      type: "shortText",
      name: "chargesheet",
      label: "Name of Holding IO",
      required: true,
    },
    {
      type: "shortText",
      name: "chargesheet",
      label: "Rank of the HIO",
      required: true,
    },
    {
      type: "shortText",
      name: "chargesheet",
      label: "HIO Code (KGID NO)",
      required: true,
    },
    {
      type: "shortText",
      name: "chargesheet",
      label: "Name of Spl.PP, if any",
      required: true,
    },
    {
      type: "autocomplete",
      name: "framed",
      label: "Whether charges framed (Y/N)",
      options: Whether
    },
    {
      type: "date",
      name: "birth_date",
      label: "Date of framing of charges",
      required: true,
      stateSetter: setDatePr,
      defaultValue: dateofpr,
    },
    {
      type: "shortText",
      name: "accused",
      label: "Names of the accused persons charged by court along with accused numbers",
      required: true,
    },
    {
      type: "shortText",
      name: "Sections",
      label: "Sections of law under which charges framed against each accused",
      required: true,
    },
    {
      type: "shortText",
      name: "Sections",
      label: "Sections of law under which each accused is convicted",
      required: true,
    },
    {
      type: "shortText",
      name: "Sentence",
      label: "Sentence awarded to each convicted accused",
      required: true,
    },
    {
      type: "shortText",
      name: "Prisons",
      label: "Convict number given by Prisons Dept",
      required: true,
    },
    {
      type: "shortText",
      name: "Prison",
      label: "Name of the Prison",
      required: true,
    },
    {
      type: "date",
      name: "dateofeo",
      label: "Date of Judgement",
      required: true,
      stateSetter: setDateEo,
      defaultValue: dateofeo,
    },
    {
      type: "autocomplete",
      name: "result_of_judgement",
      label: "Result of judgment ",
      options: result_of_judgement
    },
    {
      type: "shortText",
      name: "Criminal",
      label: "Criminal proceedings pending in higher courts",
      required: true,
    },
    {
      type: "shortText",
      name: "highercourt",
      label: "Name of the higher court",
      required: true,
    },
    {
      type: "shortText",
      name: "highercourt",
      label: "Name of the higher court",
      required: true,
    },
    {
      type: "autocomplete",
      name: "petitioner",
      label: "Name of petitioner party",
      options: agency
    },
    {
      type: "date",
      name: "dateofcid",
      label: "Date of filing of the petition",
      required: true,
      stateSetter: setDateOToCID,
      defaultValue: dateofcid,
    },
    {
      type: "shortText",
      name: "Petition_no",
      label: "Petition Number",
      required: true,
    },
    {
      type: "shortText",
      name: "petition_status",
      label: "Status of the petition",
      required: true,
    },
    {
      type: "shortText",
      name: "disposal",
      label: "Nature of disposal of the petition",
      required: true,
      maxLength: 10,
    },
    {
      type: "longText",
      name: "briefFact",
      label: "Action taken after disposal of the petition",
      required: true,
      maxLength: 500
    },
    {
      type: "longText",
      name: "remarks",
      label: "Action taken after disposal of the petition",
      required: true,
      maxLength: 500
    },

  ];

  return (
    <Box sx={{ height: '100vh' }} p={1}>
      <div className="flex align-items-center" style={{ display: "flex", justifyContent: "space-between", alignItems: 'center',padding:'0 0 0 12px' }}>
        <div className="flex flex-column">
          <div className="flex items-center" style={{ display: "flex", gap: "8px", alignItems: "center"}}>
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
            <h1 style={{ fontSize: "24px", fontWeight: "bold", color: "#2d3748", margin: "0" }}>
              Create New Pending Trial Case
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
              color="primary" 
              onClick={DraftModalBox}
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
          maxHeight: "80vh",
          overflowY: "auto",
          borderRadius: "8px",
          backgroundColor: "white"
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
            ) : field.type === "accusedTable" ? (
              <Grid item xs={12} key={index}>
                <AccusedTable />
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
        <Dialog
          open={successVisible}
          onClose={() => setSuccessVisible(false)}
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
              <p style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "0px" }}>
                PT Case Added Successfully
              </p>
              <p
                style={{
                  fontSize: "16px",
                  color: "rgb(156, 163, 175)",
                  margin: 0,
                }}
              >
                PT Case Registration Saved Successfully.
              </p>
            </div>
          </DialogContent>
          <DialogActions sx={{ justifyContent: "center", padding: "10px 20px" }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                setSuccessVisible(false);
                navigate('/PTCase');
              }} sx={{ width: "100%", padding: "8px" }}
            >
              Done
            </Button>
          </DialogActions>
        </Dialog>
      </div>

      <div>
        <Dialog
          open={draftVisible}
          onClose={() => setDraftVisible(false)}
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
              <p style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "0px" }}>
              PT Case Draft Successfully
              </p>
              <p
                style={{
                  fontSize: "16px",
                  color: "rgb(156, 163, 175)",
                  margin: 0,
                }}
              >
                PT Case Registration Draft Successfully.
              </p>
            </div>
          </DialogContent>
          <DialogActions sx={{ justifyContent: "center", padding: "10px 20px" }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                setDraftVisible(false);
                navigate('/PTCase');
              }} 
              sx={{ width: "100%", padding: "8px" }}
            >
              Done
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </Box>
  )
}