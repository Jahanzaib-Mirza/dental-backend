module.exports = {
  attributes: {
    title: {
      type: 'string',
      required: true,
    },
    amount: {
      type: 'number',
      required: true,
    },
    date: {
      type: 'ref',
      columnType: 'datetime',
      required: true,
    },
    category: {
      type: 'string',
      isIn: ['rent', 'utilities', 'supplies', 'equipment', 'salary', 'maintenance', 'other'],
      required: true,
    },
    paymentMethod: {
      type: 'string',
      isIn: ['cash', 'card', 'bank_transfer', 'other'],
      required: true,
    },
    notes: {
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
    addedBy: {
      model: 'user',
      required: true,
    },
  },

  // Lifecycle callbacks
  beforeCreate: async function(values, proceed) {
    // Set default date to current date if not provided
    if (!values.date) {
      values.date = new Date();
    }
    return proceed();
  },
}; 