const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');
const roadmapsRouter = require('./routes/roadmaps');

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/roadmaps', roadmapsRouter);

app.get('/', (req, res) => {
  res.send('SYNTHLEARN API is running.');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
