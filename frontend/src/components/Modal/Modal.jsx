import React from 'react';
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import CheckIcon from "@mui/icons-material/Check";
import './Modal.css';

const Modal = ({
  title,
  onClose,
  onSave,
  children,
  headerContent = null,
  footerContent = null,
  closeButtonLabel = 'Cancel',
  saveButtonLabel = 'Save',
  visible,
  onHide
}) => {
  return (
    <Dialog
      open={visible}
      onClose={onHide}
      fullWidth
      maxWidth="md"
      sx={{
        "& .MuiDialog-paper": {
          width: "50vw",
          borderRadius: "12px",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          backgroundColor: "#f1f1f1", padding: "10px", paddingBottom: "0px", whiteSpace: "nowrap"
        }}
      >
        <div style={{ flexGrow: 1, overflow: "hidden", textOverflow: "ellipsis" }}>
          {headerContent ? headerContent : title}
        </div>

        <Button
          onClick={onHide}
          sx={{ color: "black", minWidth: "auto", padding: "5px", }}
        >
        </Button>
      </DialogTitle>

      <DialogContent
        sx={{
          marginTop: "20px",
        }}>
        <div>{children}</div>
      </DialogContent>

      <DialogActions sx={{ justifyContent: "flex-end", padding: "10px 20px" }}>
        {footerContent || (
          <>
            <Button
              onClick={onHide}
              variant="outlined"
              sx={{
                color: "black",
                borderColor: "#b7bbc2",
                "&:hover": {
                  backgroundColor: "#f1f5f9",
                },
              }}
            >
              {closeButtonLabel}
            </Button>
            <Button
              onClick={onSave}
              variant="contained"
              startIcon={<CheckIcon />}
              sx={{
                color: "white",
                backgroundColor: "#4caf50",
                "&:hover": {
                  backgroundColor: "#45a049",
                },
              }}
            >
              {saveButtonLabel}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>

  );
};

export default Modal;
