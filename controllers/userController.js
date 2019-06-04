const JWT = require("jsonwebtoken");
const { User } = require("../models");
const { jwtSecretKey } = require("../configuration").keys;
const signToken = user =>
  JWT.sign(
    // payload
    {
      iss: "Api-authentication", //issuer of jwt {optional}
      sub: user._id, // current subject:- piece of information to identify user {must}
      iat: new Date().getTime(), //  issued time i.e. current time {optional}{automatically assigned if not provided}
      exp: new Date().setDate(new Date().getDate() + 1) // expiration period, 1 day after current time
    },
    // secret key to decode and verify that token is not manipulated
    jwtSecretKey
  );
module.exports = {
  // VALIDATION : DONE
  signUp: async (req, res, next) => {
    const { email, password } = req.value.body;
    // check if there is a user with the same email
    const foundUser = await User.findOne({
      "local.email": email
    });
    if (foundUser) {
      const err = new Error(
        "User with the same email address is already present"
      );
      err.status = 403;
      return next(err);
    }

    // create a new user with this email
    const newUser = await User.create({
      method: "local",
      local: {
        email: email,
        password: password
      }
    });

    // generate a token
    const token = signToken(newUser);

    // respond with token
    return res.status(200).json({ token });
  },

  // VALIDATION DONE BY PASSPORT
  signIn: async (req, res, next) => {
    // TOKEN VERIFICATION IS TO BE DONE BY PASSPORT
    const token = signToken(req.user);
    return res.status(200).json({ token });
  },

  googleOauth: async (req, res, next) => {
    const token = signToken(req.user);
    return res.status(200).json({ token });
  },

  // VALIDATION: NOT REQUIRED
  secret: async (req, res, next) => {
    return res.status(200).json({
      secret: "Secret Resource"
    });
  },
  facebookOauth: async (req, res, next) => {
    const token = signToken(req.user);
    return res.status(200).json({ token });
  }
};
