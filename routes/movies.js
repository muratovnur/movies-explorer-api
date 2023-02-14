const moviesRouter = require('express').Router();
const { getMovies, createMovie, deleteMovie } = require('../controllers/movies');
const { validateCreateMovie, validateDeleteMovie } = require('../middlewares/validators');

moviesRouter.get('/', getMovies);
moviesRouter.post('/', validateCreateMovie, createMovie);
moviesRouter.delete('/:_id', validateDeleteMovie, deleteMovie);

module.exports = { moviesRouter };
