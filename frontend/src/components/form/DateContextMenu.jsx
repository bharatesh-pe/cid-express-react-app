import * as React from 'react';
import dayjs from 'dayjs';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Box } from '@mui/material';
import './ShortText.css';

// Import context menu components from react-contextmenu
import { ContextMenu, MenuItem, ContextMenuTrigger } from 'react-contextmenu';

export default function DateField({ field, formData, onChange }) {
    const [contextMenuPosition, setContextMenuPosition] = React.useState(null);

    // Ensure the value is a valid date or null if no date is selected
    const selectedDate = formData && formData[field.name] 
        ? dayjs(formData[field.name]) // Convert to dayjs object
        : null; // Set to null if empty or undefined

    // Handle right-click (context menu)
    const handleContextMenu = (e) => {
        e.preventDefault(); // Prevent default right-click menu
        setContextMenuPosition({ x: e.clientX, y: e.clientY });
    };

    // Handle context menu actions
    const handleHistoryClick = () => {
        console.log('History option selected');
        // Your logic for history action
    };

    const handleInfoClick = () => {
        console.log('Info option selected');
        // Your logic for info action
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box sx={{ width: '100%' }}>
                <DemoContainer components={['DatePicker', 'DatePicker']} sx={{ width: '100%' }}>
                    {/* Wrap DatePicker in ContextMenuTrigger for right-click functionality */}
                    <ContextMenuTrigger id="date-context-menu" onContextMenu={handleContextMenu} fullWidth sx={{ width: '100%' }}>
                        <DatePicker
                            label={field.label + " " + (field.kannada ? '/ '+field.kannada+' ' : '')}
                            name={field.name}
                            value={selectedDate}
                            onChange={(e) => { 
                                console.log(e); 
                                onChange(e ? e.$d : null); // Send the selected date or null
                            }}
                            fullWidth
                            sx={{ width: '100%' }}
                        />
                    </ContextMenuTrigger>
                </DemoContainer>
            </Box>

            {/* Context Menu */}
            <ContextMenu id="date-context-menu" style={{ top: contextMenuPosition?.y, left: contextMenuPosition?.x, position: 'absolute' }}>
                <MenuItem onClick={handleHistoryClick}>History</MenuItem>
                <MenuItem onClick={handleInfoClick}>Info</MenuItem>
            </ContextMenu>

            {field.supportingText ? (
                <div className='supporting-text'>
                    {field.supportingText}
                </div>
            ) : null}
        </LocalizationProvider>
    );
}
