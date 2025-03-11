import React, { useState, useEffect } from "react";
import TableView from "../../components/table-view/TableView";
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import { useParams, useLocation } from "react-router-dom";
import { Snackbar, Alert } from '@mui/material';
import pdf from "../../store/CMS_sample_pdf.pdf";
import eyes from "../../Images/eye.svg"
import edit from "../../Images/tableEdit.svg";
import trash from "../../Images/tableTrash.svg";
import error from "../../Images/erroricon.png";
import { CheckCircle as CheckCircleIcon } from "@mui/icons-material";
import "../master.css";

const Repository = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateRecord, setIsCreateRecord] = useState(false);
  const [newTitleValue, setNewTitleValue] = useState("");
  const [newAttachment, setNewAttachment] = useState(null);
  const [editTitleValue, setEditTitleValue] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [updateItem, setUpdateItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [showWarningDialog, setShowWarningDialog] = useState(false);
  const [crimeTitleData, setCrimeTitleData] = useState([]);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const location = useLocation();
  const values = useParams();
  console.log("values", values)
  const type = location.state?.type;
  const value = location.state?.value;
  const [pageSize, setPageSize] = useState(5);
  const [currentPage, setCurrentPage] = useState(0);

  const actionBodyTemplate = (rowData) => {
    return (
      <div style={{ display: "flex", justifyContent: "center", gap: "12px" , marginTop: "15px"}}>
        <Button
          style={{
            background: "transparent",
            border: "none",
            padding: "0",
            boxShadow: "none",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            color: "black",
            fontSize: "14px",
            textAlign: "center",
            textTransform: "none",
          }}
          onClick={() => {
            window.open(pdf, "_blank");
          }}
        >
          <img
            src={eyes}
            alt="View"
            style={{ width: "20px", height: "20px" }}
          />
          <span>View</span>
        </Button>
        <Button
          style={{
            background: "transparent",
            border: "none",
            padding: "0",
            boxShadow: "none",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            color: "black",
            fontSize: "14px",
            textAlign: "center",
            textTransform: "none",
          }}
          onClick={() => handleEditClick(rowData.row)}
        >
          <img
            src={edit}
            alt="Edit"
            style={{ width: "20px", height: "20px" }}
          />
          <span>Edit</span>
        </Button>
        <Button
          style={{
            background: "transparent",
            border: "none",
            padding: "0",
            boxShadow: "none",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            color: "Red",
            fontSize: "14px",
            textAlign: "center",
            textTransform: "none",
          }}
          onClick={() => handleDeleteClick(rowData.row)}
        >
          <img
            src={trash}
            alt="Delete"
            style={{ width: "20px", height: "20px" }}
          />
          <span>Delete</span>
        </Button>
      </div>
    );
  };

  const columns = [
    { field: "Title", headerName: "Title", flex: 1 },
    { field: "Attachment", headerName: "Attachment", flex: 1 },
    { field: "Actions", headerName: "Actions", flex: 1, renderCell: actionBodyTemplate },
  ];


  const totalPages = Math.ceil(crimeTitleData.length / pageSize);
  const currentPageRows = crimeTitleData.slice(currentPage * pageSize, (currentPage + 1) * pageSize);

  const handleNext = () => {
    if (currentPage < totalPages - 1) setCurrentPage(currentPage + 1);
  };

  const handleBack = () => {
    if (currentPage > 0) setCurrentPage(currentPage - 1);
  };

  const handleCreateNewClick = () => {
    setIsCreateRecord(true);
  };

 useEffect(() => {
    fetchData();
  }, [value]);
 
    const fetchData = async () => {
      try {
        const serverURL = process.env.REACT_APP_SERVER_URL;
        
        const response = await fetch(`${serverURL}/repository/get_repositories?tableName=${value}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            'token': "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZ2lkIjoiOTY5ODI3MzI3MiIsInJvbGVfaWQiOjEsInVzZXJfaWQiOjEsImlhdCI6MTc0MTM5NjU3MCwiZXhwIjoxNzQxNjU1NzcwfQ.zS6-uGPLgUcBNgGzBSYUQ5O5GCUYldxkg22952PWPaE",
          },
        });
      
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
  
      const result = await response.json();
      
        if (result.success) {
          setCrimeTitleData(
            result.data.map((item, index) => ({
              id: item.repository_id,
              repository_id: item.repository_id,
              Title: item.subject || `empty`,
              Attachment: item.documents ? item.documents.split("\\").pop() : "sample.pdf",
            }))
          );
        } else {
          console.error("API response was unsuccessful:", result.message);
        }
      } catch (error) {
        console.error("Request failed:", error);
      }
    };
  

    const handleCreateNewSave = async () => {
        try {
          const serverURL = process.env.REACT_APP_SERVER_URL;
            
          const requestData = {
            tableName: value,
            subject: newTitleValue,
            tags: "update",
            documents: `/uploads/repositorys/temp/${newAttachment.name}`,
            created_by: "1"
          };
            
          const response = await fetch(`${serverURL}/repository/create_repository`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              'token': "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZ2lkIjoiOTY5ODI3MzI3MiIsInJvbGVfaWQiOjEsInVzZXJfaWQiOjEsImlhdCI6MTc0MTM5NjU3MCwiZXhwIjoxNzQxNjU1NzcwfQ.zS6-uGPLgUcBNgGzBSYUQ5O5GCUYldxkg22952PWPaE",
            },
            body: JSON.stringify(requestData),
          });
      
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
            
          setIsCreateRecord(false);
          setSnackbarMessage("Record Created Successfully.");
          setSnackbarSeverity("success");
          setOpenSnackbar(true);
          setNewTitleValue("");
          setNewAttachment(null);
          fetchData();
        } catch (error) {
          console.error("Request failed:", error);
          setSnackbarMessage("Failed to get data.");
          setSnackbarSeverity("error");
          setOpenSnackbar(true);
        }
      };
    
  const handleCreateNewCancel = () => {
    setIsCreateRecord(false);
    setNewTitleValue("");
    setNewAttachment(null);
  };

  const editFieldModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const handleEditClick = (rowData) => {
    setUpdateItem(rowData);
    setEditTitleValue(rowData.Title);
    setSelectedFile(rowData.Attachment);
    setSelectedFileName(rowData.Attachment);
    setIsModalOpen(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    setSelectedFileName(file ? file.name : "");
  };

  const handleUpdateClick = async () => {
    try {
      const serverURL = process.env.REACT_APP_SERVER_URL;
  
      const requestData = {
        tableName: value,
        repository_id: updateItem.repository_id, // Include repository ID for updating
        subject: editTitleValue,
        tags: "policy, update, revised",
        documents: selectedFile ? `/uploads/repositorys/temp/${selectedFile.name}` : selectedFileName, // Send existing or new file path
        created_by: "1",
      };
  
      const response = await fetch(`${serverURL}/repository/update_repository`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZ2lkIjoiOTY5ODI3MzI3MiIsInJvbGVfaWQiOjEsInVzZXJfaWQiOjEsImlhdCI6MTc0MTM5NjU3MCwiZXhwIjoxNzQxNjU1NzcwfQ.zS6-uGPLgUcBNgGzBSYUQ5O5GCUYldxkg22952PWPaE",
        },
        body: JSON.stringify(requestData),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      setIsCreateRecord(false);
      setSnackbarMessage("Record Updated Successfully.");
      setSnackbarSeverity("success");
      setOpenSnackbar(true);
      fetchData();
    } catch (error) {
      console.error("Request failed:", error);
      setSnackbarMessage("Failed to update data.");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    }
    setIsModalOpen(false);
  };

    const handleDeleteClick = (rowData) => {
    setDeleteItem(rowData);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async (item) => {
    try {
      const serverURL = process.env.REACT_APP_SERVER_URL;

      const response = await fetch(`${serverURL}/repository/delete_repository?tableName=${value}&repository_id=${item.repository_id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          'token': "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZ2lkIjoiOTY5ODI3MzI3MiIsInJvbGVfaWQiOjEsInVzZXJfaWQiOjEsImlhdCI6MTc0MTM5NjU3MCwiZXhwIjoxNzQxNjU1NzcwfQ.zS6-uGPLgUcBNgGzBSYUQ5O5GCUYldxkg22952PWPaE",
        }
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Failed to delete record.");
      }
      setIsDeleteModalOpen(false);
      setSnackbarMessage("Record Deleted Successfully.");
      setSnackbarSeverity("success");
      setOpenSnackbar(true);        
      fetchData();
    } catch (error) {
      console.error("Request failed:", error);
      setSnackbarMessage("Failed to delete data.");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    }
  };
  
  const header = (
    <div
      style={{
        padding: "8px",
        backgroundColor: "white",
        borderRadius: "8px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          <p
            style={{
              margin: "0",
              fontSize: "16px",
              fontWeight: "normal",
              fontFamily: "Roboto",
              color: "#667085",
            }}
          >
            Overview
          </p>
          <p
            style={{
              margin: "0",
              fontSize: "20px",
              fontWeight: "600",
              fontFamily: "Roboto",
              color: "#1D2939",
            }}
          >
            {type}
          </p>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <button
            onClick={handleCreateNewClick}
            style={{
              cursor: "pointer",
              fontFamily: "Roboto",
              backgroundColor: "white",
              display: "flex",
              alignItems: "center",
              padding: "8px",
              fontSize: "14px",
              fontWeight: "500",
              height: "38px",
              border: "1px solid #2A55E5",
              borderRadius: "6px",
              gap: "8px",
              color: "#2A55E5",
              transition: "background-color 0.3s",
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "#E6F0FF";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "white";
            }}
          >
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
            Create New
          </button>
        </div>
      </div>
    </div>
  );


  return (
    <div
      className="card"
      style={{
        backgroundColor: "white",
        marginLeft: "10px",
        borderRadius: "8px",
      }}
    >
      {header}

      <div className="pt-4" style={{ overflowX: "auto" }}>
        <div style={{ height: 400, width: '100%' }}>
          <TableView rows={currentPageRows} columns={columns}
            getRowId={(row) => row.id}
            handleRowClick={undefined}

            handleNext={handleNext} handleBack={handleBack} backBtn={currentPage > 0} nextBtn={currentPage < totalPages - 1} />
        </div>
      </div>

      <Dialog
        open={isCreateRecord}
        onClose={handleCreateNewCancel}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Create New Record
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                label="Document Category"
                value={type}
                fullWidth
                readOnly
                variant="outlined"
                InputProps={{
                  readOnly: true,
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Title"
                value={newTitleValue}
                fullWidth
                variant="outlined"
                onChange={(e) => setNewTitleValue(e.target.value)}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Attachment"
                type="file"
                fullWidth
                variant="outlined"
                onChange={(e) => setNewAttachment(e.target.files[0])}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
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
            onClick={handleCreateNewCancel}

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
            onClick={handleCreateNewSave}
          >
            Submit for Approval
          </Button>
        </DialogActions>
      </Dialog>



      <div>
        <Dialog
          open={showWarningDialog}
          onClose={() => setShowWarningDialog(false)}
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
                Approval Sent Successfully
              </p>
              <p
                style={{
                  fontSize: "16px",
                  color: "rgb(156, 163, 175)",
                  margin: 0,
                }}
              >
                {type} Approval Successfully Requested
              </p>
            </div>
          </DialogContent>
          <DialogActions sx={{ justifyContent: "center", padding: "10px 20px" }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                setShowWarningDialog(false);
                setIsCreateRecord(true);
              }}
              sx={{ width: "100%", padding: "8px" }}
            >
              Done
            </Button>
          </DialogActions>
        </Dialog>
      </div>


      <Dialog
        open={isModalOpen}
        onClose={editFieldModal}
        maxWidth="md"
        fullWidth
        PaperProps={{
          style: {
            width: "50vw",
          },
        }}
      >
        <DialogTitle>
          Edit
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                label="Title"
                value={editTitleValue}
                onChange={(e) => setEditTitleValue(e.target.value)}
                fullWidth
                variant="outlined"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="File"
                type="file"
                fullWidth
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                onChange={handleFileChange}
              />
              {selectedFileName && (
                <Typography variant="body2" color="textSecondary">
                  Selected File: {selectedFileName}
                </Typography>
              )}             
            </Grid>
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
            onClick={editFieldModal}

          >
            Discard Changes
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
            onClick={() => handleUpdateClick()}
          >
            Update
          </Button>

        </DialogActions>
      </Dialog>


      <Dialog
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          style: {
            borderRadius: '12px',
            padding: '16px',
            backgroundColor: '#fff',
            color: '#000',
          },
        }}
      >
        <DialogTitle sx={{ textAlign: "left" }}>
          <div style={{ display: "flex", alignItems: "center", marginBottom: "15px" }}>
            <div style={{ width: "60px", height: "60px", borderRadius: "50%", overflow: "hidden", background: "rgb(250 209 209)", padding: "3px", }}>
              <img src={error} alt="Warning Icon" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", }} />
            </div>
          </div>
        </DialogTitle>


        <DialogContent>
          {deleteItem && (
            <Typography
              variant="h6"
              component="div"
              style={{
                fontWeight: 500,
                fontSize: '20px',
                color: '#1D2939',
              }}
            >
              Deleting <span style={{ color: '#F04438' }}>{deleteItem.Title}</span>
            </Typography>
          )}
          <Typography
            variant="body1"
            style={{
              marginTop: '10px',
              color: '#98A2B3',
              fontSize: '16px',
              fontWeight: 400,
              lineHeight: '20px',
            }}
          >
            Are you sure you want to delete this? This action cannot be undone.
          </Typography>
        </DialogContent>

        <DialogActions sx={{ display: "flex", justifyContent: "center", padding: "10px 20px" }}>
          <Button
            variant="contained"
            color="danger"
            onClick={() => setIsDeleteModalOpen(false)}
            sx={{
              width: "150px",
              marginRight: "10px",
              border: "1px solid lightgrey",
              boxShadow: "none",
              "&:hover": {
                backgroundColor: "#f3f4f6",
                boxShadow: "none",
              },
            }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            sx={{
              color: "white",
              backgroundColor: "#F04438",
              borderRadius: "5px",
              "&:hover": {
                backgroundColor: "#dc2626",
              },
              width: "150px",
              boxShadow: "none",
            }}
            onClick={() => handleDeleteConfirm(deleteItem)}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
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
};

export default Repository;
