import * as React from 'react';
import dayjs from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { Box, FormHelperText, Tooltip } from '@mui/material';
import './ShortText.css';
import InfoIcon from '@mui/icons-material/Info';
import HistoryIcon from '@mui/icons-material/History';

export default function TimeField({ field, formData, errors, onChange, onFocus, isFocused, onHistory }) {
    // Ensure the value is a valid date or null if no date is selected
    const selectedDate = formData && formData[field.name]
        ? dayjs(formData[field.name]) // Convert to dayjs object
        : null; // Set to null if empty or undefined

    // Ensure minDate and maxDate are dayjs objects (if provided)
    const minDate = field?.minDate ? dayjs(field.minDate) : null; // Ensure minDate is valid dayjs
    const maxDate = field?.maxDate ? dayjs(field.maxDate) : null; // Ensure minDate is valid dayjs
    // const maxDate = dayjs().endOf('day'); // Use current date as the max date, setting the end of the day

    return (
        <div style={{ width: '100%' }}>
            {/* onFocus={onFocus} */}
            {/* onClick={onFocus} */}
            <LocalizationProvider dateAdapter={AdapterDayjs}  >
                {field.heading && <h4 className={`form-field-heading ${field.disabled ? 'disabled' : ''}`}>{field.heading}</h4>}
                <Box sx={{ width: '100%' }} >
                    <TimePicker
                        error={Boolean(errors?.[field?.name])}  // Use Boolean to convert error to true or false
                        className='selectHideHistory'
                        label={
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
                        }
                        name={field.name}
                        value={selectedDate}
                        onChange={(e) => {
                            console.log('Selected Date:', e);
                            onChange(e ? e.$d : null); // Send the selected date or null
                        }}
                        // onFocus={onFocus}
                        // focused={isFocused || false}
                        // required={field.required === true}
                        disabled={field.disabled === true}
                        fullWidth
                        minDate={minDate} // Pass minDate as dayjs object
                        maxDate={maxDate} // Pass maxDate as dayjs object (end of today)
                        sx={{
                            width: '100%',
                            '& .MuiOutlinedInput-root': {
                                // backgroundColor: '#fff', // Inner input background color
                            },
                            '& .MuiOutlinedInput-notchedOutline': {
                                borderWidth: isFocused ? '2px' : '1px', // Apply border width based on focus
                                borderColor: isFocused ? '#1570EF' : Boolean(errors?.[field?.name]) ? '#F04438' : '#D0D5DD', // Apply border color based on focus
                                boxShadow: isFocused ? '0px 0px 0px 3px #D1E9FF' : 'none', // Apply shadow based on focus
                            },
                        }}
                    />
                </Box>
                <FormHelperText style={{ color: errors?.[field?.name] ? '#d32f2f' : '' }}>
                    {errors?.[field?.name] || field.supportingText || ' '}
                </FormHelperText>
            </LocalizationProvider>
        </div>
    );
}