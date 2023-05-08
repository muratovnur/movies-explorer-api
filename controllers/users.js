const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const { BadRequestError } = require('../errors/BadRequestError');
const { ConflictError } = require('../errors/ConflictError');
const { NotFoundError } = require('../errors/NotFoundError');
const { OK } = require('../utils/constants');

const { NODE_ENV = 'dev', JWT_SECRET } = process.env;

const createUser = (req, res, next) => {
  const { email, password, name } = req.body;

  bcrypt.hash(password, 10)
    .then((hash) => User.create({ email, password: hash, name }))
    .then((user) => res.status(OK).send({
      _id: user._id,
      name: user.name,
      email: user.email,
    }))
    .catch((err) => {
      if (err instanceof mongoose.Error.ValidationError) {
        next(new BadRequestError('Переданы некорректные данные при создании пользователя.'));
      }
      else if (err.code === 11000) {
        next(new ConflictError('Пользователь с такой почтой уже существует. Попробуйте сделать вход.'));
      }
      else {
        next(err);
      }
    });
};

const signin = (req, res, next) => {
  const { email, password } = req.body;

  User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, NODE_ENV !== 'production' ? 'dev-secret' : JWT_SECRET, { expiresIn: '7d' });

      res.cookie('jwt', token, {
        maxAge: 43200000,
        httpOnly: true,
        sameSite: 'none',
        secure: true,
      });

      res.status(OK).send({
        _id: user._id,
        name: user.name,
        email: user.email,
      });
    })
    .catch(next);
};

const signout = (req, res) => {
  res.clearCookie('jwt');
  res.status(OK).send({ message: 'Выход успешно выполнен!' });
};

const getUserProfileInfo = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Пользователь по указанному _id не найден.');
      }

      res.status(OK).send(user);
    })
    .catch((err) => {
      if (err instanceof mongoose.Error.CastError) {
        next(new BadRequestError('Передан некорректный _id пользователя.'));
      }
      else {
        next(err);
      }
    });
};

const updateUserProfileInfo = (req, res, next) => {
  User.findByIdAndUpdate(
    req.user._id,
    { ...req.body },
    { new: true, runValidators: true },
  ).then((user) => {
    if (!user) {
      throw new NotFoundError('Пользователь по указанному _id не найден.');
    }

    res.status(OK).send(user);
  }).catch((err) => {
    if (err instanceof mongoose.Error.CastError) {
      next(new BadRequestError('Передан некорректный _id пользователя.'));
    }
    else if (err.code === 11000) {
      next(new ConflictError('Пользователь с такой почтой уже существует.'));
    }
    else {
      next(err);
    }
  });
};

module.exports = {
  createUser,
  signin,
  signout,
  getUserProfileInfo,
  updateUserProfileInfo,
};
