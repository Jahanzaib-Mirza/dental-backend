module.exports = {
  attributes: {
    url: {
      type: 'string',
      required: true,
    },
    type: {
      type: 'string',
      isIn: ['image', 'document', 'xray', 'scan'],
      required: true,
    },
    // Organization and Location references
    organizationId: {
      model: 'organization',
      required: true,
    },
    locationId: {
      model: 'location',
      required: true,
    },
    // Associations
    patientId: {
      model: 'patient',
      required: true,
    },
    appointmentId: {
      model: 'appointment',
    },
    treatmentId: {
      model: 'treatment',
    },
  },

  // Lifecycle callbacks
  beforeCreate: async function(values, proceed) {
    // Validate that at least one association is provided
    if (!values.patientId && !values.appointmentId && !values.treatmentId) {
      return proceed(new Error('Media must be associated with at least one entity'));
    }
    return proceed();
  },
}; 