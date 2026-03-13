// Role-based authorization middleware
const authorizeRoles = (req, res, next) => {
  console.log("Checking role for user:", req.user);
  if (req.user.role !== 'admin') {
    return res
      .status(403)
      .json({ message: 'Access denied. Insufficient permissions.', userRole: req.user.role });
  }
  next();
};

module.exports = { authorizeRoles };
