import * as React from 'react';
import { DataGrid, GridRowModes, GridRowModesModel, GridActionsCellItem, GridRowEditStopReasons } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import {
  Box, Button, IconButton, Menu, MenuItem, Pagination, PaginationItem, Stack, Tooltip
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AutofpsSelectIcon from '@mui/icons-material/AutofpsSelect';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

export default function EditTableView({
  rows: propRows, columns: propColumns, checkboxSelection, getRowId,
  backBtn, nextBtn, handleNext, handleBack, handleRowClick,
  hoverTable, hoverTableOptions, hoverActionFuncHandle,
  totalPage, paginationCount, handlePagination, totalRecord,
  getRowClassName, tableName, highLightedRow,
  onRowUpdate,
  fieldDefinitions // <-- new prop, pass the field definitions array here
}) {
  // Row editing handlers
  const [rows, setRows] = React.useState(propRows);
  const [rowModesModel, setRowModesModel] = React.useState({});
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [selectedRow, setSelectedRow] = React.useState(null);

  // Sync local rows with propRows if changed externally
  React.useEffect(() => {
    setRows(propRows);
  }, [propRows]);

  const handleMenuOpen = (event, row) => {
    setAnchorEl(event.currentTarget);
    setSelectedRow((prev) => (prev?.id === row.id ? null : row));
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRow(null);
  };

  const handleHoverOptionClick = (option) => {
    if (option && typeof option.onclick === "function") {
      option.onclick(selectedRow);
    } else {
      hoverActionFuncHandle(option, selectedRow);
    }
    handleMenuClose();
  };

  const handleRowEditStop = (params, event) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  const handleEditClick = (id) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

  const handleSaveClick = (id) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
  };

  const handleCancelClick = (id) => () => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    });
    const editedRow = rows.find((row) => row.id === id);
    if (editedRow && editedRow.isNew) {
      setRows(rows.filter((row) => row.id !== id));
    }
  };

  // Build a map for quick lookup by field name
  const fieldDefMap = React.useMemo(() => {
    const map = {};
    if (Array.isArray(fieldDefinitions)) {
      fieldDefinitions.forEach(f => { map[f.name] = f; });
    }
    return map;
  }, [fieldDefinitions]);

  // Helper to get valueOptions for a column from fieldDefinitions
  const getValueOptions = (col) => {
    const fieldDef = fieldDefMap[col.field];
    if (
      (fieldDef && (fieldDef.type === 'dropdown' || fieldDef.type === 'autocomplete') && Array.isArray(fieldDef.options))
    ) {
      return fieldDef.options;
    }
    if (col.valueOptions) {
      return col.valueOptions;
    }
    if (col.type === 'autocomplete' && Array.isArray(col.options)) {
      return col.options;
    }

    return undefined;
  };

  // Helper to get type for a column from fieldDefinitions
  const getColType = (col) => {
    const fieldDef = fieldDefMap[col.field];
    if (!fieldDef) return col.type;
    if (fieldDef.type === 'dropdown' || fieldDef.type === 'autocomplete') return 'autocomplete';
    if (fieldDef.type === 'file' || fieldDef.type === 'profilepicture') return 'file';
    if (fieldDef.type === 'date') return 'date';
    if (fieldDef.type === 'number') return 'number';
    return col.type;
  };

  // Helper to get dropdown value from label (for saving)
  const getDropdownValue = (col, valueOrLabel) => {
    const options = getValueOptions(col);
    if (!options) return valueOrLabel;
    if (typeof options[0] === 'object') {
      const found = options.find(opt => opt.label === valueOrLabel || opt.value === valueOrLabel);
      return found ? found.value : valueOrLabel;
    }
    return valueOrLabel;
  };

  // Actions column definition
  const actionsColumn = {
    field: 'actions',
    type: 'actions',
    headerName: 'Actions',
    width: 100,
    cellClassName: 'actions',
    getActions: ({ id }) => {
      const isInEditMode = rowModesModel[id]?.mode === 'edit';
      if (isInEditMode) {
        return [
          <GridActionsCellItem
            icon={<SaveIcon />}
            label="Save"
            onClick={handleSaveClick(id)}
            color="primary"
          />,
          <GridActionsCellItem
            icon={<CancelIcon />}
            label="Cancel"
            onClick={handleCancelClick(id)}
            color="inherit"
          />,
        ];
      }
      return [
        <GridActionsCellItem
          icon={<EditIcon />}
          label="Edit"
          onClick={handleEditClick(id)}
          color="inherit"
        />,
      ];
    },
  };

  // Compose columns: actions + propColumns (editable, with type/options from fieldDefinitions)
  const updatedColumns = [
    actionsColumn,
    ...propColumns.map(col => {
      const colType = getColType(col);
      // Dropdown or Autocomplete (singleSelect)
      if (
        ((colType === 'autocomplete' || colType === 'singleSelect') && getValueOptions(col)) ||
        (fieldDefMap[col.field] && (fieldDefMap[col.field].type === 'autocomplete' || fieldDefMap[col.field].type === 'dropdown'))
      ) {
        const options = getValueOptions(col);
        return {
          ...col,
          editable: true,
          type: 'singleSelect',
          valueOptions: options,
          renderEditCell: undefined, // Let DataGrid use its default dropdown
          valueFormatter: (params) => {
            const opts = getValueOptions(col);
            if (!opts) return params.value;
            if (typeof opts[0] === 'object') {
              const found = opts.find(opt => opt.value === params.value);
              return found ? found.label : params.value;
            }
            return params.value;
          }
        };
      }
      if (colType === 'file') {
        return {
          ...col,
          editable: false,
          renderCell: (params) => {
            // If file exists, show icon and disable further upload in this cell
            if (params.value) {
              return (
                <Tooltip title={typeof params.value === 'string' ? params.value.split('/').pop() : (params.value.name || '')}>
                  <IconButton
                    size="small"
                    onClick={e => {
                      e.stopPropagation();
                      // If it's a File object, create a URL for preview
                      if (params.value instanceof File) {
                        const url = URL.createObjectURL(params.value);
                        window.open(url, '_blank', 'noopener,noreferrer');
                        // Optionally revoke the object URL after some time
                        setTimeout(() => URL.revokeObjectURL(url), 1000);
                      } else {
                        window.open(params.value, '_blank', 'noopener,noreferrer');
                      }
                    }}
                  >
                    <AttachFileIcon />
                  </IconButton>
                </Tooltip>
              );
            }
            // Only allow upload if no file is present
            return (
              <Tooltip title="Upload File">
                <IconButton
                  size="small"
                  component="label"
                  onClick={e => e.stopPropagation()}
                >
                  <AddCircleOutlineIcon color="primary" />
                  <input
                    type="file"
                    hidden
                    onChange={event => {
                      const file = event.target.files[0];
                      if (file) {
                        const rowId = params.id;
                        setRowModesModel(prev => ({
                          ...prev,
                          [rowId]: { mode: GridRowModes.Edit }
                        }));
                        setRows(prevRows =>
                          prevRows.map(row =>
                            row.id === rowId
                              ? { ...row, [col.field]: file }
                              : row
                          )
                        );
                        // Optionally, update the propRows if you want to persist immediately
                        // If you want to update the backend immediately, call onRowUpdate here as well
                      }
                    }}
                    // Disable input if file already exists
                    disabled={!!params.value}
                  />
                </IconButton>
              </Tooltip>
            );
          }
        };
      }
      // Date
      if (colType === 'date') {
        return {
          ...col,
          editable: true,
          type: 'date',
          valueGetter: (params) => {
            if (!params.value) return null;
            if (params.value instanceof Date) return params.value;
            const d = new Date(params.value);
            return isNaN(d.getTime()) ? null : d;
          },
          valueFormatter: (params) => {
            if (!params.value) return '';
            const d = params.value instanceof Date ? params.value : new Date(params.value);
            return isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-GB');
          }
        };
      }
      // Number
      if (colType === 'number') {
        return {
          ...col,
          editable: true,
          type: 'number',
          valueParser: (value) => Number(value)
        };
      }
      // Default
      return { ...col, editable: true };
    })
  ];

  const getRowClassNameInternal = (params) => {
    if (highLightedRow && typeof highLightedRow === "function" && highLightedRow(params.row)) {
      return 'red-row';
    }
    return getRowClassName;
  };

  const pageSize = 10;
  const startRecord = rows.length === 0 ? 0 : (paginationCount - 1) * pageSize + 1;
  const endRecord = rows.length === 0 ? rows.length : Math.min(paginationCount * pageSize, totalRecord);

  // Define handlers BEFORE JSX usage
  const handleRowModesModelChange = (newRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  const processRowUpdate = async (newRow) => {
    let updatedRow = { ...newRow, isNew: false };
    propColumns.forEach(col => {
      if (col.type === 'autocomplete' && getValueOptions(col)) {
        updatedRow[col.field] = getDropdownValue(col, updatedRow[col.field]);
      }
      if (col.type === 'date' && updatedRow[col.field] instanceof Date) {
        updatedRow[col.field] = updatedRow[col.field].toISOString().split('T')[0];
      }
    });
    setRows((prev) => prev.map((row) => (row.id === newRow.id ? updatedRow : row)));
    if (onRowUpdate) {
      await onRowUpdate(updatedRow, tableName); // <-- ensure tableName is passed here
    }
    return updatedRow;
  };

  return (
    <Box sx={{ margin: "6px" }}>
      <Paper sx={{ width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={updatedColumns}
          getRowId={getRowId}
          rowHeight={45}
          className={`FigmaTableView ${tableName && (tableName === "cid_ui_case_accused" || tableName === "cid_pt_case_witness") ? 'excelViewTable' : ''}`}
          disableColumnMenu
          disableColumnSorting
          hideFooter
          checkboxSelection={checkboxSelection}
          disableRowSelectionOnClick
          stickyHeader
          editMode="row"
          rowModesModel={rowModesModel}
          onRowModesModelChange={handleRowModesModelChange}
          onRowEditStop={handleRowEditStop}
          processRowUpdate={processRowUpdate}
          onProcessRowUpdateError={(error) => console.error("Update error:", error)}
          onRowClick={(params) => handleRowClick && handleRowClick(params.row)}
          getRowClassName={getRowClassNameInternal}
          experimentalFeatures={{ newEditingApi: true }}
        />
      </Paper>

      {/* Hover Menu */}
      {hoverTable &&
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
          {[
            ...(hoverTableOptions || []).map((option) => {
              const isCaseExtension = option.name?.toLowerCase() === "case extension";
              const shouldDisable = selectedRow?.isDisabled && !(isCaseExtension && selectedRow?.allowCaseExtension);
              return { ...option, disabled: shouldDisable };
            }),
            ...(selectedRow?.extraHoverOptions || []),
          ].map((option, index) => {
            if (
              selectedRow?.field_io_name !== null &&
              selectedRow?.field_io_name !== "" &&
              option?.name?.toLowerCase() === "assign to io"
            ) return null;

            if ((!option?.field && option?.table) || option?.caseView) return null;

            return (
              <MenuItem
                key={index}
                className="actionHoverOnTable"
                onClick={() => !option.disabled && handleHoverOptionClick(option)}
                sx={{ display: "flex", alignItems: "start", height: "40px" }}
                disabled={(selectedRow?.field_io_name == null && option?.name.toLowerCase() !== "assign to io") || option.disabled === true}
              >
                {option?.icon ? (
                  typeof option.icon === "function" ? option.icon() : (
                    <span className="tableActionIcon" dangerouslySetInnerHTML={{ __html: option.icon }} />
                  )
                ) : (
                  <span className="tableActionIcon" />
                )}
                <span style={{ marginTop: "3px" }}>{option?.name}</span>
              </MenuItem>
            );
          })}
        </Menu>
      }

      {/* Pagination or Back/Next */}
      {handlePagination && paginationCount ? (
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }} pt={2}>
          <p style={{ fontSize: '14px' }}>{startRecord} - {endRecord} of {totalRecord}</p>
          <Stack spacing={2} direction="row" justifyContent="center">
            <Pagination
              count={totalPage}
              page={paginationCount}
              onChange={(event, page) => handlePagination(page)}
              renderItem={(item) => (
                <PaginationItem
                  {...item}
                  disabled={item.page === "..." || (item.type === "previous" && paginationCount === 1) || (item.type === "next" && paginationCount === totalPage)}
                  sx={{
                    mx: 0.5,
                    cursor: item.page === "..." ? "default" : "pointer",
                    backgroundColor: paginationCount === item.page ? "#1976d2" : "transparent",
                    color: paginationCount === item.page ? "#fff" : "inherit",
                  }}
                />
              )}
            />
          </Stack>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }} pt={2}>
          {handleBack && handleNext && (
            <>
              <Button disabled={!backBtn} onClick={handleBack} sx={{ textTransform: 'none' }}>
                <ArrowBackIcon /> Back
              </Button>
              <Button disabled={!nextBtn} onClick={handleNext} sx={{ textTransform: 'none' }}>
                Next <ArrowForwardIcon />
              </Button>
            </>
          )}
        </Box>
      )}
    </Box>
  );
}
