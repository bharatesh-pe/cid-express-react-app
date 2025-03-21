import React,{ useEffect, useState,useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import TableView from "../components/table-view/TableView";
import api from '../services/api';

import { Box, Button, } from "@mui/material";
import ASC from '@mui/icons-material/North';
import DESC from '@mui/icons-material/South';
import 'react-toastify/dist/ReactToastify.css';
import { GridColDef } from "@mui/x-data-grid";
import { CircularProgress } from "@mui/material";

const MastersView = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const [paginationCount, setPaginationCount] = useState(1);
    const [tableSortOption, settableSortOption] = useState('DESC');
    const [loading, setLoading] = useState(false);

    const [masters, setMasters] = useState([]);
    const [selectedMaster, setSelectedMaster] = useState("");
    const [showMasters, setShowMasters] = useState(true);
    
    const columns: GridColDef[] = [
        { field: 'sl_no', headerName: 'S.No', resizable: false },
        { 
            field: 'template_name', 
            headerName: 'Masters List',
            resizable: false,
            flex: 2,
            renderHeader: () => (
                <div onClick={() => ApplyTableSort('table_name')} style={{ display: "flex", alignItems: "center", justifyContent: 'space-between', width: '200px' }}>
                    <span style={{ color:'#1D2939', fontSize:'15px', fontWeight:'500' }}>Masters List</span>
                    {tableSortOption === 'ASC' ? <ASC sx={{ color:'#475467', width:'18px' }} /> : <DESC sx={{ color:'#475467', width:'18px' }} /> }
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
                        <Button 
                            variant="outlined" 
                            onClick={(event) => {
                                event.stopPropagation();
                                handleSelectChange("master", params.row.template_name);
                            }}
                        >
                            View
                        </Button>
                    </Box>
                );
            }
        }
    ];
    const ApplyTableSort = (field)=>{
        settableSortOption((prevOption) => (prevOption === 'DESC' ? 'ASC' : 'DESC'));
    }

    useEffect(() => {
        fetchMasters();
    }, []);
    
    const fetchMasters = async () => {
        try {
            const response = await api.get("/master_meta/fetch_masters");
            if (response.success) {
                setMasters(response.master);
            }
        } catch (error) {
            console.error("Error fetching master data:", error);
        }
    };
    
    const [selectedTemplateModule, setSelectedTemplateModule] = useState(null);

    const handleSelectChange = (name, selectedName) => {
        setSelectedMaster(selectedName);
        setShowMasters(false);
    
        if (selectedName === "Designation") {
            navigate("/master/designation");
            return;
        }
        if (selectedName === "Department") {
            navigate("/master/department");
            return;
        }
        if (selectedName === "Division") {
            navigate("/master/division");
            return;
        }
    
        const selectedMasterObj = masters.find(master => master.name === selectedName);
        if (selectedMasterObj) {
            setSelectedTemplateModule(selectedMasterObj.key);
        }
    };
            
            
    return (
        <Box p={2} inert={loading ? true : false}>
            <>
                <Box py={2}>
                    <TableView 
                        rows={masters.map((master, index) => ({
                            id: index + 1, // Add a unique ID
                            sl_no: index + 1,
                            template_name: master.name
                        }))} 
                        columns={columns} 
                        paginationCount={paginationCount} 
                    />
                </Box>

                    </>
            {
                loading && <div className='parent_spinner' tabIndex="-1" aria-hidden="true">
                    <CircularProgress size={100} />
                </div>
            }

        </Box>
    )

};

export default MastersView;