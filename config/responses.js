/**
 * config/responses.js
 *
 * Centralized custom responses and error codes/messages for the app
 */

module.exports.responses = {
  // Authentication Errors
  AUTH: {
    EMAIL_EXISTS: {
      code: 'AUTH_001',
      message: 'Email already exists'
    },
    REQUIRED_FIELDS_MISSING: {
      code: 'AUTH_002',
      message: 'Required fields are missing'
    },
    INVALID_EMAIL: {
      code: 'AUTH_003',
      message: 'Invalid email format'
    },
    INVALID_PASSWORD: {
      code: 'AUTH_004',
      message: 'Password must be at least 8 characters long'
    },
    INVALID_PHONE: {
      code: 'AUTH_005',
      message: 'Invalid phone number format'
    },
    INVALID_TOKEN: {
      code: 'AUTH_006',
      message: 'Invalid or missing authentication token'
    },
    USER_NOT_FOUND: {
      code: 'AUTH_007',
      message: 'User not found'
    },
    UNAUTHORIZED: {
      code: 'AUTH_008',
      message: 'Authentication required'
    },
    INSUFFICIENT_PERMISSIONS: {
      code: 'AUTH_009',
      message: 'Insufficient permissions'
    },
    INVALID_CREDENTIALS: {
      code: 'AUTH_010',
      message: 'Invalid email or password'
    }
  },

  // Generic Errors
  GENERIC: {
    SERVER_ERROR: {
      code: 'GEN_001',
      message: 'Internal server error'
    },
    VALIDATION_ERROR: {
      code: 'GEN_002',
      message: 'Validation error'
    }
  }
}; 