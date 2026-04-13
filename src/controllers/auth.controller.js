const User = require("../models/User");
const { catchAsync } = require("../utils/catchAsync");
const { signToken } = require("../utils/jwt.util");

const register = catchAsync(async (req, res) => {
  const { name, email, password } = req.body;
  const exists = await User.findOne({ email });
  if (exists) {
    return res.status(409).json({ message: "Email already registered" });
  }
  const user = await User.create({ name, email, password });
  const token = signToken({ sub: user._id.toString() });
  return res.status(201).json({
    message: "Registered successfully",
    token,
    user: { id: user._id, name: user.name, email: user.email },
  });
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: "Invalid email or password" });
  }
  const token = signToken({ sub: user._id.toString() });
  return res.json({
    message: "Login successful",
    token,
    user: { id: user._id, name: user.name, email: user.email },
  });
});

const changePassword = catchAsync(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select("+password");
  if (!user || !(await user.comparePassword(currentPassword))) {
    return res.status(401).json({ message: "Current password is incorrect" });
  }
  user.password = newPassword;
  await user.save();
  return res.json({ message: "Password changed successfully" });
});

module.exports = {
  register,
  login,
  changePassword,
};
