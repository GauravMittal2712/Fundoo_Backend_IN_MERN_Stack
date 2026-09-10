Fundoo Notes Backend
A backend REST API for a Fundoo/Google Keep-style notes application
built with Node.js, Express.js, MongoDB, JWT authentication, Joi
validation, and RabbitMQ.

Project status: Backend project under development. It is not
presented as a final production product.

Features
User registration and login

Password hashing using bcrypt

JWT-based authentication

User profile retrieval and update

Create, read, update, and delete notes

Pin notes

Archive and restore notes

Move notes to trash and restore them

Search notes by title or description

Request validation using Joi

Centralized error handling

404 route handling

Winston application/error logging

MongoDB persistence using Mongoose

Asynchronous welcome-email processing using RabbitMQ

Email sending using Nodemailer/Gmail

Tech Stack
Technology Purpose

Node.js JavaScript runtime
Express.js REST API framework
MongoDB Database
Mongoose MongoDB ODM
JWT Authentication
bcryptjs Password hashing
Joi Request validation
RabbitMQ Asynchronous message processing
amqplib Node.js RabbitMQ client
Nodemailer Email sending
Winston Application logging
dotenv Environment variable management

Project Architecture
The backend follows a layered structure:

Client / Postman
      |
      v
   Routes
      |
      v
 Middleware
   |       |
   |       +--> Validation
   |
   +--> JWT Authentication
      |
      v
 Controllers
      |
      v
 Services
      |
      +-----------> Repositories
      |                  |
      |                  v
      |               MongoDB
      |
      +-----------> RabbitMQ
                         |
                         v
                    Email Worker
                         |
                         v
                     Nodemailer
                         |
                         v
                    Welcome Email
Suggested Folder Structure
Fundoo/
│
├── controllers/
│   ├── auth.controller.js
│   ├── note.controller.js
│   └── profile.controller.js
│
├── middlewares/
│   ├── auth.middleware.js
│   ├── error.middleware.js
│   ├── notFound.middleware.js
│   └── validate.middleware.js
│
├── models/
│   ├── note.model.js
│   └── user.model.js
│
├── repositories/
│   ├── note.repository.js
│   └── user.repository.js
│
├── routes/
│   ├── auth.routes.js
│   ├── note.routes.js
│   └── profile.routes.js
│
├── services/
│   ├── auth.service.js
│   ├── email.service.js
│   ├── note.service.js
│   └── profile.service.js
│
├── utils/
│   ├── ApiError.js
│   ├── logger.js
│   ├── mailer.js
│   └── rabbitmq.js
│
├── validations/
│   ├── auth.validation.js
│   ├── note.validation.js
│   └── profile.validation.js
│
├── workers/
│   └── email.worker.js
│
├── constants/
│   └── messages.js
│
├── config/
│   └── db.js
│
├── .env
├── .gitignore
├── package.json
└── README.md
Authentication Flow
Registration
POST /register
      |
      v
Joi validation
      |
      v
Auth Controller
      |
      v
Auth Service
      |
      +--> Check existing email
      |
      +--> bcrypt.hash(password, 10)
      |
      +--> Save user in MongoDB
      |
      +--> Publish WELCOME_EMAIL message
              |
              v
          RabbitMQ Queue
              |
              v
          Email Worker
              |
              v
          Nodemailer
The application does not store the plain-text password. The password is
hashed before the user is stored.

RabbitMQ Email Flow
RabbitMQ is used so that registration does not have to wait for the
email to be sent.

User Registration
       |
       v
Create user in MongoDB
       |
       v
Publish email job
       |
       v
RabbitMQ Email Queue
       |
       v
Email Worker
       |
       v
Nodemailer
       |
       v
Welcome Email
The email job is sent to the configured RabbitMQ queue as a persistent
message. The worker acknowledges the message after successful processing
and negatively acknowledges it with requeue enabled when processing
fails.

Environment Variables
Create a .env file in the project root.

Example:

PORT=3000

MONGODB_URI=mongodb://127.0.0.1:27017/fundoo

JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

RABBITMQ_URL=amqp://localhost
RABBITMQ_EMAIL_QUEUE=fundoo_email_queue

MAIL_USER=your_email@gmail.com
MAIL_PASSWORD=your_gmail_app_password

NODE_ENV=development
Never commit your real .env file to GitHub.

For Gmail SMTP, use an appropriate Gmail App Password rather than
putting your normal Gmail account password in the project.

Installation
Clone the repository:

git clone <YOUR_GITHUB_REPOSITORY_URL>
cd Fundoo
Install dependencies:

npm install
Create .env from the environment-variable example above.

Running the Application
Start MongoDB and RabbitMQ first.

Then start the API:

npm start
Start the email worker in another terminal:

node workers/email.worker.js
If your package.json defines different scripts, use the scripts
configured in that file.

API Endpoints
Authentication
Method Endpoint Description

POST /register Register a user
POST /login Login and receive JWT

Notes
The note routes use JWT authentication.

Method Endpoint Description

POST / Create note
GET / Get notes
GET /search?q=keyword Search notes
GET /:id Get one note
PUT /:id Update note
DELETE /:id Delete note
PATCH /:id/archive Archive note
PATCH /:id/trash Move note to trash
PATCH /:id/restore Restore note

Profile
Method Endpoint Description

GET / Get profile
PUT / Update profile

The exact base paths depend on how these routers are mounted in the
application's main server file.

JWT Authentication
For protected endpoints, send the JWT in the HTTP Authorization header:

Authorization: Bearer <JWT_TOKEN>
The authentication middleware verifies the token and places the decoded
user ID into:

req.user = { id: decoded.id };
This allows controllers/services to identify the logged-in user.

Validation
Joi schemas validate incoming request bodies before controller
execution.

Examples of validated data include:

Registration fields

Login fields

Note creation/update fields

Profile update fields

Validation errors are passed to the centralized error handler.

Error Handling
The project uses a custom ApiError class for application errors and a
centralized error middleware.

Typical HTTP status codes include:

400 - Validation error

401 - Unauthorized / invalid authentication

404 - Resource or route not found

409 - Email already registered

500 - Internal server error

Logging
Winston is used for application logging.

Logs are configured for:

Console output

Application logs

Error logs

The logger creates/uses a logs directory for log files.

Database Models
User
The user model contains:

firstName
lastName
email
password
profileImage
createdAt
updatedAt
Note
The note model contains:

userId
title
description
color
isPinned
isArchived
isTrashed
labels
createdAt
updatedAt
Each note belongs to a user through userId.

Important Security Notes
Keep .env out of Git.

Never commit JWT secrets.

Never commit email credentials.

Never store plain-text passwords.

Use a strong JWT secret.

Use HTTPS in production.

Use a dedicated production MongoDB/RabbitMQ setup.

Testing With Postman
A typical flow is:

Register a user.

Login.

Copy the JWT returned by login.

Add Authorization: Bearer <token> to protected requests.

Create a note.

Fetch/update/archive/trash/restore/search the note.

Check RabbitMQ and the worker when testing welcome-email processing.

GitHub Upload
From the project root:

git init
git add .
git commit -m "Initial commit - Fundoo backend"
git branch -M main
git remote add origin <YOUR_GITHUB_REPOSITORY_URL>
git push -u origin main
Before git add ., make sure .env is included in .gitignore.

Future Improvements
Possible improvements for the next version:

Automated tests

API documentation with Swagger/OpenAPI

Refresh tokens

Password reset/email verification

Rate limiting

Better RabbitMQ retry/DLX strategy

Docker Compose for MongoDB and RabbitMQ

Production configuration

Pagination and advanced note filtering

CI/CD pipeline

Author
Fundoo Backend Project

Built as a Node.js backend project to practice REST APIs,
authentication, MongoDB, layered architecture, RabbitMQ, asynchronous
email processing, validation, and logging.