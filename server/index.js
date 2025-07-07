const express = require('express');
const cors = require('cors');
const session = require('express-session')
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const app = express();
const PORT = 3000;
const { PrismaClient } = require('./generated/prisma');
const prisma = new PrismaClient();
const { hashPassword, verifyPassword } = require('./logic/auth');
const { validateCNF } = require('./logic/boolsat');

app.use(cors(
    {
        origin: process.env.FRONTEND_URL,
        credentials: true
    }
));
let sessionConfig = {
    name: 'sessionId',
    secret: 'secret text',
    cookie: {
        maxAge: 1000 * 60 * 10, // 10 mins
        secure: false,
        httpOnly: true,
    },
    resave: true,
    saveUninitialized: true,
}

app.use(session(sessionConfig))


function badRequestError(res, message, code = 400) {
    res.status(code).json(message)
}

app.post('/api/signup', express.json(), async (req, res) => {
    // regex means that the username is purely alphanumeric
    const regex = /^[a-zA-Z0-9]+$/;
    if (!req.body.username) {
        badRequestError(res, 'Username required')
    } else if (!req.body.password) {
        badRequestError(res, 'Password required')
    } else if (req.body.username.length < 5) {
        badRequestError(res, 'Username must have length at least 6', 411)
    } else if (req.body.password.length < 5) {
        badRequestError(res, 'Password must have length at least 6', 411)
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
            req.session.user = newUser //start logged in
            res.json({ message: `Welcome ${newUser.username}!`, username: newUser.username })
        }
    }
})

app.post('/api/login', express.json(), async (req, res) => {
    const { username, password: plainPassword } = req.body
    const user = await prisma.user.findFirst({ where: { username: { equals: username, mode: "insensitive" } } })
    if (user && await verifyPassword(plainPassword, user.password)) {
        req.session.user = user
        res.json({ message: `Welcome back, ${username}!`, username: username, accessLevel: user.access_level })
    } else {
        badRequestError(res, 'Invalid Login', 401)
    }
})

app.post('/api/logout', express.json(), (req, res) => {
    req.session.destroy(err => {
        res.json({ message: 'Logout successful' })
    });
})

app.get('/api/user/:username', express.json(), async (req, res) => {
    const { username } = req.params;
    let isMe = req.session.user?.username === username;
    const user = await prisma.user.findFirst({ where: { username: { equals: username, mode: "insensitive" } } })
    if (user) {
        res.json({ username: user.username, accessLevel: user.access_level, isMe: isMe, sizeReduction: user.total_size_reduced })
    } else {
        badRequestError(res, 'User Not Found', 404)
    }
})
app.get('/api/whoami', express.json(), async (req, res) => {
    if (req.session.user) {
        res.json({ username: req.session.user.username, accessLevel: req.session.user.access_level })
    } else {
        badRequestError(res, 'User Not Found', 404)
    }
})

app.post('/api/upload', upload.single('file'), async (req, res) => {
    const { body, file } = req
    if (!req.session.user || req.session.user.accessLevel < 2) {
        badRequestError(res, 'Unauthorized - Make sure you\'re logged in!', 403)
    } else if (!body.title || !body.description) {
        badRequestError(res, 'Title and description required', 400)
    } else if (!file) {
        badRequestError(res, 'No File Uploaded', 400)
    } else if (body.title.length < 5) {
        badRequestError(res, 'Title ust be at least 6 characters', 400)
    } else {
        const { title, description } = req.body
        const fileContents = Buffer.from(file.buffer).toString("utf-8")
        if (!validateCNF(fileContents)) {
           badRequestError(res, 'Invalid CNF', 400)
        } else {
            const problemFileData = { problem_file: fileContents, solution_file: "" }
            const newUploadData = { name: title, description, current_size: 0, file: { create: problemFileData }, user: { connect: { id: req.session.user.id } } }
            const newUpload = await prisma.problem.create({ data: newUploadData });
            res.json({ message: `Upload created`, uploadId: newUpload.id })
        }
    }
})

app.get('/api/problems', express.json(), async (req, res) => {
    const { session } = req
    if (!session.user) {
        badRequestError(res, 'Unauthorized - Make sure you\'re logged in!', 403)
    } else {
        const problems = await prisma.problem.findMany({
            include: {
                user: true,
            }
        });
        res.json({ problems: problems })
    }
})

app.get('/api/problem/:problemId', express.json(), async (req, res) => {
    const session = req.session
    const { problemId } = req.params
    if (!session.user) {
        badRequestError(res, 'Unauthorized - Make sure you\'re logged in!', 403)
    } else {
        const problem = await prisma.problem.findUnique({ where: { id: parseInt(problemId) }, include: { user: true } })
        if (!problem) {
            badRequestError(res, 'Problem Not Found', 404)
        } else {
            res.json({ problem: problem })
        }
    }
})

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
