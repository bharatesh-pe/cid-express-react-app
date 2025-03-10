import React, { useEffect } from 'react';
import html2pdf from 'html2pdf.js';

const GenerateProfilePdf = ({ templateData, templateFields, template_name, onSave }) => {

    let data = templateFields.map((el) => {
        return {
            label: el.label,
            kannada: el.kannada,
            value: templateData[el.name] ? templateData[el.name] : "",
        };
    });

    useEffect(() => {
        handleDownloadPDF();
    }, []);

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
        onSave();
    };

    return (
        <div style={{ display: 'none' }}>
            <div id="content-to-pdf">
                <div style={{ padding: '10px' }}>
                    <table id='pdfDownloadTable'>
                        <thead>
                            <tr>
                                <td>
                                    -
                                </td>
                            </tr>
                        </thead>
                        {data && data.map((el, index) => {
                            return (
                                <tbody>
                                    <tr>
                                        <td>
                                            <div style={{ marginBottom: "10px" }} key={index}>
                                                <div style={{ color: '#3E4784', fontSize: '14px' }}> {el?.label} {el?.kannada} </div>
                                                <div style={{ color: '#101828', fontSize: '16px' }}> {el?.value ? el?.value : '-'} </div>
                                                {/* Page Break (can help with splitting the content across multiple pages) */}
                                                {/* {index % 5 === 0 && <div className="page-break" style={{ pageBreakBefore: 'always' }}></div>} */}
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>

                            );
                        })}
                        <tfoot>
                            <tr>
                                <td>
                                    -
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
            <button onClick={handleDownloadPDF}>Download PDF</button>
        </div>
    );
};

export default GenerateProfilePdf;
