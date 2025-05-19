/**
 * hasRole policy
 */

module.exports = function(roles) {
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
}; 