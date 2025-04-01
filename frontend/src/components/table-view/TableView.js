import * as React from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import { Box, Button, IconButton, Menu, MenuItem } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";

export default function TableView({rows, columns, checkboxSelection,getRowId, backBtn, nextBtn, handleNext, handleBack,handleRowClick, hoverTable, hoverTableOptions, hoverActionFuncHandle}) {

    const [anchorEl, setAnchorEl] = React.useState(null);
    const [selectedRow, setSelectedRow] = React.useState(null);
  
    const handleMenuOpen = (event, row) => {
        setAnchorEl(event.currentTarget);
        setSelectedRow((prev) => (prev?.id === row.id ? null : row));
    };
  
    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedRow(null);
    };
  
    const handleHoverOptionClick = (option, page) => {
        if (option && typeof option.onclick === "function") {
            option.onclick(selectedRow);
        }else{
            hoverActionFuncHandle(option, selectedRow);
        }
        handleMenuClose();
    };
  
    const updatedColumns = [
        ...columns,
        ...(hoverTable && hoverTableOptions && hoverTableOptions.length > 0
          ? [
              {
                field: "extraActions",
                headerName: "Actions",
                flex: 2,
                renderCell: (params) => (
                  <IconButton onClick={(event) => handleMenuOpen(event, params.row)}>
                    {selectedRow?.id === params.row.id ? (
                      <KeyboardArrowUp sx={{ color: "blue" }} />
                    ) : (
                      <KeyboardArrowDown sx={{ color: "blue" }} />
                    )}
                  </IconButton>
                ),
              },
            ]
          : []),
      ];

  return (
    <Box sx={{margin : "6px"}}>

    <Paper sx={{ width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={updatedColumns}
        getRowId={getRowId} 
        className={` ${rows.length === 10 ? 'heightScroll' : ''} FigmaTableView`}
        disableColumnMenu
        disableColumnSorting
        hideFooter
        disableRowSelectionOnClick
        // initialState={{ pagination: { paginationModel } }}
        // pageSizeOptions={[5, 10]}
        checkboxSelection={checkboxSelection}
        sx={{ border: 0 }}
        onRowClick={(params) => handleRowClick && handleRowClick(params.row)}
        />
    </Paper>

    {/* Hover Menu */}
    {hoverTable &&   
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
            {hoverTableOptions.map((option, index) => (
                <MenuItem key={index} onClick={() => handleHoverOptionClick(option)}>
                    {option?.name} 
                </MenuItem>
            ))}
        </Menu>
    }

    <Box sx={{display:'flex',justifyContent:'space-between'}} pt={2}>
        {handleBack && handleNext && 
            <>
                <Button disabled={!backBtn} onClick={handleBack} sx={{ textTransform: 'none',color:'#1D2939',border:'1px solid #D0D5DD',borderRadius:'6px',fontSize:'14px',fontWeight:'500' }} className='Roboto'>
                    <ArrowBackIcon />
                    Back
                </Button>
                <Button disabled={!nextBtn} onClick={handleNext} sx={{ textTransform: 'none',color:'#1D2939',border:'1px solid #D0D5DD',borderRadius:'6px',fontSize:'14px',fontWeight:'500' }} className='Roboto'>
                    Next
                    <ArrowForwardIcon />
                </Button>
            </>        
        }
    </Box>

    </Box>
  )
}
