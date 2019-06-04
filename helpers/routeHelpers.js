const Joi = require("@hapi/joi");
module.exports = {
  validateBody: schema => (req, res, next) => {
    const result = Joi.validate(req.body, schema);
    if (result.error) {
      result.error.status = 400;
      next(result.error);
    }
    if (!req.value) {
      req.value = {};
    }
    if (!req.value.body) {
      req.value.body = {};
    }
    req.value.body = result.value;
    next();
  },
  schemas: {
    authSchema: Joi.object().keys({
      email: Joi.string()
        .email()
        .required(),
      password: Joi.string().required()
    })
  }
};
