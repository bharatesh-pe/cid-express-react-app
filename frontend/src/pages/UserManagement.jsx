import React, { useState, useRef, useEffect } from "react";
import Modal from "../components/Modal/Modal.jsx";
import PasswordInput from "../components/password_input/password_input";
import { Box, Checkbox, Grid } from '@mui/material';
import MultiSelect from "../components/form/MultiSelect.jsx";
import { Button, CircularProgress} from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import FilterListIcon from '@mui/icons-material/FilterList';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DoNotDisturbOnIcon from '@mui/icons-material/DoNotDisturbOn';
import { Chip } from '@mui/material';
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
  const [usergetupdated, setUserUpdatedFlag] = useState(false);
  const [pageSize, setPageSize] = useState(5);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeactivationDialogVisible, setDeactivationDialogVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("Add New User");
  const [loading, setLoading] = useState(false);

  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const columns = [
    {
      field: 'selection',
      headerName: '',
      renderCell: (params) => (
        <Checkbox
        checked={selectedUsers.includes(params.row.id)}
        onChange={() => handleSelectUser(params.row.id)}
        onClick={(e) => e.stopPropagation()}
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
  const handleRowClick = (row) => {
    handleSelectUser(row.id);
  };
  
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
    if (modalTitle !== "Edit User") {
      if (!newUser.pin) {
        newErrors.pin = "Pin is required";
      }
      if (newUser.pin !== newUser.confirmPin) {
        newErrors.confirmPin = "Pin does not match";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };



  useEffect(() => {
    fetchUsers();
  }, []);


  const fetchUsers = async () => {
    setLoading(true);
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
        role_id: user.role.role_id,
        role: user.role.role_title,
        kgid: user.kgid,
        designation_id: user.users_designations?.map(d => d.designation_id).join(", ") || "N/A",
        designation: user.users_designations?.map(d => d.designation?.designation_name).join(", ") || "N/A",
        department_id: user.users_departments?.map(d => d.department_id).join(", ") || "N/A",
        department: user.users_departments?.map(d => d.department?.department_name).join(", ") || "N/A",
        division_id: user.users_divisions?.map(d => d.division_id).join(", ") || "N/A",
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

  const handleFilters = async () => { 
    setLoading(true);
    try {
        const filters = {};
        if (newUser.name) filters.name = newUser.name;
        if (newUser.kgid) filters.kgid = newUser.kgid;
        if (newUser.role) filters.role_id = newUser.role;
        if (newUser.department) filters.department_id = newUser.department;
        if (newUser.division) filters.division_id = newUser.division;
        if (newUser.designation) filters.designation_id = newUser.designation;
        if (newUser.dev_status !== undefined) filters.dev_status = newUser.dev_status;

        // Call API to fetch filtered users
        const response = await api.post("/user/filter_users", filters);
        const users = response.users || response.data?.users;

        if (!users || !Array.isArray(users)) {
            toast.error("Failed to fetch filtered users.", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                className: "toast-error",
            });
            return;
        }

        // **Reformat the data before setting it**
        const formattedUsers = users.map(user => ({
            id: user.user_id, // Ensure unique ID for MUI Data Grid
            user_id: user.user_id,
            name: user.name,
            role_id: user.role?.role_id || "N/A",
            role: user.role?.role_title || "N/A",
            kgid: user.kgid,
            designation_id: user.users_designations?.map(d => d.designation_id).join(", ") || "N/A",
            designation: user.users_designations?.map(d => d.designation?.designation_name).join(", ") || "N/A",
            department_id: user.users_departments?.map(d => d.department_id).join(", ") || "N/A",
            department: user.users_departments?.map(d => d.department?.department_name).join(", ") || "N/A",
            division_id: user.users_divisions?.map(d => d.division_id).join(", ") || "N/A",
            division: user.users_divisions?.map(d => d.division?.division_name).join(", ") || "N/A",
            status: user.dev_status ? "Active" : "Inactive",
            dev_status: user.dev_status,
        }));

        setUsers(formattedUsers);

        toast.success("Filters applied successfully!", {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            className: "toast-success",
        });

        setIsModalOpen(false);
        setModalTitle("Add New User");

    } catch (err) {
        toast.error(err?.message || "Error applying filters. Please try again.", {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            className: "toast-warning",
        });
    } finally {
        setLoading(false);
    }
};


  const handleSave = async () => {
    setLoading(true);
    
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
          transaction_id: newUser.transaction_id,
          user_id: newUser.id,
          username: newUser.name,
          role_id: newUser.role,
          kgid: newUser.kgid,
          designation_id: Array.isArray(newUser.designation) ? newUser.designation.join(",") : newUser.designation,
          department_id: newUser.department,
          division_id: newUser.division,
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

  const handleEdit = (selectedUsers) => {
    if (!selectedUsers || selectedUsers.length === 0) {
      console.error("No valid user selected for editing.");
      return;
    }
    const userToEdit = users.find(user => user.id === selectedUsers[0]);

    if (!userToEdit) {
      console.error("No matching user found.");
      return;
    }
    const designationArray = userToEdit.designation_id
      ? userToEdit.designation_id.split(",").map(id => id.trim())
      : [];

    setNewUser((prevState) => ({
      ...prevState,
      id: userToEdit.id,
      name: userToEdit.name ?? "",
      kgid: userToEdit.kgid ?? "",
      role: roleOptions.find(option => String(option.code) === String(userToEdit.role_id))?.code || "",
      designation: designationOptions
        .filter(option => designationArray.includes(String(option.code)))
        .map(option => option.code),
      department: departmentOptions.find(option => String(option.code) === String(userToEdit.department_id))?.code || "",
      division: divisionOptions.find(option => String(option.code) === String(userToEdit.division_id))?.code || "",
      transaction_id: `edit_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
    }));

    setModalTitle("Edit User");
    setIsModalOpen(true);
  };

  const handleView = (selectedUsers) => {
    if (!selectedUsers || selectedUsers.length === 0) {
      console.error("No valid user selected for editing.");
      return;
    }
    const userToEdit = users.find(user => user.id === selectedUsers[0]);

    if (!userToEdit) {
      console.error("No matching user found.");
      return;
    }
    const designationArray = userToEdit.designation_id
      ? userToEdit.designation_id.split(",").map(id => id.trim())
      : [];

    setNewUser((prevState) => ({
      ...prevState,
      id: userToEdit.id,
      name: userToEdit.name ?? "",
      kgid: userToEdit.kgid ?? "",
      role: roleOptions.find(option => String(option.code) === String(userToEdit.role_id))?.code || "",
      designation: designationOptions
        .filter(option => designationArray.includes(String(option.code)))
        .map(option => option.code),
      department: departmentOptions.find(option => String(option.code) === String(userToEdit.department_id))?.code || "",
      division: divisionOptions.find(option => String(option.code) === String(userToEdit.division_id))?.code || "",
      transaction_id: `edit_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
    }));

    setModalTitle("View User");
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
      toast.error("Please select users to proceed.", {
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

    const newTransactionId = `toggle_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    setTransactionId(newTransactionId);
    setDeactivationDialogVisible(true);
  };

  const handleConfirmToggleActivation = async () => {
    if (!transactionId) {
      toast.error("Transaction ID is required.", {
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

    if (!selectedUsers || selectedUsers.length === 0) {
      toast.error("Please select users to proceed.", {
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

      toast.success(response.message || "Action changed Successfully", {
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
    {rowData.role?.role_title ||rowData.role}    </span>
  );

  const handleDropDownChange = (fieldName, value) => {
    setNewUser((prev) => ({
      ...prev,
      [fieldName]: value?.code || "",
      dev_status: value?.code === "Active"
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
    setLoading(true);
    try {
      const body_data = { needed_masters };
      const data = await api.post("/master/get_master_data", body_data);
  
      setMasterData(data);
    } catch (error) {
      console.error("Error fetching master data:", error);
    }
    setLoading(false);
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

  const statusOptions = [
    { name: "Active", code: "active" },
    { name: "Inactive", code: "inactive" }
  ];
  

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
                  onClick={() => {
                    setIsModalOpen(true);
                    setModalTitle("Set Filters");
                    setNewUser({
                      id: null,
                      name: "",
                      role: "",
                      kgid: "",
                      designation: "",
                      division: "",
                      department: "",
                    });
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
                  startIcon={<VisibilityIcon />}
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
                  onClick={() => handleView(selectedUsers)}
                >
                  View User
                </Button>
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
                  onClick={() => handleEdit(selectedUsers)}
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
          <TableView 
            rows={currentPageRows} 
            columns={columns} 
            getRowId={(row) => row.user_id} 
            handleRowClick={handleRowClick}
            handleNext={handleNext}   
            handleBack={handleBack} 
            backBtn={currentPage > 0} 
            nextBtn={currentPage < totalPages - 1} 
          />
        </Box>
      </div>


      {/* Modal for Creating New User Or Edit user */}
      {isModalOpen&& (
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
                {modalTitle === "View User" ? "Close" : "Discard Changes"}
              </Button>
          
              {modalTitle !== "View User" && (
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
                  onClick={modalTitle === "Set Filters" ? handleFilters : handleSave}
                  >
                {modalTitle === "Edit User" ? "Update User" : modalTitle === "Set Filters" ? "Set Filters" : "Save & Close"}
              </Button>
              )}
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
                  }}
                  formData={newUser}
                  errors={errors}
                  onChange={handleInputChange}
                  readOnly={modalTitle === "View User"}
                  />

              </Grid>
              <Grid item xs={12} sm={6}>
                <AutocompleteField
                  formData={newUser}
                  errors={errors}
                  field={{
                    name: "role",
                    label: "Select Role",
                    options: roleOptions,
                    required: modalTitle !== "Set Filters",
                  }}
                  value={newUser.role}
                  onChange={handleDropDownChange}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <NumberField
                  field={{
                    name: "kgid",
                    label: "KGID Number",
                    required: modalTitle !== "Set Filters",
                    // maxLength: 5,
                  }}
                  formData={newUser}
                  errors={errors}
                  onChange={handleInputChange}
                  readOnly={modalTitle === "View User"}
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
                    required: modalTitle !== "Set Filters",
                  }}
                  value={newUser.designation}
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
                    required: modalTitle !== "Set Filters",
                  }}
                  value={newUser.department}
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
                    required: modalTitle !== "Set Filters",
                  }}
                  value={newUser.division}
                  onChange={handleDropDownChange}
                />
              </Grid>

              {modalTitle !== "Edit User" && modalTitle!== "View User"  && modalTitle!== "Set Filters" && (
                <>
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
                </>
              )}
              {/* {modalTitle == "Set Filters" && (
                <>
                <Grid item xs={12} sm={6}>
                <AutocompleteField
  formData={newUser}
  errors={errors}
  field={{
    name: "status",
    label: "Status",
    options: statusOptions,
    required: modalTitle !== "Set Filters",
  }}
  value={statusOptions.find(option => option.code === newUser.status) || null}
  onChange={(field, value) => handleDropDownChange("status", value)}
/>

              </Grid>                
                </>
              )} */}
            </Grid>
          </form>
        </Modal>
      )}

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
              <span> Selected </span> profile
            </p>

            <p style={{ fontSize: "16px", color: "rgb(156 163 175)", margin: 0 }}>
              Are you sure you want to {actionText.toLowerCase()} the selected profile? This action
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
                  {
                      loading && <div className='parent_spinner' tabIndex="-1" aria-hidden="true">
                          <CircularProgress size={100} />
                      </div>
                  }
    </Box>
  );
};

export default UserManagement;
