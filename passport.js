const passport = require("passport");
const bcrypt = require("bcryptjs");
const JwtStrategy = require("passport-jwt").Strategy;
const LocalStrategy = require("passport-local").Strategy;
const GooglePlusTokenStrategy = require("passport-google-plus-token");
const FacebookTokenStrategy = require("passport-facebook-token");
const FacebookStrategy = require("passport-facebook");
const { ExtractJwt } = require("passport-jwt");
const { jwtSecretKey, google, facebook } = require("./configuration").keys;
const { clientID, clientSecret, apiKey } = google;

const { User } = require("./models");

// Facebook strategy
passport.use(
  new FacebookTokenStrategy(
    {
      clientID: facebook.appId,
      clientSecret: facebook.clientSecret
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const foundUser = await User.findOne({ "facebook.id": profile.id });
        if (!foundUser) {
          const newUser = await new User({
            method: "facebook",
            facebook: {
              id: profile.id,
              email: profile.emails[0].value
            }
          });
          await newUser.save();
          return done(null, newUser);
        }
        return done(null, foundUser);
      } catch (error) {
        return done(null, false, error.message);
      }
    }
  )
);
// Google strategy
passport.use(
  new GooglePlusTokenStrategy(
    {
      clientID,
      clientSecret,
      passReqToCallback: true
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        // FIND USER IN THE DATABASE WITH GOOGLE ID
        const dbUser = await User.findOne({
          "google.id": profile.id
        });

        // IF NO USER IS FOUND WITH THE GOOGLE ID
        if (!dbUser) {
          const newUser = new User({
            method: "google",
            google: {
              id: profile.id,
              email: profile.emails[0].value
            }
          });
          await newUser.save();
          return done(null, newUser);
        }
        return done(null, dbUser);
        console.log(profile);
      } catch (error) {
        done(error, false, error.message);
      }
    }
  )
);
// JSON Web Tokens
passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromHeader("authorization"),
      secretOrKey: jwtSecretKey
    },
    async (jwtPayload, done) => {
      try {
        // find user from payload
        const dbUser = await User.findById(jwtPayload.sub);
        // if user doesn't exist
        if (!dbUser) {
          return done(null, false);
        }
        // otherwise return user
        return done(null, dbUser);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

// Local Strategy
passport.use(
  new LocalStrategy(
    { usernameField: "email" },
    async (email, password, done) => {
      try {
        const dbUser = await User.findOne({ "local.email": email });
        // if user doesn't exist
        if (!dbUser) {
          return done(null, false);
        }

        // if user exist, then check if password is correct
        const isMatch = await dbUser.isValidPassword(password);
        if (!isMatch) {
          return done(null, false);
        }
        return done(null, dbUser);
      } catch (error) {
        done(error, false);
      }
    }
  )
);
