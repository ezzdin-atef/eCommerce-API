const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  firstName: String,
  lastName: String,
  email: String,
  password: String,
  admin: {
    type: Boolean,
    default: false
  },
  orders: Array,
});

module.exports = mongoose.model("User", userSchema, "users");
