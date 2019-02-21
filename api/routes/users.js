const express = require('express');
const router = express.Router();
const UserController = require('../controllers/users');
const checkAuth = require('../middleware/check-auth');

//routes
router.post('/signup', UserController.users_create_signup);

router.post("/login", UserController.users_login);

//TODO, here any user can delete another user
//App does not have granular role permissions controls
router.delete("/:userId", checkAuth, UserController.users_delete_user);


module.exports = router;