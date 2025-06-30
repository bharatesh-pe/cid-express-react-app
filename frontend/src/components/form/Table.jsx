import React, { useEffect, useState } from 'react';
import {
    Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, IconButton, TextField,
    Box,
    Select,
    FormControl,
    MenuItem,
    Checkbox,
    ListItemText
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

    useEffect(() => {
        setHeaders(field.tableHeaders ? { [field.name]: field.tableHeaders } : {});
    }, [field]);

    const [rows, setRows] = useState(() => {
        const data = formData?.[field?.name];
        if (!data) return [{}];
        
        if (typeof data === "string") {
            try {
                console.log("here only");
                
                return JSON.parse(data);
            } catch (err) {
                console.error("Invalid JSON in formData:", err);
                return [{}];
            }
        }

        return data;
    });

    useEffect(()=>{

        setRows(()=>{
            const data = formData?.[field?.name];
            if (!data) return [{}];
            
            if (typeof data === "string") {
                try {
                    console.log("here only");
                    
                    return JSON.parse(data);
                } catch (err) {
                    console.error("Invalid JSON in formData:", err);
                    return [{}];
                }
            }

            return data;
        })

    },[formData])

    const handleCellChange = (rowIndex, key, value) => {
        const updatedRows = [...rows];
        updatedRows[rowIndex] = {
            ...updatedRows[rowIndex],
            [key]: value
        };
        setRows(updatedRows);
        onChange && onChange(field, updatedRows);
    };

    const addRow = () => setRows([...rows, {}]);

    const deleteRow = (index) => {
        const updatedRows = rows.filter((_, i) => i !== index);
        setRows(updatedRows);

        console.log(updatedRows,"updatedRows");

        onChange && onChange(field, updatedRows);
    };

    useEffect(() => {
        const fetchAllOptions = async () => {
            const updatedHeaders = [...headers?.[field?.name]];

            for (let i = 0; i < updatedHeaders.length; i++) {
                const header = updatedHeaders[i];
                if (header?.fieldType?.api) {
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
            <TableContainer component={Paper} sx={{ mt: 2, width: '100%', boxShadow: 'none', border: '1px solid #ddd', borderColor: Boolean(errors?.[field?.name]) ? '#F04438' : '#ddd' }}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{width: '50px'}}>S.No</TableCell>
                            {headers?.[field?.name].map((header, index) => (
                                <TableCell key={index} sx={{ fontWeight: 600 }}>{header.header}</TableCell>
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

                                {headers?.[field?.name].map((header, colIndex) => (
                                    
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
                                                />
                                            )
                                            ||
                                            header?.fieldType?.type === 'single_select' && (
                                                <FormControl fullWidth size="small">
                                                    <Select
                                                        value={row[header.header] || ''}
                                                        disabled={readOnly}
                                                        onChange={(e) => handleCellChange(rowIndex, header.header, e.target.value)}
                                                    >
                                                        {(header.fieldType?.options || []).map((opt, i) => (
                                                            <MenuItem key={i} value={opt.code}>{opt.name}</MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>
                                            )
                                            ||
                                            header?.fieldType?.type === 'multi_select' && (
                                                <FormControl fullWidth size="small">
                                                    <Select
                                                        multiple
                                                        value={row[header.header] || []}
                                                        disabled={readOnly}
                                                        onChange={(e) => handleCellChange(rowIndex, header.header, e.target.value)}
                                                        renderValue={(selected) =>
                                                            (selected || []).map(code => header.fieldType?.options?.find(opt => opt.code === code)?.name || code).join(', ')
                                                        }
                                                    >
                                                        {(header.fieldType?.options || []).map((opt, i) => (
                                                            <MenuItem key={i} value={opt.code} sx={{padding: 0}}>
                                                                <Checkbox checked={(row[header.header] || []).includes(opt.code)} />
                                                                <ListItemText primary={opt.name} />
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>
                                            )
                                        }
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default TableField;
