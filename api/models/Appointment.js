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
    patient: {
      model: 'patient',
      required: true,
    },
    doctor: {
      model: 'user',
      required: true,
    },
    addedBy: {
      model: 'user',
      required: true,
    },
    followUpFor: {
      model: 'appointment',
    }
  },

  // Lifecycle callbacks
  beforeCreate: async function(values, proceed) {
    // Validate doctor availability
    const doctor = await User.findOne({ id: values.doctor });
    if (!doctor) {
      return proceed(new Error('Doctor not found'));
    }

    // Check if the time slot is available
    const existingAppointment = await Appointment.findOne({
      doctor: values.doctor,
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