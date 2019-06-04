const express = require("express");
const logger = require("morgan");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
const { userRoutes } = require("./routes");
// ==========================================================================
// DATABASE CONFIGURATION AND SERVER STARTUP
// ==========================================================================
const mongoURI = `mongodb://localhost/api-auth`;
const PORT = app.get("PORT") || 5000;
mongoose
  .connect(mongoURI, { useNewUrlParser: true })
  .then(() => {
    console.log(`MONGO DB STARTED`);
    app.listen(PORT, () => console.log(`SERVER STARTED AT ${PORT}`));
  })
  .catch(err => console.log(`ERROR STARTING MONGO DB`));

// ==========================================================================
//  MIDDLEWARES
// ==========================================================================
//  IT IS USED FOR ALLOWING CROSS ORIGIN REQUESTS I.E. FROM PORT 3000 TO PORT 5000
app.use(cors());
app.use(logger("dev"));
app.use(bodyParser.json());

// ==========================================================================
//  ROUTES
// ==========================================================================
app.use("/users", userRoutes);
// ==========================================================================
// CREATING PAGE NOT FOUND ERROR
app.use((req, res, next) => {
  const error = new Error("Page Not Found");
  error.status = 404;
  next(error);
});
// ==========================================================================
// ==========================================================================
// MIDDLEWARE FOR HANDLING ERRORS
app.use((err, req, res, next) => {
  const error = app.get("env") === "development" ? err : {};
  const status = error.status || 500;
  res.status(status).json({
    message: error.message
  });
});
// ==========================================================================
