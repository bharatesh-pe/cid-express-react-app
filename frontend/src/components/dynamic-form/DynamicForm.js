// DynamicForm.js
import React, { useState, useEffect, useRef } from "react";
// import formConfig from './formConfig.json';
import { Button, Grid, Box, Typography, IconButton } from "@mui/material";
import { Stepper, Step, StepLabel } from "@mui/material";

import ShortText from "../form/ShortText";
import DateField from "../form/Date";
import SelectField from "../form/Select";
import LongText from "../form/LongText";
import ValueRangeField from "../form/ValueRange";
import CheckboxesBtn from "../form/Checkbox";
import RadioBtn from "../form/Radio";
import MultiSelect from "../form/MultiSelect";
import FileInput from "../form/FileInput";
import AutocompleteField from "../form/AutoComplete";
import DateTimeField from "../form/DateTime";
import TimeField from "../form/Time";
import TabsComponents from "../form/Tabs";
import ProfilePicture from "../form/ProfilePicture";
import api from "../../services/api";
import TableView from "../table-view/TableView";

import "./DynamicForm.css";
import NumberField from "../form/NumberField";

import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";

import { CircularProgress } from "@mui/material";

import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import CloseIcon from "@mui/icons-material/Close";
import ActTable from './actSection';

const DynamicForm = ({
  formConfig,
  initialData,
  onSubmit,
  onError,
  stepperData,
  closeForm,
  table_name,
  template_name,
  readOnly,
  editData,
  onUpdate,
  template_id,
  table_row_id,
}) => {
//   let storageFormData = localStorage.getItem(template_name + "-formData")
//     ? JSON.parse(localStorage.getItem(template_name + "-formData"))
//     : {};
  //   console.log('template_name', template_name);

  var userPermissions = JSON.parse(localStorage.getItem("user_permissions")) || [];

  const [formData, setFormData] = useState({});
  const [newFormConfig, setNewFormConfig] = useState(
    formConfig ? formConfig : {}
  );
  const [stepperConfigData, setstepperConfigData] = useState([]);
  const [errors, setErrors] = useState({});
  const formButtonRef = useRef(null);
  const [activeStep, setActiveStep] = useState(0);
  const [stepperPercentage, setStepperPercentage] = useState({});
  const [loading, setLoading] = useState(false); // State for loading indicator
  const [selectedField, setSelectedField] = useState({});

  const [historyModal, setHistoryModal] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [historyHeaderData, sethistoryHeaderData] = useState([
    { field: "sl_no", headerName: "Sl. No." },
    { field: "updated_value", headerName: "Updated Value", flex: 1 },
    { field: "old_value", headerName: "Old Value", flex: 1 },
    { field: "username", headerName: "Edited User", flex: 1 },
    { field: "date", headerName: "Date & Time", flex: 1 },
  ]);

  const [caseHistoryModal, setCaseHistoryModal] = useState(false);
  const [caseHistoryData, setCaseHistoryData] = useState([]);
  const [caseHistoryHeaderData, setCasehistoryHeaderData] = useState([
    { field: "sl_no", headerName: "Sl. No." },
    { field: "action", headerName: "Action", flex: 1 },
    { field: "actor_name", headerName: "User", flex: 1 },
    { field: "date", headerName: "Date & Time", flex: 1 },
  ]);

  const saveNewRef = useRef(false);

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData(initialData);
    }
  }, [initialData]);

    const [readOnlyTemplate, setReadonlyTemplate] = useState(readOnly);
    const [editDataTemplate, setEditDataTemplate] = useState(editData);

    const templateEdit = ()=>{
        setReadonlyTemplate((prev)=>!prev);
        setEditDataTemplate((prev)=>!prev);
    }

  const [dateUpdateFlag, setDateUpdateFlag] = useState(false);

    const [tableActRow, setTableActRow] = useState([{ act: "", section: "" }]);
//   useEffect(() => {
//     if (formData && Object.keys(formData).length !== 0 && !formData.id) {
//       localStorage.setItem(
//         template_name + "-formData",
//         JSON.stringify(formData)
//       );
//     }
//   }, [formData]);

  const handleChangeDate = (name, newValues) => {
    // setFormData({
    //   ...formData,
    //   [name]: newValues,
    // });
    handleMaxDateChange(name,newValues);
  };

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

        if(table_name === "cid_pending_trail" && formData?.['field_cc_pending']){
            
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

    },[formData]);

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

        setNewFormConfig((prevFormConfig) => {
            const updatedFormConfig = prevFormConfig.map((data) => {
                if(data.name === "field_order_copy_(_17a_done_)"){
                    return {...data, hide_from_ux : value }
                }else{
                    return data;
                }
            });
            return updatedFormConfig;
        });

        if (value) {
            delete formData["field_order_copy_(_17a_done_)"];
        }
    };

  const handleChange = (e) => {
    // console.log(e.target)

    const { name, value, type, checked, files } = e.target;
    if (type === "checkbox-group") {
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
        [name]:
          type === "checkbox"
            ? checked
            : type === "file"
            ? Array.from(files)
            : value,
      });
    }

    // console.log('formData', formData);
  };

  const validate = () => {
    let tempErrors = {};
    newFormConfig.forEach((field) => {

        if(field?.hide_from_ux){
            return null
        }

        if(table_name === "cid_under_investigation" || table_name === "cid_pending_trail" || table_name === "cid_enquiries"){
            const roleTitle = JSON.parse(localStorage.getItem("role_title")?.toLowerCase().trim());

            if (roleTitle === "admin organization") {
                if (!field.ao_field) {
                    field.disabled = true;
                    if (field.required) {
                        field.required = false;
                    }
                }
            } else {
                if (field.ao_field) {
                    field.disabled = true;
                    if (field.required) {
                        field.required = false;
                    }
                }
            }
        }

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

    if(table_name === "cid_under_investigation"){
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
        };

        setLoading(true);

        try {
          const getActionsDetails = await api.post(
            "/templateData/templateDataFieldDuplicateCheck",
            payloadForDuplicate
          );

          setLoading(false);

          if (getActionsDetails && !getActionsDetails.success) {
            Swal.fire({
              title: "Duplicate Values Found For " + duplicateCheckKey[0].label,
              text: "Need to create new one ?",
              icon: "warning",
              showCancelButton: true,
              confirmButtonText: "Yes, Continue!",
              cancelButtonText: "No",
            }).then(async (result) => {
              if (!result.isConfirmed) {
                return false;
              } else {
                !readOnlyTemplate && editDataTemplate ? onUpdate(formData) : onSubmit(formData, saveNewRef?.current); // This will pass the form data to the parent `onSubmit` function
              }
            });
          } else {
            !readOnlyTemplate && editDataTemplate ? onUpdate(formData) : onSubmit(formData, saveNewRef?.current); // This will pass the form data to the parent `onSubmit` function
          }
        } catch (error) {
          setLoading(false);
          if (error && error.response && error.response["data"]) {
            toast.error(
              error.response["data"].message
                ? error.response["data"].message
                : "Please Try Again !",
              {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                className: "toast-error",
              }
            );
            return false;
          }
        }
      } else {
        !readOnlyTemplate && editDataTemplate ? onUpdate(formData) : onSubmit(formData, saveNewRef?.current); // This will pass the form data to the parent `onSubmit` function
      }
    } else {
      toast.warning("Please Fill Mandatory Fields", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        className: "toast-warning",
        onOpen: () => onError(true),
      });
    }
  };

  const handleDropdownChange = (fieldId, selectedValue) => {
    setFormData((prevData) => ({
      ...prevData,
      [fieldId]: selectedValue,
    }));
  };

  const handleAutocomplete = (field, selectedValue) => {
    let updatedFormData = { ...formData, [field.name]: selectedValue };
    setSelectedField(field);

    if (field.table) {
      var updatedFormConfig = newFormConfig.map((data) => {
        if (
          data &&
          data.dependent_table &&
          data.dependent_table.length > 0 &&
          data.dependent_table.includes(field.table)
        ) {
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

    setFormData(updatedFormData);

    // console.log(updatedFormData);
  };

  const handleCheckBoxChange = (fieldName, fieldCode, selectedValue) => {
    setFormData((prevData) => {
      const updatedField = Array.isArray(prevData[fieldName])
        ? prevData[fieldName]
        : typeof prevData[fieldName] === "string"
        ? prevData[fieldName].split(",").map((item) => item.trim())
        : [];

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
          [fieldName]: updatedField.filter((code) => code !== fieldCode),
        };
      }

      return prevData;
    });
  };

  const handleTabChange = (fieldName, fieldCode, selectedValue) => {
    setFormData((prevData) => {
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
    setFormData((prevData) => {
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

            if(dependent_field?.[0]?.table === "section" && table_name === "cid_under_investigation"){
                return;
            }

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

                    if(dependent_field?.[0]?.table === "section" && table_name === "cid_under_investigation"){
                        return field;
                    }

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
                                        }else if(dependent_field[0]?.api !== "/templateData/getTemplateData"){
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

                    if(dependent_field?.[0]?.table === "section" && table_name === "cid_under_investigation"){
                        return field;
                    }

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

        newFormConfig
          ?.filter((el) => el.section === data)
          ?.map((field) => {
            if (field.formType) {
              totalCount++;
              if (formData[field.name]) {
                percentageCount++;
              }
            }
          });

        steppersPercentageData[data] =
          Math.round((percentageCount / totalCount) * 100) || 0;
      });

      setStepperPercentage(steppersPercentageData);
    }
  }, [newFormConfig, formData]);

  const stepperPrevNavigation = () => {
    if (activeStep != 0) {
      setActiveStep((prev) => prev - 1);
    }
  };

  const stepperNextNavigation = () => {
    if (stepperData && stepperData.length > activeStep + 1) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const CloseFormModal = () => {
    if (closeForm) {
      closeForm(false);
    }
  };

  useEffect(() => {
    if (stepperData && stepperData.length > 0) {
      var stepperAllFields = newFormConfig.filter((field) => {
        return field.section === stepperData[activeStep];
      });

      setstepperConfigData(stepperAllFields);
    }
  }, [activeStep, newFormConfig]);

  const showHistory = async (fieldName) => {
    if (
      !template_id ||
      template_id === "" ||
      !table_row_id ||
      table_row_id === ""
    ) {
      return false;
    }

    var payload = {
      template_id: template_id,
      table_row_id: table_row_id,
      field_name: fieldName,
    };

    setLoading(true);

    try {
      const getHistoryResponse = await api.post(
        "/profileHistories/getProfileHistory",
        payload
      );
      setLoading(false);

      if (getHistoryResponse && getHistoryResponse.success) {
        if (
          getHistoryResponse["data"] &&
          getHistoryResponse["data"].length > 0
        ) {
          var updatedData = getHistoryResponse["data"].map((data, index) => {
            var fullname = "";
            if (data.userDetails) {
              if (data.userDetails["user_firstname"]) {
                if (data.userDetails["user_lastname"]) {
                  fullname =
                    data.userDetails["user_firstname"] +
                    " " +
                    data.userDetails["user_lastname"];
                } else {
                  fullname = data.userDetails["user_firstname"];
                }
              }
            }

            // const readableDate = new Date(data.updated_at).toLocaleString(
            //   "en-US",
            //   {
            //     year: "numeric",
            //     month: "long",
            //     day: "2-digit",
            //   }
            // );

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
              id: data.profile_history_id,
              sl_no: index + 1,
              username: fullname,
              date: readableDate,
            };
          });

          setHistoryData(updatedData);
          setHistoryModal(true);
        } else {
          setHistoryData([]);
          setHistoryModal(true);
        }
      } else {
        setHistoryData([]);
        setHistoryModal(true);
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
        const fetchTemplateData = async () => {
            try { 
                const apiCalls = newFormConfig
                .filter((field) =>  field?.api && field?.table && (!field?.is_dependent || field?.is_dependent == "false") )
                .map(async (field) => {
                    setLoading(true);
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

                        const response = await api.post(field.api, apiPayload);

                        setLoading(false);

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
                        setLoading(false);
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
                                setFormData((prevData) => ({
                                    ...prevData,
                                    [field.name]: onlyOption.code
                                }));

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

                if(dependent_field?.[0]?.table === "section" && table_name === "cid_under_investigation"){
                    return selectedField;
                }
    
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

  //   console.log(stepperConfigData, "stepperConfigData stepperConfigData")
  //   console.log(stepperData, "stepperData stepperData")    
  return (
    <>
      <Box
        sx={{
          position: "fixed",
          top: "0",
          left: "0",
          right: "0",
          bottom: "0",
          background: "rgba(0, 0, 0, 0.5)",
          zIndex: "100",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          top: "0",
          right: "0",
          left: "50px",
          height: "100%",
          background: "#F5F5F5",
          zIndex: "100",
          borderRadius: "12px 0 0 12px",
          overflow: "hidden",
        }}
        inert={loading ? true : false}
      >
        {stepperData && stepperData.length > 0 && (
          <Box px={2} py={1} sx={{ background: "#FFFFFF" }}>
            <Stepper
              className={"stepperWidth_" + stepperData.length}
              sx={{
                minWidth: "300px",
                maxWidth: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              activeStep={activeStep}
            >
              {stepperData.map((label, index) => (
                <Step
                  className={
                    stepperPercentage && stepperPercentage[label]
                      ? "Stepper_" +
                        stepperPercentage[label] +
                        "_Percentage stepperPercentage"
                      : ""
                  }
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  key={index}
                  onClick={() => setActiveStep(index)}
                >
                  <StepLabel>
                    <div
                      className={`${
                        stepperPercentage && stepperPercentage[label]
                          ? "Stepper_" +
                            stepperPercentage[label] +
                            "_Percentage"
                          : ""
                      } stepperHeader`}
                    >
                      {label}
                    </div>
                    <div
                      className={`${
                        stepperPercentage && stepperPercentage[label]
                          ? "Stepper_" +
                            stepperPercentage[label] +
                            "_Percentage"
                          : ""
                      } stepperCompletedPercentage`}
                    >
                      {stepperPercentage && stepperPercentage[label]
                        ? stepperPercentage[label]
                        : 0}
                      % completed
                    </div>
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>
        )}

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            border: "1px solid #636B744D",
            padding: "16px",
            background: "#FFFFFF",
          }}
        >
          <Box
            onClick={CloseFormModal}
            sx={{
              display: "inline-flex",
              alignItems: "center",
              cursor: "pointer",
              gap: "8px",
            }}
          >
            <img src="../arrow-left.svg" />
            <Typography
              sx={{ fontSize: "19px", fontWeight: "500", color: "#171A1C" }}
              className="Roboto"
            >
              {template_name ? template_name : "Form"}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {!readOnlyTemplate && editDataTemplate && onUpdate ? (
              <Button
                onClick={() =>
                  formButtonRef &&
                  formButtonRef.current &&
                  formButtonRef.current.click()
                }
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
                Update Case
              </Button>
            ) : (
              !readOnlyTemplate &&
              onSubmit && (
                <>
                    <Button
                        onClick={() => {
                            saveNewRef.current = false;
                            formButtonRef &&
                            formButtonRef.current &&
                            formButtonRef.current.click()
                        }}
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
                        Register Case
                    </Button>
                    <Button
                        onClick={() =>{
                            saveNewRef.current = true;
                            formButtonRef &&
                            formButtonRef.current &&
                            formButtonRef.current.click()
                        }}
                        sx={{
                            background: "#0167F8",
                            borderRadius: "8px",
                            fontSize: "14px",
                            fontWeight: "500",
                            color: "#FFFFFF",
                            padding: "6px 16px",
                        }}
                        className="Roboto GreenFillBtn"
                        variant="contained"
                    >
                        Save & New
                    </Button>
                </>
              )
            )}
            {
                 (
                    (
                        readOnlyTemplate &&
                        userPermissions[0]?.edit_case &&
                        (table_name !== "cid_under_investigation" &&
                        table_name !== "cid_pending_trail" &&
                        table_name !== "cid_enquiries")
                    )
                    ||
                    (
                        readOnlyTemplate &&
                        userPermissions[0]?.edit_case &&
                        (table_name === "cid_under_investigation" ||
                        table_name === "cid_pending_trail" ||
                        table_name === "cid_enquiries") &&
                        formData['field_io_name'] &&
                        formData['field_io_name'] !== ""
                    )
                ) && (
                    <Button
                        variant="outlined"
                        sx={{marginLeft: "10px", height: '40px'}}
                        onClick = {() => {CaseLogs()}}
                    >
                        Case Log
                    </Button>
                )

            }
            {
                (
                    (
                        readOnlyTemplate &&
                        userPermissions[0]?.edit_case &&
                        (table_name !== "cid_under_investigation" &&
                        table_name !== "cid_pending_trail" &&
                        table_name !== "cid_enquiries")
                    )
                    ||
                    (
                        readOnlyTemplate &&
                        userPermissions[0]?.edit_case &&
                        (table_name === "cid_under_investigation" ||
                        table_name === "cid_pending_trail" ||
                        table_name === "cid_enquiries") &&
                        formData['field_io_name'] &&
                        formData['field_io_name'] !== ""
                    )
                ) && (
                    <Button
                        onClick={templateEdit}
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
                        Edit Case
                    </Button>
                )
            }

          </Box>
        </Box>
        <Box
          sx={{
            height: `calc(99% - ${
              stepperData && stepperData.length > 0 ? "150px" : "100px"
            })`,
            overflow: "auto",
            background: "#FFFFFF",
            border: "1px solid #636B744D",
            borderRadius: "8px",
          }}
          mx={2}
          mt={2}
        >
          <Box
            sx={{
              borderBottom: "1px solid #636B744D",
              padding: "16px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box
              sx={{ display: "inline-flex", gap: "12px", alignItems: "center" }}
            >
              {stepperData && stepperData.length > 0 && (
                <Typography className="HighlightedSquare">
                  {activeStep + 1}
                </Typography>
              )}
              <Typography className="HighlightedText">
                {stepperData && stepperData[activeStep] ? stepperData[activeStep] : "General Detail"}
              </Typography>
            </Box>

            {stepperData && stepperData.length > 0 && (
              <Box sx={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <Button
                  onClick={stepperPrevNavigation}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minWidth: "16px",
                  }}
                >
                  {" "}
                  <ArrowBackIosIcon
                    sx={{
                      height: "16px",
                      width: "16px",
                      color: "rgba(0, 0, 0, 0.56)",
                      cursor: "pointer",
                    }}
                  />{" "}
                </Button>
                <Button
                  onClick={stepperNextNavigation}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minWidth: "16px",
                  }}
                >
                  {" "}
                  <ArrowForwardIosIcon
                    sx={{
                      height: "16px",
                      width: "16px",
                      color: "rgba(0, 0, 0, 0.56)",
                      cursor: "pointer",
                    }}
                  />{" "}
                </Button>
              </Box>
            )}
          </Box>

          <form onSubmit={handleSubmit} noValidate style={{ margin: 0 }}>
            <Grid container sx={{ alignItems: "start" }}>
              {(stepperData && stepperData.length > 0
                ? stepperConfigData
                : newFormConfig
              ).map((field, index) => {

                if (field?.hide_from_ux || (field?.table?.toLowerCase() === "section" && table_name === "cid_under_investigation")) {
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

                const isRequired =
                  field.required === "true" || field.required === true;

                var readOnlyData = readOnlyTemplate

                if(table_name === "cid_under_investigation" || table_name === "cid_pending_trail" || table_name === "cid_enquiries"){
                    const roleTitle = JSON.parse(localStorage.getItem("role_title")?.toLowerCase().trim());

                    if (roleTitle === "admin organization") {
                        if (!field.ao_field) {
                            readOnlyData = true
                            if (field.required) {
                                field.required = false;
                            }
                        }
                    } else {
                        if (field.ao_field) {
                            readOnlyData = true
                            if (field.required) {
                                field.required = false;
                            }
                        }
                    }
                }

                if(field?.table?.toLowerCase() === "act" && table_name === "cid_under_investigation"){
                    return (
                        <Grid item xs={12} p={2}>
                            <ActTable 
                                formConfig={allFields}
                                formData={formData}
                                tableRow={tableActRow}
                                tableFunc={UpdateTableRowApi}
                                readOnly={readOnlyTemplate}
                                showOrderCopy={makeOrderCopyShow}
                            />
                        </Grid>
                    );
                }

                switch (field.type) {
                  case "text":
                    return (
                      <Grid item xs={12} md={field.col ? field.col : 12} p={2}>
                        <div className="form-field-wrapper_selectedField">
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

                  case "email":
                    return (
                      <Grid item xs={12} md={field.col ? field.col : 12} p={2}>
                        <div className="form-field-wrapper_selectedField">
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

                  case "number":
                    return (
                      <Grid item xs={12} md={field.col ? field.col : 12} p={2}>
                        <div className="form-field-wrapper_selectedField">
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

                  case "valuesinput":
                    return (
                      <Grid item xs={12} md={field.col ? field.col : 12} p={2}>
                        <div className="form-field-wrapper_selectedField">
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

                  case "date":
                    return (
                      <Grid item xs={12} md={field.col ? field.col : 12} p={2}>
                        <div className="form-field-wrapper_selectedField">
                          <DateField
                            field={field}
                            formData={formData}
                            errors={errors}
                            onHistory={() => showHistory(field.name)}
                            onChange={(value) => {
                              handleChangeDate(field.name, value);
                            }}
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
                          onChange={(value) =>
                            handleChangeDate(field.name, value)
                          } // Handle change
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
                          onChange={(value) =>
                            handleChangeDate(field.name, value)
                          } // Handle change
                          onHistory={() => showHistory(field.name)}
                          readOnly={readOnlyData}
                        />
                      </Grid>
                    );

                  case "dropdown":
                    return (
                      <Grid item xs={12} md={field.col ? field.col : 12} p={2}>
                        <div className="form-field-wrapper_selectedField">
                          <SelectField
                            key={field.id}
                            field={field}
                            formData={formData}
                            errors={errors}
                            onHistory={() => showHistory(field.name)}
                            onChange={(value) =>
                              handleAutocomplete(field, value.target.value)
                            }
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
                          onChange={(name, selectedCode) =>
                            handleAutocomplete(field, selectedCode)
                          }
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
                          onChange={(name, selectedCode) =>
                            handleAutocomplete(field, selectedCode)
                          }
                          readOnly={readOnlyData}
                        />
                      </Grid>
                    );

                  case "textarea":
                    return (
                      <Grid item xs={12} md={field.col ? field.col : 12} p={2}>
                        <div className="form-field-wrapper_selectedField">
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

                  case "file":
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
                  case "profilepicture":
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
                  case "divider":
                    return (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          justifyContent: "center",
                          alignItems: "center",
                          gap: "16px",
                          width: "100%",
                        }}
                      >
                        <div className="divider"></div>
                      </div>
                    );

                  default:
                    return null;
                }
              })}
            </Grid>

            {onSubmit && (
              <Grid container>
                <Grid item xs={12} md={6}>
                  <Button
                    ref={formButtonRef}
                    className="GreenFillBtn"
                    sx={{ display: "none" }}
                    type="submit"
                  >
                    Submit
                  </Button>
                </Grid>
              </Grid>
            )}
          </form>
        </Box>
        {loading && (
          <div className="parent_spinner" tabIndex="-1" aria-hidden="true">
            <CircularProgress size={100} />
          </div>
        )}
      </Box>

      {historyModal && (
        <Dialog
          open={historyModal}
          onClose={() => setHistoryModal(false)}
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
            }}
          >
            <Box>History</Box>
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
      )}

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

export default DynamicForm;
