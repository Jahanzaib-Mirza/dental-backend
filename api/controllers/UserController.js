/**
 * UserController.js
 *
 * Controller for user management
 */

module.exports = {
  create: async function (req, res) {
    try {
      // Only owner can create users
      if (req.user.role !== 'owner') {
        return res.status(403).json({ error: sails.config.responses.AUTH.UNAUTHORIZED });
      }

      const { email, name, phone, role, gender, age, experience, specialization } = req.body;
      if (!email || !name || !phone || !role) {
        return res.status(400).json({ error: sails.config.responses.AUTH.REQUIRED_FIELDS_MISSING });
      }

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({ error: sails.config.responses.AUTH.EMAIL_EXISTS });
      }

      // Generate password
      const password = await sails.helpers.generatePassword();

      // Build user data
      const userData = {
        email,
        password,
        name,
        phone,
        role,
        organizationId: req.user.organizationId,
        locationId: req.user.locationId
      };
      if (gender) userData.gender = gender;
      if (age) userData.age = age;
      if (experience) userData.experience = experience;
      if (specialization) userData.specialization = specialization;

      // Create user
      const user = await User.create(userData).fetch();

      // Send email with password
      await sails.helpers.sendEmail.with({
        to: email,
        subject: 'Your Account Credentials',
        text: `Hello ${name},\n\nYour account has been created.\nEmail: ${email}\nPassword: ${password}\n\nPlease log in and change your password.`
      });

      return res.status(201).json({
        status: 'success',
        message: 'User created and credentials sent via email.',
        user
      });
    } catch (err) {
      sails.log.error('Error creating user:', err);
      return res.status(500).json({ error: sails.config.responses.GENERIC.SERVER_ERROR });
    }
  }
}; 