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
  },

  getDoctors: async function (req, res) {
    try {
      // Check if user has permission to view users
      if (req.user.role !== 'owner' && req.user.role !== 'receptionist') {
        return res.status(403).json({ error: sails.config.responses.AUTH.UNAUTHORIZED });
      }

      // Build query based on user role
      const query = {
        locationId: req.user.locationId,
        role: 'doctor',
        status: 'active',
        deletedAt: 0
      };

      // If receptionist, only show doctors
      if (req.user.role === 'receptionist') {
        query.role = 'doctor';
      }

      // Fetch users
      const users = await User.find(query).omit(['password']);

      return res.status(200).json({
        status: 'success',
        data: users
      });
    } catch (err) {
      sails.log.error('Error fetching users:', err);
      return res.status(500).json({ error: sails.config.responses.GENERIC.SERVER_ERROR });
    }
  },

  update: async function (req, res) {
    try {
      const { id } = req.params;
      const {
        name,
        phone,
        gender,
        age,
        experience,
        specialization,
        licenseNumber,
        education,
        email,
        role,

      } = req.body;

      // Find the user
      const user = await User.findOne({
        id,
        locationId: req.user.locationId,
        deletedAt: 0
      });

      if (!user) {
        return res.status(404).json({ error: sails.config.responses.GENERIC.NOT_FOUND });
      }

      // Build update data based on role and provided fields
      const updateData = {};

      // Common fields that all users can update
      if (name) updateData.name = name;
      if (phone) updateData.phone = phone;
      if (gender) updateData.gender = gender;
      if (age) updateData.age = age;
      if (education) updateData.education = education;

      // Role-specific fields
      if (req.user.role === 'owner') {
        // Owner can update all fields
        if (email) updateData.email = email;
        if (role) updateData.role = role;
        if (experience) updateData.experience = experience;
        if (specialization) updateData.specialization = specialization;
        if (licenseNumber) updateData.licenseNumber = licenseNumber;
      } else if (user.role === 'doctor') {
        // Doctor-specific fields
        if (experience) updateData.experience = experience;
        if (specialization) updateData.specialization = specialization;
        if (licenseNumber) updateData.licenseNumber = licenseNumber;
      }

      // Update user
      const updatedUser = await User.updateOne({ id })
        .set(updateData);

      return res.status(200).json({
        status: 'success',
        message: 'User updated successfully',
        data: updatedUser
      });
    } catch (err) {
      sails.log.error('Error updating user:', err);
      return res.status(500).json({ error: sails.config.responses.GENERIC.SERVER_ERROR });
    }
  }
}; 