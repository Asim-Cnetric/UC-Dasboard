const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const corsMiddleware = require('./middleware/cors');

dotenv.config();
connectDB();

const app = express();

app.use(corsMiddleware);
app.use(express.json());

app.use('/api/uc/users', require('./routes/authRoutes'));
app.use('/api/uc/users/workspaces', require('./routes/workspaceRoutes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
