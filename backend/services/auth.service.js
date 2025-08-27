import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

const generateTokenAndSetCookie = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '10d',
  });

  res.cookie('token', token, {
    maxAge: 864000000, // 10 days
    httpOnly: true, 
    sameSite: 'strict', 
    secure: process.env.NODE_ENV !== 'development', 
  });
};

export default generateTokenAndSetCookie;
