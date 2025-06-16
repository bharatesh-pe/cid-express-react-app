import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from "../services/api";
import TableView from "../components/table-view/TableView";
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const CDRpage = () => {
  const [cdrList, setCdrList] = useState([]);
  const [page, setPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const navigate = useNavigate();
  const limit = 10;

  const user_designation = localStorage.getItem("designation_name") || "";

  useEffect(() => {
    const fetchCDRList = async () => {
      try {
        const payload = {
          page,
          limit,
          template_module: "ui_case",
        };
        const response = await api.post("/templateData/paginateTemplateDataForOtherThanMaster", payload);
        if (response?.success && response.data?.data) {
          const result = response.data.data.map((item, idx) => ({
            id: item.id || `unique_id_${idx}`,
            crime_no: item['field_cid_crime_no./enquiry_no'],
          }));
          // Use meta.totalItems for totalRecords if available
          const totalCount =
            response.data?.meta?.totalItems ||
            response.data?.meta?.totalRecords ||
            response.data?.totalCount ||
            result.length;
          setCdrList(result);
          setTotalRecords(totalCount);
        } else {
          setCdrList([]);
          setTotalRecords(0);
        }
      } catch (err) {
        setCdrList([]);
        setTotalRecords(0);
      }
    };
    fetchCDRList();
  }, [page]);

  const handleViewCDR = (id) => {
    const selectedRow = cdrList.find(item => item.id === id);
    const cdrSidebarItem = {
      name: "CDR",
      table: "cid_ui_case_cdr_ipdr",
      // add other properties if needed
    };
    const contentArray = JSON.stringify([cdrSidebarItem]);
    navigate("/caseView", {
      state: {
        rowData: selectedRow,
        fromCDR: true,
        headerDetails: selectedRow?.crime_no || null,
        backNavigation: "/case/cdr_case",
        table_name: "cid_under_investigation",
        contentArray,
        options: cdrSidebarItem, // <--- pass options here
      }
    });
  };

  const columns = [
    {
      field: "sno",
      headerName: "S.No",
      width: 80,
      renderCell: (params) => {
        const idx = cdrList.findIndex(row => row && row.id === params.row.id);
        return idx !== -1 ? (page - 1) * limit + (idx + 1) : '';
      },
    },
    {
      field: "crime_no",
      headerName: "Crime/Enquiry No.",
      width: 200,
    },
    {
      field: "action",
      headerName: "Action",
      width: 180,
      renderCell: ({ row }) => (
        <Button
          variant="outlined"
          size="small"
          onClick={() => handleViewCDR(row.id)}
        >
          View CDR
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Box
        sx={{
          display: "inline-flex",
          alignItems: "center",
          cursor: "pointer",
          gap: '6px',
          margin: '24px 0 16px 24px' // Add left space
        }}
      >
        <Typography variant="h1" align="left" sx={{ fontSize: "20px", color: "black", fontWeight: 500 }}>
          {user_designation}
        </Typography>
        {/* need a horizontal line here */}
        <Box
          sx={{
            width: "1px",
            height: "25px",
            backgroundColor: "#bfb8b896",
            mx: 1,
          }}
        ></Box>
        <Typography variant="h1" align="left" sx={{ fontSize: "16px", color: "#000000b3", fontWeight: 500 }}>
          CDR
        </Typography>
        <Box className="totalRecordCaseStyle">
          {totalRecords} Cases
        </Box>
      </Box>
      <Box sx={{ ml: 2 }}>
        <TableView
          rows={cdrList}
          columns={columns}
          getRowId={(row) => row.id}
          totalPage={Math.ceil(totalRecords / limit)}
          paginationCount={page}
          totalRecord={totalRecords}
          handlePagination={(newPage) => setPage(newPage)}
          tableName="cdr_table"
        />
      </Box>
    </div>
  );
};

export default CDRpage;
