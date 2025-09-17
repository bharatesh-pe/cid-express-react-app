# Police Application Frontend

A modern React.js frontend application for the Police Application Portal with responsive design, authentication, and seamless integration with external applications.

## 🚀 Features

- **Modern React 18** - Latest React features and hooks
- **Responsive Design** - Mobile-first responsive UI
- **JWT Authentication** - Secure token-based authentication
- **Direct Login** - Simplified login without OTP requirement
- **Application Dashboard** - Access to multiple police applications
- **SSO Integration** - Single Sign-On with external applications
- **Admin Panel** - User and application management
- **Modern UI Components** - Beautiful and intuitive interface
- **Error Handling** - Comprehensive error management
- **Loading States** - Smooth loading indicators

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager
- Backend API running on port 5000

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd police-application/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the frontend directory:
   ```env
   REACT_APP_API_URL=http://139.59.35.227:5000/api
   REACT_APP_FRONTEND_URL=http://localhost:3000
   ```

## 🚀 Running the Application

### Development Mode
```bash
npm start
```

### Production Build
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

The application will start on `http://localhost:3000`

## 📁 Project Structure

```
frontend/
├── public/
│   ├── index.html           # Main HTML template
│   └── favicon.ico          # Application icon
├── src/
│   ├── components/
│   │   ├── AdminRoute.jsx   # Admin route protection
│   │   ├── OTPInput.jsx     # OTP input component
│   │   └── LoadingSpinner.jsx
│   ├── pages/
│   │   ├── Home.jsx         # Main dashboard
│   │   ├── Login.jsx         # Login page
│   │   ├── admin/
│   │   │   ├── UserManagement.jsx
│   │   │   └── ApplicationManagement.jsx
│   │   └── index.jsx         # Page exports
│   ├── services/
│   │   └── api.js           # API service layer
│   ├── images/              # Static images
│   ├── App.jsx              # Main app component
│   └── index.js             # Application entry point
├── package.json
└── README.md
```

## 🎨 UI Components

### Login Page
- Mobile number input with validation
- Direct login without OTP
- Responsive design with background images
- Error handling and loading states

### Home Dashboard
- Application cards with icons
- User profile display
- Logout functionality
- Responsive grid layout

### Admin Panel
- User management (CRUD operations)
- Application management
- Role-based access control
- Data tables with pagination

## 🔗 API Integration

The frontend communicates with the backend through a centralized API service:

```javascript
// API Service Usage
import apiService from './services/api';

// Authentication
const loginResponse = await apiService.directLogin(mobileNumber);
const profile = await apiService.getProfile();

// Applications
const applications = await apiService.getApplications();
const ssoToken = await apiService.generateSSOToken(applicationCode);
```

## 🔐 Authentication Flow

### Login Process
1. User enters mobile number
2. Frontend calls `/api/auth/login`
3. Backend validates user existence
4. JWT token returned and stored
5. User redirected to dashboard

### SSO Integration
1. User clicks application card
2. Frontend generates SSO token
3. Application opens with token in URL
4. External app validates token
5. User automatically logged in

## 🎯 Key Features

### Responsive Design
- Mobile-first approach
- Tablet and desktop optimized
- Flexible grid layouts
- Touch-friendly interactions

### State Management
- React hooks for state management
- Local storage for persistence
- Context API for global state
- Error boundary implementation

### Security
- JWT token storage
- Secure API communication
- Input validation
- XSS protection

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 📝 Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

## 🎨 Styling

The application uses Tailwind CSS for styling:

- **Utility-first CSS framework**
- **Responsive design classes**
- **Custom component styles**
- **Dark/light theme support**

### Key Styling Features
- Responsive grid layouts
- Hover effects and transitions
- Loading animations
- Error state styling
- Mobile-optimized forms

## 🔧 Configuration

### Environment Variables
- `REACT_APP_API_URL` - Backend API URL
- `REACT_APP_FRONTEND_URL` - Frontend URL

### Build Configuration
- Production optimizations
- Code splitting
- Asset optimization
- Bundle analysis

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Static Hosting
The `build` folder contains static files ready for deployment:
- Upload to any static hosting service
- Configure server for SPA routing
- Set up environment variables

### Docker Deployment
```bash
docker build -t police-app-frontend .
docker run -p 3000:3000 police-app-frontend
```

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Development Guidelines
- Follow React best practices
- Use functional components with hooks
- Implement proper error handling
- Write meaningful commit messages
- Add tests for new features

## 🐛 Troubleshooting

### Common Issues

**Build Errors**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**API Connection Issues**
- Check backend server is running
- Verify API URL in environment variables
- Check network connectivity

**Authentication Issues**
- Clear browser storage
- Check JWT token validity
- Verify user permissions

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Email: frontend-support@policeapp.com
- Documentation: [Link to docs]

## 🔄 Version History

- **v1.0.0** - Initial release with basic authentication
- **v1.1.0** - Added SSO integration
- **v1.2.0** - Enhanced admin panel
- **v1.3.0** - Improved responsive design