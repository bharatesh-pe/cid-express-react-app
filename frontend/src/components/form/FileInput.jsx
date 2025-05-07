import React, { useEffect, useState } from "react";
import { Button, Box, Typography, Tooltip } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import { styled } from '@mui/material/styles';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import pdfIcon from '../../Images/pdfIcon.svg'
import docIcon from '../../Images/docIcon.svg'
import xlsIcon from '../../Images/xlsIcon.svg'
import pptIcon from '../../Images/pptIcon.svg'
import jpgIcon from '../../Images/jpgIcon.svg'
import pngIcon from '../../Images/pngIcon.svg'
import attachmentCancel from '../../Images/attachmentCancel.svg'
import api from '../../services/api'
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import InfoIcon from '@mui/icons-material/Info';
import HistoryIcon from '@mui/icons-material/History';
import { CircularProgress } from "@mui/material";

const FileInput = ({ field, formData, errors, onChange, onFocus, isFocused, onHistory }) => {
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [attachmentFolder,setAttachmentFolder] = useState([]);
    const [selectedFolder,setSelectedFolder] = useState(null);
    const [loading, setLoading] = useState(false); // State for loading indicator

    var supportFormat = field?.selectedSupportFormat?.length > 0 ? field.selectedSupportFormat.map((format) => format.ext) : '';
    const handleFileChange = (event) => {

        if (event.target.files.length > 0) {
            const selectedFiles = Array.from(event.target.files);
        
            const validFiles = selectedFiles.filter(file => {
                const fileExtension = `.${file.name.split('.').pop().toLowerCase()}`;
                return supportFormat.length === 0 || supportFormat.includes(fileExtension);
            });
        
            if (validFiles.length !== selectedFiles.length) {

                toast.warning(`Some files have unsupported formats. Supported formats are: ${supportFormat.join(', ')}`, {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    className: "toast-warning",
                });
                return;
            }
        
            const newFiles = validFiles.map(file => ({
                "field_name": field.name,
                "filename": file,
                "folder_id": selectedFolder
            }));
        
            if (field.multiple) {
                setUploadedFiles(prev => [...prev, ...newFiles]);
                onChange(field.name, [...uploadedFiles, ...newFiles]);
            } else {
                if (uploadedFiles.length > 0) {
                    toast.warning("Only one file is supported. Please remove the existing file before adding a new one.", {
                        position: "top-right",
                        autoClose: 3000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        className: "toast-warning",
                    });
                } else {
                    setUploadedFiles([newFiles[0]]);
                    onChange(field.name, [newFiles[0]]);
                }
            }
        }
        
    };

    useEffect(() => {
        if (!field.multiple && uploadedFiles.length > 1) {
            setUploadedFiles(uploadedFiles.slice(0, 1));
        }
    }, [field.multiple]);

    // useEffect(()=>{
    //     var callFolderApi = async () =>{
    //         setLoading(true);
    //         try {
    //             var response = await api.post("/siims/getAllFolderCategories");
    //             setLoading(false);
    //             if(response.success){
    //                 if(response.data && response.data.length > 0){
    //                     setAttachmentFolder(response.data)
    //                     setSelectedFolder(response.data[0].folder_id ? response.data[0].folder_id : null)
    //                 }
    //             }else{
    //                 toast.error("Can't Get the Attachment Folder", {
    //                     position: "top-right",
    //                     autoClose: 3000,
    //                     hideProgressBar: false,
    //                     closeOnClick: true,
    //                     pauseOnHover: true,
    //                     draggable: true,
    //                     progress: undefined,
    //                     className: "toast-error",
    //                 });
    //             }
    //         } catch (error) {
    //             setLoading(false);
    //             console.log(error,"error");
    //         }
    //     }
    //     callFolderApi();
    // },[])

    const removeAttachment = (indexToRemove) => {
        
        Swal.fire({
            title: 'Warning',
            text: "Are you sure you want to remove this file? Once removed, you won't be able to get it back.",            
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, remove it',
            cancelButtonText: 'Cancel'        
        }).then( async (result) => {
            if (result.isConfirmed) {

                const getFiles = uploadedFiles.filter((_, index) => index == indexToRemove);

                if(!(getFiles[0].filename instanceof File)){
                    if(formData && Object.keys(formData).length > 0 && formData['attachments']){
                        var payloadFile = formData['attachments'].filter((attachment)=> attachment.attachment_name === getFiles[0].filename);
                        if(payloadFile && payloadFile[0] && payloadFile[0].profile_attachment_id){
                            setLoading(true);
                            try {
                                var response = await api.post("/templateData/deleteFile",{profile_attachment_id : payloadFile[0].profile_attachment_id});
                                setLoading(false);
                                if(response.success){
                                    setUploadedFiles(prevFiles => {
                                        const updatedFiles = prevFiles.filter((_, index) => index !== indexToRemove);
                                        onChange(field.name, updatedFiles);
                                        return updatedFiles;
                                    });
                                }else{
                                    toast.error('Please Try Again !', {
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
                                console.log(error,"error");
                            }
                        }else{
                            console.log("cant get the file");
                        }
                    }
                }else{
                    setUploadedFiles(prevFiles => {
                        const updatedFiles = prevFiles.filter((_, index) => index !== indexToRemove);
                        onChange(field.name, updatedFiles);
                        return updatedFiles;
                    });
                }

            }
        });
    };     

    useEffect(()=>{
        if(formData && Object.keys(formData).length > 0 && formData[field.name] && typeof formData[field.name] === 'string' ){
            var existingFiles = formData[field.name].split(',');
            if(existingFiles && existingFiles.length > 0){

                if(formData && formData['attachments'] && formData['attachments'].length > 0){

                    const filteredFiles = formData['attachments'].filter((element) => {
                        return existingFiles.includes(element.attachment_name);
                    });
                    
                    existingFiles = filteredFiles.map((element) => {
                        return {
                            field_name: field.name,
                            filename: element.attachment_name,
                            folder_id: element.folder_id
                        };
                    });

                }
                setUploadedFiles(existingFiles);
            }
        }
    },[formData])

    const VisuallyHiddenInput = styled('input')({
        clip: 'rect(0 0 0 0)',
        clipPath: 'inset(50%)',
        height: 1,
        overflow: 'hidden',
        position: 'absolute',
        bottom: 0,
        left: 0,
        whiteSpace: 'nowrap',
        width: 1,
    });

    const getFileIcon = (fileName) => {
        fileName = fileName.split('.').pop().toLowerCase()
        switch (fileName) {
            case 'pdf':
                return <img src={pdfIcon} />;
            case 'jpg':
            case 'jpeg':
                return <img src={jpgIcon} />;
            case 'png':
            case 'svg':
            case 'gif':
                return <img src={pngIcon} />;
            case 'xls':
            case 'xlsx':
                return <img src={xlsIcon} />;
            case 'csv':
            case 'docx':
            case 'doc':
                return <img src={docIcon} />;
            case 'ppt':
                return <img src={pptIcon} />;
            default:
                return <InsertDriveFileIcon />;
        }
    };

    const openFileInNewTab = async (file) => {

        if (file instanceof File || file instanceof Blob) {
            var fileUrl = URL.createObjectURL(file);
            var newTab = window.open();
            newTab.document.body.innerHTML = `<embed src="${fileUrl}" width="100%" height="100%" />`;
        } else {
            if(formData && Object.keys(formData).length > 0 && formData['attachments']){
                var payloadFile = formData['attachments'].filter((attachment)=> attachment.attachment_name === file);
                if(payloadFile && payloadFile[0] && payloadFile[0].profile_attachment_id){
                    setLoading(true);
                    try {
                        var response = await api.post("/templateData/downloadDocumentAttachments/"+payloadFile[0].profile_attachment_id);
                        setLoading(false);
                        if (response && response instanceof Blob) {
                            let fileUrl = URL.createObjectURL(response);
                            let newTab = window.open();
                            newTab.document.body.innerHTML = `<embed src="${fileUrl}" width="100%" height="100%" />`;
                        } else {
                            console.log('Unexpected response format:', response);
                        }
                    } catch (error) {
                        setLoading(false);
                        console.log(error,"error");
                        toast.error('Please Try Again !', {
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
                }else{
                    console.log("cant get the file");
                }
            }
        }
    };

    return (
        <Box inert={loading ? true : false}>
            <h4 className={`form-field-heading ${field.disabled ? 'disabled' : ''}`}>
                <div style={{ display: 'flex', alignItems: 'center',color: errors && errors[field.name] && Boolean(errors[field.name]) ? '#F04438' : '' }}>
                    <span>
                        {field.label}
                    </span>
                    <span className="anekKannada" style={{ marginTop: '6px' }}>
                        {field.kannada ? '/ ' + field.kannada + ' ' : ''}
                    </span>
                    {field.required && (
                        <span
                            style={{
                                padding: '0px 0px 0px 5px', 
                                verticalAlign: 'middle'
                            }} 
                            className='MuiFormLabel-asterisk MuiInputLabel-asterisk css-1ljffdk-MuiFormLabel-asterisk'
                        >
                            {'*'}
                        </span>
                    )}
                    {field.info && (
                        <Tooltip title={field.info ? field.info : ''} arrow placement="top">
                            <InfoIcon className='infoIcon' sx={{
                                color: '#1570EF', 
                                padding: '0px 0px 0px 3px', 
                                fontSize: '20px',
                                verticalAlign: 'middle',
                                marginBottom:'3px'
                            }}/>
                        </Tooltip>
                    )}
                    {field.history && (
                        <HistoryIcon 
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (onHistory) {
                                    onHistory();
                                } else {
                                    console.log("clicked");
                                }
                            }}
                            className='historyIcon' sx={{
                            color: '#1570EF', 
                            padding: '0 1px', 
                            fontSize: '20px',
                            verticalAlign: 'middle',
                            cursor: 'pointer',
                            pointerEvents: 'auto',
                            marginBottom:'3px'
                        }}/>
                    )}
                </div>
            </h4>
            {/* <Box pb={3} sx={{display:'flex',alignItems:'center',gap:'8px'}}>
                {attachmentFolder && attachmentFolder.length > 0 && attachmentFolder.map((element)=>(
                    element.is_active && (
                        <Box onClick={()=>setSelectedFolder(element.folder_id)} className={` folderCategoryBox ${selectedFolder === element.folder_id ? 'active' : ''}`}>
                            {element.folder_name}
                        </Box>
                    )
                ))}
            </Box> */}

            <Button
                component="label"
                variant="outlined"
                role={undefined}
                tabIndex={-1}
                required={field.required === true}
                disabled={field.disabled === true}
                startIcon={<AddIcon />}
                sx={{textTransform: 'none'}}
            >
                {field.multiple ? 'Choose Files' : 'Choose File' }
                <VisuallyHiddenInput
                    type="file"
                    onChange={handleFileChange}
                    multiple
                    accept={supportFormat.length > 0 ? supportFormat.join(',') : ''}
                    name={field.name}
                    onFocus={onFocus}
                    focused={isFocused || false}
                />
            </Button>
            <Box mt={2} sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px' }}>
                {uploadedFiles.map((file, index) => (
                    file.folder_id === selectedFolder && (
                    <Box
                        key={index}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '8px',
                            borderRadius: '6px',
                            border: '1px solid #D0D5DD',
                        }}
                    > 
                        <Typography onClick={()=>openFileInNewTab(file.filename)} variant="body2" sx={{ wordBreak: 'break-word', cursor:'pointer' }}>
                            {getFileIcon(file.filename instanceof File ? file.filename['name'] : file.filename)}
                        </Typography>
                        <Typography onClick={()=>openFileInNewTab(file.filename)} variant="body2" sx={{ wordBreak: 'break-word', cursor:'pointer' }}>
                            {file.filename instanceof File ? file.filename['name'] : file.filename}
                        </Typography>
                        <button type="button" disabled={field.disabled === true} onClick={()=>removeAttachment(index)} style={{border:'none',background:'transparent',display:'flex',alignItems:'center',padding:'0',cursor:field.disabled === true ? 'not-allowed' : 'pointer'}}>
                            <img src={attachmentCancel} alt="remove" />
                        </button>
                    </Box>
                    )
                ))}
            </Box>
            {errors && errors[field.name] && <div style={{ color: '#F04438' }}>{errors[field.name]}</div>}

            {
                loading &&  <div className='parent_spinner' tabIndex="-1" aria-hidden="true">
                                <CircularProgress size={100} />
                            </div>
            }
        </Box>
    );
};

export default FileInput;
