const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({
      "status": "error",
      "message": "unauthorized. you are not authorized to access"
    });
  }

  try {
    const decoded = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({
      "status": "error",
      "message": "unauthorized. Invalid token"
    });
  }
};

module.exports = authMiddleware;
