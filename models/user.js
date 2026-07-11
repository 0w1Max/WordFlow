function createUser({ email, passwordHash }) {
  return {
    email: email.trim().toLowerCase(),
    passwordHash
  };
}

module.exports = { createUser };
