import React, { useState } from 'react';
import axios from 'axios';

const ImportOldData = () => {
    const [file, setFile] = useState(null);
    const [status, setStatus] = useState('');

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);
        setStatus('Uploading...');
        try {
            await axios.post('/import-old-data', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setStatus('Upload and import successful!');
        } catch (err) {
            setStatus('Error uploading file.');
        }
    };

    return (
        <div>
            <h2>Import Old Data</h2>
            <input type="file" accept=".xlsx,.xls" onChange={handleFileChange} />
            <button onClick={handleUpload} disabled={!file}>Upload</button>
            <div>{status}</div>
        </div>
    );
};

export default ImportOldData;
