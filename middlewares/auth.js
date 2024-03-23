const jwt = require("jsonwebtoken");
const User = require("../models/userModels");

const isAuthenticated = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        err: "You must be logged in",
      });
    }

    const token = authHeader.split(" ")[1]; // This is the bearer token
    // console.log(token)
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await User.findOne({where : {id : decoded.user.id}});

    if (!user) {
      return res.status(404).json({ err: "User not found" });
    }
    req.user = user;
    next();
  } catch (err) {
    console.log(err);
    res.status(503).json({
      err: "Token is not valid",
    });
  }
};

module.exports = isAuthenticated;