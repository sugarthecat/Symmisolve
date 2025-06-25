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


app.post('/api/signup', async (req, res, next) => {
    // check username for uniqueness, hash password and write user to db
    const { username, password: plainPassword } = req.body
    const user = await prisma.user.findUnique({ where: { username } })
    if (user) {
        res.json({ message: 'Username taken' }).status(409)
    } else {
        const hash = await hashPassword(plainPassword)
        const newUserData = { username, password: hash, access_level: 0 }
        const newUser = await prisma.user.create({ data: newUserData });
        res.json({ message: `Welcome ${newUser.username}!` })
    }
})

app.post('/api/login', async (req, res, next) => {
    // check username exists and password matches the hash in the db
    const { username, password: plainPassword } = req.body
    const user = await prisma.user.findUnique({ where: { username } })
    if (user && verifyPassword(plainPassword, user.password)) {
        req.session.user = user
        res.json({ message: `Welcome back, ${username}!` })
    } else {
        res.json({ message: `Invalid Login` }).status(401)
    }
})

app.post('/api/logout', (req, res, next) => {
    req.session.destroy(err => {
        res.json({ message: 'Logout successful' })
    });
    next({ message: 'Logout failed' })
})
