import * as React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import { Box, Button, IconButton, Menu, MenuItem, Pagination, PaginationItem, Stack ,Tooltip} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import AutofpsSelectIcon from '@mui/icons-material/AutofpsSelect';
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';


export default function TableView({rows, columns, checkboxSelection,getRowId, backBtn, nextBtn, handleNext, handleBack,handleRowClick, hoverTable, hoverTableOptions, hoverActionFuncHandle, totalPage, paginationCount, handlePagination, totalRecord,getRowClassName }) {

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
        ...(hoverTable && hoverTableOptions && hoverTableOptions.length > 0
          ? [
              {
                field: 'actions',
                headerName: 'Actions',
                width: 50,
                renderHeader: () => (
                  <Tooltip title="Actions">
                    <AutofpsSelectIcon sx={{ color: "", fill: "#1f1dac" }} />
                  </Tooltip>
                ),
                renderCell: (params) => (
                  <Tooltip title="Actions">
                    <IconButton onClick={(event) => handleMenuOpen(event, params.row)} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      {selectedRow?.id === params.row.id ? (
                        <KeyboardArrowUp sx={{ color: "blue" }} />
                      ) : (
                        <SettingsSuggestIcon sx={{ color: "blue",fill:"rgb(0 0 255 / 58%)" }} />
                      )}
                    </IconButton>
                  </Tooltip>
                ),
              },
            ]
          : []),
        ...columns,
      ];

    const handlePageChange = (page) => {
        if (page !== "..." && page !== paginationCount) {
        handlePagination(page)
        }
    };

    const pageSize = 10;

    const startRecord = rows.length === 0 ? 0 : (paginationCount - 1) * pageSize + 1;
    const endRecord = rows.length === 0 ? rows.length : Math.min(paginationCount * pageSize, totalRecord);
  

  return (
    <Box sx={{margin : "6px"}}>

    <Paper sx={{ width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={updatedColumns}
        getRowId={getRowId} 
        rowHeight={45}
        className={`FigmaTableView`}
        disableColumnMenu
        disableColumnSorting
        hideFooter
        disableRowSelectionOnClick
        // initialState={{ pagination: { paginationModel } }}
        // pageSizeOptions={[5, 10]}
        checkboxSelection={checkboxSelection}
        sx={{ border: 0 }}
        stickyHeader
        onRowClick={(params) => handleRowClick && handleRowClick(params.row)}
        getRowClassName = {getRowClassName}
        />
    </Paper>

    {/* Hover Menu */}
    {hoverTable &&   
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
            {hoverTableOptions.map((option, index) => (
                <MenuItem key={index} className='actionHoverOnTable' onClick={() => handleHoverOptionClick(option)} sx={{display: 'flex', alignItems: 'start', height: '40px'}}
                disabled={selectedRow?.field_io_name == null && option?.name !== 'Edit'}
                >
                    {option?.icon ? (
                        typeof option.icon === 'function' ? (
                            option.icon()
                        ) : (
                            <span
                                className="tableActionIcon"
                                dangerouslySetInnerHTML={{ __html: option.icon }}
                            />
                        )
                    ) : (
                        <span className="tableActionIcon">
                            <svg width="50" height="50" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="12" fill="" />
                                <mask id="mask0_1120_40651" style={{ maskType: 'alpha' }} maskUnits="userSpaceOnUse" x="4" y="4" width="16" height="16">
                                    <rect x="4" y="4" width="16" height="16" fill="" />
                                </mask>
                                <g mask="url(#mask0_1120_40651)">
                                    <path d="M7.80523 17.2667C7.51045 17.2667 7.25812 17.1618 7.04823 16.9519C6.83834 16.742 6.7334 16.4897 6.7334 16.1949V7.80523C6.7334 7.51045 6.83834 7.25812 7.04823 7.04823C7.25812 6.83834 7.51045 6.7334 7.80523 6.7334H16.1949C16.4897 6.7334 16.742 6.83834 16.9519 7.04823C17.1618 7.25812 17.2667 7.51045 17.2667 7.80523V13.3629L13.3629 17.2667H7.80523ZM13.2001 16.4001L16.4001 13.2001H13.2001V16.4001ZM9.0949 13.0206H12.0001V12.1539H9.0949V13.0206ZM9.0949 10.6334H14.9052V9.76673H9.0949V10.6334Z" fill="" />
                                </g>
                            </svg>
                        </span>
                    )}
                    <span style={{marginTop:'3px'}}>
                        {option?.name}
                    </span> 
                </MenuItem>
            ))}
        </Menu>
    }

    { handlePagination && paginationCount ?
        <Box sx={{display:'flex',justifyContent:'space-between'}} pt={2}>
            <>
                <p style={{fontSize:'14px'}}>
                    {startRecord} - {endRecord} of {totalRecord}
                </p>
                <Stack spacing={2} direction="row" justifyContent="center">
                    <Pagination
                        count={totalPage}
                        page={paginationCount}
                        onChange={(event, page) => handlePageChange(page)}
                        renderItem={(item) => (
                        <PaginationItem
                            {...item}
                            onClick={() => handlePageChange(item.page)}
                            disabled={item.page === "..." || (item.type === "previous" && paginationCount === 1) || (item.type === "next" && (rows.length === 0 || paginationCount === totalPage))}
                            sx={{
                                mx: 0.5,
                                cursor: item.page === "..." ? "default" : "pointer",
                                backgroundColor: paginationCount === item.page ? "#1976d2" : "transparent",
                                color: paginationCount === item.page ? "#fff" : "inherit",
                            }}
                        />
                        )}
                    />
                </Stack>
            </>
        </Box>
        : 
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
    }



    </Box>
  )
}
