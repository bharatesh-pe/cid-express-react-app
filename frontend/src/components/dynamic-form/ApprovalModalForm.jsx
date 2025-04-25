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
            className="approvalModal"
            sx={{ zIndex: "100" }}
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

                        <Box>
                            <label
                            htmlFor="approval-item"
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
                        <Box>
                            <label
                                htmlFor="designation"
                                style={{
                                    margin: "0",
                                    padding: 0, 
                                    fontSize: "16px",
                                    fontWeight: 500,
                                    color: "#475467",
                                    textTransform: "capitalize",
                                }}
                            >
                                Designation
                            </label>
                            <Autocomplete
                                options={designationData}
                                getOptionLabel={(option) =>
                                    option.designation_name || ""
                                }
                                sx={{marginTop: '10px'}}
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
                        </Box>
                        <Box>
                            <label
                                htmlFor="approval-date"
                                style={{
                                    margin: "0",
                                    padding: 0, 
                                    fontSize: "16px",
                                    fontWeight: 500,
                                    color: "#475467",
                                    textTransform: "capitalize",
                                }}
                            >
                                Approval Date
                            </label>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DemoContainer components={["DatePicker"]}>
                                    <DatePicker
                                        label="Approval Date"
                                        format="DD/MM/YYYY"
                                        sx={{width: '100%', marginTop: '10px'}}
                                        value={
                                            formData?.approval?.approval_date ? dayjs(formData?.approval_date) : null
                                        }
                                        onChange={(newVal) =>
                                            onChange(
                                            "approval_date",
                                            dayjs.isDayjs(newVal) ? newVal.toISOString() : null
                                            )
                                        }
                                        maxDate={dayjs()}
                                    />
                                </DemoContainer>
                            </LocalizationProvider>
                        </Box>
                        <Box>
                            <label
                                htmlFor="comments"
                                style={{
                                    margin: "0",
                                    padding: 0, 
                                    fontSize: "16px",
                                    fontWeight: 500,
                                    color: "#475467",
                                    textTransform: "capitalize",
                                }}
                            >
                                Comments
                            </label>
                            <TextField
                                rows={8}
                                multiline
                                label="Comments"
                                fullWidth
                                name="remarks"
                                value={formData?.remarks}
                                sx={{marginTop: '10px'}}
                                onChange={(e) =>
                                    onChange("remarks", e.target.value)
                                }
                            />
                        </Box>
                    </Box>
                </DialogContentText>
            </DialogContent>
        </Dialog>
    );
}
