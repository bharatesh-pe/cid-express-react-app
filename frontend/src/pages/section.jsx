import { Box, Button, CircularProgress, FormControl, Grid, IconButton, InputAdornment, TextField, Typography, MenuItem, Select, InputLabel } from "@mui/material"
import { useEffect, useState } from "react"
import TableView from "../components/table-view/TableView";
import TextFieldInput from '@mui/material/TextField';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear';
import api from '../services/api';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import CloseIcon from '@mui/icons-material/Close';
import eyes from "../Images/eye.svg"
import edit from "../Images/tableEdit.svg";
import trash from "../Images/tableTrash.svg";
import ErrorIcon from "../Images/erroricon.png";
import { useNavigate } from "react-router-dom";
import Autocomplete from '@mui/material/Autocomplete';
import { ArrowBack } from "@mui/icons-material";
import FilterListIcon from "@mui/icons-material/FilterList";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import WestIcon from '@mui/icons-material/West';

const Section = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [showViewModal, setShowViewModal] = useState();
    const [showEditModal, setShowEditModal] = useState();
    const [selectedSection, setSelectedSection] = useState({
        section_name: '',
        description: '',
        permissions: {},
    });
    const [delete_section_conf, setDeleteSectionConf] = useState(false)
    const [sectionToDelete, setSectionToDelete] = useState(null);
    const [sectionNameToDelete, setSectionNameToDelete] = useState("");
    const [showSectionAddModal, setShowSectionAddModal] = useState(false)
    const [errorSectionData, setErrorSectionData] = useState({})
    const [searchValue, setSearchValue] = useState(null);
    const [addSectionData, setAddSectionData] = useState({
        section_name: "",
        description: "",
        act_id: "",
        created_by: "0",
    });
    const [acts, setacts] = useState([]);
    const [selectedAct, setSelectedAct] = useState(null);
    const [sectionRowData, setsectionRowData] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const pageSize = 10;

    const [showFilterModal, setShowFilterModal] = useState(false);
    const [filterDropdownObj, setfilterDropdownObj] = useState([]);
    const [filterValues, setFilterValues] = useState({});
    const [fromDateValue, setFromDateValue] = useState(null);
    const [toDateValue, setToDateValue] = useState(null);
    const [forceTableLoad, setForceTableLoad] = useState(false);
    const [paginationCount, setPaginationCount] = useState(1);

    const [totalPage, setTotalPage] = useState(0);
    const [totalRecord, setTotalRecord] = useState(0);
    
    const handlePagination = (page) => {
        setPaginationCount(page)
    }

    const showDeleteSectionDialoge = (id, name) => {
        setSectionToDelete(id);
        setSectionNameToDelete(name);
        setDeleteSectionConf(true);
    };

    const handleDeleteSection = () => {
        if (sectionToDelete !== null) {
            deleteSection(sectionToDelete);
            setDeleteSectionConf(false);
            setSectionToDelete(null);
        }
    };

    const get_acts = async () => {
        try {
            const response = await api.post("/master_meta/fetch_specific_master_data", {
                master_name: "act",
                get_all: true,
            });

             const { data, meta } = response;
            if (Array.isArray(data)) {
                const actList = data.map(dept => ({
                    id: dept.act_id,
                    name: dept.act_name
                }));

                setacts(actList);
            } else {
                toast.error("Failed to fetch Act's");
            }
        } catch (err) {
            let errorMessage = err?.response?.data?.message || "Something went wrong. Please try again.";
            toast.error(errorMessage);
        }
    };


    const get_section_details = async (page) => {
        if (acts.length === 0) {
            console.warn("acts not loaded yet. Waiting...");
            return;
        }

        const getTemplatePayload = {
            page,
            limit: 10,
            search: searchValue || "",
            from_date: fromDateValue,
            to_date: toDateValue,
            filter: filterValues,
            master_name: "section"
        };

        setLoading(true);
        try {
            const response = await api.post("/master_meta/fetch_specific_master_data", getTemplatePayload);
            setLoading(false);

            if (response) {

                const { data, meta } = response;

                const totalPages = meta?.totalPages || 1;
                const totalItems = meta?.totalItems || 0;
                
                if (totalPages !== null && totalPages !== undefined) {
                    setTotalPage(totalPages);
                }
                
                if (totalItems !== null && totalItems !== undefined) {
                    setTotalRecord(totalItems);
                }

                const updatedData = data.map(row => {
                    const actInfo = acts.find(dept => dept.id === row.act_id);
                    return {
                        id: row.section_id,
                        act_id: row.act_id,
                        act: actInfo ? actInfo.name : "Unknown",
                        name: row.section_name,
                        description: row.description || "N/A"
                    };
                });

                setsectionRowData(updatedData);
            } else {
                toast.error("Failed to fetch sections");
            }
        } catch (err) {
            setLoading(false);
            let errorMessage = err?.response?.data?.message || "Something went wrong. Please try again.";
            toast.error(errorMessage);
        }
    };
    useEffect(() => {
        get_acts();
    }, []);

    useEffect(() => {
        if (acts.length > 0) {
            get_section_details(paginationCount);
        }
    }, [acts, paginationCount, forceTableLoad]);


    const handleViewSection = (role) => {
        const selectedDept = acts.find(dept => dept.id === role.act_id);

        setSelectedSection(role);
        setSelectedAct(selectedDept ? { code: selectedDept.id, name: selectedDept.name } : "");
        setShowViewModal(true);
    };

    const handleEditSection = (role) => {
        setSelectedSection({
            id: role.id,
            section_name: role.name,
            description: role.description,
            act_id: role.act_id,
        });

        const selectedDept = acts.find(dept => dept.id === role.act_id);

        setSelectedAct(selectedDept ? { code: selectedDept.id, name: selectedDept.name } : "");
        setShowEditModal(true);
    };

    const sectionColumnData = [
        { field: 'name', headerName: 'Section', width: 200 },
        { field: 'act', headerName: 'Act', width: 300 },
        // { field: 'description', headerName: 'Description', width: 300 },
        {
            field: '',
            headerName: 'Action',
            flex: 1,
            renderCell: (params) => {
                return (
                    // <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px', height: '100%' }}>
                    //     <Button
                    //         style={{
                    //             background: "transparent",
                    //             border: "none",
                    //             padding: "0",
                    //             boxShadow: "none",
                    //             display: "flex",
                    //             alignItems: "center",
                    //             gap: "6px",
                    //             color: "black",
                    //             fontSize: "14px",
                    //             textAlign: "center",
                    //             textTransform: "none",
                    //         }}
                    //         onClick={() => handleViewSection(params.row)}
                    //     >
                    //         <img
                    //             src={eyes}
                    //             alt="View"
                    //             style={{ width: "20px", height: "20px" }}
                    //         />
                    //         <span>View</span>
                    //     </Button>
                    //     <Button
                    //         style={{
                    //             background: "transparent",
                    //             border: "none",
                    //             padding: "0",
                    //             boxShadow: "none",
                    //             display: "flex",
                    //             alignItems: "center",
                    //             gap: "6px",
                    //             color: "black",
                    //             fontSize: "14px",
                    //             textAlign: "center",
                    //             textTransform: "none",
                    //         }}
                    //         onClick={() => {

                    //             handleEditSection(params.row)
                    //         }}
                    //     >
                    //         <img
                    //             src={edit}
                    //             alt="Edit"
                    //             style={{ width: "20px", height: "20px" }}
                    //         />
                    //         <span>Edit</span>
                    //     </Button>
                    //     <Button
                    //         style={{
                    //             background: "transparent",
                    //             border: "none",
                    //             padding: "0",
                    //             boxShadow: "none",
                    //             display: "flex",
                    //             alignItems: "center",
                    //             gap: "6px",
                    //             color: "Red",
                    //             fontSize: "14px",
                    //             textAlign: "center",
                    //             textTransform: "none",
                    //         }}
                    //         onClick={() => showDeleteSectionDialoge(params.row.id, params.row.name)}
                    //     >
                    //         <img
                    //             src={trash}
                    //             alt="Delete"
                    //             style={{ width: "20px", height: "20px" }}
                    //         />
                    //         <span>Delete</span>
                    //     </Button>
                    // </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px', height: '100%' }}>
                        <Button variant="outlined"  onClick={() => {

                                handleViewSection(params.row)
                            }}>
                            View
                        </Button>
                        <Button variant="contained" color="primary"  onClick={() => {

                                handleEditSection(params.row)
                            }}>
                            Edit
                        </Button>
                        <Button variant="contained" color="error"  onClick={() => showDeleteSectionDialoge(params.row.id, params.row.name)}>
                            Delete
                        </Button>
                    </Box>
                );
            }
        }
    ];

    const deleteSection = async (id) => {
        setLoading(true);
        if (!id) {
            toast.error("Invalid role ID.");
            return;
        }
        try {
            const response = await api.post("/master_meta/delete_master_data", { master_name: "Section", id });
            if (!response || !response.success) {
                let errorMessage = response.message || "Error deleting section";
                toast.error(errorMessage, {
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

            toast.success(response.message || "section Deleted Successfully", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                className: "toast-success",
            });

            get_section_details(paginationCount);

        } catch (err) {
            let errorMessage = err.response?.message || "Something went wrong. Please try again.";

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

    const handleAddData = (e) => {
        const { name, value } = e.target;

        setAddSectionData((prevData) => ({
            ...prevData,
            [name]: value,
        }));

        if (errorSectionData[name]) {
            setErrorSectionData((prevErrors) => {
                const updatedErrors = { ...prevErrors };
                if (updatedErrors[name]) {
                    delete updatedErrors[name];
                }
                return updatedErrors;
            });
        }
    };

    const handleAddSaveData = async () => {
        var error_flag = false;

        if (addSectionData.section_name.trim() === '') {
            error_flag = true;
            setErrorSectionData((prevData) => ({
                ...prevData,
                section_name: 'Title is required'
            }));
        }

        // if (addSectionData.description.trim() === '') {
        //     error_flag = true;
        //     setErrorSectionData((prevData) => ({
        //         ...prevData,
        //         description: 'Description is required'
        //     }));
        // }

        if (!addSectionData.act_id) {
            error_flag = true;
            setErrorSectionData((prevData) => ({
                ...prevData,
                act_id: 'act selection is required'
            }));
        }

        if (error_flag) {
            toast.error("Please check the required fields", {
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
            const requestData = {
                master_name: "Section",
                data: addSectionData,
                transaction_id:  `section_${Date.now()}_${Math.floor( Math.random() * 1000 )}`, 
            };

            const response = await api.post("/master_meta/create_master_data", requestData);

            if (!response || !response.success) {
                toast.error(response.message || "Failed to create record", {
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

            toast.success(response.message || "section Created Successfully", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                className: "toast-success"
            });

            get_section_details(paginationCount);

            setAddSectionData({
                section_name: '',
                description: '',
                act_id: '',
                created_by: '0',
            });
            setSelectedAct(null);
            setShowSectionAddModal(false);

        } catch (err) {
            let errorMessage = err.message || "Something went wrong. Please try again.";
            if (err?.response?.data?.message) {
                errorMessage = err?.response?.data?.message;
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
        }

        setLoading(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSelectedSection(prevState => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleEditData = async () => {
        var error_flag = false;

        if (selectedSection.section_name.trim() === '') {
            error_flag = true;
            setErrorSectionData((prevData) => ({
                ...prevData,
                section_name: 'Section Name is required',
            }));
        }

        // if (selectedSection.description.trim() === '') {
        //     error_flag = true;
        //     setErrorSectionData((prevData) => ({
        //         ...prevData,
        //         description: 'Description is required',
        //     }));
        // }

        if (!selectedSection.act_id) {
            error_flag = true;
            setErrorSectionData((prevData) => ({
                ...prevData,
                act_id: 'Act selection is required',
            }));
        }

        if (error_flag) {
            toast.error("Please check the required fields", {
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

        const requestData = {
            master_name: "Section",
            data: {
                section_id: selectedSection.id,
                section_name: selectedSection.section_name,
                description: selectedSection.description,
                act_id: selectedSection.act_id,
            }
        };

        setLoading(true);
        try {
            const response = await api.post("/master_meta/update_master_data", requestData);

            if (!response || !response.success) {
                toast.error(response.message || "Error updating section", {
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

            toast.success(response.message || "Section updated successfully", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                className: "toast-success",
            });

            get_section_details(paginationCount);
            setShowEditModal(false);
        } catch (err) {
            let errorMessage = err.message || "Something went wrong. Please try again.";
            if (err?.response?.data?.message) {
                errorMessage = err?.response?.data?.message;
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
        }
        setLoading(false);
    };


    useEffect(() => {
        if (selectedSection && selectedSection.act_id && acts.length > 0) {
            const matchedact = acts.find(dept => dept.id === selectedSection.act_id);
            setSelectedAct(matchedact ? { code: matchedact.id, name: matchedact.name } : null);
        }
    }, [selectedSection, acts]);

    const setFilterData = () => {
        setPaginationCount(1);
        setShowFilterModal(false);
        setForceTableLoad((prev) => !prev);
    };

    const handleFilter = async () => {            
        setShowFilterModal(true);
    };

    const handleClear = () => {
        setSearchValue("");
        setFromDateValue(null);
        setToDateValue(null);
        setForceTableLoad((prev) => !prev);
    };


    return (
        <Box inert={loading ? true : false}>
            <Box p={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                    <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 0, cursor: 'pointer' }}
                        onClick={() => navigate("/master")}
                    >
            <ArrowBack sx={{ fontSize: 24, color: "#1D2939" }} />
            <Typography className="Roboto" sx={{ fontSize: "20px", fontWeight: "600", color: "#1D2939", margin: 0 }}>
                            Section
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "end",
                            }}
                        >
                            <TextFieldInput
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon sx={{ color: "#475467" }} />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                            <IconButton
                                                sx={{ padding: "0 5px", borderRadius: "0" }}
                                                onClick={handleFilter}
                                            >
                                                <FilterListIcon sx={{ color: "#475467" }} />
                                            </IconButton>
                                        </Box>
                                    ),
                                }}
                                onInput={(e) => setSearchValue(e.target.value)}
                                value={searchValue}
                                id="tableSearch"
                                size="small"
                                placeholder="Search section"
                                variant="outlined"
                                className="profileSearchClass"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        setFilterData()
                                    }
                                }}
                                sx={{
                                    width: "350px",
                                    borderRadius: "6px",
                                    outline: "none",
                                    "& .MuiInputBase-input::placeholder": {
                                        color: "#475467",
                                        opacity: "1",
                                        fontSize: "14px",
                                        fontWeight: "400",
                                        fontFamily: "Roboto",
                                    },
                                }}
                            />
                            {(  searchValue ||
                                fromDateValue ||
                                toDateValue ||
                                Object.keys(filterValues).length > 0) && (
                                <Typography
                                onClick={handleClear}
                                sx={{
                                    fontSize: "13px",
                                    fontWeight: "500",
                                    textDecoration: "underline",
                                    cursor: "pointer",
                                }}
                                mt={1}
                                >
                                Clear Filter
                                </Typography>
                            )}
                        </Box>
                        <Button
                            onClick={() => {
                                setAddSectionData(prevData => ({
                                    ...prevData,
                                }));
                                setShowSectionAddModal(true);
                            }}
                            sx={{
                                height: "38px",
                                }}
                            className="blueButton"
                            startIcon={
                                <AddIcon
                                    sx={{
                                        border: "1.3px solid #FFFFFF",
                                        borderRadius: "50%",
                                        background:"#4D4AF3 !important",
                                    }}
                                />
                            }
                            variant="contained"
                            >
                                Add section
                        </Button>                         
                    </Box>
                </Box>
                <Box py={2}>
                    <TableView
                        rows={sectionRowData}
                        columns={sectionColumnData}
                        totalPage={totalPage} 
                        totalRecord={totalRecord} 
                        paginationCount={paginationCount} 
                        handlePagination={handlePagination} 
                        getRowId={(row) => row.id}
                    />

                </Box>
            </Box>

            {/* add , view , edit section modal */}

            <Dialog
                open={showViewModal || showEditModal || showSectionAddModal}
                onClose={() => {
                    setShowViewModal(false);
                    setShowEditModal(false);
                    setShowSectionAddModal(false);
                    setErrorSectionData({ section_name: '', description: '' });
                    setSelectedAct(null);
                    setAddSectionData({ section_name: '', description: '' });
                    setSelectedSection(null);
                }}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                maxWidth="xs"
                // fullScreen
                fullWidth
                // sx={{ marginLeft: '250px' }}  
            >
                <DialogTitle id="hierarchy-dialog-title" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                        onClick={() => {
                            setShowViewModal(false);
                            setShowEditModal(false);
                            setShowSectionAddModal(false);
                            setErrorSectionData({ section_name: '', description: '' });
                            setSelectedAct(null);
                            setAddSectionData({ section_name: '', description: '' });
                            setSelectedSection(null);
                        }}
                        >
                        <WestIcon sx={{ color: 'black' }}/>
                        <Typography sx={{ fontSize: '18px', fontWeight: 500,}}>
                        {showViewModal && "View section"}
                        {showEditModal && "Edit section"}
                        {showSectionAddModal && "Add Section"}
                        </Typography>
                    </Box>

                    {showEditModal && (
                        <Button variant="outlined" onClick={handleEditData}>
                            Update section
                        </Button>
                    )}
                    {showSectionAddModal && (
                        <Button variant="outlined" onClick={handleAddSaveData}>
                            Add section
                        </Button>
                    )}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        <FormControl fullWidth>
                            <Box sx={{ marginY: "8px" }}>
                            <h4 className="form-field-heading" style={{ color: !!errorSectionData.act_id && '#d32f2f' }}>
                                    Act
                                </h4>
                                <Autocomplete
                                    options={acts}
                                    getOptionLabel={(option) => option.name}
                                    value={selectedAct}
                                    onChange={(event, newValue) => {
                                        setSelectedAct(newValue);
                                        const actId = newValue ? newValue.id : null;
                                        setSelectedSection((prev) => ({ ...prev, act_id: actId }));
                                        setAddSectionData((prev) => ({ ...prev, act_id: actId }));
                                    }}
                                    renderInput={(params) => <TextField {...params} label="Select Act" variant="outlined" />}
                                />                </Box>

                            <Box sx={{ marginY: '18px' }}>
                                <h4 className="form-field-heading" style={{ color: !!errorSectionData.section_name && '#d32f2f' }}>
                                    Law
                                </h4>
                                <TextField
                                    fullWidth
                                    label="Law"
                                    name="section_name"
                                    autoComplete="off"
                                    value={showSectionAddModal ? addSectionData.section_name : selectedSection?.section_name || selectedSection?.name}
                                    onChange={(e) => {
                                        if (showViewModal) return;

                                        const regex = /^[a-zA-Z0-9\s\b]*$/;
                                        if (regex.test(e.target.value)) {
                                            if (showSectionAddModal) {
                                                handleAddData(e);
                                            } else {
                                                handleInputChange(e);
                                                setSelectedSection((prev) => ({ ...prev, name: e.target.value }));
                                            }
                                        }
                                    }}
                                    error={!!errorSectionData.section_name}
                                    required={showEditModal || showSectionAddModal}
                                    disabled={showViewModal}
                                />
                            </Box>

                            {/* <Box sx={{ marginBottom: '18px' }}>
                                <h4 className="form-field-heading" style={{ color: !!errorSectionData.description && '#d32f2f' }}>
                                    Description
                                </h4>
                                <TextField
                                    fullWidth
                                    label="Description"
                                    name="description"
                                    autoComplete="off"
                                    value={showSectionAddModal ? addSectionData.description : selectedSection?.description || ""}
                                    onChange={(e) => {
                                        const regex = /^[a-zA-Z0-9\s/,.\b]*$/;
                                        if (regex.test(e.target.value)) {
                                            showSectionAddModal ? handleAddData(e) : handleInputChange(e);
                                        }
                                    }}
                                    error={!!errorSectionData.description}
                                    required={showEditModal || showSectionAddModal}
                                    disabled={showViewModal}
                                />
                            </Box> */}
                        </FormControl>
                    </DialogContentText>
                </DialogContent>
            </Dialog>
            {/* Delete Role conformation Popup */}
            <div>
                <Dialog
                    open={delete_section_conf}
                    onClose={() => setDeleteSectionConf(false)}
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
                                    background: "rgb(250 209 209)",
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
                            <span> Delete {sectionNameToDelete}</span>
                        </p>

                        <p style={{ fontSize: "16px", color: "rgb(156 163 175)", margin: 0 }}>
                            Are you sure you want to delete the {sectionNameToDelete} section? This action
                            cannot be undone.
                        </p>
                    </DialogContent>

                    <DialogActions sx={{ display: "flex", justifyContent: "center", padding: "10px 20px" }}>
                        <Button
                            variant="contained"
                            color="danger"
                            onClick={() => setDeleteSectionConf(false)}
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
                            onClick={() => handleDeleteSection()}
                        >
                            Delete
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>

            {
                loading && <div className='parent_spinner' tabIndex="-1" aria-hidden="true">
                    <CircularProgress size={100} />
                </div>
            }


            {showFilterModal && (
                <Dialog
                    open={showFilterModal}
                    onClose={() => setShowFilterModal(false)}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                    maxWidth="md"
                    fullWidth
                >
                    <DialogTitle
                    id="alert-dialog-title"
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                    }}
                    >
                    Filter
                    <IconButton
                        aria-label="close"
                        onClick={() => setShowFilterModal(false)}
                        sx={{ color: (theme) => theme.palette.grey[500] }}
                    >
                        <CloseIcon />
                    </IconButton>
                    </DialogTitle>
                    <DialogContent sx={{ minWidth: "400px" }}>
                    <DialogContentText id="alert-dialog-description">
                        <Grid container sx={{ alignItems: "center" }}>
                        <Grid item xs={12} md={6} p={2}>
                             <h4 className="form-field-heading">From Date</h4>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                                format="DD-MM-YYYY"
                                sx={{
                                width: "100%",
                                }}
                                label="From Date"
                                value={fromDateValue ? dayjs(fromDateValue) : null}
                                onChange={(e) =>
                                setFromDateValue(e ? e.format("YYYY-MM-DD") : null)
                                }
                            />
                            </LocalizationProvider>
                        </Grid>
        
                        <Grid item xs={12} md={6} p={2}>
                             <h4 className="form-field-heading">To Date</h4>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                                format="DD-MM-YYYY"
                                sx={{
                                width: "100%",
                                }}
                                label="To Date"
                                value={toDateValue ? dayjs(toDateValue) : null}
                                onChange={(e) =>
                                setToDateValue(e ? e.format("YYYY-MM-DD") : null)
                                }
                            />
                            </LocalizationProvider>
                        </Grid>
                        </Grid>
                    </DialogContentText>
                    </DialogContent>
                    <DialogActions sx={{ padding: "12px 24px" }}>
                    <Button onClick={() => setShowFilterModal(false)}>Close</Button>
                    <Button
                        className="fillPrimaryBtn"
                        sx={{ minWidth: "100px" }}
                        onClick={() => setFilterData()}
                    >
                        Apply
                    </Button>
                    </DialogActions>
                </Dialog>
            )}

        </Box>
    )
}

export default Section