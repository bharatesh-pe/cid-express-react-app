import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { Box, Button, Typography } from "@mui/material";
import LokayuktaSidebar from "../components/lokayuktaSidebar";
import { West } from "@mui/icons-material";

import NormalViewForm from "../components/dynamic-form/NormalViewForm";
import TableView from "../components/table-view/TableView";

const LokayuktaView = () => {

    const navigate = useNavigate();
    const { state } = useLocation();
    const { contentArray, headerDetails, backNavigation, paginationCount, sysStatus, rowData, tableFields, stepperData, template_id, template_name, table_name } = state || {};

    const [activeSidebar, setActiveSidebar] = useState(null);

    const [sidebarContentArray, setSidebarContentArray] = useState(contentArray ? JSON.parse(contentArray) : []);

    const [formReadFlag, setFormReadFlag] = useState(true);
    const [formEditFlag, setFormEditFlag] = useState(false);
    
    const [templateFields, setTemplateFields] = useState(tableFields || []);
    const [initialRowData, setInitialRowData] = useState(rowData || {});
    const [stepperConfig, setStepperConfig] = useState(stepperData || []);

    const [tableName, setTableName] = useState(table_name || null);
    const [templateName, setTemplateName] = useState(template_name || null);

    const [tableRowId, setTableRowId] = useState(rowData?.id || null);
    const [templateId, setTemplateId] = useState(template_id || null);


    const [tableViewFlag, setTableViewFlag] = useState(false);
    const [tableColumnData, setTableColumnData] = useState([
        { field: 'sl_no', headerName: 'Sl. No.' },
    ]);
    const [tableRowData, setTableRowData] = useState([]);

    var userPermissions = JSON.parse(localStorage.getItem("user_permissions")) || [];

    const backToForm = ()=>{

        if(backNavigation){

            var stateObj = {
                pageCount: paginationCount,
                systemStatus: sysStatus
            }

            navigate(backNavigation, {state : stateObj});
        }
    }

    const sidebarActive = (item)=>{
        setActiveSidebar(item);
        if(item?.viewAction){
            setTableViewFlag(false);
            setTemplateId(template_id);
            setTableRowId(rowData?.id);
            setTemplateName(template_name);
            setTableName(table_name);
            setStepperConfig(stepperData);
            setInitialRowData(rowData);
            setTemplateFields(tableFields);
            setFormEditFlag(false);
            setFormReadFlag(true);
            return;
        }else{
            setTableViewFlag(true);
            getTableData(item);
        }
    }

    const getTableData = (option) => {
        console.log(option,"option");
    }

    useEffect(()=>{
        setActiveSidebar(sidebarContentArray?.[0] || null)
    },[]);


    const formSubmit = (data)=>{
        console.log(data,"data");
    }

    const formUpdate = (data)=>{
        console.log(data,"data");
    }

    const formError = (error)=>{
        console.log(error,"error");
    }

    return (
        <Box sx={{ display: "flex" }}>

            <LokayuktaSidebar contentArray={sidebarContentArray} onClick={sidebarActive} activeSidebar={activeSidebar} />

            <Box width={'100%'}>

                {/* header content */}
                {/* <Box sx={{display: 'none', justifyContent: 'space-between', borderBottom: '1px solid #D0D5DD', height: '55.5px', padding: '3px 12px'}}>

                    <Typography
                        sx={{ fontSize: "19px", fontWeight: "500", color: "#171A1C", display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
                        className="Roboto"
                        onClick={backToForm}
                    >
                        <West />
                        {headerDetails || "Case Details"}
                    </Typography>

                    <Box sx={{display: 'flex', alignItems: 'center', gap: '6px'}}>
                        {
                            userPermissions[0]?.case_details_download && 
                            <Button
                                sx={{
                                    background: "#0167F8",
                                    borderRadius: "8px",
                                    fontSize: "14px",
                                    fontWeight: "500",
                                    color: "#FFFFFF",
                                    padding: "6px 16px",
                                }}
                                className="Roboto GreenFillBtn"
                            >
                                Download
                            </Button>
                        }
                        {
                            userPermissions[0]?.case_details_print && 
                            <Button
                                sx={{
                                    background: "#0167F8",
                                    borderRadius: "8px",
                                    fontSize: "14px",
                                    fontWeight: "500",
                                    color: "#FFFFFF",
                                    padding: "6px 16px",
                                }}
                                className="Roboto GreenFillBtn"
                            >
                                Print
                            </Button>
                        }
                        <Button
                            sx={{
                                background: "#0167F8",
                                borderRadius: "8px",
                                fontSize: "14px",
                                fontWeight: "500",
                                color: "#FFFFFF",
                                padding: "6px 16px",
                            }}
                            className="Roboto blueButton"
                        >
                            Update Case
                        </Button>
                    </Box>

                </Box> */}

                {/* body content */}
                <Box sx={{overflow: 'auto', height: '100vh'}}>

                    {
                        !tableViewFlag ?

                        <NormalViewForm 
                            table_row_id={tableRowId}
                            template_id={templateId}
                            template_name={templateName}
                            table_name={tableName}
                            readOnly={formReadFlag}
                            editData={formEditFlag}
                            initialData={initialRowData}
                            formConfig={templateFields}
                            stepperData={stepperConfig}
                            onSubmit={formSubmit}
                            onUpdate={formUpdate}
                            onError={formError}
                            headerDetails={headerDetails || "Case Details"}
                            closeForm={backToForm}
                            noPadding={true}
                        />

                        :
                        <Box p={2}>
                            <Typography
                                px={1}
                                pb={1}
                                sx={{ fontSize: "19px", fontWeight: "500", color: "#171A1C", display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
                                className="Roboto"
                                onClick={backToForm}
                            >
                                <West />
                                {headerDetails || "Case Details"}
                            </Typography>    
                            <TableView
                                rows={tableRowData} 
                                columns={tableColumnData}
                            />
                        </Box>
                    }                    

                </Box>

            </Box>
        </Box>
    );
};

export default LokayuktaView;
