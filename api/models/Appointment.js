module.exports = {
  attributes: {
    date: {
      type: 'ref',
      columnType: 'datetime',
      required: true,
    },
    time: {
      type: 'string',
      required: true,
    },
    reason: {
      type: 'string',
      required: true,
    },
    status: {
      type: 'string',
      isIn: ['pending', 'confirmed', 'completed', 'cancelled'],
      defaultsTo: 'pending',
    },
    notes: {
      type: 'string',
      defaultsTo: '',
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
    doctorId: {
      model: 'user',
      required: true,
    },
    receptionistId: {
      model: 'user',
      required: true,
    },
    followUpFor: {
      model: 'appointment',
    },
    treatment: {
      collection: 'treatment',
      via: 'appointmentId',
    },
    media: {
      collection: 'media',
      via: 'appointmentId',
    },
  },

  // Lifecycle callbacks
  beforeCreate: async function(values, proceed) {
    // Validate doctor availability
    const doctor = await User.findOne({ id: values.doctorId });
    if (!doctor) {
      return proceed(new Error('Doctor not found'));
    }

    // Check if the time slot is available
    const existingAppointment = await Appointment.findOne({
      doctorId: values.doctorId,
      date: values.date,
      time: values.time,
      status: { '!=': 'cancelled' },
    });

    if (existingAppointment) {
      return proceed(new Error('Time slot is already booked'));
    }

    return proceed();
  },
}; 