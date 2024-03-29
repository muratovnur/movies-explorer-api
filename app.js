require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { errors } = require('celebrate');
const { usersRouter } = require('./routes/users');
const { moviesRouter } = require('./routes/movies');
const { createUser, signin, signout } = require('./controllers/users');
const { validateCreateUser, validateSignin } = require('./middlewares/validators');
const { auth } = require('./middlewares/auth');
const { handleError } = require('./middlewares/handleError');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const { NotFoundError } = require('./errors/NotFoundError');

const { DATABASE_ADDRESS, PORT = 3000 } = process.env;

const app = express();

mongoose.set('strictQuery', false);
const connectDB = async () => {
  try {
    await mongoose.connect(DATABASE_ADDRESS);
  }
  catch (error) {
    console.log(error);
    process.exit(1);
  }
};

app.use(cors({ credentials: true, maxAge: 600, origin: ['http://localhost:3000', 'https://movies-explorer-a4812.web.app', 'https://movies-explorer-a4812.web.app/', 'https://movies-explorer-a4812.web.app//'] }));

app.use(cookieParser());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(requestLogger);

app.post('/signup', validateCreateUser, createUser);
app.post('/signin', validateSignin, signin);

app.use(auth);

app.use('/users', usersRouter);
app.use('/movies', moviesRouter);

app.get('/signout', signout);
app.use('/', (req, res, next) => next(new NotFoundError('По указанному пути ничего не найдено.')));

app.use(errorLogger);

app.use(errors());

app.use(handleError);

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server is running on port ${PORT}.`));
});
