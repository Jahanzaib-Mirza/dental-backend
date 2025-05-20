module.exports = {
  // Create a new patient
  create: async function(req, res) {
    try {
      const {
        name,
        email,
        phone,
        gender,
        dob,
        address,
        medicalHistory,
        allergies,
      } = req.body;

      // Create patient
      const patient = await Patient.create({
        name,
        email,
        phone,
        gender,
        dob,
        address,
        medicalHistory,
        allergies,
        organization: req.user.organization,
        location: req.user.location,
        addedBy: req.user.id
      }).fetch();

      return res.status(201).json({
        status: 'success',
        message: 'Patient created successfully',
        data: patient
      });
    } catch (err) {
      sails.log.error('Error creating patient:', err);
      return res.status(500).json({ 
        status: 'error',
        error: sails.config.responses.GENERIC.SERVER_ERROR 
      });
    }
  },

  // Get all patients
  find: async function(req, res) {
    try {
      const patients = await Patient.find({
        where: {
          location: req.user.location,
          deletedAt: 0
        },
        sort: 'createdAt DESC'
      });

      return res.json({
        status: 'success',
        data: patients
      });
    } catch (err) {
      sails.log.error('Error fetching patients:', err);
      return res.status(500).json({ 
        status: 'error',
        error: sails.config.responses.GENERIC.SERVER_ERROR 
      });
    }
  },

  // Get one patient
  findOne: async function(req, res) {
    try {
      const { id } = req.params;
      const patient = await Patient.findOne({
        id,
        location: req.user.location,
        deletedAt: 0
      });

      if (!patient) {
        return res.status(404).json({ 
          status: 'error',
          error: sails.config.responses.GENERIC.NOT_FOUND 
        });
      }

      return res.json({
        status: 'success',
        data: patient
      });
    } catch (err) {
      sails.log.error('Error fetching patient:', err);
      return res.status(500).json({ 
        status: 'error',
        error: sails.config.responses.GENERIC.SERVER_ERROR 
      });
    }
  },

  // Update a patient
  update: async function(req, res) {
    try {
      const { id } = req.params;
      const {
        name,
        email,
        phone,
        gender,
        dob,
        address,
        medicalHistory,
        allergies,
      } = req.body;

      // Find the patient
      const patient = await Patient.findOne({
        id,
        location: req.user.location,
        deletedAt: 0
      });

      if (!patient) {
        return res.status(404).json({ 
          status: 'error',
          error: sails.config.responses.GENERIC.NOT_FOUND 
        });
      }

      // Update patient
      const updatedPatient = await Patient.updateOne({ id }).set({
        name,
        email,
        phone,
        gender,
        dob,
        address,
        medicalHistory,
        allergies,
      });

      return res.json({
        status: 'success',
        message: 'Patient updated successfully',
        data: updatedPatient
      });
    } catch (err) {
      sails.log.error('Error updating patient:', err);
      return res.status(500).json({ 
        status: 'error',
        error: sails.config.responses.GENERIC.SERVER_ERROR 
      });
    }
  },

  // Delete a patient (soft delete)
  destroy: async function(req, res) {
    try {
      const { id } = req.params;
      const patient = await Patient.findOne({
        id,
        organization: req.user.organization,
        deletedAt: 0
      });

      if (!patient) {
        return res.status(404).json({ 
          status: 'error',
          error: sails.config.responses.GENERIC.NOT_FOUND 
        });
      }

      // Soft delete by setting deletedAt timestamp
      await Patient.updateOne({ id }).set({
        deletedAt: Date.now()
      });

      return res.json({
        status: 'success',
        message: 'Patient deleted successfully'
      });
    } catch (err) {
      sails.log.error('Error deleting patient:', err);
      return res.status(500).json({ 
        status: 'error',
        error: sails.config.responses.GENERIC.SERVER_ERROR 
      });
    }
  }
}; 