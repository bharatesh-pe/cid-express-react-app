import React, { useEffect, useState, useRef } from "react";
import ReactPageFlip from "react-pageflip";
import { Box, Button, Grid, Typography, FormControl, IconButton } from "@mui/material";

import { useLocation, useNavigate } from "react-router-dom";
import logo from '../Images/siimsLogo.png';
import api from '../services/api';

import TableView from "../components/table-view/TableView";
import DateField from "../components/form/Date";
import LongText from "../components/form/LongText";
import SelectField from '../components/form/Select';

import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

import CloseIcon from '@mui/icons-material/Close';
import { CircularProgress } from "@mui/material";
import VirtualizedSelect from "../components/VirtualizedSelect";
import VirtualizedSearchAutocomplete from "../components/VirtualizedSelect";
import GenerateProfilePdf from "./GenerateProfilePdf";

// localhost:3001/api/siims/paginateLeaders
// {
//     "page": 1,
//     "limit": 10,
//     "search": "RAVINDRA SRIKANTAIAH EX MLA SRIRANGAPATTANA "
// }


// localhost:3001/api/siims/paginateOrganizations
// {
//     "page": 1,
//     "limit": 10,
//     "search": "A J SADASHIVA AYOGA HORATA SAMITHI"
// }

const ProfileView = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { formData, fields, profileDatapagination, table_name, hyperLinkTableName, template_name, selectedFields, table_row_id, template_id, linkToLeader, linkToOrganization, selected_template_id } = location.state || {};

    const [data, setData] = useState([]); // State to store the fetched data
    const [templateFields, setTemplateFields] = useState(fields ? fields : []);
    const [templateData, setTemplateData] = useState(formData ? formData : {});

    const [viewportWidth, setViewportWidth] = useState((window.innerWidth / 2) - 160); // State to store viewport width
    const [viewportHeight, setViewportHeight] = useState(window.innerHeight); // State to store viewport height
    const [currentPage, setCurrentPage] = useState(0); // State to store current page index
    const [eventCurrentPage, setEventCurrentPage] = useState(1)
    const [totalEventPage, setTotalEventPage] = useState(0)
    const [selectedEvent, setSelectedEvent] = useState(null)

    const [loading, setLoading] = useState(false); // State for loading indicator
    const [isDownloadPdf, setIsDownloadPdf] = useState(false);

    // logs data modal states
    const [showActivityModal, setshowActivityModal] = useState(false);
    const [activityTableHeader, setActivityTableHeader] = useState([
        { field: 'sl_no', headerName: 'Sl. No.' },
        { field: 'username', headerName: 'Name', flex: 1 },
        { field: 'activity', headerName: 'User Action', flex: 1 },
        { field: 'created_at', headerName: 'Created Date', flex: 1 }
    ]);
    const [activityTableData, setActivityTableData] = useState([]);

    // remarks data modal stated
    const [showRemarksModal, setshowRemarksModal] = useState(false);
    const [remarksTableHeader, setRemarksTableHeader] = useState([
        { field: 'sl_no', headerName: 'Sl. No.' },
        { field: 'username', headerName: 'User Name', flex: 1 },
        { field: 'comment', headerName: 'Comment', flex: 1 },
        { field: 'comment_date', headerName: 'Comment Date', flex: 1 },
        {
            field: 'Action',
            headerName: 'Action',
            flex: 1,
            resizable: false,
            renderCell: (params) => {
                return (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px', height: '100%' }}>
                        <Button variant="outlined" onClick={(event) => { event.stopPropagation(); handleTemplateView(params.row); }}>
                            View
                        </Button>
                    </Box>
                );
            }
        }
    ]);
    const [remarksTableData, setRemarksTableData] = useState([]);

    const [viewRemarkModal, setViewRemarkModal] = useState(false)
    const [viewRemarkCmts, setviewRemarkCmts] = useState('')

    // add remarks modal state
    const [addNewRemarksModal, setAddNewRemarksModal] = useState(false)

    const [remarksData, setRemarksData] = useState({});
    const [remarksDateField, setRemarksDateField] = useState({
        "label": "Date",
        "kannada": "",
        "heading": "",
        "required": true,
        "disabled": "",
        "history": "",
        "supportingText": "",
        "info": "",
        "minDate": "",
        "maxDate": "",
        "disableFutureDate": true,
        "disablePreviousDate": true,
        "name": "comment_date",
        "type": "date",
        "formType": "Date"
    })

    const [remarktextareaField, setRemarktextareaField] = useState({
        "label": "Remarks",
        "kannada": "",
        "heading": "",
        "required": true,
        "disabled": "",
        "history": "",
        "supportingText": "",
        "placeholder": "",
        "info": "",
        "name": "comment",
        "type": "textarea",
        "formType": "Long text"
    })

    const [errors, setErrors] = useState({});

    // Reference to ReactPageFlip instance
    const pageFlip = useRef();

    // Fetch data on component mount
    // useEffect(() => {
    //     fetch("https://jsonplaceholder.typicode.com/posts") // Replace with your actual API URL
    //         .then((response) => response.json())
    //         .then((data) => setData(data)) // Set data to the state
    //         .catch((error) => console.error("Error fetching data:", error));
    // }, []);

    const handleOnSavePdf = () =>{
        setIsDownloadPdf(false);
        setLoading(false);
    }

    const handleTemplateView = (rowData) => {
        console.log(rowData, "rowData");
        setViewRemarkModal(true);
        setshowRemarksModal(false);
        setviewRemarkCmts(rowData.comment ? rowData.comment : '')
    }

    const handleClostViewRemarks = () => {
        setshowRemarksModal(true);
        setViewRemarkModal(false);
        setviewRemarkCmts('')
    }


    const maxPageHeight = 900;
    const [pages, setPages] = useState([]);

    const [showOptionModal, setShowOptionModal] = useState(false)
    const [linkFormData, setlinkFormData] = useState({})
    const [linkErrors, setlinkErrors] = useState({})
    const [linkFields, setlinkFields] = useState({})
    const [updateProfileId, setUpdateProfileId] = useState(null)

    useEffect(() => {
        generatePagesDynamically();
    }, [templateFields]);

    useEffect(() => {
        if ((linkToLeader || linkToOrganization) && selectedEvent) {
            if (pages.length > 0) {
                if ((currentPage) >= pages.length - 2) {
                    var callApi = async () => {
                        if (totalEventPage === 0 || eventCurrentPage <= totalEventPage) {
                            setEventCurrentPage(eventCurrentPage + 1);
                            await fetchEventData();
                        }
                    }
                    callApi();
                }
            }
        }

    }, [currentPage, pages, selectedEvent])

    const fetchEventData = async () => {

        var apiRoute = ''
        var payload = {
            "page": eventCurrentPage,
            "per_page": 10,
            "filed_name": "modified_date",
            "order_by": "ASC"
        }

        if (linkToLeader) {
            apiRoute = '/templateData/getEventsByLeader'
            payload = { ...payload, "leader_id": selectedEvent }
        } else if (linkToOrganization) {
            apiRoute = '/templateData/getEventsByOrganization'
            payload = { ...payload, "organization_id": selectedEvent }
        }

        setLoading(true);
        try {
            const response = await api.post(apiRoute, payload);
            setLoading(false);

            if (response && response['data'] && response['data']['events'] && response['data']['events'].length > 0) {

                var updatedPages = response.data.events.map((data) => ({
                    name: data.event_id,
                    label: `${data.subject ? '<span class="ProfileViewHeading">Subject : </span> <br />' + data.subject : ''}`,
                }));

                var updatedData = response.data.events.reduce((acc, data) => {
                    acc[data.event_id] = `  ${data.source_of_message ? '<br /><span class="ProfileViewHeading">Source of Message : </span>' + data.source_of_message : ''}
                                            ${data.event_summary ? '<br /><span class="ProfileViewHeading">Event Summary : </span>' + data.event_summary : ''}
                                            ${data.description ? '<br /><span class="ProfileViewHeading">Description : </span>' + data.description : ''}`
                    return acc;
                }, {});

                setTemplateFields((prevPages) => [...prevPages, ...updatedPages]);
                setTotalEventPage(response['data']['total_pages']);
                setTemplateData((prevData) => ({ ...prevData, ...updatedData }));
            }

        } catch (error) {
            setLoading(false);
            console.log('Error fetching more data:', error);
        }
    };

    useEffect(() => {
        var gettingRoute = ''

        if (!linkToLeader && !linkToOrganization) {
            return;
        }

        if (linkToLeader) {
            gettingRoute = '/profileLeaders/viewProfileLeader'
        } else if (linkToOrganization) {
            gettingRoute = '/profileOrganizations/viewProfileOrganization'
        }
        var callApi = async () => {
            setLoading(true);
            try {

                var payload = {
                    "template_id": template_id,
                    "table_row_id": table_row_id
                }
                var getSelectedValue = await api.post(gettingRoute, payload);
                setLoading(false);

                if (getSelectedValue.success) {
                    if (getSelectedValue && getSelectedValue['data']) {
                        if (linkToLeader) {
                            setSelectedEvent(getSelectedValue['data']['leader_id'])
                        } else {
                            setSelectedEvent(getSelectedValue['data']['organization_id'])
                        }
                    }
                } else {
                    console.log(getSelectedValue.message)
                }

            } catch (err) {
                setLoading(false);
                console.log(err, "err err")
            }
        }
        callApi()
    }, [])


    // Update viewport size on window resize
    useEffect(() => {

        var updatedFields = templateFields.filter((data) => {

            if (data.type === 'profilepicture') {

                if (formData['attachments'] && formData['attachments'] && formData['attachments'].length > 0) {

                    const payloadId = formData['attachments'].filter((attachment) => attachment.attachment_name === formData[data.name]);
                    if (payloadId && payloadId.length > 0) {
                        const callAttachmentApi = async () => {
                            setLoading(true);
                            try {
                                var response = await api.post("/templateData/downloadDocumentAttachments/" + payloadId[0].profile_attachment_id);
                                setLoading(false);
                                if (response) {
                                    const imageUrl = URL.createObjectURL(response);

                                    setTemplateData((prevData) => ({
                                        ...prevData,
                                        [data.name]: imageUrl
                                    }));
                                } else {
                                    console.log('Unexpected response format:', response);
                                }
                            } catch (error) {
                                setLoading(false);
                                console.log(error, "error");
                            }
                        };
                        callAttachmentApi();
                    }
                }
            }

            return data.formType && data.formType !== 'Attachments';
        });

        setTemplateFields(updatedFields);

        const handleResize = () => {
            setViewportWidth((window.innerWidth / 2) - 160);
            setViewportHeight(window.innerHeight);
        };

        handleResize()
        window.addEventListener('resize', handleResize);

        // Cleanup on component unmount
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    // Handle next page
    const goToNextPage = async () => {
        if (pageFlip.current) {
            pageFlip.current.pageFlip().flipNext();
        }
    };

    // Handle previous page
    const goToPreviousPage = () => {
        if (pageFlip.current) {
            pageFlip.current.pageFlip().flipPrev();
        }
    };

    // Update current page on flip event
    const onPageFlip = (e) => {
        setCurrentPage(e.data); // Update the current page number
    };

    const showActivity = async () => {
        if (!table_row_id || table_row_id === '') {
            toast.warning('Please Check Profile Id', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                className: "toast-warning",
            });
            return
        }

        if (!template_id || template_id === '') {
            toast.warning('Please Check Template Id', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                className: "toast-warning",
            });
            return
        }

        var activityPayload = {
            template_id: template_id,
            table_row_id: table_row_id
        }
        setLoading(true);

        try {
            var activityResponse = await api.post("/activityLogs/getActivityLog", activityPayload);
            setLoading(false);

            if (activityResponse && activityResponse.success && activityResponse['data']) {

                if (activityResponse['data'].length === 0) {
                    setActivityTableData([]);
                    setshowActivityModal(true);
                    return;
                }

                var updatedData = activityResponse['data'].map((data, index) => {

                    const readableDate = new Date(data.created_at).toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: true
                    });

                    return {
                        id: data.activity_log_id,
                        sl_no: index + 1,
                        created_at: readableDate,
                        activity: data.activity,
                        username: data.username
                    }
                });

                setActivityTableData(updatedData);
                setshowActivityModal(true);

            } else {
                toast.error(activityResponse.message ? activityResponse.message : 'Something Went Wrong, Please Try Again !', {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    className: "toast-error",
                });
                return
            }
        } catch (error) {
            setLoading(false);
            toast.error(error && error.response && error.response['data'] && error.response['data'].message ? error && error.response && error.response['data'] && error.response['data'].message : 'Something Went Wrong, Please Try Again !', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                className: "toast-error",
            });
            return
        }

    }

    const showRemarks = async () => {
        if (!table_row_id || table_row_id === '') {
            toast.warning('Please Check Profile Id', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                className: "toast-warning",
            });
            return
        }

        if (!template_id || template_id === '') {
            toast.warning('Please Check Template Id', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                className: "toast-warning",
            });
            return
        }

        var activityPayload = {
            template_id: template_id,
            table_row_id: table_row_id
        }

        setAddNewRemarksModal(false);
        setLoading(true);

        try {
            var remarksResponse = await api.post("/comments/getComments", activityPayload);
            setLoading(false);

            if (remarksResponse && remarksResponse.success && remarksResponse['data']) {

                console.log(remarksResponse, "remarksResponse")

                if (remarksResponse['data'].length === 0) {
                    setRemarksTableData([]);
                    setshowRemarksModal(true);
                    return;
                }

                var updatedData = remarksResponse['data'].map((data, index) => {

                    var fullname = ''
                    if (data.user) {
                        if (data.user['user_firstname']) {
                            if (data.user['user_lastname']) {
                                fullname = data.user['user_firstname'] + ' ' + data.user['user_lastname'];
                            } else {
                                fullname = data.user['user_firstname'];
                            }
                        }
                    }

                    const readableDate = new Date(data.comment_date).toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: '2-digit'
                    });

                    return {
                        ...data,
                        id: data.comment_id,
                        sl_no: index + 1,
                        username: fullname,
                        comment_date: readableDate
                    }
                })

                setRemarksTableData(updatedData);
                setshowRemarksModal(true);

            } else {
                setRemarksTableData([]);
                setshowRemarksModal(true);
            }
        } catch (error) {
            setLoading(false);
            if (error && error.response && error.response['data'] && error.response['data'].message) {
                setRemarksTableData([]);
                setshowRemarksModal(true);
            } else {
                toast.error('Something Went Wrong, Please Try Again !', {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    className: "toast-error",
                });
                return
            }
        }
    }

    const addRemarksModal = () => {
        setshowRemarksModal(false);
        setAddNewRemarksModal(true);
        setRemarksData({
            "comment_date": new Date().toISOString().split('T')[0],
        });
    }

    const handleChangeDate = (name, newValues) => {
        if (errors[name]) {
            delete errors[name]
        }
        setRemarksData({
            ...remarksData,
            [name]: newValues,
        });
    }


    const handleChange = (e) => {
        const { name, value, type, checked, files } = e.target;
        if (errors[name]) {
            delete errors[name]
        }
        setRemarksData({
            ...remarksData,
            [name]: type === 'checkbox' ? checked : (type === 'file' ? Array.from(files) : value),
        });
    };

    const saveRemarks = async () => {

        if (!table_row_id || table_row_id === '') {
            toast.warning('Please Check Profile Id', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                className: "toast-warning",
            });
            return
        }

        if (!template_id || template_id === '') {
            toast.warning('Please Check Template Id', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                className: "toast-warning",
            });
            return
        }

        var remarksErrors = {};
        var errorFlag = false;

        if (Object.keys(remarksData).length === 0) {
            remarksErrors['comment'] = true;
            remarksErrors['comment_date'] = true;
            setErrors(remarksErrors);
            return;
        }

        if (!remarksData?.comment || remarksData.comment.trim() === '') {
            remarksErrors['comment'] = true;
            errorFlag = true;
        }

        if (!remarksData?.comment_date || String(remarksData.comment_date).trim() === '') {
            remarksErrors['comment_date'] = true;
            errorFlag = true;
        }

        if (errorFlag) {
            setErrors(remarksErrors);
            return;
        }

        var remarksPayload = {
            "template_id": template_id,
            "table_row_id": table_row_id,
            "comment": remarksData['comment'],
            "comment_date": remarksData['comment_date']
        }
        setLoading(true);

        try {
            var addRemarksResponse = await api.post("/comments/createComment", remarksPayload);
            setLoading(false);

            if (addRemarksResponse && addRemarksResponse.success) {
                toast.success(addRemarksResponse.message || "Remarks Added Successfully", {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    className: "toast-success",
                    onOpen: () => {showRemarks();setRemarksData({})}
                });
            } else {

                toast.error(addRemarksResponse.message ? addRemarksResponse.message : 'Please Try Again !', {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    className: "toast-error",
                });

            }
        } catch (error) {
            setLoading(false);
            if (error && error.response && error.response['data'] && error.response['data'].message) {
                toast.error(error.response['data'].message, {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    className: "toast-error",
                });
            } else {
                toast.error('Something Went Wrong, Please Try Again !', {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    className: "toast-error",
                });
                return
            }
        }
    }

    const generatePagesDynamically = () => {
        let renderedPages = [];
        let currentFields = [];
        let currentHeight = 0;

        const tempContainer = document.createElement('div');
        tempContainer.style.visibility = 'hidden';
        tempContainer.style.position = 'absolute';
        document.body.appendChild(tempContainer);

        templateFields.forEach((field, index) => {
            const fieldElement = document.createElement('div');
            fieldElement.style.padding = '10px';
            fieldElement.innerHTML = `
                <p>${field.label}${field.kannada ? field.kannada : ''}</p>
                <p>${templateData[field.name] ? templateData[field.name] : ''}</p>
            `;

            tempContainer.appendChild(fieldElement);
            const fieldHeight = fieldElement.offsetHeight;
            tempContainer.removeChild(fieldElement);

            if (currentHeight + fieldHeight <= maxPageHeight) {
                currentFields.push(field);
                currentHeight += fieldHeight;
            } else {
                renderedPages.push([...currentFields]);
                currentFields = [field];
                currentHeight = fieldHeight;
            }

            if (index === templateFields.length - 1 && currentFields.length) {
                renderedPages.push([...currentFields]);
            }
        });

        document.body.removeChild(tempContainer);
        setPages(renderedPages);
    };

    useEffect(() => {
        if (currentPage <= pages.length - 2) {
            setEventCurrentPage((prev) => prev + 1)
            fetchEventData()
        }
    }, [])

    var isProfileField = false;

    const showLeaders = async () => {
        var apiRoute = '';
        var gettingRoute = ''
        if (linkToLeader) {
            apiRoute = '/siims/getLeaders'
            gettingRoute = '/profileLeaders/viewProfileLeader'
        } else if (linkToOrganization) {
            apiRoute = '/siims/getOrganizations'
            gettingRoute = '/profileOrganizations/viewProfileOrganization'
        }
        setLoading(true);
        try {
            var getOptionsValue = await api.post(apiRoute);
            setLoading(false);

            if (getOptionsValue && getOptionsValue.data) {

                var updatedData = getOptionsValue.data.map((data) => {
                    return {
                        name: linkToLeader ? data.leader_name : data.organization_name,
                        code: linkToLeader ? data.leader_id : data.organization_id
                    }
                })
                setLoading(true);

                try {

                    var payload = {
                        "template_id": template_id,
                        "table_row_id": table_row_id
                    }
                    var getSelectedValue = await api.post(gettingRoute, payload);
                    setLoading(false);

                    if (getSelectedValue.success) {
                        if (getSelectedValue && getSelectedValue['data']) {
                            if (linkToLeader) {
                                setUpdateProfileId(getSelectedValue['data']['profile_leader_id'] ? getSelectedValue['data']['profile_leader_id'] : null);
                                setlinkFormData({ "leader": getSelectedValue['data']['leader_id'] })
                            } else {
                                setUpdateProfileId(getSelectedValue['data']['profile_organization_id'] ? getSelectedValue['data']['profile_organization_id'] : null);
                                setlinkFormData({ "organization": getSelectedValue['data']['organization_id'] })
                            }
                        }
                    } else {
                        setUpdateProfileId(null);
                        console.log(getSelectedValue.message)
                    }

                } catch (err) {
                    setLoading(false);
                    setUpdateProfileId(null);
                    console.log(err, "err err")
                }

                setlinkFields({
                    name: linkToLeader ? 'leader' : 'organization',
                    label: linkToLeader ? 'Select Leader' : 'Select Organization',
                    required: true,
                    options: updatedData
                })
                setShowOptionModal(true);

            }
        } catch (error) {
            setLoading(false);
            if (error && error.response && error.response['data']) {
                toast.error(error.response['data'].message || 'Please Try Again!', {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    className: "toast-error",
                });
            }
        }

    }

    const handleLinkToSelect = (name, value) => {
        var updatedData = {}
        updatedData[name] = value
        setlinkFormData(updatedData);
    }

    const submitLinkTo = async () => {
        if (linkToLeader) {
            if (linkFormData['leader']) {

                var leaderPayload = {
                    "template_id": template_id,
                    "table_row_id": table_row_id,
                    "leader_id": linkFormData['leader']
                }
                var apiRoute = '/profileLeaders/addProfileLeader';

                if (updateProfileId) {
                    leaderPayload['profile_leader_id'] = updateProfileId;
                    apiRoute = '/profileLeaders/updateProfileLeader'
                }
                setLoading(true);

                try {
                    var saveProfileLeader = await api.post(apiRoute, leaderPayload);
                    setLoading(false);

                    if (saveProfileLeader && saveProfileLeader.success) {
                        toast.success(saveProfileLeader.message || "Profile Leader Added Successfully", {
                            position: "top-right",
                            autoClose: 3000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                            progress: undefined,
                            className: "toast-success",
                            onOpen: () => {setlinkFields({});setlinkFormData({});setUpdateProfileId(null);setShowOptionModal(false);}
                        });
                    } else {
                        const errorMessage = saveProfileLeader.message ? saveProfileLeader.message : "Failed to add the leader. Please try again.";
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
                        
                    }
                } catch (error) {
                    setLoading(false);

                    if (error && error.response && error.response['data']) {
                        toast.error(error.response['data'].message || 'Please Try Again!', {
                            position: "top-right",
                            autoClose: 3000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                            progress: undefined,
                            className: "toast-error",
                        });
                    }
                }
            } else {
                var errorObj = {
                    leader: true
                }
                setlinkErrors(errorObj);
            }

        } else if (linkToOrganization) {
            if (linkFormData['organization']) {

                var organizationPayload = {
                    "template_id": template_id,
                    "table_row_id": table_row_id,
                    "organization_id": linkFormData['organization']
                }

                var apiRoute = '/profileOrganizations/addProfileOrganization';

                if (updateProfileId) {
                    organizationPayload['profile_organization_id'] = updateProfileId;
                    apiRoute = '/profileOrganizations/updateProfileOrganization'
                }
                setLoading(true);

                try {
                    var saveProfileOrganization = await api.post(apiRoute, organizationPayload);
                    setLoading(false);

                    if (saveProfileOrganization && saveProfileOrganization.success) {
                        toast.success(saveProfileOrganization.message || "Profile Organization Added Successfully", {
                            position: "top-right",
                            autoClose: 3000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                            progress: undefined,
                            className: "toast-success",
                            onOpen: () => {setlinkFields({});setlinkFormData({});setUpdateProfileId(null);setShowOptionModal(false);}
                        });
                    } else {
                        const errorMessage = saveProfileOrganization.message ? saveProfileOrganization.message : "Failed to add the organization. Please try again.";

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

                    }
                } catch (error) {
                    setLoading(false);
                    if (error && error.response && error.response['data']) {

                        toast.error(error.response['data'].message || 'Please Try Again!', {
                            position: "top-right",
                            autoClose: 3000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                            progress: undefined,
                            className: "toast-error",
                        });

                    }
                }

            } else {
                var errorObj = {
                    organization: true
                }
                setlinkErrors(errorObj);
            }

        }
    }

    const downloadProfile = async () => {

        setLoading(true);
        try {

            var downloadPayload = {
                "template_id": template_id,
                "table_row_id": table_row_id,
                "table_name": table_name
            }

            var downloadProfileResult = await api.post('/templates/downloadPdf', downloadPayload);
            setLoading(false);

            if (downloadProfileResult.success) {
                console.log("downloaded", downloadProfileResult)
            } else {
                toast.error(downloadProfileResult.message || 'Please Try Again!', {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    className: "toast-error",
                });

            }

        } catch (err) {
            setLoading(false);
            if (err && err.response && err.response['data']) {
                toast.error(err.response['data'].message || 'Please Try Again!', {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    className: "toast-error",
                });

            }
        }

    }

    const redirectProfileForward = ()=> {
        window.open(process.env.REACT_APP_SIIMS_FORWARD_URL+'?link='+process.env.REACT_APP_URL+'/profile-data?id='+table_row_id+'&tableName='+table_name+'&template_id='+selected_template_id)
    }

    return (
        <div style={{ padding: "0px 20px", overflow: 'hidden' }} inert={loading ? true : false}>

            <Box my={1} pr={1} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box onClick={() => navigate('/profile-data', { state: { profileDatapagination: profileDatapagination, selected_template_id: selected_template_id, table_name: hyperLinkTableName ? hyperLinkTableName : table_name, template_name: template_name, selectedFields: selectedFields } })} sx={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
                    <img src='./arrow-left.svg' />
                    <Typography variant="h1" align="left" className='ProfileNameText'>
                        Back
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {linkToLeader &&
                        <Button onClick={showLeaders} sx={{ background: '#32D583', color: '#101828', textTransform: 'none' }} variant="contained">
                            Link to Leader
                        </Button>
                    }

                    {linkToOrganization &&
                        <Button onClick={showLeaders} sx={{ background: '#32D583', color: '#101828', textTransform: 'none' }} variant="contained">
                            Link to Organization
                        </Button>
                    }
                    <Button onClick={()=>{setLoading(true); setIsDownloadPdf(true); }} sx={{ background: '#32D583', color: '#101828', textTransform: 'none', height: '38px' }} variant="contained">
                        Download
                    </Button>
                    <Button onClick={redirectProfileForward} sx={{ background: '#32D583', color: '#101828', textTransform: 'none', height: '38px' }} variant="contained">
                        Forward
                    </Button>
                    {/* <Button onClick={() => navigate('/profile-pdf', { state: { templateData, templateFields } })} sx={{ background: '#32D583', color: '#101828', textTransform: 'none', height: '38px' }} variant="contained">
                        Download
                    </Button> */}
                    <Button onClick={showActivity} sx={{ background: '#32D583', color: '#101828', textTransform: 'none', height: '38px' }} variant="contained">
                        Logs
                    </Button>
                    <Button onClick={showRemarks} sx={{ background: '#32D583', color: '#101828', textTransform: 'none', height: '38px' }} variant="contained">
                        Remarks
                    </Button>
                </Box>
            </Box>
            {isDownloadPdf && <GenerateProfilePdf templateData={templateData} templateFields={templateFields} template_name={template_name} onSave={handleOnSavePdf} />}

            {pages.length > 0 ? (
                <div style={{ position: 'relative' }}>
                    <button onClick={goToPreviousPage} disabled={currentPage === 0} className="pageLeftIcon">
                        <svg style={{ rotate: '180deg' }} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4 12H20M20 12L14 6M20 12L14 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                    {/* Render ReactPageFlip component */}
                    <ReactPageFlip
                        width={viewportWidth}
                        height={viewportHeight}
                        autoSize={true}
                        ref={pageFlip}
                        onFlip={onPageFlip}
                    >
                        {pages.map((fields, pageIndex) => (
                            <div key={pageIndex} className="page bg-white">
                                <div style={{ padding: "20px", height: "90vh", overflow: 'auto' }}>
                                    <div className="bg-white" style={{ padding: "10px" }} >
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                                            <h2 className="Roboto" style={{ margin: 0, color: "#101828", fontWeight: "800", fontSize: "22px" }}>
                                                SIIMS
                                            </h2>
                                            <img src={logo} width={36} height={32} alt="logo" />
                                        </div>
                                        <p style={{ fontWeight: "400", fontSize: "12px", margin: 0, color: "#3E4784", textAlign: "center" }} className="Roboto">
                                            {template_name ? template_name : ''}
                                        </p>
                                    </div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
                                        {fields.map((field, i) => {

                                            if (field.type === 'profilepicture') {
                                                if (templateData[field.name]) {
                                                    isProfileField = true;
                                                } else {
                                                    return
                                                }
                                            }

                                            var widthPercentage = ((field.type === 'profilepicture' && templateData[field.name]) || isProfileField) ? '45%' : '100%';
                                            var borderTopStyle = isProfileField ? 'none' : '1px solid #EAECF0';

                                            if (isProfileField && field.type !== 'profilepicture') {
                                                isProfileField = false;
                                            }

                                            return (
                                                <div key={i} style={{ width: widthPercentage, padding: "10px", borderTop: borderTopStyle }}>
                                                    {field.type === 'profilepicture' ? (
                                                        <img
                                                            src={templateData[field.name]}
                                                            style={{
                                                                width: "187px",
                                                                borderRadius: '12px',
                                                                height: '235px',
                                                                objectFit: 'cover'
                                                            }}
                                                        />
                                                    ) : (
                                                        <>
                                                            <p
                                                                className="Roboto ProfileViewHeading"
                                                                dangerouslySetInnerHTML={{
                                                                    __html: `${field.label}${field.kannada ? ` <span class="anekKannada"> / ${field.kannada}</span>` : ''}`
                                                                }}
                                                            ></p>
                                                            <p
                                                                className="anekKannada ProfileViewDesc "
                                                                dangerouslySetInnerHTML={{ __html: templateData[field.name] ? templateData[field.name] : '' }}>
                                                            </p>
                                                        </>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </ReactPageFlip>
                    <button onClick={goToNextPage} disabled={currentPage >= pages.length - 2} className="pageRightIcon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4 12H20M20 12L14 6M20 12L14 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                </div>
            ) : (
                <p>No Data Found</p> // Show loading state until data is fetched
            )}


            {/* logs data modal */}

            {showActivityModal &&
                <Dialog
                    open={showActivityModal}
                    onClose={() => setshowActivityModal(false)}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                    maxWidth="md"
                    fullWidth
                >
                    <DialogTitle id="alert-dialog-title" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} >
                        Logs
                        <IconButton
                            aria-label="close"
                            onClick={() => setshowActivityModal(false)}
                            sx={{ color: (theme) => theme.palette.grey[500] }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            <Box py={2}>
                                <TableView rows={activityTableData} columns={activityTableHeader} />
                            </Box>
                        </DialogContentText>
                    </DialogContent>
                </Dialog>
            }

            {viewRemarkModal &&
                <Dialog
                    open={viewRemarkModal}
                    onClose={handleClostViewRemarks}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                    maxWidth="md"
                    fullWidth
                >
                    <DialogTitle id="alert-dialog-title" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} >
                        Remark
                        <IconButton
                            aria-label="close"
                            onClick={handleClostViewRemarks}
                            sx={{ color: (theme) => theme.palette.grey[500] }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            <Box py={2}>
                                {viewRemarkCmts}
                            </Box>
                        </DialogContentText>
                    </DialogContent>
                </Dialog>
            }

            {/* remarks data modal */}

            {showRemarksModal &&
                <Dialog
                    open={showRemarksModal}
                    onClose={() => setshowRemarksModal(false)}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                    maxWidth="md"
                    fullWidth
                >
                    <DialogTitle id="alert-dialog-title" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        Remarks
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Button onClick={addRemarksModal} sx={{ background: '#32D583', color: '#101828', textTransform: 'none', height: '38px' }} variant="contained">
                                Add Remarks
                            </Button>
                            <IconButton
                                aria-label="close"
                                onClick={() => setshowRemarksModal(false)}
                                sx={{ color: (theme) => theme.palette.grey[500] }}
                            >
                                <CloseIcon />
                            </IconButton>
                        </Box>
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            <Box py={2}>
                                <TableView rows={remarksTableData} columns={remarksTableHeader} />
                            </Box>
                        </DialogContentText>
                    </DialogContent>
                </Dialog>
            }

            {/* add remarks modal */}

            {addNewRemarksModal &&
                <Dialog
                    open={addNewRemarksModal}
                    onClose={() => showRemarks()}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                    maxWidth="md"
                    fullWidth
                >
                    <DialogTitle id="alert-dialog-title" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} >
                        Add Remarks
                        <IconButton
                            aria-label="close"
                            onClick={showRemarks}
                            sx={{ color: (theme) => theme.palette.grey[500] }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            <Grid container>
                                <Grid item xs={12} md={12} p={2}>
                                    <div className='form-field-wrapper_selectedField'>
                                        <DateField
                                            field={remarksDateField}
                                            formData={remarksData}
                                            errors={errors}
                                            onChange={(value) => { handleChangeDate(remarksDateField.name, value) }}
                                        />
                                    </div>
                                </Grid>
                            </Grid>
                            <Grid item xs={12} md={12} p={2}>
                                <div className='form-field-wrapper_selectedField'>
                                    <LongText
                                        field={remarktextareaField}
                                        formData={remarksData}
                                        errors={errors}
                                        onChange={handleChange}
                                    />
                                </div>
                            </Grid>
                            <Grid item xs={12} md={12} p={2} sx={{ display: 'flex', justifyContent: 'end', gap: '12px' }}>
                                <Button onClick={showRemarks} sx={{ border: '1px solid #D0D5DD', color: '#98A2B3', textTransform: 'none', height: '38px' }} variant="outlined">
                                    Close
                                </Button>
                                <Button onClick={saveRemarks} sx={{ background: '#32D583', color: '#101828', textTransform: 'none', height: '38px' }} variant="contained">
                                    Save
                                </Button>
                            </Grid>
                        </DialogContentText>
                    </DialogContent>
                </Dialog>
            }

            {showOptionModal &&
                <Dialog
                    open={showOptionModal}
                    onClose={() => setShowOptionModal(false)}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                    maxWidth="md"
                    fullWidth
                >
                    <DialogTitle id="alert-dialog-title" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} >
                        <Box>
                            {linkToLeader ? 'Select Leaders' : 'Select Organization'}
                        </Box>
                        <IconButton
                            aria-label="close"
                            onClick={() => setShowOptionModal(false)}
                            sx={{ color: (theme) => theme.palette.grey[500] }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </DialogTitle>
                    <DialogContent sx={{ minWidth: '400px' }}>
                        <DialogContentText p={2} id="alert-dialog-description">
                            <FormControl fullWidth>
                                {/* <SelectField
                                    key='link_to'
                                    field={linkFields}
                                    formData={linkFormData}
                                    errors={linkErrors}
                                    onChange={(value) => handleLinkToSelect(linkFields.name, value.target.value)} /> */}
                                <VirtualizedSearchAutocomplete
                                    data={linkFields?.options}
                                    field={linkFields}
                                    initialValueCode={linkFormData}
                                    handleLinkToSelect={(value) => handleLinkToSelect(linkFields.name, value)}
                                />
                            </FormControl>
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions sx={{ padding: '12px 24px' }}>
                        <Button onClick={() => setShowOptionModal(false)}>Cancel</Button>
                        <Button onClick={submitLinkTo} className='fillPrimaryBtn'>Submit</Button>
                    </DialogActions>
                </Dialog>
            }

            {
                loading && <div className='parent_spinner' tabIndex="-1" aria-hidden="true">
                    <CircularProgress size={100} />
                </div>
            }
        </div>
    );
};

export default ProfileView;
