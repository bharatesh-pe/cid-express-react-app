import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    TextField,
    Button,
    IconButton,
    Box,
    Autocomplete,
} from "@mui/material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import CloseIcon from "@mui/icons-material/Close";
import dayjs from "dayjs";
import AutocompleteField from "../form/AutoComplete";
import DateField from "../form/Date";
import LongText from "../form/LongText";

export default function ApprovalModal({
    open,
    onClose,
    onSave,
    approvalItem,
    designationData,
    formData,
    onChange,
    disabledApprovalItems,
}) {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            aria-labelledby="approval-dialog-title"
            maxWidth="md"
            PaperProps={{
            sx: {
                zIndex: 1,
                borderRadius: 2,
                borderLeft: '8px solid #12B76A',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                overflow: 'hidden',
            }
            }}
            fullWidth
            className="approvalModal"
            sx={{ zIndex: "100" }}
        >

            <DialogTitle
                id="alert-dialog-title"
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: 'linear-gradient(to right, #E6F4EA, #F6FFFB)',
                    fontWeight: 'bold',
                    fontSize: '20px',
                    color: 'black',
                }}
                >
                Approval
                <Box>
                    <Button
                    variant="contained"
                    sx={{ backgroundColor: '#12B76A', color: 'white', mr: 1, textTransform: 'none' }}
                    onClick={onSave}
                    >
                    Submit
                    </Button>
                    <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{ color: '#344054' }}
                    >
                    <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>

            <DialogContent sx={{ backgroundColor: 'white', padding: 3 }}>
                <DialogContentText id="alert-dialog-description" component="div">
                    <Box sx={{ display: 'flex',
                        justifyContent: 'center',
                        fontWeight: 500,
                        fontSize: '16px',
                        mb: 2,
                        textAlign: 'center'
                    }}>
                    <span style={{ color: '#F04438' }}>Approval needed to proceed with: </span>
                    <span style={{ color: '#1570EF' }}>                        
                        {approvalItem.find(opt => opt.approval_item_id === formData?.approval_item)?.name || "Approval Item"}
                    </span>
                    </Box>
                    <Box
                        py={2}
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "18px",
                        }}
                    >

                        <Box sx={{ display: 'none' }}>
                            <label htmlFor="approval-item" 
                            style={{
                                margin: "0",
                                padding: 0, 
                                fontSize: "16px",
                                fontWeight: 500,
                                color: "#475467",
                                textTransform: "capitalize",
                            }}
                            >
                            Approval Item
                            </label>
                            <Autocomplete
                                options={approvalItem}
                                getOptionLabel={(option) => option.name || ""}
                                name="approval_item"
                                disabled={disabledApprovalItems}
                                sx={{marginTop: '10px'}}
                                value={
                                    approvalItem.find((opt) => opt.approval_item_id === formData?.approval_item ) || null
                                }
                                onChange={(e, value) =>
                                    onChange( "approval_item", value?.approval_item_id)
                                }
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        className="selectHideHistory"
                                        label="Approval Item"
                                    />
                                )}
                            />
                        </Box>

                    <Box sx={{ display: 'flex', gap: '16px', flexWrap: 'wrap', mb: 3 }}>
                        <Box sx={{ flex: 1, minWidth: '200px' }}>
                            <AutocompleteField
                            formData={formData}
                            options={designationData}
                            field={{
                                heading: 'Officer Approved',
                                label: 'Officer Approved',
                                name: 'approved_by',
                                options: designationData.map(item => ({
                                ...item,
                                code: item.designation_id,
                                name: item.designation_name,
                                })),
                                required: true,
                                info: 'Select the Officer Designation approving this item.',
                                supportingText: 'Select the Officer Designation approving this item.',
                                supportingTextColor: 'green'
                            }}
                            onChange={(name, value) => onChange(name, value)}
                            value={designationData.find(option => option.designation_id === formData?.approved_by) || null}
                            />
                        </Box>

                        <Box sx={{ flex: 1, minWidth: '200px' }}>
                        <DateField
                            field={{
                                heading: 'Date of Approval',
                                name: 'approval_date',
                                label: 'Date of Approval',
                                required: true,
                                disableFutureDate: 'true',
                                info: 'Pick the date on which the approval is being granted.',
                                supportingText: 'Pick the date on which the approval is being granted.',
                                supportingTextColor: 'green'
                            }}
                            formData={formData}
                            value={
                                formData?.approval_date && dayjs(formData.approval_date).isValid()
                                ? dayjs(formData.approval_date)
                                : undefined
                            }
                            onChange={(newVal) => {
                                const isoDate = newVal ? dayjs(newVal).toISOString() : null;
                                onChange("approval_date", isoDate);
                            }}
                            
                            />
                        </Box>
                    </Box>
                        <LongText
                            field={{
                            heading: 'Remarks of Approval Officer',
                            name: 'remarks',
                            label: 'Remarks of Approval Officer',
                            required: true,
                            info: 'Provide any comments or reasoning related to this approval.',
                            supportingText: 'Provide any comments or reasoning related to this approval.',
                            supportingTextColor: 'green'
                            }}
                            value={formData?.remarks}
                            formData={formData}
                            onChange={(e) => onChange("remarks", e.target.value)}
                        />

                    </Box>
                </DialogContentText>
            </DialogContent>
        </Dialog>
    );
}
