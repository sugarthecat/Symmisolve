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
    res.status(code).json(message)
}

app.post('/api/signup', async (req, res, next) => {
    // regex means that the username is purely alphanumeric
    const regex = /^[a-zA-Z0-9]+$/;
    if (!req.body.username) {
        badRequestError(res, 'Username required')
    } else if (!req.body.password) {
        badRequestError(res, 'Password required')
    } else if (req.body.username.length < 5) {
        badRequestError(res, 'Username must have length at least 5', 411)
    } else if (req.body.password.length < 5) {
        badRequestError(res, 'Password must have length at least 5', 411)
    } else if (!req.body.username.match(regex)) {
        badRequestError(res, 'Username can only contain letters and numbers')
    } else {
        const { username, password: plainPassword } = req.body
        const user = await prisma.user.findMany({
            where: {
                username:
                {
                    equals: username,
                    mode: 'insensitive'
                }
            }
        })
        if (user.length > 0) {
            badRequestError(res, 'Username taken', 409)
        } else {
            const hash = await hashPassword(plainPassword)
            const newUserData = { username, password: hash, access_level: 0 }
            const newUser = await prisma.user.create({ data: newUserData });
            res.session.user = newUser //start logged in
            res.json({ message: `Welcome ${newUser.username}!` })
        }
    }
})

app.post('/api/login', async (req, res, next) => {
    const { username, password: plainPassword } = req.body
    const user = await prisma.user.findUnique({ where: { username } })
    if (user && await verifyPassword(plainPassword, user.password)) {
        req.session.user = user
        res.json({ message: `Welcome back, ${username}!` })
    } else {
        badRequestError(res, 'Invalid Login', 401)
    }
})

app.post('/api/logout', (req, res, next) => {
    req.session.destroy(err => {
        res.json({ message: 'Logout successful' })
    });
    next({ message: 'Logout failed' })
})
