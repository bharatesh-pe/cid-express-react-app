import React, { useEffect, useState } from "react";
import { Box, CircularProgress } from "@mui/material";
import NormalViewForm from "../components/dynamic-form/NormalViewForm";
import api from "../services/api";
import { toast } from "react-toastify";

const ClosureReport = ({
    templateName,
    headerDetails,
    rowId,
    options,
    selectedRowData,
    backNavigation
}) => {
    const [loading, setLoading] = useState(false);
    const [record, setRecord] = useState(null);
    const [formFields, setFormFields] = useState([]);
    const [stepperData, setStepperData] = useState([]);
    const [templateId, setTemplateId] = useState(null);
    const [formOpen, setFormOpen] = useState(false);
    const [readOnly, setReadOnly] = useState(false);
    const [editMode, setEditMode] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const templateRes = await api.post("/templates/viewTemplate", { table_name: options.table });
            if (templateRes?.success) {
                setFormFields(templateRes.data.fields || []);
                setStepperData(templateRes.data.sections || []);
                setTemplateId(templateRes.data.template_id);
            }
            const dataRes = await api.post("/templateData/getTemplateData", {
                table_name: options.table,
                ui_case_id: selectedRowData?.id,
                pt_case_id: selectedRowData?.pt_case_id,
                limit: 1,
                page: 1
            });
            if (dataRes?.success && dataRes.data?.length > 0) {
                setRecord(dataRes.data[0]);
                setReadOnly(true);
                setEditMode(false);
            } else {
                setRecord(null);
                setReadOnly(false);
                setEditMode(false);
            }
            setFormOpen(true);
        } catch (err) {
            toast.error("Failed to load closure report data");
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, [rowId, options.table]);

    const handleSubmit = async (data) => {
        if (!options.table || options.table === "") {
            toast.warning("Please Check The Template", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                className: "toast-warning",
            });
            return;
        }
        if (Object.keys(data).length === 0) {
            toast.warning("Data Is Empty Please Check Once", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                className: "toast-warning",
            });
            return;
        }

        const formData = new FormData();
        let normalData = {};

        formFields.forEach((field) => {
            if (data[field.name]) {
                if (field.type === "file" || field.type === "profilepicture") {
                    if (Array.isArray(data[field.name])) {
                        data[field.name].forEach((file) => {
                            if (file.filename instanceof File) {
                                formData.append(field.name, file.filename);
                            }
                        });
                    } else {
                        formData.append(field.name, data[field.name]);
                    }
                } else {
                    normalData[field.name] = Array.isArray(data[field.name]) ? data[field.name].join(",") : data[field.name];
                }
            }
        });

        normalData.sys_status = "eq_case";
        normalData["ui_case_id"] = selectedRowData?.id;
        normalData["pt_case_id"] = selectedRowData?.pt_case_id;

        formData.append("table_name", options.table);
        formData.append("data", JSON.stringify(normalData));
        formData.append("transaction_id", `pt_${Date.now()}_${Math.floor(Math.random() * 10000)}`);
        formData.append("user_designation_id", localStorage.getItem('designation_id') || null);
        formData.append("others_data", JSON.stringify({}));

        setLoading(true);

        try {
            const saveResponse = await api.post("/templateData/saveDataWithApprovalToTemplates", formData);
            setLoading(false);

            if (saveResponse && saveResponse.success) {
                toast.success(saveResponse.message || "Closure Report Saved", {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    className: "toast-success"
                });
                fetchData();
            } else {
                toast.error(saveResponse.message || "Failed to Add Closure Report. Please try again.", {
                    position: "top-right",
                    autoClose: 3000,
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
            toast.error(
                error?.response?.data?.message || "Please Try Again !", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                className: "toast-error",
            });
        }
    };

    const handleUpdate = async (data) => {
        if (!options.table || options.table === "") {
            toast.warning("Please Check The Template", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                className: "toast-warning",
            });
            return;
        }
        if (Object.keys(data).length === 0) {
            toast.warning("Data Is Empty Please Check Once", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                className: "toast-warning",
            });
            return;
        }

        const formData = new FormData();
        let normalData = {};

        formFields.forEach((field) => {
            if (data[field.name]) {
                if (field.type === "file" || field.type === "profilepicture") {
                    if (Array.isArray(data[field.name])) {
                        data[field.name].forEach((file) => {
                            if (file.filename instanceof File) {
                                formData.append(field.name, file.filename);
                            }
                        });
                    } else {
                        formData.append(field.name, data[field.name]);
                    }
                } else {
                    normalData[field.name] = Array.isArray(data[field.name]) ? data[field.name].join(",") : data[field.name];
                }
            }
        });

        normalData.sys_status = "eq_case";
        normalData["ui_case_id"] = selectedRowData?.id;
        normalData["pt_case_id"] = selectedRowData?.pt_case_id;

        formData.append("table_name", options.table);
        formData.append("data", JSON.stringify(normalData));
        formData.append("id", record?.id);
        formData.append("transaction_id", `pt_${Date.now()}_${Math.floor(Math.random() * 10000)}`);
        formData.append("user_designation_id", localStorage.getItem('designation_id') || null);
        formData.append("others_data", JSON.stringify({}));

        setLoading(true);

        try {
            const updateResponse = await api.post("/templateData/updateDataWithApprovalToTemplates", formData);
            setLoading(false);

            if (updateResponse && updateResponse.success) {
                toast.success(updateResponse.message || "Closure Report Updated", {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    className: "toast-success"
                });
                fetchData();
            } else {
                toast.error(updateResponse.message || "Failed to Update Closure Report.", {
                    position: "top-right",
                    autoClose: 3000,
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
            toast.error(
                error?.response?.data?.message || "Please Try Again !", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                className: "toast-error",
            });
        }
    };

    const handleEdit = () => {
        setReadOnly(false);
        setEditMode(true);
    };

    return (
        <Box sx={{ overflow: "auto", height: "100vh" }}>
            {loading && (
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
                    <CircularProgress />
                </Box>
            )}
            {!loading && formOpen && (
                <NormalViewForm
                    table_row_id={record?.id || null}
                    template_id={templateId}
                    template_name={ "Closure Report"}
                    table_name={options.table}
                    readOnly={readOnly}
                    editData={editMode}
                    initialData={record || {}}
                    formConfig={formFields}
                    stepperData={stepperData}
                    onSubmit={handleSubmit}
                    onUpdate={handleUpdate}
                    onError={() => {}}
                    headerDetails={headerDetails || "Closure Report"}
                    closeForm={backNavigation}
                    noPadding={true}
                    showUpdateButton={!!record}
                    onEdit={handleEdit}
                />
            )}
        </Box>
    );
};

export default ClosureReport;
