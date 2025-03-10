// import React from 'react';
// import { Select, MenuItem, CircularProgress } from '@mui/material';
// import { FixedSizeList as List } from 'react-window';

// const VirtualizedSelect = ({ data, handleLinkToSelect }) => {
//   const itemSize = 36; // Height of each item in the dropdown
//   console.log('data', data.options);

//   const renderRow = ({ index, style }) => {
//     return (
//       <MenuItem key={index} style={style} value={data.options[index]} onChange={(value) => handleLinkToSelect(data.options[index].value)}>
//         {data.options[index].name}
//       </MenuItem>
//     );
//   };

//   return (
//     <Select defaultValue="">
//       <List
//         height={200}  // Height of the dropdown
//         itemCount={data.options.length}
//         itemSize={itemSize}
//         width={300} // Width of the dropdown
//       >
//         {renderRow}
//       </List>
//     </Select>
//   );
// };

// export default VirtualizedSelect;

import React, { useState, useMemo, useEffect } from 'react';
import { Autocomplete, TextField, CircularProgress } from '@mui/material';
import { FixedSizeList as List } from 'react-window';
import debounce from 'lodash.debounce';

// Custom render function for the Autocomplete dropdown
const VirtualizedAutocomplete = ({ data }) => {
  const itemSize = 36; // Height of each item in the dropdown
  const listHeight = 200; // Height of the dropdown area

  const renderRow = ({ index, style }) => {
    return (
      <div style={style} key={index}>
        <div>{data[index].name}</div> {/* Displaying name from the object */}
      </div>
    );
  };

  return (
    <List
      height={listHeight}  // Height of the visible dropdown area
      itemCount={data.length}
      itemSize={itemSize}  // Height of each item in the list
      width={300}  // Width of the dropdown
    >
      {renderRow}
    </List>
  );
};

const VirtualizedSearchAutocomplete = ({ data, initialValueCode, handleLinkToSelect, field }) => {
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [filteredOptions, setFilteredOptions] = useState(data.slice(0, 100)); // Initial 100 items
  const [selectedValue, setSelectedValue] = useState(null); // For holding selected value

  // Debounce the input change for better performance
  const debouncedSearch = useMemo(
    () =>
      debounce((value) => {
        const filtered = data.filter((option) =>
          option.name.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredOptions(filtered.slice(0, 100)); // Only show the first 100 matching options
      }, 300), // Delay of 300ms
    [data]
  );

  // Handle input changes with debounced search
  const handleInputChange = (event, newInputValue) => {
    setInputValue(newInputValue);
    debouncedSearch(newInputValue);
  };

  // Handle option selection
  const handleSelectionChange = (event, newValue) => {
    setSelectedValue(newValue);
    handleLinkToSelect(newValue?.code);
  };

  // Set the selected value based on the code passed via `initialValueCode`
  useEffect(() => {
    if (initialValueCode) {
      const selected = data.find((item) => item?.code === initialValueCode?.[field?.name]);
      setSelectedValue(selected);
      if (selected) {
        setInputValue(selected.name);  // Set the input to the selected name
      }
    }
  }, [initialValueCode, data]);

  // Ensure we clean up the debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  return (
    <Autocomplete
      freeSolo
      options={filteredOptions}
      loading={loading}
      value={selectedValue}  // Display the selected value in the input
      onInputChange={handleInputChange}
      onChange={handleSelectionChange}  // Handle option selection
      getOptionLabel={(option) => option.name}  // Using 'name' to display in the input field
      renderInput={(params) => (
        <TextField
          {...params}
          label={field['label']}
          placeholder=''
          variant="outlined"
          InputProps={{
            ...params.InputProps,
            endAdornment: loading ? <CircularProgress color="inherit" size={20} /> : null,
          }}
        />
      )}
      renderOption={(props, option) => (
        <div {...props}>
          <div>{option.name}</div>  {/* Displaying 'name' in the dropdown */}
        </div>
      )}
      renderPopupComponent={(popupProps) => (
        <div {...popupProps}>
          <VirtualizedAutocomplete data={filteredOptions} />
        </div>
      )}
    />
  );
};

export default VirtualizedSearchAutocomplete;


