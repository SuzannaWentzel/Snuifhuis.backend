const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const authHeader = req.get('Authorization');

    // no authorization header
    if (!authHeader) {
        req.isAuth = false;
        console.log('No authorization header');
        return next();
    }

    // header exists, check token:
    const token = authHeader.split(' ')[1]; // Bearer <token>
    if (!token || token === '') {
        req.isAuth = false;
        return next();
    }
    
    let decodedToken; 
    try {
        decodedToken = jwt.verify(token, "supersecretkey");
    } catch (err) {
        req.isAuth = false;
        return next();
    }

    if (!decodedToken) {
        req.isAuth = false;
        return next();
    }

    req.isAuth = true;
    req.userId = decodedToken.userId;
    next();
}