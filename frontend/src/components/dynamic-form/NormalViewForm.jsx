// DynamicForm.js
import React, { useState, useEffect, useRef } from 'react';
import isEqual from 'lodash.isequal';

// import formConfig from './formConfig.json';
import { Button, Grid, Box, Typography, IconButton, Chip, FormControl, Autocomplete, DialogActions, TextField } from '@mui/material';
import { Stepper, Step, StepLabel } from '@mui/material';
import WestIcon from '@mui/icons-material/West';
import ShortText from '../form/ShortText';
import DateField from '../form/Date';
import SelectField from '../form/Select';
import LongText from '../form/LongText';
import ValueRangeField from '../form/ValueRange';
import CheckboxesBtn from '../form/Checkbox';
import RadioBtn from '../form/Radio';
import MultiSelect from '../form/MultiSelect';
import FileInput from '../form/FileInput';
import AutocompleteField from '../form/AutoComplete';
import DateTimeField from '../form/DateTime';
import TimeField from '../form/Time';
import TabsComponents from '../form/Tabs';
import ProfilePicture from '../form/ProfilePicture';
import api from '../../services/api';
import TableView from "../table-view/TableView";

import "./DynamicForm.css";
import NumberField from '../form/NumberField';

import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';

import { CircularProgress } from "@mui/material";

import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import CloseIcon from '@mui/icons-material/Close';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import ActTable from './actSection';
import RichTextEditor from '../form/RichTextEditor';
import DropdownWithAdd from '../form/DropdownWithAdd';
import dayjs from 'dayjs';

const NormalViewForm = ({ 
    formConfig, initialData, onSubmit, onError, stepperData, closeForm, table_name, template_name, readOnly, editData, onUpdate, template_id, table_row_id, headerDetails, selectedRow, noPadding, disableEditButton, disableSaveNew, overAllReadonly, investigationViewTable, editedForm
    , showAssignIo, investigationAction, reloadApproval, showCaseActionBtn
 }) => {

//   let storageFormData = localStorage.getItem(template_name + '-formData') ? JSON.parse(localStorage.getItem(template_name + '-formData')) : {};

  const [formData, setFormData] = useState({});
  const [newFormConfig, setNewFormConfig] = useState(formConfig ? formConfig : {})
  const [stepperConfigData, setstepperConfigData] = useState([])
  const [errors, setErrors] = useState({});
  const formButtonRef = useRef(null);
  const [activeStep, setActiveStep] = useState(0);
  const [stepperPercentage, setStepperPercentage] = useState({});
  const [loading, setLoading] = useState(false); // State for loading indicator
  const [selectedField, setSelectedField] = useState({});

  const [historyModal, setHistoryModal] = useState(false)
  const [historyData, setHistoryData] = useState([])
  const [historyHeaderData, sethistoryHeaderData] = useState([
    { field: 'sl_no', headerName: 'Sl. No.' },
    { field: 'updated_value', headerName: 'Updated Value', flex: 1 },
    { field: 'old_value', headerName: 'Old Value', flex: 1 },
    { field: 'username', headerName: 'Edited User', flex: 1 },
    { field: 'date', headerName: 'Date & Time', flex: 1 }
  ]);

    const saveNewActionRef = useRef(false);
    const orderCopyFieldMandatory = useRef(false);
    const changingFormField = useRef(false);


    const [showActionModal, setShowActionModal] = useState(false);
    const [caseActionOptions, setCaseActionOptions] = useState([]);
    const [caseActionSelectedValue, setCaseActionSelectedValue] = useState(null);
    const [actionCases, setActionCases] = useState([]);
    const [actionCasesPage, setActionCasesPage] = useState(0);
    const actionCasesPageSize = 10;

    const [caseHistoryModal, setCaseHistoryModal] = useState(false);
    const [caseHistoryData, setCaseHistoryData] = useState([]);
    const [caseHistoryHeaderData, setCasehistoryHeaderData] = useState([
        { field: "sl_no", headerName: "Sl. No." },
        { field: "action", headerName: "Action", flex: 1 },
        { field: "actor_name", headerName: "User", flex: 1 },
        { field: "date", headerName: "Date & Time", flex: 1 },
    ]);
  
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData(initialData);
    }
  }, [initialData]);

    var userPermissions = JSON.parse(localStorage.getItem("user_permissions")) || [];

    const [readOnlyTemplate, setReadonlyTemplate] = useState(readOnly);
    const [editDataTemplate, setEditDataTemplate] = useState(editData);

    const templateEdit = ()=>{
        setReadonlyTemplate((prev)=>!prev);
        setEditDataTemplate((prev)=>!prev);
    }

  const [dateUpdateFlag, setDateUpdateFlag] = useState(false);

    const [tableActRow, setTableActRow] = useState([{ act: "", section: "" }]);

    const UpdateTableRowApi = (rows)=>{

        const allFields = (stepperData && stepperData.length > 0) ? stepperConfigData : newFormConfig;

        const actField = allFields.find((f) => f.table === "act");
        const sectionField = allFields.find((f) => f.table === "section");

        if(actField && sectionField){

            const acts = tableActRow.map((row) => row.act).filter((val) => val);
    
            const sections = tableActRow.flatMap((row) => row.section || []).filter((val) => val);

            if(acts.length === 0 || acts === ""){
                setTableActRow(rows);
                return;
            }
    
            var savingObj = {
                [actField.name] : acts,
                [sectionField.name] : sections
            }
    
            setFormData({
                ...formData,
                ...savingObj,
            });
        }

        setTableActRow(rows);
    };
    
    const makeOrderCopyShow = (value) => {

        orderCopyFieldMandatory.current = value

    };

//   useEffect(() => {
//     if (formData && Object.keys(formData).length !== 0 && !formData.id) {
//       localStorage.setItem(template_name + '-formData', JSON.stringify(formData));
//     }
//   }, [formData]);

    const [dropdownInputValue, setDropdownInputValue] = useState({});

    const dropdownWithAddItem = async (field, value) => {

        if(!value || value.trim() === ""){
            toast.error('Please Check the Value Before Adding', {
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

        const result = await Swal.fire({
            title: 'Add Value?',
            text: `Do you want to add "${value}" to the dropdown?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes, add it',
            cancelButtonText: 'No, cancel'
        });

        if (!result.isConfirmed) {
            return;
        }

        var alreadyExistOption = false;

        if(field.options && field.options.length > 0){
            field.options.map((element)=>{
                if(element.name.trim() === value.trim()){
                    alreadyExistOption = true;
                }
            });
        }

        if(alreadyExistOption){
            toast.error('Option Already Exist', {
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

        var payloadData = {
            table_name : field.table || null,
            key: field?.attributes?.[0] || null,
            value: value,
            id : field?.id,
            primaryTable : table_name || null
        }

        setLoading(true);
        try {
            const response = await api.post('/templateData/addDropdownSingleFieldValue', payloadData)

            setLoading(false);

            if (response && response.success && response.data) {

                const {addingValue, options} = response.data;


                setSelectedField(prev => ({
                    ...prev,
                    options: [...options]
                }));

                var updatedFormConfig = newFormConfig.map((data) => {
                    if (data?.id === field?.id) {
                        if (data.options) {
                            return { ...data, options: [...options] };
                        } else {
                            return { ...data };
                        }
                    } else {
                        return { ...data };
                    }
                });
                setNewFormConfig(updatedFormConfig);

                if(addingValue?.id){
                    setFormData(prevData => ({
                        ...prevData,
                        [field.name]: addingValue?.id
                    }));
                }

                setDropdownInputValue(prev => {
                    if (!prev) return prev;
                    const updated = { ...prev };
                    delete updated[field.name];
                    return updated;
                });
            }
            
        } catch (error) {
            setLoading(false);
            if (error && error.response && error.response.data) {
                toast.error(error.response.data['message'] ? error.response.data['message'] : 'Please try again!', {
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
        }
    }

  const handleChangeDate = (name, newValues) => {
    // setFormData({
    //   ...formData,
    //   [name]: newValues,
    // });
    handleMaxDateChange(name,newValues);
  }

    const handleMaxDateChange = (name, values)=>{

        if(name && name === "field_date_of_registration_by_ps/range" && table_name === "cid_under_investigation"){
            var formConfigData = (stepperData && stepperData.length > 0) ? stepperConfigData : newFormConfig;
        
            var wantUpdateDateFields = [
                "field_date_of_entrustment_to_cid",
                "field_date_of_taking_over_by_cid",
                "field_date_of_taking_over_by_present_io",
                "field_date_of_submission_of_fr_to_court"
            ]
        
            var updatedFormConfigData = formConfigData.map((field) => {
                if (wantUpdateDateFields.includes(field?.name)) {
                    return {
                        ...field,
                        maxValue: values
                    };
                }
                return field;
            });

            const updatedFormData = { ...formData };

            wantUpdateDateFields.forEach((name) => {
                delete updatedFormData[name];
            });

            updatedFormData[name] = values

            setFormData(updatedFormData);

            setNewFormConfig(updatedFormConfigData);
        }else{
            setFormData({
                ...formData,
                [name]: values,
            });
        }
    }

    useEffect(()=>{

        if(formData?.["field_date_of_registration_by_ps/range"] && !dateUpdateFlag && table_name === "cid_under_investigation"){

            var wantUpdateDateFields = [
                "field_date_of_entrustment_to_cid",
                "field_date_of_taking_over_by_cid",
                "field_date_of_taking_over_by_present_io",
                "field_date_of_submission_of_fr_to_court"
            ]

            var formConfigData = (stepperData && stepperData.length > 0) ? stepperConfigData : newFormConfig;
        
            var updatedFormConfigData = formConfigData.map((field) => {
                if (wantUpdateDateFields.includes(field?.name)) {
                    return {
                        ...field,
                        maxValue: formData["field_date_of_registration_by_ps/range"]
                    };
                }
                return field;
            });

            setNewFormConfig(updatedFormConfigData);
            setDateUpdateFlag(true);

        }

        if(table_name === "cid_pending_trial" && formData?.['field_cc_pending']){
            
            var requiredStatus = false;

            if(formData?.['field_cc_pending'] === "No"){
                requiredStatus = true;
            }

            setNewFormConfig((prevFormConfig) => {
                const updatedFormConfig = prevFormConfig.map((data) => {
                    if(data.name === "field_cc_no./sc_no"){
                        return {...data, required : requiredStatus }
                    }else{
                        return data;
                    }
                });
                return updatedFormConfig;
            });
        }

        const initialIsEmpty = !initialData || Object.keys(initialData).length === 0;
        const formHasValues = formData && Object.keys(formData).length > 0 && Object.values(formData).some(val => val !== "" && val !== null && val !== undefined);;

        const checkInitialData = {};
        const checkFormData = {};

        newFormConfig.forEach((config) => {
            const name = config.name;

            if (initialData && initialData.hasOwnProperty(name)) {
                checkInitialData[name] = Array.isArray(initialData[name]) ? initialData[name].join(',') : initialData[name];
            }
            if (formData.hasOwnProperty(name)) {
                checkFormData[name] = Array.isArray(formData[name]) ? formData[name].join(',') : formData[name];
            }
        });  

        var changingFlag = false;

        if (initialIsEmpty && formHasValues) {                        
            changingFlag = true
        } else if (!initialIsEmpty && !isEqual(checkInitialData, checkFormData)) {
            changingFlag = true;
        } else {
            changingFlag = false;
        }  

        changingFormField.current = changingFlag

        if(editedForm){
            editedForm(changingFlag);
        }

    },[formData]);


  const handleChange = (e) => {
    // console.log(e.target)

    const { name, value, type, checked, files } = e.target;
    if (type === 'checkbox-group') {
      const newValues = formData[name] ? [...formData[name]] : [];
      if (checked) {
        newValues.push(value);
      } else {
        const index = newValues.indexOf(value);
        newValues.splice(index, 1);
      }
      setFormData({
        ...formData,
        [name]: newValues,
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : (type === 'file' ? Array.from(files) : value),
      });
    }

  };

    const validate = () => {
        let tempErrors = {};
        newFormConfig.forEach((field) => {

            if(field?.hide_from_ux){
                return null
            }

            // if(table_name === "cid_under_investigation" || table_name === "cid_pending_trial" || table_name === "cid_enquiries"){
            //     const roleTitle = JSON.parse(localStorage.getItem("role_title")?.toLowerCase().trim());

            //     if (roleTitle === "admin organization") {
            //         if (!field.ao_field) {
            //             field.disabled = true;
            //             if (field.required) {
            //                 field.required = false;
            //             }
            //         }
            //     } else {
            //         if (field.ao_field) {
            //             field.disabled = true;
            //             if (field.required) {
            //                 field.required = false;
            //             }
            //         }
            //     }
            // }

            if (Boolean(field.required) && !formData[field.name]) {
                tempErrors[field.name] = `${field.label} is required`;
            } else if (field.minLength && formData[field.name] !== "" && formData[field.name]?.length < field.minLength) {
                tempErrors[field.name] = `${field.label} must be at least ${field.minLength} characters long`;
            } else if (field.maxLength && formData[field.name] !== "" && formData[field.name]?.length > field.maxLength) {
                tempErrors[field.name] = `${field.label} must be less than ${field.maxLength} characters long`;   
            }
        });
        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData || Object.keys(formData).length === 0) {
        toast.error("Data is empty", {
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

    const roleTitle = JSON.parse(localStorage.getItem("role_title")?.toLowerCase().trim());

    if(roleTitle === "admin organization" && table_name === "cid_under_investigation"){
        var errorActFlag = false;
    
        tableActRow.map((element)=>{
            if(!element.act || element.act === "" || !element.section || element.section === "" || element.section.length === 0){
                errorActFlag = true;
            }
        });
    
        if(errorActFlag){
            toast.error("Please Fill All Act & Section Data",{
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

    if (roleTitle === "admin organization" && orderCopyFieldMandatory.current === true && !formData?.["field_order_copy_(_17a_done_)"]) {
        const result = await Swal.fire({
            title: 'Order copy has not been uploaded',
            text: 'Do you want to proceed without uploading the order copy?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, Proceed',
            cancelButtonText: 'No, Cancel',
            reverseButtons: true
        });

        if (!result.isConfirmed) {
            return;
        }
    }

    if (validate()) {

        var errorMsg = {};
      
        formConfig.forEach((fields) => {
            if (fields?.validation) {
                try {
                    var regex = new RegExp(fields.validation);
                    var value = formData[fields.name]?.trim() || "";
                    
                    if (!regex.test(value)) {
                        errorMsg[fields.name] = `Please provide the correct format for ${fields.label}`;
                    }
                } catch (error) {
                    console.log("validation not found");
                }
            }
        });
        
        if (Object.keys(errorMsg).length > 0 && onError) {
            setErrors(errorMsg);
            onError(true);
            return;
        }

        var duplicateCheckKey = formConfig.filter((fields)=>{
            if(fields && fields.duplicateCheck){
                return {
                    ...fields
                }
            }
        });

        if(duplicateCheckKey && duplicateCheckKey?.[0] && initialData && initialData[duplicateCheckKey[0].name] && initialData[duplicateCheckKey[0].name] === formData?.[duplicateCheckKey[0].name]) {
            duplicateCheckKey = [];
        }
    
        if (duplicateCheckKey && duplicateCheckKey.length > 0) {
            var duplicateKeyValues = {};

            duplicateCheckKey.forEach((field) => {
                duplicateKeyValues[field.name] = formData[field.name] ? formData[field.name] : '';
            });

            var payloadForDuplicate = {
                "table_name" : table_name,
                "data" : duplicateKeyValues
            }
            
            setLoading(true);
                
            try {
                const getActionsDetails = await api.post("/templateData/templateDataFieldDuplicateCheck", payloadForDuplicate);

                setLoading(false);
    
                if (getActionsDetails && !getActionsDetails.success) {
                    Swal.fire({
                        title: 'Duplicate Values Found For '+duplicateCheckKey[0].label,
                        text: "Need to create new one ?",
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonText: 'Yes, Continue!',
                        cancelButtonText: 'No',
                    }).then(async (result) => {
                        if (!result.isConfirmed) {
                            return false;
                        }else{
                            !readOnlyTemplate && editDataTemplate ? onUpdate(formData) : onSubmit(formData, saveNewActionRef?.current);  // This will pass the form data to the parent `onSubmit` function
                        }
                    })
                }else{
                    !readOnlyTemplate && editDataTemplate ? onUpdate(formData) : onSubmit(formData, saveNewActionRef?.current);  // This will pass the form data to the parent `onSubmit` function
                }
    
            } catch (error) {
    
                setLoading(false);
                if (error && error.response && error.response['data']) {
                    toast.error(error.response['data'].message ? error.response['data'].message : 'Please Try Again !',{
                        position: "top-right",
                        autoClose: 3000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        className: "toast-error",
                    });
                    return false
                }
            }
        }else{
            !readOnlyTemplate && editDataTemplate ? onUpdate(formData) : onSubmit(formData, saveNewActionRef?.current);  // This will pass the form data to the parent `onSubmit` function
        }
    } else {
        toast.warning('Please Fill Mandatory Fields', {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            className: "toast-warning",
            onOpen: () =>  onError(true)
        });
    }
  };

  const handleDropdownChange = (fieldId, selectedValue) => {
    setFormData(prevData => ({
      ...prevData,
      [fieldId]: selectedValue,
    }));
  };

  const handleAutocomplete = (field, selectedValue) => {

    let updatedFormData = { ...formData, [field.name]: selectedValue };
    setSelectedField(field);

    if (field.table) {
      var updatedFormConfig = newFormConfig.map((data) => {
        if (data && data.dependent_table && data.dependent_table.length > 0 && data.dependent_table.includes(field.table)) {

          if (updatedFormData[data.name] && !data?.disabled) {
            updatedFormData[data.name] = '';
          }

          if (data.options) {
            return { ...data, options: [] };
          } else {
            return { ...data };
          }

        } else {
          return { ...data };
        }
      });
      setNewFormConfig(updatedFormConfig);
    }

    if (field.name === "field_used_as_evidence") {
      const updatedFormConfig = newFormConfig.map((fld) => {
        if (fld.name === "field_reason") {
          if (selectedValue === "No") {
            return { ...fld, hide_from_ux: false, required: true };
          } else if (selectedValue === "Yes") {
            return { ...fld, hide_from_ux: true, required: false };
          }
        }
        return fld;
      });
      setNewFormConfig(updatedFormConfig);
    }

    setFormData(updatedFormData);

  }

  const handleCheckBoxChange = (fieldName, fieldCode, selectedValue) => {
    setFormData(prevData => {
      const updatedField = Array.isArray(prevData[fieldName]) ? prevData[fieldName] : typeof prevData[fieldName] === "string" ? prevData[fieldName].split(",").map(item => item.trim()) : [];

      if (selectedValue) {
        if (!updatedField.includes(fieldCode)) {
          return {
            ...prevData,
            [fieldName]: [...updatedField, fieldCode],
          };
        }
      } else {
        return {
          ...prevData,
          [fieldName]: updatedField.filter(code => code !== fieldCode),
        };
      }

      return prevData;
    });
  };

    const handleTabChange = (fieldName, fieldCode, selectedValue) => {
        setFormData(prevData => {
            if (selectedValue) {
                return {
                    ...prevData,
                    [fieldName]: fieldCode,
                };
            } else {
                return {
                    ...prevData,
                    [fieldName]: [],
                };
            }
        });
    };

  const handleFileUploadChange = (fieldName, files) => {
    setFormData(prevData => {
      return {
        ...prevData,
        [fieldName]: files,
      };
    });
  };

    useEffect(() => {
        if (selectedField?.table && selectedField?.api) {

            var dependent_field = newFormConfig.filter((element) => {
                return ( element.dependent_table && element.dependent_table.length > 0 && element.dependent_table.includes(selectedField.table));
            });

            var apiPayload = {};
            var apiUrl = selectedField.api

            if (dependent_field.length > 0) {

                if (dependent_field?.[0]?.api) {
                    if (dependent_field[0].dependent_table.length === 1) {
                        const key = selectedField.table === "users" ? "user_id" : `${selectedField.table}_id`;
                        apiPayload = { [key]: formData[selectedField.name] };
                    } else {
                        var dependentFields = newFormConfig.filter((data) => {
                            return dependent_field[0].dependent_table.includes(data.table);
                        });
                        apiPayload = dependentFields.reduce((payload, data) => {
                        if (formData && formData[data.name]) {
                            const key = data.table === "users" ? "user_id" : `${data.table}_id`;
                            payload[key] = formData[data.name];
                        }
                        return payload;
                        }, {});
                    }
                }
                apiUrl = dependent_field[0].api;

                if(dependent_field?.[0]?.table === "users"){
                    apiPayload = {
                        ...apiPayload,
                        designation_id : localStorage.getItem('designation_id') ? localStorage.getItem('designation_id') : null,
                        get_flag : dependent_field?.[0]?.user_hierarchy || null
                    }
                }

                const callApi = async () => {
                    try {
                        var getOptionsValue = await api.post( apiUrl ,apiPayload);

                        var updatedOptions = [];

                        if (getOptionsValue && getOptionsValue.data) {
                            updatedOptions = getOptionsValue.data.map((data, i) => {
                                return {
                                    name: data[ dependent_field[0].table === "users" ? "name" : dependent_field[0].table + "_name" ],
                                    code: data[ dependent_field[0].table === "users" ? "user_id" : dependent_field[0].table + "_id"],
                                };
                            });
                        }

                        setNewFormConfig((prevFormConfig) => {
                            const updatedFormConfig = prevFormConfig.map((data) => {
                                if(dependent_field?.[0].table === "users"){
                                    var findingUsersField = dependent_field.filter((element)=>element.id === data?.id);
                                    if (findingUsersField?.[0]) {
                                        return { ...data, options: updatedOptions };
                                    }
                                    return data;
                                }else{
                                    if (data?.id === dependent_field[0]?.id) {
                                        return { ...data, options: updatedOptions };
                                    }
                                    return data;
                                }
                            });
                            return updatedFormConfig;
                        });

                        dependent_field.map((data) => {
                            if(!data.disabled){
                                delete formData[data.name];
                            }
                        });

                    } catch (error) {
                        if (error && error.response && error.response.data) {
                            toast.error( error.response?.data?.message || "Need dependent Fields", {
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
                    }
                };

            callApi();
            }
        }
    }, [selectedField]);

       useEffect(() => {
           var defaultValueObj = {};
   
           const clearOptions = () => {
   
               var updatedFormConfig = newFormConfig.map((field) => {
                   // while edit dependent api for get options function goes here
                   if (initialData && initialData[field.name] && field?.table && field?.api) {
   
                       var dependent_field = newFormConfig.filter((element) => {
                           return ( element.dependent_table && element.dependent_table.length > 0 && element.dependent_table.includes(field.table) );
                       });
   
                       var apiPayload = {};
                       var apiUrl = field.api;
   
                       if (dependent_field?.length > 0) {
                           if (dependent_field?.[0]?.api ) {
   
                               if (dependent_field?.[0]?.dependent_table.length === 1) {
   
                                   const key = field.table === "users" ? "user_id" : `${field.table}_id`;
                                   apiPayload = { [key]: initialData[field.name]};
   
                               } else {
                                                                   
                                   var dependentFields = newFormConfig.filter((data) => {
                                       return dependent_field[0].dependent_table.includes(
                                           data.table
                                       );
                                   });
   
                                   apiPayload = dependentFields.reduce((payload, data) => {
                                       if (initialData && initialData[data.name]) {
                                           const key = data.table === "users" ? "user_id" : `${data.table}_id`;
                                           payload[key] = initialData[data.name];
                                       }
                                       return payload;
                                   }, {});
   
                               }
                           }
   
                           apiUrl = dependent_field[0].api
   
                           if(dependent_field?.[0]?.table === "users"){
                               apiPayload = {
                                   ...apiPayload,
                                   designation_id : localStorage.getItem('designation_id') ? localStorage.getItem('designation_id') : null,
                                   get_flag : dependent_field?.[0]?.user_hierarchy || null
                               }
                           }
   
                           const callApi = async () => {
                               try {
                                   var getOptionsValue = await api.post( apiUrl, apiPayload);
   
                                   var updatedOptions = [];
   
                                   if (getOptionsValue && getOptionsValue.data) {                                
                                       updatedOptions = getOptionsValue.data.map((templateData) => {
   
                                           const nameKey = Object.keys(templateData).find((key) => !["id", "created_at", "updated_at"].includes(key));
   
                                           var headerName = nameKey;
                                           var headerId = 'id';
                   
                                           if(dependent_field[0]?.table === "users"){
                                               headerName = "name"
                                               headerId =  "user_id"
                                           }else if(dependent_field[0].api !== "/templateData/getTemplateData"){
                                               headerName = dependent_field[0]?.table + "_name"
                                               headerId =  dependent_field[0]?.table + "_id"
                                           }
   
                                           return {
                                               name: templateData[headerName],
                                               code: templateData[headerId],
                                           };
                                       });
                                   }
   
                                   setNewFormConfig((prevFormConfig) => {
                                       const updatedFormConfig = prevFormConfig.map((data) => {
                                           if (data?.id === dependent_field[0]?.id) {
                                               return { ...data, options: updatedOptions };
                                           }
                                           return data;
                                       });
                                       return updatedFormConfig;
                                   });
                               } catch (error) {
                                   if (error && error.response && error.response.data) {
                                       toast.error(error.response?.data?.message || "Need dependent Fields",{
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
                               }
                           };
                       callApi();
                   }
                   } else if (formData?.[field?.name] && field?.table && field?.api) {
   
                       var dependent_field = newFormConfig.filter((element) => {
                           return (element.dependent_table && element.dependent_table.length > 0 && element.dependent_table.includes(field.table));
                       });
                       
                       var apiPayload = {};
                       var apiUrl = field.api;
   
                       if (dependent_field?.length > 0) {
                           if (dependent_field?.[0]?.api ) {
   
                               if (dependent_field?.[0]?.dependent_table.length === 1) {
   
                                   const key = field.table === "users" ? "user_id" : `${field.table}_id`;
                                   apiPayload = { [key]: formData[field.name]};
   
                               } else {
                                                                   
                                   var dependentFields = newFormConfig.filter((data) => {
                                       return dependent_field[0].dependent_table.includes(
                                           data.table
                                       );
                                   });
   
                                   apiPayload = dependentFields.reduce((payload, data) => {
                                       if (formData && formData[data.name]) {
                                           const key = data.table === "users" ? "user_id" : `${data.table}_id`;
                                           payload[key] = formData[data.name];
                                       }
                                       return payload;
                                   }, {});
                               }
                           }
   
                           apiUrl = dependent_field[0].api
   
                           if(dependent_field?.[0]?.table === "users"){
                               apiPayload = {
                                   ...apiPayload,
                                   designation_id : localStorage.getItem('designation_id') ? localStorage.getItem('designation_id') : null,
                                   get_flag : dependent_field?.[0]?.user_hierarchy || null
                               }
                           }
   
                           const callApi = async () => {
                               try {
                                   var getOptionsValue = await api.post( apiUrl, apiPayload);
   
                                   var updatedOptions = [];
   
                                   if (getOptionsValue && getOptionsValue.data) {                                
                                       updatedOptions = getOptionsValue.data.map((templateData) => {
   
                                           const nameKey = Object.keys(templateData).find((key) => !["id", "created_at", "updated_at"].includes(key));
   
                                           var headerName = nameKey;
                                           var headerId = 'id';
                   
                                           if(dependent_field[0]?.table === "users"){
                                               headerName = "name"
                                               headerId =  "user_id"
                                           }else if(dependent_field[0].api !== "/templateData/getTemplateData"){
                                               headerName = dependent_field[0]?.table + "_name"
                                               headerId =  dependent_field[0]?.table + "_id"
                                           }
   
                                           return {
                                               name: templateData[headerName],
                                               code: templateData[headerId],
                                           };
                                       });
                                   }
   
                                   setNewFormConfig((prevFormConfig) => {
                                       const updatedFormConfig = prevFormConfig.map((data) => {
                                           if (data?.id === dependent_field[0]?.id) {
                                               return { ...data, options: updatedOptions };
                                           }
                                           return data;
                                       });
                                       return updatedFormConfig;
                                   });
                               } catch (error) {
                                   if (error && error.response && error.response.data) {
                                       toast.error(error.response?.data?.message || "Need dependent Fields",{
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
                               }
                           };
   
                           callApi();
                       }
   
                       if (field && field.defaultValue && field.defaultValue !== "" && field.defaultValue !== false && field.defaultValue !== "false") {
                           defaultValueObj[field.name] = field.defaultValue;
                       }
   
                   } else {
                       if ( field && field.defaultValue && field.defaultValue !== "" && field.defaultValue !== false && field.defaultValue !== "false") {
                           defaultValueObj[field.name] = field.defaultValue;
                       }
                       if (field && field.is_dependent === "true") {
                           return { ...field, options: [] };
                       }
                   }
   
                   return field;
               });
   
               setNewFormConfig(updatedFormConfig);
               setFormData((prevData) => ({
                   ...prevData,
                   ...defaultValueObj,
               }));
   
           //   localStorage.setItem(
           //     template_name + "-formData",
           //     JSON.stringify({ ...formData, ...defaultValueObj })
           //   );
           };
   
           clearOptions();
       }, []);

  useEffect(() => {

    if (stepperData && stepperData.length > 0) {

      var steppersPercentageData = {};

      stepperData.map((data) => {

        var totalCount = 0;
        var percentageCount = 0;

        newFormConfig?.filter(el => el.section === data)?.map((field) => {

          if (field.formType) {
            totalCount++;
            if (formData[field.name]) {
              percentageCount++;
            }
          }

        });

        steppersPercentageData[data] = Math.round((percentageCount / totalCount) * 100) || 0;
      });

      setStepperPercentage(steppersPercentageData)
    }


  }, [newFormConfig, formData]);


  const stepperPrevNavigation = () => {
    if (activeStep != 0) {
      setActiveStep((prev) => prev - 1)
    }
  }

  const stepperNextNavigation = () => {
    if (stepperData && stepperData.length > (activeStep + 1)) {
      setActiveStep((prev) => prev + 1)
    }
  }

  const CloseFormModal = async () => {
    if (closeForm) {

        if(changingFormField.current === true){
            const result = await Swal.fire({
                title: 'Unsaved Changes',
                text: 'You have unsaved changes. Are you sure you want to leave?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, Exit',
                cancelButtonText: 'No',
            });
    
            if (result.isConfirmed) {
                if(editedForm){
                    editedForm(false);
                }
                closeForm(false);
            }
        }else{
            closeForm(false);
        }

    }
  }

  useEffect(() => {
    if (stepperData && stepperData.length > 0) {
      var stepperAllFields = newFormConfig.filter((field) => {
        return field.section === stepperData[activeStep];
      });

      setstepperConfigData(stepperAllFields);
    }
  }, [activeStep, newFormConfig]);


  const showHistory = async (fieldName) => {

    if (!template_id || template_id === '' || !table_row_id || table_row_id === '') {
      return false;
    }

    var payload = {
      "template_id": template_id,
      "table_row_id": table_row_id,
      "field_name": fieldName
    }

    setLoading(true);

    try {
      const getHistoryResponse = await api.post("/profileHistories/getProfileHistory", payload);
      setLoading(false);

      if (getHistoryResponse && getHistoryResponse.success) {

        if (getHistoryResponse['data'] && getHistoryResponse['data'].length > 0) {
          var updatedData = getHistoryResponse['data'].map((data, index) => {

            var fullname = ''
            if (data.userDetails) {
              if (data.userDetails['user_firstname']) {
                if (data.userDetails['user_lastname']) {
                  fullname = data.userDetails['user_firstname'] + ' ' + data.userDetails['user_lastname'];
                } else {
                  fullname = data.userDetails['user_firstname'];
                }
              }
            }

            const readableDate = new Date(data.updated_at).toLocaleString('en-US', {
              year: 'numeric',
              month: 'long',
              day: '2-digit'
            });

            return {
              ...data,
              id: data.profile_history_id,
              sl_no: index + 1,
              username: fullname,
              date: readableDate
            }
          });

          setHistoryData(updatedData)
          setHistoryModal(true);

        } else {
          setHistoryData([])
          setHistoryModal(true);
        }

      } else {
        setHistoryData([])
        setHistoryModal(true);
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


    useEffect(() => {
        const fetchTemplateData = async () => {
            try { 
                const apiCalls = newFormConfig
                .filter((field) => field?.api && field?.table && (!field?.is_dependent || field?.is_dependent == "false"))
                .map(async (field) => {
                    try {

                        var apiPayload = {};

                        if(field.api === "/templateData/getTemplateData"){
                            apiPayload = {
                                table_name: field.table
                            }
                        }else if(field.table === "users"){
                            apiPayload = {
                                designation_id : localStorage.getItem('designation_id') ? localStorage.getItem('designation_id') : null,
                                get_flag : field?.user_hierarchy || null
                            }
                        }

                        var payloadApi = field.api

                        if((field.table === "cid_ui_case_accused" || field.table === "cid_ui_case_witness") && selectedRow && field?.particular_case_options){

                            payloadApi = "templateData/getAccusedWitness"


                            if(table_name === "cid_under_investigation" || investigationViewTable === "cid_under_investigation"){
                                apiPayload = {
                                    "table_name": field.table,
                                    "ui_case_id": selectedRow?.['id'] || "",
                                    "pt_case_id": selectedRow?.['pt_case_id'] || "",
                                }
                            }else if(table_name === "cid_pending_trial" || investigationViewTable === "cid_pending_trial"){
                                apiPayload = {
                                    "table_name": field.table,
                                    "ui_case_id": selectedRow?.['ui_case_id'] || "",
                                    "pt_case_id": selectedRow?.['id'] || "",
                                }
                            }

                        }

                        const response = await api.post(payloadApi, apiPayload);

                        if (!response.data) return { id: field.id, options: [] };

                        const updatedOptions = response.data.map((templateData) => {

                            const nameKey = Object.keys(templateData).find((key) => !["id", "created_at", "updated_at"].includes(key));

                            var headerName = nameKey;
                            var headerId = 'id';

                            if(field.table === "users"){
                                headerName = "name"
                                headerId =  "user_id"
                            }else if(field.api !== "/templateData/getTemplateData"){
                                headerName = field.table + "_name"
                                headerId =  field.table + "_id"
                            }

                            return {
                                name: templateData[headerName],
                                code: templateData[headerId],
                            };
                        });

                        return { id: field.id, options: updatedOptions };

                    } catch (error) {
                        return { id: field.id, options: [] };
                    }
                });

                const results = await Promise.all(apiCalls);

                var optionUpdateFields = []

                setNewFormConfig((prevFormConfig) => {
                    const updatedFormConfig = prevFormConfig.map((field) => {
                        const updatedField = results.find((res) => res.id === field.id);
                        if (updatedField) {
                            if (updatedField?.options.length === 1) {
                                const onlyOption = updatedField.options[0];

                                const gettingFormdata = Object.keys(formData).length === 0 ? (initialData || formData) : formData;

                                if(!gettingFormdata[field?.name] || gettingFormdata[field?.name] === ""){
                                    setFormData((prevData) => ({
                                        ...prevData,
                                        [field.name]: onlyOption.code
                                    }));
                                }

                                optionUpdateFields.push(field);
                            }
                            return { ...field, options: updatedField.options };
                        }
                        return field;
                    });
                    return updatedFormConfig;
                });

                gettingDependentedOptions(optionUpdateFields);

            } catch (error) {
                console.error("Error fetching template data:", error);
            }
        };

        if (newFormConfig.length > 0) {
            fetchTemplateData();
        }
    }, []);


    const gettingDependentedOptions = (fields)=>{
        
        if(!fields || fields.length === 0){
            return;
        }

        fields.map((selectedField)=>{

            if (selectedField?.table && selectedField?.api) {

                var dependent_field = newFormConfig.filter((element) => {
                    return ( element.dependent_table && element.dependent_table.length > 0 && element.dependent_table.includes(selectedField.table));
                });
    
                var apiPayload = {};
                var apiUrl = selectedField.api
    
                if (dependent_field.length > 0) {
    
                    if (dependent_field?.[0]?.api) {
                        if (dependent_field[0].dependent_table.length === 1) {
                            const key = selectedField.table === "users" ? "user_id" : `${selectedField.table}_id`;
                            apiPayload = { [key]: formData[selectedField.name] };
                        } else {
                            var dependentFields = newFormConfig.filter((data) => {
                                return dependent_field[0].dependent_table.includes(data.table);
                            });
                            apiPayload = dependentFields.reduce((payload, data) => {
                                if (formData && formData[data.name]) {
                                    const key = data.table === "users" ? "user_id" : `${data.table}_id`;
                                    payload[key] = formData[data.name];
                                }
                                return payload;
                            }, {});
                        }
                    }
                    apiUrl = dependent_field[0].api;
    
                    if(dependent_field?.[0]?.table === "users"){
                        apiPayload = {
                            ...apiPayload,
                            designation_id : localStorage.getItem('designation_id') ? localStorage.getItem('designation_id') : null,
                            get_flag : dependent_field?.[0]?.user_hierarchy || null
                        }
                    }
    
                    const callApi = async () => {
                        try {
                            var getOptionsValue = await api.post( apiUrl ,apiPayload);
    
                            var updatedOptions = [];
    
                            if (getOptionsValue && getOptionsValue.data) {
                                updatedOptions = getOptionsValue.data.map((data, i) => {
                                    return {
                                        name: data[ dependent_field[0].table === "users" ? "name" : dependent_field[0].table + "_name" ],
                                        code: data[ dependent_field[0].table === "users" ? "user_id" : dependent_field[0].table + "_id"],
                                    };
                                });
                            }
    
                            setNewFormConfig((prevFormConfig) => {
                                const updatedFormConfig = prevFormConfig.map((data) => {
                                    if(dependent_field?.[0].table === "users"){
                                        var findingUsersField = dependent_field.filter((element)=>element.id === data?.id);
                                        if (findingUsersField?.[0]) {
                                            return { ...data, options: updatedOptions };
                                        }
                                        return data;
                                    }else{
                                        if (data?.id === dependent_field[0]?.id) {
                                            return { ...data, options: updatedOptions };
                                        }
                                        return data;
                                    }
                                });
                                return updatedFormConfig;
                            });
    
                            dependent_field.map((data) => {
                                if(!data.disabled){
                                    delete formData[data.name];
                                }
                            });
    
                        } catch (error) {
                            if (error && error.response && error.response.data) {
                                toast.error( error.response?.data?.message || "Need dependent Fields", {
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
                        }
                    };

                    callApi();
                }
            }
        });
    };

    const handleTextEditorChange = (fieldName, value) => {
        setFormData((prevData) => ({
            ...prevData,
            [fieldName]: value,
        }));
    };

    const showTransferToOtherDivision = async (options, selectedRow, selectedFieldValue) => {
        
        const selectedFieldData = selectedRow[selectedFieldValue];

        const viewTableData = {
            table_name: options.table,
        };
        
        setLoading(true);
        try {

            const viewTemplateResponse = await api.post("/templates/viewTemplate",viewTableData);
            setLoading(false);
        
            if (viewTemplateResponse && viewTemplateResponse.success && viewTemplateResponse["data"]) {
                
                if (viewTemplateResponse["data"].fields) {
            
                    const getSelectedField = viewTemplateResponse["data"].fields.filter(
                        (data) => data.name === options.field
                    );

                    if (getSelectedField.length > 0) {

                        var newPayload = {};

                        if(getSelectedField[0].table === "users"){
                            if(selectedRow['field_division']){
                                newPayload['division_id'] = selectedRow['field_division']
                                newPayload['designation_id'] = localStorage.getItem('designation_id') || null
                            }
                        }
                        
                        if (getSelectedField[0].api) {
            
                            var payloadApi = {
                                table_name: getSelectedField[0].table,
                            };

                            if(getSelectedField[0].table === "users"){
                                payloadApi = {
                                    ...payloadApi,
                                    ...newPayload,
                                    get_flag : getSelectedField[0]?.user_hierarchy || "lower"
                                }
                            }

                            setLoading(true);

                            try {
                                const getOptionsValue = await api.post(getSelectedField[0].api, payloadApi);
                                setLoading(false);
                
                                var updatedOptions = [];

                                if (getSelectedField[0].api === "/templateData/getTemplateData") {
                                    updatedOptions = getOptionsValue.data.map((templateData) => {
                                        const nameKey = Object.keys(templateData).find(
                                            (key) => !["id", "created_at", "updated_at"].includes(key)
                                        );
                                        return {
                                            name: nameKey ? templateData[nameKey] : "",
                                            code: templateData.id,
                                        };
                                    });
                                } else {
                                    updatedOptions = getOptionsValue.data.map((field) => ({
                                        name: getSelectedField[0].table === "users" ? field.name : field[getSelectedField[0].table + "_name"],
                                        code: getSelectedField[0].table === "users" ? field.user_id: field[getSelectedField[0].table + "_id"],
                                    }));
                                }

                                setShowActionModal(true);
                                setCaseActionOptions(updatedOptions);
                                setCaseActionSelectedValue(selectedFieldData ? selectedFieldData : null);


                            } catch (error) {
                                setLoading(false);
                                if (error?.response?.data) {
                                    toast.error(error.response.data.message || "selected field not found",{
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
                    } else {
                        toast.error("Can't able to find selected field", {
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
                toast.error(viewTemplateResponse.message || "Failed to get Template. Please try again.",{
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
            if (error?.response?.data) {
                toast.error(error.response.data.message || "Please Try Again!",{
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
    };

    const updateCaseActions = async ()=>{

        if(!investigationAction.field){
            toast.error("Can't able to find fields !",{
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

        if(!caseActionSelectedValue || caseActionSelectedValue === ""){
            toast.error("Please Select Any value before submit !",{
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

        const userId = localStorage.getItem("designation_id");

        if(!userId){
            toast.error("User Not Found !", {
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

        var roleTitle = JSON.parse(localStorage.getItem("role_title")) || "";
        var designationName = localStorage.getItem("designation_name") || "";
        var gettingDesignationName = ""

        if(roleTitle.toLowerCase() === "investigation officer"){
            gettingDesignationName = "IO";
        }else{
            var splitingValue = designationName.split(" ");
            if(splitingValue?.[0]){
                gettingDesignationName = splitingValue[0].toUpperCase();
            }
        }

        var payload = {
            fields : {
                [investigationAction.field]: caseActionSelectedValue,
                "field_approval_done_by": gettingDesignationName,
            },
            "table_name": table_name,
            "id": initialData?.id,
            "Referenceid": initialData?.id,
            "approvalDate": dayjs()?.$d,
            "approvalItem": investigationAction?.approval_items,
            "approvedBy": userId,
            "remarks": investigationAction?.name + " Submitted By " + gettingDesignationName,
            "module": template_name,
            designation_id: localStorage.getItem("designation_id") || null,
        }

        setLoading(true);    
        try {
            const response = await api.post("/templateData/updateFieldsWithApproval", payload);
            setLoading(false);

            if (response?.success) {
                toast.success(response.message || "Success", {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    className: "toast-success",
                });

                setShowActionModal(false);
                setCaseActionOptions([]);
                setCaseActionSelectedValue(null);

                if(reloadApproval && response.data){
                    reloadApproval(response.data);
                }

            } else {
                setLoading(false);
                toast.error(response.message || "Something Went Wrong !", {
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
            toast.error(error?.response?.data?.message || "Please Try Again!", {
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

    const CaseLogs = async () => {
        if ( !template_id || template_id === "" || !table_row_id || table_row_id === "" ) {
            return false;
        }

        var payload = {
            template_id: template_id,
            table_row_id: table_row_id,
        };

        setLoading(true);

        try {
            const getHistoryResponse = await api.post( "/profileHistories/getCaseHistory",payload);
            setLoading(false);

            if (getHistoryResponse && getHistoryResponse.success) {
                if ( getHistoryResponse["data"] && getHistoryResponse["data"].length > 0 ) {
                    var updatedData = getHistoryResponse["data"].map((data, index) => {
                        // var fullname = "";

                        const readableDate = new Date(data.updated_at).toLocaleString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                            hour12: true, // Optional: shows time in AM/PM format
                        });

                        return {
                            ...data,
                            id: data.log_id,
                            sl_no: index + 1,
                            actor_name: data.actor_name,
                            date: readableDate,
                        };
                    });

                    setCaseHistoryData(updatedData);
                    setCaseHistoryModal(true);
                } else {
                    setCaseHistoryData([]);
                    setCaseHistoryModal(true);
                }
            } else {
                setCaseHistoryData([]);
                setCaseHistoryModal(true);
            }
        } catch (error) {
            setLoading(false);
            if (error && error.response && error.response["data"]) {
                toast.error(error.response["data"].message || "Please Try Again!", {
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
    };
    useEffect(() => {
  if (showActionModal && caseActionSelectedValue && caseActionOptions.length > 0) {
    // Only fetch if actionCases is empty (avoid refetch on every render)
    if (actionCases.length === 0) {
      const selected = caseActionOptions.find(
        (option) => String(option.code) === String(caseActionSelectedValue)
      );
      if (selected) {
        api
          .post("cidMaster/getSpecificIoUsersCases", {
            user_id: String(selected.code),
            template_module: "ui_case",
          })
          .then((response) => {
            let cases = [];
            if (Array.isArray(response.cases)) {
              cases = response.cases;
            } else if (response?.cases && typeof response.cases === "object") {
              cases = [response.cases];
            }
            setActionCases(cases);
          })
          .catch(() => setActionCases([]));
      }
    }
  }
  // eslint-disable-next-line
}, [showActionModal, caseActionSelectedValue, caseActionOptions]);


  return (
    <>
      <Box inert={loading ? true : false} p={noPadding ? 0 : 2} px={2}>
        {stepperData && stepperData.length > 0 && (
          <Box px={2} py={1} sx={{ background: '#FFFFFF' }}>
            <Stepper className={'stepperWidth_' + stepperData.length} sx={{ minWidth: '300px', maxWidth: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} activeStep={activeStep} >
              {stepperData.map((label, index) => (
                <Step className={stepperPercentage && stepperPercentage[label] ? 'Stepper_' + stepperPercentage[label] + '_Percentage stepperPercentage' : ""} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }} key={index} onClick={() => setActiveStep(index)}>
                  <StepLabel>
                    <div className={`${stepperPercentage && stepperPercentage[label] ? 'Stepper_' + stepperPercentage[label] + '_Percentage' : ''} stepperHeader`}>{label}</div>
                    <div className={`${stepperPercentage && stepperPercentage[label] ? 'Stepper_' + stepperPercentage[label] + '_Percentage' : ''} stepperCompletedPercentage`}>{stepperPercentage && stepperPercentage[label] ? stepperPercentage[label] : 0}% completed</div>
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: '#FFFFFF', position: 'sticky', top: '0', zIndex: '98' }}>
          <Box onClick={CloseFormModal} sx={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer', gap: '4px' }}>
            <ArrowBackIcon sx={{ fontSize: '22px', fontWeight: '500', color: '#171A1C' }} />
            <Typography sx={{ fontSize: '19px', fontWeight: '500', color: '#171A1C' }} className='Roboto'>
              {template_name ? template_name : 'Form'}
            </Typography>
            {headerDetails && (
                <Chip
                    label={headerDetails}
                    color="primary"
                    variant="outlined"
                    size="small"
                    sx={{ fontWeight: 500, marginTop: '2px' }}
                />
            )}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', }}>

            {
                showAssignIo && investigationAction && investigationAction?.field && !showCaseActionBtn &&
                <Button
                    onClick={()=>showTransferToOtherDivision(investigationAction, initialData, investigationAction?.field)}
                    sx={{
                        background: "#0167F8",
                        borderRadius: "8px",
                        fontSize: "14px",
                        fontWeight: "500",
                        color: "#FFFFFF",
                        padding: "6px 16px",
                    }}
                    className="Roboto blueButton"
                >
                    {investigationAction?.name}
                </Button>
            }

            {
                table_row_id &&
                <Button
                    variant="outlined"
                    sx={{marginLeft: "10px", marginRight: "10px", height: '40px'}}
                    onClick = {() => {CaseLogs()}}
                >
                    Case Log
                </Button>
            }

            {!readOnlyTemplate && editDataTemplate && onUpdate ?

              <Button onClick={() => formButtonRef && formButtonRef.current && formButtonRef.current.click()} sx={{ background: '#0167F8', fontSize: '14px', fontWeight: '500', color: '#FFFFFF', padding: '6px 16px' }} className="Roboto blueButton">
                Update
              </Button>

              :!readOnlyTemplate && onSubmit && (
                <>
                  <Button
                  onClick={() => {
                      saveNewActionRef.current = false;
                      formButtonRef &&
                      formButtonRef.current &&
                      formButtonRef.current.click()
                  }}
                    sx={{ background: '#0167F8', fontSize: '14px', fontWeight: '500', color: '#FFFFFF', padding: '6px 16px', marginRight: '8px' }}
                    className="Roboto blueButton"
                  >
                    Save
                  </Button>
            
                    {
                        !disableSaveNew && table_name !== "cid_eq_case_closure_report" && table_name !== "cid_ui_case_extension_form" &&
                        <Button
                            variant="contained" color="success"
                            onClick={() =>{
                                saveNewActionRef.current = true;
                                formButtonRef &&
                                formButtonRef.current &&
                                formButtonRef.current.click()
                            }}
                        >
                            Save & New
                        </Button>
                    }
                </>
              )
            }

            {
                (readOnlyTemplate && userPermissions[0]?.edit_case && !disableEditButton && !overAllReadonly) && 
                <Button
                    onClick={templateEdit}
                    sx={{
                        background: "#0167F8",
                        fontSize: "14px",
                        fontWeight: "500",
                        color: "#FFFFFF",
                        padding: "6px 16px",
                    }}
                    className="Roboto blueButton"
                >
                    Edit Case
                </Button>
            }

          </Box>
        </Box>
        <Box sx={{ height: `calc(99% - ${stepperData && stepperData.length > 0 ? '150px' : '100px'})`, overflow: 'auto', background: '#FFFFFF', border: '1px solid #636B744D', borderRadius: '8px' }} mx={1} mt={1}>

          <Box sx={{ borderBottom: '1px solid #636B744D', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

            <Box sx={{ display: 'inline-flex', gap: '12px', alignItems: 'center' }}>
              {stepperData && stepperData.length > 0 &&
                <Typography className='HighlightedSquare'>
                  {activeStep + 1}
                </Typography>
              }
              <Typography className='HighlightedText'>
                {stepperData && stepperData[activeStep] ? stepperData[activeStep] : 'General Detail'}
              </Typography>
            </Box>

            {stepperData && stepperData.length > 0 &&
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Button onClick={stepperPrevNavigation} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '16px' }} > <ArrowBackIosIcon sx={{ height: '16px', width: '16px', color: 'rgba(0, 0, 0, 0.56)', cursor: 'pointer' }} /> </Button>
                <Button onClick={stepperNextNavigation} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '16px' }} > <ArrowForwardIosIcon sx={{ height: '16px', width: '16px', color: 'rgba(0, 0, 0, 0.56)', cursor: 'pointer' }} /> </Button>
              </Box>
            }
          </Box>

          <form onSubmit={handleSubmit} noValidate style={{ margin: 0 }} >
            <Grid container sx={{ alignItems: 'start' }}>
              {(stepperData && stepperData.length > 0 ? stepperConfigData : newFormConfig).map((field, index) => {

                if (field?.hide_from_ux || (field?.table?.toLowerCase() === "section" && table_name === "cid_under_investigation")) {
                    return null
                }

                if (field?.hide_from_edit && editDataTemplate) {
                    return null;
                }

                const allFields = (stepperData && stepperData.length > 0) ? stepperConfigData : newFormConfig;
                
                const allTabsFields = allFields.filter((f) => f.type === "tabs");
                
                const matchingTabsField = allTabsFields.find(tabField =>
                    Array.isArray(tabField.options) &&
                    tabField.options.some(option => option.code === field.tabOption)
                );
                
                if (matchingTabsField) {
                    const selectedTabValues = formData[matchingTabsField.name] || [];
                
                    const isSelected = Array.isArray(selectedTabValues) ? selectedTabValues.includes(field.tabOption) : selectedTabValues === field.tabOption;
                
                    const shouldHide = !isSelected;
                
                    if (shouldHide) return null;
                }

                const isRequired = field.required === 'true' || field.required === true;

                var readOnlyData = readOnlyTemplate

                // if(table_name === "cid_under_investigation" || table_name === "cid_pending_trial" || table_name === "cid_enquiries"){

                //     const roleTitle = JSON.parse(localStorage.getItem("role_title")?.toLowerCase().trim());
    
                //     if (roleTitle === "admin organization") {
                //         if (!field.ao_field) {
                //             readOnlyData = true;
                //             if (field.required) {
                //                 field.required = false;
                //             }
                //         }
                //     } else {
                //         if (field.ao_field) {
                //             readOnlyData = true;
                //             if (field.required) {
                //                 field.required = false;
                //             }
                //         }
                //     }
                // }

                if(field?.table?.toLowerCase() === "act" && table_name === "cid_under_investigation"){
                    return (
                        <Grid item xs={12} p={2}>
                            <ActTable 
                                formConfig={allFields}
                                formData={formData}
                                tableRow={tableActRow}
                                tableFunc={UpdateTableRowApi}
                                readOnly={readOnlyData}
                                showOrderCopy={makeOrderCopyShow}
                            />
                        </Grid>
                    );
                }


                switch (field.type) {
                  case 'text':
                    return (
                      <Grid item xs={12} md={field.col ? field.col : 12} p={2}>
                        <div className='form-field-wrapper_selectedField'>
                          <ShortText
                            field={field}
                            formData={formData}
                            errors={errors}
                            onChange={handleChange}
                            onHistory={() => showHistory(field.name)}
                            readOnly={readOnlyData}
                          />
                        </div>
                      </Grid>
                    );
                    case "texteditor":
                    return (
                        <Grid item xs={12} md={field.col ? field.col : 12} p={2}>
                            <RichTextEditor
                                field={field}
                                formData={formData}
                                errors={errors}
                                onChange={(html) => handleTextEditorChange(field?.name, html)}
                                onHistory={() => showHistory(field.name)}
                                readOnly={readOnlyData}
                            />
                        </Grid>
                    );

                  case 'email':
                    return (
                      <Grid item xs={12} md={field.col ? field.col : 12} p={2}>
                        <div className='form-field-wrapper_selectedField'>
                          <ShortText
                            field={field}
                            formData={formData}
                            errors={errors}
                            onChange={handleChange}
                            onHistory={() => showHistory(field.name)}
                            readOnly={readOnlyData}
                          />
                        </div>
                      </Grid>
                    );

                  case 'number':
                    return (
                      <Grid item xs={12} md={field.col ? field.col : 12} p={2}>
                        <div className='form-field-wrapper_selectedField'>
                          <NumberField
                            field={field}
                            formData={formData}
                            errors={errors}
                            onChange={handleChange}
                            onHistory={() => showHistory(field.name)}
                            readOnly={readOnlyData}
                          />
                        </div>
                      </Grid>
                    );

                  case 'valuesinput':
                    return (
                      <Grid item xs={12} md={field.col ? field.col : 12} p={2}>
                        <div className='form-field-wrapper_selectedField'>
                          <ValueRangeField
                            field={field}
                            formData={formData}
                            errors={errors}
                            onChange={handleChange}
                            onHistory={() => showHistory(field.name)}
                            readOnly={readOnlyData}
                          />
                        </div>
                      </Grid>
                    );

                  case 'date':
                    return (
                      <Grid item xs={12} md={field.col ? field.col : 12} p={2}>
                        <div className='form-field-wrapper_selectedField'>
                          <DateField
                            field={field}
                            formData={formData}
                            errors={errors}
                            onHistory={() => showHistory(field.name)}
                            onChange={(value) => { handleChangeDate(field.name, value) }} 
                            readOnly={readOnlyData}    
                        />
                        </div>
                      </Grid>
                    );
                  case "time":
                    return (
                      <Grid item xs={12} md={field.col ? field.col : 12} p={2}>
                        <TimeField
                          key={field.id}
                          field={field}
                          formData={formData} // Passing formData
                          errors={errors}
                          // onChange={handleChange} // Handle changes
                          onHistory={() => showHistory(field.name)}
                          onChange={(value) => handleChangeDate(field.name, value)} // Handle change
                          readOnly={readOnlyData}
                        />
                      </Grid>
                    );
                  case "datetime":
                    return (
                      <Grid item xs={12} md={field.col ? field.col : 12} p={2}>
                        <DateTimeField
                          key={field.id}
                          field={field}
                          formData={formData} // Passing formData
                          errors={errors}
                          // onChange={handleChange} // Handle changes
                          onChange={(value) => handleChangeDate(field.name, value)} // Handle change
                          onHistory={() => showHistory(field.name)}
                          readOnly={readOnlyData}
                        />
                      </Grid>
                    );

                  case 'dropdown':
                    return (
                      <Grid item xs={12} md={field.col ? field.col : 12} p={2}>
                        <div className='form-field-wrapper_selectedField'>
                          <SelectField
                            key={field.id}
                            field={field}
                            formData={formData}
                            errors={errors}
                            onHistory={() => showHistory(field.name)}
                            onChange={(value) => handleAutocomplete(field, value.target.value)} 
                            readOnly={readOnlyData}
                        />
                        </div>
                      </Grid>
                    );

                  case "multidropdown":
                    return (
                      <Grid item xs={12} md={field.col ? field.col : 12} p={2}>
                        <MultiSelect
                          key={field.id}
                          field={field}
                          formData={formData}
                          errors={errors}
                          onHistory={() => showHistory(field.name)}
                          onChange={(name, selectedCode) => handleAutocomplete(field, selectedCode)}
                          readOnly={readOnlyData}
                        />
                      </Grid>
                    );

                  case "autocomplete":
                    return (
                      <Grid item xs={12} md={field.col ? field.col : 12} p={2}>
                        <AutocompleteField
                          key={field.id}
                          field={field}
                          formData={formData}
                          errors={errors}
                          onHistory={() => showHistory(field.name)}
                          onChange={(name, selectedCode) => handleAutocomplete(field, selectedCode)}
                          readOnly={readOnlyData}
                        />
                      </Grid>
                    );

                  case 'textarea':
                    return (
                      <Grid item xs={12} md={field.col ? field.col : 12} p={2}>
                        <div className='form-field-wrapper_selectedField'>
                          <LongText
                            field={field}
                            formData={formData}
                            errors={errors}
                            onHistory={() => showHistory(field.name)}
                            onChange={handleChange}
                            readOnly={readOnlyData}
                          />
                        </div>
                      </Grid>
                    );

                  case 'file':
                    return (
                      <Grid item xs={12} md={field.col ? field.col : 12} p={2}>
                        <FileInput
                          field={field}
                          errors={errors}
                          formData={formData}
                          onHistory={() => showHistory(field.name)}
                          onChange={handleFileUploadChange}
                          readOnly={readOnlyData}
                        />
                      </Grid>
                    );
                  case 'profilepicture':
                    return (
                      <Grid item xs={12} md={field.col ? field.col : 12} p={2}>
                        <ProfilePicture
                          field={field}
                          errors={errors}
                          formData={formData}
                          onHistory={() => showHistory(field.name)}
                          onChange={handleFileUploadChange}
                          readOnly={readOnlyData}
                        />
                      </Grid>
                    );

                  case "radio":
                    return (
                      <Grid item xs={12} md={field.col ? field.col : 12} p={2}>
                        <RadioBtn
                          key={field.id}
                          field={field}
                          formData={formData}
                          errors={errors}
                          onHistory={() => showHistory(field.name)}
                          onChange={handleDropdownChange}
                          readOnly={readOnlyData}
                        />
                      </Grid>
                    );

                  case "checkbox":
                    return (
                      <Grid item xs={12} md={field.col ? field.col : 12} p={2}>
                        <CheckboxesBtn
                          key={field.id}
                          field={field}
                          formData={formData}
                          errors={errors}
                          onHistory={() => showHistory(field.name)}
                          onChange={handleCheckBoxChange}
                          readOnly={readOnlyData}
                        />
                      </Grid>
                    );
                  case "tabs":
                    return (
                        <Grid item xs={12} md={field.col ? field.col : 12} p={2}>
                            <TabsComponents
                                key={field.id}
                                field={field}
                                formData={formData}
                                errors={errors}
                                onHistory={() => showHistory(field.name)}
                                onChange={handleTabChange}
                                readOnly={readOnlyData}
                            />
                        </Grid>
                    );
                    case "dropdown_with_add":
                        return (
                            <Grid item xs={12} md={field.col ? field.col : 12} p={2}>
                                <DropdownWithAdd
                                    key={field.id}
                                    field={field}
                                    formData={formData}
                                    errors={errors}
                                    onChange={(selectedCode) => handleAutocomplete(field, selectedCode)}
                                    onAdd={(value)=>dropdownWithAddItem(field, value)}
                                    onChangeDropdownInputValue={(value) => 
                                        setDropdownInputValue({ ...dropdownInputValue, [field.name]: value })
                                    }
                                    onHistory={() => showHistory(field.name)}
                                    dropdownInputValue={dropdownInputValue}
                                    readOnly={readOnlyData}
                                />
                            </Grid>
                        );
                  case 'divider':
                    return (
                      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: '16px', width: '100%' }}>
                        <div className='divider'></div>
                      </div>
                    );

                  default:
                    return null;
                }
              })}
            </Grid>

            {onSubmit &&
              <Grid container>
                <Grid item xs={12} md={6}>
                  <Button ref={formButtonRef} className='GreenFillBtn' sx={{ display: 'none' }} type='submit'>Submit</Button>
                </Grid>
              </Grid>
            }

          </form>
        </Box>
        {
          loading && <div className='parent_spinner' tabIndex="-1" aria-hidden="true">
            <CircularProgress size={100} />
          </div>
        }
      </Box>

<Dialog
  open={showActionModal}
  onClose={() => {
    setShowActionModal(false);
    setCaseActionSelectedValue(null);
    setActionCases([]);
    setActionCasesPage(0);
  }}
  aria-labelledby="alert-dialog-title"
  aria-describedby="alert-dialog-description"
  fullScreen
  fullWidth
  sx={{ zIndex: "1", marginLeft: '250px' }}
>
  <DialogTitle id="alert-dialog-title"></DialogTitle>
  <DialogContent sx={{  }}>
    <DialogContentText id="alert-dialog-description">
     <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <WestIcon
          style={{ cursor: "pointer", color: "#222" }}
          onClick={() => {
            setShowActionModal(false);
            setCaseActionSelectedValue(null);
            setActionCases([]);
          }}
        />
        <span style={{ fontWeight: 500, fontSize: 18, color: "#222", marginLeft: 12 }}>
          {investigationAction?.name}
        </span>
      </div>
      <Button variant='outlined' onClick={updateCaseActions}>
      Submit
    </Button>
    </div>
      
      {/* <h4 className="form-field-heading">{investigationAction?.name}</h4> */}

      <FormControl fullWidth sx={{ marginBottom: 2 }}>
        <Autocomplete
          options={caseActionOptions}
          getOptionLabel={(option) => option.name || ""}
          value={
            caseActionOptions.find(
              (option) => String(option.code) === String(caseActionSelectedValue)
            ) || null
          }
          onChange={async (event, newValue) => {
            setCaseActionSelectedValue(newValue?.code || null);
            setActionCases([]);
            if (newValue?.code) {
              try {
                const response = await api.post("cidMaster/getSpecificIoUsersCases", {
                  user_id: String(newValue.code),
                  template_module: "ui_case",
                });

                console.log("initialData from cases:", initialData.id);
                

                let cases = [];
                if (Array.isArray(response.cases)) {
                  cases = response.cases;
                } else if (response?.cases && typeof response.cases === "object") {
                  cases = [response.cases];
                }
                // Remove the current case (initialData.id) from the cases array
                cases = cases.filter(
                  (caseItem) =>
                  String(caseItem.id) !== String(initialData.id)
                );
                setActionCases(cases);
                } catch (err) {
                console.error("Failed to fetch cases", err);
                setActionCases([]);
                }
              }
              }}
              renderInput={(params) => (
              <TextField
                {...params}
                className="selectHideHistory"
                label={investigationAction?.name.trim() || "Assign to IO"}
              />
              )}
            />
            </FormControl>

            <div style={{ marginTop: 16}}>
              <h4 className="form-field-heading">Cases for Selected Action</h4>
              <div style={{ }}>
              <TableView
                rows={actionCases
                // Filter out the current case by id before displaying in the table
                .filter(row => String(row.id) !== String(initialData.id))
                .slice(
                  actionCasesPage * actionCasesPageSize,
                  (actionCasesPage + 1) * actionCasesPageSize
                )
                .map((row, idx) => ({
                  ...row,
                  sno: actionCasesPage * actionCasesPageSize + idx + 1,
                  "field_cid_crime_no./enquiry_no":
                  row["field_cid_crime_no./enquiry_no"] ||
                  row.field_cid_crime_no ||
                  row.enquiry_no ||
                  "",
                  "field_crime_number_of_ps": row["field_crime_number_of_ps"] || "",
                  "field_case/enquiry_keyword": row["field_case/enquiry_keyword"] || "-",
                }))}
                columns={[
                {
                  field: "sno",
                  headerName: "S.No",
                  flex: 0.3,
                  renderCell: (params) => params.row.sno,
                },
                {
                  field: "field_cid_crime_no./enquiry_no",
                  headerName: "Crime/Enquiry No.",
                  flex: 1,
                  renderCell: (params) =>
                  params.row["field_cid_crime_no./enquiry_no"],
                },
                {
                  field: "field_crime_number_of_ps",
                  headerName: "Crime Number of PS",
                  flex: 1,
                  renderCell: (params) => params.row["field_crime_number_of_ps"],
                },
                {
                  field: "field_case/enquiry_keyword",
                  headerName: "Case/Enquiry Keyword",
                  flex: 1,
                  renderCell: (params) => params.row["field_case/enquiry_keyword"],
                },
                ]}
                totalPage={
                actionCases.filter(row => String(row.id) !== String(initialData.id)).length > 0 && actionCasesPageSize > 0
                  ? Math.ceil(actionCases.filter(row => String(row.id) !== String(initialData.id)).length / actionCasesPageSize)
                  : 1
                }
                totalRecord={actionCases.filter(row => String(row.id) !== String(initialData.id)).length}
                paginationCount={
                Number.isFinite(actionCasesPage) ? actionCasesPage + 1 : 1
                }
                handlePagination={(page) => setActionCasesPage(page - 1)}
                getRowId={(row, idx) =>
                row.id || row["field_cid_crime_no./enquiry_no"] || idx
                }
                noRowsOverlayText="No data found"
                sx={{ width: 700 }}
              />
              </div>
              <div style={{ marginTop: 8 }}>
              Showing{" "}
              {Math.min(
                actionCases.filter(row => String(row.id) !== String(initialData.id)).length,
                (actionCasesPage + 1) * actionCasesPageSize
              )}{" "}
              of {actionCases.filter(row => String(row.id) !== String(initialData.id)).length} cases
              </div>
            </div>
          </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ padding: "12px 24px" }}>
          {/* <Button
            onClick={() => {
            setShowActionModal(false);
            setCaseActionSelectedValue(null);
            setActionCases([]);
            }}
          >
            Cancel
          </Button> */}
    {/* <Button className="fillPrimaryBtn" onClick={updateCaseActions}>
      Submit
    </Button> */}
  </DialogActions>
</Dialog>


      {historyModal &&
        <Dialog
          open={historyModal}
          onClose={() => setHistoryModal(false)}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          maxWidth="md"
          fullWidth
          className="approvalModal"
        >
          <DialogTitle id="alert-dialog-title" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} >
            <Box>
              History
            </Box>
            <IconButton
              aria-label="close"
              onClick={() => setHistoryModal(false)}
              sx={{ color: (theme) => theme.palette.grey[500] }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              <Box py={2}>
                <TableView rows={historyData} columns={historyHeaderData} />
              </Box>
            </DialogContentText>
          </DialogContent>
        </Dialog>
      }

        {caseHistoryModal && (
            <Dialog
                open={caseHistoryModal}
                onClose={() => setCaseHistoryModal(false)}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                maxWidth="md"
                fullWidth
                className="approvalModal"
            >
                <DialogTitle
                    id="alert-dialog-title"
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        paddingBottom: 0
                    }}
                >
                    <Box>Case History</Box>
                    <IconButton
                        aria-label="close"
                        onClick={() => setCaseHistoryModal(false)}
                        sx={{ color: (theme) => theme.palette.grey[500] }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        <Box py={2}>
                            <TableView rows={caseHistoryData} columns={caseHistoryHeaderData} />
                        </Box>
                    </DialogContentText>
                </DialogContent>
            </Dialog>
        )}

    </>
  );
};

export default NormalViewForm;
