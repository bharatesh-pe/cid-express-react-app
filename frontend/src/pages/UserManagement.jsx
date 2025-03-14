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
import api from '../services/api';
import { toast } from 'react-toastify';

const UserManagement = () => {
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [usergetupdated, setUserUpdatedFlag] = useState(false);
  // const [getu_master_data, setMasterData] = useState([]);
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

  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get("/user/get_users");
      const users = response.users || response.data?.users;
      if (!users || !Array.isArray(users)) {
        throw new Error("Invalid API response format: 'users' is not an array");
      }
      const formattedUsers = users.map(user => ({
        id: user.user_id,
        user_id: user.user_id,
        name: user.name,
        role: user.role_id,
        kgid: user.kgid,
        designation: user.users_designations?.map(d => d.designation?.designation_name).join(", ") || "N/A",
        department: user.users_departments?.map(d => d.department?.department_name).join(", ") || "N/A",
        division: user.users_divisions?.map(d => d.division?.division_name).join(", ") || "N/A",
        status: user.dev_status ? "Active" : "Inactive",
        dev_status: user.dev_status,
      }));

      setUsers(formattedUsers);

    } catch (err) {
      setError("Failed to fetch users.");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      field: 'selection',
      headerName: '',
      renderCell: (params) => (
        <Checkbox
          checked={selectedUsers.includes(params.row.id)}
          onChange={() => handleSelectUser(params.row.id)}
        />
      ),
    },
    {
      field: 'name',
      headerName: 'Name',
      flex: 1,
      sortable: true,
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
      field: 'designation',
      headerName: 'Designation',
      flex: 0.8,
      sortable: true,
    },
    {
      field: 'department',
      headerName: 'Department',
      flex: 0.8,
      sortable: true,
    },
    {
      field: 'division',
      headerName: 'Division',
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
    role: "",
    kgid: "",
    designation: "",
    pin: "",
    confirmPin: "",
    division: "",
    department: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    role: "",
    designation: "",
    pin: "",
    confirmPin: "",
    division: "",
    department: "",
  });

  const validateForm = () => {
    const newErrors = {};

    if (!newUser.name) {
      newErrors.name = "Name is required";
    }
    if (!newUser.role) {
      newErrors.role = "Role is required";
    }
    if (!newUser.kgid) {
      newErrors.kgid = "KGID is required";
    }
    if (!newUser.designation || newUser.designation.length === 0) {
      newErrors.designation = "Designation is required";
    }
    if (!newUser.division) {
      newErrors.division = "Division is required";
    }
    if (!newUser.department) {
      newErrors.department = "Department is required";
    }
    if (!newUser.pin) {
      newErrors.pin = "Pin is required";
    }
    if (newUser.pin !== newUser.confirmPin) {
      newErrors.confirmPin = "Pin does not match";
    }
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
      if (prevSelected.includes(userId)) {
        setNewUser({});
        return [];
      } else {
        const selectedUser = users.find((user) => user.id === userId);
        if (selectedUser) {
          setNewUser(selectedUser);
        }
        return [userId];
      }
    });
  };
  const handleEdit = (user) => {
    if (!user || !user.id) {
      console.error("Invalid user data for editing.");
      return;
    }
    const transaction_id = `edit_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    setNewUser({
      ...user,
      transaction_id: transaction_id,
    });

    setModalTitle("Edit User");
    setIsModalOpen(true);
  };

  const [transactionId, setTransactionId] = useState("");

  const selectedUsersWithStatus = selectedUsers.map(id =>
    users.find(user => user.id === id) || { id, dev_status: null }
  );

  const allUsersInactive = selectedUsersWithStatus.every(user => user.dev_status === false);
  const actionText = allUsersInactive ? "Activate" : "Deactivate";
  const actionColor = allUsersInactive ? "#22c55e" : "#ef4444";

  const handleToggleActivation = () => {
    if (selectedUsers.length === 0) {
      setSnackbarMessage("Please select users to proceed.");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
      return;
    }

    const newTransactionId = `toggle_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    setTransactionId(newTransactionId);
    setDeactivationDialogVisible(true);
  };

  const handleConfirmToggleActivation = async () => {
    if (!transactionId) {
      setSnackbarMessage("Transaction ID is required.");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
      return;
    }

    if (!selectedUsers || selectedUsers.length === 0) {
      setSnackbarMessage("Please select users to proceed.");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
      return;
    }

    setLoading(true);

    try {
      const userIds = selectedUsers;
      const newStatus = allUsersInactive;

      const response = await api.post("/user/user_active_deactive", {
        transaction_id: transactionId,
        user_id: userIds,
        dev_status: newStatus,
      });

      if (!response || !response.success) {
        toast.error(response.message || "Failed to create role", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          className: "toast-error",
        });
        return;
      }

      toast.success(response.message || "Action changedSuccessfully", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        className: "toast-success"
      });


      setUsers(prevUsers =>
        prevUsers.map(user =>
          userIds.includes(user.id) ? { ...user, dev_status: newStatus } : user
        )
      );



      fetchUsers();
    } catch (err) {
      toast.error(err?.message || "Something went wrong. Please try again.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        className: "toast-warning",
      });
    } finally {
      setLoading(false);
      setDeactivationDialogVisible(false);
      setSelectedUsers([]);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setValidationError('');

    if (!validateForm()) {
      toast.error("Validation failed. Please check the form.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      setLoading(false);
      return;
    }

    try {
      const endpoint = newUser.id ? '/update_user' : '/create_user';

      if (!newUser.transaction_id) {
        newUser.transaction_id = `user_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
      }

      const requestBody = newUser.id
        ? {
          user_id: newUser.id,
          username: newUser.name,
          role_id: newUser.role,
          kgid: newUser.kgid,
          pin: newUser.pin,
          designation_id: Array.isArray(newUser.designation) ? newUser.designation.join(",") : newUser.designation,
          department_id: newUser.department,
          division_id: newUser.division
        }
        : {
          transaction_id: newUser.transaction_id,
          username: newUser.name,
          role_id: newUser.role,
          kgid: newUser.kgid,
          pin: newUser.pin,
          designation_id: Array.isArray(newUser.designation) ? newUser.designation.join(",") : newUser.designation,
          department_id: newUser.department,
          division_id: newUser.division,
          created_by: "1"
        };

      const response = await api.post(`/user${endpoint}`, requestBody);

      if (!response || !response.success) {
        toast.error(response.message || "Failed to create role", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          className: "toast-error",
        });
        return;
      }

      toast.success(response.message || "User Created Successfully", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        className: "toast-success"
      });

      if (newUser.id) {
        setUsers(users.map((user) => (user.id === newUser.id ? newUser : user)));
        setUserUpdatedFlag(true);
      } else {
        setUsers([...users, { ...newUser, id: users.length + 1 }]);
        setUserUpdatedFlag(false);
      }

      setNewUser({
        name: "",
        role: "",
        kgid: "",
        designation: "",
        pin: "",
        confirmPin: "",
        division: "",
        department: "",
      });

      setSelectedUsers([]);
      fetchUsers();
      setIsModalOpen(false);

    } catch (err) {
      toast.error(err?.message || "Something went wrong. Please try again.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        className: "toast-warning",
      });

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

  const [masterData, setMasterData] = useState({ role: [], designation: [], department: [], division: [] });

  useEffect(() => {
    if (Object.keys(masterData).length === 0 || masterData.role.length === 0) {
      const needed_masters = ["role", "designation", "department", "division"];
      fetch_master_data(needed_masters);
    }
  }, []);

  const fetch_master_data = async (needed_masters) => {
    try {
      const body_data = { needed_masters };
      const serverURL = process.env.REACT_APP_SERVER_URL;
      const token = localStorage.getItem("auth_token");

      const response = await fetch(`${serverURL}/master/get_master_data`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token: token,
        },
        body: JSON.stringify(body_data),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch master data");
      }

      const data = await response.json();

      setMasterData(data);
    } catch (error) {
      console.error("Error fetching master data:", error);
    }
  };

  const roleOptions = masterData?.role?.map((item) => ({
    name: item.name,
    code: item.code.toString(),
  })) || [];

  const designationOptions = masterData?.designation?.map((item) => ({
    name: item.name,
    code: item.code.toString(),
  })) || [];

  const departmentOptions = masterData?.department?.map((item) => ({
    name: item.name,
    code: item.code.toString(),
  })) || [];

  const divisionOptions = masterData?.division?.map((item) => ({
    name: item.name,
    code: item.code.toString(),
  })) || [];


  return (
    <Box p={2}>
      <div className="m-3 ml-4 p-3 bg-white border-round-sm">
        <div className="flex align-items-center" style={{ display: "flex", justifyContent: "space-between", alignItems: 'center' }}>
          <div className="flex flex-column">
            <div className="flex items-center" style={{ display: "flex", gap: "8px", alignItems: "center" }}>
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
                  onClick={() => {
                    const transactionId = `user_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
                    setNewUser((prevUser) => ({
                      ...prevUser,
                      transaction_id: transactionId,
                    }));
                    setIsModalOpen(true);
                  }}                >
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
                  onClick={() => handleEdit()}  // Pass the selected user
                >
                  Edit User
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={allUsersInactive ? <CheckCircleIcon /> : <DoNotDisturbOnIcon />}
                  sx={{
                    height: "38px",
                    color: actionColor,
                    borderColor: actionColor,
                    backgroundColor: allUsersInactive ? "#dcfce7" : "#fef2f2",
                    borderWidth: "2px",
                    fontWeight: "600",
                    textTransform: "none",
                    "&:hover": {
                      backgroundColor: allUsersInactive ? "#bbf7d0" : "#fee2e2",
                    },
                  }}
                  onClick={handleToggleActivation}
                >
                  {actionText} Selected User{selectedUsers.length > 1 ? "s" : ""}
                </Button>

              </>
            )}
          </div>
        </div>
      </div>

      {/* Table View */}
      <div className="pt-4" style={{ overflowX: "auto" }}>
        <Box py={1}>
          <TableView rows={currentPageRows} columns={columns} handleNext={handleNext} handleBack={handleBack} backBtn={currentPage > 0} nextBtn={currentPage < totalPages - 1} />
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
                    role: "",
                    kgid: "",
                    designation: "",
                    pin: "",
                    confirmPin: "",
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
                    options: roleOptions
                  }}
                  onChange={handleDropDownChange}
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
                <MultiSelect
                  formData={newUser}
                  errors={errors}
                  field={{
                    name: "designation",
                    label: "Designation",
                    options: designationOptions,
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
                    options: departmentOptions,
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
                    options: divisionOptions,
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
          sx={{ borderRadius: "12px", padding: "15px" }}
        >
          <DialogContent sx={{ textAlign: "left" }}>
            <div style={{ display: "flex", alignItems: "center", marginBottom: "15px" }}>
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "50%",
                  overflow: "hidden",
                  background: allUsersInactive ? "rgb(209 250 229)" : "rgb(250 209 209)",
                  padding: "3px",
                }}
              >
                <img
                  src={ErrorIcon}
                  alt="Warning Icon"
                  style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }}
                />
              </div>
            </div>

            <p style={{ fontSize: "20px", fontWeight: "bold" }}>
              {actionText}{" "}
              <span style={{ color: actionColor }}>
                {selectedUsers.length < 10 ? `0${selectedUsers.length}` : selectedUsers.length}
              </span>{" "}
              <span style={{ color: actionColor }}> Selected </span> profile(s)
            </p>

            <p style={{ fontSize: "16px", color: "rgb(156 163 175)", margin: 0 }}>
              Are you sure you want to {actionText.toLowerCase()} the selected profile(s)? This action
              cannot be undone.
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
                backgroundColor: actionColor,
                borderRadius: "5px",
                "&:hover": {
                  backgroundColor: allUsersInactive ? "#16a34a" : "#dc2626",
                },
                width: "150px",
                boxShadow: "none",
              }}
              onClick={handleConfirmToggleActivation}
            >
              {actionText}
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
