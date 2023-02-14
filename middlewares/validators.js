const { celebrate, Joi } = require('celebrate');
const { ObjectId } = require('mongoose').Types;
const { REGEX_FOR_URL } = require('../utils/constants');

const validateCreateUser = celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30).required(),
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
});

const validateSignin = celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
});

const validateUpdateUserProfile = celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    email: Joi.string().email(),
  }),
});

const validateCreateMovie = celebrate({
  body: Joi.object().keys({
    country: Joi.string().required(),
    director: Joi.string().required(),
    duration: Joi.number().required(),
    year: Joi.number().required(),
    description: Joi.string().required(),
    movieId: Joi.number().required(),
    nameRU: Joi.string().required(),
    nameEN: Joi.string().required(),

    image: Joi.string().required().custom((value, helpers) => {
      if (REGEX_FOR_URL.test(value)) {
        return value;
      }
      return helpers.message('Невалидный url для постера.');
    }),

    trailerLink: Joi.string().required().custom((value, helpers) => {
      if (REGEX_FOR_URL.test(value)) {
        return value;
      }
      return helpers.message('Невалидный url для трейлера.');
    }),

    thumbnail: Joi.string().required().custom((value, helpers) => {
      if (REGEX_FOR_URL.test(value)) {
        return value;
      }
      return helpers.message('Невалидный url для миниатюрного изображения постера.');
    }),
  }),
});

const validateDeleteMovie = celebrate({
  params: Joi.object().keys({
    _id: Joi.string().custom((value, helpers) => {
      if (ObjectId.isValid(value)) {
        return value;
      }
      return helpers.message('Невалидный _id фильма.');
    }),
  }),
});

module.exports = {
  validateCreateUser,
  validateSignin,
  validateUpdateUserProfile,
  validateCreateMovie,
  validateDeleteMovie,
};
