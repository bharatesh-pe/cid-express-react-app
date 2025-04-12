import React, { useEffect } from 'react';
import html2pdf from 'html2pdf.js';

const GenerateProfilePdf = ({ templateData, templateFields, template_name, onSave, is_print }) => {

    let data = templateFields.map((el) => {
        return {
            label: el.label,
            kannada: el.kannada,
            value: templateData[el.name] ? templateData[el.name] : "",
            col: el.col ? el.col : '12',
        };
    });

    useEffect(() => {
        if (is_print) {
            printContentOnly();
        } else {
            handleDownloadPDF();
        }
    }, []);

    const printContentOnly = () => {
        const content = document.getElementById('content-to-pdf');

        if (!content) return;
        const printWindow = window.open('', '', 'width=1000,height=800');
        printWindow.document.write(`
            <html>
                <head>
                    <style>
                        body {
                            font-family: Inter, sans-serif;
                            padding: 20px;
                        }
                        @page {
                            margin: 4mm;
                        }
                    </style>
                </head>
                <body>
                    ${content.innerHTML}
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();

        setTimeout(() => {
            printWindow.print();
            printWindow.close();
            onSave && onSave();
        }, 500);
    };

    const handleDownloadPDF = () => {
        const element = document.getElementById('content-to-pdf');

        // Options for html2pdf
        const options = {
            filename: template_name ? template_name+'.pdf' : 'profile.pdf',
            html2canvas: {
                scale: 4, // Scale the content to make it sharper
                letterRendering: true,
            },
            jsPDF: {
                unit: 'mm', // Specify unit (mm, cm, in, pt)
                format: 'a4', // Paper size (A4 is common)
                orientation: 'portrait', // or 'landscape'
            },
            margin: [10, 10, 10, 10], // [top, left, bottom, right]
            pagebreak: { mode: 'css', before: '.page-break', avoid: ['tr', 'td', '.content-to-pdf'] }, // Ensure content breaks properly
        };

        html2pdf().from(element).set(options).save(); // Apply the options and save the PDF
        onSave && onSave();
    };

    return (
        <div style={{ display: 'none' }}>
            <div id="content-to-pdf">
                <div style={{ padding: '10px' }}>
                    <table id='pdfDownloadTable' style={{width: '100%'}}>
                        {/* <thead>
                            <tr>
                                <td>
                                    -
                                </td>
                            </tr>
                        </thead> */}
                        <tr>
                            {data.map((el, rowIndex) => {
                                return (
                                        <td key={rowIndex} style={{ width: el.col === '6' ? '48%' : '100%', display: 'inline-block' }}>
                                            <div style={{ marginBottom: "10px" }}>
                                                <div style={{ color: '#3E4784', fontSize: '14px' }}>
                                                    {el.label} {el.kannada ? '/ ' + el.kannada : ''}
                                                </div>
                                                <div style={{ color: '#101828', fontSize: '16px' }}>
                                                    {el.value ? el.value : '-'}
                                                </div>
                                            </div>
                                        </td>
                                );
                            })}
                        </tr>
                        {/* <tfoot>
                            <tr>
                                <td>
                                    -
                                </td>
                            </tr>
                        </tfoot> */}
                    </table>
                </div>
            </div>
            <button onClick={handleDownloadPDF}>Download PDF</button>
        </div>
    );
};

export default GenerateProfilePdf;
