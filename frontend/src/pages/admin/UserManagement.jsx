import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiEdit2, FiTrash2, FiArrowLeft, FiSearch, FiRefreshCw } from 'react-icons/fi';
import apiService from '../../services/api';
import background from '../../images/background.png';
import siimsLogo from '../../images/siims_logo.svg';
import Select from 'react-select';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
        isActive: true,
        applications: []
    });
    const [allApplications, setAllApplications] = useState([]);
    const [filteredApplications, setFilteredApplications] = useState([]);
    const [offset, setOffset] = useState(0);
    const limit = 10; // Reduced limit to 10
    const [total, setTotal] = useState(0);

    useEffect(() => {
        fetchUsers(0);
        fetchApplications();
    }, []);

    const fetchUsers = async (newOffset = offset, search = searchTerm) => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiService.getUsers(newOffset, limit, search);
            setUsers(response.users || []);
            setTotal(response.total || 0);
            setOffset(newOffset);
        } catch (error) {
            setError('Failed to load users. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const fetchApplications = async () => {
        try {
            const response = await apiService.getApplications();
            console.log('Applications response:', response);
            if (Array.isArray(response)) {
                setAllApplications(response);
                setFilteredApplications(response); // Initialize filteredApplications
            } else if (Array.isArray(response.data)) {
                setAllApplications(response.data);
                setFilteredApplications(response.data); // Initialize filteredApplications
            } else if (Array.isArray(response.applications)) {
                setAllApplications(response.applications);
                setFilteredApplications(response.applications); // Initialize filteredApplications
            } else {
                setAllApplications([]);
                setFilteredApplications([]);
            }
        } catch (error) {
            setAllApplications([]);
            setFilteredApplications([]);
        }
    };

    const handleAddUser = async () => {
        try {
            await apiService.addUser(formData);
            setShowAddModal(false);
            resetForm();
            fetchUsers();
            toast.success('User added successfully!');
        } catch (error) {
            toast.error('Error adding user');
        }
    };

    const handleEditUser = async () => {
        try {
            // Map frontend fields to backend expected fields
            const payload = {
                user_name: formData.username,
                mobile_number: formData.mobile,
                isActive: formData.isActive,
                applications: formData.applications
            };
            await apiService.editUser(selectedUser.id, payload);
            setShowEditModal(false);
            setSelectedUser(null);
            resetForm();
            fetchUsers();
            toast.success('User updated successfully!');
        } catch (error) {
            console.log("error", error);
            toast.error('Error editing user');
        }
    };

    const handleDeleteUser = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                toast.info('Deleting user...');
                await apiService.deleteUser(userId);
                toast.success('User deleted');
                fetchUsers();
            } catch (error) {
                toast.error('Error deleting user');
            }
        }
    };

    const resetForm = () => {
        setFormData({
            username: '',
            mobile: '',
            isActive: true,
            applications: []
        });
    };

    const openEditModal = (user) => {
        setSelectedUser(user);
        setFormData({
            username: user.user_name,
            mobile: user.mobile_number,
            isActive: user.isActive,
            applications: user.userApplications
                ? user.userApplications.map(ua => ua.applicationCode)
                : []
        });
        setShowEditModal(true);
    };

    const filteredUsers = users;

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
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Applications
                        </label>
                        <div className="flex gap-2 mb-2">
                            <button
                                type="button"
                                className="px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-xs"
                                onClick={() =>
                                    setFormData({
                                        ...formData,
                                        applications: allApplications.map(app => app.code)
                                    })
                                }
                            >
                                Select All
                            </button>
                            <button
                                type="button"
                                className="px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-xs"
                                onClick={() => setFormData({ ...formData, applications: [] })}
                            >
                                Deselect All
                            </button>
                        </div>
                        <Select
                            isMulti
                            options={allApplications.map(app => ({
                                value: app.code,
                                label: app.code
                            }))}
                            value={allApplications
                                .filter(app => formData.applications.includes(app.code))
                                .map(app => ({ value: app.code, label: app.code }))}
                            onChange={selected =>
                                setFormData({
                                    ...formData,
                                    applications: selected ? selected.map(opt => opt.value) : []
                                })
                            }
                            placeholder="Select applications..."
                            className="react-select-container"
                            classNamePrefix="react-select"
                        />
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

    // Get current user for avatar/name (optional)
    const currentUser = apiService.getCurrentUser();

    return (
        <div className="relative min-h-screen bg-gray-100">
            {/* Topbar */}
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
                    <span className="text-lg font-bold text-gray-800 tracking-wide">User Management</span>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={fetchUsers}
                        className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                    >
                        <FiRefreshCw className="w-4 h-4" />
                        <span className="hidden sm:inline">Refresh</span>
                    </button>
                    {/* <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        <FiPlus className="w-4 h-4" />
                        <span className="hidden sm:inline">Add User</span>
                    </button> */}
                    {/* Optional: Show current user avatar/name */}
                    {currentUser && (
                        <div className="flex items-center gap-2">
                            <span className="text-gray-700 text-sm">{currentUser.user_name}</span>
                            {/* <img src={currentUser.avatarUrl} alt="avatar" className="w-8 h-8 rounded-full" /> */}
                        </div>
                    )}
                </div>
            </header>

            {/* Main Content */}
            <div className="pt-20 px-2 sm:px-6 w-full mx-auto">
                {/* Search Bar */}
                <div className="mb-6">
                    <div className="relative max-w-md">
                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search users by name or mobile..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === 'Enter') fetchUsers(0, e.target.value);
                            }}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 bg-white shadow-sm"
                        />
                        <button
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-blue-600"
                            onClick={() => fetchUsers(0, searchTerm)}
                        >
                            <FiSearch />
                        </button>
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-x-auto w-full">
                    <table className="w-full divide-y divide-gray-200 text-sm">
                        <thead className="bg-gray-50 sticky top-0 z-10">
                            <tr>
                                <th className="px-4 py-3 text-left font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">User</th>
                                <th className="px-4 py-3 text-left font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">Mobile</th>
                                <th className="px-4 py-3 text-left font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">Applications</th>
                                <th className="px-4 py-3 text-left font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">Status</th>
                                <th className="px-4 py-3 text-left font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                loading ? (
                                    <tr>
                                        <td colSpan="5" className="px-4 py-8 text-center">
                                            <div className="flex items-center justify-center">
                                                <FiRefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                                                <span className="ml-2 text-gray-600">Loading users...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                                            No users found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((user, idx) => (
                                        <tr
                                            key={user.id}
                                            className={`transition ${idx % 2 === 1 ? 'bg-gray-50' : 'bg-white'} hover:bg-blue-50`}
                                        >
                                            <td className="px-4 py-3 whitespace-nowrap max-w-xs truncate" title={user.user_name}>
                                                <span className="font-semibold text-gray-900">{user.user_name}</span>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap max-w-xs truncate" title={user.mobile_number}>
                                                <span className="text-gray-700">{user.mobile_number}</span>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                {user.userApplications && user.userApplications.length > 0 ? (
                                                    <div className="flex flex-wrap gap-1">
                                                        {user.userApplications.map((ua, idx) => (
                                                            <span
                                                                key={ua.applicationCode + idx}
                                                                className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-semibold shadow border border-blue-200"
                                                                title={ua.applicationCode}
                                                            >
                                                                {ua.applicationCode.length > 18
                                                                    ? ua.applicationCode.slice(0, 15) + '...'
                                                                    : ua.applicationCode}
                                                            </span>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 italic">None</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full shadow ${
                                                    user.isActive 
                                                        ? 'bg-green-100 text-green-800 border border-green-200' 
                                                        : 'bg-red-100 text-red-800 border border-red-200'
                                                }`}>
                                                    {user.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => openEditModal(user)}
                                                        className="text-blue-600 hover:text-blue-900 transition"
                                                        title="Edit User"
                                                    >
                                                        <FiEdit2 className="w-4 h-4" />
                                                    </button>
                                                    {/* <button
                                                        onClick={() => handleDeleteUser(user.id)}
                                                        className="text-red-600 hover:text-red-900 transition"
                                                        title="Delete User"
                                                    >
                                                        <FiTrash2 className="w-4 h-4" />
                                                    </button> */}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )
                            }
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-2">
                    <button
                        onClick={() => fetchUsers(Math.max(0, offset - limit))}
                        disabled={offset === 0}
                        className="px-4 py-2 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <span className="text-gray-700 text-sm">
                        Showing <b>{offset + 1}</b> - <b>{Math.min(offset + limit, total)}</b> of <b>{total}</b>
                    </span>
                    <button
                        onClick={() => fetchUsers(offset + limit)}
                        disabled={offset + limit >= total}
                        className="px-4 py-2 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            </div>

            {/* Modals */}
            {showAddModal && renderUserModal(false)}
            {showEditModal && renderUserModal(true)}
            <ToastContainer position="top-right" autoClose={3000} />
        </div>
    );
};

export default UserManagement;
