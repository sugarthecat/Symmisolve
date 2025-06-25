const express = require('express');
const app = express();
const PORT = 3000;
const { PrismaClient } = require('./generated/prisma');
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
