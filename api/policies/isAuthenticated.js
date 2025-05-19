/**
 * isAuthenticated policy
 */

const jwt = require('jsonwebtoken');

module.exports = async function(req, res, proceed) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        status: 'error',
        error: sails.config.responses.AUTH.INVALID_TOKEN 
      });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user
    const user = await User.findOne({ id: decoded.id });
    if (!user) {
      return res.status(401).json({ 
        status: 'error',
        error: sails.config.responses.AUTH.USER_NOT_FOUND 
      });
    }

    // Attach user to request
    req.user = user;
    return proceed();
  } catch (err) {
    sails.log.error('Token verification error:', err);
    return res.status(401).json({ 
      status: 'error',
      error: sails.config.responses.AUTH.INVALID_TOKEN 
    });
  }
}; 