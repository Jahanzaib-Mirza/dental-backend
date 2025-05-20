/**
 * Policy Mappings
 * (sails.config.policies)
 *
 * Policies are simple functions which run **before** your actions.
 *
 * For more information on configuring policies, check out:
 * https://sailsjs.com/docs/concepts/policies
 */

module.exports.policies = {
  // Default policy for all controllers and actions
  '*': false, // Deny access to all routes by default

  // Auth routes
  'AuthController': {
    'register': true, // Public access
    'login': true,    // Public access
    '*': 'isAuthenticated' // All other auth routes require authentication
  },

  // User routes
  'UserController': {
    '*': ['isAuthenticated', 'isOwner'] // All user routes require authentication and owner role
  },

  // Patient routes
  'PatientController': {
    '*': ['isAuthenticated'],
    'create': ['isAuthenticated', 'isOwnerOrReceptionist'],
    'update': ['isAuthenticated', 'isOwnerOrReceptionist'],
    'destroy': ['isAuthenticated', 'isOwner'],
    'findOne': ['isAuthenticated', 'isOwnerOrReceptionist'],
    'find': ['isAuthenticated', 'isOwnerOrReceptionist'],

  },

  // Appointment routes
  'AppointmentController': {
    '*': ['isAuthenticated', 'hasRole']
  },

  // Treatment routes
  'TreatmentController': {
    '*': ['isAuthenticated', 'hasRole']
  },

  // Invoice routes
  'InvoiceController': {
    '*': ['isAuthenticated', 'hasRole']
  },

  // Payment routes
  'PaymentController': {
    '*': ['isAuthenticated', 'hasRole']
  },

  // Expense routes
  'ExpenseController': {
    '*': ['isAuthenticated', 'hasRole']
  },

  // Media routes
  'MediaController': {
    '*': 'isAuthenticated'
  },

  // Report routes
  'ReportController': {
    '*': ['isAuthenticated', 'hasRole']
  }
};
