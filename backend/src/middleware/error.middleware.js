const notFound = (req, res, next) => {
  const error = new Error(
    `Route not found: ${req.originalUrl}`
  );

  error.statusCode = 404;

  next(error);
};

const errorHandler = (error, req, res, next) => {
  console.error("Error:", error);

  const statusCode =
    error.statusCode ||
    (res.statusCode !== 200
      ? res.statusCode
      : 500);

  res.status(statusCode).json({
    success: false,
    message:
      error.message || "Internal Server Error",

    ...(process.env.NODE_ENV === "development" && {
      stack: error.stack
    })
  });
};

export {
  notFound,
  errorHandler
};