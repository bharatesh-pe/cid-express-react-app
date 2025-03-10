import React, { useState } from 'react';
import './ShortText.css';
import { FormControl, FormHelperText, InputLabel, MenuItem, Select, Tooltip } from '@mui/material';
import textToSnakecase from './textformater';
import InfoIcon from '@mui/icons-material/Info';
import HistoryIcon from '@mui/icons-material/History';

const SelectField = ({ field, formData, errors, onChange, onFocus, isFocused, onHistory }) => {
  return (
    <>
      {field.heading && <h4 className='form-field-heading'>{field.heading}</h4>}
      <FormControl fullWidth>
        <InputLabel id="demo-simple-select-helper-label" className='hideHistoy'>
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
                        <InfoIcon sx={{
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
                        className='historyIcon' 
                        sx={{
                            color: '#1570EF', 
                            padding: '0 1px', 
                            fontSize: '20px',
                            verticalAlign: 'middle',
                            cursor: 'pointer',
                            pointerEvents: 'auto',
                            marginBottom:'3px'
                        }}
                    />
                )}
            </div>
        </InputLabel>
        <Select
          error={Boolean(errors?.[field?.name])}  // Use Boolean to convert error to true or false
          labelId="demo-simple-select-helper-label"
          id="demo-simple-select-helper"
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
          value={formData && formData[field.name] || ''}
          name={field.name}
          // name={textToSnakecase(field.label)}
          onChange={(e) => { onChange(e) }}
        //   required={field.required === true}
          disabled={field.disabled === true}
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
        //   onClick={onFocus}
        // focused={isFocused || false}
        >
          <MenuItem value="">
            <em>None</em>
          </MenuItem>
          {field?.options.map((el) => (
            <MenuItem key={el.code} value={el.code}>
              {el.name}
            </MenuItem>
          ))}
        </Select>
        <FormHelperText style={{ color: errors[field.name] ? '#d32f2f' : '' }}>
          {errors[field.name] || field.supportingText || ' '}
        </FormHelperText>
      </FormControl>
    </>
  );
};

export default SelectField;
