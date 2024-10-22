import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['pending', 'driver', 'admin', 'owner'],
    default: 'pending',
  },
}, { timestamps: true });

// Delete the existing model if it exists
mongoose.models = {};

const User = mongoose.model("User", userSchema);

export default User;
