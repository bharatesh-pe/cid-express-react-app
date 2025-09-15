import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiEdit2, FiTrash2, FiArrowLeft, FiSearch, FiRefreshCw } from 'react-icons/fi';
import apiService from '../../services/api';
import background from '../../images/background.png';
import siimsLogo from '../../images/siims_logo.svg';

const ApplicationManagement = () => {
    const navigate = useNavigate();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [formData, setFormData] = useState({
        code: '',
        link: '',
        image: '/images/siims_logo.svg',
        description: '',
        isActive: true,
        order: 0
    });

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiService.getApplications();
            setApplications(response.data || []);
        } catch (error) {
            console.error('Error fetching applications:', error);
            setError('Failed to load applications. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleAddApplication = async () => {
        try {
            const response = await apiService.createApplication(formData);
            if (response.success) {
                setShowAddModal(false);
                resetForm();
                fetchApplications();
            }
        } catch (error) {
            console.error('Error adding application:', error);
        }
    };

    const handleEditApplication = async () => {
        try {
            const response = await apiService.updateApplication(selectedApplication.id, formData);
            if (response.success) {
                setShowEditModal(false);
                setSelectedApplication(null);
                resetForm();
                fetchApplications();
            }
        } catch (error) {
            console.error('Error editing application:', error);
        }
    };

    const handleDeleteApplication = async (applicationId) => {
        if (window.confirm('Are you sure you want to delete this application?')) {
            try {
                const response = await apiService.deleteApplication(applicationId);
                if (response.success) {
                    fetchApplications();
                }
            } catch (error) {
                console.error('Error deleting application:', error);
            }
        }
    };

    const resetForm = () => {
        setFormData({
            code: '',
            link: '',
            image: '/images/siims_logo.svg',
            description: '',
            isActive: true,
            order: 0
        });
    };

    const openEditModal = (application) => {
        setSelectedApplication(application);
        setFormData({
            code: application.code,
            link: application.link,
            image: application.image,
            description: application.description,
            isActive: application.isActive,
            order: application.order
        });
        setShowEditModal(true);
    };

    const filteredApplications = applications.filter(app =>
        app.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const renderApplicationModal = (isEdit = false) => (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                <h3 className="text-lg font-semibold mb-4">
                    {isEdit ? 'Edit Application' : 'Add New Application'}
                </h3>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Code
                        </label>
                        <input
                            type="text"
                            value={formData.code}
                            onChange={(e) => setFormData({...formData, code: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter application code"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Link
                        </label>
                        <input
                            type="url"
                            value={formData.link}
                            onChange={(e) => setFormData({...formData, link: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter application link"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Image Path
                        </label>
                        <input
                            type="text"
                            value={formData.image}
                            onChange={(e) => setFormData({...formData, image: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter image path"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter application description"
                            rows="3"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Order
                        </label>
                        <input
                            type="number"
                            value={formData.order}
                            onChange={(e) => setFormData({...formData, order: parseInt(e.target.value) || 0})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter display order"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Status
                        </label>
                        <select
                            value={formData.isActive}
                            onChange={(e) => setFormData({...formData, isActive: e.target.value === 'true'})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value={true}>Active</option>
                            <option value={false}>Inactive</option>
                        </select>
                    </div>
                </div>
                
                <div className="flex justify-end gap-3 mt-6">
                    <button
                        onClick={() => {
                            setShowAddModal(false);
                            setShowEditModal(false);
                            resetForm();
                        }}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={isEdit ? handleEditApplication : handleAddApplication}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        {isEdit ? 'Update Application' : 'Add Application'}
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="relative min-h-screen">
            {/* Background */}
            <div
                className="absolute inset-0 bg-cover bg-center z-0"
                style={{ backgroundImage: `url(${background})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70 z-10" />

            {/* Content */}
            <div className="relative z-20 text-white">
                {/* Enhanced Header */}
                <nav className="bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200/50 sticky top-0 z-30">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16">
                            {/* Left Section - Back Button and Title */}
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => navigate('/home')}
                                    className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-all duration-200"
                                >
                                    <FiArrowLeft className="w-5 h-5" />
                                    <span className="hidden sm:inline">Back to Home</span>
                                </button>
                                
                                <div className="flex items-center gap-3">
                                    <img src={siimsLogo} className="w-8 h-8 object-contain" alt="SIIMS Logo" />
                                    <div>
                                        <h1 className="text-lg font-bold text-gray-800 uppercase tracking-wide">
                                            Application Management
                                        </h1>
                                        <p className="text-xs text-gray-500 uppercase tracking-wider">
                                            Admin Panel
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Right Section - Actions */}
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={fetchDepartments}
                                    className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-200"
                                >
                                    <FiRefreshCw className="w-4 h-4" />
                                    <span className="hidden sm:inline">Refresh</span>
                                </button>
                                
                                <button
                                    onClick={() => setShowAddModal(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200"
                                >
                                    <FiPlus className="w-4 h-4" />
                                    <span className="hidden sm:inline">Add Application</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </nav>

                <div className="px-6 py-10 max-w-7xl mx-auto">
                    {/* Search Bar */}
                    <div className="mb-6">
                        <div className="relative max-w-md">
                            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search applications by code or description..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 bg-white shadow-sm"
                            />
                        </div>
                    </div>

                    {/* Applications Table */}
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Application
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Link
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Order
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {loading ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-4 text-center">
                                                <div className="flex items-center justify-center">
                                                    <FiRefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                                                    <span className="ml-2 text-gray-600">Loading applications...</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : filteredDepartments.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                                                No applications found
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredApplications.map((application) => (
                                            <tr key={application.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <img
                                                            src={application.image || siimsLogo}
                                                            className="w-8 h-8 object-contain mr-3"
                                                            alt={application.code}
                                                        />
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {application.code}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {application.description}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    <a 
                                                        href={application.link} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 hover:text-blue-800 truncate block max-w-xs"
                                                    >
                                                        {application.link}
                                                    </a>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {application.order}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                        application.isActive 
                                                            ? 'bg-green-100 text-green-800' 
                                                            : 'bg-red-100 text-red-800'
                                                    }`}>
                                                        {application.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => openEditModal(application)}
                                                            className="text-blue-600 hover:text-blue-900"
                                                        >
                                                            <FiEdit2 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteApplication(application.id)}
                                                            className="text-red-600 hover:text-red-900"
                                                        >
                                                            <FiTrash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {showAddModal && renderApplicationModal(false)}
            {showEditModal && renderApplicationModal(true)}
        </div>
    );
};

export default ApplicationManagement;
