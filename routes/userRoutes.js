const router = require("express-promise-router")();
const passport = require("passport");
const passportConfig = require("../passport");
const {
  signUp,
  signIn,
  secret,
  googleOauth,
  facebookOauth
} = require("../controllers").userController;
const { validateBody, schemas } = require("../helpers/routeHelpers");
const { authSchema } = schemas;
const passportAuth = {
  jwt: passport.authenticate("jwt", { session: false }),
  googlePlus: passport.authenticate("google-plus-token", { session: false }),
  local: passport.authenticate("local", { session: false }),
  facebook: passport.authenticate("facebook-token", { session: false })
};
router.route("/signup").post(validateBody(authSchema), signUp);
router
  .route("/signin")
  .post(validateBody(authSchema), passportAuth.local, signIn);

router.route("/secret").get(passportAuth.jwt, secret);

router.route("/oauth/google").post(passportAuth.googlePlus, googleOauth);
module.exports = router;

router.route("/oauth/facebook").post(passportAuth.facebook, facebookOauth);
