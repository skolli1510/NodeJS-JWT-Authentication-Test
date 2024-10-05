const express = require('express');
const app = express();
const path = require('path');
const PORT = 3000;
const bodyParser = require('body-parser');
const secretkey = 'My Secret Key';
const jwt = require('jsonwebtoken');
const { expressjwt: expjwt } = require('express-jwt');

// JWT Middleware
const jwtMW = expjwt({
    secret: secretkey,
    algorithms: ['HS256']
});

// Dummy users
let users = [
    { id: 1, username: 'Sushma', password: 'Sushma123' },
    { id: 2, username: 'Kolli', password: '123456' }
];

// Middleware setup
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Headers', 'Content-type,Authorization');
    next();
});

// Protected route: Dashboard
app.get('/api/dashboard', jwtMW, (req, res) => {
    console.log(req);
    res.json({
        success: true,
        myContent: 'Welcome to the dashboard Sushma kolli.'
    });
});

// Protected route: Settings
app.get('/api/settings', jwtMW, (req, res) => {
    res.json({
        success: true,
        myContent: 'Settings page works!'
    });
});

// Login route (unprotected)
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    console.log('Username and password:', username, password);
    if (users.some(user => user.username === username && user.password === password)) {
        console.log("Match found");
        // JWT expires in 180 seconds (3 minutes)
        let token = jwt.sign({ username: username }, secretkey, { expiresIn: 180 });
        return res.json({
            success: true,
            err: null,
            token
        });
    } else {
        return res.status(401).json({
            success: false,
            token: null,
            err: 'Username or Password is incorrect'
        });
    }
});

// Serve the HTML page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Error handling for unauthorized access
app.use(function (err, req, res, next) {
    if (err.name === 'UnauthorizedError') {
        res.status(401).json({
            success: false,
            err
        });
    } else {
        next(err);
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Serving on port ${PORT}`);
});
