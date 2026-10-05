
# Fundoo Backend

The backend API for the Fundoo Application, a full-stack note-taking application inspired by Google Keep.

This application provides REST APIs for user authentication, note management, labels, collaborators, reminders, and email notifications.

## Related Repository

- Frontend: https://github.com/YOUR_USERNAME/Fundoo-Frontend
- Backend: https://github.com/YOUR_USERNAME/Fundoo-Backend

## Tech Stack

- Runtime: Node.js
- Framework: Express.js
- Database: MongoDB
- ODM: Mongoose
- Authentication: JSON Web Token (JWT)
- Password Hashing: bcryptjs
- Validation: Joi
- Email Notifications: Nodemailer
- Message Queue: RabbitMQ (if enabled in your current setup)
- Logging: Winston and Morgan
- Security: Helmet
- Environment Variables: dotenv

## Features

### Authentication
- User registration
- User login
- Password hashing
- JWT-based authentication

### Notes Management
- Create notes
- Retrieve notes
- Update notes
- Delete notes
- Associate notes with users

### Additional Features
- Labels management
- Collaborators
- Reminders
- Email notifications

## Project Structure

src/
- config/        - Database configuration
- constants/     - Application messages and constants
- controllers/   - Handle incoming requests
- middlewares/   - Authentication, validation and error handling
- models/        - Mongoose schemas
- repositories/  - Database operations
- routes/        - API route definitions
- services/      - Business logic

server.js         - Application entry point
.env.example      - Example environment variables
.gitignore        - Files excluded from Git

## Prerequisites

Install the following before running the application:

- Node.js and npm
- MongoDB instance
- Git

RabbitMQ and Docker are required only if the messaging functionality is enabled.

## Installation

### 1. Clone the repository

git clone https://github.com/YOUR_USERNAME/Fundoo-Backend.git

### 2. Navigate to the backend directory

cd Fundoo-Backend

### 3. Install dependencies

npm install

### 4. Configure environment variables

Create a local .env file using .env.example as a reference.

Configure the required values for:
- Server port
- MongoDB connection URL
- JWT secret
- Email/SMTP credentials
- RabbitMQ connection URL, if applicable

Never commit your actual .env file.

### 5. Start the application

npm run dev

Use the development command defined in package.json.
If a development script is not configured, use the appropriate start command.

## Frontend Integration

The React frontend communicates with this backend through HTTP requests to REST API endpoints.

Configure the frontend API base URL to point to the backend server.

For local development, the frontend and backend run on separate ports. Ensure CORS is configured to allow requests from the frontend origin.

## Environment Variables

Refer to .env.example for the required environment variable names.

Do not share real database credentials, JWT secrets, or email passwords.

## Future Improvements

- Add automated tests
- Improve API documentation
- Add deployment configuration

## Author

YOUR NAME

## License

This project is for learning and demonstration purposes.