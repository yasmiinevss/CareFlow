export  function errorHandler(err, req, res, next) {
    const statusCode = err.statusCode || 500;
    if (statusCode === 500) {
        console.error(err.stack);
        return res.status(statusCode).json({ error : {code: 'INTERNAL_SERVER_ERROR', message: 'Internal Server Error' } });
    }
    res.status(statusCode).json({error : {code: err.code || statusCode, message: err.message } });
}