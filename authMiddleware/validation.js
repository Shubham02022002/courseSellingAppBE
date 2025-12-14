const z = require("zod");

const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    console.log(error);
    res.status(400).json({ errors: error.errors });
  }
};

module.exports = validate;
