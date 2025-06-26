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
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ImageIcon from '@mui/icons-material/Image';
import DescriptionIcon from '@mui/icons-material/Description';
import TableChartIcon from '@mui/icons-material/TableChart';
import SlideshowIcon from '@mui/icons-material/Slideshow';

const EditTableView = React.forwardRef(function EditTableView({
  rows: propRows, columns: propColumns, checkboxSelection, getRowId,
  backBtn, nextBtn, handleNext, handleBack, handleRowClick,
  hoverTable, hoverTableOptions, hoverActionFuncHandle,
  totalPage, paginationCount, handlePagination, totalRecord,
  getRowClassName, tableName, highLightedRow,
  onRowUpdate,
  onBatchRowUpdate, // <-- new prop for batch update
  fieldDefinitions, // <-- new prop, pass the field definitions array here
},ref) {
  // Row editing handlers
  const [rows, setRows] = React.useState(propRows);
  const [rowModesModel, setRowModesModel] = React.useState({});
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [selectedRow, setSelectedRow] = React.useState(null);
  const [editedRows, setEditedRows] = React.useState({});

  // Sync local rows with propRows if changed externally
React.useEffect(() => {
  setRows(propRows);

  // Automatically enable edit mode for all rows
  const initialRowModes = {};
  propRows.forEach((row) => {
    initialRowModes[row.id] = { mode: GridRowModes.Edit };
  });
  setRowModesModel(initialRowModes);

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

  const handleSaveClick = (id) => async () => {
    const row = rows.find((r) => r.id === id);
    if (!row) return;

    try {
      const updatedRow = await processRowUpdate(row);
      setRows((prev) => prev.map((r) => (r.id === id ? updatedRow : r)));

      setRowModesModel((prevModel) => ({
        ...prevModel,
        [id]: { mode: GridRowModes.Edit },
      }));
    } catch (error) {
      console.error("Save failed:", error);
    }
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

  const getFileIcon = (fileName) => {
    if (!fileName || typeof fileName !== "string") return <InsertDriveFileIcon />;

    const extension = fileName.split(".").pop().toLowerCase();

    switch (extension) {
      case 'pdf':
        return <PictureAsPdfIcon color="error" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'svg':
      case 'gif':
        return <ImageIcon color="primary" />;
      case 'xls':
      case 'xlsx':
        return <TableChartIcon color="success" />;
      case 'csv':
      case 'doc':
      case 'docx':
        return <DescriptionIcon />;
      case 'ppt':
        return <SlideshowIcon color="warning" />;
      default:
        return <InsertDriveFileIcon />;
    }
  };


  // Actions column definition
  // const actionsColumn = {
  //   field: 'actions',
  //   type: 'actions',
  //   headerName: 'Actions',
  //   width: 100,
  //   cellClassName: 'actions',
  //   getActions: ({ id }) => {
  //     const isInEditMode = rowModesModel[id]?.mode === 'edit';
  //     if (isInEditMode) {
  //       return [
  //         // <GridActionsCellItem
  //         //   icon={<SaveIcon />}
  //         //   label="Save"
  //         //   onClick={handleSaveClick(id)}
  //         //   color="primary"
  //         // />,
  //         // <GridActionsCellItem
  //         //   icon={<CancelIcon />}
  //         //   label="Cancel"
  //         //   onClick={handleCancelClick(id)}
  //         //   color="inherit"
  //         // />,
  //       ];
  //     }
  //     return [
  //       // <GridActionsCellItem
  //       //   icon={<EditIcon />}
  //       //   label="Edit"
  //       //   onClick={handleEditClick(id)}
  //       //   color="inherit"
  //       // />,
  //     ];
  //   },
  // };

  // Compose columns: actions + propColumns (editable, with type/options from fieldDefinitions)
  const updatedColumns = [
    // actionsColumn,
    ...propColumns.map(col => {
      // Make S.No column non-editable
      if (col.field === 'sl_no') {
        return { ...col, editable: false };
      }
      const colType = getColType(col);
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
          renderEditCell: undefined,
          valueFormatter: (params) => {
            if (!params || params.value == null) return '';
            const opts = getValueOptions(col);
            if (!opts) return params.value;

            if (Array.isArray(opts) && typeof opts[0] === 'object') {
              const found = opts.find(opt =>
                opt != null && (opt.value === params.value || opt.label === params.value)
              );
              return found?.label ?? params.value;
            }

            return params.value;
          },
        };
      }
      if (colType === 'file') {
        return {
          ...col,
          editable: false,
          renderCell: (params) => {
            const file = params.value;
            const fileName = typeof file === 'string'
              ? file.split('/').pop()
              : file?.name || '';

            return (
              <Tooltip title={fileName || "Upload File"}>
                <IconButton
                  size="small"
                  component="label"
                  onClick={e => e.stopPropagation()}
                >
                  {file ? (
                    <>
                      <AttachFileIcon fontSize="small" sx={{ mr: 0.5 }} />
                      <span style={{ fontSize: "12px", whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '80px' }}>
                        {fileName}
                      </span>
                    </>
                  ) : (
                    <AddCircleOutlineIcon color="primary" />
                  )}
                  <input
                    type="file"
                    hidden
                    onChange={event => {
                      const newFile = event.target.files[0];
                      if (newFile) {
                        const rowId = params.id;
                        setRowModesModel(prev => ({
                          ...prev,
                          [rowId]: { mode: GridRowModes.Edit }
                        }));
                        setRows(prevRows =>
                          prevRows.map(row =>
                            row.id === rowId
                              ? { ...row, [col.field]: newFile }
                              : row
                          )
                        );
                      }
                    }}
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
    return '';
  };

  const pageSize = 10;
  const startRecord = rows.length === 0 ? 0 : (paginationCount - 1) * pageSize + 1;
  const endRecord = rows.length === 0 ? rows.length : Math.min(paginationCount * pageSize, totalRecord);

  // Define handlers BEFORE JSX usage
  const handleRowModesModelChange = (newRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  // Track edited rows
  const processRowUpdate = async (newRow) => {
    let updatedRow = { ...newRow, isNew: false };
    propColumns.forEach(col => {
      // Use getColType to get the correct type from fieldDefinitions
      const colType = getColType(col);
      if ((colType === 'autocomplete' || colType === 'singleSelect') && getValueOptions(col)) {
        updatedRow[col.field] = getDropdownValue(col, updatedRow[col.field]);
      }
      if (colType === 'date' && updatedRow[col.field] instanceof Date) {
        updatedRow[col.field] = updatedRow[col.field].toISOString().split('T')[0];
      }
    });
    // Log the row being updated and its values
    console.log("processRowUpdate called for row:", updatedRow.id, updatedRow);
    setRows((prev) => prev.map((row) => (row.id === newRow.id ? updatedRow : row)));
    // Track edited row
    setEditedRows(prev => ({ ...prev, [updatedRow.id]: updatedRow }));
    if (onRowUpdate) {
      await onRowUpdate(updatedRow, tableName);
    }
    return updatedRow;
  };

  React.useImperativeHandle(
    ref,
    () => ({
      getRows: () => {
        const mappedRows = rows.map(row => {
          const updatedRow = { ...row };
          propColumns.forEach(col => {
            const colType = getColType(col);
            if ((colType === 'autocomplete' || colType === 'singleSelect') && getValueOptions(col)) {
              updatedRow[col.field] = getDropdownValue(col, updatedRow[col.field]);
            }
            if (colType === 'date' && updatedRow[col.field] instanceof Date) {
              updatedRow[col.field] = updatedRow[col.field].toISOString().split('T')[0];
            }
          });
          return updatedRow;
        });
        console.log("getRows called, returning rows:", mappedRows);
        return mappedRows;
      },
      commitAllEdits: async () => {
        console.log("commitAllEdits called");
        setRowModesModel((prev) => {
          const newModel = { ...prev };
          rows.forEach(row => {
            newModel[row.id] = { mode: GridRowModes.View };
          });
          return newModel;
        });
        await new Promise(resolve => setTimeout(resolve, 0));
        return new Promise(resolve => {
          setTimeout(() => {
            const mappedRows = rows.map(row => {
              const updatedRow = { ...row };
              propColumns.forEach(col => {
                const colType = getColType(col);
                if ((colType === 'autocomplete' || colType === 'singleSelect') && getValueOptions(col)) {
                  updatedRow[col.field] = getDropdownValue(col, updatedRow[col.field]);
                }
                if (colType === 'date' && updatedRow[col.field] instanceof Date) {
                  updatedRow[col.field] = updatedRow[col.field].toISOString().split('T')[0];
                }
              });
              return updatedRow;
            });
            console.log("commitAllEdits returning rows:", mappedRows);
            resolve([...mappedRows]);
          }, 0);
        });
      }
    }),
    [rows, propColumns, getColType, getValueOptions, getDropdownValue]
  );
  return (
    <Box sx={{ margin: "6px" }}>
      <Paper sx={{ width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={updatedColumns}
          getRowId={getRowId}
          rowHeight={45}
           sx={{
            '& .red-row': {
              backgroundColor: '#ffe5e5',
            },
            '& .red-row.MuiDataGrid-row--editing': {
              backgroundColor: '#ffe5e5',
            },
            '& .red-row .MuiDataGrid-cell': {
              backgroundColor: '#ffe5e5',
            },
            '& .MuiDataGrid-cell--editing': {
              backgroundColor: 'transparent',
            },
          }}
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
    </Box>
  );
});

export default EditTableView;
