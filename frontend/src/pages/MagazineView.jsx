import React, { useEffect, useRef, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { West } from "@mui/icons-material";
import { Chip, Typography, Box, Tabs, Tab } from "@mui/material";
import ReactPageFlip from "react-pageflip";
import api from "../services/api";

// Constants for calculations
const APPROX_FIELD_HEIGHT = 80; // Approximate height of one field in pixels
const PAGE_PADDING = 48; // Total vertical padding (24px top + 24px bottom)
const TITLE_HEIGHT = 64; // Approximate height of title section

const MagazinePage = React.forwardRef(({ title, content, isContinuation, table, overAllAction, onClick }, ref) => (
    <div ref={ref} className="page bg-white">
        <Box sx={{ p: 3, height: '90%', overflowY: 'auto' }}>
            {overAllAction ? (
                <Typography 
                    variant="h6" 
                    gutterBottom
                    component="a"
                    sx={{
                        cursor: 'pointer',
                        color: 'primary.main',
                        textDecoration: 'underline',
                        '&:hover': {
                            color: 'primary.dark'
                        }
                    }}
                    onClick={(e) => {
                        e.preventDefault();
                        if(onClick){
                            onClick(table)
                        }
                    }}
                >
                    {isContinuation ? `${title} (continued)` : title}
                </Typography>
            ) : (
                <Typography variant="h6" gutterBottom>
                    {isContinuation ? `${title} (continued)` : title}
                </Typography>
            )}
            <p dangerouslySetInnerHTML={{ __html: content ? content : '' }}></p>
        </Box>
    </div>
));

const MagazineView = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const pageFlip = useRef();
    const [currentPage, setCurrentPage] = useState(0);
    const [viewportWidth, setViewportWidth] = useState((window.innerWidth / 2) - 20);
    const [viewportHeight, setViewportHeight] = useState(window.innerHeight - 150);

    const overAllObj = location.state;

    const [pages, setPages] = useState([]);

    const [activeTab, setActiveTab] = useState(0);

    const tableToPagesMap = useMemo(() => {
        const map = {};
        pages.forEach((page, index) => {
            if (page.table) {
                if (!map[page.table]) {
                    map[page.table] = [];
                }
                map[page.table].push(index);
            }
        });
        return map;
    }, [pages]);

    const handleTabClick = (table, tabIndex) => {
        const pageIndices = tableToPagesMap[table];
        if (!pageIndices || !pageIndices.length || !pageFlip.current) return;

        const targetPageIndex = pageIndices[0];

        setCurrentPage(targetPageIndex);

        pageFlip.current.pageFlip().turnToPage(targetPageIndex);
        
        setActiveTab(tabIndex);
        setCurrentPage(targetPageIndex);
    };

    if (!overAllObj) {
        navigate(-1);
    }

    const { actionArray, ui_case_id, pt_case_id, headerDetails, overAllAction, contentArray } = overAllObj;

    const backToInvestigation = () => {

        var activeSidebarObj = [];  
        
        if (overAllAction === false) {
            try {
                const parsedContent = JSON.parse(contentArray);

                const getPerticularAction = parsedContent.filter((item) => {
                    return item.table === actionArray[0]?.table;
                });

                if (getPerticularAction?.[0]) {
                    activeSidebarObj = getPerticularAction;
                }

            } catch (error) {
                console.log("Error parsing contentArray:", error);
            }
        }

        navigate('/caseView', { 
            state: {
                ...overAllObj,
                activeSidebarObj : activeSidebarObj
            }
        });
    };

    const backToIndividualInvestigation = (table)=>{

        var activeSidebarObj = [];  
    
        try {
            const parsedContent = JSON.parse(contentArray);

            const getPerticularAction = parsedContent.filter((item) => {
                return item.table === table;
            });

            if (getPerticularAction?.[0]) {
                activeSidebarObj = getPerticularAction;
            }

        } catch (error) {
            console.log("Error parsing contentArray:", error);
        }

        if(activeSidebarObj.length > 0){
            navigate('/caseView', { 
                state: {
                    ...overAllObj,
                    activeSidebarObj : activeSidebarObj
                }
            });
        }else{
            console.log("action not found");
        }

    }

    const getTemplateOverAllData = async () => {
        const table_name = actionArray.map((item) => item.table);

        const payload = {
            table_name,
            ui_case_id,
            pt_case_id,
        };

        try {
            const response = await api.post(
                "/templateData/viewMagazineTemplateAllData",
                payload
            );

            if(response.success){
                const data = response.data || {};
                const generatedPages = [];
                    
                Object.entries(data).forEach(([tableKey, entries]) => {
                    if (Array.isArray(entries) && entries.length > 0) {
                        entries.forEach((entry, idx) => {
                            const findingTemplate = actionArray.find((item) => item.table === tableKey);
                            const baseTitle = `${findingTemplate ? findingTemplate?.name : tableKey} - ${idx + 1}`;
                            const baseTableName = findingTemplate.table;
                            
                            const allEntries = Object.entries(entry)
                                .filter(([key]) => key !== 'id')
                                .map(([key, val]) => {
                                    const value = formatValue(val);
                                    const isTable = value.includes('<table'); // Check if value is a table
                                    
                                    let fieldHeight;
                                    if (isTable) {
                                        const rowCount = (value.match(/<tr/g) || []).length;
                                        fieldHeight = 40 + (rowCount * 24); // 40px base + 24px per row
                                    } else {
                                        const lineCount = Math.ceil(value.length / 60); // Approx 60 chars per line
                                        fieldHeight = Math.max(60, lineCount * 20); // Minimum 60px, 20px per line
                                    }
                                    
                                    return {
                                        key,
                                        html: `<div style="border-bottom: 1px solid #EAECF0; padding-bottom: 12px;">
                                                <p class="Roboto ProfileViewHeading">${key}</p>
                                                <div class="anekKannada ProfileViewDesc">${value}</div>
                                            </div>`,
                                        height: fieldHeight,
                                        isTable
                                    };
                                });
                            
                            const availableHeight = viewportHeight - PAGE_PADDING - TITLE_HEIGHT;
                            let currentChunkHeight = 0;
                            let currentChunk = [];
                            
                            allEntries.forEach((entry, index) => {
                                if (entry.isTable && entry.height > availableHeight) {
                                    if (currentChunk.length > 0) {
                                        generatedPages.push({
                                            title: baseTitle,
                                            table: baseTableName,
                                            content: currentChunk.map(item => item.html).join("\n"),
                                            isContinuation: generatedPages.some(p => p.title === baseTitle)
                                        });
                                        currentChunk = [];
                                        currentChunkHeight = 0;
                                    }
                                    
                                    generatedPages.push({
                                        title: baseTitle,
                                        table: baseTableName,
                                        content: entry.html,
                                        isContinuation: generatedPages.some(p => p.title === baseTitle)
                                    });
                                    return;
                                }
                                
                                if (currentChunkHeight + entry.height > availableHeight - 40 && currentChunk.length > 0) {
                                    generatedPages.push({
                                        title: baseTitle,
                                        table: baseTableName,
                                        content: currentChunk.map(item => item.html).join("\n"),
                                        isContinuation: generatedPages.some(p => p.title === baseTitle)
                                    });
                                    
                                    currentChunk = [entry];
                                    currentChunkHeight = entry.height;
                                } else {
                                    currentChunk.push(entry);
                                    currentChunkHeight += entry.height;
                                }
                                
                                if (index === allEntries.length - 1 && currentChunk.length > 0) {
                                    generatedPages.push({
                                        title: baseTitle,
                                        table: baseTableName,
                                        content: currentChunk.map(item => item.html).join("\n"),
                                        isContinuation: generatedPages.some(p => p.title === baseTitle)
                                    });
                                }
                            });
                        });
                    }
                });
    
                setPages(generatedPages);
            }
        } catch (error) {
            console.log(error, "error");
        }
    };

    const formatValue = (val) => {
        if (val === null || val === undefined) return "-";
        
        if (typeof val === 'string') {
            try {
                const parsed = JSON.parse(val);
                return formatValue(parsed);
            } catch (e) {
                // If parsing fails, continue with the original string
            }
        }
        
        if (typeof val === 'object' && Object.keys(val).length === 0) {
            return "-";
        }
        
        if (typeof val === 'object' && !Array.isArray(val)) {

            const keys = Object.keys(val);
            if (keys.length === 0) return "-";
            
            let tableHtml = '<table style="width: 100%; border-collapse: collapse; margin-top: 8px;">';
            
            tableHtml += '<thead><tr>';
            keys.forEach(key => {
                tableHtml += `<th style="padding: 8px; border: 1px solid #ddd; text-align: left;">${key}</th>`;
            });

            tableHtml += '</tr></thead>';
            
            tableHtml += '<tbody><tr>';
            keys.forEach(key => {
                tableHtml += `<td style="padding: 8px; border: 1px solid #ddd;">${formatValue(val[key])}</td>`;
            });
            tableHtml += '</tr></tbody></table>';
            
            return tableHtml;
        }

        if (Array.isArray(val)) {
            if (val.length === 0) return "-";
            
            if (val.length === 1) {
                return formatValue(val[0]);
            }
            
            if (val.length > 0 && typeof val[0] === 'object') {
                const headers = Object.keys(val[0]);
                if (headers.length === 0) return "-";
                
                let tableHtml = '<table style="width: 100%; border-collapse: collapse; margin-top: 8px;">';
                tableHtml += '<thead><tr>';
                
                headers.forEach(header => {
                    tableHtml += `<th style="padding: 8px; border: 1px solid #ddd; text-align: left;">${header}</th>`;
                });
                
                tableHtml += '</tr></thead><tbody>';
                
                val.forEach(item => {
                    tableHtml += '<tr>';
                    headers.forEach(header => {
                        tableHtml += `<td style="padding: 8px; border: 1px solid #ddd;">${formatValue(item[header])}</td>`;
                    });
                    tableHtml += '</tr>';
                });
                
                tableHtml += '</tbody></table>';
                return tableHtml;
            }
            
            return val.map(item => formatValue(item)).join('<br>');
        }

        return (val === null || val === undefined || val.toString().trim() === "") ? "-" : val.toString();
    };

    useEffect(() => {
        getTemplateOverAllData();
    }, []);

    useEffect(() => {
        const handleResize = () => {
            setViewportWidth((window.innerWidth / 2) - 20);
            setViewportHeight(window.innerHeight - 150);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const goToNextPage = async () => {
        if (pageFlip.current) {
            pageFlip.current.pageFlip().flipNext();
        }
    };

    const goToPreviousPage = () => {
        if (pageFlip.current) {
            pageFlip.current.pageFlip().flipPrev();
        }
    };

    const onPageFlip = (e) => {
        setCurrentPage(e.data);

        const currentTable = pages[e.data]?.table;
        if (currentTable) {
            const tabIndex = actionArray.findIndex(action => action.table === currentTable);
            if (tabIndex >= 0){
                setActiveTab(tabIndex);
            }
        }
    };

    return (
        <div style={{ padding: "1rem" }}>
             <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Typography
                    sx={{
                        fontSize: "19px",
                        fontWeight: "500",
                        color: "#171A1C",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        cursor: "pointer",
                    }}
                    className="Roboto"
                    onClick={backToInvestigation}
                >
                    <West />
                    Back
                    {headerDetails && (
                        <Chip
                            label={headerDetails}
                            color="primary"
                            variant="outlined"
                            size="small"
                            sx={{ fontWeight: 500, marginTop: "2px" }}
                        />
                    )}
                </Typography>
                {overAllAction && (
                    <Tabs
                        value={activeTab}
                        variant="scrollable"
                        scrollButtons="auto"
                        sx={{ 
                            flexGrow: 1,
                            '& .MuiTabs-scroller': {
                                overflow: 'auto !important',
                            }
                        }}
                    >
                        {actionArray?.map((action, index) => (
                            action.table ? (
                                <Tab 
                                    key={index}
                                    label={action.name}
                                    onClick={() => handleTabClick(action.table, index)}
                                />
                            ) : null
                        ))}
                    </Tabs>
                )}
             </Box>

            <Box mt={3}>
                {pages.length > 0 ? (
                    <div style={{ position: 'relative' }}>
                        <button onClick={goToPreviousPage} disabled={currentPage === 0} className="pageLeftIcon">
                            <svg style={{ rotate: '180deg' }} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M4 12H20M20 12L14 6M20 12L14 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                        
                        <ReactPageFlip
                            width={viewportWidth}
                            height={viewportHeight}
                            className="magazine-flip"
                            ref={pageFlip}
                            onFlip={(e) => onPageFlip(e)}
                        >
                            {pages.map((page, index) => (
                                <MagazinePage
                                    key={index}
                                    title={page.title}
                                    content={page.content}
                                    isContinuation={page.isContinuation}
                                    overAllAction={overAllAction}
                                    table={page.table}
                                    onClick={backToIndividualInvestigation}
                                />
                            ))}
                        </ReactPageFlip>
                        
                        <button onClick={goToNextPage} disabled={currentPage >= pages.length - 2} className="pageRightIcon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M4 12H20M20 12L14 6M20 12L14 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                    </div>
                ) : (
                    <Typography variant="body1" sx={{ mt: 4 }}>
                        No data to display.
                    </Typography>
                )}
            </Box>
        </div>
    );
};

export default MagazineView;