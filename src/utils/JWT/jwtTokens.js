import jwt from "jsonwebtoken";

// Generate Access Token (Valid for 15 minutes)
const generateAccessToken = (user) => {
  try {
    return jwt.sign(
      { id: user.id, login: user.login },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    );
  } catch (error) {
    console.error("Error generating Access Token:", error);
    return null;
  }
};

// Generate Refresh Token (Valid for 30 days)
const generateRefreshToken = (user) => {
  try {
    return jwt.sign(
      { id: user.id, login: user.login },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
    );
  } catch (error) {
    console.error("Error generating Refresh Token:", error);
    return null;
  }
};

// Verify Access Token
const verifyAccessToken = (accessToken) => {
  try {
    return jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
  } catch (error) {
    console.error("Invalid Access Token:", error.message);
    return null;
  }
};

// Verify Refresh Token
const verifyRefreshToken = (refreshToken) => {
  try {
    return jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
  } catch (error) {
    console.error("Invalid Refresh Token:", error.message);
    return null;
  }
};

export {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
