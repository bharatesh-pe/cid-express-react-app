import React, { useEffect, useMemo, useState } from 'react';
import Split from 'react-split';
import { Box, Typography, Button, Grid, Menu, MenuItem, Stack, TextField, FormControl, InputLabel, Select, FormHelperText, Tooltip, IconButton, Autocomplete, Radio } from '@mui/material';
import CreateField from '../components/dynamic-form-builder/CreateField';
import formFields from '../components/dynamic-form-builder/formFields.json';
import ShortText from '../components/form/ShortText';
import NumberField from '../components/form/NumberField';
import EmailField from '../components/form/EmailField';
import ValueRangeField from '../components/form/ValueRange';
import MultiSelect from '../components/form/MultiSelect';
import CheckboxesBtn from '../components/form/Checkbox';
import RadioBtn from '../components/form/Radio';
import FileInput from '../components/form/FileInput';
import ProfilePicture from '../components/form/ProfilePicture';
import AutocompleteField from '../components/form/AutoComplete';
import TabsComponents from '../components/form/Tabs';
import RichTextEditor from '../components/form/RichTextEditor';
import TableField from '../components/form/Table';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import Switch from '@mui/material/Switch';
import { useLocation, useNavigate } from 'react-router-dom';
import { Stepper, Step, StepLabel } from '@mui/material';
import api from '../services/api';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import LongText from '../components/form/LongText';
import DateField from '../components/form/Date';
import DateTimeField from "../components/form/DateTime";
import TimeField from '../components/form/Time';
import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";

// form builder delete btn
import deleteBtn from '../Images/formbuilderDelete.svg';
// Right Icon
import RightIcon from '../Images/RightArrow.svg';
// Left Icon
import LeftIcon from '../Images/LeftArrow.svg'
import pdfIcon from '../Images/pdfIcon.svg'
import docIcon from '../Images/docIcon.svg'
import xlsIcon from '../Images/xlsIcon.svg'
import pptIcon from '../Images/pptIcon.svg'
import jpgIcon from '../Images/jpgIcon.svg'
import pngIcon from '../Images/pngIcon.svg'

import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import InfoIcon from '@mui/icons-material/Info';
import VisibilityIcon from '@mui/icons-material/Visibility';

import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { CircularProgress } from "@mui/material";
import HistoryIcon from '@mui/icons-material/History';

import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import DropdownWithAdd from '../components/form/DropdownWithAdd';
import Swal from 'sweetalert2';
import SelectField from '../components/form/Select';

const camelize = (str) => {
    return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (match, index) => (index === 0 ? match.toLowerCase() : match.toUpperCase())).replace(/\s+/g, '');
};

const convertToUnderscore = (str) => {
    if (!str) return "";
    return `field_${str.replace(/\s+/g, "_").toLowerCase()}`; // Replace spaces with underscores and add prefix
};

const Formbuilder = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const { profile_name, stepper, type, Createdfields, action, pagination, module, link_module, enable_edit } = state;
    const [fields, setFields] = useState([]);
    const [selectedField, setSelectedField] = useState(null);
    const [selectedDropdwonField, setSelectedDropdownField] = useState(null);
    const [formData, setFormData] = useState({});
    const [previewFormData, setPreviewFormData] = useState([]);
    const [selectedLength, setSelectedLength] = useState(0);
    const [loadingRender, setLoadingRender] = useState(false);
    const [masterModalOpen, setMasterModalOpen] = useState(false);
    const [selectedMasterOptions, setselectedMasterOptions] = useState(null);
    const [masterModalOptions, setMasterModalOptions] = useState([]);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [stepperPercentage, setstepperPercentage] = useState({});
    const [allFormFields,setAllFormFields] = useState([]);
    const [updateFieldReadonly, setUpdateFieldReadonly] = useState(false);

    const [editTemplateDetailsModal,setEditTemplateDetailsModal] = useState(false);
    const [previousProfileName,setPreviousProfileName] = useState(profile_name);
    const [editTemplateDetailsData,setEditTemplateDetailsData] = useState(profile_name);

    // State to track the active step
    const [activeStep, setActiveStep] = useState(0);

    // console.log(stepper);

    // Array for step labels
    const steps = stepper;

    const [dropdownInputValue, setDropdownInputValue] = useState({});

    const [loading, setLoading] = useState(false); // State for loading indicator

    const [propEditIndex, setPropEditIndex] = useState(null);
    const [propEditField, setPropEditField] = useState(null);
    const [showPropsModal, setShowPropsModal] = useState(false);

    const handleOpenPropsModal = (index) => {
        const field = selectedField.tableHeaders[index];
        setPropEditIndex(index);
        setPropEditField({ ...field });
        setShowPropsModal(true);
    };

    const handleSaveProps = () => {
        const updatedHeaders = [...selectedField.tableHeaders];
        updatedHeaders[propEditIndex] = propEditField;

        setSelectedField({ ...selectedField, tableHeaders: updatedHeaders });
        setFields(fields.map(f => f.id === selectedField.id ? { ...f, tableHeaders: updatedHeaders } : f));
        setShowPropsModal(false);
    };

    const importOptionsToField = (index, dbOptions) => {
        const updatedHeaders = [...selectedField.tableHeaders];
        updatedHeaders[index].fieldType = {
            ...(updatedHeaders[index].fieldType || {}),
            options: dbOptions
        };

        setSelectedField({ ...selectedField, tableHeaders: updatedHeaders });
        setFields(fields.map(f => f.id === selectedField.id ? { ...f, tableHeaders: updatedHeaders } : f));
    };

    useEffect(() => {
        if (Createdfields && action === 'edit') {
            if (Createdfields.length > 0) {

                var updatedFields = Createdfields.map((element)=>{
                    
                    if(element.type === "tabs"){
                        return{
                            ...element,
                            is_primary_field : element.is_primary_field ? element.is_primary_field : false,
                            ao_field : element.ao_field ? element.ao_field : false,
                            tableTabs : element.tableTabs ? element.tableTabs : false,
                            hide_from_edit : element.hide_from_edit ? element.hide_from_edit : false,
                        }
                    }

                    if(element.type === "date"){
                        return{
                            ...element,
                            case_dairy : element.case_dairy ? element.case_dairy : false,
                        }
                    }

                    return{
                        ...element,
                        is_primary_field : element.is_primary_field ? element.is_primary_field : false,
                        ao_field : element.ao_field ? element.ao_field : false,
                        hide_from_edit : element.hide_from_edit ? element.hide_from_edit : false,
                    }
                })
                
                setFields(updatedFields);
                setSelectedField(updatedFields[0]);
            } else {
                setFields([]);
            }
        }
    }, [])

    useEffect(() => {
        if (enable_edit === false && selectedField && Createdfields && Createdfields.length > 0) {
            var existingData = Createdfields.some((element) => element.id === selectedField.id);
            setUpdateFieldReadonly(existingData);
        }
    }, [selectedField, Createdfields]);

    useEffect(()=>{

        if(selectedField?.api && selectedField.table){
            
            var dependent_field = fields.filter((field) => {
                return (
                    field.dependent_table && 
                    field.dependent_table.length > 0 && 
                    field.dependent_table.includes(selectedField.table)
                );
            });

            if(dependent_field && dependent_field[0] && dependent_field[0].api){
                var apiPayload = {}
                if(dependent_field[0].dependent_table.length === 1){
                    const key = selectedField.table === 'users' ? 'user_id' : `${selectedField.table}_id`;
                    apiPayload = {
                        [key] : formData[selectedField.name]
                    }
                }else{
                    var dependentFields = fields.filter((field)=>{
                        return dependent_field[0].dependent_table.includes(field.table)
                    })
                    apiPayload = dependentFields.reduce((payload, field) => {
                        if (formData && formData[field.name]) {
                            const key = field.table === 'users' ? 'user_id' : `${field.table}_id`;
                            payload[key] = formData[field.name];
                        }
                        return payload;
                    }, {});
                }
                
                const callApi = async () => {
                    setLoading(true);

                    try {
                        var getOptionsValue = await api.post(dependent_field[0].api,apiPayload);
                        setLoading(false);

                        var updatedOptions = []
    
                        if (getOptionsValue && getOptionsValue.data) {
                            updatedOptions = getOptionsValue.data.map((field, i) => {
                                return {
                                    name: field[dependent_field[0].table === 'users' ? 'name' : dependent_field[0].table + '_name'],
                                    code: field[dependent_field[0].table === 'users' ? 'user_id' : dependent_field[0].table + '_id']
                                }
                            })
                        }

                        var userUpdateFields = {
                            options: updatedOptions
                        }

                        setFields(fields.map((field) =>
                            (field.id === dependent_field[0].id ? { ...field, ...userUpdateFields } : field)
                        ));

                        dependent_field.map((data)=>{
                            delete formData[data.name]
                        });
                         
                    }catch (error) {
                        setLoading(false);
                        if (error && error.response && error.response.data) {
                            toast.error(error.response?.data?.message || 'Need dependent Fields', {
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
                callApi()
            }

        }

    },[formData])

    useEffect(()=>{

        if(stepper && stepper.length > 0){
            
            var steppersPercentageData = {};

            stepper.map((data) => {
                
                var totalCount = 0;
                var percentageCount = 0;

                fields?.filter(el => el.section === data)?.map((field) => {

                    if(field.formType){
                        totalCount++;
                        if (formData[field.name]) {
                            percentageCount++;
                        }
                    }

                });

                steppersPercentageData[data] = Math.round((percentageCount / totalCount) * 100) || 0;
            });

            setstepperPercentage(steppersPercentageData)
        }


    },[fields, formData]);


    // Handler to change step on click
    const handleStepClick = (step) => {
        setSelectedField({});
        setActiveStep(step);
    };

    const handleFileChange = (event) => {
        const files = Array.from(event.target.files);
        setUploadedFiles((prev) => [...prev, ...files]);
    };

    const [anchorEl, setAnchorEl] = useState(null); // Anchor element for the dropdown
    const open = Boolean(anchorEl); // Check if the menu is open

    const handleFieldSelect = (e) => {
        if (!e.target || !e.target.value) {
            console.error('Invalid field data', e);
            return;
        }
        const field = e.target.value;

        // Update the selected field
        //setSelectedDropdownField(field);

        let fieldLabel = fields.some(el => el.label == "");
        if (fieldLabel) {
            toast.warning('Please enter label name for previous field', {
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

        var emptyOptions = [];
        var tabs_components = [];

        fields.filter((field) => field.formType).map((field) => {
            if(field.options){
                field.options.map((option)=>{
                    if((!option.name || option.name === '') || (!option.code || option.code === '')){
                        if (!emptyOptions.includes(field.label)) {
                            emptyOptions.push(field.label);
                        }                        
                    }
                })
            }

            if(field.type === 'tabs'){
                tabs_components.push(field);
            }
        });

        // if(emptyOptions.length > 0){
        //     toast.warning(`Please Enter Name and Code for all options in ${emptyOptions.join(', ')}`, {
        //         position: "top-right",
        //         autoClose: 3000,
        //         hideProgressBar: false,
        //         closeOnClick: true,
        //         pauseOnHover: true,
        //         draggable: true,
        //         progress: undefined,
        //         className: "toast-warning",
        //     });
        //     return;
        // }

        const newField = {
            ...field,
            id: `${field.type}-${fields.length}-${Math.floor(Math.random() * 90000) + 10000}`,
            name: camelize(field.label),
            // options: field.options || [],
            section: steps && steps[activeStep] ? steps[activeStep] : null,
        };

        if (tabs_components.length > 0) {
            for (const tab of tabs_components) {
                const selected = formData[tab.name];

                if (selected && (Array.isArray(selected) ? selected.length > 0 : true)) {
                    newField['tabOption'] = selected;
                    break;
                }
            }
        }

        setFields([...fields, newField]);  // Add new field to the fields list
        // setFields([newField]);  // Add new field to the fields list
        setSelectedField(newField);
    };

    const onAddDivider = () => {
        setFields([
            ...fields, 
            { 
              type: 'divider', 
              formType : 'divider',
              label: `random_${Date.now()}_divider`, 
              id: `random_${Date.now()}_divider`, 
              name: `random_${Date.now()}_divider`, 
              section: steps && steps[activeStep] ? steps[activeStep] : null 
            }
        ]);          
    }

    const handleFieldDelete = (fieldLabel) => {
        console.log(formData);
        let res = delete formData[fieldLabel];
        console.log(res, formData);

        let updatedfields = fields.filter((el) => el.label != fieldLabel);
        setFields(updatedfields)
        setSelectedField([]);
        setFormData(formData);
    }

    const handlePropertyChange = (e) => { // Function that handles changes to form input fields
        const { name, value } = e.target; // Destructures the name and value from the event target (input element)
        if (name === 'label') {

            if (value.length > 50) {
                toast.warning('Label should not exceed 50 characters', {
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

            let fieldLabel = fields.some(el => el.label == value);
            if (fieldLabel) {
                toast.warning('Duplicate label', {
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
        }

        // Update the selectedField state with a new object, preserving the current state, 
        // and updating the value of the field corresponding to the `name` key.
        // If the `name` is 'label', also update the `name` property with the new value (same as `label`).

        var existingData = false;

        if (Createdfields && Createdfields.length > 0) {
            existingData = Createdfields.some((element) => element.id === selectedField.id);
        }

        setSelectedField({
            ...selectedField,
            [name]: value,
            name: existingData
                ? selectedField.name
                : name === 'label'
                    ? convertToUnderscore(value)
                    : selectedField.name
        });

        setFields(fields.map((field) =>
            field.id === selectedField.id
                ? {
                    ...field,
                    [name]: value,
                    name: existingData
                        ? field.name
                        : name === 'label'
                            ? convertToUnderscore(value)
                            : field.name
                }
                : field
        ));
    };



    // Handles changes to a switch (e.g., a checkbox toggle)
    const handleSwitch = (e) => {
        const { name, checked } = e.target; // Destructures the name and checked state from the event target (switch)

        // Update the selectedField state to reflect the new checked value for the corresponding name (field)
        setSelectedField({
            ...selectedField, // Preserve other properties in selectedField
            [name]: checked // Update the field with the new checked value
        });

        // Update the fields array with the new checked value for the field whose id matches selectedField.id
        setFields(fields.map((field) =>
            (field.id === selectedField.id ? { ...field, [name]: checked } : field) // If id matches, update the field, otherwise leave it unchanged
        ));
    };

    // Handles changes to options for a field (e.g., modifying options in a select dropdown)
    const handleOptionChange = (index, field, value, type) => {
        const newOptions = [...field.options]; // Create a copy of the options array

        if (!newOptions[index]) {
            newOptions[index] = {};
        }
        // Update the option's name or code depending on the 'type' passed (either "name" or "code")
        newOptions[index].name = value; // Modify the option's name at the given index
        newOptions[index].code = value; // Modify the option's code at the given index

        // Update the selectedField state with the new options array
        setSelectedField({ ...field, options: newOptions });

        // Update the fields array with the modified options for the field whose id matches the field.id
        setFields(fields.map((f) =>
            (f.id === field.id ? { ...f, options: newOptions } : f) // If id matches, update the field's options
        ));
    };

    const handleTableHeaderChange = (index, field, value, type) => {
        const newOptions = [...field.tableHeaders]; // Create a copy of the options array

        if (!newOptions[index]) {
            newOptions[index] = {};
        }

        const isDuplicate = newOptions.some((item, idx) => {
            if (idx === index) return false;
            return item?.['header'] === value;
        });

        if (isDuplicate) {
            toast.warning('This value is already used in another header', {
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

        if(type === "header"){
            newOptions[index][type] = value;
        }else if (type === "defaultValue") {
            for (let i = 0; i < newOptions.length; i++) {
                if (!newOptions[i].fieldType) {
                    newOptions[i].fieldType = {};
                }
                newOptions[i].fieldType.defaultValue = i === index ? value : null;
            }
        }else{
            if (!newOptions[index].fieldType) {
                newOptions[index].fieldType = {};
            }
            newOptions[index].fieldType[type] = value;
        }
        
        // Update the selectedField state with the new options array
        setSelectedField({ ...field, tableHeaders: newOptions });

        // Update the fields array with the modified options for the field whose id matches the field.id
        setFields(fields.map((f) =>
            (f.id === field.id ? { ...f, tableHeaders: newOptions } : f) // If id matches, update the field's options
        ));

        setFormData(prevData => {
            const updatedData = { ...prevData };
            delete updatedData[field?.name];
            return {
                ...updatedData
            };
        });

    };

    const handleAddTableHeaders = () => {
        const newOption = { header: "", fieldType: {type: ""} };

        const hasEmptyOption = selectedField?.tableHeaders?.some(option =>
            !option.header?.trim() || !option.fieldType?.type?.trim()
        );

        if(hasEmptyOption){
            toast.warning('Please Check Previous Table Header and Cell Options', {
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

        setSelectedField({
            ...selectedField,
            tableHeaders: [...selectedField.tableHeaders, newOption]
        });

        setFields(fields.map((field) =>
            (field.id === selectedField.id ? { ...field, tableHeaders: [...field.tableHeaders, newOption] } : field)
        ));
    };

    const handleRemoveTableHeaders = (index) => {

        if(selectedField.tableHeaders.length === 1){
            toast.warning('At least one option is required.', {
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

        const newOptions = selectedField.tableHeaders.filter((_, i) => i !== index);

        setSelectedField({ ...selectedField, tableHeaders: newOptions });

        setFields(fields.map((field) =>
            (field.id === selectedField.id ? { ...field, tableHeaders: newOptions } : field)
        ));
    };

    const deleteAllTableHeaders = (index) => {

        var userUpdateFields = {
            tableHeaders: [],
        }

        setSelectedField((prev) => ({
            ...prev,
            tableHeaders : []
        }));

        setFields(fields.map((field) =>
            (field.id === selectedField.id ? { ...field, ...userUpdateFields } : field)
        ));

    };

    const handleTableDataChange = (field, data)=>{
        setFormData(prevData => {
            return {
                ...prevData,
                [field.name]: data,
            };
        });
    }

    const handleTableFieldRemoveOption = (index) => {
        const updated = [...(propEditField?.fieldType?.options || [])];

        if (updated.length <= 1) {
            toast.warning('At least one option is required.', {
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

        updated.splice(index, 1);

        setPropEditField({
            ...propEditField,
            fieldType: {
                ...propEditField.fieldType,
                options: updated
            }
        });
    };

    const handleAddOption = () => {
        const newOption = { name: "", code: "" }; // Create a new option with default empty name and code

        var emptyOption = false;

        selectedField?.options?.map((option)=>{
            if((!option.name || option.name === '') || (!option.code || option.code ==='')){
                if(!emptyOption){
                    emptyOption = true;
                }
            } 
        });

        if(emptyOption){
            toast.warning('Please Check Previous Name and Code', {
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

        // Update the selectedField with the new option added to the options array
        setSelectedField({
            ...selectedField,
            options: [...selectedField.options, newOption]
        });

        // Update the fields array to reflect the new option added to the field
        setFields(fields.map((field) =>
            (field.id === selectedField.id ? { ...field, options: [...field.options, newOption] } : field) // Add the new option to the correct field's options
        ));
    };

    // Handles removing an option from a field's options array based on its index
    const handleRemoveOption = (index) => {

        if(selectedField.options.length === 1){
            toast.warning('At least one option is required.', {
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

        const newOptions = selectedField.options.filter((_, i) => i !== index); // Filter out the option at the given index

        // Update the selectedField state with the new options array (with the option removed)
        setSelectedField({ ...selectedField, options: newOptions });

        // Update the fields array to reflect the removal of the option from the field
        setFields(fields.map((field) =>
            (field.id === selectedField.id ? { ...field, options: newOptions } : field) // Remove the option from the correct field's options
        ));
    };
    const deleteAllOptions = (index) => {
        const newOptions = [] // Filter out the option at the given index

        var userUpdateFields = {
            api: '',
            readonlyOption: false,
            is_dependent : "",
            dependent_table : [],
            table: '',
            options: [],
            forign_key : "",
            attributes : []
        }

        setSelectedField((prev) => ({
            ...prev,
            options: [],
            api: '',
            readonlyOption: false,
            is_dependent : "",
            table: '',
            forign_key : "",
            attributes : [],
            dependent_table : [],
        }));

        setFields(fields.map((field) =>
            (field.id === selectedField.id ? { ...field, ...userUpdateFields } : field)
        ));

    };

    // Handles updating the value of a field's dropdown selection
    const handleDropdownChange = (fieldId, selectedValue) => {
        // Update formData with the selected value for the fieldId to trigger re-render
        setFormData(prevData => ({
            ...prevData, // Spread the previous formData to preserve other fields
            [fieldId]: selectedValue // Set the selected value for the specific fieldId
        }));
    };

    // Handles changes to form inputs, including checkboxes, text fields, and file uploads
    const handleChange = (e) => {
        const { name, value, type, checked, files } = e.target; // Destructures the event target properties

        // If the input is a 'checkbox-group', manage the selected checkboxes as an array
        if (type === 'checkbox-group') {
            const newValues = formData[name] ? [...formData[name]] : []; // Copy the existing values or initialize an empty array

            if (checked) {
                newValues.push(value); // If checked, add the value to the array
            } else {
                const index = newValues.indexOf(value); // Find the index of the value to remove
                newValues.splice(index, 1); // Remove the value from the array
            }

            // Update formData with the new array of selected checkboxes
            setFormData({
                ...formData, // Spread the previous formData to preserve other fields
                [name]: newValues, // Set the updated array for the checkbox group
            });
        } else {
            // For other input types (checkbox, file, text, etc.), update the formData with the appropriate value
            setFormData({
                ...formData, // Spread the previous formData to preserve other fields
                [name]: type === 'checkbox' ? checked : (type === 'file' ? Array.from(files) : value), // Depending on the input type, set the correct value
            });
        }
    };

    const handleTextEditorChange = (fieldName, value) => {
        setFormData((prevData) => ({
            ...prevData,
            [fieldName]: value,
        }));
    };


    const reorder = (list, startIndex, endIndex) => {
        const result = Array.from(list);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);
        return result;
    };

    const handleDragTableHeader = (result)=>{

        const { destination, source } = result;

        if (!destination) {
            return;
        }

        if (destination.index === source.index) {
            return;
        }

        const reorderedFields = reorder(selectedField?.tableHeaders, source.index, destination.index);
        
        setSelectedField({
            ...selectedField,
            tableHeaders: reorderedFields
        });

        setFields(fields.map((field) =>
            (field.id === selectedField.id ? { ...field, tableHeaders: reorderedFields } : field)
        ));

    }

    const handleDragEnd = (result) => {
        const { destination, source } = result;

        if (!destination) {
            return; // Dropped outside the list
        }

        if (destination.index === source.index) {
            return; // No reorder
        }

        if(steps && steps.length > 0 && steps[activeStep]){

            const currentSection = steps[activeStep];

            const currentStepFields = fields.filter(field => field.section === currentSection);
            const otherFields = fields.filter(field => field.section !== currentSection);

            const reorderedStepFields = reorder(currentStepFields, source.index, destination.index);

            const updatedFields = [
                ...otherFields,
                ...reorderedStepFields, 
            ];

            setFields(updatedFields);

        }else{

            // Reorder the fields
            const reorderedFields = reorder(fields, source.index, destination.index);
            setFields(reorderedFields); // Assuming `setFields` is a function to update the fields' state
        }

    };

    const renderField = (field) => {

        var existingData = null

        if (enable_edit === false && Createdfields && Createdfields.length > 0) {
            existingData = Createdfields.some((element) => element.id === field.id);
        }

        if(field?.name === "field_approval_done_by"){
            return null
        }

        switch (field.type) {
            case "text":
                return (
                    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                        <ShortText
                            key={field.id}
                            field={field}
                            formData={formData} // Passing formData
                            errors=""
                            onChange={handleChange} // Handle changes
                            onFocus={(e) => { setSelectedField(field) }}
                            isFocused={field.label == selectedField.label}
                        />
                        {!existingData &&
                            <button className='formbuilderDeleteIcon' onClick={() => handleFieldDelete(field.label)}>
                                <img src={deleteBtn} />
                            </button>
                        }
                    </div>
                );
            case "texteditor":
                return (
                    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                        <RichTextEditor
                            key={field.id}
                            field={field}
                            formData={formData}
                            errors=""
                            onChange={(html) => handleTextEditorChange(field?.name, html)}
                            onFocus={(currentField) => { setSelectedField(currentField) }}
                            isFocused={field.label == selectedField.label}
                        />
                        {!existingData &&
                            <button className='formbuilderDeleteIcon' onClick={() => handleFieldDelete(field.label)}>
                                <img src={deleteBtn} />
                            </button>
                        }
                    </div>
                );
            case "dropdown_with_add":
                return (
                    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                        <DropdownWithAdd
                            key={field.id}
                            field={field}
                            formData={formData}
                            errors=""
                            onChange={(selectedCode) => handleAutocomplete(field.name, selectedCode)}
                            onAdd={(value)=>dropdownWithAddItem(field, value)}
                            onChangeDropdownInputValue={(value) => 
                                setDropdownInputValue({ ...dropdownInputValue, [field.name]: value })
                            }
                            dropdownInputValue={dropdownInputValue}
                            onFocus={(e) => { setSelectedField(field) }}
                            isFocused={field.label == selectedField.label}
                        />
                        {!existingData &&
                            <button className='formbuilderDeleteIcon' onClick={() => handleFieldDelete(field.label)}>
                                <img src={deleteBtn} />
                            </button>
                        }
                    </div>
                );
            case "number":
                return (
                    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>

                        <NumberField
                            key={field.id}
                            field={field}
                            formData={formData} // Passing formData
                            errors=""
                            onChange={handleChange} // Handle changes
                            onFocus={(e) => { setSelectedField(field) }}
                            isFocused={field.label == selectedField.label}
                        />
                        {!existingData &&
                            <button className='formbuilderDeleteIcon' onClick={() => handleFieldDelete(field.label)}>
                                <img src={deleteBtn} />
                            </button>
                        }
                    </div>
                );

            case "email":
                return (
                    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>

                        <EmailField
                            key={field.id}
                            field={field}
                            formData={formData} // Passing formData
                            errors=""
                            onChange={handleChange} // Handle changes
                            onFocus={(e) => { setSelectedField(field) }}
                            isFocused={field.label == selectedField.label}
                        />
                        {!existingData &&
                            <button className='formbuilderDeleteIcon' onClick={() => handleFieldDelete(field.label)}>
                                <img src={deleteBtn} />
                            </button>
                        }
                    </div>
                );

            case "valuesinput":
                return (
                    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>

                        <ValueRangeField
                            key={field.id}
                            field={field}
                            formData={formData} // Passing formData
                            errors=""
                            onChange={handleChange} // Handle changes
                            onFocus={(e) => { setSelectedField(field) }}
                            isFocused={field.label == selectedField.label}
                        />
                        {!existingData &&
                            <button className='formbuilderDeleteIcon' onClick={() => handleFieldDelete(field.label)}>
                                <img src={deleteBtn} />
                            </button>
                        }
                    </div>
                );
            case "dropdown":
                return (
                    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                        <SelectField
                            key={field.id}
                            field={field}
                            formData={formData}
                            errors={""}
                            onChange={(value) =>
                              handleAutocomplete(field, value.target.value)
                            }
                            onFocus={(e) => { setSelectedField(field) }}
                            isFocused={field.label == selectedField.label}
                        />
                        {!existingData &&
                            <button className='formbuilderDeleteIcon' onClick={() => handleFieldDelete(field.label)}>
                                <img src={deleteBtn} />
                            </button>
                        }
                    </div>
                );

            case "textarea":
                return (
                    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                        <LongText
                            key={field.id}
                            field={field}
                            formData={formData} // Passing formData
                            errors=""
                            onChange={handleChange} // Handle changes
                            onFocus={(e) => { setSelectedField(field) }}
                            isFocused={field.label == selectedField.label}
                        />
                        <button className='formbuilderDeleteIcon' onClick={() => handleFieldDelete(field.label)}>
                            <img src={deleteBtn} />
                        </button>
                    </div>
                );

            case "date":
                return (
                    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                        <DateField
                            key={field.id}
                            field={field}
                            formData={formData} // Passing formData
                            errors=""
                            // onChange={handleChange} // Handle changes
                            onChange={(value) => { handleDropdownChange(field.name, value); setSelectedField(field) }} // Handle change
                            onFocus={(e) => { setSelectedField(field) }}
                            isFocused={field.label == selectedField.label}
                        />
                        {!existingData &&
                            <button className='formbuilderDeleteIcon' onClick={() => handleFieldDelete(field.label)}>
                                <img src={deleteBtn} />
                            </button>
                        }
                    </div>
                );
            case "time":
                return (
                    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                        <TimeField
                            key={field.id}
                            field={field}
                            formData={formData} // Passing formData
                            errors=""
                            onChange={(value) => handleDropdownChange(field.name, value)} // Handle change
                            onFocus={(e) => { setSelectedField(field) }}
                            isFocused={field.label == selectedField.label}
                        />
                        {!existingData &&
                            <button className='formbuilderDeleteIcon' onClick={() => handleFieldDelete(field.label)}>
                                <img src={deleteBtn} />
                            </button>
                        }
                    </div>
                );
            case "datetime":
                return (
                    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                        <DateTimeField
                            key={field.id}
                            field={field}
                            formData={formData} // Passing formData
                            errors=""
                            onChange={(value) => handleDropdownChange(field.name, value)} // Handle change
                            onFocus={(e) => { setSelectedField(field) }}
                            isFocused={field.label == selectedField.label}
                        />
                        {!existingData &&
                            <button className='formbuilderDeleteIcon' onClick={() => handleFieldDelete(field.label)}>
                                <img src={deleteBtn} />
                            </button>
                        }
                    </div>
                );

            case "autocomplete":
                return (
                    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>

                        <AutocompleteField
                            key={field.id}
                            field={field}
                            onFocus={(e) => { setSelectedField(field) }}
                            formData={formData}
                            onChange={(name, selectedCode) => handleAutocomplete(field.name, selectedCode)}
                            isFocused={field.label == selectedField.label}
                        />
                        {!existingData &&
                            <button className='formbuilderDeleteIcon' onClick={() => handleFieldDelete(field.label)}>
                                <img src={deleteBtn} />
                            </button>
                        }
                    </div>
                );

            case "multidropdown":
                return (
                    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>

                        <MultiSelect
                            key={field.id}
                            field={field}
                            formData={formData}
                            onChange={(name, selectedCode) => handleAutocomplete(field.name, selectedCode)}
                            onFocus={(e) => { setSelectedField(field) }}
                            isFocused={field.label == selectedField.label}
                        />
                        {!existingData &&
                            <button className='formbuilderDeleteIcon' onClick={() => handleFieldDelete(field.label)}>
                                <img src={deleteBtn} />
                            </button>
                        }
                    </div>
                );

            case "checkbox":
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                        <CheckboxesBtn
                            key={field.id}
                            field={field}
                            formData={formData}
                            onChange={handleCheckBoxChange}
                            onFocus={(e) => { setSelectedField(field) }}
                            isFocused={field.label == selectedField.label}
                        />
                        {!existingData &&
                            <button className='formbuilderDeleteIcon' onClick={() => handleFieldDelete(field.label)}>
                                <img src={deleteBtn} />
                            </button>
                        }
                    </Box>
                );

            case "tabs":
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                        <TabsComponents
                            key={field.id}
                            field={field}
                            formData={formData}
                            onChange={handleTabChange}
                            onFocus={(e) => { setSelectedField(field) }}
                            isFocused={field.label == selectedField.label}
                        />
                        {!existingData &&
                            <button className='formbuilderDeleteIcon' onClick={() => handleFieldDelete(field.label)}>
                                <img src={deleteBtn} />
                            </button>
                        }
                    </Box>
                );

            case "radio":
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }} key={field.id}>
                        <RadioBtn
                            key={field.id}
                            field={field}
                            formData={formData}
                            onChange={handleDropdownChange}
                            onFocus={(e) => { setSelectedField(field) }}
                            isFocused={field.label == selectedField.label}
                        />
                        {!existingData &&
                            <button className='formbuilderDeleteIcon' onClick={() => handleFieldDelete(field.label)}>
                                <img src={deleteBtn} />
                            </button>
                        }
                    </Box>
                );
            case 'file':
                return (
                    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>

                        <FileInput
                            field={field}
                            onChange={handleFileUploadChange}
                            formData={formData}
                            onFocus={(e) => { setSelectedField(field) }}
                            isFocused={field.label == selectedField.label}
                        />
                        {!existingData &&
                            <button className='formbuilderDeleteIcon' onClick={() => handleFieldDelete(field.label)}>
                                <img src={deleteBtn} />
                            </button>
                        }
                    </div>
                );
            case 'profilepicture':
                return (
                    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>

                        <ProfilePicture
                            field={field}
                            formData={formData}
                            onChange={handleFileUploadChange}
                            onFocus={(e) => { setSelectedField(field) }}
                            isFocused={field.label == selectedField.label}
                        />
                        {!existingData &&
                            <button className='formbuilderDeleteIcon' onClick={() => handleFieldDelete(field.label)}>
                                <img src={deleteBtn} />
                            </button>
                        }
                    </div>
                );
            case 'table':
                return (
                    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>

                        <TableField
                            key={field.id}
                            field={field}
                            formData={formData}
                            onChange={handleTableDataChange}
                            onFocus={(e) => { setSelectedField(field) }}
                            isFocused={field.label == selectedField.label}
                        />
                        {!existingData &&
                            <button className='formbuilderDeleteIcon' onClick={() => handleFieldDelete(field.label)}>
                                <img src={deleteBtn} />
                            </button>
                        }
                    </div>
                );
            case 'divider':
                return (<div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: '16px' }}>
                    <div className='divider'></div>
                    <button className='formbuilderDeleteIcon' onClick={() => handleFieldDelete(field.label)}>
                        <img src={deleteBtn} />
                    </button>
                </div>)
            default:
                return null;
        }
    };

    const handleSave = async () => {

        // create template api
        if (fields.length === 0) {
            toast.warning('Please add at least one field before submitting', {
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

        const alreadyChecked = fields.filter((element) => element.is_primary_field === true);

        if(!alreadyChecked || alreadyChecked.length === 0){
            toast.warning('Please set one of these fields as primary.', {
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

        var emptyLabel = false;
        var emptyOptions = [];
        const updatedFields = fields.filter((field) => field.formType).map((field) => {
            const labelValue = field.label.trim() || ""; // Get the label value
            if (!labelValue || labelValue === '') {
                emptyLabel = true
            }

            if(field.options){
                if(field.options.length > 0){
                    field.options.map((option)=>{
                        if((!option.name || option.name === '') || (!option.code || option.code === '')){
                            if (!emptyOptions.includes(labelValue)) {
                                emptyOptions.push(labelValue);
                            }                            
                        }
                    })
                }else{
                    if (!emptyOptions.includes(labelValue)) {
                        emptyOptions.push(labelValue);
                    }
                }
            }

            return {
                ...field, // Keep all other properties of the field
                searchable: true, // for searching fields from the table
                data_type: 'text', // Update the 'data_type' key with the formType value
            };
        });

        if (emptyLabel) {
            toast.warning('Please Enter Label For All Fields', {
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

        // if(emptyOptions.length > 0){
        //     toast.warning(`Please Enter Name and Code for all options in ${emptyOptions.join(', ')}`, {
        //         position: "top-right",
        //         autoClose: 3000,
        //         hideProgressBar: false,
        //         closeOnClick: true,
        //         pauseOnHover: true,
        //         draggable: true,
        //         progress: undefined,
        //         className: "toast-warning",
        //     });
        //     return;
        // }

        var newFields = [
            ...updatedFields
        ]

        if((module === "others" || module === "ui_case" || module === "pt_case" || module === "eq_case") && !newFields.some(field => field.name === "field_approval_done_by")){
            var newFields = [
                ...newFields, 
                { 
                    type: 'text', 
                    formType: 'text',
                    label: `Approval Done By`, 
                    name: `field_approval_done_by`, 
                    id: `random_${Date.now()}_approval_done_by`, 
                    hide_from_ux : true,
                    table_display_content : true,
                    searchable: true,
                    data_type : 'text',
                    section: steps && steps[activeStep] ? steps[activeStep] : null 
                }
            ];
        }

        if (module === "approval") {
            const fieldsToAdd = [
                {
                    label: `Reference Id`,
                    name: `field_reference_id`
                },
                {
                    label: `Approval Type`,
                    name: `field_approval_type`
                },
                {
                    label: `Module`,
                    name: `field_module`
                },
                {
                    label: `Action`,
                    name: `field_action`
                }
            ];

            fieldsToAdd.forEach(field => {
                const alreadyExists = newFields.some(f => f.name === field.name);
                if (!alreadyExists) {
                    newFields.push({
                        type: 'text',
                        formType: 'text',
                        label: field.label,
                        name: field.name,
                        id: `random_${Date.now()}_${field.name.split('field_')[1]}`,
                        hide_from_ux: true,
                        table_display_content: true,
                        searchable: true,
                        data_type: 'text',
                        section: steps && steps[activeStep] ? steps[activeStep] : null
                    });
                }
            });
        }

        // Log the updated fields array to check the result
        var createTemplatePayload = {
            "template_name": editTemplateDetailsData,
            "template_type": type,
            "template_module": module,
            "link_module": link_module,
            "fields": newFields,
            "paranoid": false
        }

        if(stepper && stepper.length > 0){
            createTemplatePayload = {...createTemplatePayload, no_of_sections : stepper.length, sections: stepper }
        }

        setLoading(true);

        try {

            const createTemplateResponse = await api.post("/templates/createTemplate", createTemplatePayload);

            setLoading(false);

            if (createTemplateResponse && createTemplateResponse.success) {

                toast.success(createTemplateResponse.message || "Template Created Successfully", {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    className: "toast-success",
                    onOpen: () => navigate('/create-profile', { state: { pagination: pagination } })
                });

            } else {
                const errorMessage = createTemplateResponse.message ? createTemplateResponse.message : "Failed to create the template. Please try again.";
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
    };

    const handleTemplateUpdate = async () => {
        if (fields.length === 0) {
            toast.warning('Please add at least one field before submitting', {
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

        const alreadyChecked = fields.filter((element) => element.is_primary_field === true);

        if(!alreadyChecked || alreadyChecked.length === 0){
            toast.warning('Please set one of these fields as primary.', {
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

        var emptyLabel = false;
        var emptyOptions = [];

        const updatedFields = fields
            .filter((field) => field.formType)
            .map((field) => {
                const labelValue = field.label.trim() || ""; // Get the label value

                if (!labelValue) {
                    emptyLabel = true;
                }

                if(field.options){
                    if(field.options.length > 0){
                        field.options.map((option)=>{
                            if((!option.name || option.name === '') || (!option.code || option.code === '')){
                                if (!emptyOptions.includes(labelValue)) {
                                    emptyOptions.push(labelValue);
                                }                            
                            }
                        })
                    }else{
                        if (!emptyOptions.includes(labelValue)) {
                            emptyOptions.push(labelValue);
                        }
                    }
                }

                return {
                    ...field, // Keep all other properties of the field
                    searchable: true, // for searching fields from the table
                    data_type: 'text', // Update the 'data_type' key with the formType value
                };
            });

        if (emptyLabel) {
            toast.warning('Please Enter Label For All Fields', {
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

        // if(emptyOptions.length > 0){
        //     toast.warning(`Please Enter Name and Code for all options in ${emptyOptions.join(', ')} Fields`, {
        //         position: "top-right",
        //         autoClose: 3000,
        //         hideProgressBar: false,
        //         closeOnClick: true,
        //         pauseOnHover: true,
        //         draggable: true,
        //         progress: undefined,
        //         className: "toast-warning",
        //     });
        //     return;
        // }

        var newFields = [
            ...updatedFields
        ]

        if ((module === "others" || module === "ui_case" || module === "pt_case" || module === "eq_case") && !newFields.some(field => field.name === "field_approval_done_by")) {
            var newFields = [
                ...newFields, 
                { 
                    type: 'text', 
                    formType: 'text',
                    label: `Approval Done By`, 
                    name: `field_approval_done_by`, 
                    id: `random_${Date.now()}_approval_done_by`, 
                    hide_from_ux : true,
                    table_display_content : true,
                    searchable: true,
                    data_type : 'text',
                    section: steps && steps[activeStep] ? steps[activeStep] : null 
                }
            ];
        }


        if (module === "approval") {
            const fieldsToAdd = [
                {
                    label: `Reference Id`,
                    name: `field_reference_id`
                },
                {
                    label: `Approval Type`,
                    name: `field_approval_type`
                },
                {
                    label: `Module`,
                    name: `field_module`
                },
                {
                    label: `Action`,
                    name: `field_action`
                }
            ];

            fieldsToAdd.forEach(field => {
                const alreadyExists = newFields.some(f => f.name === field.name);
                if (!alreadyExists) {
                    newFields.push({
                        type: 'text',
                        formType: 'text',
                        label: field.label,
                        name: field.name,
                        id: `random_${Date.now()}_${field.name.split('field_')[1]}`,
                        hide_from_ux: true,
                        table_display_content: true,
                        searchable: true,
                        data_type: 'text',
                        section: steps && steps[activeStep] ? steps[activeStep] : null
                    });
                }
            });
        }

        var updateTemplatePayload = {
            "template_name": editTemplateDetailsData,
            "template_type": type,
            "template_module": module,
            "link_module": link_module,
            "fields": newFields,
            "paranoid": false
        }

        setLoading(true);

        try {
            const updateTemplateResponse = await api.post("/templates/updateTemplate", updateTemplatePayload);
            setLoading(false);

            if (updateTemplateResponse && updateTemplateResponse.success) {

                toast.success(updateTemplateResponse.message || "Template Updated Successfully", {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    className: "toast-success",
                    onOpen: () => navigate('/create-profile', { state: { pagination: pagination } })
                });

            } else {
                toast.error(updateTemplateResponse.message || "Failed to update the template. Please try again.", {
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

    }

    useEffect(() => {
        if (!loadingRender) return;

        const existingData = JSON.parse(sessionStorage.getItem("formData")) || [];
        if (existingData.length > 0) {
            const lastElement = existingData[selectedLength];

            if (lastElement) {
                setSelectedField(lastElement);
            } else {
                console.log('No data found in the Array.');
            }
        } else {
            console.log('No data found.');
        }
    }, [selectedLength, loadingRender]);

    useEffect(() => {
        const existingData = JSON.parse(localStorage.getItem("formData")) || [];
        setSelectedLength(existingData.length - 1);
        setPreviewFormData(existingData);

        getFormFields();
    }, []);

    const getFormFields = async () => {
        // setLoading(true);
        try {
            // const data = await api.post("/siims/getAllFields");
            // setLoading(false);
            // console.log(data.data);

            // if(data && data.success && data.data && data.data.length > 0){
            if(formFields && formFields.length > 0){
                setAllFormFields(formFields);
            }

        } catch (err) {
            // setLoading(false);
            console.log(err);
        }
    }

    const handleNext = () => {
        if(stepper.length > (activeStep + 1)){
            setSelectedField({});
            setActiveStep((prev)=> prev + 1)
        }
    };

    const handleBack = () => {        
        if(activeStep != 0){
            setSelectedField({});
            setActiveStep((prev)=> prev - 1)
        }
    };

    const theme = createTheme({
        components: {
            MuiToggleButton: {
                styleOverrides: {
                    root: {
                        borderRadius: "6px",
                        border: 'none',
                        fontSize: "18px",
                        fontWeight: "600",
                        textTransform: "none",
                        color: "#98A2B3",
                        width: '40px',
                        height: '40px',
                        background: '#EAECF0',
                        "&.Mui-selected": {
                            backgroundColor: "#FFFFFF",
                            color: '#1D2939',
                            boxShadow: '0px 2px 4px 0px #0000001A'
                        },
                        "&:hover": {
                        },
                    },
                },
            },
        },
    });

    const handleSwicthChange = (event, newValue) => {
        if (newValue !== null) {

            // Update the selectedField state to reflect the new checked value for the corresponding name (field)
            setSelectedField({
                ...selectedField, // Preserve other properties in selectedField
                'col': newValue // Update the field with the new newValue value
            });

            // Update the fields array with the new checked value for the field whose id matches selectedField.id
            setFields(fields.map((field) =>
                (field.id === selectedField.id ? { ...field, 'col': newValue } : field) // If id matches, update the field, otherwise leave it unchanged
            ));
        }
    };

    const handleCheckBoxChange = (fieldName, fieldCode, selectedValue) => {
        setFormData(prevData => {
            const updatedField = prevData[fieldName] || [];

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

    var rowCountValue = 0;
    var toggleRenderedOnce = false;

    const getFileIcon = (fileName) => {
        // console.log(fileName, "fileName");

        switch (fileName) {
            case '.pdf':
                return <img src={pdfIcon} />;
            case '.jpg':
            case '.jpeg':
                return <img src={jpgIcon} />;
            case '.png':
            case '.svg':
            case '.gif':
                return <img src={pngIcon} />;
            case '.xls':
            case '.xlsx':
                return <img src={xlsIcon} />;
            case '.csv':
            case '.docx':
            case '.doc':
                return <img src={docIcon} />;
            case '.ppt':
                return <img src={pptIcon} />;
            default:
                return <InsertDriveFileIcon />;
        }
    };

    const handleFormatChange = (newformat) => {

        setFields(fields.map((field) =>
        (field.id === selectedField.id ? {
            ...field,
            'selectedSupportFormat': field.selectedSupportFormat  // check the selectedSupportFormat key is exist
                ? field.selectedSupportFormat.some(format => format.ext === newformat.ext) // check the format ext is already exist in the selectedSupportFormat
                    ? field.selectedSupportFormat.filter(format => format.ext !== newformat.ext) // if exist remove that ext
                    : [...field.selectedSupportFormat, { "name": newformat.name, "ext": newformat.ext }] // if not exist add that ext
                : [{ "name": newformat.name, "ext": newformat.ext }] // selectedSupportFormat key is not exist create one and add ext
        } : field)
        ));

        setSelectedField(prevField => ({
            ...prevField,
            selectedSupportFormat: prevField.selectedSupportFormat // check the selectedSupportFormat key is exist
                ? prevField.selectedSupportFormat.some(format => format.ext === newformat.ext) // check the format ext is already exist in the selectedSupportFormat
                    ? prevField.selectedSupportFormat.filter(format => format.ext !== newformat.ext) // if exist remove that ext
                    : [...prevField.selectedSupportFormat, { "name": newformat.name, "ext": newformat.ext }] // if not exist add that ext
                : [{ "name": newformat.name, "ext": newformat.ext }] // selectedSupportFormat key is not exist create one and add ext
        }));

    }

    const showMasterTable = async () => {

        setLoading(true);

        try {
            const response = await api.post("/templates/getMasterTemplates");
            setLoading(false);

            if (response && response.success) {
                if (response.data && response.data.length > 0) {
                    setMasterModalOptions(response.data);
                } else {
                    setMasterModalOptions([]);
                }
                setMasterModalOpen(true);
            } else {
                const errorMessage = response.message ? response.message : "Failed to get section. Please try again.";
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
        } catch (error) {
            setLoading(false);

            if (error && error.response && error.response.data) {
                toast.error(error.response.data.message ? error.response.data.message : 'Please try again!', {
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

    const tableSaveOptions = async ()=>{
        
        if (selectedMasterOptions && selectedMasterOptions.table) {

            if (selectedMasterOptions.api) {

                if(selectedMasterOptions.is_dependent === "true"){
                    
                    if(selectedMasterOptions.dependent_table && selectedMasterOptions.dependent_table.length > 0){
                        
                        var getTableField = selectedField?.tableHeaders?.filter((field) => selectedMasterOptions.dependent_table.includes(field?.fieldType?.table));

                        if(getTableField.length === 0 || selectedMasterOptions.dependent_table.length !== getTableField.length){
                            toast.warning('Please Check the ' + selectedMasterOptions.dependent_table.join(',') + ' Data Before Getting ' + selectedMasterOptions.table, {
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

                        var emptyValue = false;

                        const fieldData = formData?.[selectedField?.name];

                        const isEmpty = !Array.isArray(fieldData) || fieldData.length === 0 || fieldData.every(item => Object.keys(item).length === 0);

                        if(isEmpty) {
                            toast.warning('Please check the ' + selectedMasterOptions.dependent_table.join(', ') + ' values before getting ' + selectedMasterOptions.table, {
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

                        const apiPayload = getTableField.reduce((payload, field) => {
                            if (fieldData && fieldData[0][field?.header]) {
                                const key = field.fieldType?.table === 'users' ? 'user_id' : `${field.fieldType?.table}_id`;
                                payload[key] = fieldData[0][field?.header];
                            } else {
                                emptyValue = true;
                            }
                            return payload;
                        }, {});

                        if(emptyValue){
                            toast.warning('Please Check the ' + selectedMasterOptions.dependent_table.join(',') + ' values Before Getting ' + selectedMasterOptions.table, {
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
                        setLoading(true);

                        try {
                            var getOptionsValue = await api.post(selectedMasterOptions.api,apiPayload);
                            setLoading(false);

                            var updatedOptions = [];

                            var forignKey = selectedMasterOptions?.table === 'users' ? 'user_id' : selectedMasterOptions?.table + '_id';
                            var attributeKey = selectedMasterOptions?.table === 'users' ? ['name'] : [selectedMasterOptions?.table + '_name'];
                            if (getOptionsValue && getOptionsValue.data) {
    
                                var firstValueId = false

                                updatedOptions = getOptionsValue.data.map((field, i) => {

                                    if (firstValueId === false) {
                                        firstValueId = field[selectedMasterOptions?.table === 'users' ? 'user_id' : selectedMasterOptions?.table + '_id']
                                    }

                                    return {
                                        name: field[selectedMasterOptions?.table === 'users' ? 'name' : selectedMasterOptions?.table + '_name'],
                                        code: field[selectedMasterOptions?.table === 'users' ? 'user_id' : selectedMasterOptions?.table + '_id']
                                    }
                                });
    
                                var userUpdateFields = {
                                    api: selectedMasterOptions.api,
                                    readonlyOption: true,
                                    is_dependent : "true",
                                    dependent_table : selectedMasterOptions.dependent_table,
                                    table: selectedMasterOptions?.table,
                                    options: updatedOptions,
                                    forign_key : forignKey,
                                    attributes : attributeKey
                                }

                                if(showPropsModal){
                                    setPropEditField({
                                        ...propEditField,
                                        fieldType: {
                                            ...propEditField.fieldType,
                                            ...userUpdateFields
                                        }
                                    });
                                    setMasterModalOpen(false);
                                    return;
                                }
    
                            }else{
                                var userUpdateFields = {
                                    api: '',
                                    readonlyOption: false,
                                    is_dependent : "",
                                    table: '',
                                    options: [],
                                    forign_key : "",
                                    attributes : []
                                }

                                if(showPropsModal){
                                    setPropEditField({
                                        ...propEditField,
                                        fieldType: {
                                            ...propEditField.fieldType,
                                            ...userUpdateFields
                                        }
                                    });
                                    setMasterModalOpen(false);
                                    return;
                                }

                            }
                        }catch (error) {
                            setLoading(false);

                            if (error && error.response && error.response.data) {
                                toast.error(error.response.data['message'] ? error.response.data['message'] : 'Need dependent Fields', {
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
                }else{
                    setLoading(true);

                    try {
                        var getOptionsValue = await api.post(selectedMasterOptions.api);
                        setLoading(false);

                        var updatedOptions = []

                        if (getOptionsValue && getOptionsValue.data) {

                            var forignKey = selectedMasterOptions.table === 'users' ? 'user_id' : selectedMasterOptions.table + '_id';
                            var attributeKey = selectedMasterOptions.table === 'users' ? ['name'] : [selectedMasterOptions.table + '_name'];
                            
                            var firstValueId = false;

                            updatedOptions = getOptionsValue.data.map((field, i) => {

                                if (firstValueId === false) {
                                    firstValueId = field[selectedMasterOptions.table === 'users' ? 'user_id' : selectedMasterOptions.table + '_id']
                                }

                                return {
                                    name: field[selectedMasterOptions.table === 'users' ? 'name' : selectedMasterOptions.table + '_name'],
                                    code: field[selectedMasterOptions.table === 'users' ? 'user_id' : selectedMasterOptions.table + '_id']
                                }
                            })

                            var userUpdateFields = {
                                api: selectedMasterOptions.api,
                                readonlyOption: true,
                                is_dependent : "false",
                                table: selectedMasterOptions.table,
                                options: updatedOptions,
                                forign_key : forignKey,
                                attributes : attributeKey
                            }

                            if(showPropsModal){
                                setPropEditField({
                                    ...propEditField,
                                    fieldType: {
                                        ...propEditField.fieldType,
                                        ...userUpdateFields
                                    }
                                });
                                setMasterModalOpen(false);
                                return;
                            }

                        }else{
                            var userUpdateFields = {
                                api: '',
                                readonlyOption: false,
                                is_dependent : "",
                                table: '',
                                options: [],
                                forign_key : "",
                                attributes : []
                            }
                            
                            if(showPropsModal){
                                setPropEditField({
                                    ...propEditField,
                                    fieldType: {
                                        ...propEditField.fieldType,
                                        ...userUpdateFields
                                    }
                                });
                                setMasterModalOpen(false);
                                return;
                            }
                        }
                    }catch (error) {
                        setLoading(false);

                        if (error && error.response && error.response.data) {
                            toast.error(error.response.data['message'] ? error.response.data['message'] : 'Need dependent Fields', {
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
            } else {
                setLoading(true);

                try {

                    var getOptionsValue = await api.post('/templateData/getPrimaryTemplateDataWithoutPagination', { table_name: selectedMasterOptions.table });
                    setLoading(false);

                    if (getOptionsValue && getOptionsValue.success && getOptionsValue.data) {

                        const { data , primaryAttribute} = getOptionsValue.data

                        var forignKey = 'id';
                        var attributeKey = [primaryAttribute || 'id'];
                        
                        var updatedOptions = data.map((templateData) => {

                            var nameKey = Object.keys(templateData).find(
                                key => !['id', 'created_at', 'updated_at'].includes(key)
                            );

                            return {
                                name: nameKey ? templateData[nameKey] : '',
                                code: templateData.id
                            }
                        })

                        var userUpdateFields = {
                            api: '/templateData/getTemplateData',
                            readonlyOption: true,
                            table: selectedMasterOptions.table,
                            options: updatedOptions,
                            forign_key : forignKey,
                            attributes : attributeKey,
                            defaultValue : false
                        }

                        if(showPropsModal){
                            setPropEditField({
                                ...propEditField,
                                fieldType: {
                                    ...propEditField.fieldType,
                                    ...userUpdateFields
                                }
                            });
                            setMasterModalOpen(false);
                            return;
                        }

                    } else {

                        var userUpdateFields = {
                            api: '',
                            readonlyOption: false,
                            table: '',
                            options: [],
                            forign_key : '',
                            attributes : [],
                            defaultValue : false
                        }

                        if(showPropsModal){
                            setPropEditField({
                                ...propEditField,
                                fieldType: {
                                    ...propEditField.fieldType,
                                    ...userUpdateFields
                                }
                            });
                            setMasterModalOpen(false);
                            return;
                        }

                        toast.error('No Data Found', {
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
                    toast.error(error?.response?.data?.['message'] ? error.response.data['message'] : 'Need dependent Fields', {
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

            setMasterModalOpen(false);
        } else {
            toast.error('Check Master Table', {
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

    const handleSaveMasterOptions = async () => {

        if(showPropsModal){
            tableSaveOptions();
            return;
        }

        if (selectedMasterOptions && selectedMasterOptions.table) {

            if (selectedMasterOptions.api) {

                if(selectedMasterOptions.is_dependent === "true"){
                    
                    if(selectedMasterOptions.dependent_table && selectedMasterOptions.dependent_table.length > 0){
                        
                        var getTableField = fields.filter((field) => 
                            selectedMasterOptions.dependent_table.includes(field.table)
                        );

                        if(getTableField.length === 0 || selectedMasterOptions.dependent_table.length !== getTableField.length){
                            toast.warning('Please Check the ' + selectedMasterOptions.dependent_table.join(',') + ' Data Before Getting ' + selectedMasterOptions.table, {
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

                        var emptyValue = false;

                        const apiPayload = getTableField.reduce((payload, field) => {
                            if (formData && formData[field.name]) {
                                const key = field.table === 'users' ? 'user_id' : `${field.table}_id`;
                                payload[key] = formData[field.name];
                            } else {
                                emptyValue = true;
                            }
                            return payload;
                        }, {});

                        if(emptyValue){
                            toast.warning('Please Check the ' + selectedMasterOptions.dependent_table.join(',') + ' values Before Getting ' + selectedMasterOptions.table, {
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
                        setLoading(true);

                        try {
                            var getOptionsValue = await api.post(selectedMasterOptions.api,apiPayload);
                            setLoading(false);

                            var updatedOptions = [];
                            var forignKey = selectedMasterOptions.table === 'users' ? 'user_id' : selectedMasterOptions.table + '_id';
                            var attributeKey = selectedMasterOptions.table === 'users' ? ['name'] : [selectedMasterOptions.table + '_name'];
                            if (getOptionsValue && getOptionsValue.data) {
    
                                var firstValueId = false

                                updatedOptions = getOptionsValue.data.map((field, i) => {

                                    if (firstValueId === false) {
                                        firstValueId = field[selectedMasterOptions.table === 'users' ? 'user_id' : selectedMasterOptions.table + '_id']
                                    }

                                    return {
                                        name: field[selectedMasterOptions.table === 'users' ? 'name' : selectedMasterOptions.table + '_name'],
                                        code: field[selectedMasterOptions.table === 'users' ? 'user_id' : selectedMasterOptions.table + '_id']
                                    }
                                })
    
                                var userUpdateFields = {
                                    api: selectedMasterOptions.api,
                                    readonlyOption: true,
                                    is_dependent : "true",
                                    dependent_table : selectedMasterOptions.dependent_table,
                                    table: selectedMasterOptions.table,
                                    options: updatedOptions,
                                    forign_key : forignKey,
                                    attributes : attributeKey
                                }

                                if(showPropsModal){
                                    setPropEditField({
                                        ...propEditField,
                                        fieldType: {
                                            ...propEditField.fieldType,
                                            ...userUpdateFields
                                        }
                                    });
                                    setMasterModalOpen(false);
                                    return;
                                }
            

                                setFields(fields.map((field) =>
                                    (field.id === selectedField.id ? { ...field, ...userUpdateFields } : field)
                                ));
            
                                setSelectedField((prev) => ({
                                    ...prev,
                                    api: selectedMasterOptions.api,
                                    readonlyOption: true,
                                    options: updatedOptions,
                                    is_dependent : "true",
                                    dependent_table : selectedMasterOptions.dependent_table,
                                    table: selectedMasterOptions.table,
                                    forign_key : forignKey,
                                    attributes : attributeKey
                                }));

                                setFormData(prevData => ({
                                    ...prevData,
                                    [selectedField.name]: firstValueId
                                }));
    
                            }else{
                                var userUpdateFields = {
                                    api: '',
                                    readonlyOption: false,
                                    is_dependent : "",
                                    table: '',
                                    options: [],
                                    forign_key : "",
                                    attributes : []
                                }

                                if(showPropsModal){
                                    setPropEditField({
                                        ...propEditField,
                                        fieldType: {
                                            ...propEditField.fieldType,
                                            ...userUpdateFields
                                        }
                                    });
                                    setMasterModalOpen(false);
                                    return;
                                }
            
                                setFields(fields.map((field) =>
                                    (field.id === selectedField.id ? { ...field, ...userUpdateFields } : field)
                                ));
            
                                setSelectedField((prev) => ({
                                    ...prev,
                                    api: '',
                                    readonlyOption: false,
                                    options: [],
                                    is_dependent : "",
                                    table: '',
                                    forign_key : "",
                                    attributes : []
                                }));
                            }
                        }catch (error) {
                            setLoading(false);

                            if (error && error.response && error.response.data) {
                                toast.error(error.response.data['message'] ? error.response.data['message'] : 'Need dependent Fields', {
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
                }else{
                    setLoading(true);

                    try {
                        var getOptionsValue = await api.post(selectedMasterOptions.api);
                        setLoading(false);

                        var updatedOptions = []

                        if (getOptionsValue && getOptionsValue.data) {

                            var forignKey = selectedMasterOptions.table === 'users' ? 'user_id' : selectedMasterOptions.table + '_id';
                            var attributeKey = selectedMasterOptions.table === 'users' ? ['name'] : [selectedMasterOptions.table + '_name'];
                            
                            var firstValueId = false;

                            updatedOptions = getOptionsValue.data.map((field, i) => {

                                if (firstValueId === false) {
                                    firstValueId = field[selectedMasterOptions.table === 'users' ? 'user_id' : selectedMasterOptions.table + '_id']
                                }

                                return {
                                    name: field[selectedMasterOptions.table === 'users' ? 'name' : selectedMasterOptions.table + '_name'],
                                    code: field[selectedMasterOptions.table === 'users' ? 'user_id' : selectedMasterOptions.table + '_id']
                                }
                            })

                            var userUpdateFields = {
                                api: selectedMasterOptions.api,
                                readonlyOption: true,
                                is_dependent : "false",
                                table: selectedMasterOptions.table,
                                options: updatedOptions,
                                forign_key : forignKey,
                                attributes : attributeKey
                            }

                            if(showPropsModal){
                                setPropEditField({
                                    ...propEditField,
                                    fieldType: {
                                        ...propEditField.fieldType,
                                        ...userUpdateFields
                                    }
                                });
                                setMasterModalOpen(false);
                                return;
                            }
        
                            setFields(fields.map((field) =>
                                (field.id === selectedField.id ? { ...field, ...userUpdateFields } : field)
                            ));
        
                            setSelectedField((prev) => ({
                                ...prev,
                                api: selectedMasterOptions.api,
                                readonlyOption: true,
                                options: updatedOptions,
                                is_dependent : "false",
                                table: selectedMasterOptions.table,
                                forign_key : forignKey,
                                attributes : attributeKey
                            }));

                            setFormData(prevData => ({
                                ...prevData,
                                [selectedField.name]: firstValueId
                            }));

                        }else{
                            var userUpdateFields = {
                                api: '',
                                readonlyOption: false,
                                is_dependent : "",
                                table: '',
                                options: [],
                                forign_key : "",
                                attributes : []
                            }
                            
                            if(showPropsModal){
                                setPropEditField({
                                    ...propEditField,
                                    fieldType: {
                                        ...propEditField.fieldType,
                                        ...userUpdateFields
                                    }
                                });
                                setMasterModalOpen(false);
                                return;
                            }
        
                            setFields(fields.map((field) =>
                                (field.id === selectedField.id ? { ...field, ...userUpdateFields } : field)
                            ));
        
                            setSelectedField((prev) => ({
                                ...prev,
                                api: '',
                                readonlyOption: false,
                                options: [],
                                is_dependent : "",
                                table: '',
                                forign_key : "",
                                attributes : [],
                                defaultValue : false
                            }));
                        }
                    }catch (error) {
                        setLoading(false);

                        if (error && error.response && error.response.data) {
                            toast.error(error.response.data['message'] ? error.response.data['message'] : 'Need dependent Fields', {
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
            } else {
                setLoading(true);

                try {

                    var getOptionsValue = await api.post('/templateData/getPrimaryTemplateDataWithoutPagination', { table_name: selectedMasterOptions.table });
                    setLoading(false);

                    if (getOptionsValue && getOptionsValue.success && getOptionsValue.data) {

                        const { data , primaryAttribute} = getOptionsValue.data

                        var forignKey = 'id';
                        var attributeKey = [primaryAttribute || 'id'];
                        
                        var updatedOptions = data.map((templateData) => {

                            var nameKey = Object.keys(templateData).find(
                                key => !['id', 'created_at', 'updated_at'].includes(key)
                            );

                            // if(attributeKey.length === 0){
                            //     attributeKey = [nameKey]
                            // }

                            return {
                                name: nameKey ? templateData[nameKey] : '',
                                code: templateData.id
                            }
                        })

                        var userUpdateFields = {
                            api: '/templateData/getTemplateData',
                            readonlyOption: true,
                            table: selectedMasterOptions.table,
                            options: updatedOptions,
                            forign_key : forignKey,
                            attributes : attributeKey,
                            defaultValue : false
                        }

                        if(showPropsModal){
                            setPropEditField({
                                ...propEditField,
                                fieldType: {
                                    ...propEditField.fieldType,
                                    ...userUpdateFields
                                }
                            });
                            setMasterModalOpen(false);
                            return;
                        }

                        setFields(fields.map((field) =>
                            (field.id === selectedField.id ? { ...field, ...userUpdateFields } : field)
                        ));

                        setSelectedField((prev) => ({
                            ...prev,
                            options: updatedOptions,
                            table: selectedMasterOptions.table,
                            api: '/templateData/getTemplateData',
                            readonlyOption: true,
                            forign_key : forignKey,
                            attributes : attributeKey,
                            defaultValue : false
                        }));

                    } else {

                        var userUpdateFields = {
                            api: '',
                            readonlyOption: false,
                            table: '',
                            options: [],
                            forign_key : '',
                            attributes : [],
                            defaultValue : false
                        }

                        if(showPropsModal){
                            setPropEditField({
                                ...propEditField,
                                fieldType: {
                                    ...propEditField.fieldType,
                                    ...userUpdateFields
                                }
                            });
                            setMasterModalOpen(false);
                            return;
                        }

                        setFields(fields.map((field) =>
                            (field.id === selectedField.id ? { ...field, ...userUpdateFields } : field)
                        ));

                        setSelectedField((prev) => ({
                            ...prev,
                            options: [],
                            table: '',
                            api: '',
                            readonlyOption: false,
                            forign_key : '',
                            attributes : [],
                            defaultValue : false
                        }));

                        toast.error('No Data Found', {
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
                    toast.error(error?.response?.data?.['message'] ? error.response.data['message'] : 'Need dependent Fields', {
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

            setMasterModalOpen(false);
        } else {
            toast.error('Check Master Table', {
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

    const handleAutocomplete = (fieldId, selectedValue) => {
        setFormData(prevData => ({
            ...prevData, // Spread the previous formData to preserve other fields
            [fieldId]: selectedValue // Set the selected value for the specific fieldId
        }));
    }

    const editTemplateDetails = ()=> {
        setEditTemplateDetailsModal(true);
    }

    const closeEditTemplate = ()=> {
        setEditTemplateDetailsModal(false);
        setEditTemplateDetailsData(previousProfileName);
    }

    const updateTemplateName = ()=> {

        if(!editTemplateDetailsData || editTemplateDetailsData === ''){
            toast.error('Please Check the Template Name', {
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

        setEditTemplateDetailsModal(false);
        setPreviousProfileName(editTemplateDetailsData);
    }

    const changePrimaryValue = (e)=> {
        
        const { name, checked } = e.target;

        if(checked){
            const alreadyChecked = fields.filter((element) => element[name] === true);
    
            if (alreadyChecked && alreadyChecked[0]) {

                var propmtMsg = ''
                if(name === 'duplicateCheck'){
                    propmtMsg = `The field "${alreadyChecked[0].label}" is already marked as duplicate check. Please change that field before make this one as duplicate check.`
                }else if(name === 'tableTabs'){
                    propmtMsg = `The field "${alreadyChecked[0].label}" is already enabled as table tabs. Please change that field before make this one as table tabs`
                }else if(name === 'case_dairy'){
                    propmtMsg = `The field "${alreadyChecked[0].label}" is already enabled as Case Dairy. Please change that field before make this one as Case Dairy`
                }else{
                    propmtMsg = `The field "${alreadyChecked[0].label}" is already marked as primary. Please change that field before make this one as primary.`
                }

                toast.error(propmtMsg, {
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


        setSelectedField({
            ...selectedField,
            [name]: checked
        });

        setFields(fields.map((field) =>
            (field.id === selectedField.id ? { ...field, [name]: checked } : field)
        ));

    }

    const handleDefaultValue = (name, field, code) => {
    
        setSelectedField({ ...field, [name]: code });

        setFields(fields.map((f) =>
            f.id === field.id ? { ...f, [name]: code } : f
        ));
    };

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

        if(field.table){

            var payloadData = {
                table_name : field.table,
                key: field?.attributes?.[0],
                value: value,
                id : field?.id
            }
    
            setLoading(true);
            try {
                const response = await api.post('/templateData/addDropdownSingleFieldValue', payloadData)
    
                setLoading(false);
    
                if (response && response.success && response.data) {
    
                    const {addingValue, options} = response.data;
    
                    setFields(fields.map((f) =>
                        f.id === field.id ? { ...f, options: [...options] } : f
                    ));
    
                    setSelectedField(prev => ({
                        ...prev,
                        options: [...options]
                    }));
    
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

        }else{
            handleOptionChange(field?.options?.length, field, value)
        }

    }

    return (

        <Box sx={{ width: '100%' }} inert={loading ? true : false}>
            {stepper && stepper.length > 0 && (
                <Box px={2} pt={1}>
                    <Stepper className={'stepperWidth_' + stepper.length} sx={{ minWidth: '300px', maxWidth: '100%', justifyContent: 'center' }} activeStep={activeStep} >
                        {stepper.map((label, index) => (
                            <Step className={stepperPercentage && stepperPercentage[label] ? 'Stepper_'+stepperPercentage[label]+'_Percentage stepperPercentage' : ""} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }} key={index} onClick={() => handleStepClick(index)}>
                                <StepLabel>
                                    <div className={` ${stepperPercentage && stepperPercentage[label] ? 'Stepper_'+stepperPercentage[label]+'_Percentage' : ''} stepperHeader`}>{label}</div>
                                    <div style={{display:'none'}} className={` ${stepperPercentage && stepperPercentage[label] ? 'Stepper_'+stepperPercentage[label]+'_Percentage' : ''} stepperCompletedPercentage`}>{stepperPercentage && stepperPercentage[label] ? stepperPercentage[label] : 0}% completed</div>
                                </StepLabel>
                            </Step>
                        ))}
                    </Stepper>
                </Box>
            )}
            <Box mt={stepper && stepper.length > 0 ? 1.2 : 0}>
                <Box bgcolor='#EAECF0' sx={{ overflow: 'hidden' }}>
                    <Grid container bgcolor='#FFFFFF' spacing={2} py={1.5} pr={3} alignItems="center" sx={{ borderBottom: '1px solid #D0D5DD', borderTop: '1px solid #D0D5DD', marginLeft: 0, marginTop: '1px' }}>
                        <Grid item xs={12} md={3} className='pt-0' sx={{display:'flex',alignItems:'center',gap:'6px'}}>
                            <Stack direction="row" sx={{cursor:'pointer'}} display='inline-flex' alignItems='center' gap={'4px'} onClick={() => navigate("/create-profile",{state:{pagination:pagination}})}>
                                <img src='./arrow-left.svg'  />
                                <Typography className='ProfileNameText' variant="h1" align="left">
                                    {editTemplateDetailsData}
                                </Typography>
                            </Stack>
                            { !action && !Createdfields &&
                                <EditIcon sx={{fontSize:'18px',cursor:'pointer'}} onClick={editTemplateDetails} />
                            }
                        </Grid>
                        <Grid item xs={12} md={9} className='pt-0' sx={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingRight: '24px' }}>
                            {/* <Button variant="outlined" className='outlinedBtn' sx={{ textTransform: 'none' }}>Chose old drafts</Button>
                            <Button variant="outlined" className='outlinedBtn' sx={{ textTransform: 'none' }}>Save as drafts</Button> */}
                            {Createdfields && action === 'edit' ?
                                <Button variant="outlined"   
                                sx={{
                                    background: "#0167F8",
                                    borderRadius: "8px",
                                    fontSize: "14px",
                                    fontWeight: "500",
                                    color: "#FFFFFF",
                                    padding: "6px 16px",
                                }}
                                className="Roboto blueButton"
                                onClick={handleTemplateUpdate}>Update template</Button>
                                :
                                <Button variant="outlined"   
                                sx={{
                                    background: "#0167F8",
                                    borderRadius: "8px",
                                    fontSize: "14px",
                                    fontWeight: "500",
                                    color: "#FFFFFF",
                                    padding: "6px 16px",
                                }}
                                className="Roboto blueButton"
                                onClick={handleSave}>Save template</Button>
                            }
                        </Grid>
                    </Grid>
                    <Box p={2} pb={0} sx={{ position: 'relative' }}>
                        <Split
                            sizes={[60, 40]}
                            minSize={100}
                            gutterSize={10}
                            direction="vertical"
                            style={{ height: '90vh' }}
                        >
                            <Box sx={{ backgroundColor: '#F2F4F7', border: '1px solid #D0D5DD', borderTopLeftRadius: '8px', borderTopRightRadius: '8px', height: '50vh', overflow: 'auto' }}>

                                <Grid container sx={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #D0D5DD', borderRadius: '8px' }} p={2}>
                                    <Grid item xs={12} md={8} sx={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            {steps && steps.length > 0 && <Typography className='HighlightedSquare'>
                                                {activeStep + 1}
                                            </Typography>
                                            }
                                            <Typography className='HighlightedText'>
                                                {steps && steps.length ? steps[activeStep] : 'General Detail'}
                                            </Typography>
                                        </Box>
                                        {/* <Box sx={{ display: 'flex', alignItems: 'center', gap: '20px', background: '#F9FAFB', border: '.8px solid #D0D5DD', borderRadius: '6px', padding: '4px 8px' }} px={1}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <img src={Infoicon} />
                                                <Typography className='moreInfoText'>
                                                    For more information
                                                </Typography>
                                            </Box>
                                            <Box sx={{ border: '1px solid #D0D5DD', height: '12px', alignSelf: 'auto' }}></Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <img src={PreviousLog} />
                                                <Typography className='moreInfoText'>
                                                    To check previous logs
                                                </Typography>
                                            </Box>
                                        </Box> */}
                                    </Grid>
                                    {steps && steps.length > 0 && <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'end', alignItems: 'center', gap: '17px' }}>
                                        <Box sx={{display:'flex',alignItems:'center',gap:'12px'}}>
                                            <Button onClick={handleBack} sx={{display:'flex',alignItems:'center',justifyContent:'center',minWidth:'16px'}} > <ArrowBackIosIcon sx={{height:'16px',width:'16px',color:'rgba(0, 0, 0, 0.56)',cursor:'pointer'}} /> </Button>
                                            <Button onClick={handleNext} sx={{display:'flex',alignItems:'center',justifyContent:'center',minWidth:'16px'}} > <ArrowForwardIosIcon sx={{height:'16px',width:'16px',color:'rgba(0, 0, 0, 0.56)',cursor:'pointer'}} /> </Button>
                                        </Box>
                                        {/* <Button onClick={handleBack} className='smallSecondaryBtn' sx={{ textTransform: 'none' }}>
                                            <img src={LeftIcon} />
                                            Back
                                        </Button>
                                        <Button onClick={handleNext} className='fillPrimaryBtn' sx={{ textTransform: 'none' }}>
                                            Next
                                            <img src={RightIcon} />
                                        </Button> */}
                                    </Grid>
                                    }
                                </Grid>

                                {/* <Grid container>
                                    {previewFormData.map((field, index) => {
                                        switch (field.type) {
                                            case 'text':
                                                return (
                                                    <Grid item xs={12} md={6} px={2} py={0.5}>
                                                        <div className='form-field-wrapper_selectedField'>
                                                            <ShortText
                                                                field={field}
                                                                formData={formData}
                                                                errors={null}
                                                                onChange={handleChange}
                                                                onFocus={(e) => { console.log(e); console.log(field); setSelectedField(field) }}
                                                            />
                                                        </div>
                                                    </Grid>
                                                );

                                            case 'number':
                                                return (
                                                    <Grid item xs={12} md={6} px={2} py={0.5}>
                                                        <div className='form-field-wrapper_selectedField'>
                                                            <NumberField
                                                                field={field}
                                                                formData={formData}
                                                                errors={null}
                                                                onChange={handleChange}
                                                            />
                                                        </div>
                                                    </Grid>
                                                );
                                        }
                                    }
                                    )}
                                </Grid> */}

                                <DragDropContext onDragEnd={handleDragEnd}>
                                    <Droppable droppableId="droppableFields" direction="vertical">
                                        {(provided) => (
                                            <Grid
                                                container
                                                ref={provided.innerRef}
                                                alignItems={'center'}
                                                rowSpacing='40px'
                                                p={2}
                                                {...provided.droppableProps}
                                            >
                                            {steps && steps.length > 0 ? fields?.filter(el => el.section === steps[activeStep])?.map((field, index) => {
                                                if (field && field.tabOption) {
                                                    const tabsFields = fields.filter((f) => f.type === 'tabs');
                                                
                                                    const matchingTabsField = tabsFields.find((tabField) => Array.isArray(tabField.options) && tabField.options.some((opt) => opt.code === field.tabOption));
                                                
                                                    if (matchingTabsField) {
                                                        const selectedTabValues = formData[matchingTabsField.name] || [];
                                                
                                                        const isSelected = Array.isArray(selectedTabValues)
                                                            ? selectedTabValues.includes(field.tabOption)
                                                            : selectedTabValues === field.tabOption;
                                                
                                                        if (!isSelected) return null;
                                                    }
                                                }
                                                return (
                                                    <Draggable key={field.id} draggableId={field.id} index={index}>
                                                        {(provided) => (
                                                        <Grid
                                                            item
                                                            xs={field.col ? field.col : 12}
                                                            p={1}
                                                            py={0}
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                        >
                                                            {renderField(field)}
                                                        </Grid>
                                                        )}
                                                    </Draggable>
                                                )
                                            })
                                            : fields.map((field, index) => {

                                                if (field && field.tabOption) {
                                                    const tabsFields = fields.filter((f) => f.type === 'tabs');
                                                
                                                    const matchingTabsField = tabsFields.find((tabField) => Array.isArray(tabField.options) && tabField.options.some((opt) => opt.code === field.tabOption));
                                                
                                                    if (matchingTabsField) {
                                                        const selectedTabValues = formData[matchingTabsField.name] || [];
                                                
                                                        const isSelected = Array.isArray(selectedTabValues)
                                                            ? selectedTabValues.includes(field.tabOption)
                                                            : selectedTabValues === field.tabOption;
                                                
                                                        if (!isSelected) return null;
                                                    }
                                                }
                                            
                                                return (
                                                    <Draggable key={field.id} draggableId={field.id} index={index}>
                                                        {(provided) => (
                                                            <Grid
                                                                item
                                                                xs={field.col ? field.col : 12}
                                                                p={1}
                                                                py={0}
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                            >
                                                                {renderField(field)}
                                                            </Grid>
                                                        )}
                                                    </Draggable>
                                                );
                                            })                                            
                                            }
                                                {provided.placeholder} {/* This is necessary for layout to adjust correctly */}
                                            </Grid>
                                        )}
                                    </Droppable>
                                </DragDropContext>

                                <Box p={3} py={2}>
                                    <CreateField
                                        selectedField={selectedField}
                                        handleFieldSelect={handleFieldSelect}
                                        formFields={allFormFields}
                                        selectedDropdwonField={selectedDropdwonField}
                                        onAddDivider={onAddDivider}
                                    />
                                </Box>

                            </Box>
                            <Box sx={{ backgroundColor: '#FFFFFF', zIndex: '98', position: 'relative' }}>

                                <Box sx={{ maxHeight: '95%', overflow: 'auto' }}>
                                    <div>
                                        {selectedField && (
                                            <Grid container py={2}>
                                                {
                                                    Object.keys(selectedField).map((prop) => {
                                                        // Skip specific field


                                                        const DisplayNoneFields = ['col', 'defaultValue', 'user_hierarchy', 'readonlyOption', 'formType', 'type', 'id', 'selectedSupportFormat', 'api', 'is_dependent', 'section', 'table', 'dependent_table', 'data_type', 'attributes', 'dependentNode', 'forign_key', 'updated_at', 'created_at', 'field_name', 'field_id', 'disableFutureDate', 'disablePreviousDate', 'searchable', 'tabOption'];
                                                        if (DisplayNoneFields.includes(prop)) return null;


                                                        const increment = (prop === 'required' || prop === 'ao_field' || prop === 'case_dairy' || prop === 'tableTabs' || prop === 'disabled' || prop === 'history' || prop === 'minDate' || prop === 'maxDate' || prop === 'multiple' || prop === 'table_display_content' || prop === 'is_primary_field') ? 2 : 5;
                                                        rowCountValue += increment;

                                                        const isRowFull = rowCountValue === 10 && !toggleRenderedOnce;

                                                        if (isRowFull) {
                                                            toggleRenderedOnce = true;
                                                        }

                                                        let rowColValue = (rowCountValue <= 10) ? 5 : 6;
                                                        let colText = '';

                                                        var switchOnChange = handleSwitch;

                                                        if (prop === 'required' || prop === 'ao_field' || prop === 'case_dairy' || prop === 'linkModule' || prop === 'tableTabs' || prop === 'disabled' || prop === 'history' || prop === 'minDate' || prop === 'maxDate' || prop === 'multiple' || prop === 'table_display_content' || prop === 'is_primary_field' || prop === 'duplicateCheck' || prop === 'hide_from_ux' || prop === 'hide_from_edit' || prop === 'particular_case_options') {
                                                            rowColValue = 2;
                                                            colText = (prop === 'required') ? 'Mandatory field' : (prop === 'history') ? 'Enable field history' : 'Disabled';

                                                            if(prop === 'minDate'){
                                                                colText = 'Min Date';
                                                            }else if(prop === 'maxDate'){
                                                                colText = 'Max Date';
                                                            }else if(prop === 'multiple'){
                                                                colText = 'Multiple File'
                                                            }else if(prop === 'table_display_content'){
                                                                colText = 'Display in Table'
                                                            }else if(prop === 'is_primary_field'){
                                                                colText = 'Is Primary';
                                                                switchOnChange = changePrimaryValue;
                                                            }else if(prop === 'duplicateCheck'){
                                                                colText = 'Duplicate Check';
                                                                switchOnChange = changePrimaryValue;
                                                            }else if(prop === 'hide_from_ux'){
                                                                colText = 'Hide in UX'
                                                            }else if(prop === 'hide_from_edit'){
                                                                colText = 'Hide in Edit'
                                                            }else if(prop === 'particular_case_options'){
                                                                colText = 'Particular Case'
                                                            }else if(prop === 'linkModule'){
                                                                colText = 'Link Module'
                                                            }else if(prop === 'ao_field'){
                                                                colText = 'AO'
                                                            }else if(prop === 'tableTabs'){
                                                                colText = 'Enable Tabs'
                                                                switchOnChange = changePrimaryValue;
                                                            }else if(prop === 'case_dairy'){
                                                                colText = 'Case Dairy'
                                                                switchOnChange = changePrimaryValue;
                                                            }
                                                        }

                                                        return (
                                                            <>
                                                                <Grid key={prop} item xs={12} md={rowColValue} px={2} py={1}>
                                                                    {prop === 'col' ? null :
                                                                        prop === 'supportedFormat' ? (
                                                                            <Box px={1}>
                                                                                <p style={{ fontWeight: '500', fontSize: '16px', color: '#1D2939', margin: '0' }} className='Roboto'>Select supported attachments formats</p>
                                                                                <Box py={1} sx={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                                                                    {
                                                                                        selectedField.supportedFormat.map((format) => {
                                                                                            var attachmentIcon = getFileIcon(format.ext);
                                                                                            return (
                                                                                                <Box
                                                                                                    key={format.ext}
                                                                                                    className={`filesupportingformat ${selectedField.selectedSupportFormat.some(selected => selected.ext === format.ext)
                                                                                                        ? 'selected'
                                                                                                        : ''
                                                                                                        }`}
                                                                                                    onClick={() => handleFormatChange(format)}
                                                                                                >
                                                                                                    {attachmentIcon}
                                                                                                    <p className='Roboto' style={{ color: '#1D2939', fontSize: '14px', fontWeight: '500', margin: 0 }}>{format.name}</p>
                                                                                                </Box>
                                                                                            )
                                                                                        })
                                                                                    }
                                                                                </Box>
                                                                            </Box>
                                                                        ) :
                                                                        prop === 'hide_from_ux'|| prop === 'hide_from_edit' || prop === 'ao_field' || prop === 'case_dairy' || prop === 'linkModule' || prop === 'tableTabs' || prop === 'required' || prop === 'disabled' || prop === 'history' || prop === 'minDate' || prop === 'maxDate' || prop === 'multiple' || prop === 'table_display_content' || prop === 'is_primary_field' || prop === 'duplicateCheck' || prop === 'particular_case_options' ? (
                                                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                                                    <Switch name={prop} checked={selectedField[prop]} onChange={switchOnChange} disabled={(prop === 'is_primary_field' && selectedField.options && module !== 'master') ? true : false} />
                                                                                    <Typography pt={1} sx={{ textTransform: 'capitalize', textWrap: 'nowrap' }} className='propsOptionsBtn'>
                                                                                        {colText}
                                                                                    </Typography>
                                                                                </Box>
                                                                            )
                                                                                :
                                                                                prop === 'dependent' ? (
                                                                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                                                        <Switch name={prop} checked={selectedField[prop]} onChange={handleSwitch} />
                                                                                        <Typography pt={1} sx={{ textTransform: 'capitalize', textWrap: 'nowrap' }} className='propsOptionsBtn'>
                                                                                            enable dependent
                                                                                        </Typography>
                                                                                    </Box>
                                                                                )

                                                                                    : (prop === "options") ? (
                                                                                        <Box sx={{ borderBottom: '20px' }}>
                                                                                            <Box sx={{ border: '1px solid #D0D5DD', borderRadius: '8px', background: '#F2F4F7' }}>
                                                                                                <Box p={1} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid #D0D5DD', borderRadius: '8px' }}>
                                                                                                    <Typography sx={{ color: '#475467', fontWeight: '500', fontSize: '16px' }} className='Roboto'>
                                                                                                        Enter dropdown values below
                                                                                                    </Typography>
                                                                                                    <Button onClick={() => deleteAllOptions()} sx={{ color: '#F04438', fontSize: '16px', fontWeight: '500', textTransform: 'none' }} className='Roboto'>
                                                                                                        Delete all
                                                                                                    </Button>
                                                                                                </Box>
                                                                                                <Box py={1} px={2} sx={{ maxHeight: '270px', overflow: 'auto' }}>
                                                                                                    {selectedField.options.length > 0 ? selectedField.options.map((option, index) => (
                                                                                                        <Box py={1} key={index} sx={{ display: "flex", alignItems: "center", gap: '18px' }}>
                                                                                                            <TextField
                                                                                                                label="Option Name"
                                                                                                                disabled={selectedField['readonlyOption'] ? selectedField['readonlyOption'] : false}
                                                                                                                value={option.name}
                                                                                                                onChange={(e) => handleOptionChange(index, selectedField, e.target.value, "name")}
                                                                                                                fullWidth
                                                                                                                required
                                                                                                                size="small" // Default size is "medium"
                                                                                                                margin="dense" // Adjust the margin to control spacing
                                                                                                            />
                                                                                                            <TextField
                                                                                                                label="Option Code"
                                                                                                                disabled
                                                                                                                value={option.code}
                                                                                                                onChange={(e) => handleOptionChange(index, selectedField, e.target.value, "code")}
                                                                                                                fullWidth
                                                                                                                required
                                                                                                                size="small" // Default size is "medium"
                                                                                                                margin="dense" // Adjust the margin to control spacing
                                                                                                            />
                                                                                                            {
                                                                                                                selectedField['defaultValue'] &&
                                                                                                                <Box key={`default_value_${option.code}`}>
                                                                                                                    <Radio
                                                                                                                        name={'defaultValue'}
                                                                                                                        id={`default_value_${option.code}`}
                                                                                                                        value={option.code}
                                                                                                                        checked={selectedField['defaultValue'] === option.code}
                                                                                                                        onChange={() => handleDefaultValue('defaultValue', selectedField, option.code)}
                                                                                                                    />
                                                                                                                    <label style={{color: '#475467', fontSize: '14px', fontWeight: '400'}} htmlFor={`default_value_${option?.code}`}>
                                                                                                                        Default
                                                                                                                    </label>
                                                                                                                </Box>
                                                                                                            }
                                                                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                                                                <button style={{ outline: 'none', border: 'none', color: '#1D2939', padding: '0', display: 'flow', cursor: 'pointer' }} onClick={() => handleRemoveOption(index)}>
                                                                                                                    <RemoveCircleOutlineIcon sx={{ color: '#1D2939' }} />
                                                                                                                </button>
                                                                                                                <button style={{ outline: 'none', border: 'none', color: '#1D2939', padding: '0', display: 'flow', cursor: 'pointer' }} onClick={handleAddOption}>
                                                                                                                    <AddCircleOutlineIcon />
                                                                                                                </button>
                                                                                                            </Box>
                                                                                                        </Box>
                                                                                                    )) :
                                                                                                        <Box py={1} key={0} sx={{ display: "flex", alignItems: "center", gap: '18px' }}>
                                                                                                            <TextField
                                                                                                                label="Option Name"
                                                                                                                disabled={selectedField['readonlyOption'] ? selectedField['readonlyOption'] : false}
                                                                                                                value=''
                                                                                                                onChange={(e) => handleOptionChange(0, selectedField, e.target.value, "name")}
                                                                                                                fullWidth
                                                                                                                required
                                                                                                                size="small" // Default size is "medium"
                                                                                                                margin="dense" // Adjust the margin to control spacing
                                                                                                            />
                                                                                                            <TextField
                                                                                                                label="Option Code"
                                                                                                                disabled
                                                                                                                value=''
                                                                                                                onChange={(e) => handleOptionChange(0, selectedField, e.target.value, "code")}
                                                                                                                fullWidth
                                                                                                                required
                                                                                                                size="small" // Default size is "medium"
                                                                                                                margin="dense" // Adjust the margin to control spacing
                                                                                                            />
                                                                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                                                                <button style={{ outline: 'none', border: 'none', color: '#1D2939', padding: '0', display: 'flow', cursor: 'pointer' }} onClick={() => handleRemoveOption(0)}>
                                                                                                                    <RemoveCircleOutlineIcon sx={{ color: '#1D2939' }} />
                                                                                                                </button>
                                                                                                                <button style={{ outline: 'none', border: 'none', color: '#1D2939', padding: '0', display: 'flow', cursor: 'pointer' }} onClick={handleAddOption}>
                                                                                                                    <AddCircleOutlineIcon />
                                                                                                                </button>
                                                                                                            </Box>
                                                                                                        </Box>
                                                                                                    }
                                                                                                </Box>
                                                                                                <Box p={1} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid #D0D5DD', borderRadius: '4px', gap: '14px', background: '#F2F4F7' }}>
                                                                                                    {/* <Button sx={{ width: '45%', color: '#FFFFFF', fontSize: '16px', fontWeight: '500', textTransform: 'none', borderRadius: '4px', background: '#1570EF', display: 'none' }} className='Roboto'>
                                                                                                        Import data from excel
                                                                                                    </Button>
                                                                                                    <Box sx={{ border: '1px solid #D0D5DD', height: '12px', alignSelf: 'auto' }}></Box> */}
                                                                                                    <Button onClick={showMasterTable} sx={{ width: '100%', color: '#1D2939', fontSize: '16px', fontWeight: '500', textTransform: 'none', border: '1px solid #D0D5DD', borderRadius: '4px' }} className='Roboto'>
                                                                                                        Import from data base
                                                                                                    </Button>
                                                                                                </Box>
                                                                                            </Box>
                                                                                        </Box>
                                                                                    ) : (prop === "tableHeaders") ?
                                                                                        <Box sx={{ borderBottom: '20px' }}>
                                                                                            <Box sx={{ border: '1px solid #D0D5DD', borderRadius: '8px', background: '#F2F4F7' }}>
                                                                                                <Box p={1} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid #D0D5DD', borderRadius: '8px' }}>
                                                                                                    <Typography sx={{ color: '#475467', fontWeight: '500', fontSize: '16px' }} className='Roboto'>
                                                                                                        Enter Table Headers Below
                                                                                                    </Typography>
                                                                                                    <Button onClick={() => deleteAllTableHeaders()} sx={{ color: '#F04438', fontSize: '16px', fontWeight: '500', textTransform: 'none' }} className='Roboto'>
                                                                                                        Delete all
                                                                                                    </Button>
                                                                                                </Box>
                                                                                                <Box py={1} px={2} sx={{ maxHeight: '270px', overflow: 'auto' }}>
                                                                                                    {selectedField.tableHeaders.length > 0 ? (
                                                                                                        <DragDropContext onDragEnd={handleDragTableHeader}>
                                                                                                            <Droppable droppableId="droppableFields" direction="vertical">
                                                                                                            {(provided) => (
                                                                                                                <div {...provided.droppableProps} ref={provided.innerRef}>
                                                                                                                {selectedField.tableHeaders.map((option, index) => (
                                                                                                                    <Draggable key={index} draggableId={`draggable-${index}`} index={index}>
                                                                                                                    {(provided, snapshot) => (
                                                                                                                        <Box
                                                                                                                            py={1}
                                                                                                                            ref={provided.innerRef}
                                                                                                                            {...provided.draggableProps}
                                                                                                                            {...provided.dragHandleProps}
                                                                                                                            sx={{
                                                                                                                                display: "flex",
                                                                                                                                alignItems: "center",
                                                                                                                                gap: '18px',
                                                                                                                                backgroundColor: snapshot.isDragging ? '#f9f9f9' : 'transparent',
                                                                                                                                borderRadius: 1,
                                                                                                                                border: '1px dashed #ccc',
                                                                                                                                padding: '8px',
                                                                                                                            }}
                                                                                                                        >
                                                                                                                            <TextField
                                                                                                                                label="Table Header"
                                                                                                                                disabled={selectedField.readonlyOption || false}
                                                                                                                                value={option.header}
                                                                                                                                onChange={(e) => handleTableHeaderChange(index, selectedField, e.target.value, "header")}
                                                                                                                                fullWidth
                                                                                                                                required
                                                                                                                                size="small"
                                                                                                                                margin="dense"
                                                                                                                            />
                                                                                                                            <FormControl fullWidth size="small" margin="dense">
                                                                                                                                <InputLabel>Field Type</InputLabel>
                                                                                                                                <Select
                                                                                                                                    label="Field Type"
                                                                                                                                    value={option.fieldType?.type || 'short_text'}
                                                                                                                                    onChange={(e) => handleTableHeaderChange(index, selectedField, e.target.value, "type")}
                                                                                                                                >
                                                                                                                                    <MenuItem value="short_text">Short Text</MenuItem>
                                                                                                                                    <MenuItem value="number">Number</MenuItem>
                                                                                                                                    <MenuItem value="date">Date</MenuItem>
                                                                                                                                    <MenuItem value="single_select">Single Select</MenuItem>
                                                                                                                                    <MenuItem value="multi_select">Multi Select</MenuItem>
                                                                                                                                    <MenuItem value="text_area">Text Area</MenuItem>
                                                                                                                                </Select>
                                                                                                                            </FormControl>
                                                                                                                            <TextField
                                                                                                                                label="Width (px)"
                                                                                                                                type="number"
                                                                                                                                value={option.fieldType?.width || ''}
                                                                                                                                onChange={(e) => {
                                                                                                                                const newValue = e.target.value;
                                                                                                                                if (newValue === '' || /^[0-9\b]+$/.test(newValue)) {
                                                                                                                                    handleTableHeaderChange(index, selectedField, newValue, "width")
                                                                                                                                }
                                                                                                                                }}
                                                                                                                                fullWidth
                                                                                                                                size="small"
                                                                                                                                margin="dense"
                                                                                                                            />
                                                                                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                                                                                {(option.fieldType?.type === "single_select" || option.fieldType?.type === "multi_select") && (
                                                                                                                                    <Tooltip title="Add Options">
                                                                                                                                        <IconButton onClick={() => handleOpenPropsModal(index)}>
                                                                                                                                            <VisibilityIcon sx={{ color: '#1D2939' }} />
                                                                                                                                        </IconButton>
                                                                                                                                    </Tooltip>
                                                                                                                                )}
                                                                                                                                <button onClick={() => handleRemoveTableHeaders(index)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                                                                                                                                    <RemoveCircleOutlineIcon sx={{ color: '#1D2939' }} />
                                                                                                                                </button>
                                                                                                                                <button onClick={handleAddTableHeaders} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                                                                                                                                    <AddCircleOutlineIcon />
                                                                                                                                </button>
                                                                                                                            </Box>
                                                                                                                        </Box>
                                                                                                                    )}
                                                                                                                    </Draggable>
                                                                                                                ))}

                                                                                                                {provided.placeholder}
                                                                                                                </div>
                                                                                                            )}
                                                                                                            </Droppable>
                                                                                                        </DragDropContext>
                                                                                                        ) : 
                                                                                                        <Box py={1} key={0} sx={{ display: "flex", alignItems: "center", gap: '18px' }}>
                                                                                                            <TextField
                                                                                                                label="Table Header"
                                                                                                                disabled={selectedField['readonlyOption'] ? selectedField['readonlyOption'] : false}
                                                                                                                value=''
                                                                                                                onChange={(e) => handleTableHeaderChange(0, selectedField, e.target.value, "header")}
                                                                                                                fullWidth
                                                                                                                required
                                                                                                                size="small"
                                                                                                                margin="dense"
                                                                                                            />
                                                                                                            <FormControl fullWidth size="small" margin="dense">
                                                                                                                <InputLabel>Field Type</InputLabel>
                                                                                                                <Select
                                                                                                                    label="Field Type"
                                                                                                                    onChange={(e) => handleTableHeaderChange(0, selectedField, e.target.value, "type")}
                                                                                                                >
                                                                                                                    <MenuItem value="short_text">Short Text</MenuItem>
                                                                                                                    <MenuItem value="number">Number</MenuItem>
                                                                                                                    <MenuItem value="date">Date</MenuItem>
                                                                                                                    <MenuItem value="single_select">Single Select</MenuItem>
                                                                                                                    <MenuItem value="multi_select">Multi Select</MenuItem>
                                                                                                                    <MenuItem value="text_area">Text Area</MenuItem>
                                                                                                                </Select>
                                                                                                            </FormControl>
                                                                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                                                                <button style={{ outline: 'none', border: 'none', color: '#1D2939', padding: '0', display: 'flow', cursor: 'pointer' }} onClick={() => handleRemoveTableHeaders(0)}>
                                                                                                                    <RemoveCircleOutlineIcon sx={{ color: '#1D2939' }} />
                                                                                                                </button>
                                                                                                                <button style={{ outline: 'none', border: 'none', color: '#1D2939', padding: '0', display: 'flow', cursor: 'pointer' }} onClick={handleAddTableHeaders}>
                                                                                                                    <AddCircleOutlineIcon />
                                                                                                                </button>
                                                                                                            </Box>
                                                                                                        </Box>
                                                                                                    }
                                                                                                </Box>
                                                                                            </Box>
                                                                                        </Box>

                                                                                        : (
                                                                                            <TextField
                                                                                                label={prop !== "name" ? prop.charAt(0).toUpperCase() + prop.slice(1) : "DB Name"}
                                                                                                name={prop}
                                                                                                value={selectedField[prop] || ""}
                                                                                                onChange={handlePropertyChange}
                                                                                                helperText={prop === 'label' && 'Length should be 50 characters or less' || ' '}
                                                                                                inputProps={{
                                                                                                    maxLength : prop === 'label' ? 50 : undefined
                                                                                                }}
                                                                                                fullWidth
                                                                                                disabled={prop === "name" ? true : false}
                                                                                                size="small" // Default size is "medium"
                                                                                                margin="none" // Adjust the margin to control spacing
                                                                                            />
                                                                                        )}
                                                                </Grid>
                                                                {isRowFull && (
                                                                    <Grid item xs={2}>
                                                                        <Box p={0} pr={3} sx={{ display: 'flex', justifyContent: 'end' }}>
                                                                            <ThemeProvider theme={theme}>
                                                                                <ToggleButtonGroup
                                                                                    value={selectedField.col ? selectedField.col : '12'}
                                                                                    exclusive
                                                                                    onChange={handleSwicthChange}
                                                                                    className='rowToggleBtnParent'
                                                                                    sx={{
                                                                                        display: "inline-flex",
                                                                                        borderRadius: "6px",
                                                                                        padding: '4px',
                                                                                        background: '#EAECF0',
                                                                                        border: 'none'
                                                                                    }}
                                                                                >
                                                                                    <ToggleButton className='rowToggleBtn' value="12">1</ToggleButton>
                                                                                    <ToggleButton className='rowToggleBtn' value="6">2</ToggleButton>
                                                                                    <ToggleButton className='rowToggleBtn' value="4">3</ToggleButton>
                                                                                </ToggleButtonGroup>
                                                                            </ThemeProvider>
                                                                        </Box>
                                                                    </Grid>
                                                                )}
                                                            </>
                                                        )
                                                    })}
                                                    {selectedField && selectedField?.table === 'users' && (
                                                        <Grid item xs={6} pt={2} pl={3}>
                                                            <h4 className='form-field-heading'>Select User Hierarchy</h4>
                                                            <Box sx={{display: 'flex', alignItems: 'Start', gap: '8px'}}>
                                                                <Box key={`userHierarchyDetailsAll`} sx={{display: 'flex', alignItems: 'center'}}>
                                                                    <Radio
                                                                        name={'user_hierarchy'}
                                                                        id={`userHierarchyDetailsAll`}
                                                                        value={'All'}
                                                                        checked={selectedField?.['user_hierarchy'] === 'All'}
                                                                        onChange={() => handleDefaultValue('user_hierarchy', selectedField, 'All')}
                                                                    />
                                                                    <label style={{color: '#475467', fontSize: '14px', fontWeight: '400', cursor: 'pointer'}} htmlFor={`userHierarchyDetailsAll`}>
                                                                        All
                                                                    </label>
                                                                </Box>
                                                                <Box key={`userHierarchyDetailsHigher`} sx={{display: 'flex', alignItems: 'center'}}>
                                                                    <Radio
                                                                        name={'user_hierarchy'}
                                                                        id={`userHierarchyDetailsHigher`}
                                                                        value={'Higher'}
                                                                        checked={selectedField?.['user_hierarchy'] === 'upper'}
                                                                        onChange={() => handleDefaultValue('user_hierarchy', selectedField, 'upper')}
                                                                    />
                                                                    <label style={{color: '#475467', fontSize: '14px', fontWeight: '400', cursor: 'pointer'}} htmlFor={`userHierarchyDetailsHigher`}>
                                                                        Upper
                                                                    </label>
                                                                </Box>
                                                                <Box key={`userHierarchyDetailsLower`} sx={{display: 'flex', alignItems: 'center'}}>
                                                                    <Radio
                                                                        name={'user_hierarchy'}
                                                                        id={`userHierarchyDetailsLower`}
                                                                        value={'Lower'}
                                                                        checked={selectedField?.['user_hierarchy'] === 'lower'}
                                                                        onChange={() => handleDefaultValue('user_hierarchy', selectedField, 'lower')}
                                                                    />
                                                                    <label style={{color: '#475467', fontSize: '14px', fontWeight: '400', cursor: 'pointer'}} htmlFor={`userHierarchyDetailsLower`}>
                                                                        Lower
                                                                    </label>
                                                                </Box>
                                                            </Box>
                                                        </Grid>
                                                    )}
                                            </Grid>
                                        )}
                                    </div>
                                </Box>

                            </Box>
                        </Split>
                    </Box>
                </Box>

            </Box>
            <Dialog
                open={masterModalOpen}
                onClose={() => setMasterModalOpen(false)}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title"></DialogTitle>
                <DialogContent sx={{ width: '400px' }}>
                    <DialogContentText id="alert-dialog-description">
                        <h4 className='form-field-heading'>Select Masters</h4>
                        <FormControl fullWidth>
                            <Autocomplete
                                id=""
                                options={masterModalOptions}
                                getOptionLabel={(option) => option.table || ''}
                                value={masterModalOptions.find((option) => option.table === (selectedMasterOptions && selectedMasterOptions.table)) || null}
                                onChange={(event, newValue) => setselectedMasterOptions(newValue)}
                                renderInput={(params) =>
                                    <TextField
                                        {...params}
                                        className='selectHideHistory'
                                        label='Masters'
                                    />
                                }
                            />
                        </FormControl>
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ padding: '12px 24px' }}>
                    <Button onClick={() => setMasterModalOpen(false)}>Cancel</Button>
                    <Button className='fillPrimaryBtn' onClick={handleSaveMasterOptions}>Submit</Button>
                </DialogActions>
            </Dialog>

            {editTemplateDetailsModal && 
                <Dialog
                    open={editTemplateDetailsModal}
                    onClose={closeEditTemplate}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} >
                        <Box>
                            Edit Template Name
                        </Box>
                        <IconButton
                            aria-label="close"
                            onClick={closeEditTemplate}
                            sx={{ color: (theme) => theme.palette.grey[500] }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </DialogTitle>
                    <DialogContent sx={{ minWidth: '400px' }}>
                        <DialogContentText pt={3} id="alert-dialog-description">
                            <FormControl fullWidth>
                                <TextField
                                    fullWidth
                                    label="Template name"
                                    name="edit_profile_name"
                                    autoComplete='off'
                                    value={editTemplateDetailsData}
                                    onChange={(e)=>setEditTemplateDetailsData(e.target.value)}
                                    required
                                    helperText={"Length should be 45 characters or less"}
                                    margin='0'
                                    inputProps={{
                                        maxLength: 45,
                                    }}
                                />
                            </FormControl>
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions sx={{ padding: '12px 24px' }}>
                        <Button onClick={closeEditTemplate}>Cancel</Button>
                        <Button className='fillPrimaryBtn' onClick={updateTemplateName}>Update</Button>
                    </DialogActions>
                </Dialog>
            }

            {
                loading &&  <div className='parent_spinner' tabIndex="-1" aria-hidden="true">
                                <CircularProgress size={100} />
                            </div>
            }

            <Dialog open={showPropsModal} onClose={() => setShowPropsModal(false)} maxWidth="md" fullWidth>
                <DialogTitle>Add Options</DialogTitle>
                
                <DialogContent dividers>

                    {(propEditField?.fieldType?.type === "single_select" || propEditField?.fieldType?.type === "multi_select") && (
                        <Box sx={{ borderBottom: '20px' }}>
                            <Box sx={{ border: '1px solid #D0D5DD', borderRadius: '8px', background: '#F2F4F7' }}>
                                <Box p={1} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid #D0D5DD', borderRadius: '8px' }}>
                                    <Typography sx={{ color: '#475467', fontWeight: '500', fontSize: '16px' }} className='Roboto'>
                                        Enter dropdown values below
                                    </Typography>
                                    <Button 
                                        onClick={()=> {
                                            if (propEditField?.fieldType?.api) {
                                                const { api, ...restFieldType } = propEditField.fieldType;

                                                setPropEditField({
                                                    ...propEditField,
                                                    fieldType: {
                                                        ...restFieldType,
                                                        options: []
                                                    }
                                                });

                                            }else{
                                                setPropEditField({
                                                    ...propEditField,
                                                    fieldType: {
                                                        ...propEditField.fieldType,
                                                        options: []
                                                    }
                                                })
                                            }
                                        }} 
                                        sx={{ color: '#F04438', fontSize: '16px', fontWeight: '500', textTransform: 'none' }} className='Roboto'>
                                        Delete all
                                    </Button>
                                </Box>
                                <Box py={1} px={2} sx={{ maxHeight: '270px', overflow: 'auto' }}>
                                    {propEditField?.fieldType?.options?.length > 0 ? propEditField?.fieldType?.options.map((option, index) => (
                                        <Box py={1} key={index} sx={{ display: "flex", alignItems: "center", gap: '18px' }}>
                                            <TextField
                                                label="Option Name"
                                                disabled={propEditField?.fieldType?.['readonlyOption'] ? propEditField?.fieldType?.['readonlyOption'] : false}
                                                value={option.name}
                                                onChange={(e) => {
                                                    const value = e.target.value;

                                                    let updated = [...(propEditField?.fieldType?.options || [])];

                                                    if (!updated[index]) {
                                                        updated[index] = { name: '', code: '' };
                                                    }

                                                    updated[index].name = value;
                                                    updated[index].code = value;

                                                    setPropEditField({
                                                        ...propEditField,
                                                        fieldType: {
                                                            ...propEditField.fieldType,
                                                            options: updated
                                                        }
                                                    });
                                                }}
                                                fullWidth
                                                required
                                                size="small" // Default size is "medium"
                                                margin="dense" // Adjust the margin to control spacing
                                            />
                                            <TextField
                                                label="Option Code"
                                                disabled
                                                value={option.code}
                                                fullWidth
                                                required
                                                size="small" // Default size is "medium"
                                                margin="dense" // Adjust the margin to control spacing
                                            />
                                            <Box key={`default_value_${option.code}`}>
                                                <Radio
                                                    name="defaultValue"
                                                    id={`default_value_${option.code}`}
                                                    value={option.code}
                                                    checked={option.defaultValue === true}
                                                    onChange={() => {
                                                        const updated = (propEditField?.fieldType?.options || []).map((opt, idx) => ({
                                                            ...opt,
                                                            defaultValue: idx === index,
                                                        }));
                                                        setPropEditField({
                                                            ...propEditField,
                                                            fieldType: {
                                                                ...propEditField.fieldType,
                                                                options: updated
                                                            }
                                                        });
                                                    }}
                                                />
                                                <label style={{ color: '#475467', fontSize: '14px', fontWeight: '400' }} htmlFor={`default_value_${option?.code}`}>
                                                    Default
                                                </label>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <button style={{ outline: 'none', border: 'none', color: '#1D2939', padding: '0', display: 'flow', cursor: 'pointer' }} onClick={() => handleTableFieldRemoveOption(index)}>
                                                    <RemoveCircleOutlineIcon sx={{ color: '#1D2939' }} />
                                                </button>
                                                <button 
                                                    style={{ outline: 'none', border: 'none', color: '#1D2939', padding: '0', display: 'flow', cursor: 'pointer' }} 
                                                    onClick={() => {
                                                        const updated = [...(propEditField?.fieldType?.options || []), { name: '', code: '' }];
                                                        setPropEditField({
                                                            ...propEditField,
                                                            fieldType: {
                                                                ...propEditField.fieldType,
                                                                options: updated
                                                            }
                                                        });
                                                    }}
                                                >
                                                    <AddCircleOutlineIcon />
                                                </button>
                                            </Box>
                                        </Box>
                                    )) :
                                        <Box py={1} key={0} sx={{ display: "flex", alignItems: "center", gap: '18px' }}>
                                            <TextField
                                                label="Option Name"
                                                disabled={propEditField?.fieldType?.['readonlyOption'] ? propEditField?.fieldType?.['readonlyOption'] : false}
                                                value=''
                                                onChange={(e) => {
                                                    const value = e.target.value;

                                                    let updated = [...(propEditField?.fieldType?.options || [])];

                                                    if (!updated[0]) {
                                                        updated[0] = { name: '', code: '' };
                                                    }

                                                    updated[0].name = value;
                                                    updated[0].code = value;

                                                    setPropEditField({
                                                        ...propEditField,
                                                        fieldType: {
                                                            ...propEditField.fieldType,
                                                            options: updated
                                                        }
                                                    });
                                                }}
                                                fullWidth
                                                required
                                                size="small"
                                                margin="dense"
                                            />
                                            <TextField
                                                label="Option Code"
                                                disabled
                                                value=''
                                                fullWidth
                                                required
                                                size="small"
                                                margin="dense"
                                            />
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <button style={{ outline: 'none', border: 'none', color: '#1D2939', padding: '0', display: 'flow', cursor: 'pointer' }} onClick={() => handleTableFieldRemoveOption(0)}>
                                                    <RemoveCircleOutlineIcon sx={{ color: '#1D2939' }} />
                                                </button>
                                                <button 
                                                    style={{ outline: 'none', border: 'none', color: '#1D2939', padding: '0', display: 'flow', cursor: 'pointer' }} 
                                                    onClick={() => {
                                                        const updated = [...(propEditField?.fieldType?.options || []), { name: '', code: '' }];
                                                        setPropEditField({
                                                            ...propEditField,
                                                            fieldType: {
                                                                ...propEditField.fieldType,
                                                                options: updated
                                                            }
                                                        });
                                                    }}
                                                >
                                                    <AddCircleOutlineIcon />
                                                </button>
                                            </Box>
                                        </Box>
                                        }
                                    </Box>
                                <Box p={1} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid #D0D5DD', borderRadius: '4px', gap: '14px', background: '#F2F4F7' }}>
                                    <Button onClick={showMasterTable} sx={{ width: '100%', color: '#1D2939', fontSize: '16px', fontWeight: '500', textTransform: 'none', border: '1px solid #D0D5DD', borderRadius: '4px' }} className='Roboto'>
                                        Import from data base
                                    </Button>
                                </Box>
                            </Box>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowPropsModal(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleSaveProps}>Save</Button>
                </DialogActions>
            </Dialog>
    
        </Box>
    );
};

export default Formbuilder;