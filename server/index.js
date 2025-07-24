const express = require("express");
const cors = require("cors");
const session = require("express-session");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const app = express();
const PORT = 3000;
const productionEnv = process.env.NODE_ENV === "production";
const { PrismaClient } = require("./generated/prisma");
const prisma = new PrismaClient();
const { hashPassword, verifyPassword } = require("./logic/auth");
const {
    validateCNF,
    parseCNF,
    stringifyCNF,
    reduceCNF,
    getSizeCNF,
    resolve,
    isEqual,
    isSubclause,
    verifyPartialAssignment,
    verifyConflict,
} = require("./logic/boolsat");
const { ACCESS_LEVEL } = require("./logic/accessLevels");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client();

app.set("trust proxy", 1);
app.use(
    cors({
        origin: process.env.FRONTEND_URL,
        credentials: true,
    })
);
let sessionConfig = {
    name: "sessionId",
    secret: "secret text",
    cookie: {
        maxAge: 1000 * 60 * 60 * 6, // 6 hours, since security isn't a huge problem
        secure: productionEnv,
        httpOnly: true,
        sameSite: productionEnv ? "none" : "lax",
    },
    rolling: true,
    resave: false,
    saveUninitialized: true,
};

app.use(session(sessionConfig));
// https://developers.google.com/identity/gsi/web/guides/verify-google-id-token#node.js
async function verifyGoogleToken(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    return payload;
    // If the request specified a Google Workspace domain:
    // const domain = payload['hd'];
}

function badRequestError(res, message, code = 400) {
    res.status(code).json(message);
}

app.post("/api/signup", express.json(), async (req, res) => {
    // regex means that the username is purely alphanumeric
    const regex = /^[a-zA-Z0-9]+$/;
    if (!req.body.username) {
        badRequestError(res, "Username required");
    } else if (!req.body.password) {
        badRequestError(res, "Password required");
    } else if (req.body.username.length < 5) {
        badRequestError(res, "Username must have length at least 6", 411);
    } else if (req.body.password.length < 5) {
        badRequestError(res, "Password must have length at least 6", 411);
    } else if (!req.body.username.match(regex)) {
        badRequestError(res, "Username can only contain letters and numbers");
    } else {
        const { username, password: plainPassword } = req.body;
        const user = await prisma.user.findMany({
            where: {
                username: {
                    equals: username,
                    mode: "insensitive",
                },
            },
        });
        if (user.length > 0) {
            badRequestError(res, "Username taken", 409);
        } else {
            const hash = await hashPassword(plainPassword);
            const newUserData = { username, password: hash, access_level: ACCESS_LEVEL.USER };
            const newUser = await prisma.user.create({ data: newUserData });
            req.session.user = newUser; //start logged in
            res.json({
                message: `Welcome ${newUser.username}!`,
                username: newUser.username,
            });
        }
    }
});

app.post("/api/login", express.json(), async (req, res) => {
    const { username, password: plainPassword } = req.body;
    if (!username || !plainPassword) {
        badRequestError(res, "Username and password required", 400);
        return;
    }
    const user = await prisma.user.findFirst({
        where: { username: { equals: username, mode: "insensitive" } },
    });
    if (user && (await verifyPassword(plainPassword, user.password))) {
        req.session.user = user;
        res.json({
            message: `Welcome back, ${username}!`,
            username: username,
            accessLevel: user.access_level,
        });
    } else {
        badRequestError(res, "Invalid Login", 401);
    }
});

app.post("/api/logout", express.json(), (req, res) => {
    req.session.destroy((err) => {
        res.json({ message: "Logout successful" });
    });
});

app.get("/api/user/:username", express.json(), async (req, res) => {
    const { username } = req.params;
    let isMe = req.session.user?.username === username;
    if (!username) {
        badRequestError(res, "Invalid request", 400);
        return;
    }
    const user = await prisma.user.findFirst({
        where: { username: { equals: username, mode: "insensitive" } },
    });
    if (user) {
        res.json({
            username: user.username,
            accessLevel: user.access_level,
            isMe: isMe,
            sizeReduction: user.total_size_reduced,
        });
    } else {
        badRequestError(res, "User Not Found", 404);
    }
});

app.put("/api/user/:username", express.json(), async (req, res) => {
    const { username } = req.params;
    const { newAccessLevel } = req.body;
    if (!username) {
        badRequestError(res, "Invalid User", 400);
        return;
    }
    if (![ACCESS_LEVEL.USER, ACCESS_LEVEL.RESEARCHER].includes(newAccessLevel)) {
        badRequestError(res, "Invalid Access Level", 400);
        return;
    }
    if (!req.session.user || req.session.user.access_level !== ACCESS_LEVEL.ADMIN) {
        badRequestError(res, "Unauthorized Request", 403);
        return;
    }
    const user = await prisma.user.update({
        where: { username: username },
        data: { access_level: newAccessLevel },
    });
    if (user) {
        res.json({
            username: user.username,
            accessLevel: user.access_level,
            sizeReduction: user.total_size_reduced,
        });
    } else {
        badRequestError("User Not Found", 404);
    }
});

app.get("/api/whoami", express.json(), async (req, res) => {
    if (req.session.user) {
        res.json({
            username: req.session.user.username,
            accessLevel: req.session.user.access_level,
        });
    } else {
        badRequestError(res, "User Not Found", 404);
    }
});
app.get("/api/adminPanel", express.json(), async (req, res) => {
    if (req.session.user && req.session.user.access_level === ACCESS_LEVEL.ADMIN) {
        res.json({
            username: req.session.user.username,
            accessLevel: req.session.user.access_level,
        });
    } else {
        badRequestError(res, "Unauthorized", 403);
    }
});

app.post("/api/upload", upload.single("file"), async (req, res) => {
    const { body, file } = req;
    if (!req.session.user || req.session.user.accessLevel === ACCESS_LEVEL.USER) {
        badRequestError(res, "Unauthorized - Make sure you're logged in!", 403);
    } else if (!body.title || !body.description) {
        badRequestError(res, "Title and description required", 400);
    } else if (!file) {
        badRequestError(res, "No File Uploaded", 400);
    } else if (body.title.length < 5) {
        badRequestError(res, "Title ust be at least 6 characters", 400);
    } else {
        const { title, description } = req.body;
        const fileContents = Buffer.from(file.buffer).toString("utf-8");
        if (!validateCNF(fileContents)) {
            badRequestError(res, "Invalid CNF", 400);
        } else {
            let originalProblem = fileContents;
            let reducedProblemCNF = reduceCNF(parseCNF(fileContents));
            let reducedProblem = stringifyCNF(reducedProblemCNF);
            const reductionData = {
                original_size: getSizeCNF(parseCNF(originalProblem)),
                reduced_size: getSizeCNF(parseCNF(reducedProblem)),
            };
            const problemFileData = {
                problem_file: reducedProblem,
                solution_file: "",
            };
            let solved = true;
            for (const clause of reducedProblemCNF) {
                if (clause.length > 1) {
                    solved = false;
                    break;
                }
            }
            const newUploadData = {
                name: title,
                description,
                is_active: !solved,
                current_size: getSizeCNF(parseCNF(reducedProblem)),
                file: { create: problemFileData },
                user: { connect: { id: req.session.user.id } },
            };
            const newUpload = await prisma.problem.create({
                data: newUploadData,
            });
            res.json({
                message: `Upload created`,
                uploadId: newUpload.id,
                reductionData: reductionData,
            });
        }
    }
});

app.put("/api/problem/:problemId/reduce", express.json(), async (req, res) => {
    const { problemId } = req.params;
    const { solution } = req.body;
    if (!req.session.user || req.session.user.accessLevel === ACCESS_LEVEL.LOGGED_OUT) {
        badRequestError(res, "Unauthorized - Make sure you're logged in!", 403);
        return;
    }
    if (!solution) {
        badRequestError(res, "No solution provided", 400);
        return;
    }
    if (isNaN(parseInt(problemId))) {
        badRequestError(res, "Invalid problem ID", 400);
        return;
    }
    const problem = await prisma.problem.findFirst({
        where: { id: parseInt(problemId), is_active: true },
        include: { file: true },
    });
    if (!problem) {
        badRequestError(res, "Problem not found", 404);
        return;
    }
    let problemCNF = parseCNF(problem.file.problem_file);
    let solutionFile = problem.file.solution_file;
    const oldSize = getSizeCNF(problemCNF);
    for (let i = 0; i < solution.length; i++) {
        let step = solution[i];
        if (step.type === "resolution") {
            let validLogic = isEqual(resolve(step.old[0], step.old[1]), step.new);
            for (let j = 0; j < step.old.length; j++) {
                let oldClause = step.old[j];
                let foundMatch = false;
                for (let k = 0; k < problemCNF.length; k++) {
                    if (
                        isEqual(problemCNF[k], oldClause) ||
                        isSubclause(oldClause, problemCNF[k])
                    ) {
                        foundMatch = true;
                        break;
                    }
                }
                if (!foundMatch) {
                    validLogic = false;
                    break;
                }
            }
            if (!validLogic) {
                badRequestError(res, "Invalid Resolution", 400);
                return;
            }
            //so we're good!
            solutionFile += `Res ${step.old[0]} / ${step.old[1]} -> ${step.new}\n`;
            problemCNF = reduceCNF([step.new], problemCNF);
        } else if (step.type === "auto-reduction") {
            //we already do that! Happily pass through
        } else if (step.type === "partial-solve") {
            for (const assignment of step.assignments) {
                if (typeof assignment !== "number") {
                    badRequestError(res, "Invalid partial solve", 400);
                }
            }
            if (verifyPartialAssignment(problemCNF, step.assignments)) {
                let newClauses = [];
                for (const assignment of step.assignments) {
                    newClauses.push([assignment]);
                }
                problemCNF = reduceCNF(newClauses, problemCNF);
            } else {
                badRequestError(res, "Invalid partial solve", 400);
                return;
            }
            solutionFile += `Partial ${step.assignments.join(" / ")}\n`;
        } else if (step.type === "conflict") {
            for (const assignment of step.assignments) {
                if (typeof assignment !== "number") {
                    badRequestError(res, "Invalid conflict", 400);
                }
            }
            if (verifyConflict(problemCNF, step.assignments)) {
                let newClause = [];
                for (const assignment of step.assignments) {
                    newClause.push(-assignment);
                }
                problemCNF = reduceCNF([newClause], problemCNF);
            } else {
                badRequestError(res, "Invalid partial solve", 400);
                return;
            }
            solutionFile += `Conflict ${step.assignments.join(" / ")}\n`;
        } else {
            badRequestError(res, `Invalid step type - What is ${step.type}?`, 400);
            return;
        }
    }
    const newSize = getSizeCNF(problemCNF);
    const sizeReduction = oldSize - newSize;
    if (sizeReduction <= 0) {
        badRequestError(res, "Size Not Reduced", 400);
        return;
    }
    let isSolved = true;
    for (const clause of problemCNF) {
        if (typeof clause === "string") {
            //console.error("Invalid Clause (string, end)", JSON.stringify(clause));
        }
        if (clause.length > 2) {
            isSolved = false;
            break;
        }
    }
    const newProblemFileData = {
        problem_file: stringifyCNF(problemCNF),
        solution_file: solutionFile,
        problem_post: {
            update: {
                current_size: getSizeCNF(problemCNF),
                date_modified: new Date(),
                is_active: !isSolved,
            },
        },
    };
    const update = await prisma.problemFile.update({
        where: { id: problem.file.id },
        data: newProblemFileData,
    });

    let newTotalReduction = req.session.user.total_size_reduced + sizeReduction;
    const newUser = await prisma.user.update({
        where: { id: req.session.user.id },
        data: {
            total_size_reduced: newTotalReduction,
        },
    });
    req.session.user = newUser;
    //TODO: Update size on the problem page
    res.json(update);
});

app.get("/api/problems", express.json(), async (req, res) => {
    const { session } = req;
    if (!session.user) {
        badRequestError(res, "Unauthorized - Make sure you're logged in!", 403);
    } else {
        const problems = await prisma.problem.findMany({
            where: {
                OR: [
                    {
                        user_id: session.user.id,
                    },
                    {
                        is_active: true,
                    },
                ],
            },
            include: {
                user: true,
            },
        });
        res.json({ problems: problems });
    }
});

app.get("/api/problem/:problemId", express.json(), async (req, res) => {
    const session = req.session;
    const { problemId } = req.params;
    if (!session.user) {
        badRequestError(res, "Unauthorized - Make sure you're logged in!", 403);
    } else {
        const problem = await prisma.problem.findFirst({
            where: {
                id: parseInt(problemId),
                OR: [
                    {
                        user_id: session.user.id,
                    },
                    {
                        is_active: true,
                    },
                ],
            },
            include: { user: true },
        });
        if (!problem) {
            badRequestError(res, "Problem Not Found", 404);
        } else {
            res.json({ problem: problem });
        }
    }
});

app.get("/api/problem/:problemId/file", express.json(), async (req, res) => {
    const session = req.session;
    const { problemId } = req.params;
    if (!session.user) {
        badRequestError(res, "Unauthorized - Make sure you're logged in!", 403);
    } else {
        const problem = await prisma.problem.findFirst({
            where: {
                id: parseInt(problemId),
                OR: [
                    {
                        user_id: session.user.id,
                    },
                    {
                        is_active: true,
                    },
                ],
            },
            include: { file: true },
        });
        if (!problem) {
            badRequestError(res, "Problem Not Found", 404);
        } else {
            if (problem.is_active) {
                //if active, parse the CNF file for the solver.
                //Otherwise, don't parse it and leave it to be downloaded
                problem.file.problem_file = parseCNF(problem.file.problem_file);
            } else {
                let CNF = parseCNF(problem.file.problem_file);
                let satisfied = CNF.length === 1 && CNF[0].length === 0;
                problem.satisfied = satisfied;
            }
            res.json({ problem: problem });
        }
    }
});

app.post("/api/siwg", express.urlencoded({ extended: true }), express.json(), async (req, res) => {
    const body = req.body;
    if (!body.credential || !body.g_csrf_token) {
        badRequestError(res, "Invalid request", 400);
        return;
    }
    const credential = body.credential;
    let successful = true;
    let loginInfo = null;
    try {
        loginInfo = await verifyGoogleToken(credential);
    } catch (err) {
        successful = false;
        console.error(err);
    }
    if (!successful) {
        badRequestError(res, "Invalid Google Token", 400);
        return;
    }
    //sub is userid - "google says so". We put it in the password field, which seems REALLY weird
    //BUT! - bcrypt passwords start with a $ and google tokens don't, so we're safe.
    //Apologies to whoever reviews this PR (probably aly).
    const user = await prisma.user.findFirst({ where: { password: loginInfo.sub } });
    if (user) {
        req.session.user = user;
    } else {
        let newUserName = loginInfo.name.replaceAll(" ", "");
        newUserName = newUserName.replace(/[^a-zA-Z0-9]/g, ""); //remove all non-alphanumeric characters
        while(newUserName.length < 5) {
            newUserName += "GUser"; //add a's until it's at least 5 characters
        }
        //if a user already exists with this name, append a number.
        let duplicateUser = await prisma.user.findFirst({
            where: { username: { equals: newUserName, mode: "insensitive" } },
        });
        if (duplicateUser) {
            newUserName += "";
        }
        while (duplicateUser) {
            newUserName += Math.floor(Math.random() * 10); //add a random digit
            duplicateUser = await prisma.user.findFirst({
                where: { username: { equals: newUserName, mode: "insensitive" } },
            });
        }
        const newUser = await prisma.user.create({
            data: {
                username: newUserName,
                password: loginInfo.sub,
                access_level: ACCESS_LEVEL.USER,
            },
        });
        req.session.user = newUser;
    }
    res.redirect(process.env.FRONTEND_URL + "/login");
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
    if (productionEnv) {
        console.log("Running in Production Environment");
    } else {
        console.log("Running in Development Environment");
    }
});
