import { Box, Tooltip } from "@mui/material";
import React, { useEffect, useRef } from "react";
import HistoryIcon from '@mui/icons-material/History';
import InfoIcon from '@mui/icons-material/Info';

const RichTextEditor = ({ formData, onChange, field, disabled, errors, onHistory, onFocus, readOnly }) => {
    const textEditorId = field?.id || "my-editor";
    const fieldRef = useRef(field);
    const readonlyFlag = field?.disabled || readOnly;

    useEffect(() => {
        fieldRef.current = field;
    }, [field]);

    const onFocusFunc = () => {
        if (onFocus) onFocus(fieldRef.current);
    };

    useEffect(() => {
        const initTinyMCE = () => {

            const existingEditor = window.tinymce?.get(textEditorId);
            if (existingEditor) {
                existingEditor.remove();
            }

            const checkInterval = setInterval(() => {
                const textarea = document.getElementById(textEditorId);
                if (textarea && window.tinymce) {
                    clearInterval(checkInterval);

                    window.tinymce.init({
                        selector: `#${textEditorId}`,
                        height: 300,
                        plugins: "lists link image code",
                        toolbar: readonlyFlag ? false : "undo redo | formatselect | bold italic | alignleft aligncenter alignright | bullist numlist outdent indent | link image | code",
                        readOnly: readonlyFlag ? 1 : 0,
                        menubar: !(readonlyFlag),
                        setup: (editor) => {
                            editor.on('focus', onFocusFunc);
                            editor.on('Change KeyUp', () => {
                                if (onChange && !readonlyFlag) onChange(editor.getContent());
                            });
                            editor.on('init', () => {
                                if (readonlyFlag) {
                                    const iframe = document.querySelector(`#${textEditorId}_ifr`);
                                    if (iframe) {
                                        iframe.setAttribute("tabindex", "-1");
                                    }
                                }
                            });
                        }
                    });
                }
            }, 50);
        };

        if (window.tinymce) {
            initTinyMCE();
        } else {
            const script = document.createElement("script");
            script.src = process.env.REACT_APP_URL + "/tinymce/tinymce.min.js";
            script.referrerPolicy = "origin";
            script.onload = () => initTinyMCE();
            document.body.appendChild(script);
        }

        return () => {
            const existingEditor = window.tinymce?.get(textEditorId);
            if (existingEditor) existingEditor.remove();
        };

    }, [textEditorId, field.name, field?.disabled, readOnly]);

    // Dynamically update readOnly mode
    useEffect(() => {
        const editor = window.tinymce?.get(textEditorId);
        if (editor) {
            editor.setMode(readonlyFlag ? 'readonly' : 'design');
        }
    }, [readonlyFlag]);

    // Update content if formData changes
    useEffect(() => {
        const editor = window.tinymce?.get(textEditorId);
        if (editor && formData?.[field?.name] !== editor.getContent()) {
            editor.setContent(formData?.[field?.name] || "");
        }
    }, [formData?.[field?.name]]);

    return (
        <Box sx={{ width: '100%' }}>
            <div
                className={`form-field-heading ${readonlyFlag ? 'disabled' : ''}`}
                style={{ display: 'flex', alignItems: 'center', color: Boolean(errors?.[field?.name]) ? '#F04438' : '' }}
            >
                <span>{field.label}</span>
                <span className="anekKannada" style={{ marginTop: '6px' }}>
                    {field.kannada ? '/ ' + field.kannada + ' ' : ''}
                </span>
                {field.required && (
                    <span style={{ padding: '0 0 0 5px' }} className='MuiFormLabel-asterisk'>*</span>
                )}
                {field.info && (
                    <Tooltip title={field.info} arrow placement="top">
                        <InfoIcon className='infoIcon' sx={{
                            color: '#1570EF',
                            padding: '0 0 0 3px',
                            fontSize: '20px',
                            marginBottom: '3px',
                            cursor: 'pointer',
                        }} />
                    </Tooltip>
                )}
                {field.history && (
                    <HistoryIcon
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (onHistory) onHistory();
                        }}
                        className='historyIcon'
                        sx={{
                            color: '#1570EF',
                            padding: '0 1px',
                            fontSize: '20px',
                            marginBottom: '3px',
                            cursor: 'pointer',
                            pointerEvents: 'auto',
                        }}
                    />
                )}
            </div>
            <div style={{ position: 'relative' }}>
                <textarea id={textEditorId} defaultValue={formData?.[field?.name]} disabled={disabled} />

                {(readOnly || field?.disabled) && (
                    <div
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(255, 255, 255, 0.6)',
                        }}
                    />
                )}

            </div>
        </Box>
    );
};

export default RichTextEditor;
