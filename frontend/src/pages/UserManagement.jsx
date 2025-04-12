import React, { useState, useRef, useEffect } from "react";
import Modal from "../components/Modal/Modal.jsx";
import PasswordInput from "../components/password_input/password_input";
import { Box, Checkbox, Grid } from "@mui/material";
import {
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
} from "@mui/material";
import MultiSelect from "../components/form/MultiSelect.jsx";
import { Button, CircularProgress } from "@mui/material";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import FilterListIcon from "@mui/icons-material/FilterList";
import EditIcon from "@mui/icons-material/Edit";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DoNotDisturbOnIcon from "@mui/icons-material/DoNotDisturbOn";
import { Chip } from "@mui/material";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import { CheckCircle as CheckCircleIcon } from "@mui/icons-material";
import TableView from "../components/table-view/TableView";
import ErrorIcon from "../Images/erroricon.png";
import AutocompleteField from "../components/form/AutoComplete";
import ShortText from "../components/form/ShortText.jsx";
import NumberField from "../components/form/NumberField.jsx";
import api from "../services/api";
import { toast } from "react-toastify";
import CloseIcon from "@mui/icons-material/Close";
import ClearIcon from '@mui/icons-material/Clear';
import TextFieldInput from '@mui/material/TextField';
import SearchIcon from '@mui/icons-material/Search';
import { InputAdornment } from "@mui/material"

const UserManagement = () => {
  const [usergetupdated, setUserUpdatedFlag] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeactivationDialogVisible, setDeactivationDialogVisible] =
    useState(false);
  const [modalTitle, setModalTitle] = useState("Add New User");
  const [loading, setLoading] = useState(false);
  const [isFilterApplied, setIsFilterApplied] = useState(false);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [logs, setLogs] = useState([]);
  const [openLogDialog, setOpenLogDialog] = useState(false);
  const [LogDialogTitle, SetLogDialogTitle] = useState("");
  const [searchValue, setSearchValue] = useState(null);
  const columns = [
    {
      field: "selection",
      headerName: "",
      renderCell: (params) => (
        <Checkbox
          checked={selectedUsers.includes(params.row.id)}
          onChange={() => handleSelectUser(params.row.id)}
          onClick={(e) => e.stopPropagation()}
        />
      ),
    },
    {
      field: "name",
      headerName: "Name",
      flex: 1,
      sortable: true,
    },
    {
      field: "role",
      headerName: "Role",
      flex: 1,
      sortable: true,
      renderCell: (params) => roleBodyTemplate(params.row),
    },
    {
      field: "kgid",
      headerName: "KGID No",
      flex: 0.8,
      sortable: true,
    },
    {
      field: "mobile",
      headerName: "Mobile No",
      flex: 0.8,
      sortable: true,
    },
    {
      field: "designation",
      headerName: "Designation",
      flex: 0.8,
      sortable: true,
    },
    {
      field: "department",
      headerName: "Department",
      flex: 0.8,
      sortable: true,
    },
    {
      field: "division",
      headerName: "Division",
      flex: 0.8,
      sortable: true,
    },
    {
      field: "status",
      headerName: "Status",
      flex: 0.8,
      sortable: true,
      renderCell: (params) => statusBodyTemplate(params.row),
    },
  ];

  const totalPages = Math.ceil(users.length / pageSize);
  const currentPageRows = users.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );

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
    mobile: "",
    designation: "",
    supervisor_designation: "",
    pin: "",
    confirmPin: "",
    division: "",
    department: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    role: "",
    mobile: "",
    designation: "",
    supervisor_designation: "",
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
    if (!newUser.mobile) {
      newErrors.mobile = "Mobile is required";
    }
    if (!newUser.designation || newUser.designation.length === 0) {
      newErrors.designation = "Designation is required";
    }
    // if (!newUser.supervisor_designation || newUser.supervisor_designation.length === 0) {
    //   newErrors.supervisor_designation = "Supervisor Designation is required";
    // }
    if (!newUser.division || newUser.division.length === 0) {
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

  const getUsermanagementFieldLog = async (field) => {
    console.log("selected users", selectedUsers);
    var user_id = "";
    if (selectedUsers && selectedUsers[0]) user_id = selectedUsers[0];
    else {
      console.log("the user id is missing please check.");
      return;
    }
    setLoading(true);
    try {
      const body_data = { field: field, user_id: user_id };
      const response = await api.post(
        "/user/get_user_management_logs",
        body_data
      );
      const fetchedLogs = response.logs || response.data?.logs;
      if (!fetchedLogs || !Array.isArray(fetchedLogs)) {
        throw new Error("Invalid API response format: 'logs' is not an array");
      }
      const log_model_title = field.charAt(0).toUpperCase() + field.slice(1);
      setLogs(fetchedLogs);
      setOpenLogDialog(true);
      SetLogDialogTitle(log_model_title);
    } catch (err) {
      console.log(err);
      let errorMessage = err.message || "Failed to fetch field logs.";
      if (err?.response?.data?.message) {
        errorMessage =
          err?.response?.data?.message || "Failed to fetch field logs.";
      }
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        className: "toast-warning",
      });
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get("/user/get_users");
      const users = response.users || response.data?.users;
      if (!users || !Array.isArray(users)) {
        throw new Error("Invalid API response format: 'users' is not an array");
      }
      const formattedUsers = users.map((user) => ({
        id: user.user_id,
        user_id: user.user_id,
        name: user.kgidDetails.name,
        role_id: user.role.role_id,
        role: user.role.role_title,
        kgid: user.kgidDetails.kgid,
        mobile: user.kgidDetails.mobile,
        designation_id:
          user.users_designations?.map((d) => d.designation_id).join(", ") ||
          "N/A",
        designation:
          user.users_designations
            ?.map((d) => d.designation?.designation_name)
            .join(", ") || "N/A",
        department_id:
          user.users_departments?.map((d) => d.department_id).join(", ") ||
          "N/A",
        department:
          user.users_departments
            ?.map((d) => d.department?.department_name)
            .join(", ") || "N/A",
        division_id:
          user.users_division?.map((d) => d.division_id).join(", ") || "N/A",
        division:
          user.users_division
            ?.map((d) => d.division?.division_name)
            .join(", ") || "N/A",
        status: user.dev_status ? "Active" : "Inactive",
        dev_status: user.dev_status,
      }));

      setUsers(formattedUsers);
    } catch (err) {
      console.log(err);
      let errorMessage = err.message || "Failed to fetch users.";
      if (err?.response?.data?.message) {
        errorMessage = err?.response?.data?.message || "Failed to fetch users.";
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleFilters = async () => {
    setLoading(true);
    try {
      const filters = {};
      if (searchValue) filters.searchvalue = searchValue;
      if (newUser.name) filters.name = newUser.name;
      if (newUser.kgid) filters.kgid = newUser.kgid;
      if (newUser.role) filters.role_id = newUser.role;
      if (newUser.mobile) filters.mobile = newUser.mobile;
      if (newUser.department) filters.department_id = newUser.department;
      if (newUser.division) filters.division_id = newUser.division;
      if (newUser.designation) filters.designation_id = newUser.designation;
      if (newUser.dev_status !== undefined)
        filters.dev_status = newUser.dev_status;

     
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

      const formattedUsers = users.map((user) => ({
        id: user.user_id,
        user_id: user.user_id,
        name: user.kgidDetails.name,
        role_id: user.role.role_id,
        role: user.role.role_title,
        kgid: user.kgidDetails.kgid,
        mobile: user.kgidDetails.mobile,
        designation_id:
          user.users_designations?.map((d) => d.designation_id).join(", ") ||
          "N/A",
        designation:
          user.users_designations
            ?.map((d) => d.designation?.designation_name)
            .join(", ") || "N/A",
        department_id:
          user.users_departments?.map((d) => d.department_id).join(", ") ||
          "N/A",
        department:
          user.users_departments
            ?.map((d) => d.department?.department_name)
            .join(", ") || "N/A",
        division_id:
          user.users_division?.map((d) => d.division_id).join(", ") || "N/A",
        division:
          user.users_division
            ?.map((d) => d.division?.division_name)
            .join(", ") || "N/A",
        status: user.dev_status ? "Active" : "Inactive",
        dev_status: user.dev_status,
      }));

      setUsers(formattedUsers);
      setCurrentPage(0);
      if (searchValue || Object.keys(filters).length === 0) {
        setIsFilterApplied(false);
      } else {
        setIsFilterApplied(true);
      }
      setNewUser({});
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
      let errorMessage =
        err.message || "Error applying filters. Please try again.";
      if (err?.response?.data?.message) {
        errorMessage =
          err?.response?.data?.message ||
          "Error applying filters. Please try again.";
      }
      toast.error(errorMessage, {
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
        className: "toast-error",
      });
      setLoading(false);
      return;
    }
    if (modalTitle === "Reset Pin") {
      setErrors({});
      if (!newUser.pin) {
        toast.error("Pin is required.", {
          position: "top-right",
          autoClose: 3000,
          className: "toast-error",
        });
        setLoading(false);
        return;
      }
  
      if (newUser.pin !== newUser.confirmPin) {
        toast.error("Pins do not match.", {
          position: "top-right",
          autoClose: 3000,
          className: "toast-error",
        });
        setLoading(false);
        return;
      }
  
      try {
        const requestBody = {
          kgid: newUser.kgid,
          pin: newUser.pin,
        };
  
        const response = await api.post("/auth/update_pin", requestBody);
  
        if (!response || !response.success) {
          toast.error(response.message || "Failed to reset PIN.", {
            position: "top-right",
            autoClose: 3000,
            className: "toast-error",
          });
          setLoading(false);
          return;
        }
  
        toast.success(response.message || "PIN updated successfully.", {
          position: "top-right",
          autoClose: 3000,
          className: "toast-success",
        });
        setSelectedUsers([]);
        fetchUsers();
        setModalTitle("Add New User");
        setIsModalOpen(false);
        setNewUser({
          name: "",
          role: "",
          kgid: "",
          mobile: "",
          designation: "",
          pin: "",
          confirmPin: "",
          division: "",
          department: "",
        });
  
        setLoading(false);
        return;
      } catch (err) {
        toast.error(err?.message || "Something went wrong while resetting PIN.", {
          position: "top-right",
          autoClose: 3000,
          className: "toast-warning",
        });
        setLoading(false);
        return;
      }
    }
    const supervisorDesignationMap = masterData.supervisor_designation || {};

    const userDesignations = Array.isArray(newUser.designation)
      ? newUser.designation
      : [newUser.designation];

    console.log("userDesignations", userDesignations);
    console.log("supervisorDesignationMap", supervisorDesignationMap);
    const isValidDesignation = userDesignations
      .map((des) => parseInt(des, 10))
      .every((des) => {
        return Object.values(supervisorDesignationMap).some(
          (validSupervisors) => validSupervisors.includes(des)
        );
      });

    if (!isValidDesignation) {
      toast.error(
        "Supervisor designation missing for selected Designation. Please check the Hierarchy",
        {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          className: "toast-error",
        }
      );
      setLoading(false);
      return;
    }

    try {
      const endpoint = newUser.id ? "/update_user" : "/create_user";

      if (!newUser.transaction_id) {
        newUser.transaction_id = `user_${Date.now()}_${Math.floor(
          Math.random() * 10000
        )}`;
      }

      const requestBody = newUser.id
        ? {
            transaction_id: newUser.transaction_id,
            user_id: newUser.id,
            username: newUser.name,
            mobile: newUser.mobile,
            role_id: newUser.role,
            kgid: newUser.kgid,
            designation_id: Array.isArray(newUser.designation)
              ? newUser.designation.join(",")
              : newUser.designation,
            department_id: newUser.department,
            division_id: Array.isArray(newUser.division)
              ? newUser.division.join(",")
              : newUser.division,
            created_by: "1",
          }
        : {
            transaction_id: newUser.transaction_id,
            username: newUser.name,
            mobile: newUser.mobile,
            user_id: newUser.id,
            role_id: newUser.role,
            kgid: newUser.kgid,
            pin: newUser.pin,
            designation_id: Array.isArray(newUser.designation)
              ? newUser.designation.join(",")
              : newUser.designation,
            department_id: newUser.department,
            division_id: Array.isArray(newUser.division)
              ? newUser.division.join(",")
              : newUser.division,
            created_by: "1",
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
        className: "toast-success",
      });

      if (newUser.id) {
        setUsers(
          users.map((user) => (user.id === newUser.id ? newUser : user))
        );
        setUserUpdatedFlag(true);
      } else {
        setUsers([...users, { ...newUser, id: users.length + 1 }]);
        setUserUpdatedFlag(false);
      }

      setNewUser({
        name: "",
        role: "",
        mobile: "",
        kgid: "",
        designation: "",
        supervisor_designation: "",
        pin: "",
        confirmPin: "",
        division: "",
        department: "",
      });

      setSelectedUsers([]);
      fetchUsers();
      setIsModalOpen(false);
    } catch (err) {
      let errorMessage =
        err.message || "Something went wrong. Please try again.";
      if (err?.response?.data?.message) {
        errorMessage =
          err?.response?.data?.message ||
          "Something went wrong. Please try again.";
      }
      toast.error(errorMessage, {
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
    const userToEdit = users.find((user) => user.id === selectedUsers[0]);

    if (!userToEdit) {
      console.error("No matching user found.");
      return;
    }
    const designationArray = userToEdit.designation_id
      ? userToEdit.designation_id.split(",").map((id) => id.trim())
      : [];

    const divisionArray = userToEdit.division_id
      ? userToEdit.division_id.split(",").map((id) => id.trim())
      : [];

    const selectedKgid = kgidOptions.find(
      (option) => String(option.name) === String(userToEdit.kgid)
    );

    console.log("KGID Options:", kgidOptions);
    console.log("User KGID:", userToEdit.kgid);

    setNewUser((prevState) => ({
      ...prevState,
      id: userToEdit.id,
      name: userToEdit.name ?? "",
      mobile: selectedKgid?.mobile ?? userToEdit.mobile ?? "",
      kgid: selectedKgid?.code ?? userToEdit.kgid ?? "",
      role:
        roleOptions.find(
          (option) => String(option.code) === String(userToEdit.role_id)
        )?.code || "",
      designation: designationOptions
        .filter((option) => designationArray.includes(String(option.code)))
        .map((option) => option.code),
      department:
        departmentOptions.find(
          (option) => String(option.code) === String(userToEdit.department_id)
        )?.code || "",
      division: divisionOptions
        .filter((option) => divisionArray.includes(String(option.code)))
        .map((option) => option.code),
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
    const userToEdit = users.find((user) => user.id === selectedUsers[0]);

    if (!userToEdit) {
      console.error("No matching user found.");
      return;
    }
    const designationArray = userToEdit.designation_id
      ? userToEdit.designation_id.split(",").map((id) => id.trim())
      : [];

    const divisionArray = userToEdit.division_id
      ? userToEdit.division_id.split(",").map((id) => id.trim())
      : [];

    const selectedKgid = kgidOptions.find(
      (option) => String(option.name) === String(userToEdit.kgid)
    );

    console.log("KGID Options:", kgidOptions);
    console.log("User KGID:", userToEdit.kgid);
    setNewUser((prevState) => ({
      ...prevState,
      id: userToEdit.id,
      name: userToEdit.name ?? "",
      mobile: selectedKgid?.mobile ?? userToEdit.mobile ?? "", // Use mobile from kgidOptions if available
      kgid: selectedKgid?.code ?? userToEdit.kgid ?? "", // Use kgid from kgidOptions if available
      role:
        roleOptions.find(
          (option) => String(option.code) === String(userToEdit.role_id)
        )?.code || "",
      designation: designationOptions
        .filter((option) => designationArray.includes(String(option.code)))
        .map((option) => option.code),
      department:
        departmentOptions.find(
          (option) => String(option.code) === String(userToEdit.department_id)
        )?.code || "",
      division: divisionOptions
        .filter((option) => divisionArray.includes(String(option.code)))
        .map((option) => option.code),
      transaction_id: `edit_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
    }));

    setModalTitle("View User");
    setIsModalOpen(true);
  };


  const handleResetPin = (selectedUsers) => {
    if (!selectedUsers || selectedUsers.length === 0) {
      console.error("No valid user selected for resetting the pin.");
      return;
    }
    const userToEdit = users.find((user) => user.id === selectedUsers[0]);
  
    if (!userToEdit) {
      console.error("No matching user found.");
      return;
    }
  
    setNewUser((prevState) => ({
      ...prevState,
      id: userToEdit.id,
      name: userToEdit.name ?? "",
      mobile: userToEdit.mobile ?? "",
      kgid: userToEdit.kgid ?? "",
      pin: "",
      confirmPin: "",
    }));
  
    setModalTitle("Reset Pin");
    setIsModalOpen(true);
  };


  const [transactionId, setTransactionId] = useState("");

  const selectedUsersWithStatus = selectedUsers.map(
    (id) => users.find((user) => user.id === id) || { id, dev_status: null }
  );

  const allUsersInactive = selectedUsersWithStatus.every(
    (user) => user.dev_status === false
  );
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

    const newTransactionId = `toggle_${Date.now()}_${Math.floor(
      Math.random() * 10000
    )}`;
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
        className: "toast-success",
      });

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          userIds.includes(user.id) ? { ...user, dev_status: newStatus } : user
        )
      );
      fetchUsers();
    } catch (err) {
      let errorMessage =
        err.message || "Something went wrong. Please try again.";
      if (err?.response?.data?.message) {
        errorMessage =
          err?.response?.data?.message ||
          "Something went wrong. Please try again.";
      }
      toast.error(errorMessage, {
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
      mobile: "",
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
          borderWidth: "1px",
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
      {rowData.role?.role_title || rowData.role}{" "}
    </span>
  );

  const handleDropDownChange = (fieldName, value) => {
    setNewUser((prev) => {
      let updatedData = {
        ...prev,
        [fieldName]: Array.isArray(value) ? value : String(value),
      };

      // Autofill name and mobile when KGID is selected
      if (fieldName === "kgid") {
        const selectedKgid = kgidOptions.find((item) => item.code === value);
        console.log("Selected KGID Data:", selectedKgid); // Debugging

        if (selectedKgid) {
          updatedData.name = selectedKgid.kgid;
          updatedData.mobile = selectedKgid.mobile || ""; // Ensure mobile is set
        }
      }

      // Reset division when department changes
      if (fieldName === "department") {
        updatedData.division = "";
      }

      return updatedData;
    });
  };

  const handleInputChange = (e) => {
    setNewUser((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };
  const [masterData, setMasterData] = useState({
    role: [],
    designation: [],
    department: [],
    division: [],
  });
  const filteredDivisionOptions = newUser.department
    ? masterData?.division
        ?.filter(
          (div) =>
            div.department_id.toString() === newUser.department.toString()
        )
        ?.map((item) => ({
          name: item.name,
          code: item.code.toString(),
        }))
    : [];

  useEffect(() => {
    if (Object.keys(masterData).length === 0 || masterData.role.length === 0) {
      const needed_masters = [
        "role",
        "designation",
        "department",
        "division",
        "kgid",
      ];
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

  const roleOptions =
    masterData?.role?.map((item) => ({
      name: item.name,
      code: item.code.toString(),
    })) || [];

  const designationOptions =
    masterData?.designation?.map((item) => ({
      name: item.name,
      code: item.code.toString(),
    })) || [];

  const departmentOptions =
    masterData?.department?.map((item) => ({
      name: item.name,
      code: item.code.toString(),
    })) || [];

  const divisionOptions =
    masterData?.division?.map((item) => ({
      name: item.name,
      code: item.code.toString(),
    })) || [];

  const kgidOptions =
    masterData?.kgid?.map((item) => ({
      name: item.kgid,
      kgid: item.name,
      mobile: item.mobile,
      code: item.code.toString(),
    })) || [];

  // const [divisionOptions,setDivisionOptions] = useState([]);

  // useEffect(() => {
  //   if (newUser.department) {
  //     const selectedDepartmentId = newUser.department;
  //     const filteredDivisions = masterData?.division?.filter(item => item.department_id.toString() === selectedDepartmentId) || [];
  //     const updatedDivisionOptions = filteredDivisions.map((item) => ({
  //       name: item.name,
  //       code: item.code.toString(),
  //     }));
  //     setDivisionOptions(updatedDivisionOptions);
  //   } else {
  //     setDivisionOptions([]);
  //   }
  // }, [newUser.department, masterData]);

  const statusOptions = [
    { name: "Active", code: "active" },
    { name: "Inactive", code: "inactive" },
  ];

  return (
    <Box p={2}>
      <div className="m-3 ml-4 p-3 bg-white border-round-sm">
        <div
          className="flex align-items-center"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div className="flex flex-column">
            <div
              className="flex items-center"
              style={{ display: "flex", gap: "8px", alignItems: "center" }}
            >
              <h1
                style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  color: "#2d3748",
                  margin: "0",
                }}
              >
                User Management
              </h1>
              <p
                style={{
                  margin: "0",
                  fontSize: "0.75rem",
                  fontWeight: "600",
                  color: "#1E40AF",
                  padding: "0.25rem 0.75rem",
                  backgroundColor: "#E3F2FD",
                  borderRadius: "0.75rem",
                  height: "auto",
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
              justifyContent: "end",
            }}
          >
            {selectedUsers.length === 0 ? (
              <>
                <TextFieldInput
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: '#475467' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      searchValue && (
                        <IconButton
                          sx={{ padding: 0 }}
                          onClick={() => {
                            setSearchValue('');
                            setCurrentPage(0);
                            fetchUsers();
                          }}
                          size="small"
                        >
                          <ClearIcon sx={{ color: '#475467' }} />
                        </IconButton>
                      )
                    ),
                  }}
                  onInput={(e) => setSearchValue(e.target.value)}
                  value={searchValue}
                  id="tableSearch"
                  size="small"
                  placeholder="Search anything"
                  variant="outlined"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleFilters();
                    }
                  }}
                  sx={{
                    width: '300px',
                    borderRadius: '6px',
                    outline: 'none',
                    '& .MuiInputBase-input::placeholder': {
                      color: '#475467',
                      opacity: '1',
                      fontSize: '14px',
                      fontWeight: '400',
                      fontFamily: 'Roboto',
                    },
                  }}
                />
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
                    textTransform: "none",
                    display: isFilterApplied ? "none" : "inline-flex",
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
                      mobile: "",
                      role: "",
                      kgid: "",
                      designation: "",
                      supervisor_designation: "",
                      division: "",
                      department: "",
                    });
                  }}
                >
                  Filter
                </Button>
                <Button
                  variant="outlined"
                  sx={{
                    height: "38px",
                    border: "1px solid #D0D5DD",
                    borderRadius: "6px",
                    gap: "8px",
                    color: "#D32F2F",
                    fontWeight: "600",
                    textTransform: "none",
                    display: isFilterApplied ? "inline-flex" : "none",
                    "&:hover": {
                      backgroundColor: "transparent",
                    },
                  }}
                  onClick={() => {
                    fetchUsers();
                    setIsFilterApplied(false);
                  }}
                >
                  Clear Filter
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
                    textTransform: "none",
                    "&:hover": {
                      backgroundColor: "transparent",
                    },
                  }}
                  onClick={() => {
                    const transactionId = `user_${Date.now()}_${Math.floor(
                      Math.random() * 10000
                    )}`;
                    setNewUser((prevUser) => ({
                      ...prevUser,
                      transaction_id: transactionId,
                    }));
                    setIsModalOpen(true);
                  }}
                >
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
                    textTransform: "none",
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
                    textTransform: "none",
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
                  startIcon={<VpnKeyIcon />}
                  sx={{
                    height: "38px",
                    color: "black",
                    borderColor: "#b7bbc2",
                    backgroundColor: "#f9fafb",
                    borderWidth: "2px",
                    fontWeight: "600",
                    textTransform: "none",
                    "&:hover": {
                      backgroundColor: "#f1f5f9",
                    },
                  }}
                  onClick={() => handleResetPin(selectedUsers)}
                >
                  Reset Pin
                </Button>

                <Button
                  variant="outlined"
                  startIcon={
                    allUsersInactive ? (
                      <CheckCircleIcon />
                    ) : (
                      <DoNotDisturbOnIcon />
                    )
                  }
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
                  {actionText} Selected User
                  {selectedUsers.length > 1 ? "s" : ""}
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
            getRowId={(row) => row.id}
            handleRowClick={handleRowClick}
            handleNext={handleNext}
            handleBack={handleBack}
            backBtn={currentPage > 0}
            nextBtn={currentPage < totalPages - 1}
          />
        </Box>
      </div>

      {/* Modal for Creating New User Or Edit user */}
      {isModalOpen && (
        <Modal
          title={modalTitle}
          visible={isModalOpen}
          onHide={handleCloseModal}
          onSave={handleSave}
          headerContent={
            <div className="modal-header-title p-3">{modalTitle}</div>
          }
          footerContent={
            <div className="space-x-2 w-full custom-footer mt-2">
              <Button
                variant="outlined"
                sx={{
                  color: "#000000",
                  width: "10vw",
                  borderColor: "#6B7280",
                  backgroundColor: "#F3F4F6",
                  borderWidth: "2px",
                  fontWeight: "600",
                  textTransform: "none",
                  "&:hover": {
                    backgroundColor: "#E5E7EB",
                  },
                }}
                onClick={() => {
                  setIsModalOpen(false);
                  setModalTitle("Add New User");
                  setNewUser({
                    id: null,
                    name: "",
                    mobile: "",
                    role: "",
                    kgid: "",
                    designation: "",
                    supervisor_designation: "",
                    pin: "",
                    confirmPin: "",
                    division: "",
                    department: "",
                  });
                  setErrors({});
                }}
              >
                {modalTitle === "View User" ? "Close" : "Discard"}
              </Button>

              {modalTitle !== "View User" && (
                <Button
                  variant="outlined"
                  sx={{
                    color: "white",
                    width: "10vw",
                    borderColor: "#1F1DAC",
                    backgroundColor: "#1F1DAC",
                    borderWidth: "2px",
                    fontWeight: "700",
                    textTransform: "none",
                    "&:hover": {
                      backgroundColor: "#1F1DAC",
                    },
                  }}
                  onClick={
                    modalTitle === "Set Filters" ? handleFilters : handleSave
                  }
                >
                {modalTitle === "Edit User"
                    ? "Update User"
                    : modalTitle === "Reset Pin"
                    ? "Reset Pin"
                    : modalTitle === "Set Filters"
                    ? "Set Filters"
                    : "Save & Close"}
                                </Button>
                              )}
                            </div>
                          }
                        >
            <form className="py-4 px-4">
              <Grid container spacing={2}>
              {(modalTitle !== "Reset Pin") && (
              <>
                <Grid item xs={12} sm={6}>
                  <AutocompleteField
                    formData={newUser}
                    errors={errors}
                    field={{
                      name: "kgid",
                      label: "Select KGID",
                      options: kgidOptions,
                      required: modalTitle !== "Set Filters",
                      history:
                        modalTitle === "View User" || modalTitle === "Edit User"
                          ? "role"
                          : null,
                      disabled: modalTitle === "View User" || modalTitle === "Edit User"
                    }}
                    value={newUser.kgid}
                    onHistory={() => getUsermanagementFieldLog("kgid")}
                    onChange={handleDropDownChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <ShortText
                    field={{
                      name: "name",
                      label: "Enter Full Name",
                      required: modalTitle !== "Set Filters",
                      history:
                        modalTitle === "View User" || modalTitle === "Edit User"
                          ? "name"
                          : null,
                      disabled: true,
                    }}
                    onHistory={() => getUsermanagementFieldLog("name")}
                    formData={newUser}
                    errors={errors}
                    onChange={(e) => {
                      const regex = /^[a-zA-Z0-9\s\b]*$/;
                      if (regex.test(e.target.value)) {
                        handleInputChange(e);
                      }
                    }}
                    value={newUser.name}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <NumberField
                    field={{
                      name: "mobile",
                      label: "Mobile Number",
                      required: modalTitle !== "Set Filters",
                      maxLength: 10,
                      history:
                        modalTitle === "View User" || modalTitle === "Edit User"
                          ? "mobile"
                          : null,
                      disabled: true,
                    }}
                    value={newUser.mobile}
                    formData={newUser}
                    errors={errors}
                    onHistory={() => getUsermanagementFieldLog("mobile")}
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
                      history:
                        modalTitle === "View User" || modalTitle === "Edit User"
                          ? "role"
                          : null,
                    }}
                    value={newUser.role}
                    onHistory={() => getUsermanagementFieldLog("role")}
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
                      options: designationOptions,
                      required: modalTitle !== "Set Filters",
                      history:
                        modalTitle === "View User" || modalTitle === "Edit User"
                          ? "designation"
                          : null,
                    }}
                    value={newUser.designation}
                    onHistory={() => getUsermanagementFieldLog("designation")}
                    onChange={handleDropDownChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <p
                    style={{
                      fontSize: "14px",
                      color: "#6B7280",
                      marginTop: "8px",
                    }}
                  >
                    Supervisor Designation: <br />
                    {Array.isArray(newUser.designation) && newUser.designation.length > 0
                      ? newUser.designation
                          .map((des) => {
                            const supervisorKeys = Object.keys(
                              masterData.supervisor_designation
                            ).filter((key) =>
                              masterData.supervisor_designation[key].includes(
                                parseInt(des, 10)
                              )
                            );

                            const supervisorNames = supervisorKeys
                              .map((key) => {
                                const designation = designationOptions.find(
                                  (option) => String(option.code) === String(key)
                                );
                                return designation ? designation.name : "Unknown";
                              })
                              .join(", ");

                            return supervisorNames || "None";
                          })
                          .join(" | ")
                      : ""}
                  </p>
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
                      history:
                        modalTitle === "View User" || modalTitle === "Edit User"
                          ? "department"
                          : null,
                    }}
                    value={newUser.department}
                    onHistory={() => getUsermanagementFieldLog("department")}
                    onChange={handleDropDownChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <MultiSelect
                    formData={newUser}
                    errors={errors}
                    field={{
                      name: "division",
                      label: "Division",
                      options: filteredDivisionOptions,
                      required: modalTitle !== "Set Filters",
                      history:
                        modalTitle === "View User" || modalTitle === "Edit User"
                          ? "division"
                          : null,
                    }}
                    value={newUser.division}
                    onHistory={() => getUsermanagementFieldLog("division")}
                    onChange={handleDropDownChange}
                  />
                </Grid>

                </>
              )}

              {(modalTitle === "Reset Pin" || modalTitle === "Add New User") && (
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
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "15px",
              }}
            >
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "50%",
                  overflow: "hidden",
                  background: allUsersInactive
                    ? "rgb(209 250 229)"
                    : "rgb(250 209 209)",
                  padding: "3px",
                }}
              >
                <img
                  src={ErrorIcon}
                  alt="Warning Icon"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: "center",
                  }}
                />
              </div>
            </div>

            <p style={{ fontSize: "20px", fontWeight: "bold" }}>
              {actionText} <span> Selected </span> profile
            </p>

            <p
              style={{ fontSize: "16px", color: "rgb(156 163 175)", margin: 0 }}
            >
              Are you sure you want to {actionText.toLowerCase()} the selected
              profile? This action cannot be undone.
            </p>
          </DialogContent>

          <DialogActions
            sx={{
              display: "flex",
              justifyContent: "center",
              padding: "10px 20px",
            }}
          >
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
      {loading && (
        <div className="parent_spinner" tabIndex="-1" aria-hidden="true">
          <CircularProgress size={100} />
        </div>
      )}

      {/* Dialog for displaying logs */}
      <Dialog open={openLogDialog} onClose={() => setOpenLogDialog(false)}>
        <DialogTitle>
          {LogDialogTitle} Logs
          <IconButton
            edge="end"
            color="inherit"
            onClick={() => setOpenLogDialog(false)} // Close the dialog
            aria-label="close"
            style={{ position: "absolute", right: 20, top: 12 }} // Position the button
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>S.No</TableCell>
                <TableCell>Value</TableCell>
                <TableCell>Updated at</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.map((log, index) => (
                <TableRow key={index}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{log.info}</TableCell>
                  <TableCell>
                    {new Date(log.at).toLocaleString("en-GB", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    }).replace(",", "").replace(":", ".")}
                  </TableCell>                
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
        {/* <DialogActions>
           <Button
                variant="outlined"
                sx={{
                  color: "#000000",
                  width: "10vw",
                  borderColor: "#6B7280",
                  backgroundColor: "#F3F4F6",
                  borderWidth: "2px",
                  fontWeight: "600",
                  textTransform: "none",
                  "&:hover": {
                    backgroundColor: "#E5E7EB",
                  },
                }}
                onClick={() => setOpenLogDialog(false)}
              >
                Close
              </Button>
        </DialogActions> */}
      </Dialog>
    </Box>
  );
};

export default UserManagement;
