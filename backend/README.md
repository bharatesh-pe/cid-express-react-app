# Police Application Backend

A Node.js/Express backend application for the Police Application Portal with JWT authentication, OTP-based login, and Single Sign-On (SSO) capabilities.

## 🚀 Features

- **JWT Authentication** - Secure token-based authentication
- **OTP Login System** - Mobile number-based OTP verification
- **Direct Login** - Simplified login without OTP requirement
- **SSO Integration** - Single Sign-On with external applications
- **User Management** - Complete user CRUD operations
- **Application Management** - Manage accessible applications
- **Database Migrations** - Sequelize-based database management
- **Data Seeding** - Pre-populated data for development

## 📋 Prerequisites

- Node.js (v14 or higher)
- MySQL Database
- npm or yarn package manager

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd police-application/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the backend directory:
   ```env
   NODE_ENV=development
   PORT=5000
   
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=police_app
   DB_USERNAME=root
   DB_PASSWORD=your_password
   
   # JWT Configuration
   JWT_SECRET=your_jwt_secret_key
   
   # Frontend URL
   FRONTEND_URL=http://localhost:3000
   ```

4. **Database Setup**
   ```bash
   # Run migrations
   npm run db:migrate
   
   # Seed the database
   npm run db:seed
   ```

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:5000`

## 📁 Project Structure

```
backend/
├── config/
│   └── database.js          # Database configuration
├── controllers/
│   ├── AuthController.js     # Authentication logic
│   ├── SSOController.js      # SSO token management
│   ├── ApplicationController.js
│   └── UserController.js
├── middleware/
│   └── auth.js              # Authentication middleware
├── models/
│   ├── User.js              # User model
│   ├── Application.js       # Application model
│   ├── UserApplication.js    # User-Application relationship
│   └── OTP.js               # OTP model
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── applications.js      # Application routes
│   ├── users.js             # User routes
│   └── sso.js               # SSO routes
├── seeders/
│   ├── applications.js      # Application seed data
│   └── users.js             # User seed data
├── migrations/
│   └── ...                  # Database migrations
├── services/
│   └── otpService.js        # OTP service
└── server.js                # Main server file
```

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/login` - Direct login (no OTP)
- `POST /api/auth/send-otp` - Send OTP to mobile number
- `POST /api/auth/verify-otp` - Verify OTP and login
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/logout` - Logout user

### Applications
- `GET /api/applications` - Get all applications
- `POST /api/applications` - Create new application
- `PUT /api/applications/:id` - Update application
- `DELETE /api/applications/:id` - Delete application

### Users
- `GET /api/users` - Get all users
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### SSO
- `POST /api/sso/generate/:applicationCode` - Generate SSO token
- `POST /api/sso/validate` - Validate SSO token

## 🔐 Authentication Flow

### Direct Login (Police App)
1. User enters mobile number
2. System checks if user exists
3. If exists → Direct login with JWT token
4. If not exists → Error message

### SSO Integration
1. User clicks external application
2. System generates SSO token with user info
3. External app validates token
4. User automatically logged in

## 🗄️ Database Schema

### Users Table
- `id` - Primary key
- `user_name` - Username (unique)
- `mobile_number` - Mobile number (unique)
- `isActive` - Account status
- `isAdmin` - Admin privileges
- `lastLogin` - Last login timestamp

### Applications Table
- `id` - Primary key
- `code` - Application code (unique)
- `link` - Application URL
- `image` - Application icon
- `description` - Application description
- `isActive` - Application status
- `order` - Display order

### User Applications Table
- `id` - Primary key
- `userId` - Foreign key to users
- `applicationCode` - Foreign key to applications
- `isActive` - Relationship status
- `assignedAt` - Assignment timestamp

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 📝 Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with sample data
- `npm run db:reset` - Reset database (migrate + seed)
- `npm test` - Run tests

## 🔧 Configuration

### Environment Variables
- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port (default: 5000)
- `DB_HOST` - Database host
- `DB_PORT` - Database port
- `DB_NAME` - Database name
- `DB_USERNAME` - Database username
- `DB_PASSWORD` - Database password
- `JWT_SECRET` - JWT secret key
- `FRONTEND_URL` - Frontend application URL

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Docker Deployment
```bash
docker build -t police-app-backend .
docker run -p 5000:5000 police-app-backend
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, email support@policeapp.com or create an issue in the repository.