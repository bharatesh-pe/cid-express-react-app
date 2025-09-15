# Police Application Backend

A Node.js/Express.js backend API for the Police Application with OTP-based authentication and department management.

## Features

- 🔐 OTP-based authentication via Karnataka SMS Gateway
- 👥 User management with department assignments
- 🏢 Department management system
- 🛡️ JWT token-based authorization
- 📱 Rate limiting for security
- 🔒 Input validation and sanitization
- 🐬 MySQL with Sequelize ORM

## API Endpoints

### Authentication
- `POST /api/auth/send-otp` - Send OTP to mobile number
- `POST /api/auth/verify-otp` - Verify OTP and login
- `GET /api/auth/profile` - Get user profile (protected)
- `POST /api/auth/logout` - Logout user (protected)

### Departments
- `GET /api/departments` - Get all active departments
- `GET /api/departments/:id` - Get department by ID
- `POST /api/departments` - Create new department (admin only)
- `PUT /api/departments/:id` - Update department (admin only)
- `DELETE /api/departments/:id` - Delete department (admin only)

## Database Schema

### User Model (MySQL)
```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  mobile VARCHAR(10) UNIQUE NOT NULL,
  designation VARCHAR(100) NOT NULL,
  departments JSON NOT NULL,
  isActive BOOLEAN DEFAULT true,
  lastLogin TIMESTAMP NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Department Model (MySQL)
```sql
CREATE TABLE departments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(100) UNIQUE NOT NULL,
  link TEXT NOT NULL,
  image VARCHAR(255) NOT NULL,
  description VARCHAR(500),
  isActive BOOLEAN DEFAULT true,
  `order` INT DEFAULT 0,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### OTP Model (MySQL)
```sql
CREATE TABLE otps (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  otp VARCHAR(6) NOT NULL,
  expiresAt TIMESTAMP NOT NULL,
  attempts INT DEFAULT 0,
  isUsed BOOLEAN DEFAULT false,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Configure environment variables in `.env`:
```env
PORT=5000
NODE_ENV=development
DB_NAME=police_app
DB_USER=root
DB_PASSWORD=password
DB_HOST=localhost
DB_PORT=3306
JWT_SECRET=your_jwt_secret_key_here
SMS_USERNAME=Mobile_1-BCPSRV
SMS_PASSWORD=bcpsrv@1234
SMS_SENDER_ID=BCPSRV
SMS_DEPT_SECURE_KEY=b30c8bcd-5034-458e-8466-54e2eeebe0a9
SMS_TEMPLATE_ID=1107175198611559794
SMS_URL=http://smsmobile1.karnataka.gov.in/index.php/sendmsg
```

4. Start MySQL (if running locally):
```bash
# On Windows
net start mysql

# On macOS
brew services start mysql

# On Linux
sudo systemctl start mysql

# Create database
mysql -u root -p -e "CREATE DATABASE police_app;"
```

5. Run database migrations:
```bash
npm run db:migrate
```

6. Seed initial data:
```bash
npm run db:seed
```

7. Start the server:
```bash
# Development
npm run dev

# Production
npm start
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port | No (default: 5000) |
| `NODE_ENV` | Environment (development/production) | No |
| `DB_NAME` | MySQL database name | Yes |
| `DB_USER` | MySQL username | Yes |
| `DB_PASSWORD` | MySQL password | Yes |
| `DB_HOST` | MySQL host | No (default: localhost) |
| `DB_PORT` | MySQL port | No (default: 3306) |
| `JWT_SECRET` | Secret key for JWT tokens | Yes |
| `SMS_USERNAME` | Karnataka SMS Gateway username | No |
| `SMS_PASSWORD` | Karnataka SMS Gateway password | No |
| `SMS_SENDER_ID` | SMS sender ID | No |
| `SMS_DEPT_SECURE_KEY` | Department secure key | No |
| `SMS_TEMPLATE_ID` | SMS template ID | No |
| `SMS_URL` | SMS Gateway URL | No |

## SMS Configuration

The application uses Karnataka SMS Gateway (same as cop-mob project) for OTP delivery:

1. **Production**: Uses Karnataka SMS Gateway with configured credentials
2. **Development**: Falls back to console logging if SMS gateway is unavailable

The SMS configuration uses the same credentials as the cop-mob project:
- Username: `Mobile_1-BCPSRV`
- Password: `bcpsrv@1234`
- Sender ID: `BCPSRV`
- Template ID: `1107175198611559794`

## Rate Limiting

- OTP requests: 3 per 15 minutes per IP
- OTP verification: 5 per 5 minutes per IP
- General API: 100 per 15 minutes per IP

## Security Features

- Helmet.js for security headers
- CORS configuration
- Input validation with express-validator
- Rate limiting
- JWT token expiration (24 hours)
- OTP expiration (5 minutes)
- Maximum OTP attempts (3)

## Testing the API

### Send OTP
```bash
curl -X POST http://localhost:5000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"mobile": "9698273271"}'
```

### Verify OTP
```bash
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"mobile": "9698273271", "otp": "123456"}'
```

### Get Departments
```bash
curl http://localhost:5000/api/departments
```

## Sample Users (from seed data)

| Username | Mobile | Designation | Departments |
|----------|--------|-------------|-------------|
| admin | 9698273271 | System Administrator | All departments |
| police_officer_1 | 9876543211 | Police Inspector | 1,2,3,4,5 |
| police_officer_2 | 9876543212 | Sub Inspector | 6,7,8,9,10 |
| fire_officer | 9876543213 | Fire Officer | 11,12 |
| lokayukta_officer | 9876543214 | Lokayukta Officer | 13 |
| excise_officer | 9876543215 | Excise Officer | 14 |
| cid_officer | 9876543216 | CID Officer | 15,16 |

## Database Management

### Migration Commands
```bash
# Run all pending migrations
npm run db:migrate

# Undo the last migration
npm run db:migrate:undo

# Undo all migrations
npm run db:migrate:undo:all

# Create database
npm run db:create

# Drop database
npm run db:drop
```

### Seeder Commands
```bash
# Run all seeders
npm run db:seed

# Undo all seeders
npm run db:seed:undo
```

## Development

- Use `npm run dev` for development with auto-restart
- Check logs for OTP codes during development
- Use MySQL Workbench or similar tool to inspect database
- API documentation available at `/health` endpoint

## Production Deployment

1. Set `NODE_ENV=production`
2. Use a production MySQL instance
3. Configure Karnataka SMS Gateway for SMS delivery
4. Use a process manager like PM2
5. Set up proper logging and monitoring
6. Run migrations: `npm run db:migrate`
7. Seed initial data: `npm run db:seed`
