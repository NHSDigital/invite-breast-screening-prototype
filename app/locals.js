module.exports = (config) => (req, res, next) => {

  const locals = {
    serviceName: config.serviceName,
    query: req.query,
  }

  // Assign all local variables at once
  Object.assign(res.locals, locals)

  next();
};
