const usersRouter = require('express').Router();
const { getUserProfileInfo, updateUserProfileInfo } = require('../controllers/users');
const { validateUpdateUserProfile } = require('../middlewares/validators');

usersRouter.get('/me', getUserProfileInfo);
usersRouter.patch('/me', validateUpdateUserProfile, updateUserProfileInfo);

module.exports = { usersRouter };
