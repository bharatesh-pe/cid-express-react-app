import * as React from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import { Box, Button } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const paginationModel = { page: 0, pageSize: 5 };

export default function TableView({rows, columns, checkboxSelection,getRowId, backBtn, nextBtn, handleNext, handleBack,handleRowClick}) {
  return (
    <Box sx={{margin : "6px"}}>

    <Paper sx={{ width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        getRowId={getRowId} 
        className='FigmaTableView'
        disableColumnMenu
        hideFooter
        // initialState={{ pagination: { paginationModel } }}
        // pageSizeOptions={[5, 10]}
        checkboxSelection={checkboxSelection}
        sx={{ border: 0 }}
        onRowClick={(params) => handleRowClick && handleRowClick(params.row)}
        />
    </Paper>

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
