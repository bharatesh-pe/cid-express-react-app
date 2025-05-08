import React, { useEffect, useState } from "react";
import {
    Box,
    Button,
    CircularProgress,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import api from "../../services/api";
import { toast } from "react-toastify";

const ActTable = ({ formConfig, formData, tableRow, tableFunc, showOrderCopy, readOnly }) => {

    const [loading, setLoading] = useState(false); // State for loading indicator
    const [sectionOptions, setSectionOptions] = useState({});

    const actField = formConfig.find((f) => f.table === "act");
    const sectionField = formConfig.find((f) => f.table === "section");
    
    const roleTitle = JSON.parse(localStorage.getItem("role_title")?.toLowerCase().trim());

    if (roleTitle === "admin organization") {
        if (!actField.ao_field) {
            actField.disabled = true;
            if (actField.required) {
                actField.required = false;
            }
        }
        if (!sectionField.ao_field) {
            sectionField.disabled = true;
            if (sectionField.required) {
                sectionField.required = false;
            }
        }
    } else {
        if (actField.ao_field) {
            actField.disabled = true;
            if (actField.required) {
                actField.required = false;
            }
        }
        if (sectionField.ao_field) {
            sectionField.disabled = true;
            if (sectionField.required) {
                sectionField.required = false;
            }
        }
    }

    const handleActChange = async (index, selectedAct) => {
        const updatedRows = [...tableRow];
        updatedRows[index].act = selectedAct?.code || "";
        updatedRows[index].section = "";
        tableFunc(updatedRows);

        if (sectionField?.api && selectedAct?.code) {
            try {
                const payload = { act_id: selectedAct.code };
                const res = await api.post(sectionField.api, payload);
                const fetchedOptions = res.data.map((item) => ({
                    name: item.section_name || item.name,
                    code: item.section_id || item.id,
                }));

                setSectionOptions((prev) => ({
                    ...prev,
                    [selectedAct.code]: fetchedOptions,
                }));
            } catch (error) {
                toast.error("Failed to load sections", {
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
        updateOrderCopy(updatedRows);
    };

    const handleSectionChange = (index, selectedSections) => {
        const updatedRows = [...tableRow];
        updatedRows[index].section = selectedSections.map(s => s.code);
        tableFunc(updatedRows);
        updateOrderCopy(updatedRows);
    };

    const addRow = () => {
        const isIncomplete = tableRow.some((row) => !row.act || row.act === '' || !row.section || row.section === '' || row.section.length === 0 );
        
        if (isIncomplete) {
            toast.error("Please fill all previous Act and Section fields before adding a new row.", {
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
    
        tableFunc([...tableRow, { act: "", section: "" }]);
    };    

    const deleteRow = (index) => {
        if (tableRow.length > 1) {
            const updatedRows = tableRow.filter((_, i) => i !== index);
            tableFunc(updatedRows);
            updateOrderCopy(updatedRows);
        }
    };


    const updateOrderCopy = (updatedRows, updatedOptions)=>{

        const showSectionNames = ['17a', '17b', '19'];

        const selectedSectionNames = updatedRows.flatMap(row => {

            const actCode = row.act;
            const selectedCodes = row.section || [];

            const availableSections = updatedOptions ? updatedOptions[actCode] : sectionOptions[actCode] || [];
        
            return  selectedCodes.map(code => {
                        const match = availableSections.find(opt => Number(opt.code) === Number(code));
                        return match?.name?.toLowerCase();
                    }).filter(Boolean);
        });

        const isMatching = selectedSectionNames.some(name =>
            showSectionNames.includes(name)
        );
        
        showOrderCopy(!isMatching)
    }

    useEffect(() => {

        if (formData?.['field_act'] && typeof formData?.['field_act'] === 'string') {
            const actCodes = formData['field_act'].split(',').map(code => code.trim());
            const sectionCodes = formData['field_section']?.split(',').map(code => code.trim()) || [];
    
            const newRows = actCodes.map((act) => ({
                act,
                section: [],
            }));
    
            const fetchSectionsForActs = async () => {
                let updatedRows = [...newRows];
                var updatedOptions = {};
                for (let i = 0; i < actCodes.length; i++) {
                    const actCode = Number(actCodes[i]);
                    setLoading(true);
                    try {
                        const res = await api.post(sectionField.api, { act_id: actCode });
                        setLoading(false);
                        const fetchedOptions = res.data.map((item) => ({
                            name: item.section_name || item.name,
                            code: item.section_id || item.id,
                        }));
    
                        updatedOptions = {
                            ...updatedOptions,
                            [actCode]: fetchedOptions,
                        }
    
                        const matchedCodes = fetchedOptions
                            .filter(opt => sectionCodes.includes(String(opt.code)))
                            .map(opt => String(opt.code));
    
                        updatedRows[i].section = matchedCodes;

                    } catch (error) {
                        setLoading(false);
                        console.log(`Error ${actCode}`, error);
                    }
                }

                setSectionOptions(updatedOptions);    
                tableFunc(updatedRows);
                updateOrderCopy(updatedRows, updatedOptions);
            };
    
            fetchSectionsForActs();
        }
    }, [formData]);

    return (
        <Box>
            <Table size="small" aria-label="a dense table">
                <TableHead>
                    <TableRow>
                        <TableCell sx={{width: '70px', color: actField.disabled && '#00000050'}}>S. No</TableCell>
                        <TableCell sx={{width: '50%', color: actField.disabled && '#00000050'}}>Act</TableCell>
                        <TableCell sx={{width: '50%', color: actField.disabled && '#00000050'}}>Section</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {tableRow.map((row, index) => {

                        const selectedActCodes = tableRow.map(r => r.act).filter(Boolean);

                        const availableActs = actField?.options?.filter(opt =>
                            !selectedActCodes.includes(opt.code) || opt.code === row.act
                        ) || [];
                        
                        const availableSections = sectionOptions[row.act] || [];

                        const selectedAct = availableActs.find(
                            (opt) => Number(opt.code) === Number(row.act)
                        );
                        
                        const selectedSection = availableSections.filter((opt) =>
                            Array.isArray(row.section) ? row.section.map(Number).includes(Number(opt.code)) : false
                        );

                        return (
                            <TableRow key={index}>
                                <TableCell>
                                    <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'start', gap: '6px'}}>
                                        {index + 1}
                                        
                                        {tableRow.length > 0 && (
                                            <Button disabled={actField.disabled || readOnly} sx={{padding: '0', minWidth: '0 !important'}}>
                                                <DeleteIcon sx={{color:(actField.disabled || readOnly) ? '#ccc' : 'red', cursor: 'pointer'}} onClick={()=>deleteRow(index)} />
                                            </Button>
                                        )}
                                        {index === tableRow.length - 1 && (
                                            <Button disabled={actField.disabled || readOnly} sx={{padding: '0', minWidth: '0 !important'}} >
                                                <AddIcon sx={{color:(actField.disabled || readOnly) ? '#ccc' :'blue', cursor: 'pointer'}} onClick={addRow} />
                                            </Button>
                                        )}
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Autocomplete
                                        fullWidth
                                        options={availableActs}
                                        value={selectedAct || null}
                                        getOptionLabel={(opt) => opt.name || ""}
                                        onChange={(_, value) =>
                                            handleActChange(index, value)
                                        }
                                        disabled={actField.disabled || readOnly}
                                        renderInput={(params) => (
                                            <TextField {...params} />
                                        )}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Autocomplete
                                        multiple
                                        fullWidth
                                        options={availableSections}
                                        value={selectedSection || []}
                                        getOptionLabel={(opt) => opt.name || ""}
                                        onChange={(_, values) =>
                                            handleSectionChange(index, values)
                                        }
                                        disabled={sectionField?.disabled || !row.act || readOnly}
                                        renderInput={(params) => (
                                            <TextField {...params} />
                                        )}
                                    />
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>

            {loading && (
                <div className="parent_spinner" tabIndex="-1" aria-hidden="true">
                    <CircularProgress size={100} />
                </div>
            )}

        </Box>
    );
};

export default ActTable;
