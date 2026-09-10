const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const logger = require('./utils/logger');

const authRoutes = require('./routes/auth.routes');
const noteRoutes = require('./routes/note.routes');
const profileRoutes = require('./routes/profile.routes');
const notFound = require('./middlewares/notFound.middleware');
const errorHandler = require('./middlewares/error.middleware');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: { write: (msg) => logger.info(msg.trim()) } }));

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/notes', noteRoutes);
app.use('/api/v1/profile', profileRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use(notFound);
app.use(errorHandler);

module.exports = app;