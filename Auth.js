const jwt = require('jsonwebtoken');
require('dotenv').config();

const KEY = process.env.KEY

const auth = function(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    res.status(401).send('Unauthorized: No token provided');
  } else {
    jwt.verify(token, KEY, function(err, decoded) {
      if (err) {
        res.status(401).send('Unauthorized: Invalid token');
      } else {
        req.userId = decoded.userId;
        req.dashboard = decoded.dashboard;
        req.admin = decoded.admin;
        next();
      }
    });
  }
}
module.exports = auth;