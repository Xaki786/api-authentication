const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const userSchema = new mongoose.Schema({
  method: {
    type: String,
    enum: ["local", "google", "facebook"],
    requried: true
  },
  local: {
    email: {
      type: String,
      lowercase: true
    },
    password: {
      type: String
    }
  },
  google: {
    id: String,
    email: {
      type: String,
      lowercase: true
    }
  },
  facebook: {
    id: String,
    email: {
      type: String,
      lowercase: true
    }
  }
});
userSchema.pre("save", async function(next) {
  try {
    if (this.method !== "local") {
      return next();
    }
    // generate salt
    const salt = await bcrypt.genSalt(10);

    // generate salted hashed password
    this.local.password = await bcrypt.hash(this.local.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.isValidPassword = async function(enteredPassword) {
  try {
    return await bcrypt.compare(enteredPassword, this.local.password);
  } catch (error) {
    throw new Error(error);
  }
};
const userModel = mongoose.model("user", userSchema);
module.exports = userModel;
