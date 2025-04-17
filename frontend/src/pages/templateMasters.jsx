import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, InputAdornment, IconButton } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import TableView from '../components/table-view/TableView';
import TextFieldInput from '@mui/material/TextField';
import SearchIcon from '@mui/icons-material/Search';
import ASC from '@mui/icons-material/North';
import DESC from '@mui/icons-material/South';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ClearIcon from '@mui/icons-material/Clear';
import { CircularProgress } from "@mui/material";

const TemplateMastersView = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { pagination } = location.state || {};

    const [tableData,setTableData] = useState([]);
    const [paginationCount,setPaginationCount] = useState(pagination ? pagination : 1);
    const [tableSortOption, settableSortOption] = useState('DESC');
    const [tableSortField, settableSortField] = useState('created_at');
    const [searchValue,setSearchValue] = useState(null);
    const [totalPage,setTotalPage] = useState(0);
    const [totalRecord,setTotalRecord] = useState(0);
    const [loading, setLoading] = useState(false); // State for loading indicator
    const [forceTableLoad, setForceTableLoad] = useState(false);

    useEffect(() => {
        loadTableData(paginationCount);
    }, [paginationCount, tableSortOption, forceTableLoad]);

    const columns: GridColDef[] = [
        { field: 'sl_no', headerName: 'S.No',resizable: false},
        { 
            field: 'template_name', 
            headerName: 'Table Name',
            resizable: false,
            flex: 2,
            renderHeader: () => (
                <div onClick={()=>ApplyTableSort('table_name')} style={{ display: "flex", alignItems: "center", justifyContent: 'space-between', width: '200px' }}>
                    <span style={{color:'#1D2939',fontSize:'15px',fontWeight:'500'}}>Template Name</span>
                    {tableSortOption === 'ASC' ? <ASC sx={{color:'#475467',width:'18px'}} /> : <DESC sx={{color:'#475467',width:'18px'}} /> }
                </div>
            )
        },
        {
            field: '',
            headerName: 'Action',
            resizable: false,
            flex: 3,
            renderCell: (params) => {
                return (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px', height: '100%' }}>
                        <Button variant="outlined" onClick={(event) => { event.stopPropagation(); handleView(params.row); }}>
                            View
                        </Button>
                    </Box>
                );
            }
        }
    ];


    const handleView = async (row) => {

        if(!row || !row.table_name || row.table_name === ''){
            toast.warning('Please Check The Template Name', {
                position: "top-right",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                className: "toast-warning",
            });
            return;
        }
        navigate('/profile-data', { state: {"table_name" : row.table_name, "selected_template_id" : row.template_id, "template_name" : row.template_name ? row.template_name : '', pagination : paginationCount, selectedFields : row.fields && row.fields.length > 0 ? row.fields : [] } });
    }   

    const loadTableData = async (page, searchValue)=>{

        var getTemplatePayload = {
            "page" : page,
            "limit" : 10,
            "sort_by" : tableSortField,
            "order": tableSortOption,
            "search" : searchValue ? searchValue : '',
            // "admin": true
            "template_module" : "master"
        }
        setLoading(true);
        try {
            const getTemplateResponse = await api.post("/templates/paginateTemplate",getTemplatePayload);
            setLoading(false);
            if (getTemplateResponse && getTemplateResponse.success) {
                if(getTemplateResponse.data && getTemplateResponse.data['data']){
                    var updatedTableData = getTemplateResponse.data['data'].map((field,index)=>{
                        return {
                            ...field,
                            sl_no: (page - 1) * 10 + (index + 1),
                            id: field.table_name + index, // Create a unique id for each row
                        };
                    })
                    setTableData(updatedTableData)
                }

                if(getTemplateResponse.data && getTemplateResponse.data['meta'] && getTemplateResponse.data['meta'].totalPages){
                    setTotalPage(getTemplateResponse.data['meta'].totalPages)
                    if(getTemplateResponse.data['meta'].totalItems){
                        setTotalRecord(getTemplateResponse.data['meta'].totalItems)
                    }
                }
                
            } else {
                const errorMessage = getTemplateResponse.message  ? getTemplateResponse.message  : "Failed to create the template. Please try again.";              
                toast.error(errorMessage, {
                    position: "top-right",
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    className: "toast-error",
                });
            }

        } catch (error) {  
            setLoading(false);
            if(error && error.response && error.response['data']){
                toast.error(error.response['data'].message ? error.response['data'].message : 'Please Try Again !', {
                    position: "top-right",
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    className: "toast-error",
                });
            }
        }
    }

    const handlePagination = (page)=>{
        setPaginationCount(page)
    }

    const ApplyTableSort = (field)=>{
        settableSortOption((prevOption) => (prevOption === 'DESC' ? 'ASC' : 'DESC'));
        settableSortField(field);
    }

    const handleClear = ()=>{
        setSearchValue('');
        loadTableData(paginationCount);
        setForceTableLoad((prev) => !prev);
    }

    const searchTableData = ()=>{
        setPaginationCount(1);
        setForceTableLoad((prev) => !prev);
    }

  return (
    <>
    <Box p={2} inert={loading ? true : false}>
        <Box sx={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap'}}>
            <Box>
                <Typography className='Roboto' sx={{fontSize:'20px',fontWeight:'600',color:'#1D2939'}}>Template Masters</Typography>
                {/* <Typography className='Roboto' sx={{fontSize:'16px',fontWeight:'400',color:'#667085'}}>Overview view of all dossier profile details</Typography> */}
            </Box>
            <TextFieldInput InputProps={{
                startAdornment: (
                    <InputAdornment position="start">
                        <SearchIcon sx={{color:'#475467'}} />
                    </InputAdornment>
                    ),
                endAdornment: (
                    searchValue && (
                        <IconButton sx={{padding:0}} onClick={handleClear} size="small">
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
                        searchTableData();
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
        </Box>
        <Box py={2}>
            <TableView rows={tableData} columns={columns} totalPage={totalPage} totalRecord={totalRecord} paginationCount={paginationCount} handlePagination={handlePagination} />
        </Box>
        {loading && <div className='parent_spinner' tabIndex="-1" aria-hidden="true">
                        <CircularProgress size={100} />
                    </div>
        }
    </Box>
    </>
  );
};

export default TemplateMastersView;
