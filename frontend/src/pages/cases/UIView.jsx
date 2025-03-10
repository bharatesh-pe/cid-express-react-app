import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Grid } from '@mui/material';
import { Box, SvgIcon } from "@mui/material";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, } from "@mui/material";
import { Snackbar, Alert } from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { Typography } from "@mui/material";
import ShortText from "../../components/form/ShortText";
import DateField from "../../components/form/Date";
import AutocompleteField from "../../components/form/AutoComplete";
import LongText from "../../components/form/LongText.jsx";

export default function Registeration() {
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [progressReportVisible, setProgressReportVisible] = useState(false);
  const [FSLVisible, setFSLVisible] = useState(false);
  const [showPcAct, setShowPcActModal] = useState(false);
  const [showProsecution, setShowProsecutionModal] = useState(false);
  const [showStatusUpdate, setShowStatusUpdateModal] = useState(false);
  const [date, setDate] = useState("");
  const [caseCategoryValue, setCaseCategoryValue] = useState("");
  const [showChangeIO, setShowChangeIOModal] = useState(false);
  const [showTransferOD, setShowTransferODModal] = useState(false);
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);
  const [modeType, setModeType] = useState("");
  const dropdownRef = useRef(null);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [isEditingCase, setIsEditingCase] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const caseDetails = location.state?.caseDetails;
    setModeType(location.state?.mode);
    console.log();
    if (caseDetails) {
      setCaseCategoryValue(caseDetails);
    }
  }, [location]);


  const Accused = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="12" fill="#F4F4F4"/><mask id="mask0_871_14335" style={{ maskType: "alpha" }} maskUnits="userSpaceOnUse" x="4" y="4" width="16" height="16"><rect x="4" y="4" width="16" height="16" fill="#D9D9D9"/></mask><g mask="url(#mask0_871_14335)"><path d="M9.24997 15.6673C8.6303 15.6673 8.04036 15.522 7.48013 15.2313C6.91991 14.9408 6.4513 14.5348 6.0743 14.0135C5.76152 13.581 5.52652 13.0729 5.3693 12.4892C5.21197 11.9054 5.1333 11.2537 5.1333 10.534C5.1333 9.93654 5.34441 9.42054 5.76663 8.98598C6.18886 8.55132 6.68541 8.33398 7.2563 8.33398C7.37519 8.33398 7.4983 8.34298 7.62563 8.36098C7.75297 8.37887 7.87263 8.41132 7.98463 8.45832L12 9.97632L16.0153 8.45832C16.1273 8.41132 16.247 8.37887 16.3743 8.36098C16.5016 8.34298 16.6247 8.33398 16.7436 8.33398C17.3145 8.33398 17.8111 8.55132 18.2333 8.98598C18.6555 9.42054 18.8666 9.93654 18.8666 10.534C18.8666 11.2537 18.788 11.9054 18.6306 12.4892C18.4734 13.0729 18.244 13.581 17.9423 14.0135C17.5653 14.5348 17.0967 14.9408 16.5365 15.2313C15.9762 15.522 15.3863 15.6673 14.7666 15.6673C14.0932 15.6673 13.5118 15.5034 13.0225 15.1757L12.2885 14.684H11.7115L10.9775 15.1757C10.4881 15.5034 9.9123 15.6673 9.24997 15.6673Z" fill="#1C1B1F"/></g></svg>);

  const EditIcon = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="group-hover:fill-white" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="12" fill="#F4F4F4"/><mask id="mask0_871_14300" style={{ maskType: "alpha" }} maskUnits="userSpaceOnUse" x="4" y="4" width="16" height="16"><rect x="4" y="4" width="16" height="16" fill="#D9D9D9"/></mask><g mask="url(#mask0_871_14300)"><path d="M5.6001 20.0005V17.4671H18.4001V20.0005H5.6001ZM7.53343 15.1428V13.1775L14.2399 6.46329C14.3365 6.36674 14.4368 6.29924 14.5409 6.26079C14.6452 6.22235 14.7524 6.20312 14.8628 6.20312C14.9774 6.20312 15.0856 6.22235 15.1873 6.26079C15.2889 6.29924 15.3865 6.36429 15.4801 6.45596L16.2129 7.18513C16.3053 7.28168 16.3717 7.38079 16.4123 7.48246C16.4528 7.58424 16.4731 7.69374 16.4731 7.81096C16.4731 7.91818 16.4531 8.02501 16.4131 8.13146C16.3731 8.23801 16.308 8.33635 16.2179 8.42646L9.5001 15.1428H7.53343Z" fill="#1C1B1F"/></g></svg>);
  
  const ProgressIcon = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="12" fill="#F4F4F4"/><mask id="mask0_871_14314" style={{ maskType: "alpha" }} maskUnits="userSpaceOnUse" x="4" y="4" width="16" height="16"><rect x="4" y="4" width="16" height="16" fill="#D9D9D9"/></mask><g mask="url(#mask0_871_14314)"><path d="M7.80523 17.2667C7.5129 17.2667 7.26118 17.1612 7.05007 16.9501C6.83895 16.739 6.7334 16.4872 6.7334 16.1949V7.80523C6.7334 7.50179 6.83895 7.24729 7.05007 7.04173C7.26118 6.83618 7.5129 6.7334 7.80523 6.7334H16.1949C16.4983 6.7334 16.7528 6.83618 16.9584 7.04173C17.164 7.24729 17.2667 7.50179 17.2667 7.80523V16.1949C17.2667 16.4872 17.164 16.739 16.9584 16.9501C16.7528 17.1612 16.4983 17.2667 16.1949 17.2667H7.80523Z" fill="#1C1B1F"/></g></svg>);
  
  const RemarkIcon = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="12" fill="#F4F4F4"/><mask id="mask0_871_14328" style={{ maskType: "alpha" }} maskUnits="userSpaceOnUse" x="4" y="4" width="16" height="16"><rect x="4" y="4" width="16" height="16" fill="#D9D9D9"/></mask><g mask="url(#mask0_871_14328)"><path d="M7.80523 17.2667H16.1949V13.3629L13.3629 17.2667H7.80523ZM9.0949 13.0206H12.0001V12.1539H9.0949V13.0206Z" fill="#1C1B1F"/></g></svg>);
  
  const FSLIcon = () => {
    return (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="12" cy="12" r="12" fill="#F4F4F4" />
        <mask
          id="mask0_871_14321"
          style={{ maskType: "alpha" }}
          maskUnits="userSpaceOnUse"
          x="4"
          y="4"
          width="16"
          height="16"
        >
          <rect x="4" y="4" width="16" height="16" fill="#D9D9D9" />
        </mask>
        <g mask="url(#mask0_871_14321)">
          <path
            d="M18.1258 18.7387L16.2154 16.8515C16.0283 16.9822 15.8239 17.0841 15.6021 17.1572C15.3803 17.2303 15.1482 17.2669 14.9056 17.2669C14.2397 17.2669 13.6759 17.0363 13.2143 16.5752C12.7527 16.1141 12.5219 15.5536 12.5219 14.8937C12.5219 14.2339 12.7525 13.6737 13.2136 13.213C13.6747 12.7524 14.2352 12.522 14.8949 12.522C15.5548 12.522 16.1151 12.7522 16.5758 13.2125C17.0364 13.6729 17.2668 14.2339 17.2668 14.8955C17.2668 15.1437 17.2285 15.3823 17.1519 15.6115C17.0755 15.8408 16.9719 16.0511 16.8411 16.2425L18.7386 18.1194L18.1258 18.7387ZM7.90261 17.2732C7.24395 17.2732 6.68439 17.0429 6.22395 16.5822C5.76361 16.1215 5.53345 15.5579 5.53345 14.8912C5.53345 14.2324 5.76361 13.6729 6.22395 13.2125C6.68439 12.7522 7.24395 12.522 7.90261 12.522C8.56928 12.522 9.133 12.7522 9.59378 13.2125C10.0544 13.6729 10.2848 14.2324 10.2848 14.8912C10.2848 15.5579 10.0544 16.1215 9.59378 16.5822C9.133 17.0429 8.56928 17.2732 7.90261 17.2732ZM14.9016 16.4065C15.3159 16.4065 15.6693 16.2595 15.9616 15.9654C16.2539 15.6712 16.4001 15.3117 16.4001 14.887C16.4001 14.4727 16.2526 14.1194 15.9574 13.827C15.6624 13.5348 15.3078 13.3887 14.8934 13.3887C14.4688 13.3887 14.1107 13.5362 13.8193 13.8312C13.5278 14.1263 13.3821 14.481 13.3821 14.8954C13.3821 15.3199 13.5292 15.6779 13.8234 15.9694C14.1177 16.2608 14.4771 16.4065 14.9016 16.4065ZM7.90261 10.2912C7.24395 10.2912 6.68439 10.0609 6.22395 9.60021C5.76361 9.13954 5.53345 8.57587 5.53345 7.90921C5.53345 7.25043 5.76361 6.69087 6.22395 6.23054C6.68439 5.77021 7.24395 5.54004 7.90261 5.54004C8.56928 5.54004 9.133 5.77021 9.59378 6.23054C10.0544 6.69087 10.2848 7.25043 10.2848 7.90921C10.2848 8.57587 10.0544 9.13954 9.59378 9.60021C9.133 10.0609 8.56928 10.2912 7.90261 10.2912ZM14.8976 10.2912C14.2309 10.2912 13.6672 10.0609 13.2064 9.60021C12.7458 9.13954 12.5154 8.57587 12.5154 7.90921C12.5154 7.25043 12.7458 6.69087 13.2064 6.23054C13.6672 5.77021 14.2309 5.54004 14.8976 5.54004C15.5563 5.54004 16.1158 5.77021 16.5763 6.23054C17.0366 6.69087 17.2668 7.25043 17.2668 7.90921C17.2668 8.57587 17.0366 9.13954 16.5763 9.60021C16.1158 10.0609 15.5563 10.2912 14.8976 10.2912Z"
            fill="#1C1B1F"
          />
        </g>
      </svg>
    );
  };

  const handleFSLAddRow = () => {
    setRows([...rows, { id: Date.now(), date: null, fsl: "" }]);
  };

  var showChangeIOModal = () => {
    setShowChangeIOModal(true);
  };
  var showTransferODModal = () => {
    setShowTransferODModal(true);
  };

  const [rows, setRows] = useState([
    {
      act: null,
      section: null,
    },
  ]);

  const handleFSLDeleteRow = (id) => {
    setRows(rows.filter((row) => row.id !== id));
  };

  const handleFSLChangeDate1 = (id, value) => {
    setRows(
      rows.map((row) => (row.id === id ? { ...row, articleDate: value } : row))
    );
  };

  const handleFSLChangeDate2 = (id, value) => {
    setRows(
      rows.map((row) => (row.id === id ? { ...row, sendingDate: value } : row))
    );
  };

  const handleFSLChangeDate3 = (id, value) => {
    setRows(
      rows.map((row) => (row.id === id ? { ...row, duedate: value } : row))
    );
  };

  const handleFSLChangeDate4 = (id, value) => {
    setRows(
      rows.map((row) => (row.id === id ? { ...row, reminderDate: value } : row))
    );
  };

  const handleFSLChangeDate5 = (id, value) => {
    setRows(rows.map((row) => (row.id === id ? { ...row, Date: value } : row)));
  };

  const dropDownToggle = () => {
    setShowDropdown(!showDropdown);
  };

  var backToCase = () => {
    navigate("/UICases");
  };
  var showProgreassReportModal = () => {
    setProgressReportVisible(true);
  };

  var showFSLModal = () => {
    setFSLVisible(true);
    setRows([{ id: Date.now(), date: null, fsl: "" }]);
  };

  var showProsecutionModal = () => {
    setShowProsecutionModal(true);
  };
  const showPcActModal = () => {
    setShowPcActModal(true);
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

  var Disposal = [
    { name: "A ", code: "CO" },
    { name: "B", code: "GO" },
    { name: "C", code: "HC" },
    { name: "D", code: "SC" },
    { name: "E", code: "NH" },
    { name: "Other", code: "OT" },
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

  const prfields = [
    {
      type: "shortText",
      name: "progressreportno",
      label: "Progress Report No",
      disabled: false,
      required: true
    },
    {
      type: "shortText",
      name: "crimenumberPS",
      label: "Crime Number, PS and date of registration",
      disabled: false,
      required: true
    },
    {
      type: "shortText",
      name: "sectionoflaw",
      label: "Section Of Law",
      required: true
    },
    {
      type: "shortText",
      name: "cidCrimeNumber",
      label: "CID Crime Number, PS and date",
      required: true
    },
    {
      type: "shortText",
      name: "namerank",
      label: "Name and rank of the Investigating Officer",
      required: true,
    },
    {
      type: "autocomplete",
      name: "allegations",
      label: "Allegations in brief",
      options: present_status,
    },
    {
      type: "shortText",
      name: "planinvestigations",
      label: "Plan of investigations ",
      required: true
    },
    {
      type: "autocomplete",
      name: "accusedpersons",
      label: "Details of Accused Persons",
      options: Enquiry,
    },
    {
      type: "autocomplete",
      name: "pertaining",
      label: "Details pertaining to investigations",
      options: agency,
    },
    {
      type: "shortText",
      name: "nodates",
      label: "Number and dates of the Case Diaries on which the PR is based",
      required: true,
    },
    {
      type: "shortText",
      name: "particulars",
      label: "Particulars of investigation pending to be done",
      required: true,
    },
    {
      type: "shortText",
      name: "spsinstructions",
      label: "SP's instructions issued to IO",
      required: true,
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
          <p style={{ margin: 0, fontSize: "20px", fontWeight: "600", fontFamily: "Roboto", color: "#1D2939" }}>
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
            className="flex cursor-pointer hover:bg-gray-100"
            onClick={showChangeIOModal}
            style={{
              backgroundColor: "white",
              color: "#1F1DAC",
              borderRadius: "8px",
              padding: "8px 16px",
              border: "1px solid #EEEEEE",
              fontSize: "15px",
              fontWeight: "500",
              alignItems: "center !important",
            }}
          >
            <svg
              width="19"
              className="mr-2"
              height="20"
              viewBox="0 0 19 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2.75 20C2.2 20 1.72917 19.8042 1.3375 19.4125C0.945833 19.0208 0.75 18.55 0.75 18V4C0.75 3.45 0.945833 2.97917 1.3375 2.5875C1.72917 2.19583 2.2 2 2.75 2H6.95C7.18333 1.4 7.55 0.916667 8.05 0.55C8.55 0.183333 9.11667 0 9.75 0C10.3833 0 10.95 0.183333 11.45 0.55C11.95 0.916667 12.3167 1.4 12.55 2H16.75C17.3 2 17.7708 2.19583 18.1625 2.5875C18.5542 2.97917 18.75 3.45 18.75 4V18C18.75 18.55 18.5542 19.0208 18.1625 19.4125C17.7708 19.8042 17.3 20 16.75 20H2.75ZM9.75 3.25C9.96667 3.25 10.1458 3.17917 10.2875 3.0375C10.4292 2.89583 10.5 2.71667 10.5 2.5C10.5 2.28333 10.4292 2.10417 10.2875 1.9625C10.1458 1.82083 9.96667 1.75 9.75 1.75C9.53333 1.75 9.35417 1.82083 9.2125 1.9625C9.07083 2.10417 9 2.28333 9 2.5C9 2.71667 9.07083 2.89583 9.2125 3.0375C9.35417 3.17917 9.53333 3.25 9.75 3.25ZM2.75 16.85C3.65 15.9667 4.69583 15.2708 5.8875 14.7625C7.07917 14.2542 8.36667 14 9.75 14C11.1333 14 12.4208 14.2542 13.6125 14.7625C14.8042 15.2708 15.85 15.9667 16.75 16.85V4H2.75V16.85ZM9.75 12C10.7167 12 11.5417 11.6583 12.225 10.975C12.9083 10.2917 13.25 9.46667 13.25 8.5C13.25 7.53333 12.9083 6.70833 12.225 6.025C11.5417 5.34167 10.7167 5 9.75 5C8.78333 5 7.95833 5.34167 7.275 6.025C6.59167 6.70833 6.25 7.53333 6.25 8.5C6.25 9.46667 6.59167 10.2917 7.275 10.975C7.95833 11.6583 8.78333 12 9.75 12ZM4.75 18H14.75V17.75C14.05 17.1667 13.275 16.7292 12.425 16.4375C11.575 16.1458 10.6833 16 9.75 16C8.81667 16 7.925 16.1458 7.075 16.4375C6.225 16.7292 5.45 17.1667 4.75 17.75V18ZM9.75 10C9.33333 10 8.97917 9.85417 8.6875 9.5625C8.39583 9.27083 8.25 8.91667 8.25 8.5C8.25 8.08333 8.39583 7.72917 8.6875 7.4375C8.97917 7.14583 9.33333 7 9.75 7C10.1667 7 10.5208 7.14583 10.8125 7.4375C11.1042 7.72917 11.25 8.08333 11.25 8.5C11.25 8.91667 11.1042 9.27083 10.8125 9.5625C10.5208 9.85417 10.1667 10 9.75 10Z"
                fill="#1F1DAC"
              />
            </svg>
            Change of IO
          </button>
          <button
            className="flex cursor-pointer hover:bg-gray-100"
            onClick={showTransferODModal}
            style={{
              backgroundColor: "white",
              color: "#1F1DAC",
              borderRadius: "8px",
              padding: "8px 16px",
              border: "1px solid #EEEEEE",
              fontSize: "15px",
              fontWeight: "500",
              alignItems: "center !important",
            }}
          >
            Transfer to Other Division
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
                    onClick={() => {
                      setIsEditingCase(true);                      
                      setShowDropdown(false);
                    }}
                  >
                    <EditIcon /> Edit case
                  </p>
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
                    onClick={() => showProgreassReportModal()}
                  >
                    <ProgressIcon /> Progress Report
                  </p>
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
                    onClick={showFSLModal}
                  >
                    <FSLIcon /> FSL Record

                  </p>
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
                    onClick={showProsecutionModal}
                  >
                    <RemarkIcon /> Prosecution Sanction

                  </p>
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
                    onClick={showPcActModal}
                  >
                    <Accused /> 17A PC ACT

                  </p>
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
                    onClick={() => setShowStatusUpdateModal(true)}
                  >
                    <Accused /> Status Update
                  </p>
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
                  >
                    <Accused /> Download
                  </p>
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
                  >
                    <Accused /> print
                  </p>
                </div>
              </div>
            )}
          </div>
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

        {isEditingCase && (
          <DialogActions>
            <Button
              variant="outlined"
              sx={{
                color: "#b7bbc2",
                width: "11vw",
                borderColor: "#b7bbc2",
                backgroundColor: "#f9fafb",
                borderWidth: "2px",
                fontWeight: "600",
                textTransform: "none",
                "&:hover": {
                  backgroundColor: "#f1f5f9",
                },
              }}
              onClick={() => navigate('/UICases')}
            >
              Cancel
            </Button>

            <Button
              variant="outlined"
              sx={{
                color: "white",
                width: "11vw",
                borderColor: "#1F1DAC",
                backgroundColor: "#1F1DAC",
                borderWidth: "2px",
                fontWeight: "700",
                textTransform: "none",
                "&:hover": {
                  backgroundColor: "#1d4ed8",
                },
              }}
              onClick={() => {
                setSnackbarMessage(` Status Updated Successfully.`);
                setSnackbarSeverity('success');
                setOpenSnackbar(true);
                setTimeout(() => {
                  navigate("/UICases");
                }, 1500);
              }}
            >
              Update
            </Button>

          </DialogActions>
        )}

      </div>

        {/* Status Update*/}

        <Dialog open={showStatusUpdate} onClose={() => setShowStatusUpdateModal(false)} fullWidth maxWidth="sm">
          <DialogTitle>Status Update</DialogTitle>
          <DialogContent>
            <Grid item xs={12} sm={6}>
              <AutocompleteField
                formData={formData}
                errors={errors}
                field={{
                  name: "io_name",
                  label: "Select IO",
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

            </Grid>
          </DialogContent>

          <DialogActions>
            <Button
              variant="outlined"
              sx={{
                color: "#b7bbc2",
                width: "15vw",
                borderColor: "#b7bbc2",
                backgroundColor: "#f9fafb",
                borderWidth: "2px",
                fontWeight: "600",
                textTransform: "none",
                "&:hover": {
                  backgroundColor: "#f1f5f9",
                },
              }}
              onClick={() => setShowStatusUpdateModal(false)}
            >
              Cancel
            </Button>

            <Button
              variant="outlined"
              sx={{
                color: "white",
                width: "15vw",
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
                setSnackbarMessage(` Status Updated Successfully.`);
                setSnackbarSeverity('success');
                setOpenSnackbar(true);
                setShowStatusUpdateModal(false);
              }}
            >
              Submit for Approval
            </Button>
          </DialogActions>
        </Dialog>

        {/* Prosecution Sanction*/}

        <Dialog
          open={showProsecution}
          onClose={() => setShowProsecutionModal(false)}
          fullWidth
          maxWidth="sm"
          sx={{
            "& .MuiDialog-paper": {
              width: "60vw",
              color: "#000",
              background: "#fff",
              padding: "15px",
              borderRadius: "12px",
            },
          }}
        >
          <DialogTitle>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
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
              <span style={{ fontSize: "16px", fontWeight: "600" }}>Prosecution Sanction</span>
            </div>
          </DialogTitle>

          <DialogContent dividers>
            <p style={{ textAlign: "center", paddingBottom: "5px" }}>
              Are you sure you want to add this as Prosecution Sanction?
            </p>
          </DialogContent>

          <DialogActions sx={{ justifyContent: "center" }}>
            <Button
              variant="outlined"
              sx={{
                border: "1px solid #6B7280",
                color: "#6B7280",
                fontWeight: "600",
                textTransform: "none",
              }}
              onClick={() => setShowProsecutionModal(false)}
            >
              No
            </Button>
            <Button
              variant="contained"
              sx={{
                backgroundColor: "#2563eb",
                color: "white",
                fontWeight: "700",
                textTransform: "none",
                "&:hover": {
                  backgroundColor: "#1d4ed8",
                },
              }}
              onClick={() => {
                setSnackbarMessage(` Prosecution Sanction Approval Requested Successfully.`);
                setSnackbarSeverity('success');
                setOpenSnackbar(true);
                setShowProsecutionModal(false);
              }}
            >
              Yes
            </Button>
          </DialogActions>
        </Dialog>

        {/* Progress Report*/}

        <Dialog
          open={progressReportVisible}
          onClose={() => { setProgressReportVisible(false) }}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              width: '60vw',
              color: '#000',
              background: '#fff',
              borderRadius: '12px',
            },
          }}
        >
          <DialogTitle sx={{ borderBottom: '1px solid #E5E7EB', pb: 2 }}>
            <Box display="flex" alignItems="center" gap={1}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M4.5 9H13.5M2.25 4.5H15.75M6.75 13.5H11.25"
                  stroke="#1D2939"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <Typography variant="subtitle1" fontWeight="bold">
                Progress Report
              </Typography>
            </Box>
          </DialogTitle>
          <div className="p-3">
            <div className="table-container" style={{ display: "flex", flexDirection: "column" }}>
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
                  {prfields.map((field, index) =>
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
                            field={{ name: field.name, label: field.label, options: field.options }}
                            onChange={(name, value) => setFormData({ ...formData, [name]: value })}
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
                  )}
                </Grid>
              </Box>
            </div>

            <DialogActions>
              <Button
                variant="outlined"
                sx={{
                  color: "#b7bbc2",
                  width: "15vw",
                  borderColor: "#b7bbc2",
                  backgroundColor: "#f9fafb",
                  borderWidth: "2px",
                  fontWeight: "600",
                  textTransform: "none",
                  "&:hover": {
                    backgroundColor: "#f1f5f9",
                  },
                }}
                onClick={() => setProgressReportVisible(false)}
              >
                Cancel
              </Button>

              <Button
                variant="outlined"
                sx={{
                  color: "white",
                  width: "15vw",
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
                  setSnackbarMessage(` Progress Report Approval Successfully Requested.`);
                  setSnackbarSeverity('success');
                  setOpenSnackbar(true);
                  setProgressReportVisible(false);
                }}
              >
                Submit for Approval
              </Button>
            </DialogActions>

          </div>
        </Dialog>


        {/* FSL Record*/}

        <Dialog
          open={FSLVisible}
          onClose={() => setFSLVisible(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle sx={{ borderBottom: '1px solid #E5E7EB', pb: 2 }}>
            <Box display="flex" alignItems="center" gap={1}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M4.5 9H13.5M2.25 4.5H15.75M6.75 13.5H11.25"
                  stroke="#1D2939"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <Typography variant="subtitle1" fontWeight="bold">
                FSL
              </Typography>
            </Box>
          </DialogTitle>
          <DialogContent dividers>
            <div >
              <div className="add-row-btn-container" style={{ display: "flex", justifyContent: "flex-end", marginBottom: "10px" }}>

                <Button
                  variant="outlined"
                  startIcon={<AddCircleIcon />}
                  sx={{
                    height: "38px",
                    border: "1px solid #2A55E5",
                    borderRadius: "6px",
                    gap: "8px",
                    color: "#2A55E5",
                    fontWeight: "600",
                    textTransform: 'none',
                    "&:hover": {
                      backgroundColor: "transparent",
                    },
                  }}
                  onClick={handleFSLAddRow}
                >
                  Add FSL
                </Button>
              </div>

              <div className="table-responsive">
                <table className="table">
                  <tbody>
                    {rows.map((row) => (
                      <React.Fragment key={row.id}>
                        <tr>
                          <td>
                            <DateField
                              field={{
                                name: `articleDate_${row.id}`,
                                label: 'List of Article',
                                required: true,
                              }}
                              formData={{ articleDate: row.articleDate }}
                              errors={{}}
                              onChange={(date) => handleFSLChangeDate1(row.id, date, 'article')}
                              className="figmaInputsLabel"
                              inputId={`fsl_date_${row.id}_reminder`}
                            />
                          </td>
                          <td>
                            <DateField
                              field={{
                                name: `sendingDate_${row.id}`,
                                label: 'FSL Sending Date',
                                required: true,
                              }}
                              formData={{ sendingDate: row.sendingDate }}
                              errors={{}}
                              onChange={(date) => handleFSLChangeDate2(row.id, date, 'sending')}
                              className="figmaInputsLabel"
                              inputId={`fsl_date_${row.id}_reminder`}
                            />
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <DateField
                              field={{
                                name: `duedate_${row.id}`,
                                label: 'Due Date',
                                required: true,
                              }}
                              formData={{ duedate: row.duedate }}
                              errors={{}}
                              onChange={(date) => handleFSLChangeDate3(row.id, date)}
                              className="figmaInputsLabel"
                              inputId={`fsl_date_${row.id}_reminder`}
                            />
                          </td>
                          <td>
                            <DateField
                              field={{
                                name: `reminderDate_${row.id}`,
                                label: 'Date of Reminders sent',
                                required: true,
                              }}
                              formData={{ reminderDate: row.reminderDate }}
                              errors={{}}
                              onChange={(date) => handleFSLChangeDate4(row.id, date, 'reminder')}
                              className="figmaInputsLabel"
                              inputId={`fsl_date_${row.id}_reminder`}
                            />
                          </td>
                        </tr>

                        <tr>
                          <td>
                            <DateField
                              field={{
                                name: `date_${row.id}`,
                                label: 'Date',
                                required: true,
                              }}
                              formData={{ Date: row.Date }}
                              errors={{}}
                              onChange={(date) => handleFSLChangeDate5(row.id, date, 'reminder')}
                              className="figmaInputsLabel"
                              inputId={`fsl_date_${row.id}_reminder`}
                            />
                          </td>
                          <td>
                            <ShortText
                              field={{
                                name: `petitionNo_${row.id}`,
                                label: 'Petition No/Year',
                                required: true,
                                maxLength: 20,
                                disabled: false,
                              }}
                              formData={{ petitionNo: row.petitionNo || "" }}
                              errors={{}}
                              className="figmaInputs"
                              inputId={`fsl_petition_${row.id}`}
                            />
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <ShortText
                              field={{
                                name: `courtName_${row.id}`,
                                label: 'Court Name',
                                required: true,
                                maxLength: 100,
                                disabled: false,
                              }}
                              formData={{ courtName: row.courtName || "" }}
                              errors={{}}
                              className="figmaInputs"
                              inputId={`fsl_court_${row.id}`}
                            />
                          </td>
                          <td>
                            <ShortText
                              field={{
                                name: `petitionerName_${row.id}`,
                                label: 'Petitioner Name',
                                required: true,
                                maxLength: 100,
                                disabled: false,
                              }}
                              formData={{ petitionerName: row.petitionerName || "" }}
                              errors={{}}
                              className="figmaInputs"
                              inputId={`fsl_name_${row.id}`}
                            />
                          </td>
                        </tr>
                        <tr>
                          <td colSpan={2}>


                            <Button
                              variant="contained"
                              sx={{
                                color: "white",
                                backgroundColor: "#ef4444",
                                borderRadius: "5px",
                                "&:hover": {
                                  backgroundColor: "#dc2626",
                                },
                                marginTop: "3px",
                                width: "100px",
                                boxShadow: "none",
                              }}
                              onClick={() => handleFSLDeleteRow(row.id)}
                            >
                              Delete
                            </Button>

                          </td>
                        </tr>
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </DialogContent>

          <DialogActions>

            <Button
              variant="outlined"
              sx={{
                color: "#b7bbc2",
                width: "15vw",
                borderColor: "#b7bbc2",
                backgroundColor: "#f9fafb",
                borderWidth: "2px",
                fontWeight: "600",
                textTransform: "none",
                "&:hover": {
                  backgroundColor: "#f1f5f9",
                },
              }}
              onClick={() => setFSLVisible(false)}

            >
              Cancel
            </Button>

            <Button
              variant="outlined"
              sx={{
                color: "white",
                width: "15vw",
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
                setSnackbarMessage(` FSL Approval Successfully Requested.`);
                setSnackbarSeverity('success');
                setOpenSnackbar(true);
                setFSLVisible(false);
              }}                  >
              Submit for Approval
            </Button>
          </DialogActions>
        </Dialog>

        {/* 17A PC ACT*/}

        <Dialog
          open={showPcAct}
          onClose={() => setShowPcActModal(false)}
          fullWidth
          maxWidth="sm"
          sx={{
            "& .MuiDialog-paper": {
              width: "60vw",
              color: "#000",
              background: "#fff",
              padding: "15px",
              borderRadius: "12px",
            },
          }}
        >
          <DialogTitle>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
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
              <span style={{ fontSize: "16px", fontWeight: "600" }}>17A PC ACT</span>
            </div>
          </DialogTitle>

          <DialogContent dividers>
            <p style={{ textAlign: "center", paddingBottom: "5px" }}>
              Are you sure you want to add this as 17A PC Act?
            </p>
          </DialogContent>

          <DialogActions sx={{ justifyContent: "center" }}>
            <Button
              variant="outlined"
              sx={{
                border: "1px solid #6B7280",
                color: "#6B7280",
                fontWeight: "600",
                textTransform: "none",
              }}
              onClick={() => setShowPcActModal(false)}
            >
              No
            </Button>
            <Button
              variant="contained"
              sx={{
                backgroundColor: "#2563eb",
                color: "white",
                fontWeight: "700",
                textTransform: "none",
                "&:hover": {
                  backgroundColor: "#1d4ed8",
                },
              }}
              onClick={() => {
                setSnackbarMessage(` 17A PC Act Approval Requested Successfully.`);
                setSnackbarSeverity('success');
                setOpenSnackbar(true);
                setShowPcActModal(false);
              }}
            >
              Yes
            </Button>
          </DialogActions>
        </Dialog>

        {/* Change of IO*/}

        <Dialog
          open={showChangeIO}
          onClose={() => setShowChangeIOModal(false)}
          fullWidth
          maxWidth="sm"
          sx={{
            "& .MuiDialog-paper": {
              width: "60vw",
              color: "#000",
              background: "#fff",
              padding: "15px",
              borderRadius: "12px",
            },
          }}
        >
          <DialogTitle>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
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
              <span style={{ fontSize: "16px", fontWeight: "600" }}>Change IO</span>
            </div>
          </DialogTitle>

          <DialogContent>
            <Grid item xs={12} sm={6}>
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
            </Grid>
          </DialogContent>

          <DialogActions>
            <Button
              variant="outlined"
              sx={{
                color: "#b7bbc2",
                width: "15vw",
                borderColor: "#b7bbc2",
                backgroundColor: "#f9fafb",
                borderWidth: "2px",
                fontWeight: "600",
                textTransform: "none",
                "&:hover": {
                  backgroundColor: "#f1f5f9",
                },
              }}
              onClick={() => setShowChangeIOModal(false)}
            >
              Cancel
            </Button>

            <Button
              variant="outlined"
              sx={{
                color: "white",
                width: "15vw",
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
                setSnackbarMessage(` IO Changes Approval Requested Successfully.`);
                setSnackbarSeverity('success');
                setOpenSnackbar(true);
                setShowChangeIOModal(false);
              }}
            >
              Submit for Approval
            </Button>
          </DialogActions>
        </Dialog>

        {/* Transfer to other division */}
        <Dialog
          open={showTransferOD}
          onClose={() => setShowTransferODModal(false)}
          fullWidth
          maxWidth="sm"
          sx={{
            "& .MuiDialog-paper": {
              width: "60vw",
              color: "#000",
              background: "#fff",
              padding: "15px",
              borderRadius: "12px",
            },
          }}
        >
          <DialogTitle>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
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
              <span style={{ fontSize: "16px", fontWeight: "600" }}>Transfer to Other Division</span>
            </div>
          </DialogTitle>

          <DialogContent>
            <Grid item xs={12} sm={6}>
              <AutocompleteField
                formData={formData}
                errors={errors}
                field={{
                  name: "io_name",
                  label: "Transfer Division",
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
            </Grid>
          </DialogContent>

          <DialogActions>
            <Button
              variant="outlined"
              sx={{
                color: "#b7bbc2",
                width: "15vw",
                borderColor: "#b7bbc2",
                backgroundColor: "#f9fafb",
                borderWidth: "2px",
                fontWeight: "600",
                textTransform: "none",
                "&:hover": {
                  backgroundColor: "#f1f5f9",
                },
              }}
              onClick={() => setShowTransferODModal(false)}
            >
              Cancel
            </Button>

            <Button
              variant="outlined"
              sx={{
                color: "white",
                width: "15vw",
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
                setSnackbarMessage(` Transfered to Other Division Approval Requested Successfully.`);
                setSnackbarSeverity('success');
                setOpenSnackbar(true);
                setShowTransferODModal(false);
              }}
            >
              Submit for Approval
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
  );
}
