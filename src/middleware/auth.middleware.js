const User = require("../models/User");
const { verifyToken } = require("../utils/jwt.util");

async function protect(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const [type, token] = header.split(" ");
    if (type !== "Bearer" || !token) {
      return res.status(401).json({ message: "Not authorized, token missing" });
    }
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.sub);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    req.user = user;
    return next();
  } catch {
    return res.status(401).json({ message: "Not authorized, invalid token" });
  }
}

module.exports = { protect };
