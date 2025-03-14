import React, { useState, useRef, useEffect } from "react";
import Modal from "../components/Modal/Modal.jsx";
import PasswordInput from "../components/password_input/password_input";
import { useNavigate } from "react-router-dom";
import { Box, Checkbox, Grid } from '@mui/material';
import MultiSelect from "../components/form/MultiSelect.jsx";
import { Button } from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import FilterListIcon from '@mui/icons-material/FilterList';
import EditIcon from '@mui/icons-material/Edit';
import DoNotDisturbOnIcon from '@mui/icons-material/DoNotDisturbOn';
import { Chip } from '@mui/material';
import { Snackbar, Alert } from '@mui/material';
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import { CheckCircle as CheckCircleIcon } from "@mui/icons-material";
import TableView from "../components/table-view/TableView";
import ErrorIcon from "../Images/erroricon.png";
import AutocompleteField from "../components/form/AutoComplete";
import ShortText from "../components/form/ShortText.jsx";
import NumberField from "../components/form/NumberField.jsx";


const UserManagement = () => {
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [usergetupdated, setUserUpdatedFlag] = useState(false);
  const [getu_master_data, setMasterData] = useState([]);
  const [pageSize, setPageSize] = useState(5);
  const [currentPage, setCurrentPage] = useState(0);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeactivationDialogVisible, setDeactivationDialogVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("Add New User");
  const [validationError, setValidationError] = useState('');
  const [loading, setLoading] = useState(false);

  const [users, setUsers] = useState([
    { id: 1, name: "Manjunath DR", email: "jay.singh@gmail.com", contact: "9562325865", role: "IO officers", kgid: "53414", status: "Active", },
    { id: 2, name: "Priya Sharma", email: "priya.sharma@example.com", contact: "9988776655", role: "Admin IO", kgid: "53415", status: "Inactive", },
    { id: 3, name: "Sandeep Kumar", email: "sandeep.kumar@example.com", contact: "8776655443", role: "IO officers", kgid: "53416", status: "Active", },
    { id: 4, name: "Ravi Patel", email: "ravi.patel@example.com", contact: "9212345678", role: "CID Officers", kgid: "53417", status: "Active", },
    { id: 5, name: "Neha Reddy", email: "neha.reddy@example.com", contact: "9123456789", role: "IO officers", kgid: "53418", status: "Inactive", },
    { id: 6, name: "Amit Verma", email: "amit.verma@example.com", contact: "9654321890", role: "Admin IO", kgid: "53419", status: "Active", },
    { id: 7, name: "Rina Joshi", email: "rina.joshi@example.com", contact: "9632587410", role: "CID Officers", kgid: "53420", status: "Active", },
    { id: 8, name: "Karan Yadav", email: "karan.yadav@example.com", contact: "9900112233", role: "IO officers", kgid: "53421", status: "Active", },
    { id: 9, name: "Sonia Malik", email: "sonia.malik@example.com", contact: "9837465821", role: "Admin IO", kgid: "53422", status: "Inactive", },
    { id: 10, name: "Vikram Singh", email: "vikram.singh@example.com", contact: "9238745632", role: "IO officers", kgid: "53423", status: "Active", },
  ]);

  const columns = [
    {
      field: 'selection',
      headerName: '',
      flex: 0.5,
      renderCell: (params) => (
        <Checkbox checked={selectedUsers.includes(params.row.id)} onChange={() => handleSelectUser(params.row.id)} />
      ),
    },
    {
      field: 'name',
      headerName: 'Name',
      flex: 1,
      sortable: true,
    },
    {
      field: 'email',
      headerName: 'Email ID',
      flex: 1.5,
      sortable: true
    },
    {
      field: 'contact',
      headerName: 'Contact Number',
      flex: 1,
      sortable: true
    },
    {
      field: 'role',
      headerName: 'Role',
      flex: 1,
      sortable: true,
      renderCell: (params) => roleBodyTemplate(params.row)
    },
    {
      field: 'kgid',
      headerName: 'KGID No',
      flex: 0.8,
      sortable: true,
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 0.8,
      sortable: true,
      renderCell: (params) => statusBodyTemplate(params.row)
    }
  ];

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    contact: "",
    role: "",
    kgid: "",
    status: "Active",
    designation: "",
    pin: "",
    confirmPin: "",
    district: "",
    supervisor_designation: "",
    division: "",
    department: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    contact: "",
    role: "",
    designation: "",
    pin: "",
    confirmPin: "",
    district: "",
    supervisor_designation: "",
    division: "",
    department: "",
  });

  const validateForm = () => {
    const newErrors = {};
    if (!newUser.name) newErrors.name = "Name is required";
    if (!newUser.email || !/\S+@\S+\.\S+/.test(newUser.email))
      newErrors.email = "Valid email is required";
    if (!newUser.contact || newUser.contact.length !== 10)
      newErrors.contact = "Contact number must be 10 digits";
    if (!newUser.role) newErrors.role = "Role is required";
    if (!newUser.kgid) newErrors.kgid = "KGID is required";
    if (!newUser.designation) newErrors.designation = "Designation is required";
    if (!newUser.supervisor_designation)
      newErrors.supervisor_designation = "Supervisor Designation is required";
    if (!newUser.division) newErrors.division = "Division is required";
    if (!newUser.department) newErrors.department = "Department is required";
    if (!newUser.district) newErrors.district = "District is required";
    if (!newUser.pin) newErrors.pin = "Pin is required";
    if (newUser.pin !== newUser.confirmPin)
      newErrors.confirmPin = "Pin do not match";
    if (!newUser.status) newErrors.status = "Status is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const totalPages = Math.ceil(users.length / pageSize);
  const currentPageRows = users.slice(currentPage * pageSize, (currentPage + 1) * pageSize);

  const handleNext = () => {
    if (currentPage < totalPages - 1) setCurrentPage(currentPage + 1);
  };

  const handleBack = () => {
    if (currentPage > 0) setCurrentPage(currentPage - 1);
  };

  const handleSelectUser = (userId) => {
    setSelectedUsers((prevSelected) => {
      let newSelectedUsers;
      if (prevSelected.includes(userId)) {
        newSelectedUsers = prevSelected.filter((id) => id !== userId);
      } else {
        newSelectedUsers = [...prevSelected, userId];
        const selectedUser = users.find((user) => user.id === userId);
        if (selectedUser) {
          setNewUser(selectedUser);
        }
      }
      return newSelectedUsers;
    });
  };

  const handleEdit = () => {
    if (selectedUsers.length === 1) {
      const userToEdit = selectedUsers[0];
      setNewUser((prevState) => ({
        ...prevState,
        ...userToEdit,
      }));

      setModalTitle("Edit User");
      setIsModalOpen(true);
    } else {
      setSnackbarMessage("Please select exactly one user to edit.");
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    }
  };

  const handleDeactivate = () => {
    if (selectedUsers.length === 0) {
      setSnackbarMessage('Please select users to deactivate.');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    } else {
      setDeactivationDialogVisible(true);
    }
  };

  const handleConfirmDeactivation = async () => {
    if (selectedUsers.length === 0) return;

    setLoading(true);

    try {
      const serverURL = process.env.REACT_APP_SERVER_URL;

      for (const user of selectedUsers) {
        const response = await fetch(`${serverURL}/deactiveUser`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: user.id, kgid: user.kgid }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || `Failed to deactivate user ID ${user.id}`);
        }
      }

      const updatedUsers = users.map((user) =>
        selectedUsers.some((selectedUser) => selectedUser.id === user.id)
          ? { ...user, status: 'Inactive' }
          : user
      );

      setUsers(updatedUsers);
      setSnackbarMessage(`${selectedUsers.length} profiles have been deactivated.`);
      setSnackbarSeverity('success');

    } catch (err) {
      setSnackbarMessage(err?.message || 'Something went wrong while deactivating users.');
      setSnackbarSeverity('error');
    } finally {
      setLoading(false);
      setDeactivationDialogVisible(false);
      setSelectedUsers([]);
      setOpenSnackbar(true);
    }
  };


  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setValidationError('');

    try {
      const serverURL = process.env.REACT_APP_SERVER_URL;
      const endpoint = newUser.id ? '/editUser' : '/createUser';
      const requestBody = newUser.id
        ? {
          user_id: newUser.id,
          username: newUser.name,
          role_id: newUser.role,
          kgid: newUser.kgid,
          pin: newUser.pin,
          designation_id: newUser.designation,
          department_id: newUser.department_id,
          division_id: newUser.division_id
        }
        : {
          username: newUser.name,
          role_id: newUser.role,
          kgid: newUser.kgid,
          pin: newUser.pin,
          designation_id: newUser.designation,
          department_id: newUser.department_id,
          division_id: newUser.division_id
        };

      const response = await fetch(`${serverURL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to save user');
      }

      if (newUser.id) {
        setUsers(users.map((user) => (user.id === newUser.id ? newUser : user)));
        setUserUpdatedFlag(true);
      } else {
        setUsers([...users, { ...newUser, id: users.length + 1 }]);
        setUserUpdatedFlag(false);
      }

      setShowSuccessDialog(true);
      setIsModalOpen(false);
      setNewUser({
        name: "",
        email: "",
        contact: "",
        role: "",
        kgid: "",
        status: "Active",
        designation: "",
        pin: "",
        confirmPin: "",
      });
      setSelectedUsers([]);
    } catch (err) {
      setValidationError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };



  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalTitle("Add New User");
    setErrors({});
    setNewUser({
      id: "",
      name: "",
      email: "",
      contact: "",
      role: "",
      kgid: "",
      status: "Active",
      designation: "",
      pin: "",
      confirmPin: "",
      district: "",
      supervisor_designation: "",
      division: "",
      department: "",
    });
  };

  // Status Column Body Template
  const statusBodyTemplate = (rowData) => {
    const statusColor = rowData.status === "Active" ? "#22c55e" : "#ef4444";
    const borderColor = rowData.status === "Active" ? "#34D399" : "#EF4444";

    return (
      <Chip
        label={rowData.status}
        size="small"
        sx={{
          fontFamily: "Roboto",
          fontWeight: 400,
          color: "white",
          borderColor: borderColor,
          borderRadius: "4px",
          backgroundColor: statusColor,
          textTransform: "capitalize",
          borderStyle: "solid",
          borderWidth: "1px"
        }}
      />
    );
  };
  // Role Column Body Template
  const roleBodyTemplate = (rowData) => (
    <span
      className="text-sm font-normal p-tag p-tag-rounded"
      style={{
        backgroundColor: "#EAECF0",
        color: "#344054",
        padding: "6px 8px",
        borderRadius: "16px",
        fontFamily: "Roboto",
      }}
    >
      {rowData.role}
    </span>
  );

  const handleDropDownChange = (name, value) => {
    setNewUser((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleInputChange = (e) => {
    setNewUser((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // write useEffect to getmasters data from backend
  useEffect(() => {
    if (getu_master_data.length === 0) {
      const needed_masters = ['role', 'designation', 'department', 'division'];
      fetch_master_data(needed_masters);
    }
  }, []); // Add empty dependency array

  const fetch_master_data = async (needed_masters) => {
    const body_data = {};
    body_data["needed_masters"] = needed_masters;
    const serverURL = process.env.REACT_APP_SERVER_URL;
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${serverURL}/master/get_master_data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'token': token 
      },
      body: JSON.stringify(body_data),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch master data');
    }

    const data = await response.json();
    console.log("master Data", data);
  };

  return (
    <Box p={2}>
      <div className="m-3 ml-4 p-3 bg-white border-round-sm">
        <div className="flex align-items-center" style={{ display: "flex", justifyContent: "space-between", alignItems: 'center' }}>
          <div className="flex flex-column">
            <div className="flex items-center" style={{ display: "flex", gap: "8px", alignItems: "center"}}>
              <h1 style={{ fontSize: "24px", fontWeight: "bold", color: "#2d3748", margin: "0" }}>
                User Management
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
            {selectedUsers.length === 0 ? (
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
                  onClick={() => setIsModalOpen(true)}
                >
                  Create New Profile
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  sx={{
                    height: "38px",
                    color: "black",
                    borderColor: "#b7bbc2",
                    backgroundColor: "#f9fafb",
                    borderWidth: "2px",
                    fontWeight: "600",
                    textTransform: 'none',
                    "&:hover": {
                      backgroundColor: "#f1f5f9",
                    },
                  }}
                  onClick={handleEdit}
                >
                  Edit User
                </Button>

                <Button
                  variant="outlined"
                  startIcon={<DoNotDisturbOnIcon />}
                  sx={{
                    height: "38px",
                    color: "#ef4444",
                    borderColor: "#ef4444",
                    backgroundColor: "#fef2f2",
                    borderWidth: "2px",
                    fontWeight: "600",
                    textTransform: 'none',
                    "&:hover": {
                      backgroundColor: "#fee2e2",
                    },
                  }}
                  onClick={handleDeactivate}
                >
                  De-activate Selected User
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Table View */}
      <div className="pt-4" style={{ overflowX: "auto" }}>
        <Box py={1}>
          <TableView rows={currentPageRows} columns={columns} handleNext={handleNext} handleBack={handleBack} backBtn={currentPage > 0} nextBtn={currentPage < totalPages - 1}/>
        </Box>
      </div>


      {/* Modal for Creating New User Or Edit user */}
      {isModalOpen && (
        <Modal
          title={modalTitle}
          visible={isModalOpen}
          onHide={handleCloseModal}
          onSave={handleSave}
          headerContent={<div className="modal-header-title p-3">{modalTitle}</div>}
          footerContent={
            <div className="space-x-2 w-full custom-footer mt-2">
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
                onClick={() => {
                  setIsModalOpen(false);
                  setModalTitle("Add New User");
                  setNewUser({
                    id: null,
                    name: "",
                    email: "",
                    contact: "",
                    role: "",
                    kgid: "",
                    status: "Active",
                    designation: "",
                    pin: "",
                    confirmPin: "",
                    district: "",
                    supervisor_designation: "",
                    division: "",
                    department: "",
                  });
                }}
              >
                Discard Changes
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
                onClick={handleSave}
              >
                {modalTitle === "Edit User" ? "Update User" : "Save & Close"}
              </Button>
            </div>
          }
        >
          <form className="py-4 px-4">
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <ShortText
                  field={{
                    name: "name",
                    label: "Enter Full Name",
                    required: true,
                    pattern: "^[a-zA-Z\\s]+$",
                  }}
                  formData={newUser}
                  errors={errors}
                  onChange={handleInputChange}
                />

              </Grid>

              <Grid item xs={12} sm={6}>
                <AutocompleteField
                  formData={newUser}
                  errors={errors}
                  field={{
                    name: "role",
                    label: "Select Role",
                    options: [
                      { name: "Admin IO", code: "Admin IO" },
                      { name: "CID Officers", code: "CID Officers" },
                      { name: "IO Officers", code: "IO Officers" }
                    ],
                  }}
                  onChange={handleDropDownChange}
                />
              </Grid>

              {/* Other Fields */}
              <Grid item xs={12} sm={6}>
                <ShortText
                  field={{
                    name: "email",
                    label: "Enter Email ID",
                    required: true,
                    pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$", // Correct email pattern
                  }}
                  formData={newUser}
                  errors={errors}
                  onChange={handleInputChange}
                />


              </Grid>

              <Grid item xs={12} sm={6}>
                <NumberField
                  field={{
                    name: "contact",
                    label: "Enter Contact Number",
                    required: true,
                    minLength: 10,
                    maxLength: 10,
                    info: "Enter a valid 10-digit contact number",
                  }}
                  formData={newUser}
                  errors={errors}
                  onChange={handleInputChange}
                />

              </Grid>

              <Grid item xs={12} sm={6}>
                <NumberField
                  field={{
                    name: "kgid",
                    label: "KGID Number",
                    required: true,
                    maxLength: 5,
                    info: "Enter a valid 5-digit KGID number",
                  }}
                  formData={newUser}
                  errors={errors}
                  onChange={handleInputChange}
                />

              </Grid>

              <Grid item xs={12} sm={6}>
                <AutocompleteField
                  formData={newUser}
                  errors={errors}
                  field={{
                    name: "district",
                    label: "District",
                    options: [
                      { name: "Bengaluru Urban", code: "Bengaluru Urban" },
                      { name: "Bengaluru Rural", code: "Bengaluru Rural" },
                      { name: "Chikkaballapur", code: "Chikkaballapur" },
                      { name: "Ramanagara", code: "Ramanagara" },
                      { name: "Kolar", code: "Kolar" },
                      { name: "Hassan", code: "Hassan" },
                      { name: "Tumkur", code: "Tumkur" },
                      { name: "Mandya", code: "Mandya" },
                      { name: "Vijayapura", code: "Vijayapura" }
                    ],
                    required: true
                  }}
                  onChange={handleDropDownChange}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <MultiSelect
                  formData={newUser}
                  errors={errors}
                  field={{
                    name: "designation",
                    label: "Designation",
                    options: [
                      { name: "DGP", code: "DGP" },
                      { name: "ADGP", code: "ADGP" },
                      { name: "IGP", code: "IGP" },
                      { name: "DIGP", code: "DIGP" },
                      { name: "DSP", code: "DSP" },
                      { name: "PI", code: "PI" }
                    ],
                    required: true
                  }}
                  onChange={handleDropDownChange}
                />

              </Grid>

              <Grid item xs={12} sm={6}>
                <AutocompleteField
                  formData={newUser}
                  errors={errors}
                  field={{
                    name: "department",
                    label: "Department",
                    options: [
                      { name: "CID", code: "CID" },
                      { name: "EO", code: "EO" }
                    ],
                    required: true
                  }}
                  onChange={handleDropDownChange}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <AutocompleteField
                  formData={newUser}
                  errors={errors}
                  field={{
                    name: "division",
                    label: "Division",
                    options: [
                      { name: "Administration", code: "Administration" },
                      { name: "Homicide and Burglary", code: "Homicide and Burglary" },
                      { name: "Special Enquiry", code: "Special Enquiry" },
                      { name: "Anti Human Trafficking Unit", code: "Anti Human Trafficking" },
                      { name: "Cyber Crime", code: "Cyber Crime" },
                      { name: "Economic offences", code: "Counter Felt Arms & Narcotics" },
                      { name: "Financial Intelligence", code: "Financial Intelligence" },
                      { name: "Deposit Fraud Investigation", code: "Deposit Fraud Investigation" },
                      { name: "Counter Felt Arms & Narcotics & Idol", code: "Counter Felt Arms & Narcotics & Idol" }
                    ],
                    required: true
                  }}
                  onChange={handleDropDownChange}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <div className="px-2">
                  <PasswordInput
                    id="pin"
                    label="Enter New Pin"
                    name="pin"
                    type="password"
                    value={newUser.pin || ""}
                    onChange={handleInputChange}
                    error={errors.pin}
                  />
                </div>
              </Grid>
              <Grid item xs={12} sm={6}>
                <div className="px-2">
                  <PasswordInput
                    id="confirmPin"
                    label="Re-enter New Pin"
                    name="confirmPin"
                    type="password"
                    value={newUser.confirmPin || ""}
                    onChange={handleInputChange}
                    error={errors.confirmPin}
                  />
                </div>
              </Grid>
            </Grid>
          </form>
        </Modal>
      )}

      {/* Success Popup */}
      <div>
        <Dialog
          open={showSuccessDialog}
          onClose={() => setShowSuccessDialog(false)}
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
                {modalTitle === "Edit User" ? "Profile Updated Successfully" : "Profile Added Successfully"}
              </p>
              <p
                style={{
                  fontSize: "16px",
                  color: "rgb(156, 163, 175)",
                  margin: 0,
                }}
              >
                {newUser.name}{" "}
                {modalTitle === "Edit User" ? "details have been updated" : "User Details have been added"}
              </p>
            </div>
          </DialogContent>
          <DialogActions sx={{ justifyContent: "center", padding: "10px 20px" }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setShowSuccessDialog(false)}
              sx={{ width: "100%", padding: "8px" }}
            >
              Done
            </Button>
          </DialogActions>
        </Dialog>
      </div>

      {/* De-activation conformation Popup */}
      <div>
        <Dialog
          open={isDeactivationDialogVisible}
          onClose={() => setDeactivationDialogVisible(false)}
          maxWidth="sm"
          fullWidth
          sx={{ borderRadius: "12px", padding: "15px", }}
        >
          <DialogContent sx={{ textAlign: "left" }}>
            <div style={{ display: "flex", alignItems: "center", marginBottom: "15px" }}>
              <div style={{ width: "60px", height: "60px", borderRadius: "50%", overflow: "hidden", background: "rgb(250 209 209)", padding: "3px", }}>
                <img src={ErrorIcon} alt="Warning Icon" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", }} />
              </div>
            </div>

            <p style={{ fontSize: "20px", fontWeight: "bold", }}>
              De-activate{" "}
              <span style={{ color: "red" }}>
                {selectedUsers.length < 10 ? `0${selectedUsers.length}` : selectedUsers.length} </span>{" "}
              <span style={{ color: "red" }}> Selected </span>{" "} profile(s)
            </p>

            <p style={{ fontSize: "16px", color: "rgb(156 163 175)", margin: 0 }} >
              Are you sure you want to deactivate the selected profile(s)? This action cannot be undone.
            </p>

          </DialogContent>

          <DialogActions sx={{ display: "flex", justifyContent: "center", padding: "10px 20px" }}>
            <Button
              variant="contained"
              color="danger"
              onClick={() => setDeactivationDialogVisible(false)}
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
                backgroundColor: "#ef4444",
                borderRadius: "5px",
                "&:hover": {
                  backgroundColor: "#dc2626",
                },
                width: "150px",
                boxShadow: "none",
              }}
              onClick={handleConfirmDeactivation}
            >
              De-activate
            </Button>
          </DialogActions>

        </Dialog>
      </div>

      {/* Success Notification */}
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

    </Box>
  );
};

export default UserManagement;
