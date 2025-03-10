import React, { useState, useEffect, useRef } from "react";
import TableView from "../../components/table-view/TableView";
import { useNavigate } from "react-router-dom";
import ShortText from "../../components/form/ShortText";
import AutocompleteField from "../../components/form/AutoComplete";
import DateField from "../../components/form/Date";
import { Grid } from '@mui/material';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import "./caseEnquiries.css";

export default function Cases() {
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const [isVisibleCreatBtn, setIsVisibleCreateBtn] = useState(false);
  const [caseType, setCaseType] = useState("");
  const [successVisible, setsuccessVisible] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState(null);
  const [radioButton, setRadioButton] = useState("All_Case");
  const [tableData, setTableData] = useState([]);
  const [date, setDate] = useState("");
  const [listingPTCount, setListingPTCount] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [currentPage, setCurrentPage] = useState(0);
  const [updateVisible, setUpdateVisible] = useState(false);
  const [AccusedVisible, setAccusedVisible] = useState(false);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const EditIcon = () => {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="group-hover:fill-white" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="12" fill="#F4F4F4" />
        <mask id="mask0_871_14300" style={{ maskType: "alpha" }} maskUnits="userSpaceOnUse" x="4" y="4" width="16" height="16">
          <rect x="4" y="4" width="16" height="16" fill="#D9D9D9" />
        </mask>
        <g mask="url(#mask0_871_14300)">
          <path d="M5.6001 20.0005V17.4671H18.4001V20.0005H5.6001ZM7.53343 15.1428V13.1775L14.2399 6.46329C14.3365 6.36674 14.4368 6.29924 14.5409 6.26079C14.6452 6.22235 14.7524 6.20312 14.8628 6.20312C14.9774 6.20312 15.0856 6.22235 15.1873 6.26079C15.2889 6.29924 15.3865 6.36429 15.4801 6.45596L16.2129 7.18513C16.3053 7.28168 16.3717 7.38079 16.4123 7.48246C16.4528 7.58424 16.4731 7.69374 16.4731 7.81096C16.4731 7.91818 16.4531 8.02501 16.4131 8.13146C16.3731 8.23801 16.308 8.33635 16.2179 8.42646L9.5001 15.1428H7.53343ZM14.7438 8.67363L15.6064 7.81079L14.8654 7.06979L14.0026 7.93246L14.7438 8.67363Z"
            fill="#1C1B1F" />
        </g>
      </svg>
    );
  };

  const handleSearchChange = (event) => {
    setFormData({
      ...formData,
      search: event.target.value,
    });
  };

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
        <>
          {field === "action" ? (
            <div className="relative mt-4">
              {showDropdown && <ShowActionData />}
            </div>
          ) : (
            ""
          )}
        </>
      </span>
    );
  };

  const columns = [
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
        <div onClick={(e) => e.stopPropagation()}>
          <ActionDropdown
            isOpen={openDropdownIndex === params.row.cidCrimeNo}
            onToggle={() => handleDropdownToggle(params.row.cidCrimeNo)}
            rowData={params.row}
          />
        </div>
      ),
    },
  ];
  var uiCases = [
    {
      id: "1", caseType: "Enquiry", cidCrimeNo: "", firType: "UDR", psCrimeNo: "122", psName: "PS3", department: "CID", division: "Special Enquiries", referringAgency: "CO", date: "01-10-2008", presentIO: "Suresh", presentIODesignation: "DSP", presentStatus: "Under Enquiry", courtName: "", courtLocation: "",
    },
  ];
  var fiCases = [
    {
      id: "2", caseType: "Pending Trial", cidCrimeNo: "", firType: "UDR", psCrimeNo: "122", psName: "PS3", department: "CID", division: "Special Enquiries", referringAgency: "CO", date: "01-10-2008", presentIO: "Suresh", presentIODesignation: "DSP", presentStatus: "Pending in Court", courtName: "", courtLocation: "",
    },
  ];

  var numberCases = [
    {
      id: "3", caseType: "Under Investigation", cidCrimeNo: "111/2008", firType: "UDR", psCrimeNo: "155", psName: "PS3", department: "CID", division: "Homicide and Burglary", referringAgency: "GOVT", date: "10-01-2013", presentIO: "Suresh Prabhu", presentIODesignation: "DSP", presentStatus: "Under Investigation", courtName: "", courtLocation: "", caseCategory: "",
    },
  ];
  var disposal = [
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



  useEffect(() => {
    setSelectedProducts(null);

    switch (radioButton) {
      case "All_Case":
        setTableData([...uiCases, ...fiCases, ...numberCases, ...disposal,]);
        setIsVisibleCreateBtn(false);
        setCaseType("");
        setListingPTCount(uiCases.length + fiCases.length + numberCases.length + disposal.length);
        setCurrentPage(0);
        break;
      case "uiCases":
        setTableData(uiCases);
        setIsVisibleCreateBtn(true);
        setCaseType("UI");
        setListingPTCount(uiCases.length);
        setCurrentPage(0);
        break;
      case "fiCases":
        setTableData(fiCases);
        setIsVisibleCreateBtn(true);
        setCaseType("PT");
        setListingPTCount(fiCases.length);
        setCurrentPage(0);
        break;
      case "numberCases":
        setTableData(numberCases);
        setIsVisibleCreateBtn(true);
        setCaseType("PT");
        setListingPTCount(numberCases.length);
        setCurrentPage(0);
        break;
      case "disposal":
        setTableData(disposal);
        setIsVisibleCreateBtn(true);
        setCaseType("PT");
        setListingPTCount(disposal.length);
        setCurrentPage(0);
        break;
      default:
        setTableData([]);
        setIsVisibleCreateBtn(false);
        setCaseType("");
        setListingPTCount(0);
        setCurrentPage(0);
        break;
    }
  }, [radioButton]);

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

  var addCaseDetails = (type) => {
    navigate("/PTCreate", { state: { type: type } });
  };
  var showFilterBox = () => {
    setsuccessVisible(true);
  };

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


  const [openDropdownIndex, setOpenDropdownIndex] = React.useState(null);

  const handleDropdownToggle = (rowId) => {
    setOpenDropdownIndex((prev) => (prev === rowId ? null : rowId));
  };

  const ShowActionData = ({ rowData, onActionSelect }) => {

    return (
      <div
        style={{
          position: 'absolute',
          top: '34px',
          marginTop: '1px',
          width: '150px',
          backgroundColor: 'white',
          border: '1px solid #ddd',
          borderRadius: '8px',
          boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
          zIndex: '2',
          marginRight: "40px"
        }}
      >
        <div style={{ fontSize: "14px", color: "#374151" }}>
        <p
            style={{
              margin: 0,
              marginLeft: "2px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: "transparent",
            }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = "#FFEDD5")}
            onMouseLeave={(e) => (e.target.style.backgroundColor = "transparent")}
            onClick={(e) => onActionSelect(e, "edit", rowData)}>
            <EditIcon /> Edit
          </p>
        </div>
      </div>
    );
  };

  
  const ActionDropdown = ({ isOpen, onToggle, rowData }) => {
    return (
      <div className="relative">
        <div
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          className="p-2 cursor-pointer relative z-1"
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
        {isOpen && (
          <ShowActionData
            rowData={rowData}
            onActionSelect={handleActionSelect}
          />
        )}
      </div>
    );
  };


  const handleSelectionChange = (selectedRow) => {
    setSelectedCase(selectedRow);
    navigate("/PTView", {
      state: { caseDetails: selectedRow, mode: "view" },
    });
  };
  const handleActionSelect = (e, action, rowData) => {
    e.stopPropagation();

    if (action === "edit") {
      setSelectedCase(rowData);
      navigate("/PTView", {
        state: { caseDetails: rowData, mode: "edit" },
      });
    }
  };

  return (
    <Box p={2}>
      <div className="m-3 ml-4 p-3 bg-white border-round-sm">
        <div className="flex align-items-center" style={{
          display: "flex", justifyContent: "space-between", alignItems: 'center'
        }}>
          <div className="flex flex-column">
            <div className="flex items-center" style={{ display: "flex", gap: "8px", alignItems: "center"}}>
                <h1 style={{ fontSize: "24px", fontWeight: "bold", color: "#2d3748", margin: "0" }}>
                    PT (Pending Trial)
                </h1>
                <p  style={{
                        margin: "0", fontSize: "0.75rem", fontWeight: "600", color: "#1E40AF", padding: "0.25rem 0.75rem", backgroundColor: "#E3F2FD", borderRadius: "0.75rem", height: "auto",
                    }}
                >
                    {listingPTCount} Cases
                </p>
            </div>
          </div>
          <div
            className="button-container"
            style={{
              display: "flex",
              gap: "16px",
              justifyContent: "end",
            }}
          >
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
                onClick={() => addCaseDetails("EQ")}
              >
                Register new Case
              </Button>
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
              { label: "PT Case", value: "uiCases" },
              { label: "Futher Investigation", value: "fiCases" },
              { label: "173(8) Cases", value: "numberCases" },
              { label: "Disposal", value: "disposal" },
            ].map((item) => (
              <Button
                key={item.value}
                variant="text"
                sx={{
                  height: "32px",
                  borderRadius: "6px",
                  fontWeight: radioButton === item.value ? "600" : "400",
                  textTransform: "none",
                  color: "black",
                  backgroundColor: radioButton === item.value ? "white" : "transparent",
                  padding: "0px 20px",
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
            getRowId={(row) => row.cidCrimeNo}
            handleRowClick={handleSelectionChange}
            handleNext={handleNext}
            handleBack={handleBack}
            backBtn={currentPage > 0}
            nextBtn={currentPage < totalPages - 1}
          />
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
    </Box>
  );
}
