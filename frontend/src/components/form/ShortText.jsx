import React from 'react';
import TextField from '@mui/material/TextField';
import './ShortText.css';
import HistoryIcon from '@mui/icons-material/History';
import InfoIcon from '@mui/icons-material/Info';
import { Tooltip } from '@mui/material';

const ShortText = ({ field, formData, errors, onChange, onFocus, isFocused, onHistory, readOnly, disabled}) => {
  return (
    <div style={{ width: '100%' }}>
      {field.heading && <h4 className={`form-field-heading ${readOnly || disabled || field.disabled ? 'disabled' : ''}`}>{field.heading}</h4>}
      <TextField
        error={errors && Boolean(errors?.[field?.name])}  // Use Boolean to convert error to true or false
        fullWidth
        id="outlined-basic"
        variant="outlined"
        className='hideHistory'
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
                            marginBottom:'3px',
                            cursor: 'pointer',
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
        value={formData && formData[field.name] || ''}
        helperText={errors && errors?.[field?.name] || field.supportingText || ' '}  // Display the error if it exists, else fallback to supportingText
        inputProps={{
          minLength: field.minLength,
          maxLength: field.maxLength,
          readOnly: readOnly,
        }}
        // required={field.required === true}
        disabled={readOnly || disabled ||field.disabled === true}
        onChange={(e) => {
              onChange(e);
          }}
                    
        sx={{
          '& .MuiOutlinedInput-root': {
            // backgroundColor: '#fff', // Inner input background color
          },
            '& .MuiOutlinedInput-notchedOutline': {
                borderWidth: isFocused ? '2px' : '1px', // Apply border width based on focus
                borderColor: isFocused ? '#1570EF' : Boolean(errors?.[field?.name]) ? '#F04438' : '#D0D5DD', // Apply border color based on focus
                boxShadow: isFocused ? '0px 0px 0px 3px #D1E9FF' : 'none', // Apply shadow based on focus
            },
        }}
        onFocus={onFocus}
      // focused={isFocused || false}
      />
    </div>
  );
};

export default ShortText;
