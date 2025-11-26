import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';

export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        res.status(401);
        throw new Error('User not found');
      }

      next();
    } catch (error) {
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

export const authorizeAdminOrOwner = (Model, idParam = 'id') => {
  return asyncHandler(async (req, res, next) => {
    const resourceId = req.params[idParam];
    const user = req.user;

    if (!user) {
      res.status(401);
      throw new Error('Not authorized');
    }

    if (user.role === 'admin') return next();

    // For owner check, compare submittedBy
    const doc = await Model.findById(resourceId);
    if (!doc) {
      res.status(404);
      throw new Error('Resource not found');
    }

    if (doc.submittedBy.toString() !== user._id.toString()) {
      res.status(403);
      throw new Error('Forbidden');
    }

    next();
  });
};
