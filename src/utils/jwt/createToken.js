import config from '../../config/config.js';
import jwt from 'jsonwebtoken';

export const createJWT = (email) => {
  const payload = { email };
  const options = { expiresIn: '1h' };
  const token = jwt.sign(payload, config.jwt.key, options);
  return token;
};
