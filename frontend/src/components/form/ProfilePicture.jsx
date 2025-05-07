import React, { useEffect, useState } from "react";
import { Button, Box, Typography, Grid, Tooltip } from "@mui/material";
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import { styled } from '@mui/material/styles';
import DummyImage from '../../Images/DummyImage.svg'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';import api from '../../services/api'
import InfoIcon from '@mui/icons-material/Info';
import { CircularProgress } from "@mui/material";
import HistoryIcon from '@mui/icons-material/History';

const ProfilePicture = ({ field, formData, errors, onChange, onFocus, isFocused, onHistory, readOnly }) => {   
    const [uploadedImage, setUploadedImage] = useState(null); // To store the uploaded image
    const [loading, setLoading] = useState(false); // State for loading indicator

    useEffect(()=>{
        if (!(formData[field.name] instanceof File)) {
            if(formData && formData['attachments'] && formData['attachments'][0] && formData['attachments'].length > 0){

                const payloadId = formData['attachments'].filter((attachment)=> attachment.attachment_name === formData[field.name]);

                if(payloadId && payloadId.length > 0){
                    const callAttachmentApi = async () => {
                        setLoading(true);
                        try {
                            var response = await api.post("/templateData/downloadDocumentAttachments/"+payloadId[0].profile_attachment_id);            
                            setLoading(false);
                            if (response) {
                                const imageUrl = URL.createObjectURL(response);
                
                                setUploadedImage(imageUrl)
                            } else {
                                console.log('Unexpected response format:', response);
                            }
                        } catch (error) {
                            setLoading(false);
                            console.log(error,"error");
                        }
                    };
                    callAttachmentApi();
                }
            }
        }else {
            if(formData && Object.keys(formData).length > 0 && formData[field.name]){
                const imageUrl = URL.createObjectURL(formData[field.name]);
                setUploadedImage(imageUrl);
            }
        }
    },[formData]);

    const handleFileChange = async (event) => {

        if(formData && Object.keys(formData).length > 0 && formData['attachments'] && formData['attachments'].length > 0 && formData[field.name]){

            if(!(formData[field.name] instanceof File)){
                if(formData && Object.keys(formData).length > 0 && formData['attachments']){
                    var payloadFile = formData['attachments'].filter((attachment)=> attachment.attachment_name === formData[field.name]);
                    if(payloadFile && payloadFile[0] && payloadFile[0].profile_attachment_id){
                        setLoading(true);
                        try {
                            var response = await api.post("/templateData/deleteFile",{profile_attachment_id : payloadFile[0].profile_attachment_id});
                            setLoading(false);
                            if(response.success){
                                console.log("deleted")
                            }else{
                                console.log("not deleted")
                            }
                        } catch (error) {
                            setLoading(false);
                            console.log(error,"error");
                        }
                    }else{
                        console.log("cant get the file");
                    }
                }
            }
        }

        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            onChange(field.name, file);
        } else {
            toast.error('Please upload a valid image file.', {
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
    };

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
    
    return (
        <Box sx={{width:'100%'}}  inert={ loading ? true : false}>
            <Box>
                <Grid container spacing={2}>
                    <Grid item>
                        <Box sx={{width:'208px',height:'208px',border:  Boolean(errors?.[field?.name]) ? '2px solid #F04438' : '2px solid #1570EF',borderRadius:'8px',display:'flex',alignItems:'center',justifyContent:'center',background:'#D0D5DD',padding:'1px'}}>
                            <img
                                src={uploadedImage || DummyImage}
                                alt="Uploaded"
                                style={{ width: '100%', height: '100%', objectFit: 'cover',borderRadius:'8px' }}
                            />
                        </Box>
                    </Grid>
                    <Grid item xs={6} md={6} sx={{display:'flex',alignItems:'start',justifyContent:'center',flexDirection:'column',gap:'20px',flexWrap:'wrap'}}>
                        <h4 className={`form-field-heading ${readOnly || field.disabled ? 'disabled' : ''}`}>
                            <div style={{ display: 'flex', alignItems: 'center',color: Boolean(errors?.[field?.name]) ? '#F04438' : '' }}>
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
                        <Button
                            component="label"
                            variant="outlined"
                            tabIndex={-1}
                            disabled={readOnly || field.disabled === true}
                            startIcon={<ArrowUpwardIcon />}
                            sx={{textTransform: 'none'}}
                        >
                            Upload Profile Picture
                            <VisuallyHiddenInput
                                type="file"
                                accept=".png, .svg, .jpg, .jpeg"
                                onChange={handleFileChange}
                                multiple
                                name={field.name}
                                onFocus={onFocus}
                                focused={isFocused || false}
                            />
                        </Button>
                    </Grid>
                </Grid>
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

export default ProfilePicture;
