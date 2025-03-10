import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import TableView from "../../components/table-view/TableView.js";
import AutocompleteField from "../../components/form/AutoComplete";
import DateField from "../../components/form/Date";
import ShortText from "../../components/form/ShortText.jsx";
import LongText from "../../components/form/LongText.jsx";
import { Snackbar, Alert } from '@mui/material';
import { Button } from '@mui/material';
import { Checkbox, Grid } from '@mui/material';
import { Box, SvgIcon } from "@mui/material";
import { Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { RadioGroup, FormControlLabel, Radio, Typography } from "@mui/material";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { TextField } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import InputAdornment from '@mui/material/InputAdornment';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import "./caseEnquiries.css";

export default function Cases() {
  const navigate = useNavigate();
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [isVisibleCreatBtn, setIsVisibleCreateBtn] = useState(false);
  const [caseType, setCaseType] = useState("");
  const [successVisible, setsuccessVisible] = useState(false);
  const [AccusedVisible, setAccusedVisible] = useState(false);
  const [RemarksVisible, setRemarksVisible] = useState(false);
  const [FSLVisible, setFSLVisible] = useState(false);
  const [progressReportVisible, setProgressReportVisible] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);
  const [radioButton, setRadioButton] = useState("All_Case");
  const [tableData, setTableData] = useState([]);
  const [date, setDate] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [showChangeIO, setShowChangeIOModal] = useState(false);
  const [showTransferOD, setShowTransferODModal] = useState(false);
  const [showProsecution, setShowProsecutionModal] = useState(false);
  const [showPcAct, setShowPcActModal] = useState(false);
  const [openDropdownIndex, setOpenDropdownIndex] = useState(null);
  const [successVisibleModal, setSuccessModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);
  const [showStatusUpdate, setShowStatusUpdateModal] = useState(false);
  const [showMergeCase, setShowMergeCase] = useState(false);
  const [selectedMerge, setSelectedMerge] = useState("");
  const [listingUICount, setListingUICount] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [currentPage, setCurrentPage] = useState(0);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [openRow, setOpenRow] = useState(null);
  const buttonRefs = useRef({});
  const dropdownRef = useRef(null);

  const [rows, setRows] = useState([
    { id: Date.now(), date: null, fsl: "" },
  ]);

  const [PRrows, setPRRows] = useState([
    { id: Date.now(), psdate: null, type: "", pr_report: "" },
  ]);

  const [remarksrows, setRermarksRows] = useState([
    { id: Date.now(), date: null, remark: "" },
  ]);

  const [accusedRows, setAccusedRows] = useState([
    { id: Date.now(), date: null, accused: "" },
  ]);

  const handleRemarksAddRow = () => {
    setRermarksRows([
      ...remarksrows,
      { id: Date.now(), date: null, remark: "" },
    ]);
  };

  const handleRemarksDeleteRow = (id) => {
    setRermarksRows(remarksrows.filter((row) => row.id !== id));
  };

  const handleFSLAddRow = () => {
    setRows([...rows, { id: Date.now(), date: null, fsl: "" }]);
  };

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

  const handleAccusedAddRow = () => {
    setAccusedRows([
      ...accusedRows,
      { id: Date.now(), date: null, accused: "" },
    ]);
  };

  const handleAccusedDeleteRow = (id) => {
    setAccusedRows(accusedRows.filter((row) => row.id !== id));
  };

  const handleChangeAccusedreports = (id, value) => {
    setAccusedRows(
      accusedRows.map((row) =>
        row.id === id ? { ...row, accused: value } : row
      )
    );
  };

  var bailStatus = [
    {
      name: "Warrant",
      code: "Warrant",
    },
    {
      name: "Summons",
      code: "Summons",
    },
    {
      name: "Notices",
      code: "Notices",
    },
    {
      name: "Proclamation",
      code: "Proclamation",
    },
  ];

  var Court = [
    { name: "Court 1 ", code: "CO" },
    { name: "Court 2", code: "GO" },
    { name: "Court 3", code: "HC" },
    { name: "Court 4", code: "SC" },
    { name: "Court 5", code: "NH" },
    { name: "Court 6", code: "OT" },
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
    { name: "Under Investigation", code: "UI" },
    { name: "Enquiry", code: "EQ" },
    { name: "Pending Trail", code: "PT" },
  ];

  var uiCases = [
    {
      id: "1",
      caseType: "Enquiry",
      cidCrimeNo: "",
      firType: "UDR",
      psCrimeNo: "122",
      psName: "PS3",
      department: "CID",
      division: "Special Enquiries",
      referringAgency: "CO",
      date: "01-10-2008",
      presentIO: "Suresh",
      presentIODesignation: "DSP",
      presentStatus: "Under Enquiry",
      courtName: "",
      courtLocation: "",
    },
  ];
  var fiCases = [
    {
      id: "2",
      caseType: "Pending Trial",
      cidCrimeNo: "",
      firType: "UDR",
      psCrimeNo: "122",
      psName: "PS3",
      department: "CID",
      division: "Special Enquiries",
      referringAgency: "CO",
      date: "01-10-2008",
      presentIO: "Suresh",
      presentIODesignation: "DSP",
      presentStatus: "Pending in Court",
      courtName: "",
      courtLocation: "",
    },
  ];

  var numberCases = [
    {
      id: "3",
      caseType: "Under Investigation",
      cidCrimeNo: "111/2008",
      firType: "UDR",
      psCrimeNo: "155",
      psName: "PS3",
      department: "CID",
      division: "Homicide and Burglary",
      referringAgency: "GOVT",
      date: "10-01-2013",
      presentIO: "Suresh Prabhu",
      presentIODesignation: "DSP",
      presentStatus: "Under Investigation",
      courtName: "",
      courtLocation: "",
      caseCategory: "",
    },
  ];

  var mergedCases = [
    {
      id: "4",
      caseType: "Pending Trial",
      cidCrimeNo: "108/2015",
      firType: "UDR",
      psCrimeNo: "122",
      psName: "PS5",
      department: "CID",
      division: "Homicide and Burglary",
      referringAgency: "GOVT",
      date: "22-06-2020",
      presentIO: "Rafi",
      presentIODesignation: "PI",
      presentStatus: "Pending in Court",
      courtName: "ASMT1",
      courtLocation: "Bangalore",
      caseCategory: "",
    },
  ];

  var disposal = [
    {
      id: "5",
      caseType: "Pending Trial",
      cidCrimeNo: "108/2015",
      firType: "UDR",
      psCrimeNo: "122",
      psName: "PS5",
      department: "CID",
      division: "Homicide and Burglary",
      referringAgency: "GOVT",
      date: "22-06-2020",
      presentIO: "Rafi",
      presentIODesignation: "PI",
      presentStatus: "Pending in Court",
      courtName: "ASMT1",
      courtLocation: "Bangalore",
      caseCategory: "",
    },
  ];

  useEffect(() => {

    switch (radioButton) {
      case "All_Case":
        setTableData([...uiCases, ...fiCases, ...numberCases, ...mergedCases, ...disposal,]);
        setIsVisibleCreateBtn(false);
        setCaseType("");
        setListingUICount(uiCases.length + fiCases.length + numberCases.length + mergedCases.length + disposal.length);
        setCurrentPage(0);
        break;

      case "uiCases":
        setTableData(uiCases);
        setIsVisibleCreateBtn(true);
        setCaseType("UI");
        setListingUICount(uiCases.length);
        setCurrentPage(0);
        break;
      case "fiCases":
        setTableData(fiCases);
        setIsVisibleCreateBtn(true);
        setCaseType("PT");
        setListingUICount(fiCases.length);
        setCurrentPage(0);
        break;
      case "numberCases":
        setTableData(numberCases);
        setIsVisibleCreateBtn(true);
        setCaseType("PT");
        setListingUICount(numberCases.length);
        setCurrentPage(0);
        break;
      case "mergedCases":
        setTableData(mergedCases);
        setIsVisibleCreateBtn(true);
        setCaseType("PT");
        setListingUICount(mergedCases.length);
        setCurrentPage(0);
        break;
      case "disposal":
        setTableData(disposal);
        setIsVisibleCreateBtn(true);
        setCaseType("PT");
        setListingUICount(disposal.length);
        setCurrentPage(0);
        break;
      default:
        setTableData([]);
        setIsVisibleCreateBtn(false);
        setCaseType("");
        setListingUICount(0);
        setCurrentPage(0);
        break;
    }
  }, [radioButton]);


  var showCreate = () => {
    navigate("/UICreate");
  };


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

  var showFilterBox = () => {
    setsuccessVisible(true);
  };

  var showProgreassReportModal = () => {
    setProgressReportVisible(true);
  };

  var showFSLModal = () => {
    setFSLVisible(true);
    setRows([{ id: Date.now(), date: null, fsl: "" }]);
  };

  var showTransferODModal = () => {
    setShowTransferODModal(true);
  };
  var showProsecutionModal = () => {
    setShowProsecutionModal(true);
  };
  var showPcActModal = () => {
    setShowPcActModal(true);
  };

  const handleSelectionChange = (selectedRow) => {
    setSelectedCase(selectedRow);
    navigate("/UIView", {
      state: { caseDetails: selectedRow, mode: "view" },
    });
  };

  const handleActionSelect = (e, action, rowData) => {

    if (action === "edit") {
      setSelectedCase(rowData);
      navigate("/UIView", {
        state: { caseDetails: rowData, mode: "edit" },
      });
    }
  };

  const Accused = () => {
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
          id="mask0_871_14335"
          style={{ maskType: "alpha" }}
          maskUnits="userSpaceOnUse"
          x="4"
          y="4"
          width="16"
          height="16"
        >
          <rect x="4" y="4" width="16" height="16" fill="#D9D9D9" />
        </mask>
        <g mask="url(#mask0_871_14335)">
          <path
            d="M9.24997 15.6673C8.6303 15.6673 8.04036 15.522 7.48013 15.2313C6.91991 14.9408 6.4513 14.5348 6.0743 14.0135C5.76152 13.581 5.52652 13.0729 5.3693 12.4892C5.21197 11.9054 5.1333 11.2537 5.1333 10.534C5.1333 9.93654 5.34441 9.42054 5.76663 8.98598C6.18886 8.55132 6.68541 8.33398 7.2563 8.33398C7.37519 8.33398 7.4983 8.34298 7.62563 8.36098C7.75297 8.37887 7.87263 8.41132 7.98463 8.45832L12 9.97632L16.0153 8.45832C16.1273 8.41132 16.247 8.37887 16.3743 8.36098C16.5016 8.34298 16.6247 8.33398 16.7436 8.33398C17.3145 8.33398 17.8111 8.55132 18.2333 8.98598C18.6555 9.42054 18.8666 9.93654 18.8666 10.534C18.8666 11.2537 18.788 11.9054 18.6306 12.4892C18.4734 13.0729 18.244 13.581 17.9423 14.0135C17.5653 14.5348 17.0967 14.9408 16.5365 15.2313C15.9762 15.522 15.3863 15.6673 14.7666 15.6673C14.0932 15.6673 13.5118 15.5034 13.0225 15.1757L12.2885 14.684H11.7115L10.9775 15.1757C10.4881 15.5034 9.9123 15.6673 9.24997 15.6673ZM9.6833 13.1237C9.95763 13.1237 10.1745 13.0662 10.334 12.9513C10.4933 12.8363 10.573 12.6694 10.573 12.4507C10.5687 12.0831 10.3141 11.7263 9.80897 11.3802C9.30386 11.034 8.77863 10.861 8.2333 10.861C7.95897 10.861 7.74313 10.924 7.5858 11.05C7.42858 11.1761 7.34997 11.343 7.34997 11.5507C7.3543 11.9224 7.60791 12.2775 8.1108 12.616C8.6138 12.9544 9.13797 13.1237 9.6833 13.1237ZM14.2666 13.1403C14.812 13.1403 15.34 12.9673 15.8506 12.6212C16.3613 12.275 16.6187 11.9182 16.623 11.5507C16.623 11.3361 16.545 11.1703 16.3891 11.0532C16.2331 10.9362 16.0201 10.8777 15.75 10.8777C15.1534 10.8819 14.597 11.0754 14.0808 11.4583C13.5646 11.8412 13.3487 12.2275 13.4333 12.6173C13.4777 12.7805 13.5714 12.9085 13.7141 13.0013C13.8568 13.094 14.041 13.1403 14.2666 13.1403Z"
            fill="#1C1B1F"
          />
        </g>
      </svg>
    );
  };
  const EditIcon = () => {
    return (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        className="group-hover:fill-white"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="12" cy="12" r="12" fill="#F4F4F4" />
        <mask
          id="mask0_871_14300"
          style={{ maskType: "alpha" }}
          maskUnits="userSpaceOnUse"
          x="4"
          y="4"
          width="16"
          height="16"
        >
          <rect x="4" y="4" width="16" height="16" fill="#D9D9D9" />
        </mask>
        <g mask="url(#mask0_871_14300)">
          <path
            d="M5.6001 20.0005V17.4671H18.4001V20.0005H5.6001ZM7.53343 15.1428V13.1775L14.2399 6.46329C14.3365 6.36674 14.4368 6.29924 14.5409 6.26079C14.6452 6.22235 14.7524 6.20312 14.8628 6.20312C14.9774 6.20312 15.0856 6.22235 15.1873 6.26079C15.2889 6.29924 15.3865 6.36429 15.4801 6.45596L16.2129 7.18513C16.3053 7.28168 16.3717 7.38079 16.4123 7.48246C16.4528 7.58424 16.4731 7.69374 16.4731 7.81096C16.4731 7.91818 16.4531 8.02501 16.4131 8.13146C16.3731 8.23801 16.308 8.33635 16.2179 8.42646L9.5001 15.1428H7.53343ZM14.7438 8.67363L15.6064 7.81079L14.8654 7.06979L14.0026 7.93246L14.7438 8.67363Z"
            fill="#1C1B1F"
          />
        </g>
      </svg>
    );
  };
  const ProgressIcon = () => {
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
          id="mask0_871_14314"
          style={{ maskType: "alpha" }}
          maskUnits="userSpaceOnUse"
          x="4"
          y="4"
          width="16"
          height="16"
        >
          <rect x="4" y="4" width="16" height="16" fill="#D9D9D9" />
        </mask>
        <g mask="url(#mask0_871_14314)">
          <path
            d="M7.80523 17.2667C7.5129 17.2667 7.26118 17.1612 7.05007 16.9501C6.83895 16.739 6.7334 16.4872 6.7334 16.1949V7.80523C6.7334 7.50179 6.83895 7.24729 7.05007 7.04173C7.26118 6.83618 7.5129 6.7334 7.80523 6.7334H16.1949C16.4983 6.7334 16.7528 6.83618 16.9584 7.04173C17.164 7.24729 17.2667 7.50179 17.2667 7.80523V16.1949C17.2667 16.4872 17.164 16.739 16.9584 16.9501C16.7528 17.1612 16.4983 17.2667 16.1949 17.2667H7.80523ZM16.4001 8.6654L12.0899 13.0834L10.0771 11.0872L7.60007 13.5642V14.7731L10.0771 12.2962L12.0809 14.3001L16.4001 9.88206V8.6654Z"
            fill="#1C1B1F"
          />
        </g>
      </svg>
    );
  };
  const RemarkIcon = () => {
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
          id="mask0_871_14328"
          style={{ maskType: "alpha" }}
          maskUnits="userSpaceOnUse"
          x="4"
          y="4"
          width="16"
          height="16"
        >
          <rect x="4" y="4" width="16" height="16" fill="#D9D9D9" />
        </mask>
        <g mask="url(#mask0_871_14328)">
          <path
            d="M7.80523 17.2667C7.51045 17.2667 7.25812 17.1618 7.04823 16.9519C6.83834 16.742 6.7334 16.4897 6.7334 16.1949V7.80523C6.7334 7.51045 6.83834 7.25812 7.04823 7.04823C7.25812 6.83834 7.51045 6.7334 7.80523 6.7334H16.1949C16.4897 6.7334 16.742 6.83834 16.9519 7.04823C17.1618 7.25812 17.2667 7.51045 17.2667 7.80523V13.3629L13.3629 17.2667H7.80523ZM13.2001 16.4001L16.4001 13.2001H13.2001V16.4001ZM9.0949 13.0206H12.0001V12.1539H9.0949V13.0206ZM9.0949 10.6334H14.9052V9.76673H9.0949V10.6334Z"
            fill="#1C1B1F"
          />
        </g>
      </svg>
    );
  };
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
    const mergeCaseDetails = () => {
    setShowMergeCase(true);
  };

  // const ShowActionData = ({ rowData, onActionSelect }) => {

  //   return (
  //     <div
  //       style={{
  //         position: 'absolute',
  //         top: '34px',
  //         marginTop: '1px',
  //         width: '150px',
  //         backgroundColor: 'white',
  //         border: '1px solid #ddd',
  //         borderRadius: '8px',
  //         boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
  //         zIndex: '2',
  //         marginRight: "40px"
  //       }}
  //     >
  //       <div style={{ fontSize: "14px", color: "#374151" }}>
  //         <p
  //           style={{
  //             padding: "8px 16px",
  //             margin: 0,
  //             cursor: "pointer",
  //             display: "flex",
  //             alignItems: "center",
  //             gap: "8px",
  //             backgroundColor: "transparent",
  //           }}
  //           onMouseEnter={(e) => (e.target.style.backgroundColor = "#FFEDD5")}
  //           onMouseLeave={(e) => (e.target.style.backgroundColor = "transparent")}
  //           onClick={handleActionSelect}
  //         >
  //           <EditIcon /> Edit case
  //         </p>
  //         <p
  //           style={{
  //             padding: "8px 16px",
  //             margin: 0,
  //             cursor: "pointer",
  //             display: "flex",
  //             alignItems: "center",
  //             gap: "8px",
  //             backgroundColor: "transparent",
  //           }}
  //           onMouseEnter={(e) => (e.target.style.backgroundColor = "#FFEDD5")}
  //           onMouseLeave={(e) => (e.target.style.backgroundColor = "transparent")}
  //           onClick={() => showProgreassReportModal()}
  //         >
  //           <FSLIcon /> Progress Report
  //         </p>
  //         <p
  //           style={{
  //             padding: "8px 16px",
  //             margin: 0,
  //             cursor: "pointer",
  //             display: "flex",
  //             alignItems: "center",
  //             gap: "8px",
  //             backgroundColor: "transparent",
  //           }}
  //           onMouseEnter={(e) => (e.target.style.backgroundColor = "#FFEDD5")}
  //           onMouseLeave={(e) => (e.target.style.backgroundColor = "transparent")}
  //           onClick={showFSLModal}
  //         >
  //           <FSLIcon /> FSL Record

  //         </p>
  //         <p
  //           style={{
  //             padding: "8px 16px",
  //             margin: 0,
  //             cursor: "pointer",
  //             display: "flex",
  //             alignItems: "center",
  //             gap: "8px",
  //             backgroundColor: "transparent",
  //           }}
  //           onMouseEnter={(e) => (e.target.style.backgroundColor = "#FFEDD5")}
  //           onMouseLeave={(e) => (e.target.style.backgroundColor = "transparent")}
  //           onClick={showProsecutionModal}
  //         >
  //           <RemarkIcon /> Prosecution Sanction

  //         </p>
  //         <p
  //           style={{
  //             padding: "8px 16px",
  //             margin: 0,
  //             cursor: "pointer",
  //             display: "flex",
  //             alignItems: "center",
  //             gap: "8px",
  //             backgroundColor: "transparent",
  //           }}
  //           onMouseEnter={(e) => (e.target.style.backgroundColor = "#FFEDD5")}
  //           onMouseLeave={(e) => (e.target.style.backgroundColor = "transparent")}
  //           onClick={showPcActModal}
  //         >
  //           <Accused /> 17A PC ACT

  //         </p>
  //         <p
  //           style={{
  //             padding: "8px 16px",
  //             margin: 0,
  //             cursor: "pointer",
  //             display: "flex",
  //             alignItems: "center",
  //             gap: "8px",
  //             backgroundColor: "transparent",
  //           }}
  //           onMouseEnter={(e) => (e.target.style.backgroundColor = "#FFEDD5")}
  //           onMouseLeave={(e) => (e.target.style.backgroundColor = "transparent")}
  //           onClick={() => setShowStatusUpdateModal(true)}
  //         >
  //           <Accused /> Status Update
  //         </p>
  //         <p
  //           style={{
  //             padding: "8px 16px",
  //             margin: 0,
  //             cursor: "pointer",
  //             display: "flex",
  //             alignItems: "center",
  //             gap: "8px",
  //             backgroundColor: "transparent",
  //           }}
  //           onMouseEnter={(e) => (e.target.style.backgroundColor = "#FFEDD5")}
  //           onMouseLeave={(e) => (e.target.style.backgroundColor = "transparent")}
  //         >
  //           <Accused /> Download
  //         </p>
  //         <p
  //           style={{
  //             padding: "8px 16px",
  //             margin: 0,
  //             cursor: "pointer",
  //             display: "flex",
  //             alignItems: "center",
  //             gap: "8px",
  //             backgroundColor: "transparent",
  //           }}
  //           onMouseEnter={(e) => (e.target.style.backgroundColor = "#FFEDD5")}
  //           onMouseLeave={(e) => (e.target.style.backgroundColor = "transparent")}
  //         >
  //           <Accused /> print
  //         </p>
  //       </div>
  //     </div>
  //   );
  // };

  const ActionDropdown = ({ isOpen, onToggle, rowData }) => {
    console.log("Dropdown isOpen:", isOpen); // Debugging
  
    return (
      <div style={{ position: "relative", display: "inline-block" }}>
        {/* Icon Button */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          style={{ padding: "8px", cursor: "pointer", zIndex: 5 }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 16 16"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
            style={{
              transition: "transform 0.3s ease",
              transform: isOpen ? "rotate(0deg)" : "rotate(180deg)",
            }}
          >
            <path
              d="M10.157 9.95L8.036 7.828 5.914 9.95 4.5 8.536 8.036 5l3.535 3.536-1.414 1.414zM0 8c0-4.418 3.59-8 8-8 4.418 0 8 3.59 8 8 0 4.418-3.59 8-8 8-4.418 0-8-3.59-8-8zm2 0c0 3.307 2.686 6 6 6 3.307 0 6-2.686 6-6 0-3.307-2.686-6-6-6-3.307 0-6 2.686-6 6z"
              fillRule="evenodd"
            />
          </svg>
        </div>
  
        {/* Dropdown Content */}
        {isOpen && (
          <div
  onClick={(e) => e.stopPropagation()} // Prevent closing on clicking inside
  style={{
    position: "absolute",
    top: "100%",
    left: "0",
    backgroundColor: "white",
    border: "1px solid #ddd",
    borderRadius: "8px",
    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
    width: "180px",
    zIndex: 1000,
    padding: "5px",
  }}
>
  <ShowActionData rowData={rowData} />
</div>

        )}
      </div>
    );
  };
    const ShowActionData = ({ rowData, onActionSelect }) => {
    console.log("Rendering ShowActionData with rowData:", rowData); // Debugging
    return (
      <div style={{ position: "absolute", top: "34px", width: "150px", backgroundColor: "red" }}>
        {/* Menu Items */}
        <p onClick={() => console.log("Edit clicked")}>Edit case</p>
        <p onClick={() => console.log("Progress Report clicked")}>Progress Report</p>
      </div>
    );
  };
          
  const [selectedProducts, setSelectedProducts] = useState([]);

  // Handle checkbox selection
  const handleCheckboxChange = (event, row) => {
    event.stopPropagation(); // Prevent row click when clicking checkbox

    setSelectedProducts((prev) => {
      const currentSelection = Array.isArray(prev) ? prev : [];

      if (event.target.checked) {
        return [...currentSelection, row]; // Add row to selection
      } else {
        return currentSelection.filter((item) => item.id !== row.id); // Remove row
      }
    });
  };




  const columns = [
    {
      field: 'selection',
      headerName: '',
      flex: 0.5,
      renderCell: (params) => {
        if (!params.row) return null;

        return (
          <Checkbox
            onClick={(e) => e.stopPropagation()}
            checked={selectedProducts.some((item) => item.id === params.row.id)}
            onChange={(event) => handleCheckboxChange(event, params.row)}
          />
        );
      },

    },
    {
      field: 'caseType',
      headerName: 'Case Type',
      width: 150,
      sortable: true,
      renderCell: (params) => tableBodyTemplate("caseType", "#475467", "400")(params.row)
    },
    {
      field: 'cidCrimeNo',
      headerName: 'CID Crime No',
      width: 150,
      sortable: true,
      renderCell: (params) => tableBodyTemplate("cidCrimeNo")(params.row)
    },
    {
      field: 'firType',
      headerName: 'FIR/UDR/FOC/MFA',
      width: 150,
      sortable: true,
      renderCell: (params) => tableBodyTemplate("firType", "#475467", "400", "underline")(params.row)
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
      width: 150,
      sortable: true,
      renderCell: (params) => tableBodyTemplate("psName")(params.row)
    },
    {
      field: 'division',
      headerName: 'Division',
      width: 150,
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
      field: 'referringAgency',
      headerName: 'Referring Agency',
      width: 150,
      sortable: true,
      renderCell: (params) => tableBodyTemplate("referringAgency")(params.row)
    },
    {
      field: 'date',
      headerName: 'Date',
      width: 150,
      sortable: true,
      renderCell: (params) => tableBodyTemplate("date")(params.row)
    },
    {
      field: 'presentIO',
      headerName: 'Present IO',
      width: 150,
      sortable: true,
      renderCell: (params) => tableBodyTemplate("presentIO")(params.row)
    },
    {
      field: 'presentIODesignation',
      headerName: 'Present IO Designation',
      width: 150,
      sortable: true,
      renderCell: (params) => tableBodyTemplate("presentIODesignation")(params.row)
    },
    {
      field: 'presentStatus',
      headerName: 'Present Status',
      width: 150,
      sortable: true,
      renderCell: (params) => tableBodyTemplate("presentStatus")(params.row)
    },
    {
      field: 'courtName',
      headerName: 'Court Name',
      width: 150,
      sortable: true,
      renderCell: (params) => tableBodyTemplate("courtName")(params.row)
    },
    {
      field: 'courtLocation',
      headerName: 'Court Location',
      width: 150,
      sortable: true,
      renderCell: (params) => tableBodyTemplate("courtLocation")(params.row)
    },
    {
      field: 'caseCategory',
      headerName: 'CC/SC/ACC',
      width: 150,
      sortable: true,
      renderCell: (params) => tableBodyTemplate("caseCategory")(params.row)
    },
    {
      field: "action",
      headerName: "Action",
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <div style={{ position: "relative" }}>
          <ActionDropdown
            isOpen={openDropdownIndex === params.row.id}
            onToggle={() => handleDropdownToggle(params.row.id)}
            rowData={params.row}
          />
        </div>
      ),    
    }
  ];

  const handleDropdownToggle = (id) => {
    setOpenDropdownIndex((prev) => (prev === id ? null : id));
  };
  

  const totalPages = Math.ceil(tableData.length / pageSize);
  const currentPageRows = tableData.slice(currentPage * pageSize, (currentPage + 1) * pageSize);

  const handleNext = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };
  const handleBack = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };
  const handleSearchChange = (event) => {
    setFormData({
      ...formData,
      search: event.target.value,
    });
  };


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
      type: "date",
      name: "nodates",
      label: "Number and dates of the Case Diaries on which the PR is based",
      required: true,
    },
    {
      type: "date",
      name: "particulars",
      label: "Particulars of investigation pending to be done",
      required: true,
    },
    {
      type: "date",
      name: "spsinstructions",
      label: "SP's instructions issued to IO",
      required: true,
    },
  ];




  const filtersfields = [
    {
      type: "autocomplete",
      name: "io_name",
      label: "IO Name",
      options: [
        { name: "Manjunath DR", code: "Manjunath DR" },
        { name: "Sandeep Kumar", code: "Sandeep Kumar" },
        { name: "Neha Reddy", code: "Neha Reddy" },
        { name: "Karan Yadav", code: "Karan Yadav" },
        { name: "Vikram Singh", code: "Vikram Singh" },
      ],
    },
    {
      type: "autocomplete",
      name: "present_status",
      label: "Present Status",
      options: present_status,
    },
    {
      type: "autocomplete",
      name: "case_type",
      label: "Present Status",
      options: CaseType,
    },
    {
      type: "autocomplete",
      name: "division",
      label: "Division",
      options: Division,
    },
    {
      type: "autocomplete",
      name: "cid_crime_no",
      label: "CID Crime No",
      options: [
        { name: "104/2014", code: "104/2014" },
        { name: "108/2015", code: "108/2015" },
        { name: "111/2008", code: "111/2008" },
        { name: "124/2014", code: "124/2014" },
        { name: "144/2015", code: "144/2015" },
        { name: "169/2015", code: "169/2015" },
        { name: "222/2008", code: "222/2008" },
        { name: "224/2008", code: "224/2008" },
      ],
    },
    {
      type: "date",
      name: "fromDate",
      label: "From Date",
      required: true,
    },
    {
      type: "date",
      name: "toDate",
      label: "To Date",
      required: true,
    },
    {
      type: "autocomplete",
      name: "police_station_name",
      label: "Police Station Name",
      options: [
        { name: "PS1", code: "PS1" },
        { name: "PS2", code: "PS2" },
        { name: "PS3", code: "PS3" },
        { name: "PS4", code: "PS4" },
        { name: "PS5", code: "PS5" },
      ],
    },
    {
      type: "autocomplete",
      name: "ps_crime_no",
      label: "PS Crime No",
      options: [
        { name: "122", code: "122" },
        { name: "248", code: "248" },
        { name: "155", code: "155" },
        { name: "136", code: "136" },
        { name: "166", code: "166" },
        { name: "133", code: "133" },
        { name: "128", code: "128" },
      ],
    },
    {
      type: "autocomplete",
      name: "referring_agency",
      label: "Referring Agency",
      options: agency,
    },
    {
      type: "autocomplete",
      name: "trial_result",
      label: "Trial Result",
      options: agency,
    },
  ];



  return (
    <div
      className={`m-3 ml-4 bg-white border-round-sm`} id="underInvesticationDiv">

      <div>
        <div className="m-3 ml-4 p-3 bg-white border-round-sm">
          <div className="flex align-items-center" style={{
            display: "flex", justifyContent: "space-between",
          }}>
            <div className="flex flex-column">
              <div className="flex items-center" style={{ display: "flex", gap: "8px", alignItems: "center", marginTop: "28px", marginLeft: "9px" }}>
                <h1 style={{ fontSize: "1.50rem", fontWeight: "bold", color: "#2d3748", margin: "0 0.5rem 0 0" }}>
                  UI (Under Investigation)
                </h1>
                <p style={{
                  margin: "0", fontSize: "0.75rem", fontWeight: "600", color: "#1E40AF", padding: "0.25rem 0.75rem", backgroundColor: "#E3F2FD", borderRadius: "0.75rem", height: "auto",
                }}
                >
                  {listingUICount} Cases
                </p>
              </div>
              <p
                className=" text-base font-normal"
                style={{ color: "#667085", marginLeft: "9px" }}
              >
                Overview of UI Cases details
              </p>
            </div>
            <div
              className="button-container"
              style={{
                display: "flex",
                gap: "16px",
                justifyContent: "flex-end",
                width: "auto",
                marginTop: "28px",
                marginRight: "5px"
              }}
            >

              {selectedProducts.length > 0 && (
                <Button
                  variant="contained"
                  startIcon={
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 20 18"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M1 18V12H3V16H7V18H1ZM13 18V16H17V12H19V18H13ZM5.175 12.825L3.75 11.425L5.175 10H0V8H5.175L3.75 6.575L5.175 5.175L9 9L5.175 12.825ZM14.825 12.825L11 9L14.825 5.175L16.25 6.575L14.825 8H20V10H14.825L16.25 11.425L14.825 12.825ZM1 6V0H7V2H3V6H1ZM17 6V2H13V0H19V6H17Z"
                        fill="white"
                      />
                    </svg>
                  }
                  sx={{
                    backgroundColor: "#1F1DAC",
                    color: "white",
                    fontWeight: "600",
                    textTransform: "none",
                    fontSize: "14px",
                    padding: "4px 8px",
                    minWidth: "32px",
                    width: "80px",
                    height: "38px",
                    "&:hover": {
                      backgroundColor: "#2A55E5",
                    },
                  }}
                  onClick={mergeCaseDetails}
                >
                  Merge
                </Button>
              )}
              <>
                <Button
                  variant="outlined"
                  startIcon={
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="16"
                      viewBox="0 0 18 16"
                      fill="none"
                    >
                      <path
                        d="M2 16C1.45 16 0.979167 15.8042 0.5875 15.4125C0.195833 15.0208 0 14.55 0 14C0 13.45 0.195833 12.9792 0.5875 12.5875C0.979167 12.1958 1.45 12 2 12C2.55 12 3.02083 12.1958 3.4125 12.5875C3.80417 12.9792 4 13.45 4 14C4 14.55 3.80417 15.0208 3.4125 15.4125C3.02083 15.8042 2.55 16 2 16ZM2 10C1.45 10 0.979167 9.80417 0.5875 9.4125C0.195833 9.02083 0 8.55 0 8C0 7.45 0.195833 6.97917 0.5875 6.5875C0.979167 6.19583 1.45 6 2 6C2.55 6 3.02083 6.19583 3.4125 6.5875C3.80417 6.97917 4 7.45 4 8C4 8.55 3.80417 9.02083 3.4125 9.4125C3.02083 9.80417 2.55 10 2 10ZM2 4C1.45 4 0.979167 3.80417 0.5875 3.4125C0.195833 3.02083 0 2.55 0 2C0 1.45 0.195833 0.979167 0.5875 0.5875C0.979167 0.195833 1.45 0 2 0C2.55 0 3.02083 0.195833 3.4125 0.5875C3.80417 0.979167 4 1.45 4 2C4 2.55 3.80417 3.02083 3.4125 3.4125C3.02083 3.80417 2.55 4 2 4ZM8 4C7.45 4 6.97917 3.80417 6.5875 3.4125C6.19583 3.02083 6 2.55 6 2C6 1.45 6.19583 0.979167 6.5875 0.5875C6.97917 0.195833 7.45 0 8 0C8.55 0 9.02083 0.195833 9.4125 0.5875C9.80417 0.979167 10 1.45 10 2C10 2.55 9.80417 3.02083 9.4125 3.4125C9.02083 3.80417 8.55 4 8 4ZM14 4C13.45 4 12.9792 3.80417 12.5875 3.4125C12.1958 3.02083 12 2.55 12 2C12 1.45 12.1958 0.979167 12.5875 0.5875C12.9792 0.195833 13.45 0 14 0C14.55 0 15.0208 0.195833 15.4125 0.5875C15.8042 0.979167 16 1.45 16 2C16 2.55 15.8042 3.02083 15.4125 3.4125C15.0208 3.80417 14.55 4 14 4ZM8 10C7.45 10 6.97917 9.80417 6.5875 9.4125C6.19583 9.02083 6 8.55 6 8C6 7.45 6.19583 6.97917 6.5875 6.5875C6.979167 6.19583 7.45 6 8 6C8.55 6 9.02083 6.19583 9.4125 6.5875C9.80417 6.97917 10 7.45 10 8C10 8.55 9.80417 9.02083 9.4125 9.4125C9.02083 9.80417 8.55 10 8 10ZM9 16V12.925L14.525 7.425C14.675 7.275 14.8417 7.16667 15.025 7.1C15.2083 7.03333 15.3917 7 15.575 7C15.775 7 15.9667 7.0375 16.15 7.1125C16.3333 7.1875 16.5 7.3 16.65 7.45L17.575 8.375C17.7083 8.525 17.8125 8.69167 17.8875 8.875C17.9625 9.05833 18 9.24167 18 9.425C18 9.60833 17.9667 9.79583 17.9 9.9875C17.8333 10.1792 17.725 10.35 17.575 10.5L12.075 16H9ZM10.5 14.5H11.45L14.475 11.45L14.025 10.975L13.55 10.525L10.5 13.55V14.5ZM14.025 10.975L13.55 10.525L14.475 11.45L14.025 10.975Z"
                        fill="white"
                      />
                    </svg>
                  }
                  sx={{
                    height: "38px",
                    border: "1px solid #2A55E5",
                    borderRadius: "6px",
                    gap: "1px",
                    color: "white",
                    backgroundColor: "#1F1DAC",
                    fontWeight: "600",
                    textTransform: "none",
                    "&:hover": {
                      backgroundColor: "#2A55E5",
                    },
                  }}
                  onClick={showCreate}
                >
                  Register New Case
                </Button>
              </>
            </div>
          </div>

          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
            marginTop: "12px",
            marginBottom: "12px",
            marginLeft: "5px"
          }}>

            <div style={{ backgroundColor: "#E5E7EB", padding: "3px", borderRadius: "10px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {[
                { label: "All Case", value: "All_Case" },
                { label: "UI Case", value: "uiCases" },
                { label: "Futher Investigation", value: "fiCases" },
                { label: "173(8) Cases", value: "numberCases" },
                { label: "Merged Cases", value: "mergedCases" },
                { label: "Disposal", value: "disposal" },

              ].map((item) => (
                <Button
                  key={item.value}
                  variant="text"
                  sx={{
                    height: "38px",
                    borderRadius: "6px",
                    fontWeight: radioButton === item.value ? "600" : "400",
                    textTransform: "none",
                    color: "black",
                    backgroundColor: radioButton === item.value ? "white" : "transparent",
                    padding: radioButton === item.value ? "0px 20px" : "0px",
                    border: radioButton === item.value ? "1px solid #D0D5DD" : "none",
                    "&:hover": {
                      backgroundColor: radioButton === item.value ? "white" : "rgba(229, 231, 235, 0.5)",
                    },
                  }}
                  onClick={() => setRadioButton(item.value)}
                >
                  {item.label}
                </Button>
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
              <div style={{ position: "relative", width: "300px" }}>
                <TextField
                  variant="outlined"
                  fullWidth
                  placeholder="Search cases"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                    style: { height: "38px" },
                  }}
                  name="search"
                  value={formData?.search || ''}
                  onChange={handleSearchChange}
                  error={Boolean(errors?.search)}
                  helperText=" "
                />
              </div>
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
            </div>
          </div>
        </div>


        <div className="pt-4" style={{ overflowX: "auto" }}>
          <div style={{ height: 400, width: '100%' }}>
            <TableView
              rows={currentPageRows}
              columns={columns}
              getRowId={(row) => row.id}
              handleRowClick={handleSelectionChange}
              handleNext={handleNext}
              handleBack={handleBack}
              backBtn={currentPage > 0}
              nextBtn={currentPage < totalPages - 1}
            />
          </div>
        </div>
      </div>


      <Dialog
        open={successVisible}
        onClose={() => {
          if (!successVisible) return;
          setsuccessVisible(false);
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
              {filtersfields.map((field, index) =>
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
                        onChange={(name, value) => {
                          setFormData((prev) => ({ ...prev, [name]: value }));
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
                        onChange={(date) => setDate(date)} />
                    )}
                  </Grid>
                )
              )}
            </Grid>
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
              onClick={() => setsuccessVisible(false)}
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
              onClick={() => setsuccessVisible(false)}            >
              Set Filters
            </Button>
          </div>
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

      <div>
        <Dialog open={showMergeCase} onClose={() => setShowMergeCase(false)} fullWidth maxWidth="sm">
          <DialogTitle>Merge Case</DialogTitle>
          <DialogContent>
            <p>Choose Parent Case</p>
            <RadioGroup value={selectedMerge} onChange={(e) => setSelectedMerge(e.target.value)}>
              {["111/2008", "222/2008", "144/2015"].map((caseNum) => (
                <FormControlLabel key={caseNum} value={caseNum} control={<Radio />} label={caseNum} />
              ))}
            </RadioGroup>
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
              onClick={() => setShowMergeCase(false)}            >
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
                setSnackbarMessage(` Case Merged Successfully.`);
                setSnackbarSeverity('success');
                setOpenSnackbar(true);
                setShowMergeCase(false);
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
    </div>
  );
}
