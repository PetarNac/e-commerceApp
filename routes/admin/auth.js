// sub router
const express = require('express');

const { handleErrors } = require('./middlewares');
const usersRepo = require('../../repositories/users');
const signupTemplate = require('../../views/admin/auth/signup');
const signinTemplate = require('../../views/admin/auth/signin');
const {
    requireEmail,
    requirePassword,
    requirePasswordConfirmation,
    requireEmailExist,
    requireValidPasswordForUser
} = require('./validators');


const router = express.Router();

router.get('/signup', (req, res) => {
    res.send(signupTemplate({ req }));
});

//                                         MIDDLEWARE
// const bodyParser = (req, res, next) => {
//     if (req.method === 'POST') {
//         req.on('data', data => {
//             const parsed = data.toString('utf8').split('&');
//             const formData = {};
//             for (let pair of parsed) {
//                 const [key, value] = pair.split('=');
//                 formData[key] = value;
//             }
//             req.body = formData;
//             next();
//         });
//     } else {
//         next();
//     }
// };


router.post('/signup',
    [requireEmail, requirePassword, requirePasswordConfirmation],
    handleErrors(signupTemplate),
    async (req, res) => {

        const { email, password, } = req.body;

        // Create a user in our user repo to represent this person
        const user = await usersRepo.create({ email, password });

        // Store the id of that user inside the users cookie
        req.session.userId = user.id;

        res.redirect('/admin/products');
    });

//                             SIGN OUT
router.get('/signout', (req, res) => {
    req.session = null;
    res.send('You are logged out');
});

//                             SIGN IN
router.get('/signin', (req, res) => {
    res.send(signinTemplate({}));
});


router.post(
    '/signin',
    [requireEmailExist, requireValidPasswordForUser],
    handleErrors(signinTemplate),
    async (req, res) => {


        const { email } = req.body;

        const user = await usersRepo.getOneBy({ email });


        // comparing passwords


        req.session.userId = user.id;

        res.redirect('/admin/products');
    });

module.exports = router;