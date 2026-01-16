import { Router } from 'express';
import { body } from 'express-validator';
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserPlan,
  deleteUserAccount,
} from '@/controllers/user/user.controller';
import authenticate from '@/middlewares/authenticate';
import validationError from '@/middlewares/validationError';
import whitelistBody from '@/middlewares/whitelistBody';

const router = Router();

router.post(
  '/register',
  whitelistBody(['userId', 'email', 'username', 'password']),
  body('userId')
    .isString()
    .withMessage('userId has to be a string')
    .notEmpty()
    .withMessage('userId is required'),
  body('email')
    .isEmail()
    .withMessage('Email must be valid')
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('username')
    .isString()
    .withMessage('Username has to be a string')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters long'),
  body('password')
    .isString()
    .withMessage('Password has to be a string')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
  validationError,
  registerUser
);

router.post(
  '/login',
  whitelistBody(['email', 'password']),
  body('email')
    .isEmail()
    .withMessage('Email must be valid')
    .notEmpty()
    .withMessage('Email is required')
    .normalizeEmail(),
  body('password')
    .isString()
    .withMessage('Password has to be a string')
    .notEmpty()
    .withMessage('Password is required'),
  validationError,
  loginUser
);


router.get('/profile', authenticate,getUserProfile);

router.patch(
  '/plan',
  body('plan')
    .isIn(['free', 'standard', 'premium'])
    .withMessage(
      'Invalid plan type. Plan must be one of free, standard, or premium'
    )
    .isString()
    .withMessage('Plan must be of type string'),
  whitelistBody(['plan']),
  authenticate,
  validationError,
  updateUserPlan
);

router.delete('/', authenticate,deleteUserAccount);

export default router;
