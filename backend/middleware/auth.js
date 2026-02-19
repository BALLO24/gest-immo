const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: "Accès refusé" });
console.log("token",token);

  require('jsonwebtoken').verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Session expirée" });
      req.user = user;
    console.log("user", user);
    console.log("end authToken");
    next();
  });
};

// Middleware de vérification des rôles
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
      if (!req.user || !allowedRoles.includes(req.user.role)) {
        console.log("User:", req.user);
        console.log("Allowed roles:", allowedRoles);
        
      return res.status(403).json({ message: "Permission insuffisante" });
    }
    next();
  };
};
module.exports = { authenticateToken, authorizeRoles };