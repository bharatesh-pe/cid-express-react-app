import React, { useState } from "react";
import { Autocomplete, TextField, Popper, Box, styled, CircularProgress, FormHelperText, Tooltip, Typography } from "@mui/material";
import { useEffect } from "react";
import InfoIcon from '@mui/icons-material/Info';
import HistoryIcon from '@mui/icons-material/History';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

const StyledPopper = styled(Popper)({
    "& .MuiAutocomplete-listbox": {
        paddingBottom: 18,
        maxHeight: 200,
        overflow: "auto",
    },
});

const FixedAddOption = styled(Box)(({ theme }) => ({
    position: "sticky",
    bottom: 0,
    backgroundColor: '#1570EF',
    color: theme.palette.primary.contrastText,
    borderTop: `1px solid ${theme.palette.divider}`,
    padding: theme.spacing(1.5),
    textAlign: "center",
    cursor: "pointer",
    borderRadius: theme.shape.borderRadius,
    fontWeight: 600,
    borderColor: `#1570EF`,
    borderWidth: '1px',
    borderRadius: '0px 0px 5px 5px',
    transition: "background-color 0.2s ease",
}));

export default function DropdownWithAdd(
    { 
        field, 
        onChange, 
        onAdd, 
        dropdownInputValue, 
        onChangeDropdownInputValue, 
        formData, 
        onFocus, 
        errors,
        readOnly,
        disabled,
        onHistory,
        isFocused,
        viewLinkedTemplate
    }) {

    const handleAdd = async (val) => {
        if(!onAdd){
            return;
        }
        
        onAdd(val);
    };

    var inputValue = dropdownInputValue[field.name] || "";

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
            {field.heading && 
                <h4 className={`form-field-heading ${readOnly || disabled || field.disabled ? 'disabled' : ''}`}>
                    {field.heading}
                </h4>
            }
        <Autocomplete
            disabled={readOnly || disabled ||field.disabled === true}
            inputValue={inputValue}
            onInputChange={(event, newInputValue) =>
                onChangeDropdownInputValue(newInputValue)
            }
            value={field.options.find((option) => String(option.code) === String(formData?.[field.name])) || null} // FIX HERE
            onChange={(event, newValue) => {
                if (newValue) {
                    onChange(newValue.code);
                } else {
                    onChange(null);
                }
            }}
            getOptionLabel={(option) =>
                typeof option === "string" ? option : option.name
            }
            options={field.options || []}
            renderInput={(params) => (
                <TextField 
                    {...params} 
                    className='selectHideHistory'
                    error={errors && errors[field.name] && Boolean(errors[field.name])}
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
                    }
                    variant="outlined" 
                />
            )}
            PopperComponent={(props) => (
                <StyledPopper {...props}>
                    {props.children}
                    <FixedAddOption
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => handleAdd(inputValue)}
                    >
                        Add New : {inputValue}
                    </FixedAddOption>
                </StyledPopper>
            )}
            renderOption={(props, option) => (
                <li {...props} key={option.code}>
                    {option.name}
                </li>
            )}
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
        />
            <FormHelperText
                sx={{
                    color: errors?.[field?.name]
                    ? '#F04438 !important'
                    : `${field?.supportingTextColor || ''} !important`,
                }}
            >
                {errors?.[field?.name] || field?.supportingText || ''}
            </FormHelperText>

            {
                field?.linkModule && (
                    <Tooltip title="" arrow placement="top">
                        <Box
                            onClick={()=> viewLinkedTemplate && viewLinkedTemplate(field)}
                            mt={1}
                            sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 0.5,
                                cursor: 'pointer',
                                color: 'primary.main',
                                fontSize: '0.875rem',
                                '&:hover': {
                                    textDecoration: 'underline',
                                },
                            }}
                        >
                            <InfoOutlinedIcon fontSize="small" />
                            <Typography variant="body2" fontWeight={500}>
                                View Data Details
                            </Typography>
                        </Box>
                    </Tooltip>
                )
            }

        </Box>
    );
}
