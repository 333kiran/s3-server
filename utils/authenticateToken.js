import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export default function authenticateToken(req, res, next) {
  const token = req.header("Authorization").split(" ")[1];
  const id = req.params;
  console.log("tokenid ->", id);
  console.log("token ->", token);

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
    if (err) {
      console.log("error while verifying token:", err);
      return res.status(403).json({ error: err });
    }
    req.user = user;
    next();
  });
}
