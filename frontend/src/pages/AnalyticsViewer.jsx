import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiRefreshCw, FiMaximize2, FiMinimize2 } from 'react-icons/fi';
import siimsLogo from '../images/siims_logo.svg';
import powerBIService from '../services/powerBIService';
import apiService, { API_BASE_URL } from '../services/api';
import '../styles/CrimeAnalytics.css';

const AnalyticsViewer = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { application } = location.state || {};
    
    const [powerBIStatus, setPowerBIStatus] = useState('loading');
    const [errorMessage, setErrorMessage] = useState('');
    const [embedToken, setEmbedToken] = useState(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const embedContainerRef = useRef(null);
    const reportRef = useRef(null);

    // Get report ID based on application
    const getReportId = () => {
        if (application && application.code.toLowerCase().includes('ndps')) {
            return '93286dd2-d882-4441-a897-18a0a0a76e02';
        }
        // Default report ID for other analytics
        return '95ee3cd6-a079-412c-b345-193d0b836be3';
    };

    const config = {
        workspaceId: 'bcb18a0f-e701-4e30-88a6-ddea7062043c',
        reportId: getReportId(),
        tenantId: '94dbcc7c-6e32-4329-a59a-3fb79b6fb70e',
        pageId: '74173e067628fbf15e6e'
    };

    useEffect(() => {
        if (application) {
            initializePowerBI();
        }
        
        return () => {
            // Cleanup on unmount
            if (reportRef.current && window.powerbi) {
                window.powerbi.reset(embedContainerRef.current);
            }
        };
    }, [application]);

    const loadPowerBISDK = async () => {
        if (window.powerbi) {
            return true;
        }

        const sdkUrls = [
            'https://cdn.jsdelivr.net/npm/powerbi-client@2.19.1/dist/powerbi.min.js',
            'https://unpkg.com/powerbi-client@2.19.1/dist/powerbi.min.js',
            'https://app.powerbi.com/powerbi-client/powerbi.min.js'
        ];

        for (const url of sdkUrls) {
            try {
                await new Promise((resolve, reject) => {
                    const script = document.createElement('script');
                    script.src = url;
                    script.async = true;
                    script.crossOrigin = 'anonymous';
                    script.onload = () => resolve();
                    script.onerror = () => reject(new Error(`Failed to load from ${url}`));
                    document.head.appendChild(script);
                });
                
                if (window.powerbi) {
                    console.log('Power BI SDK loaded successfully from', url);
                    return true;
                }
            } catch (err) {
                console.warn(`Failed to load SDK from ${url}:`, err);
            }
        }

        throw new Error('Failed to load Power BI SDK from all sources');
    };

    const initializePowerBI = async () => {
        console.log('Initializing Power BI Direct Embed...');
        setPowerBIStatus('loading');
        setErrorMessage('');
        
        try {
            if (!apiService.isAuthenticated()) {
                console.log('User not authenticated, redirecting to login...');
                navigate('/', { replace: true });
                return;
            }
            
            // Load Power BI JavaScript SDK first
            await loadPowerBISDK();
            
            // Get embed token
            console.log('Fetching embed token...');
            const tokenString = await powerBIService.getEmbedToken(config.reportId);
            setEmbedToken(tokenString);
            
            if (!tokenString) {
                throw new Error('Failed to get embed token');
            }
            
            console.log('Got embed token:', tokenString.slice(0, 10) + '...');
            
            // Ensure container exists
            if (!embedContainerRef.current) {
                throw new Error('Embed container not found - please try refreshing the page');
            }

            // Configure the embed with numeric values
            const embedConfig = {
                type: 'report',
                id: config.reportId,
                embedUrl: `https://app.powerbi.com/reportEmbed?reportId=${config.reportId}&groupId=${config.workspaceId}`,
                accessToken: tokenString,
                tokenType: 1,
                permissions: 7,
                settings: {
                    filterPaneEnabled: true,
                    navContentPaneEnabled: true,
                    background: 1
                },
                viewMode: 0  // 0 = View mode, 1 = Edit mode
            };

            console.log('Embedding report...');
            
            // Verify SDK is loaded and functioning
            if (!window.powerbi || typeof window.powerbi.embed !== 'function') {
                throw new Error('Power BI SDK not properly initialized');
            }

            // Create the embed instance
            const report = window.powerbi.embed(embedContainerRef.current, embedConfig);
            reportRef.current = report;
            
            // Handle report events
            report.on('loaded', () => {
                console.log('Report has loaded successfully');
                setPowerBIStatus('connected');
            });

            report.on('rendered', () => {
                console.log('Report has rendered successfully');
                setPowerBIStatus('connected');
            });

            report.on('error', (event) => {
                console.error('Report error:', event.detail);
                setPowerBIStatus('error');
                setErrorMessage(event.detail.message || 'Error loading report');
                
                // Log additional error information
                if (event.detail) {
                    console.error('Detailed error:', {
                        message: event.detail.message,
                        errorCode: event.detail.errorCode,
                        detailedMessage: event.detail.detailedMessage
                    });
                }
            });

        } catch (error) {
            console.error('Power BI initialization error:', error);
            setPowerBIStatus('error');
            setErrorMessage(error.message);
        }
    };

    const refreshPowerBI = async () => {
        setPowerBIStatus('loading');
        try {
            await powerBIService.refreshReport();
            await initializePowerBI();
            console.log('Power BI refreshed successfully');
        } catch (error) {
            console.error('Refresh error:', error);
            setPowerBIStatus('error');
            setErrorMessage('Failed to refresh dashboard');
        }
    };

    const toggleFullscreen = () => {
        const container = document.getElementById('powerbi-container');
        if (!document.fullscreenElement) {
            if (container.requestFullscreen) {
                container.requestFullscreen();
                setIsFullscreen(true);
            } else if (container.webkitRequestFullscreen) {
                container.webkitRequestFullscreen();
                setIsFullscreen(true);
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                setIsFullscreen(false);
            }
        }
    };

    if (!application) {
        return (
            <div className="flex flex-col items-center justify-center h-screen">
                <p className="text-gray-600 mb-4">No analytics application selected.</p>
                <button
                    onClick={() => navigate('/home')}
                    className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                    Back to Home
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Top Navigation Bar */}
            <header className="fixed top-0 left-0 right-0 z-30 bg-white shadow flex items-center justify-between px-6 h-16">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/home')}
                        className="flex items-center gap-2 px-2 py-1 text-gray-600 hover:text-blue-700 hover:bg-gray-100 rounded transition"
                    >
                        <FiArrowLeft className="w-5 h-5" />
                        <span className="hidden sm:inline">Home</span>
                    </button>
                    <img src={siimsLogo} className="w-8 h-8 object-contain" alt="SIIMS Logo" />
                    <span className="text-lg font-bold text-gray-800 tracking-wide">
                        {application.code} Analytics
                    </span>
                </div>
            </header>
            {/* Main Content */}
            <main className="flex-1 p-4 pt-20">
                <div className="max-w-7xl mx-auto">
                    {/* Power BI Container */}
                    <div className="card shadow-sm">
                        <div className="card-body p-0">
                            <div 
                                id="powerbi-container" 
                                className="powerbi-embed-container"
                                style={{
                                    position: 'relative',
                                    width: '100%',
                                    minHeight: '600px',
                                    backgroundColor: '#f8f9fa',
                                    borderRadius: '0.375rem'
                                }}
                            >
                                {powerBIStatus === 'loading' && (
                                    <div 
                                        className="d-flex justify-content-center align-items-center" 
                                        style={{ height: '60px', position: 'absolute', top: '10px', left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}
                                    >
                                        <div className="spinner-border text-primary" role="status" style={{ width: '2rem', height: '2rem' }}>
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                    </div>
                                )}
                                
                                {powerBIStatus === 'error' && (
                                    <div 
                                        className="d-flex justify-content-center align-items-center" 
                                        style={{ height: '600px' }}
                                    >
                                        <div className="text-center">
                                            <div className="text-danger mb-3" style={{ fontSize: '4rem' }}>
                                                ⚠️
                                            </div>
                                            <h5 className="mt-3">Unable to Load Dashboard</h5>
                                            <p className="text-muted">{errorMessage}</p>
                                            <div className="mt-3">
                                                <button 
                                                    className="btn btn-primary me-2" 
                                                    onClick={initializePowerBI}
                                                >
                                                    <FiRefreshCw className="me-1" />
                                                    Retry
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                
                                {powerBIStatus !== 'error' && (
                                    <div 
                                        className="powerbi-frame-container"
                                        style={{
                                            width: '100%',
                                            height: '600px',
                                            position: 'relative',
                                            display: 'block',
                                            visibility: 'visible',
                                            opacity: 1
                                        }}
                                    >
                                        <div 
                                            ref={embedContainerRef}
                                            id="powerbi-embed" 
                                            className="powerbi-iframe"
                                            style={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                width: '100%',
                                                height: '100%',
                                                border: 'none',
                                                display: 'block',
                                                background: 'white',
                                                margin: 0,
                                                padding: 0,
                                                overflow: 'hidden',
                                                zIndex: 1,
                                                visibility: 'visible',
                                                opacity: 1
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AnalyticsViewer;