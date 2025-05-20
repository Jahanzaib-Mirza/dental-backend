/**
 * Policy to check if user can update a doctor
 * Only owner and the doctor themselves can update doctor information
 */

module.exports = async function (req, res, proceed) {
  // If user is not authenticated
  if (!req.user) {
    return res.status(401).json({ error: sails.config.responses.AUTH.NOT_AUTHENTICATED });
  }

  const { id } = req.params;

  // Owner can update any doctor
  if (req.user.role === 'owner') {
    return proceed();
  }

  // Doctor can only update their own information
  if (req.user.role === 'doctor' && req.user.id === parseInt(id)) {
    return proceed();
  }

  // If none of the above conditions are met, deny access
  return res.status(403).json({ error: sails.config.responses.AUTH.UNAUTHORIZED });
}; 