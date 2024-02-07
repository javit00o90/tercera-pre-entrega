import express from 'express';
import passport from 'passport';
import sessionController from '../controller/sessionController.js';

const router = express.Router();

router.post('/login', sessionController.userLogin);
router.post('/register', sessionController.userRegister)
router.get('/github', passport.authenticate('github', { session: false }), (req, res) => {
});
router.get('/callbackGithub', passport.authenticate('github', { failureRedirect: "/login", session: false }), sessionController.githubCallBack)
router.get('/current', passport.authenticate('current', { session: false }), (req, res) => {
    res.json({ user: req.user });
});
router.get('/logout', sessionController.userLogout);

export default router;