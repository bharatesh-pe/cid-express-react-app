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
            maxWidth="lg"
            fullWidth
            sx={{ zIndex: "99" }}
        >
            <DialogTitle
                id="approval-dialog-title"
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                }}
            >
                Approval
                <Box>
                    <Button variant="outlined" onClick={onSave}>
                        Save
                    </Button>
                    <IconButton
                        aria-label="close"
                        onClick={onClose}
                        sx={{ color: (theme) => theme.palette.grey[500] }}
                    >
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>

            <DialogContent>
                <DialogContentText>
                    <Box
                        py={2}
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "18px",
                        }}
                    >
                        <Autocomplete
                            options={approvalItem}
                            getOptionLabel={(option) => option.name || ""}
                            name="approval_item"
                            disabled={disabledApprovalItems}
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

                        <Autocomplete
                            options={designationData}
                            getOptionLabel={(option) =>
                                option.designation_name || ""
                            }
                            name="approved_by"
                            value={
                                designationData.find((opt) => opt.designation_id === formData?.approved_by) || null
                            }
                            onChange={(e, value) =>
                                onChange( "approved_by", value?.designation_id)
                            }
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    className="selectHideHistory"
                                    label="Designation"
                                />
                            )}
                        />

                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DemoContainer components={["DatePicker"]}>
                                <DatePicker
                                    label="Approval Date"
                                    format="DD/MM/YYYY"
                                    sx={{width: '100%'}}
                                    value={
                                        formData?.approval?.approval_date ? dayjs(formData?.approval_date) : null
                                    }
                                    onChange={(newVal) =>
                                        onChange( "approval_date",dayjs.isDayjs(newVal) ? newVal.toISOString() : null)
                                    }
                                />
                            </DemoContainer>
                        </LocalizationProvider>

                        <TextField
                            rows={8}
                            multiline
                            label="Comments"
                            fullWidth
                            name="remarks"
                            value={formData?.remarks}
                            onChange={(e) =>
                                onChange("remarks", e.target.value)
                            }
                        />
                    </Box>
                </DialogContentText>
            </DialogContent>
        </Dialog>
    );
}
