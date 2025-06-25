const express = require('express');
const cors = require('cors');
const session = require('express-session')
const app = express();
const PORT = 3000;
const { PrismaClient } = require('./generated/prisma');
const prisma = new PrismaClient();
const { hashPassword, verifyPassword } = require('./services/auth');

app.use(cors());
app.use(express.json());
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});

let sessionConfig = {
    name: 'sessionId',
    secret: 'secret text',
    cookie: {
        maxAge: 1000 * 60 * 5,
        secure: true,
        httpOnly: false,
    },
    resave: false,
    saveUninitialized: false,
}

app.use(session(sessionConfig))

function badRequestError(res, message, code = 400) {
    res.status(code).json( message )
}

app.post('/api/signup', async (req, res, next) => {
    // check username for uniqueness, hash password and write user to db
    if (!req.body.username) {
        badRequestError(res, 'Username required')
    } else if (!req.body.password) {
        badRequestError(res, 'Password required')
    } else if (req.body.username.length < 5) {
        badRequestError(res, 'Username must have length at least 5')
    } else if (req.body.password.length < 5) {
        badRequestError(res, 'Password must have length at least 5')
    } else {
        const { username, password: plainPassword } = req.body
        const user = await prisma.user.findUnique({ where: { username } })
        if (user) {
            badRequestError(res, 'Username taken', 409)
        } else {
            const hash = await hashPassword(plainPassword)
            const newUserData = { username, password: hash, access_level: 0 }
            const newUser = await prisma.user.create({ data: newUserData });
            res.json({ message: `Welcome ${newUser.username}!` })
        }
    }
})

app.post('/api/login', async (req, res, next) => {
    // check username exists and password matches the hash in the db
    const { username, password: plainPassword } = req.body
    const user = await prisma.user.findUnique({ where: { username } })
    if (user && await verifyPassword(plainPassword, user.password)) {
        req.session.user = user
        res.json({ message: `Welcome back, ${username}!` })
    } else {
        badRequestError(res, 'Invalid Login',401)
    }
})

app.post('/api/logout', (req, res, next) => {
    req.session.destroy(err => {
        res.json({ message: 'Logout successful' })
    });
    next({ message: 'Logout failed' })
})
