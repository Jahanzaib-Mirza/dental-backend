module.exports = {
  attributes: {
    appointment: {
      model: 'appointment',
      required: true,
    },
    doctor: {
      model: 'user',
      required: true,
    },
    patient: {
      model: 'patient',
      required: true,
    },
    diagnosis: {
      type: 'string',
      required: true,
    },
    procedure: {
      type: 'string',
      required: true,
    },
    prescribedMedications: {
      type: 'json',
      defaultsTo: [],
    },
    followUpDate: {
      type: 'ref',
      columnType: 'datetime',
    },
    notes: {
      type: 'string',
      defaultsTo: '',
    },
    servicesUsed: {
      type: 'json',
      defaultsTo: [],
    },
    followUpRecommended: {
      type: 'boolean',
      defaultsTo: false,
    },
    followUpNotes: {
      type: 'string',
      defaultsTo: '',
    },
    // Organization and Location references
    organization: {
      model: 'organization',
      required: true,
    },
    location: {
      model: 'location',
      required: true,
    },
    // Associations
    // media: {
    //   collection: 'media',
    //   via: 'treatmentId',
    // },
    invoice: {
      model: 'invoice',
      unique: true,
    },
    // reports: {
    //   collection: 'report',
    //   via: 'treatmentId',
    // },
  },

  // Lifecycle callbacks
  afterCreate: async function(newlyCreatedRecord, proceed) {
    // If follow-up is recommended, create a new appointment
    if (newlyCreatedRecord.followUpRecommended && newlyCreatedRecord.followUpDate) {
      try {
        const appointment = await Appointment.findOne({ id: newlyCreatedRecord.appointmentId });
        if (appointment) {
          await Appointment.create({
            patientId: newlyCreatedRecord.patientId,
            doctorId: newlyCreatedRecord.doctorId,
            receptionistId: appointment.receptionistId,
            date: newlyCreatedRecord.followUpDate,
            time: appointment.time, // Use same time slot
            reason: 'Follow-up appointment',
            status: 'pending',
            followUpFor: newlyCreatedRecord.appointmentId,
            organizationId: newlyCreatedRecord.organizationId,
            locationId: newlyCreatedRecord.locationId,
          });
        }
      } catch (err) {
        sails.log.error('Error creating follow-up appointment:', err);
      }
    }
    return proceed();
  },
}; 