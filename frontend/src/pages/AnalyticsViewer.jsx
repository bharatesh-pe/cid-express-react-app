import { useLocation, useNavigate } from 'react-router-dom';
import siimsLogo from '../images/siims_logo.svg';
import { FiArrowLeft } from 'react-icons/fi';

const AnalyticsViewer = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { application } = location.state || {};

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
            <main className="flex-1 flex justify-center items-center p-4 pt-20">
                <iframe
                    src={application.link}
                    title={application.code}
                    className="w-full h-[80vh] rounded shadow border"
                    allowFullScreen
                />
            </main>
        </div>
    );
};

export default AnalyticsViewer;