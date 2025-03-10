import React, { useState, useRef, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Box } from "@mui/material";
import TableView from "../components/table-view/TableView";
import { Checkbox } from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import FilterListIcon from '@mui/icons-material/FilterList';
import { Button } from '@mui/material';

const Report = () => {
  const [pageSize, setPageSize] = useState(5);
  const [currentPage, setCurrentPage] = useState(0);

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
    },
    {
      id: 6,
      caseType: "Pending Trial",
      crimeNo: "09/2013",
      fir: "UDR",
      psCrimeNo: "128",
      psName: "PS6",
      department: "EO",
      division: "Special Enquiries",
    },
    {
      id: 7,
      caseType: "Under Investigation",
      crimeNo: "10/2014",
      fir: "FIR",
      psCrimeNo: "129",
      psName: "PS7",
      department: "CID",
      division: "Homicide & Burglary",
    },
    {
      id: 8,
      caseType: "Pending Trial",
      crimeNo: "11/2015",
      fir: "FOC",
      psCrimeNo: "130",
      psName: "PS8",
      department: "EO",
      division: "Special Enquiries",
    },
    {
      id: 9,
      caseType: "Under Investigation",
      crimeNo: "12/2016",
      fir: "UDR",
      psCrimeNo: "131",
      psName: "PS9",
      department: "CID",
      division: "Homicide & Burglary",
    },
    {
      id: 10,
      caseType: "Pending Trial",
      crimeNo: "01/2017",
      fir: "FIR",
      psCrimeNo: "132",
      psName: "PS10",
      department: "EO",
      division: "Special Enquiries",
    },
    {
      id: 11,
      caseType: "Under Investigation",
      crimeNo: "02/2018",
      fir: "FOC",
      psCrimeNo: "133",
      psName: "PS11",
      department: "CID",
      division: "Homicide & Burglary",
    },
    {
      id: 12,
      caseType: "Pending Trial",
      crimeNo: "03/2019",
      fir: "UDR",
      psCrimeNo: "134",
      psName: "PS12",
      department: "EO",
      division: "Special Enquiries",
    },
    {
      id: 13,
      caseType: "Under Investigation",
      crimeNo: "04/2020",
      fir: "FIR",
      psCrimeNo: "135",
      psName: "PS13",
      department: "CID",
      division: "Homicide & Burglary",
    },
    {
      id: 14,
      caseType: "Pending Trial",
      crimeNo: "05/2021",
      fir: "FOC",
      psCrimeNo: "136",
      psName: "PS14",
      department: "EO",
      division: "Special Enquiries",
    },
    {
      id: 15,
      caseType: "Under Investigation",
      crimeNo: "06/2022",
      fir: "UDR",
      psCrimeNo: "137",
      psName: "PS15",
      department: "CID",
      division: "Homicide & Burglary",
    },
    {
      id: 16,
      caseType: "Pending Trial",
      crimeNo: "07/2023",
      fir: "FIR",
      psCrimeNo: "138",
      psName: "PS16",
      department: "EO",
      division: "Special Enquiries",
    },
    {
      id: 17,
      caseType: "Under Investigation",
      crimeNo: "08/2024",
      fir: "FOC",
      psCrimeNo: "139",
      psName: "PS17",
      department: "CID",
      division: "Homicide & Burglary",
    },
    {
      id: 18,
      caseType: "Pending Trial",
      crimeNo: "09/2025",
      fir: "UDR",
      psCrimeNo: "140",
      psName: "PS18",
      department: "EO",
      division: "Special Enquiries",
    },
    {
      id: 19,
      caseType: "Under Investigation",
      crimeNo: "10/2026",
      fir: "FIR",
      psCrimeNo: "141",
      psName: "PS19",
      department: "CID",
      division: "Homicide & Burglary",
    },
    {
      id: 20,
      caseType: "Pending Trial",
      crimeNo: "11/2027",
      fir: "FOC",
      psCrimeNo: "142",
      psName: "PS20",
      department: "EO",
      division: "Special Enquiries",
    },
  ]);

  const [successVisible, setSuccessVisible] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [page, setPage] = useState(0); // To track the current page

  var btnAppended = false;
  useEffect(() => {
    if (!btnAppended) {
      var paginatorLast = document.querySelector(".p-paginator-last");
      if (paginatorLast) {
        paginatorLast.insertAdjacentHTML(
          "afterend",
          `<button class="smallbtn absoluteLeft hover:bg-gray-100 cursor-pointer"><i class="pi pi-arrow-left"></i>Back</button><button class="smallbtn absoluteRight hover:bg-gray-100 cursor-pointer">Next<i class="pi pi-arrow-right"></i></button>`
        );
        btnAppended = true;
      }
    }
  }, []);

  var downloadExcelData = () => {
    setSuccessVisible(!successVisible);
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

  const columns = [
    {
      field: 'selection',
      headerName: '',
      flex: 0.5,
      renderCell: (params) => (
        <Checkbox
          checked={selectedUsers.some(user => user.id === params.row.id)}
          onChange={() => handleSelectUser(params.row)}
        />
      ),
    },
    {
      field: 'caseType',
      headerName: 'Case Type',
      flex: 1,
      sortable: true,
      renderCell: (params) => tableBodyTemplate("caseType", "#475467", "400")(params.row)
    },
    {
      field: 'crimeNo',
      headerName: 'CID Crime No',
      flex: 1.5,
      sortable: true,
      renderCell: (params) => tableBodyTemplate("crimeNo")(params.row)
    },
    {
      field: 'fir',
      headerName: 'FIR/UDR/FOC/MFA',
      flex: 1,
      sortable: true,
      renderCell: (params) => tableBodyTemplate("fir", "#475467", "400", "underline")(params.row)
    },
    {
      field: 'psCrimeNo',
      headerName: 'PS Crime No',
      flex: 1,
      sortable: true,
      renderCell: (params) => tableBodyTemplate("psCrimeNo")(params.row)
    },
    {
      field: 'psName',
      headerName: 'PS Name',
      flex: 1,
      sortable: true,
      renderCell: (params) => tableBodyTemplate("psName")(params.row)
    },
    {
      field: 'division',
      headerName: 'Division',
      flex: 1,
      sortable: true,
      renderCell: (params) => tableBodyTemplate("division")(params.row)
    },
    {
      field: 'department',
      headerName: 'Department',
      flex: 1,
      sortable: true,
      renderCell: (params) => tableBodyTemplate("department")(params.row)
    }
  ];


  const totalPages = Math.ceil(users.length / pageSize);
  const currentPageRows = users.slice(currentPage * pageSize, (currentPage + 1) * pageSize);

  const handleNext = () => {
    if (currentPage < totalPages - 1) setCurrentPage(currentPage + 1);
  };

  const handleBack = () => {
    if (currentPage > 0) setCurrentPage(currentPage - 1);
  };
  const handleSelectUser = (user) => {
    setSelectedUsers((prevSelected) => {
      const isAlreadySelected = prevSelected.some((u) => u.id === user.id);
      return isAlreadySelected
        ? prevSelected.filter((u) => u.id !== user.id) // Remove if already selected
        : [...prevSelected, user]; // Add if not selected
    });
  };



  return (
    <Box p={2}>



      <div className="m-3 ml-4 p-3 bg-white border-round-sm">
        <div className="flex align-items-center" style={{ display: "flex", justifyContent: "space-between", alignItems: 'center' }}>
          <div className="flex flex-column">
            <div className="flex items-center" style={{ display: "flex", gap: "8px", alignItems: "center"}}>
              <h1 style={{ fontSize: "24px", fontWeight: "bold", color: "#2d3748", margin: "0" }}>
                Quick Reports
              </h1>
              <p style={{
                margin: "0", fontSize: "0.75rem", fontWeight: "600", color: "#1E40AF", padding: "0.25rem 0.75rem", backgroundColor: "#E3F2FD", borderRadius: "0.75rem", height: "auto",
              }}
              >
                {users.length} profiles
              </p>
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
                onClick={downloadExcelData}
              >
                New Report
              </Button>
            </>
          </div>
        </div>
      </div>

      <div className="pt-4" style={{ overflowX: "auto" }}>
        <Box py={1}>
          <TableView rows={currentPageRows} columns={columns} handleNext={handleNext} handleBack={handleBack} backBtn={currentPage > 0} nextBtn={currentPage < totalPages - 1} />
        </Box>
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
    style: {
      color: "#000",
      background: "#fff",
      padding: "15px",
      borderRadius: "12px",
    },
  }}
>
  <DialogTitle>Report</DialogTitle>
  <DialogContent>
    <div style={{ padding: "16px" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            {["Case Type", "CID Crime No", "FIR/UDR/FOC/MFA", "PS Crime No", "Division"].map((header) => (
              <th
                key={header}
                style={{
                  borderBottom: "1px solid #E2E8F0",
                  borderTop: "1px solid #E2E8F0",
                  padding: "8px",
                  textAlign: "left",
                }}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {selectedUsers && selectedUsers.length > 0 ? (
            selectedUsers.map((report) => (
              <tr key={report.id}>
                {[report.caseType, report.crimeNo, report.fir, report.psCrimeNo, report.division].map((data, index) => (
                  <td
                    key={index}
                    style={{
                      borderBottom: "1px solid #E2E8F0",
                      padding: "8px",
                    }}
                  >
                    {data}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={5}
                style={{
                  borderBottom: "1px solid #E2E8F0",
                  padding: "8px",
                  textAlign: "center",
                }}
              >
                No Data Found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </DialogContent>
  <DialogActions>
    <Button onClick={downloadExcelData} variant="contained" color="primary" fullWidth>
      Download
    </Button>
  </DialogActions>
</Dialog>
    </Box>
  );
};

export default Report;
