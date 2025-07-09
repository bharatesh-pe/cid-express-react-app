import React, { useEffect, useRef, useState } from 'react';
import {
    Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, IconButton, TextField,
    Box,
    Select,
    FormControl,
    MenuItem,
    Checkbox,
    ListItemText,
    Autocomplete,
    FormHelperText
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

import HistoryIcon from '@mui/icons-material/History';
import InfoIcon from '@mui/icons-material/Info';
import { Tooltip } from '@mui/material';
import api from '../../services/api';

const TableField = ({ field, onChange, errors, readOnly, formData, onFocus, isFocused }) => {

    const [headers, setHeaders] = useState(field.tableHeaders ? { [field.name]: field.tableHeaders } : {});
    const [focusedCell, setFocusedCell] = useState({ row: null, col: null });

    const [dependentOptions, setDependentOptions] = useState({});

    useEffect(() => {
        setHeaders(field.tableHeaders ? { [field.name]: field.tableHeaders } : {});
    }, [field]);

    const [rows, setRows] = useState(() => {
        const data = formData?.[field?.name];
        if (!data) return [{}];
        
        if (typeof data === "string") {
            try {
                return JSON.parse(data);
            } catch (err) {
                console.error("Invalid JSON in formData:", err);
                return [{}];
            }
        }

        return data;
    });

    const initialized = useRef(false);

    useEffect(() => {
        if (initialized.current) return;

        const data = formData?.[field?.name];

        let newRows = [];

        if (!data || Array.isArray(data) && data.length === 0) {
            const defaultRow = {};

            field?.tableHeaders?.forEach(header => {
                const defaultOpt = header?.fieldType?.options?.find(opt => opt.defaultValue === true);
                if (defaultOpt) {
                    defaultRow[header.header] = header.fieldType?.type === 'multi_select' ? [defaultOpt.code] : defaultOpt.code;
                }
            });

            newRows = [defaultRow];
        } else if (typeof data === "string") {
            try {
                initialized.current = true;
                newRows = JSON.parse(data);
            } catch (err) {
                newRows = [{}];
            }
        } else {
            initialized.current = true;
            newRows = data;
        }

        if(formData){
            headers?.[field?.name].map((header)=>{

                if(header?.fieldType?.is_dependent === "true" && header?.fieldType?.dependent_table){
                    const dependentTable = headers?.[field?.name]?.find((t) => Array.isArray(header?.fieldType?.dependent_table) && header.fieldType.dependent_table.includes(t.fieldType.table));

                    if(dependentTable){
                        newRows.forEach((row, rowIndex) => {
                            const rowData = row[dependentTable.header];
                            if (rowData) {
                                fetchDependentOptions(dependentTable, rowData, rowIndex);
                            }
                        });
                    }
                }

            });
        }

        setRows(newRows);
        onChange(field, newRows);
    }, [formData]);

    const handleCellChange = (rowIndex, key, value) => {
        const updatedRows = [...rows];
        updatedRows[rowIndex] = {
            ...updatedRows[rowIndex],
            [key]: value
        };
        setRows(updatedRows);
        onChange && onChange(field, updatedRows);
    };

    const addRow = () => {
        const defaultRow = {};
        let defaultRowHeader = false;
        let defaultRowValue = false;

        field?.tableHeaders?.forEach(header => {
            const defaultOpt = header?.fieldType?.options?.find(opt => opt.defaultValue === true);
            if (defaultOpt) {
                defaultRowValue = header.fieldType?.type === 'multi_select' ? [defaultOpt.code] : defaultOpt.code;;
                defaultRowHeader = header;
                defaultRow[header.header] =  header.fieldType?.type === 'multi_select' ? [defaultOpt.code] : defaultOpt.code;
            }
        });

        const updatedRows = [...rows, defaultRow];
        setRows(updatedRows);
        onChange && onChange(field, updatedRows);

        if(defaultRowHeader){
            fetchDependentOptions(defaultRowHeader, defaultRowValue, updatedRows.length - 1);
        }

    };

    const deleteRow = (index) => {
        const updatedRows = rows.filter((_, i) => i !== index);

        const newDependentOptions = {};
        Object.keys(dependentOptions).forEach((key) => {
            const [rowStr, fieldName] = key.split("_");
            const rowIndex = parseInt(rowStr, 10);

            if (rowIndex < index) {
                newDependentOptions[key] = dependentOptions[key];
            } else if (rowIndex > index) {
                const newKey = `${rowIndex - 1}_${fieldName}`;
                newDependentOptions[newKey] = dependentOptions[key];
            }
        });

        setRows(updatedRows);
        setDependentOptions(newDependentOptions);
        onChange && onChange(field, updatedRows);
    };

    useEffect(() => {
        const fetchAllOptions = async () => {
            const updatedHeaders = [...headers?.[field?.name]];

            for (let i = 0; i < updatedHeaders.length; i++) {
                const header = updatedHeaders[i];
                if (header?.fieldType?.api) {

                    if(header?.fieldType?.is_dependent === "true" && header?.fieldType?.dependent_table){
                        updatedHeaders[i] = {
                            ...header,
                            fieldType: {
                                ...header.fieldType,
                                options: []
                            }
                        };
                        continue;
                    }

                    try {
                        const payload = {
                            table_name: header?.fieldType?.table
                        };

                        const response = await api.post(header?.fieldType?.api, payload);
                        const { data } = response;

                        var updatedOptions = []

                        if(header?.fieldType?.api === "/templateData/getTemplateData"){
                            updatedOptions = data.map((option) => {

                                var nameKey = Object.keys(option).find(
                                    key => !['id', 'created_at', 'updated_at'].includes(key)
                                );

                                return {
                                    name: nameKey ? option[nameKey] : '',
                                    code: option.id
                                }
                            })
                        }else{
                            updatedOptions = data.map((option) => {
                                return {
                                    name: option[header?.fieldType?.table === 'users' ? 'name' : header?.fieldType?.table + '_name'],
                                    code: option[header?.fieldType?.table === 'users' ? 'user_id' : header?.fieldType?.table + '_id']
                                }
                            })
                        }
                        
                        updatedHeaders[i] = {
                            ...header,
                            fieldType: {
                                ...header.fieldType,
                                options: updatedOptions
                            }
                        };

                    } catch (error) {
                        console.error(`Error fetching for ${header?.fieldType?.api}:`, error);
                    }
                }
            }

            setHeaders((prev) => ({
                ...prev,
                [field.name]: updatedHeaders
            }));
        };

        fetchAllOptions();
    }, []);

    const fetchDependentOptions = async (header, rowData, rowIndex) => {
        const { table: tableName, forign_key } = header.fieldType;
        
        if(!tableName || !rowData || !forign_key){
            return false;
        }

        const dependentTable = headers?.[field?.name]?.find((t) => Array.isArray(t?.fieldType?.dependent_table) && t.fieldType.dependent_table.includes(tableName));

        if (!dependentTable){
            console.log("dependentTable not found for table:", tableName);
            return;
        } 

        const { api: apiPath, table } = dependentTable.fieldType;
        
        const payload = {
            table_name: table,
            [forign_key]: rowData
        }

        try {
            const response = await api.post(apiPath, payload);

            const data = response.data;

            var updatedOptions = [];

            if (apiPath === "/templateData/getTemplateData") {
                updatedOptions =  data.map(option => {
                    const nameKey = Object.keys(option).find(k => !['id', 'created_at', 'updated_at'].includes(k));
                    return {
                        name: nameKey ? option[nameKey] : '',
                        code: option.id
                    };
                });
            } else {
                updatedOptions = data.map(option => ({
                    name: option[table === 'users' ? 'name' : `${table}_name`],
                    code: option[table === 'users' ? 'user_id' : `${table}_id`]
                }));
            }

            const updatedHeaders = [...headers[field.name]];
            const depIndex = updatedHeaders.findIndex(h => h.header === dependentTable.header);

            if (depIndex !== -1) {
                updatedHeaders[depIndex] = {
                    ...updatedHeaders[depIndex],
                    fieldType: {
                        ...updatedHeaders[depIndex].fieldType,
                        options: updatedOptions
                    }
                };

                setHeaders((prev) => ({
                    ...prev,
                    [field.name]: updatedHeaders
                }));
            }

            setDependentOptions(prev => ({
                ...prev,
                [`${rowIndex}_${dependentTable.header}`]: updatedOptions
            }));

        } catch (error) {
            console.error(`Error fetching dependent options:`, error);
            return [];
        }
    };
        
    if (!headers?.[field?.name] || headers[field.name].length === 0){
        return <p style={{ color: '#333', textAlign: 'center', width: '100%', fontWeight: 500 }}>No Table Headers. </p>;
    }
    
    return (
        <Box width={'100%'} onClick={onFocus && onFocus}>
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
                </div>
            </h4>
            <TableContainer component={Paper} sx={{ mt: 2, width: '100%', overflowX: 'auto', boxShadow: 'none', border: '1px solid #ddd', borderColor: '#ddd' }}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{width: '50px'}}>S.No</TableCell>
                            {headers?.[field?.name].map((header, index) => (
                                <TableCell 
                                    key={index} 
                                    sx={{
                                        minWidth: header.fieldType?.width ? `${header.fieldType.width}px` : '120px',
                                        maxWidth: header.fieldType?.width ? `${header.fieldType.width}px` : '300px',
                                    }}
                                >
                                    <Tooltip title={header.header} arrow placement="top">
                                        <span style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'inline-block', maxWidth: '100%' }}>
                                            {header.header}
                                        </span>
                                    </Tooltip>
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.map((row, rowIndex) => (
                            <TableRow key={rowIndex}>

                                <TableCell>
                                    <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'start'}}>
                                        { rowIndex + 1 }
                                        {
                                            rows.length > 1 &&
                                            <IconButton disabled={readOnly} onClick={() => deleteRow(rowIndex)} color="error">
                                                <DeleteIcon />
                                            </IconButton>
                                        }
                                        {rowIndex === rows.length - 1 && (
                                            <IconButton disabled={readOnly} onClick={addRow} color="primary">
                                                <AddIcon />
                                            </IconButton>
                                        )}
                                    </Box>
                                </TableCell>

                                {headers?.[field?.name].map((header, colIndex) => {

                                    let options = header.fieldType?.options || [];

                                    if(header?.fieldType?.is_dependent === "true" && header?.fieldType?.dependent_table){
                                        options = dependentOptions[`${rowIndex}_${header.header}`] || [];
                                    }

                                    return (
                                    <TableCell key={colIndex}>
                                        {

                                            (header?.fieldType?.type === 'short_text' || header?.fieldType?.type === 'text_area') && (
                                                <TextField
                                                    variant="outlined"
                                                    size="small"
                                                    fullWidth
                                                    value={row[header.header] || ''}
                                                    disabled={readOnly}
                                                    onChange={(e) => handleCellChange(rowIndex, header.header, e.target.value)}
                                                    multiline={header?.fieldType?.type === 'text_area'}
                                                    rows={header?.fieldType?.type === 'text_area' && focusedCell.row === rowIndex && focusedCell.col === colIndex ? 6 : 1}
                                                    onFocus={() => setFocusedCell({ row: rowIndex, col: colIndex })}
                                                    onBlur={() => setFocusedCell({ row: null, col: null })}
                                                    error={Boolean(errors?.[field?.name]) && !row[header.header]}
                                                />
                                            )
                                            ||
                                            header?.fieldType?.type === 'number' && (
                                                <TextField
                                                    variant="outlined"
                                                    size="small"
                                                    fullWidth
                                                    value={row[header.header] || ''}
                                                    disabled={readOnly}
                                                    onChange={(e) => {
                                                        const newValue = e.target.value;
                                                        if (newValue === '' || /^[0-9\b]+$/.test(newValue)) {
                                                            handleCellChange(rowIndex, header.header, newValue);
                                                        }
                                                    }}
                                                    inputProps={{ inputMode: 'numeric' }}
                                                    error={Boolean(errors?.[field?.name]) && !row[header.header]}
                                                />
                                            ) 
                                            ||
                                            header?.fieldType?.type === 'date' && (
                                                <TextField
                                                    type="date"
                                                    size="small"
                                                    fullWidth
                                                    value={row[header.header] || ''}
                                                    disabled={readOnly}
                                                    onChange={(e) => handleCellChange(rowIndex, header.header, e.target.value)}
                                                    error={Boolean(errors?.[field?.name]) && !row[header.header]}
                                                />
                                            )
                                            ||
                                            header?.fieldType?.type === 'single_select' && (
                                                <FormControl fullWidth size="small" error={Boolean(errors?.[field?.name]) && !row[header.header]}>
                                                    <Select
                                                        value={row[header.header] || ''}
                                                        disabled={readOnly}
                                                        onChange={(e) => {
                                                            fetchDependentOptions(header, e.target.value, rowIndex);
                                                            handleCellChange(rowIndex, header.header, e.target.value);
                                                        }}
                                                    >
                                                        {(options || []).map((opt, i) => (
                                                            <MenuItem key={i} value={opt.code}>{opt.name}</MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>
                                            )
                                            ||
                                            header?.fieldType?.type === 'multi_select' && (
                                                <FormControl fullWidth size="small" error={Boolean(errors?.[field?.name]) && (!row[header.header] || row[header.header].length === 0)}>
                                                    <Autocomplete
                                                        multiple
                                                        disableCloseOnSelect
                                                        options={options || []}
                                                        getOptionLabel={(option) => option.name}
                                                        value={
                                                            (row[header.header] || []).map(code =>options?.find(opt => opt.code === code)).filter(Boolean)
                                                        }
                                                        onChange={(_, newValue) => {
                                                            const codes = newValue.map(opt => opt.code);
                                                            fetchDependentOptions(header, codes, rowIndex);
                                                            handleCellChange(rowIndex, header.header, codes);
                                                        }}
                                                        limitTags={2}
                                                        renderInput={(params) => (
                                                            <TextField
                                                                {...params}
                                                                variant="outlined"
                                                                size="small"
                                                                fullWidth
                                                            />
                                                        )}
                                                        disabled={readOnly}
                                                    />
                                                </FormControl>
                                            )
                                        }
                                    </TableCell>
                                )}
                            )}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default TableField;
