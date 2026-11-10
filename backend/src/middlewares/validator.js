exports.validator = (schema) => {
  return (req, res, next) => {
    try {
      if (schema.body) {
        req.body = schema.body.parse(req.body);
      }

      // Object.assign keeps the same object Express created.
      // (Reassigning req.params also works, but this is safer.)
      if (schema.params) {
        Object.assign(req.params, schema.params.parse(req.params));
      }

      // Express 5 defines req.query as a getter, so assigning to it
      // silently does nothing. Store the parsed result separately.
      if (schema.query) {
        req.validatedQuery = schema.query.parse(req.query);
      }

      next();
    } catch (err) {
      // Zod 4 renamed `error.errors` to `error.issues`.
      // Reading the old name returned undefined, which is why the API
      // used to answer `{ "success": false }` with no message.
      if (err.name === "ZodError") {
        const issues = err.issues || err.errors || [];
        return res.status(400).json({
          success: false,
          message: issues[0]?.message || "Validation failed",
          errors: issues,
        });
      }
      next(err);
    }
  };
};
