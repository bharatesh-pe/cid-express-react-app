import { Box, Typography } from "@mui/material";
import DynamicForm from '../components/dynamic-form/DynamicForm';
import { useLocation, useNavigate } from "react-router-dom";

const ViewTemplate = () => { // Component name starts with uppercase
    const location = useLocation();
    const navigate = useNavigate();

    const { formConfig, stepperData, table_name, exitLocation, template_name, pagination } = location.state || {};

    const BackOption = ()=>{
        navigate(exitLocation,{state:{pagination:pagination}});
    }

    return (
        <Box>
            <DynamicForm closeForm={BackOption} table_name={table_name} template_name={template_name} formConfig={formConfig} readOnly={false} stepperData={stepperData} />
        </Box>
    )
};

export default ViewTemplate;