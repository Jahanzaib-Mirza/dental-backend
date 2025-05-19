const jwt = require('jsonwebtoken');
const sails = require('sails');

module.exports = {
  // Verify JWT token
  verifyToken: async function(req, res, proceed) {
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
      const decoded = jwt.verify(token, sails.config.jwt.secret);
      
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
  },

  // Check if user has required role
  hasRole: function(roles) {
    return function(req, res, proceed) {
      if (!req.user) {
        return res.status(401).json({ 
          status: 'error',
          error: sails.config.responses.AUTH.UNAUTHORIZED 
        });
      }

      if (Array.isArray(roles)) {
        if (!roles.includes(req.user.role)) {
          return res.status(403).json({ 
            status: 'error',
            error: sails.config.responses.AUTH.INSUFFICIENT_PERMISSIONS 
          });
        }
      } else if (req.user.role !== roles) {
        return res.status(403).json({ 
          status: 'error',
          error: sails.config.responses.AUTH.INSUFFICIENT_PERMISSIONS 
        });
      }

      return proceed();
    };
  },
}; 