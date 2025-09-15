import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiEdit2, FiTrash2, FiArrowLeft, FiSearch, FiRefreshCw } from 'react-icons/fi';
import apiService from '../../services/api';
import background from '../../images/background.png';
import siimsLogo from '../../images/siims_logo.svg';

const UserManagement = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [formData, setFormData] = useState({
        username: '',
        mobile: '',
        designation: '',
        departments: [],
        isActive: true
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError(null);
            // For now, we'll create a mock API call since we don't have a users endpoint yet
            // const response = await apiService.getUsers();
            // setUsers(response.data || []);
            
            // Mock data for now
            setUsers([
                {
                    id: 1,
                    username: 'admin',
                    mobile: '9698273271',
                    designation: 'System Administrator',
                    departments: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16'],
                    isActive: true,
                    createdAt: '2024-01-01T00:00:00.000Z'
                },
                {
                    id: 2,
                    username: 'police_officer_1',
                    mobile: '9876543211',
                    designation: 'Police Inspector',
                    departments: ['1', '2', '3', '4', '5'],
                    isActive: true,
                    createdAt: '2024-01-01T00:00:00.000Z'
                }
            ]);
        } catch (error) {
            console.error('Error fetching users:', error);
            setError('Failed to load users. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleAddUser = async () => {
        try {
            // Mock API call
            console.log('Adding user:', formData);
            setShowAddModal(false);
            resetForm();
            fetchUsers();
        } catch (error) {
            console.error('Error adding user:', error);
        }
    };

    const handleEditUser = async () => {
        try {
            // Mock API call
            console.log('Editing user:', selectedUser.id, formData);
            setShowEditModal(false);
            setSelectedUser(null);
            resetForm();
            fetchUsers();
        } catch (error) {
            console.error('Error editing user:', error);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                // Mock API call
                console.log('Deleting user:', userId);
                fetchUsers();
            } catch (error) {
                console.error('Error deleting user:', error);
            }
        }
    };

    const resetForm = () => {
        setFormData({
            username: '',
            mobile: '',
            designation: '',
            departments: [],
            isActive: true
        });
    };

    const openEditModal = (user) => {
        setSelectedUser(user);
        setFormData({
            username: user.username,
            mobile: user.mobile,
            designation: user.designation,
            departments: user.departments,
            isActive: user.isActive
        });
        setShowEditModal(true);
    };

    const filteredUsers = users.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.mobile.includes(searchTerm) ||
        user.designation.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const renderUserModal = (isEdit = false) => (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                <h3 className="text-lg font-semibold mb-4">
                    {isEdit ? 'Edit User' : 'Add New User'}
                </h3>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Username
                        </label>
                        <input
                            type="text"
                            value={formData.username}
                            onChange={(e) => setFormData({...formData, username: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter username"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Mobile Number
                        </label>
                        <input
                            type="text"
                            value={formData.mobile}
                            onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter mobile number"
                            maxLength="10"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Designation
                        </label>
                        <input
                            type="text"
                            value={formData.designation}
                            onChange={(e) => setFormData({...formData, designation: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter designation"
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
                        onClick={isEdit ? handleEditUser : handleAddUser}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        {isEdit ? 'Update User' : 'Add User'}
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
                                            User Management
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
                                    onClick={fetchUsers}
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
                                    <span className="hidden sm:inline">Add User</span>
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
                                placeholder="Search users by name, mobile, or designation..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 bg-white shadow-sm"
                            />
                        </div>
                    </div>

                    {/* Users Table */}
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            User
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Mobile
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Designation
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Departments
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
                                            <td colSpan="6" className="px-6 py-4 text-center">
                                                <div className="flex items-center justify-center">
                                                    <FiRefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                                                    <span className="ml-2 text-gray-600">Loading users...</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : filteredUsers.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                                                No users found
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredUsers.map((user) => (
                                            <tr key={user.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {user.username}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {user.mobile}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {user.designation}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {user.departments.length} departments
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                        user.isActive 
                                                            ? 'bg-green-100 text-green-800' 
                                                            : 'bg-red-100 text-red-800'
                                                    }`}>
                                                        {user.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => openEditModal(user)}
                                                            className="text-blue-600 hover:text-blue-900"
                                                        >
                                                            <FiEdit2 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteUser(user.id)}
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
            {showAddModal && renderUserModal(false)}
            {showEditModal && renderUserModal(true)}
        </div>
    );
};

export default UserManagement;
