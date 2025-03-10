import React, { useEffect, useState, useRef } from "react";
import ShortText from "../../components/form/ShortText";
import DateField from "../../components/form/Date";
import AutocompleteField from "../../components/form/AutoComplete";
import { Grid } from '@mui/material';
import LongText from "../../components/form/LongText.jsx";
import { Box, SvgIcon } from "@mui/material";
import { Dialog, DialogTitle, DialogContent, DialogActions, Radio, FormControlLabel, Button, TextField, } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate, useLocation } from "react-router-dom";
import { Snackbar, Alert } from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
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
export default function Registeration() {
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [date, setDate] = useState("");
  const [dateofpr, setDatePr] = useState("");
  const [dateofeo, setDateEo] = useState("");
  const [dateofcid, setDateOToCID] = useState("");
  const [successVisible, setSuccessVisible] = useState(false);
  const [caseCategoryValue, setCaseCategoryValue] = useState("");
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);
  const [modeType, setModeType] = useState("");
  const dropdownRef = useRef(null);
  const [WitnessModalView, setWitnessModalView] = useState(false);
  const [FurtherInvestigationVisible, setFurtherInvestigationVisible] =
    useState(false);
  const [AccusedVisible, setAccusedVisible] = useState(false);
  const [openDropdownIndex, setOpenDropdownIndex] = useState(null);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  const [Witness, setWitness] = useState([
    { id: Date.now(), wdate: null, witness: "" },
  ]);

  const handleWitnessRow = () => {
    setWitness([...Witness, { id: Date.now(), wdate: null, witness: "" }]);
  };

  const handleWitnessDelete = (id) => {
    setWitness(Witness.filter((row) => row.id !== id));
  };

  const handleWitnessChangeDate = (id, value) => {
    setWitness(
      Witness.map((row) => (row.id === id ? { ...row, wdate: value } : row))
    );
  };

  const handleWitnessChangeReport = (id, value) => {
    setWitness(
      Witness.map((row) => (row.id === id ? { ...row, witness: value } : row))
    );
  };

  const [accusedRows, setAccusedRows] = useState([
    { id: Date.now(), date: null, accused: "" },
  ]);

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

  const [rows, setRows] = useState([
    {
      act: null,
      section: null,
    },
  ]);
  const navigate = useNavigate();
  const [description, setDescription] = useState("");

  useEffect(() => {
    const caseDetails = location.state?.caseDetails;
    setModeType(location.state?.mode);
    console.log();
    if (caseDetails) {
      setCaseCategoryValue(caseDetails);
    }
  }, [location]);

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

  var result_of_judgement = [
    { name: "DIS", code: "DIS" },
    { name: "ACQ", code: "ACQ" },
    { name: "CON", code: "CON" },
  ];

  var Whether = [
    { name: "Yes", code: "Yes" },
    { name: "No", code: "No" },
  ];

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false); // Close dropdown
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup function to remove the event listener
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const dropDownToggle = () => {
    setShowDropdown(!showDropdown);
  };

  var backToCase = () => {
    navigate("/PTCase");
  };

  // Initial accused list with pre-populated data
  const [accusedList, setAccusedList] = useState([
    { id: 1, accused_name: "Ravi", accused_section: "Section 1" },
    { id: 2, accused_name: "Kumar", accused_section: "Section 2" },
  ]);


  // Function to add a new accused row
  const addAccusedRowList = () => {
    setAccusedList([
      ...accusedList,
      { id: accusedList.length + 1, accused_name: "", status: "" },
    ]);
  };

  // Handle change in the input fields for each row
  const handleChangeAccusedReportsList = (id, field, value) => {
    setAccusedList((prevRows) =>
      prevRows.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  // Handle deletion of a row
  const handleAccusedDeleteRowList = (id) => {
    setAccusedList(accusedList.filter((row) => row.id !== id));
  };

  const ActionDropdown = ({ isOpen, onToggle, rowData, onActionSelect }) => {
    return (
      <div className="relative mt-1">
        <>
          <div
            onClick={(e) => {
              e.stopPropagation();
              onToggle(); // Toggle dropdown
            }}
            className=" cursor-pointer relative z-1"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 16 16"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
              className={`transition-transform ${isOpen ? "" : "rotate-180"}`}
            >
              <path
                d="M10.157 9.95L8.036 7.828 5.914 9.95 4.5 8.536 8.036 5l3.535 3.536-1.414 1.414zM0 8c0-4.418 3.59-8 8-8 4.418 0 8 3.59 8 8 0 4.418-3.59 8-8 8-4.418 0-8-3.59-8-8zm2 0c0 3.307 2.686 6 6 6 3.307 0 6-2.686 6-6 0-3.307-2.686-6-6-6-3.307 0-6 2.686-6 6z"
                fillRule="evenodd"
              />
            </svg>
          </div>
        </>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute top-2 mt-1 right-0 w-32 bg-white border rounded-lg shadow-lg z-2">
            <div className="p-menu text-sm text-gray-700">
              <p
                className="p-menuitem px-4 py-2 m-0 cursor-pointer gap-2 align-items-center flex hover:bg-orange-100"
                onClick={(e) => onActionSelect(e, "edit", rowData)} // Pass the event, 'edit' action, and rowData
              >
                <svg
                  fill="#000000"
                  width="24"
                  height="24"
                  viewBox="-2.85 -2.85 24.70 24.70"
                  xmlns="http://www.w3.org/2000/svg"
                  class="cf-icon-svg"
                  transform="rotate(0)"
                  stroke="#000000"
                  stroke-width="0.49400000000000005"
                >
                  <g
                    id="SVGRepo_bgCarrier"
                    stroke-width="0"
                    transform="translate(0,0), scale(1)"
                  >
                    <rect
                      x="-2.85"
                      y="-2.85"
                      width="24.70"
                      height="24.70"
                      rx="12.35"
                      fill="#F4F4F4"
                      strokewidth="0"
                    ></rect>
                  </g>
                  <g
                    id="SVGRepo_tracerCarrier"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  ></g>
                  <g id="SVGRepo_iconCarrier">
                    <path d="M9.316 14.722a.477.477 0 0 1-.475.475H1.433a.477.477 0 0 1-.475-.475v-.863a.477.477 0 0 1 .475-.475h7.408a.476.476 0 0 1 .475.475zm-2.767-2.587a.552.552 0 0 1-.392-.163L2.96 8.776a.554.554 0 0 1 .784-.784L6.94 11.19a.554.554 0 0 1-.392.946zm7.33.992L9.435 8.682l1.085-1.084-3.173-3.173-2.97 2.97 3.173 3.172 1.102-1.101 4.445 4.445a.554.554 0 1 0 .784-.784zm-2.33-5.993a.552.552 0 0 1-.391-.162L7.96 3.775a.554.554 0 1 1 .784-.784l3.196 3.197a.554.554 0 0 1-.391.946z"></path>
                  </g>
                </svg>{" "}
                Summons
              </p>
              <p
                className="p-menuitem px-4 py-2 m-0 cursor-pointer gap-2 align-items-center flex hover:bg-orange-100"
                onClick={(e) => onActionSelect(e, "edit", rowData)} // Pass the event, 'edit' action, and rowData
              >
                <svg
                  viewBox="-117.76 -117.76 747.52 747.52"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="#000000"
                  width="24"
                  height="24"
                >
                  <g id="SVGRepo_bgCarrier" stroke-width="0">
                    <rect
                      x="-117.76"
                      y="-117.76"
                      width="747.52"
                      height="747.52"
                      rx="373.76"
                      fill="#F4F4F4"
                      strokewidth="0"
                    ></rect>
                  </g>
                  <g
                    id="SVGRepo_tracerCarrier"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  ></g>
                  <g id="SVGRepo_iconCarrier">
                    <path
                      fill="#000000"
                      d="M147.406 20.03c-1.046-.002-2.094.05-3.156.157-4.238.433-8.576 1.774-12.656 4.125-.008.005-.023-.004-.03 0l-29.783 17.22c-7.858 4.534-12.662 12.15-13.874 19.78-1.212 7.63.62 15.126 4.22 21.47.11.197.227.397.343.593l-11.72 40.22c-1.79 1.224-3.467 2.613-5 4.124-5.196 5.117-9.01 11.83-9.844 19.56-.835 7.732 1.923 16.39 8.406 22.876L98.626 194.5c6.633 6.63 15.296 9.602 23.188 9.03 4.63-.333 8.935-1.755 12.78-3.905l7.095 6.688c-2.305 2.97-4.1 6.49-5.157 10.437l-1.624 6.03 18.063 4.845 1.624-6.063c1.06-3.953 2.712-5.37 5.125-6.437 1.205-.533 2.67-.867 4.28-.938 1.61-.07 3.366.126 5.063.594 3.393.938 6.375 2.963 7.968 5.157 1.594 2.195 2.284 4.266 1.282 8l-1.625 6.032 18.063 4.843 1.625-6.032c2.35-8.762.32-17.56-4.22-23.81-4.537-6.253-11.093-10.28-18.124-12.22-3.514-.97-7.204-1.417-10.905-1.25-1.67.075-3.34.28-5 .625l-10.344-9.75c2.06-3.75 3.42-7.944 3.75-12.438.586-7.917-2.42-16.574-9.093-23.25l-24.343-24.312c-4.677-4.68-10.516-7.357-16.313-8.156l6.157-21.095c.177.072.353.15.532.22 7.25 2.806 16.336 2.394 24.28-2.19l29.813-17.186c6.104-3.528 10.526-8.694 12.968-14.345l21.095 5.938c-.88 3.745-1.122 7.688-.5 11.687 1.194 7.683 6.06 15.35 14 19.938l29.813 17.218c3.8 2.195 7.813 3.47 11.78 3.97L255 140.78c-2.735 1.553-5.224 3.477-7.438 5.657-5.195 5.12-8.977 11.833-9.812 19.563-.835 7.73 1.89 16.39 8.375 22.875l4.22 4.22 13.218-13.22-4.22-4.22c-2.893-2.893-3.314-5.032-3.03-7.655.283-2.623 1.867-5.78 4.375-8.25 2.507-2.47 5.77-4.06 8.468-4.344.337-.035.68-.052 1-.062 2.252-.07 4.17.544 6.563 2.937v.032l4.217 4.188 13.188-13.188-4.188-4.218c-4.76-4.763-10.75-7.442-16.656-8.188l-3.25-18.28c4.92-2.895 8.87-7.066 11.658-11.845 3.74-6.412 5.516-14.137 4.03-21.936-1.484-7.8-6.637-15.374-14.812-20.094l-29.78-17.188c-3.93-2.27-8.145-3.506-12.282-3.812-4.137-.306-8.206.305-11.813 1.688-4.304 1.65-8.01 4.21-11.093 7.343l-29.093-8.186c-.762-3.026-1.937-5.915-3.47-8.594-3.684-6.445-9.47-11.856-16.968-14.47-2.81-.98-5.862-1.488-9-1.5zm-.187 18.564c1.063.03 2.05.252 3.03.593 2.614.912 5.225 3.153 6.906 6.094 1.682 2.942 2.312 6.365 1.78 9.126-.528 2.756-1.805 5.11-5.717 7.375-.01.006-.024-.004-.032 0l-29.782 17.19c-3.545 2.044-5.726 1.89-8.187.936-.648-.25-1.318-.603-1.97-1.03l.094-.345-.906-.25c-1.53-1.183-2.977-2.804-4.063-4.718-1.737-3.06-2.425-6.634-2-9.312.425-2.678 1.4-4.598 4.75-6.53v-.032l29.78-17.188h.032c2.02-1.166 3.688-1.72 5.188-1.875.375-.038.74-.04 1.094-.03zM226.5 62.22c.31-.02.618-.024.938 0 1.276.09 2.637.53 4.312 1.5v.03l29.813 17.188c4.04 2.332 5.294 4.686 5.812 7.406.518 2.72-.138 6.105-1.844 9.03-1.705 2.927-4.343 5.174-7 6.095-2.654.92-5.316 1.02-9.25-1.25L219.47 85c-3.544-2.048-4.47-3.985-4.876-6.594-.406-2.608.28-6.09 2.062-9.125 1.783-3.034 4.532-5.435 7.063-6.405.948-.364 1.85-.598 2.78-.656zM98.344 136.624c2.246-.065 4.14.575 6.53 2.97l24.345 24.31c3.296 3.3 3.89 5.896 3.686 8.657-.204 2.762-1.688 5.865-4.094 8.25-2.405 2.386-5.54 3.892-8.343 4.094-2.805.203-5.415-.415-8.626-3.625L87.53 156.97c-2.89-2.895-3.313-5.065-3.03-7.69.283-2.622 1.867-5.778 4.375-8.25 2.508-2.47 5.773-4.06 8.47-4.343.336-.035.678-.053 1-.062zM320 149.875l-62.094 62.094 48.844 48.843 26.938-26.938.343.344c.976-1.104 1.977-2.196 3.033-3.25 27.69-27.693 72.59-27.693 100.28 0 27.205 27.203 27.684 71.022 1.438 98.81-.004.014-.025.02-.03.033-1.03 2.514-1.372 4.965-1.28 7.343.18 4.757 2.415 9.505 5.936 13.063 3.52 3.556 8.17 5.75 12.875 5.936 3.614.144 7.41-.73 11.47-3.625 37.58-42.338 36.114-107.29-4.438-147.842-29.2-29.2-71.177-37.894-108.062-26.563l-5.375 1.656-3.97-3.968L320 149.875zm-11.75 40.688l18.313 18.312-13.22 13.22-18.312-18.314 13.22-13.218zm-186.53 48l-17.876 66.78 36.78 9.844-.124.47c1.445.292 2.9.612 4.344 1 37.828 10.135 60.26 49.015 50.125 86.843-9.962 37.175-47.675 59.485-84.876 50.625-2.695.375-4.986 1.326-7 2.594-4.03 2.533-7.024 6.796-8.344 11.624-1.32 4.828-.908 9.988 1.28 14.156 1.686 3.206 4.35 6.085 8.907 8.156 55.445 11.366 110.96-22.407 125.813-77.78.003-.01-.003-.022 0-.032 10.673-39.878-2.783-80.572-31.03-106.844l-4.126-3.844 1.437-5.437 9.5-35.44-84.81-22.717zm159.655 23.28c-6.083 33.48 3.736 69.08 29.72 95.063 36.204 36.205 91.507 41.554 133.06 15.625-5.342-2.01-10.13-5.214-14.06-9.186-5.135-5.186-8.89-11.79-10.47-19.156-26.67 13.713-60.22 9.406-82.563-12.938-14.735-14.735-21.633-34.33-20.687-53.625l-3 3-6.625 6.625-6.594-6.625-18.78-18.78zm-131.656 4.094l18.06 4.844-6.686 25.033-18.063-4.844 6.69-25.033zm-59.47 17.938c-32.02 11.48-57.93 37.8-67.438 73.28-13.252 49.46 9.77 100.012 53 123.033-.936-5.626-.568-11.36.907-16.75 1.923-7.036 5.783-13.63 11.374-18.688C62.872 428.512 49.82 397.34 58 366.812c5.395-20.134 18.935-35.924 36.125-44.75L90 320.97l-9.03-2.44 2.405-9.03 6.875-25.625z"
                    ></path>
                  </g>
                </svg>{" "}
                Warrants
              </p>
              <p
                className="p-menuitem px-4 py-2 m-0 cursor-pointer gap-2 align-items-center flex hover:bg-orange-100"
                onClick={(e) => onActionSelect(e, "edit", rowData)} // Pass the event, 'edit' action, and rowData
              >
                <svg
                  fill="#000000"
                  width="24"
                  height="24"
                  version="1.1"
                  id="Jury"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="-32 -32 192.00 192.00"
                >
                  <g id="SVGRepo_bgCarrier" stroke-width="0">
                    <rect
                      x="-32"
                      y="-32"
                      width="192.00"
                      height="192.00"
                      rx="96"
                      fill="#F4F4F4"
                      strokewidth="0"
                    ></rect>
                  </g>
                  <g
                    id="SVGRepo_tracerCarrier"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  ></g>
                  <g id="SVGRepo_iconCarrier">
                    {" "}
                    <circle
                      id="_x34__6_"
                      cx="30"
                      cy="39.6"
                      r="6.6"
                    ></circle>{" "}
                    <path
                      id="_x32__11_"
                      d="M44,61v-4.9c0-4.5-3.7-8.2-8.2-8.2H24.2c-4.5,0-8.2,3.7-8.2,8.2V61H44z"
                    ></path>{" "}
                    <circle id="_x34__7_" cx="64" cy="39.6" r="6.6"></circle>{" "}
                    <path
                      id="_x32__12_"
                      d="M78,61v-4.9c0-4.5-3.7-8.2-8.2-8.2H58.2c-4.5,0-8.2,3.7-8.2,8.2V61H78z"
                    ></path>{" "}
                    <circle id="_x34__8_" cx="98" cy="39.6" r="6.6"></circle>{" "}
                    <path
                      id="_x32__13_"
                      d="M112,61v-4.9c0-4.5-3.7-8.2-8.2-8.2H92.2c-4.5,0-8.2,3.7-8.2,8.2V61H112z"
                    ></path>{" "}
                    <path
                      id="_x33__11_"
                      d="M8,65v7.9h8V120h96V72.9h8V65H8z M84.5,98.3c-1.6,2.7-4.5,4.6-7.9,4.6s-6.3-1.8-7.9-4.6l0,0l0,0l0,0l0,0 l6.6-11.4H65.1v20.6h8l4.6,4.6H50.3l4.6-4.6h8V86.9H52.8l6.6,11.4l0,0l0,0c-1.6,2.7-4.5,4.6-7.9,4.6s-6.3-1.8-7.9-4.6l0,0l0,0l0,0 l0,0l7.9-13.7l0,0h11.4V76h2.3v8.6h11.4l0,0L84.5,98.3L84.5,98.3L84.5,98.3z"
                    ></path>{" "}
                    <polygon
                      id="_x32__19_"
                      points="71.3,98.3 81.8,98.3 76.5,89.2 "
                    ></polygon>{" "}
                    <polygon
                      id="_x31__8_"
                      points="46.2,98.3 56.6,98.3 51.4,89.2 "
                    ></polygon>{" "}
                  </g>
                </svg>{" "}
                Proclamation
              </p>
            </div>
          </div>
        )}
      </div>
    );
  };

  const handleActionSelect = (e, action, rowData) => {
    e.stopPropagation(); // To prevent the event from bubbling up

    if (action === "edit") {
      // Handle edit logic
      // setSelectedCase(rowData);
      navigate("/cases/ptview", {
        state: { caseDetails: rowData, mode: "edit" },
      });
    } else if (action === "delete") {
      // Handle delete logic
      console.log("Deleting:", rowData);
      // setSelectedCase(rowData);
      // setIsDeleteModalOpen(true);
      // Call API to delete the record, then update state or table data accordingly
    }
  };

  const handleDropdownToggle = (index) => {
    setOpenDropdownIndex((prev) => (prev === index ? null : index));
  };

  //crerate a accusedTable with dynamic row creation
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
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton color="error" onClick={() => handleAccusedDeleteRowList(row.id)}>
                          <DeleteIcon />
                        </IconButton>
                        <ActionDropdown
                          isOpen={openDropdownIndex === row.id}
                          onToggle={() => handleDropdownToggle(row.id)}
                          rowData={accusedList}
                          onActionSelect={handleActionSelect}
                        />
                      </div>
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
                    onClick={() => setAccusedVisible(true)}
                  >

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
                        <rect
                          x="4"
                          y="4"
                          width="16"
                          height="16"
                          fill="#D9D9D9"
                        />
                      </mask>
                      <g mask="url(#mask0_871_14335)">
                        <path
                          d="M9.24997 15.6673C8.6303 15.6673 8.04036 15.522 7.48013 15.2313C6.91991 14.9408 6.4513 14.5348 6.0743 14.0135C5.76152 13.581 5.52652 13.0729 5.3693 12.4892C5.21197 11.9054 5.1333 11.2537 5.1333 10.534C5.1333 9.93654 5.34441 9.42054 5.76663 8.98598C6.18886 8.55132 6.68541 8.33398 7.2563 8.33398C7.37519 8.33398 7.4983 8.34298 7.62563 8.36098C7.75297 8.37887 7.87263 8.41132 7.98463 8.45832L12 9.97632L16.0153 8.45832C16.1273 8.41132 16.247 8.37887 16.3743 8.36098C16.5016 8.34298 16.6247 8.33398 16.7436 8.33398C17.3145 8.33398 17.8111 8.55132 18.2333 8.98598C18.6555 9.42054 18.8666 9.93654 18.8666 10.534C18.8666 11.2537 18.788 11.9054 18.6306 12.4892C18.4734 13.0729 18.244 13.581 17.9423 14.0135C17.5653 14.5348 17.0967 14.9408 16.5365 15.2313C15.9762 15.522 15.3863 15.6673 14.7666 15.6673C14.0932 15.6673 13.5118 15.5034 13.0225 15.1757L12.2885 14.684H11.7115L10.9775 15.1757C10.4881 15.5034 9.9123 15.6673 9.24997 15.6673ZM9.6833 13.1237C9.95763 13.1237 10.1745 13.0662 10.334 12.9513C10.4933 12.8363 10.573 12.6694 10.573 12.4507C10.5687 12.0831 10.3141 11.7263 9.80897 11.3802C9.30386 11.034 8.77863 10.861 8.2333 10.861C7.95897 10.861 7.74313 10.924 7.5858 11.05C7.42858 11.1761 7.34997 11.343 7.34997 11.5507C7.3543 11.9224 7.60791 12.2775 8.1108 12.616C8.6138 12.9544 9.13797 13.1237 9.6833 13.1237ZM14.2666 13.1403C14.812 13.1403 15.34 12.9673 15.8506 12.6212C16.3613 12.275 16.6187 11.9182 16.623 11.5507C16.623 11.3361 16.545 11.1703 16.3891 11.0532C16.2331 10.9362 16.0201 10.8777 15.75 10.8777C15.1534 10.8819 14.597 11.0754 14.0808 11.4583C13.5646 11.8412 13.3487 12.2275 13.4333 12.6173C13.4777 12.7805 13.5714 12.9085 13.7141 13.0013C13.8568 13.094 14.041 13.1403 14.2666 13.1403Z"
                          fill="#1C1B1F"
                        />
                      </g>
                    </svg>{" "}
                    Accused
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
                    onClick={() => setWitnessModalView(true)}
                  >
                    <svg
                      fill="#000000"
                      width="24"
                      height="24"
                      version="1.1"
                      id="Capa_1"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="-134.27 -134.27 731.54 731.54"
                    >
                      <g id="SVGRepo_bgCarrier" stroke-width="0">
                        <rect
                          x="-134.27"
                          y="-134.27"
                          width="731.54"
                          height="731.54"
                          rx="365.77"
                          fill="#F4F4F4"
                          strokewidth="0"
                        ></rect>
                      </g>
                      <g
                        id="SVGRepo_tracerCarrier"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      ></g>
                      <g id="SVGRepo_iconCarrier">
                        {" "}
                        <g>
                          {" "}
                          <path d="M343,417.234V229.766c9.29-3.138,16-11.93,16-22.266s-6.71-19.128-16-22.266v-59.107c0-6.277-2.444-12.179-6.883-16.617 l-11.313-11.313c-2.93-2.929-7.678-2.929-10.607,0c-2.929,2.929-2.929,7.678,0,10.606l11.313,11.313 c1.606,1.605,2.49,3.74,2.49,6.011V184h-17v-31.202c0-11.667-6.399-22.16-16.369-27.612c-0.551-1.889-7.637-27.078-7.637-69.687 c0-30.599-24.891-55.493-55.488-55.499c-0.002,0-0.004,0-0.006,0c-0.001,0-0.002,0-0.003,0s-0.002,0-0.003,0 c-0.002,0-0.004,0-0.006,0C200.891,0.007,176,24.901,176,55.5c0,42.68-7.111,67.886-7.637,69.69 C158.397,130.643,152,141.134,152,152.798V184h-24.5c-12.958,0-23.5,10.542-23.5,23.5c0,10.336,6.71,19.128,16,22.266v187.469 c-9.29,3.138-16,11.93-16,22.266c0,12.958,10.542,23.5,23.5,23.5h208c12.958,0,23.5-10.542,23.5-23.5 C359,429.164,352.29,420.372,343,417.234z M135,416V231h193v185H135z M231.5,104c-17.921,0-32.5-18.168-32.5-40.5v-4.826 c14.666,4.808,31.193,6.158,45.062,6.158c7.735,0,14.638-0.417,19.929-0.881C263.795,86.075,249.299,104,231.5,104z M189.5,89.383 c2.682,5.916,6.25,11.199,10.5,15.609v2.976c0,3.665-2.336,6.905-5.813,8.064l-8.935,2.978 C186.649,112.2,188.32,102.242,189.5,89.383z M213.908,115.038c5.445,2.547,11.378,3.962,17.592,3.962s12.147-1.416,17.592-3.962 c1.704,5.413,5.326,10.048,10.215,13.012c-5.449,8.317-18.033,20.758-27.807,29.497c-9.776-8.741-22.362-21.183-27.808-29.497 C208.582,125.086,212.204,120.451,213.908,115.038z M268.813,116.032c-3.477-1.159-5.813-4.4-5.813-8.064v-2.976 c4.247-4.407,7.814-9.686,10.495-15.598c1.18,12.853,2.849,22.806,4.246,29.615L268.813,116.032z M231.497,15 c19.786,0.001,36.292,14.269,39.799,33.053c-7.31,0.991-51.122,6.172-77.353-7.683C199.95,25.514,214.514,15.001,231.497,15z M167,152.798c0-7.113,4.534-13.404,11.282-15.653l11.15-3.717c8.64,15.303,34.159,37.198,37.216,39.791 c1.399,1.188,3.125,1.781,4.852,1.781c1.726,0,3.452-0.594,4.852-1.781c3.057-2.593,28.568-24.481,37.216-39.791l11.151,3.717 c6.748,2.249,11.282,8.54,11.282,15.653V184h-17v-8.5c0-4.142-3.357-7.5-7.5-7.5s-7.5,3.358-7.5,7.5v8.5h-65v-8.5 c0-4.142-3.357-7.5-7.5-7.5s-7.5,3.358-7.5,7.5v8.5h-17V152.798z M127.5,199h208c4.687,0,8.5,3.813,8.5,8.5s-3.813,8.5-8.5,8.5 h-208c-4.687,0-8.5-3.813-8.5-8.5S122.813,199,127.5,199z M335.5,448h-208c-4.687,0-8.5-3.813-8.5-8.5s3.813-8.5,8.5-8.5h208 c4.687,0,8.5,3.813,8.5,8.5S340.187,448,335.5,448z"></path>{" "}
                          <path d="M302.5,248h-142c-4.687,0-8.5,3.813-8.5,8.5v134c0,4.687,3.813,8.5,8.5,8.5h142c4.687,0,8.5-3.813,8.5-8.5v-134 C311,251.813,307.187,248,302.5,248z M296,384H167V263h129V384z"></path>{" "}
                        </g>{" "}
                      </g>
                    </svg>{" "}
                    Witness
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
                    onClick={() => navigate("/annexure", { state: { from: 'PTview' } })}
                  >
                    <svg
                      fill="#000000"
                      width="20"
                      height="20"
                      version="1.1"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="-140.63 -140.63 720.74 720.74"
                      enable-background="new 0 0 439.479 439.479"
                    >
                      <g id="SVGRepo_bgCarrier" stroke-width="0">
                        <rect
                          x="-140.63"
                          y="-140.63"
                          width="720.74"
                          height="720.74"
                          rx="360.37"
                          fill="#F4F4F4"
                          strokewidth="0"
                        ></rect>
                      </g>
                      <g
                        id="SVGRepo_tracerCarrier"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      ></g>
                      <g id="SVGRepo_iconCarrier">
                        {" "}
                        <g>
                          {" "}
                          <path d="m407.18,60.082h-374.882c-17.81,0-32.298,14.489-32.298,32.299v226.626c0,17.81 14.488,32.299 32.298,32.299h106.252l-12.162,13.091h-18.23c-4.143,0-7.5,3.358-7.5,7.5s3.357,7.5 7.5,7.5h223.162c4.143,0 7.5-3.358 7.5-7.5s-3.357-7.5-7.5-7.5h-18.23l-12.162-13.091h106.252c17.81,0 32.299-14.489 32.299-32.299v-226.626c0-17.81-14.49-32.299-32.299-32.299zm-392.18,250.422v-209.62h409.479v209.621h-409.479zm17.298-235.423h374.882c7.24,0 13.447,4.475 16.021,10.801h-406.924c2.575-6.325 8.781-10.801 16.021-10.801zm260.318,289.314h-145.754l12.162-13.091h121.43l12.162,13.091zm114.564-28.09h-374.882c-7.24,0-13.446-4.475-16.021-10.801h406.924c-2.575,6.325-8.781,10.801-16.021,10.801z"></path>{" "}
                          <path d="m374.171,159.137c-9.064-9.064-23.814-9.065-32.879,0-4.392,4.391-6.811,10.23-6.811,16.44 0,3.34 0.721,6.562 2.051,9.52l-59.872,47.207c-6.806-3.618-15.042-3.618-21.847,0l-59.883-47.216c3.825-8.549 2.259-18.944-4.748-25.95-9.065-9.064-23.813-9.066-32.88,0-7.006,7.007-8.573,17.401-4.748,25.95l-59.883,47.216c-8.789-4.672-19.965-3.317-27.363,4.08-9.064,9.065-9.064,23.814 0,32.879 4.533,4.532 10.486,6.799 16.439,6.799 5.954,0 11.907-2.266 16.44-6.799 7.006-7.007 8.573-17.401 4.748-25.95l59.883-47.216c3.403,1.809 7.162,2.719 10.923,2.719 3.762,0 7.521-0.91 10.924-2.719l59.883,47.216c-3.825,8.549-2.259,18.944 4.748,25.95 4.533,4.533 10.485,6.798 16.44,6.798 5.952,0 11.907-2.266 16.439-6.798 0,0 0,0 0.001,0 7.006-7.007 8.572-17.401 4.747-25.95l59.884-47.216c3.403,1.809 7.162,2.719 10.924,2.719 5.953,0 11.906-2.266 16.439-6.799 9.065-9.065 9.065-23.815 0.001-32.88zm-286.591,99.519c-3.214,3.216-8.449,3.217-11.665,0-3.217-3.217-3.217-8.45 0-11.666 1.607-1.608 3.72-2.412 5.832-2.412 2.113,0 4.226,0.804 5.833,2.412 3.217,3.216 3.217,8.45 1.42109e-14,11.666zm80.329-77.246c-3.217-3.217-3.217-8.45 0-11.666 1.607-1.608 3.72-2.412 5.832-2.412 2.113,0 4.226,0.804 5.833,2.412 3.217,3.217 3.217,8.45 0,11.666-3.213,3.216-8.448,3.217-11.665,0zm103.661,77.246c-3.217,3.217-8.452,3.216-11.667,0-3.217-3.217-3.217-8.45 0-11.666 1.607-1.608 3.72-2.412 5.833-2.412 2.112,0 4.226,0.804 5.833,2.412 3.217,3.216 3.217,8.45 0.001,11.666zm91.993-77.246c-3.215,3.216-8.449,3.216-11.666,0-1.559-1.558-2.416-3.629-2.416-5.833 0-2.203 0.857-4.275 2.417-5.833 1.607-1.608 3.72-2.412 5.833-2.412 2.112,0 4.225,0.804 5.832,2.412 3.217,3.216 3.217,8.449 0,11.666z"></path>{" "}
                        </g>{" "}
                      </g>
                    </svg>{" "}
                    Trial Monitoring
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
                    onClick={() => setFurtherInvestigationVisible(true)}
                  >
                    <svg
                      fill="#000000"
                      width="20"
                      height="20"
                      version="1.1"
                      id="Capa_1"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="-152.36 -152.36 796.21 796.21"
                    >
                      <g
                        id="SVGRepo_bgCarrier"
                        stroke-width="0"
                        transform="translate(0,0), scale(1)"
                      >
                        <rect
                          x="-152.36"
                          y="-152.36"
                          width="796.21"
                          height="796.21"
                          rx="398.105"
                          fill="#F4F4F4"
                          strokewidth="0"
                        ></rect>
                      </g>
                      <g
                        id="SVGRepo_tracerCarrier"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      ></g>
                      <g id="SVGRepo_iconCarrier">
                        {" "}
                        <g>
                          {" "}
                          <g>
                            {" "}
                            <path d="M39.302,138.132c3.291,0.714,6.346,0.662,15.728-6.54c4.168-3.204,10.325-8.59,16.01-16.117l2.491-3.301 C94.832,83.842,144.7,17.512,216.727,21.121c59.398,4.331,101.508,49.187,121.757,129.725c0.691,2.738,1.107,4.413,1.571,5.71 c3.097,13.167,8.288,29.575,15.771,34.98c1.848,1.34,3.999,1.98,6.127,1.98c3.246,0,6.461-1.505,8.509-4.347 c3.274-4.533,2.404-10.805-1.891-14.28c-2.069-2.68-5.959-13.888-8.276-23.913c-0.136-0.597-0.33-1.173-0.566-1.732 c-0.195-0.686-0.568-2.18-0.908-3.517c-3.209-12.77-11.735-46.678-32.417-78.567c-26.712-41.183-63.142-63.718-108.283-66.97 c-0.07-0.011-0.14-0.011-0.221-0.011C134.7-4.07,80.083,68.559,56.768,99.568l-2.451,3.257 c-6.383,8.44-13.925,13.694-16.524,15.215c-0.875,0.351-1.727,0.821-2.518,1.417c-3.263,2.472-4.857,6.689-3.979,10.685 C32.175,134.132,35.301,137.257,39.302,138.132z"></path>{" "}
                            <path d="M43.97,245.815c34.618-9.417,66.601-28.597,68-29.437c45.162-27.656,86.126-71.235,86.469-71.646 c16.91-19.369,41.931-37.94,61.447-31.966c11.491,3.519,19.46,9.777,23.681,18.605c5.056,10.563,4.663,24.853-1.075,39.198 c-0.605,1.515-1.295,3.05-2.046,4.599c7.374,0.396,14.57,1.464,21.534,3.136c7.892-19.76,8.087-40.166,0.501-55.993 c-6.753-14.137-19.363-24.372-36.447-29.605c-25.08-7.675-55.478,6.251-83.33,38.163c-0.354,0.392-40,42.09-81.631,67.583 c-0.305,0.184-30.782,18.461-62.61,27.139c-5.589,1.515-8.885,7.286-7.364,12.866C32.613,244.047,38.377,247.349,43.97,245.815z"></path>{" "}
                            <path d="M153.876,295.054c0-4.156,0.213-8.263,0.627-12.312c-29.438,17.887-67.814,39.939-97.787,52.746 c-5.327,2.28-7.796,8.434-5.522,13.768c1.705,3.986,5.576,6.369,9.65,6.369c1.377,0,2.777-0.275,4.122-0.842 c27.386-11.718,61.274-30.707,89.523-47.556C154.084,303.224,153.876,299.162,153.876,295.054z"></path>{" "}
                            <path d="M228.386,44.899c-37.917,3.934-70.342,27.636-95.327,55.151c-4.757,5.246-9.028,10.879-13.631,16.25 c-6.023,7.042-12.607,13.623-19.485,19.829c-7.069,6.386-12.791,10.948-21.127,15.746c-8.847,5.068-17.865,10.201-27.027,14.666 c-3.153,1.54-5.865,2.534-9.41,3.601c-5.467,1.646-8.863,7.289-7.321,12.902c1.483,5.411,7.424,8.975,12.902,7.332 c10.722-3.23,20.441-8.752,30.117-14.252c8.183-4.646,16.301-8.833,23.813-14.55c14.65-11.135,27.252-24.137,38.844-38.373 c4.697-5.765,9.713-11.251,14.96-16.525c2.861-2.876,5.818-5.649,8.844-8.366c1.573-1.41,3.172-2.782,4.793-4.149 c0.818-0.686,1.647-1.367,2.485-2.045c0.213-0.178,1.843-1.461,2.255-1.793c7.305-5.595,15.087-10.568,23.275-14.771 c7.734-3.979,15.49-6.756,24.902-8.721c3.123-0.648,3.803-0.718,6.138-0.956c5.683-0.586,10.487-4.328,10.487-10.484 C238.873,50.111,234.08,44.309,228.386,44.899z"></path>{" "}
                            <path d="M51.445,300.867c13.922-4.779,63.021-22.953,114.054-57.316c14.353-30.099,40.872-53.322,73.158-63.269 c6.34-7.227,12.397-14.798,18.062-22.738c3.358-4.713,2.269-11.257-2.449-14.628c-4.716-3.363-11.271-2.267-14.635,2.448 C177.851,231.979,66.355,273.567,44.628,281.041c-0.464,0.15-0.751,0.248-0.851,0.281c-5.417,2.062-8.145,8.114-6.092,13.528 c1.588,4.192,5.576,6.765,9.814,6.765c1.184,0,2.396-0.195,3.574-0.617L51.445,300.867z"></path>{" "}
                            <path d="M170.772,356.402c-3.599-6.029-6.684-12.398-9.196-19.049c-3.44,2.251-7.009,4.598-10.725,7.045 c-26.179,17.262-55.862,36.825-68.769,40.299c-5.592,1.514-8.906,7.262-7.402,12.854c1.261,4.689,5.494,7.764,10.125,7.764 c0.902,0,1.817-0.113,2.725-0.355c16.185-4.367,44.692-23.156,74.873-43.045C165.13,360.115,167.935,358.268,170.772,356.402z"></path>{" "}
                            <path d="M310.556,414.672c-2.114-0.764-4.56-1.867-7.245-3.221c-9.571,2.418-19.445,3.666-29.371,3.666 c-2.133,0-4.251-0.059-6.356-0.168c13.534,8.344,26.191,15.965,35.858,19.467c5.435,1.967,11.453-0.854,13.42-6.311 C318.829,422.646,316.013,416.639,310.556,414.672z"></path>{" "}
                            <path d="M190.69,381.482c-14.76,9.119-34.594,23.168-60.247,41.904c-5.6,4.078-10.431,7.605-13.783,9.979 c-4.725,3.35-5.854,9.887-2.518,14.619c2.054,2.891,5.29,4.438,8.577,4.438c2.091,0,4.204-0.627,6.041-1.918 c3.484-2.465,8.376-6.045,14.047-10.168c14.189-10.367,46.716-34.113,65.317-44.916 C201.887,391.313,196.05,386.646,190.69,381.482z"></path>{" "}
                            <path d="M275.142,466.809c-5.896-3.846-11.304-7.715-16.556-11.441c-17.191-12.291-32.06-22.904-48.355-20.066 c-18.35,3.17-47.568,32.557-53.244,38.402c-4.028,4.166-3.917,10.807,0.243,14.836c2.036,1.961,4.666,2.955,7.286,2.955 c2.744,0,5.483-1.064,7.537-3.193c14.047-14.512,34.003-30.99,41.745-32.33c7.65-1.318,19.229,6.916,32.611,16.469 c5.155,3.684,11.001,7.844,17.269,11.939c4.847,3.166,11.352,1.799,14.517-3.053C281.355,476.469,279.982,469.98,275.142,466.809z "></path>{" "}
                            <path d="M454.778,451.717l-94.13-94.131c14.188-17.851,22.678-40.424,22.678-64.946c0-57.654-46.905-104.559-104.559-104.559 S174.208,234.986,174.208,292.64c0,57.653,46.905,104.558,104.559,104.558c18.336,0,35.58-4.75,50.578-13.074l96.514,96.514 c3.993,3.992,9.226,5.988,14.459,5.988c5.232,0,10.467-1.996,14.459-5.988C462.763,472.65,462.763,459.703,454.778,451.717z M227.075,346.916c-0.292,0.918-0.792,1.377-1.5,1.377c-0.158,0-0.303-0.029-0.44-0.076c-0.283-0.272-0.576-0.536-0.855-0.814 c-0.071-0.137-0.142-0.275-0.198-0.443c-0.297-0.891-0.445-2.521-0.445-4.896c0-2.392,0.148-4.038,0.445-4.938 c0.296-0.898,0.794-1.349,1.493-1.349c0.698,0,1.196,0.466,1.493,1.4c0.296,0.933,0.444,2.562,0.444,4.887 C227.513,344.381,227.367,345.998,227.075,346.916z M345.676,331.262c-2.321,0.104-4.072,0.961-5.237,2.591 c-1.184,1.655-1.798,4.224-1.854,7.677c-1.501,1.834-3.088,3.592-4.749,5.279v-15.268h-5.11l-7.205,5.871l2.941,3.619l2.383-1.968 c0.526-0.469,0.967-0.918,1.321-1.349c-0.058,1.119-0.086,2.354-0.086,3.703v10.691c-13.392,11.123-30.583,17.822-49.312,17.822 c-18.805,0-36.057-6.758-49.473-17.961c0.786-0.424,1.454-1,1.992-1.747c1.244-1.728,1.866-4.447,1.866-8.16 c0-3.589-0.638-6.29-1.916-8.103c-1.277-1.813-3.165-2.721-5.663-2.721c-2.565,0-4.469,0.871-5.713,2.612 c-1.048,1.467-1.648,3.647-1.814,6.526c-0.971-1.232-1.909-2.492-2.806-3.783c-0.307-1.021-0.713-1.904-1.229-2.637 c-0.415-0.59-0.902-1.072-1.447-1.471c-5.081-8.41-8.606-17.857-10.172-27.947c0.094,0.156,0.185,0.315,0.287,0.461 c1.272,1.804,3.163,2.705,5.67,2.705c2.564,0,4.469-0.863,5.713-2.59c1.244-1.728,1.866-4.447,1.866-8.162 c0-3.588-0.639-6.289-1.916-8.103s-3.165-2.72-5.663-2.72c-2.565,0-4.469,0.871-5.713,2.611c-0.46,0.645-0.833,1.426-1.123,2.34 c0.2-10.092,2.322-19.724,6.051-28.521c0.256,0.021,0.515,0.037,0.785,0.037c2.564,0,4.469-0.864,5.713-2.591 c1.244-1.727,1.866-4.447,1.866-8.16c0-1.377-0.096-2.62-0.284-3.734c14.01-19.804,37.074-32.771,63.123-32.771 c25.082,0,47.402,12.017,61.532,30.587l-1.556,1.268l2.942,3.617l1.327-1.096c0.799,1.191,1.558,2.41,2.29,3.648v8.944h4.553 c3.988,9.315,6.205,19.565,6.205,30.324C356.061,306.703,352.268,319.89,345.676,331.262z M206.413,296.957 c0-2.392,0.148-4.037,0.445-4.938c0.296-0.898,0.794-1.35,1.493-1.35c0.698,0,1.196,0.467,1.493,1.398 c0.296,0.934,0.445,2.562,0.445,4.889c0,2.315-0.146,3.933-0.438,4.853c-0.292,0.918-0.792,1.378-1.5,1.378 c-0.699,0-1.197-0.445-1.493-1.336C206.56,300.963,206.413,299.332,206.413,296.957z"></path>{" "}
                            <path d="M223.494,248.852c0.526-0.469,0.967-0.918,1.321-1.35c-0.057,1.121-0.086,2.354-0.086,3.703v11.11h5.756V241.33h-5.11 l-7.206,5.872l2.943,3.617L223.494,248.852z"></path>{" "}
                            <path d="M242.801,241.029c-2.565,0-4.469,0.871-5.713,2.613c-1.245,1.741-1.867,4.479-1.867,8.21c0,3.561,0.637,6.242,1.91,8.045 c1.272,1.805,3.162,2.706,5.67,2.706c2.565,0,4.469-0.864,5.712-2.591c1.243-1.727,1.865-4.447,1.865-8.16 c0-3.588-0.639-6.289-1.916-8.103C247.186,241.935,245.297,241.029,242.801,241.029z M244.301,256.703 c-0.292,0.92-0.792,1.379-1.5,1.379c-0.699,0-1.196-0.445-1.493-1.336c-0.297-0.89-0.445-2.521-0.445-4.895 c0-2.393,0.148-4.038,0.445-4.938c0.297-0.9,0.794-1.351,1.493-1.351c0.698,0,1.196,0.468,1.493,1.399 c0.297,0.933,0.445,2.562,0.445,4.888C244.738,254.168,244.592,255.785,244.301,256.703z"></path>{" "}
                            <path d="M257.944,248.852c0.526-0.469,0.967-0.918,1.32-1.35c-0.059,1.121-0.086,2.354-0.086,3.703v11.11h5.756V241.33h-5.11 l-7.206,5.872l2.942,3.617L257.944,248.852z"></path>{" "}
                            <path d="M277.25,241.029c-2.564,0-4.469,0.871-5.712,2.613c-1.244,1.741-1.866,4.479-1.866,8.21c0,3.561,0.638,6.242,1.909,8.045 c1.273,1.805,3.163,2.706,5.67,2.706c2.565,0,4.47-0.864,5.713-2.591c1.244-1.727,1.866-4.447,1.866-8.16 c0-3.588-0.639-6.289-1.917-8.103C281.635,241.935,279.748,241.029,277.25,241.029z M278.75,256.703 c-0.292,0.92-0.792,1.379-1.5,1.379c-0.697,0-1.195-0.445-1.493-1.336c-0.297-0.89-0.444-2.521-0.444-4.895 c0-2.393,0.147-4.038,0.444-4.938c0.298-0.9,0.795-1.351,1.493-1.351c0.699,0,1.196,0.468,1.493,1.399 c0.297,0.933,0.445,2.562,0.445,4.888C279.189,254.168,279.042,255.785,278.75,256.703z"></path>{" "}
                            <path d="M294.476,241.029c-2.564,0-4.47,0.871-5.713,2.613c-1.244,1.741-1.866,4.479-1.866,8.21c0,3.561,0.637,6.242,1.91,8.045 c1.271,1.805,3.163,2.706,5.669,2.706c2.564,0,4.469-0.864,5.713-2.591s1.866-4.447,1.866-8.16c0-3.588-0.64-6.289-1.917-8.103 C298.861,241.936,296.974,241.029,294.476,241.029z M295.976,256.703c-0.292,0.92-0.792,1.379-1.5,1.379 c-0.699,0-1.196-0.445-1.493-1.336c-0.296-0.89-0.444-2.521-0.444-4.895c0-2.393,0.148-4.038,0.444-4.938 c0.297-0.9,0.794-1.351,1.493-1.351c0.697,0,1.196,0.468,1.493,1.399c0.297,0.933,0.444,2.562,0.444,4.888 C296.414,254.168,296.267,255.785,295.976,256.703z"></path>{" "}
                            <path d="M309.62,248.852c0.526-0.469,0.967-0.918,1.321-1.35c-0.058,1.121-0.086,2.354-0.086,3.703v11.11h5.756V241.33h-5.11 l-7.207,5.872l2.943,3.617L309.62,248.852z"></path>{" "}
                            <path d="M321.519,247.201l2.941,3.617l2.383-1.967c0.526-0.469,0.966-0.918,1.321-1.35c-0.058,1.121-0.086,2.354-0.086,3.703 v11.11h5.756V241.33h-5.109L321.519,247.201z"></path>{" "}
                            <path d="M225.575,286.135c-2.565,0-4.469,0.871-5.713,2.611c-1.244,1.742-1.866,4.479-1.866,8.211 c0,3.561,0.636,6.242,1.909,8.045c1.273,1.805,3.163,2.707,5.67,2.707c2.565,0,4.469-0.865,5.713-2.592s1.866-4.447,1.866-8.16 c0-3.588-0.638-6.289-1.916-8.104C229.959,287.039,228.073,286.135,225.575,286.135z M227.075,301.811 c-0.292,0.918-0.792,1.378-1.5,1.378c-0.699,0-1.196-0.444-1.493-1.336c-0.297-0.89-0.445-2.521-0.445-4.896 c0-2.392,0.148-4.037,0.445-4.938c0.296-0.898,0.794-1.35,1.493-1.35c0.698,0,1.196,0.467,1.493,1.398 c0.296,0.934,0.444,2.562,0.444,4.889C227.513,299.273,227.367,300.891,227.075,301.811z"></path>{" "}
                            <path d="M241.954,307.422h5.756v-20.985h-5.11l-7.206,5.871l2.942,3.616l2.383-1.967c0.526-0.467,0.966-0.918,1.32-1.349 c-0.058,1.12-0.086,2.354-0.086,3.703L241.954,307.422L241.954,307.422z"></path>{" "}
                            <path d="M260.025,286.135c-2.564,0-4.469,0.871-5.713,2.611c-1.244,1.742-1.866,4.479-1.866,8.211 c0,3.561,0.636,6.242,1.909,8.045c1.272,1.805,3.163,2.707,5.67,2.707c2.564,0,4.469-0.865,5.713-2.592 c1.245-1.727,1.866-4.447,1.866-8.16c0-3.588-0.64-6.289-1.916-8.104C264.411,287.041,262.523,286.135,260.025,286.135z M261.526,301.811c-0.292,0.918-0.792,1.378-1.5,1.378c-0.699,0-1.196-0.444-1.493-1.336c-0.296-0.89-0.444-2.521-0.444-4.896 c0-2.392,0.148-4.037,0.444-4.938c0.297-0.898,0.794-1.35,1.493-1.35c0.698,0,1.196,0.467,1.493,1.398 c0.296,0.934,0.443,2.562,0.443,4.889C261.962,299.273,261.817,300.891,261.526,301.811z"></path>{" "}
                            <path d="M269.844,292.308l2.941,3.616l2.383-1.967c0.526-0.467,0.967-0.918,1.32-1.349c-0.057,1.12-0.086,2.354-0.086,3.703v11.11 h5.756v-20.985h-5.11L269.844,292.308z"></path>{" "}
                            <path d="M294.476,286.135c-2.564,0-4.47,0.871-5.713,2.611c-1.244,1.742-1.866,4.479-1.866,8.211c0,3.561,0.637,6.242,1.91,8.045 c1.271,1.805,3.163,2.707,5.669,2.707c2.564,0,4.469-0.865,5.713-2.592s1.866-4.447,1.866-8.16c0-3.588-0.64-6.289-1.917-8.104 C298.861,287.041,296.974,286.135,294.476,286.135z M295.976,301.811c-0.292,0.918-0.792,1.378-1.5,1.378 c-0.699,0-1.196-0.444-1.493-1.336c-0.296-0.89-0.444-2.521-0.444-4.896c0-2.392,0.148-4.037,0.444-4.938 c0.297-0.898,0.794-1.35,1.493-1.35c0.697,0,1.196,0.467,1.493,1.398c0.297,0.934,0.444,2.562,0.444,4.889 C296.414,299.273,296.267,300.891,295.976,301.811z"></path>{" "}
                            <path d="M311.701,286.135c-2.565,0-4.469,0.871-5.713,2.611c-1.244,1.742-1.866,4.479-1.866,8.211 c0,3.561,0.636,6.242,1.909,8.045c1.271,1.805,3.163,2.707,5.67,2.707c2.563,0,4.469-0.865,5.713-2.592s1.866-4.447,1.866-8.16 c0-3.588-0.64-6.289-1.916-8.104C316.086,287.039,314.199,286.135,311.701,286.135z M313.201,301.811 c-0.292,0.918-0.792,1.378-1.5,1.378c-0.699,0-1.197-0.444-1.493-1.336c-0.297-0.89-0.445-2.521-0.445-4.896 c0-2.392,0.148-4.037,0.445-4.938c0.296-0.898,0.794-1.35,1.493-1.35c0.698,0,1.196,0.467,1.493,1.398 c0.296,0.934,0.443,2.562,0.443,4.889C313.638,299.273,313.493,300.891,313.201,301.811z"></path>{" "}
                            <path d="M321.519,292.308l2.941,3.616l2.383-1.967c0.526-0.467,0.966-0.918,1.321-1.349c-0.058,1.12-0.086,2.354-0.086,3.703 v11.11h5.756v-20.985h-5.109L321.519,292.308z"></path>{" "}
                            <path d="M346.151,286.135c-2.565,0-4.47,0.871-5.713,2.611c-1.245,1.742-1.866,4.479-1.866,8.211c0,3.561,0.637,6.242,1.909,8.045 c1.272,1.805,3.162,2.707,5.67,2.707c2.563,0,4.469-0.865,5.713-2.592s1.866-4.447,1.866-8.16c0-3.588-0.639-6.289-1.916-8.104 C350.537,287.041,348.649,286.135,346.151,286.135z M347.651,301.811c-0.292,0.918-0.792,1.378-1.5,1.378 c-0.699,0-1.196-0.444-1.493-1.336c-0.296-0.89-0.444-2.521-0.444-4.896c0-2.392,0.148-4.037,0.444-4.938 c0.297-0.898,0.794-1.35,1.493-1.35c0.697,0,1.195,0.467,1.493,1.398c0.296,0.934,0.443,2.562,0.443,4.889 C348.088,299.273,347.943,300.891,347.651,301.811z"></path>{" "}
                            <path d="M242.801,331.242c-2.565,0-4.469,0.871-5.713,2.611c-1.245,1.742-1.867,4.479-1.867,8.211c0,3.561,0.637,6.242,1.91,8.046 c1.273,1.804,3.162,2.706,5.67,2.706c2.565,0,4.469-0.863,5.712-2.591c1.243-1.728,1.865-4.447,1.865-8.16 c0-3.589-0.639-6.29-1.916-8.103C247.186,332.147,245.297,331.242,242.801,331.242z M244.301,346.916 c-0.292,0.918-0.792,1.377-1.5,1.377c-0.699,0-1.196-0.444-1.493-1.334c-0.297-0.891-0.445-2.521-0.445-4.896 c0-2.392,0.148-4.038,0.445-4.938c0.297-0.898,0.794-1.349,1.493-1.349c0.698,0,1.196,0.466,1.493,1.4 c0.297,0.933,0.445,2.562,0.445,4.887C244.738,344.381,244.592,345.998,244.301,346.916z"></path>{" "}
                            <path d="M252.619,337.414l2.942,3.617l2.383-1.967c0.526-0.469,0.967-0.918,1.32-1.35c-0.059,1.121-0.086,2.354-0.086,3.703v11.11 h5.756v-20.985h-5.11L252.619,337.414z"></path>{" "}
                            <path d="M269.844,337.414l2.941,3.617l2.383-1.967c0.526-0.469,0.967-0.918,1.32-1.35c-0.057,1.121-0.086,2.354-0.086,3.703v11.11 h5.756v-20.985h-5.11L269.844,337.414z"></path>{" "}
                            <path d="M287.069,337.414l2.943,3.617l2.383-1.967c0.525-0.469,0.966-0.918,1.32-1.35c-0.058,1.121-0.087,2.354-0.087,3.703v11.11 h5.757v-20.985h-5.11L287.069,337.414z"></path>{" "}
                            <path d="M311.701,331.242c-2.565,0-4.469,0.871-5.713,2.611c-1.244,1.742-1.866,4.479-1.866,8.211 c0,3.561,0.636,6.242,1.909,8.046c1.271,1.804,3.163,2.706,5.67,2.706c2.563,0,4.469-0.863,5.713-2.591s1.866-4.447,1.866-8.16 c0-3.589-0.64-6.29-1.916-8.103C316.086,332.147,314.199,331.242,311.701,331.242z M313.201,346.916 c-0.292,0.918-0.792,1.377-1.5,1.377c-0.699,0-1.197-0.444-1.493-1.334c-0.297-0.891-0.445-2.521-0.445-4.896 c0-2.392,0.148-4.038,0.445-4.938c0.296-0.898,0.794-1.349,1.493-1.349c0.698,0,1.196,0.466,1.493,1.4 c0.296,0.933,0.443,2.562,0.443,4.887C313.638,344.381,313.493,345.998,313.201,346.916z"></path>{" "}
                          </g>{" "}
                        </g>{" "}
                      </g>
                    </svg>{" "}
                    Further Investigation
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
                    <svg
                      viewBox="-5.28 -5.28 26.56 26.56"
                      fill="none"
                      width="20"
                      height="20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <g id="SVGRepo_bgCarrier" stroke-width="0">
                        <rect
                          x="-5.28"
                          y="-5.28"
                          width="26.56"
                          height="26.56"
                          rx="13.28"
                          fill="#F4F4F4"
                          strokewidth="0"
                        ></rect>
                      </g>
                      <g
                        id="SVGRepo_tracerCarrier"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      ></g>
                      <g id="SVGRepo_iconCarrier">
                        {" "}
                        <path
                          d="M8 7C9.65685 7 11 5.65685 11 4C11 2.34315 9.65685 1 8 1C6.34315 1 5 2.34315 5 4C5 5.65685 6.34315 7 8 7Z"
                          fill="#000000"
                        ></path>{" "}
                        <path
                          d="M14 12C14 10.3431 12.6569 9 11 9H5C3.34315 9 2 10.3431 2 12V15H14V12Z"
                          fill="#000000"
                        ></path>{" "}
                      </g>
                    </svg>{" "}
                    Prosecutors
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
                    <svg
                      fill="#000000"
                      width="20"
                      height="20"
                      version="1.1"
                      id="Icon"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="-7.68 -7.68 39.36 39.36"
                      enable-background="new 0 0 24 24"
                    >
                      <g id="SVGRepo_bgCarrier" stroke-width="0">
                        <rect
                          x="-7.68"
                          y="-7.68"
                          width="39.36"
                          height="39.36"
                          rx="19.68"
                          fill="#F4F4F4"
                          strokewidth="0"
                        ></rect>
                      </g>
                      <g
                        id="SVGRepo_tracerCarrier"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      ></g>
                      <g id="SVGRepo_iconCarrier">
                        {" "}
                        <path d="M12,0C5.37,0,0,5.37,0,12s5.37,12,12,12s12-5.37,12-12S18.63,0,12,0z M13.5,18h-3v-8h3V18z M13.5,8h-3V5h3V8z"></path>{" "}
                      </g>
                    </svg>{" "}
                    Status
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
                    <svg
                      viewBox="-4.2 -4.2 28.40 28.40"
                      width="20"
                      height="20"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                    >
                      <g id="SVGRepo_bgCarrier" stroke-width="0">
                        <rect
                          x="-4.2"
                          y="-4.2"
                          width="28.40"
                          height="28.40"
                          rx="14.2"
                          fill="#F4F4F4"
                          strokewidth="0"
                        ></rect>
                      </g>
                      <g
                        id="SVGRepo_tracerCarrier"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      ></g>
                      <g id="SVGRepo_iconCarrier">
                        {" "}
                        <path
                          fill="#000000"
                          fill-rule="evenodd"
                          d="M4 1a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V7.414A2 2 0 0017.414 6L13 1.586A2 2 0 0011.586 1H4zm0 2h7.586L16 7.414V17H4V3zm2 2a1 1 0 000 2h5a1 1 0 100-2H6zm-1 5a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h8a1 1 0 100-2H6z"
                        ></path>{" "}
                      </g>
                    </svg>{" "}
                    173 (8)
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
          className={modeType === "edit" ? "" : "hidden"}
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
              setSnackbarMessage(` Case updated Successfully and  Requested for Approval.`);
              setSnackbarSeverity('success');
              setOpenSnackbar(true);
              setTimeout(() => {
                navigate("/PTCase");
              }, 1500);
            }}
          >
            Update
          </Button>
        </div>
      </div>
      <div style={{ position: "relative", width: "300px", marginTop: "30px" }}>

        <Dialog
          open={WitnessModalView}
          onClose={() => setWitnessModalView(false)}
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
                Witness
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
                  onClick={handleWitnessRow}
                >
                  Add Witness
                </Button>
              </div>

              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Witness</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Witness.map((row) => (
                      <tr key={row.id}>
                        <td style={{ width: "40%" }}>
                          <DateField
                            field={{
                              name: `Witness_date_${row.id}`,
                              label: "Select Date",
                              required: true,
                            }}
                            formData={{ Witness_date: row.wdate }}
                            errors={{}}
                            onChange={(date) => handleWitnessChangeDate(row.id, date)}
                            className="figmaInputsLabel"
                            inputId={`Witness_date_${row.id}`}
                          />
                        </td>
                        <td>
                          <ShortText
                            field={{
                              name: `witness_${row.id}`,
                              label: "Witness",
                              required: true,
                              maxLength: 100,
                              disabled: false,
                            }}
                            formData={{ witness: row.witness || "" }}
                            errors={{}}
                            className="figmaInputs"
                            inputId={`witness_${row.id}`}
                            onChange={(e) => handleWitnessChangeReport(row.id, e)}
                          />
                        </td>
                        <td>
                          <Button
                            variant="contained"
                            color="error"
                            onClick={() => handleWitnessDelete(row.id)}
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
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
              onClick={() => setWitnessModalView(false)}
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
                setSnackbarMessage(` Witness Approval Successfully Requested.`);
                setSnackbarSeverity('success');
                setOpenSnackbar(true);
                setWitnessModalView(false);
              }}                  >
              Submit for Approval
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={FurtherInvestigationVisible}
          onClose={() => setFurtherInvestigationVisible(false)}
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
              <span style={{ fontSize: "16px", fontWeight: "600" }}>Further Investigation</span>
            </div>
          </DialogTitle>

          <DialogContent>
            <p style={{ textAlign: "center", paddingBottom: "5px" }}>
              Are You Sure this case is continuing for further investigation?
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
              onClick={() => setFurtherInvestigationVisible(false)}
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
                setSnackbarMessage(` Further Investigation Approval Successfully Requested.`);
                setSnackbarSeverity('success');
                setOpenSnackbar(true);
                setFurtherInvestigationVisible(false);
              }}
            >
              Yes
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={AccusedVisible}
          onClose={() => setAccusedVisible(false)}
          maxWidth="md"
          fullWidth
          sx={{
            "& .MuiPaper-root": {
              borderRadius: "12px",
              padding: "15px",
            },
          }}
        >
          <DialogTitle>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M4.5 9H13.5M2.25 4.5H15.75M6.75 13.5H11.25"
                  stroke="#1D2939"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span style={{ fontSize: "16px", fontWeight: "600" }}>Accused</span>
            </div>
          </DialogTitle>
          <DialogContent>
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "10px" }}>
              <Button variant="outlined" startIcon={<AddIcon />} onClick={handleAccusedAddRow}>
                Add Accused
              </Button>
            </div>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Accused Name</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {accusedRows.map((row) => (
                    <tr key={row.id}>
                      <td>
                        <TextField
                          label="Accused Name"
                          variant="outlined"
                          fullWidth
                          value={row.accused_name || ""}
                          onChange={(e) => handleChangeAccusedreports(row.id, e.target.value)}
                        />
                      </td>
                      <td style={{ width: "40%" }}>
                        <AutocompleteField
                          formData={{ TM_status: row.status }}
                          errors={{}}
                          field={{
                            name: `TM_status_${row.id}`,
                            label: "Status",
                            options: bailStatus,
                          }}
                          onChange={(event, value) => handleChangeAccusedreports(row.id, value)}
                        />
                      </td>
                      <td>
                        <IconButton color="error" onClick={() => handleAccusedDeleteRow(row.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
              onClick={() => setAccusedVisible(false)}>
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
                setSnackbarMessage(` Accused Changes requested successfully.`);
                setSnackbarSeverity('success');
                setOpenSnackbar(true);
                setAccusedVisible(false);
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
