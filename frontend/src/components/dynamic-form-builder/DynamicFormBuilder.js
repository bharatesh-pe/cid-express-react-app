import { useEffect, useState } from "react";
import { TextField, MenuItem, Select, FormControl, InputLabel, Checkbox, FormControlLabel, Button } from "@mui/material";
import formFields from './formFields.json';
import CreateField from "./CreateField";
import ShortText from "../form/ShortText";

export default function DynamicFormBuilder() {
    const [fields, setFields] = useState([]);
    const [selectedField, setSelectedField] = useState(null);
    const [selectedDropdownField, setSelectedDropdownField] = useState(null);
    const [formData, setFormData] = useState([]);
    const [isPreview, setIsPreview] = useState(false);
    const [selectedMultiValues, setSelectedMultiValues] = useState([]);
    const [selectedValues, setSelectedValues] = useState([]);

    const handleFieldSelect = (e) => {
        if (!e.target || !e.target.value) {
            console.error('Invalid field data', e);
            return;
        }
        const field = e.target.value;
        console.log('Selected field', field);

        // Update the selected field
        setSelectedDropdownField(field);

        const newField = {
            ...field,
            id: `${field.type}-${fields.length}`,
            name: camelize(field.label),
            options: field.options || [],
        };
        setFields([...fields, newField]);  // Add new field to the fields list
        setSelectedField(newField);
    };


    const camelize = (str) => {
        return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (match, index) => (index === 0 ? match.toLowerCase() : match.toUpperCase())).replace(/\s+/g, '');
    };

    const handlePropertyChange = (e) => {
        const { name, value } = e.target;
        setSelectedField({ ...selectedField, [name]: value });
        setFields(fields.map((field) => (field.id === selectedField.id ? { ...field, [name]: value } : field)));
    };

    const handleOptionChange = (index, field, value, type) => {
        const newOptions = [...field.options];
        if (type === "name") {
            newOptions[index].name = value;
        } else {
            newOptions[index].code = value;
        }
        setSelectedField({ ...field, options: newOptions });
        setFields(fields.map((f) => (f.id === field.id ? { ...f, options: newOptions } : f)));
    };

    const handleAddOption = () => {
        const newOption = { name: "", code: "" };
        setSelectedField({ ...selectedField, options: [...selectedField.options, newOption] });
        setFields(fields.map((field) => (field.id === selectedField.id ? { ...field, options: [...field.options, newOption] } : field)));
    };

    const handleRemoveOption = (index) => {
        const newOptions = selectedField.options.filter((_, i) => i !== index);
        setSelectedField({ ...selectedField, options: newOptions });
        setFields(fields.map((field) => (field.id === selectedField.id ? { ...field, options: newOptions } : field)));
    };

    const handleDropdownChange = (fieldId, selectedValue) => {
        setFormData((prevData) => ({
            ...prevData,
            [fieldId]: selectedValue,
        }));
    };

    const handleMultiSelectChange = (e) => {
        setSelectedMultiValues(e.target.value);
        setSelectedValues(e.target.value);
    };

    const handleChipsChange = (e) => {
        setSelectedValues(e.target.value);
        setSelectedMultiValues(e.target.value);
    };

    const handleChipRemove = (removedChip) => {
        const updatedValues = selectedValues.filter((value) => value !== removedChip);
        setSelectedValues(updatedValues);
        setSelectedMultiValues(updatedValues);
    };

    const handleSave = () => {
        console.log("Saved Form Configuration:", fields);
        setFormData(fields);

        const existingData = JSON.parse(sessionStorage.getItem("formData")) || [];
        const updatedData = [...existingData, ...fields];
        sessionStorage.setItem("formData", JSON.stringify(updatedData));

        console.log("Updated Form Configuration stored in sessionStorage:", updatedData);
        setFields([]);
        setSelectedField(null);
    };

    const handleSubmit = (data) => {
        console.log("Submitted Data:", data);
    };

    useEffect(() => {
        const storedFormData = JSON.parse(sessionStorage.getItem("formData")) || [];
        console.log("Retrieved Form Data:", storedFormData);
        setFormData(storedFormData);
    }, []);

    const renderField = (field) => {
        const isRequired = field.required === "true" || field.required === true;
        switch (field.type) {
            case "text":
                return (
                    <ShortText field={field} formData={null} onChange={(e) => console.log(e)} />
                );

            case "dropdown":
                return (
                    <FormControl fullWidth required={isRequired} key={field.id}>
                        <InputLabel>{field.label}</InputLabel>
                        <Select
                            value={formData[field.id] || ""}
                            onChange={(e) => handleDropdownChange(field.id, e.target.value)}
                            label={field.label}
                        >
                            {field.options.map((option) => (
                                <MenuItem key={option.code} value={option.code}>
                                    {option.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                );

            case "textarea":
                return (
                    <TextField
                        key={field.id}
                        label={field.label}
                        name={field.name}
                        value={formData[field.id] || ""}
                        onChange={(e) => handleDropdownChange(field.id, e.target.value)}
                        fullWidth
                        multiline
                        rows={4}
                        required={isRequired}
                    />
                );

            case "date":
                return (
                    <TextField
                        key={field.id}
                        label={field.label}
                        name={field.name}
                        value={formData[field.id] || ""}
                        onChange={(e) => handleDropdownChange(field.id, e.target.value)}
                        fullWidth
                        type="date"
                        InputLabelProps={{
                            shrink: true,
                        }}
                        required={isRequired}
                    />
                );

            case "autocomplete":
                return (
                    <TextField
                        key={field.id}
                        label={field.label}
                        name={field.name}
                        value={formData[field.id] || ""}
                        onChange={(e) => handleDropdownChange(field.id, e.target.value)}
                        fullWidth
                        select
                        required={isRequired}
                    />
                );

            case "checkbox":
                return (
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={formData[field.id] || false}
                                onChange={(e) => handleDropdownChange(field.id, e.target.checked)}
                            />
                        }
                        label={field.label}
                    />
                );

            default:
                return null;
        }
    };

    return (
        <>

            {/* <select
                value={selectedField}
                onChange={handleFieldSelect}
                style={{margin: 20}}
            >
                {formFields.filter((field) => field.formType).map((field, index) => (
                    <option key={index} value={field}>
                        {field.formType}
                    </option>
                ))}
            </select> */}

            <CreateField selectedField={selectedField} selectedDropdownField={selectedDropdownField} handleFieldSelect={handleFieldSelect} formFields={formFields} />

            <form className="col-12 p-0">
                {fields.map((field) => (
                    <div key={field.id} style={{ margin: "10px 0" }}>
                        {renderField(field)}
                    </div>
                ))}
            </form>

            <div>
                {selectedField && (
                    <div className="grid">
                        {Object.keys(selectedField).map((prop) => (
                            <div key={prop} className="col-6">
                                {prop === "options" ? (
                                    <div>
                                        {selectedField.options.map((option, index) => (
                                            <div key={index} style={{ display: "flex", alignItems: "center" }}>
                                                <TextField
                                                    label="Option Name"
                                                    value={option.name}
                                                    onChange={(e) => handleOptionChange(index, selectedField, e.target.value, "name")}
                                                    fullWidth
                                                />
                                                <TextField
                                                    label="Option Code"
                                                    value={option.code}
                                                    onChange={(e) => handleOptionChange(index, selectedField, e.target.value, "code")}
                                                    fullWidth
                                                />
                                                <Button onClick={() => handleRemoveOption(index)} color="secondary">
                                                    Remove
                                                </Button>
                                            </div>
                                        ))}
                                        <Button onClick={handleAddOption} variant="contained">
                                            Add Option
                                        </Button>
                                    </div>
                                ) : (
                                    <TextField
                                        label={prop}
                                        name={prop}
                                        value={selectedField[prop] || ""}
                                        onChange={handlePropertyChange}
                                        fullWidth
                                        disabled={prop === "type"}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Button variant="contained" onClick={handleSave} color="primary">
                Save Form
            </Button>
        </>
    );
}
