import { env } from '@/lib/utils';

export const MESSAGES = {
  DATABASE: {
    UPDATED: env('DATABASE_UPDATED', '🎉 Database updated successfully')
  },

  PAYMENT: {
    PROCESSED: env('PAYMENT_PROCESSED', '🎉 Payment processed successfully.')
  },

  ROLE: {
    ADDED: env('ROLE_ADDED', '🎉 Role added successfully!'),
    ASSIGNED: env('ROLES_ASSIGNED', '🎉 Roles are assigned successfully.')
  },

  HOSPITAL: {
    ADDED: env('HOSPITAL_ADDED', '🎉 Hospital added successfully'),
    UPDATED: env('HOSPITAL_UPDATED', '🎉 Hospital updated successfully'),
    DELETED: env('HOSPITAL_DELETED', '🎉 Hospital deleted successfully'),
    BULK_DELETED: env('HOSPITALS_DELETED', '🎉 Hospitals deleted successfully')
  },

  PERMISSION: {
    ADDED: env('PERMISSION_ADDED', '🎉 Permission added successfully.'),
    ASSIGNED: env(
      'PERMISSIONS_ASSIGNED',
      '🎉 All permissions are assigned successfully.'
    )
  },

  FACILITY: {
    ADDED: env('FACILITY_ADDED', '🎉 Facility added successfully'),
    UPDATED: env('FACILITY_UPDATED', '🎉 Facility updated successfully'),
    DELETED: env('FACILITY_DELETED', '🎉 Facility deleted successfully.'),
    BULK_DELETED: env(
      'FACILITIES_DELETED',
      '🎉 Facilities deleted successfully.'
    )
  },

  DEPARTMENT: {
    ADDED: env('DEPARTMENT_ADDED', '🎉 Department added successfully'),
    UPDATED: env('DEPARTMENT_UPDATED', '🎉 Department updated successfully'),
    DELETED: env('DEPARTMENT_DELETED', '🎉 Department deleted successfully.'),
    BULK_DELETED: env(
      'DEPARTMENTS_DELETED',
      '🎉 Departments deleted successfully.'
    )
  },

  SPECIALITY: {
    ADDED: env('SPECIALITY_ADDED', '🎉 Speciality added successfully!'),
    UPDATED: env('SPECIALITY_UPDATED', '🎉 Speciality updated successfully.'),
    DELETED: env('SPECIALITY_DELETED', '🎉 Speciality deleted successfully.'),
    BULK_DELETED: env(
      'SPECIALITIES_DELETED',
      '🎉 Specialities deleted successfully.'
    )
  },

  PHARMA_CODE: {
    ADDED: env('PHARMA_CODE_ADDED', '🎉 Pharma code added successfully'),
    UPDATED: env('PHARMA_CODE_UPDATED', '🎉 Pharma code updated successfully'),
    DELETED: env('PHARMA_CODE_DELETED', '🎉 Pharma code deleted successfully.'),
    BULK_DELETED: env(
      'PHARMA_CODES_DELETED',
      '🎉 Pharma code deleted successfully.'
    )
  },

  PHARMA_SALT: {
    ADDED: env('PHARMA_SALT_ADDED', '🎉 Pharma salt added successfully'),
    UPDATED: env('PHARMA_SALT_UPDATED', '🎉 Pharma salt updated successfully'),
    DELETED: env('PHARMA_SALT_DELETED', '🎉 Pharma salt deleted successfully.'),
    BULK_DELETED: env(
      'PHARMA_SALTS_DELETED',
      '🎉 Pharma salts deleted successfully.'
    )
  },

  MEMBERSHIP: {
    ADDED: env('MEMBERSHIP_ADDED', '🎉 Membership added successfully'),
    UPDATED: env('MEMBERSHIP_UPDATED', '🎉 Membership updated successfully'),
    DELETED: env('MEMBERSHIP_DELETED', '🎉 Membership deleted successfully.'),
    BULK_DELETED: env(
      'MEMBERSHIPS_DELETED',
      '🎉 Membership deleted successfully.'
    )
  },

  SYSTEM: {
    INVALID_INPUTS: env('INVALID_INPUTS', '⚠️ Invalid inputs!'),
    UNIQUE_ERROR: env('UNIQUE_ERR', '⚠️ Record already exists!'),
    BAD_REQUEST: env('BAD_REQUEST_MESSAGE', '⚠️ 400 Bad request!'),
    SERVER_ERROR: env('SERVER_ERROR_MESSAGE', '⚠️ Something went wrong!'),
    PRISMA_INIT_FAILED: env(
      'PRISMA_INIT',
      '⚠️ Failed to initialize prisma client!'
    )
  },

  USER: {
    NOT_FOUND: env('USER_NOT_FOUND', '⚠️ User does not exist!'),
    DELETED: env('USER_DELETED', '🎉 User deleted successfully.'),
    CONFIRM_EMAIL: env('CONFIRM_EMAIL', '🎉 Confirmation email sent.'),
    EMAIL_NOT_FOUND: env('EMAIL_NOT_FOUND', "⚠️ Email doesn't exist!"),
    EMAIL_BOUNCED: env('EMAIL_BOUNCED', '⚠️ Email address not found!'),
    BULK_DELETED: env('BULK_DELETED', '🎉 Users deleted successfully.'),
    EMAIL_VERIFIED: env('EMAIL_VERIFIED', '🎉 Email verified successfully.'),
    EMAIL_REGISTERED: env('EMAIL_REGISTERED', '⚠️ Email already registered!'),
    PROFILE_UPDATED: env('PROFILE_UPDATED', '🎉 Profile updated successfully.')
  },

  PHARMA_BRAND: {
    ADDED: env('PHARMA_BRAND_ADDED', '🎉 Pharma brand added successfully'),
    UPDATED: env(
      'PHARMA_BRAND_UPDATED',
      '🎉 Pharma brand updated successfully'
    ),
    DELETED: env(
      'PHARMA_BRAND_DELETED',
      '🎉 Pharma brand deleted successfully.'
    ),
    BULK_DELETED: env(
      'PHARMA_BRANDS_DELETED',
      '🎉 Pharma brands deleted successfully.'
    )
  },

  MEDICATION_FROM: {
    ADDED: env(
      'MEDICATION_FORM_ADDED',
      '🎉 Medication form added successfully'
    ),
    UPDATED: env(
      'MEDICATION_FORM_UPDATED',
      '🎉 Medication form updated successfully'
    ),
    DELETED: env(
      'MEDICATION_FORM_DELETED',
      '🎉 Medication form deleted successfully'
    ),
    BULK_DELETED: env(
      'MEDICATION_FORMS_DELETED',
      '🎉 Medication forms deleted successfully'
    )
  },

  AUTH: {
    TOKEN_EXPIRED: env('TOKEN_EXPIRED', '⚠️ Token has expired!'),
    TOKEN_NOT_FOUND: env('TOKEN_NOT_FOUND', "⚠️ Token doesn't exist!"),
    INVALID_CREDENTIALS: env(
      'INVALID_CREDENTIALS',
      '⚠️ Invalid email or password!'
    ),
    TOKEN_NOT_GENERATED: env(
      'TOKEN_NOT_GENERATED',
      '⚠️ Failed to generate verification token!'
    ),
    UNAUTHORIZED: env(
      'UN_AUTHORIZED',
      '⚠️ You are not authorized to perform this action!'
    )
  },

  PHARMA_MANUFACTURER: {
    ADDED: env(
      'PHARMA_MANUFACTURER_ADDED',
      '🎉 Pharma manufacture added successfully'
    ),
    UPDATED: env(
      'PHARMA_MANUFACTURER_UPDATED',
      '🎉 Pharma manufacture updated successfully'
    ),
    DELETED: env(
      'PHARMA_MANUFACTURER_DELETED',
      '🎉 Pharma manufacture deleted successfully.'
    ),
    BULK_DELETED: env(
      'PHARMA_MANUFACTURERS_DELETED',
      '🎉 Pharma manufacturers deleted successfully.'
    )
  },

  MEMBERSHIP_SUBSCRIPTION: {
    ADDED: env(
      'MEMBERSHIP_SUBSCRIPTION_ADDED',
      '🎉 Membership subscription added successfully'
    ),
    UPDATED: env(
      'MEMBERSHIP_SUBSCRIPTION_UPDATED',
      '🎉 Membership subscription updated successfully'
    ),
    DELETED: env(
      'MEMBERSHIP_SUBSCRIPTION_DELETED',
      '🎉 Membership subscription deleted successfully.'
    ),
    BULK_DELETED: env(
      'MEMBERSHIP_SUBSCRIPTIONS_DELETED',
      '🎉 Membership subscriptions deleted successfully.'
    )
  },

  FILE: {
    SPACE_FULL: env('SPACE_FULL', '⚠️ No space left on device!'),
    REMOVED: env('FILE_REMOVED', '🎉 File removed successfully.'),
    NOT_FOUND: env('IMAGE_NOT_FOUND', '⚠️ Image does not exist!'),
    UPLOADED: env('FILE_UPLOADED', '🎉 File uploaded successfully.'),
    UPLOAD_FAILED: env('UPLOAD_FAILED', '⚠️ Failed to upload file!'),
    DELETE_FAILED: env('DELETE_FAILED', '⚠️ Failed to delete file!'),
    INVALID_FORMAT: env(
      'INVALID_IMAGE_FORMAT',
      '⚠️ Image format is not valid!'
    ),
    DIRECTORY_NOT_FOUND: env(
      'DIRECTORY_NOT_FOUND',
      '⚠️ Upload directory not found!'
    ),
    PERMISSION_DENIED: env(
      'PERMISSION_DENIED',
      '⚠️ Permission denied while saving file!'
    )
  },

  APPOINTMENT: {
    EXISTS: env('APPOINTMENT_EXISTS', '⚠️ Appointment already exists!'),
    CANCELLED: env('APPOINTMENT_CANCELLED', '💬 Appointment cancelled.'),
    INVALID_TIME_SLOT: env('INVALID_TIME_SLOT', '⚠️ Invalid time slot!'),
    ACTION_RESTRICTED: env(
      'APPOINTMENT_ACTION_RESTRICTED',
      '⚠️ Appointment status can not be updated!'
    ),
    NOT_FOUND: env(
      'APPOINTMENT_NOT_FOUND',
      '⚠️ No details found for the current appointment!'
    ),
    CONFIRMED: env(
      'APPOINTMENT_CONFIRMED',
      '🎉 Appointment confirmed, you can print appointment receipt now.'
    ),
    CREATED: env(
      'APPOINTMENT_CREATED',
      '💬 We have informed the doctor about the appointment, once he confirms your appointment you would be able to get the receipt.'
    )
  }
} as const;
