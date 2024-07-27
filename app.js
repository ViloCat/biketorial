require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const DBService = require('./services/dbService');

const adminRoutes = require('./routes/adminRoutes');
const customerRoutes = require('./routes/customerRoutes');
const sharedRoutes = require('./routes/sharedRoutes');

const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

DBService.connect();

app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/admin', adminRoutes);
app.use('/api', sharedRoutes);
app.use('/customer', customerRoutes);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'admin.html'));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
