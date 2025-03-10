import React, { useEffect, useState } from 'react';
import { Select, MenuItem, InputLabel, FormControl, IconButton, Typography, Box } from '@mui/material';
import { Add } from '@mui/icons-material'; // You can use Material-UI icons
import api from '../../services/api'

const CreateField = ({ selectedField, selectedDropdwonField, formFields, handleFieldSelect, onAddDivider }) => {

  const [open, setOpen] = useState(false);
  
  return (
    <Box>
    <FormControl fullWidth variant="outlined" key="form-field" sx={{ backgroundColor: '#F5FAFF',textAlign: 'center',position:'relative', marginTop: '8px' }}>
      <Select
        value={selectedDropdwonField || ''} // Ensure selectedField is correctly passed
        onChange={handleFieldSelect} // Call the handleFieldSelect to update state
        className='addNewFieldBtn'
        id="dropdown"
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        displayEmpty
      >
        {/* Custom Placeholder */}
        <MenuItem disabled value="">
            <Box sx={{display: 'flex', alignItems: 'center', justifyContent:'center'}} onClick={()=>setOpen((prevOpen) => !prevOpen)}>
                <Box sx={{ textTransform: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img src='./AddPlusIcon.svg' />
                    <Typography sx={{ color: '#1D2939', fontWeight: '500', fontSize: '18px' }}>
                        Add new field
                    </Typography>
                </Box>
            </Box>
        </MenuItem>
        {/* Dynamic options from formFields */}
        {formFields.filter((field) => field.formType).map((field) => (
          <MenuItem key={field.id} value={field}>
            {field.formType}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
    <Box sx={{display:'none',alignItems:'center',justifyContent:'center'}}>
        <Typography mt={2} className='flexCenter' sx={{ color: '#1570EF', fontWeight: '400', fontSize: '16px',cursor:'pointer' }} onClick={onAddDivider}>
            Add divider
        </Typography>
    </Box>
    </Box>

  );
};

export default CreateField;
