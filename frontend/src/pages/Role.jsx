import { Box, Button, CircularProgress, IconButton, InputAdornment, Typography } from "@mui/material"
import { useState } from "react"
import TableView from "../components/table-view/TableView";
import TextFieldInput from '@mui/material/TextField';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import ASC from '@mui/icons-material/North';
import DESC from '@mui/icons-material/South';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ClearIcon from '@mui/icons-material/Clear';

const RolePage = () => {

    // loader variable
    const [loading, setLoading] = useState(false);

    // table row variable
    const [roleRowData, setRoleRowData] = useState([]);

    // table column variable
    const [roleColumnData, setRoleColumnData] = useState([
        { field: 'sl_no', headerName: 'S.No' },
        {
            field: '',
            headerName: 'Action',
            flex: 1,
            renderCell: (params) => {
                return (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px', height: '100%' }}>
                        <Button variant="outlined">
                            View
                        </Button>
                        <Button variant="contained" color="primary">
                            Edit
                        </Button>
                        <Button variant="contained" color="error">
                            Delete
                        </Button>
                    </Box>
                );
            }
        }
    ]);

    // table pagination variable
    const [tablePagination, setTablePagination] = useState(1);

    // table search variable
    const [searchValue, setSearchValue] = useState(null);

    const handleNextPage = () => {
        setTablePagination((prev) => prev + 1)
    }

    const handlePrevPage = () => {
        setTablePagination((prev) => prev - 1)
    }

    return (
        <Box inert={loading ? true : false}>
            <Box p={2}>
                <Box sx={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap'}}>
                    <Box>
                        <Typography className='Roboto' sx={{fontSize:'20px',fontWeight:'600',color:'#1D2939'}}>Role Management</Typography>
                    </Box>
                    <Box sx={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                        <TextFieldInput InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{color:'#475467'}} />
                                </InputAdornment>
                                ),
                            endAdornment: (
                                searchValue && (
                                    <IconButton sx={{padding:0}} onClick={()=>setSearchValue('')} size="small">
                                        <ClearIcon sx={{ color: '#475467' }} />
                                    </IconButton>
                                )
                            )
                            }}
                            onInput={(e)=>setSearchValue(e.target.value)}
                            value={searchValue}
                            id="tableSearch" 
                            size="small"
                            placeholder='Search anything'
                            variant="outlined" 
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                }
                            }}
                            sx={{width:'400px',borderRadius:'6px',outline:'none',
                                '& .MuiInputBase-input::placeholder': {
                                    color: '#475467',
                                    opacity:'1',
                                    fontSize:'14px',
                                    fontWeight:'400',
                                    fontFamily:'Roboto'
                                },
                            }} 
                        />
                        <Button sx={{ background: '#32D583', color: '#101828', textTransform: 'none', height: '38px' }} startIcon={<AddIcon sx={{ border: '1.3px solid #101828', borderRadius: '50%' }} />} variant="contained">
                            Add Role
                        </Button>
                    </Box>
                </Box>
                <Box py={2}>
                    <TableView rows={roleRowData} columns={roleColumnData} backBtn={tablePagination !== 1} nextBtn={roleRowData.length === 10} handleBack={handlePrevPage} handleNext={handleNextPage} />
                </Box>
            </Box>
            {
                loading &&  <div className='parent_spinner' tabIndex="-1" aria-hidden="true">
                                <CircularProgress size={100} />
                            </div>
            }
        </Box>
    )
}

export default RolePage