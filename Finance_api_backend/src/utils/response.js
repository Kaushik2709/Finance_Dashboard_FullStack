const sendSuccess = (res, data, meta, statusCode = 200) => {
  const payload = {
    success: true,
    data,
  };

  if (meta) {
    payload.meta = meta;
  }

  return res.status(statusCode).json(payload);
};

const sendError = (res, message, code = 'INTERNAL_SERVER_ERROR', details, statusCode = 500) => {
  const payload = {
    success: false,
    error: {
      message,
      code,
    },
  };

  if (details) {
    payload.error.details = details;
  }

  return res.status(statusCode).json(payload);
};

module.exports = {
  sendSuccess,
  sendError,
};