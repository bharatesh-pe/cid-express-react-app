import * as React from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import textToSnakecase from './textformater';
import { FormHelperText, Tooltip } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import HistoryIcon from '@mui/icons-material/History';

export default function AutocompleteField({ formData, errors, field, onFocus, isFocused, onChange, onHistory, value, disabled }) {

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
            {field.heading && <h4 className='form-field-heading'>{field.heading}</h4>}
            <Autocomplete
                disablePortal
                options={field.options}
                disabled={disabled ||field.disabled === true}
                getOptionLabel={(option) => option.name || ''}
                value={field.options.find((option) => String(option.code) === String(formData?.[field.name])) || null} // FIX HERE
                onChange={(event, newValue) => {
                    if (newValue) {
                        onChange(field.name, newValue.code);
                    } else {
                        onChange(field.name, null);
                    }
                }}
                renderInput={(params) =>
                    <TextField
                        {...params}
                        className='selectHideHistory'
                        error={errors && errors[field.name] && Boolean(errors[field.name])}  // Use Boolean to convert error to true or false
                        label={
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
                        }
                    />
                }
                sx={{
                    '& .MuiOutlinedInput-root': {
                        // backgroundColor: '#fff', // Inner input background color
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                        borderWidth: isFocused ? '2px' : '1px', // Apply border width based on focus
                        borderColor: isFocused ? '#1570EF' : errors && errors[field.name] && Boolean(errors[field.name]) ? '#F04438' : '#D0D5DD', // Apply border color based on focus
                        boxShadow: isFocused ? '0px 0px 0px 3px #D1E9FF' : 'none', // Apply shadow based on focus
                    },
                }}
                onFocus={onFocus}
                focused={isFocused || false}
            //name={textToSnakecase(field.label)}
            />
            <FormHelperText sx={{ color: errors?.[field?.name] ? '#F04438' : '' }}>
                {errors?.[field?.name] || field?.supportingText || ''}
            </FormHelperText>
        </Box>
    );
}