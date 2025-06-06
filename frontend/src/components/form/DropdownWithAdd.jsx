import React, { useState } from "react";
import { Autocomplete, TextField, Popper, Box, styled, CircularProgress } from "@mui/material";
import { useEffect } from "react";

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

export default function DropdownWithAdd({ field, onChange, onAdd, dropdownInputValue, onChangeDropdownInputValue, formData, onFocus, errors }) {

    console.log(dropdownInputValue,"dropdownInputValue");

    const [value, setValue] = useState(formData?.[field.name] || null);

    const handleAdd = async (val) => {
        if(!onAdd){
            return;
        }
        
        onAdd(val);
    };

    useEffect(()=>{
        if(value && onChange){
            if(value?.code){
                console.log(value?.code,"value?.code");
                onChange(value?.code);
            }
        }
    },[value]);

    useEffect(() => {
        setValue(formData?.[field.name] || null);
    }, [formData?.[field.name]]);

    var inputValue = dropdownInputValue[field.name] || "";

    return (
        <Autocomplete
            onFocus={onFocus}
            value={
                field.options?.find((opt) => opt.code === value) || null
            }
            inputValue={inputValue}
            onInputChange={(event, newInputValue) =>
                onChangeDropdownInputValue(newInputValue)
            }
            onChange={(event, newValue) => {
                if (newValue) {
                    setValue(newValue.code);
                } else {
                    setValue(null);
                }
            }}
            getOptionLabel={(option) =>
                typeof option === "string" ? option : option.name
            }
            options={field.options || []}
            renderInput={(params) => (
                <TextField {...params} label={field?.label || ""} variant="outlined" />
            )}
            sx={{ width: "100%" }}
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
        />
    );
}
