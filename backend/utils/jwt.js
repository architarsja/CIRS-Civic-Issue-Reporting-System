const jwt = require('jsonwebtoken');

function signToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role, name: user.name, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '2h' }
  );
}

module.exports = { signToken };
