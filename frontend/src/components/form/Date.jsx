import * as React from 'react';
import dayjs from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Box, FormHelperText, Tooltip } from '@mui/material';
import './ShortText.css';
import InfoIcon from '@mui/icons-material/Info';
import HistoryIcon from '@mui/icons-material/History';
import { toast } from "react-toastify";


export default function DateField({ field, formData, errors, onChange, onFocus, isFocused, onHistory, readOnly ,disabledDates = []}) {
    // Ensure the value is a valid date or null if no date is selected
    const selectedDate = formData && formData[field.name]
        ? dayjs(formData[field.name]) // Convert to dayjs object
        : null; // Set to null if empty or undefined

    const today = dayjs();
    // Ensure minDate and maxDate are dayjs objects (if provided)
    let minDate = field?.minDate ? dayjs(today) : null; // Ensure minDate is valid dayjs
    let maxDate = field?.maxDate ? dayjs(today) : null; // Ensure minDate is valid dayjs
    // const maxDate = dayjs().endOf('day'); // Use current date as the max date, setting the end of the day

    // console.log(field?.disableFutureDate);
    if(field?.disableFutureDate == 'true'){
        maxDate = dayjs().endOf('day'); 
    }

    var dateFieldValue = selectedDate;

    if(field?.selectTodayDate && !formData?.[field?.name]){
        dateFieldValue = today;
        onChange(today.toDate());
    }

    return (
        <div style={{width: '100%'}}>
        <LocalizationProvider dateAdapter={AdapterDayjs} onFocus={onFocus} >
            {field.heading && <h4 className={`form-field-heading ${readOnly || field.disabled ? 'disabled' : ''}`}>{field.heading}</h4>}
            <Box sx={{ width: '100%' }} onClick={onFocus}>
                <DatePicker
                
                    error={Boolean(errors?.[field?.name])}  // Use Boolean to convert error to true or false
                    className='selectHideHistory'
                    label={
                        <div style={{ display: 'flex', alignItems: 'center' }}>
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
                                        padding: '0px 0px 0px 3px;', 
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
                                    className='historyIcon' 
                                    sx={{
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
                    value={dateFieldValue}
                    onChange={(e) => {
                    if (!e) return onChange(null);

                    const formatted = dayjs(e).format("YYYY-MM-DD");

                    if (
                        readOnly ||
                        (selectedDate && formatted === selectedDate.format("YYYY-MM-DD"))
                    ) {
                        onChange(e.$d);
                        return;
                    }

                    if (disabledDates?.includes(formatted)) {
                        toast.warning("This date is already selected", {
                        position: "top-right",
                        autoClose: 3000,
                        hideProgressBar: false,
                        className: "toast-warning",
                        });
                        return;
                    }

                    onChange(e.$d);
                    }}
                    slotProps={{
                        textField: {
                            inputProps: {
                            readOnly: true,
                            onKeyDown: (e) => e.preventDefault(),
                            },
                        },
                    }}

                    // onFocus={onFocus}
                    focused={isFocused || false}
                    required={field.required === true}
                    disabled={readOnly || field.disabled === true}
                    fullWidth
                    minDate={field?.minValue ? dayjs(field.minValue) : minDate} // Pass minDate as dayjs object
                    maxDate={field?.maxValue ? dayjs(field.maxValue) : maxDate} // Pass maxDate as dayjs object (end of today)
                    shouldDisableDate={(date) => {
                            const formatted = date?.format("YYYY-MM-DD");
                            if (
                                readOnly ||
                                (selectedDate && formatted === selectedDate.format("YYYY-MM-DD"))
                            ) {
                                return false;
                            }
                            return disabledDates?.includes(formatted);
                    }}

                    format="DD-MM-YYYY"
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
                        '& .MuiInputLabel-root': {
                            color: errors?.[field?.name] && '#F04438',
                        },
                        '& .MuiFormLabel-asterisk': {
                            color: errors?.[field?.name] && '#F04438',
                        }
                    }}
                />
            </Box>
            <FormHelperText
            sx={{
                color: errors?.[field?.name]
                ? '#F04438 !important'
                : `${field?.supportingTextColor || ''} !important`,
            }}
            >
            {errors?.[field?.name] || field?.supportingText || ''}
            </FormHelperText>
            {/* <FormHelperText sx={{ color: errors?.[field?.name] ? '#F04438' : '' }}>
                {errors?.[field?.name] || field.supportingText || ''}
            </FormHelperText> */}
        </LocalizationProvider>
        </div>
    );
}
