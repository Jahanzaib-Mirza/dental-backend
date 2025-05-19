const jwt = require('jsonwebtoken');
const sails = require('sails');

module.exports = {
  // Register a new user
  register: async function(req, res) {
    try {
      const { 
        email, 
        password, 
        name, 
        phone, 
        organizationName, 
        organizationAddress, 
        organizationPhone, 
        organizationEmail 
      } = req.body;

      // Validate registration data
      const validationResult = await sails.helpers.validateRegistration.with({
        email,
        password,
        name,
        phone,
        organizationName,
        organizationAddress,
        organizationPhone,
        organizationEmail
      });

      if (!validationResult.valid) {
        return res.status(400).json({
          status: 'error',
          errors: validationResult.errors
        });
      }

      // Create organization first
      const organization = await Organization.create({
        name: organizationName,
        address: organizationAddress,
        phone: organizationPhone || phone, // Use user's phone if org phone not provided
        email: organizationEmail || email, // Use user's email if org email not provided
      }).fetch();

      // Create default location for the organization
      const location = await Location.create({
        name: 'Main Branch',
        address: organizationAddress,
        phone: organizationPhone || phone, // Use user's phone if org phone not provided
        email: organizationEmail || email, // Use user's email if org email not provided
        organizationId: organization.id,
      }).fetch();

      // Create owner user
      const user = await User.create({
        email,
        password,
        name,
        phone,
        role: "owner",
        organizationId: organization.id,
        locationId: location.id,
      }).fetch();

      // Update organization with owner reference
      await Organization.updateOne({ id: organization.id }).set({ owner: user.id });

      // Generate JWT token
      const token = await sails.helpers.generateToken(user);

      return res.status(201).json({
        status: 'success',
        message: 'Registration successful',
        data: {
          user,
          organization,
          location,
          token,
        }
      });
    } catch (err) {
      sails.log.error('Error in registration:', err);
      return res.status(500).json({
        status: 'error',
        error: sails.config.responses.GENERIC.SERVER_ERROR
      });
    }
  },

  // Login user
  login: async function(req, res) {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email }).populateAll();
      if (!user) {
        return res.status(401).json({ error: sails.config.responses.AUTH.INVALID_CREDENTIALS });
      }

      const isValidPassword = await User.verifyPassword.call(user, password);
      if (!isValidPassword) {
        return res.status(401).json({ error: sails.config.responses.AUTH.INVALID_CREDENTIALS });
      }

      // Generate JWT token
      const token = await sails.helpers.generateToken(user);
      // Set JWT as HttpOnly, Secure cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // true in production (HTTPS)
        sameSite: 'Strict',
        maxAge: 24 * 60 * 60 * 1000 // 1 day
      });

      return res.json({
        message: 'Login successful',
        user
      });
    } catch (err) {
      sails.log.error('Error in login:', err);
      return res.status(500).json({ error: sails.config.responses.GENERIC.SERVER_ERROR });
    }
  },

  // Get current user profile
  getProfile: async function(req, res) {
    try {
      const user = await User.findOne({ id: req.user.id });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Get organization and location details
      const organization = await Organization.findOne({ id: user.organizationId });
      const location = await Location.findOne({ id: user.locationId });

      return res.json({
        user,
        organization,
        location,
      });
    } catch (err) {
      return res.status(500).json({ error: 'Error fetching profile' });
    }
  },
}; 