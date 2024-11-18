import jwt from "jsonwebtoken";

export const isAuthenticated = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Authorization token missing or invalid",
      success: false,
    });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.id = decoded.userId;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Token expired",
        success: false,
      });
    }
    return res.status(401).json({
      message: "Invalid token",
      success: false,
    });
  }
};

export default isAuthenticated;