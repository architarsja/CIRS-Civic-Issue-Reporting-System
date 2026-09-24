function required(value) {
  return value !== undefined && value !== null && String(value).trim() !== '';
}

function validEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

module.exports = {
  required,
  validEmail
};