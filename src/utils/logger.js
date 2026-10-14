
const formatMessage = (message) =>
  typeof message === 'string'
    ? message
    : JSON.stringify(message);

const logger = {
  info: (message) => console.log('[INFO]', formatMessage(message)),
  warn: (message) => console.warn('[WARN]', formatMessage(message)),
  error: (message) => console.error('[ERROR]', formatMessage(message))
};

module.exports = logger;
