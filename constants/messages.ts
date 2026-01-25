import { env } from '@/lib/utils';

export const MESSAGES = {
  APPOINTMENT: {
    ACTION_RESTRICTED: env(
      'APPOINTMENT_ACTION_RESTRICTED',
      '⚠️ Appointment status can not be updated!'
    ),
    BULK_DELETED: env(
      'APPOINTMENTS_DELETED',
      '🎉 Appointments deleted successfully.'
    ),
    CANCELLED: env('APPOINTMENT_CANCELLED', '💬 Appointment cancelled.'),
    CONFIRMED: env(
      'APPOINTMENT_CONFIRMED',
      '🎉 Appointment confirmed, you can print appointment receipt now.'
    ),
    CREATED: env(
      'APPOINTMENT_CREATED',
      '💬 We have informed the doctor about the appointment, once he confirms your appointment you would be able to get the receipt.'
    ),
    DELETED: env(
      'APPOINTMENT_DELETED',
      '🎉 Appointments deleted successfully.'
    ),
    EXISTS: env('APPOINTMENT_EXISTS', '⚠️ Appointment already exists!'),
    INVALID_TIME_SLOT: env('INVALID_TIME_SLOT', '⚠️ Invalid time slot!'),
    NOT_FOUND: env(
      'APPOINTMENT_NOT_FOUND',
      '⚠️ No details found for the current appointment!'
    )
  },

  AUTH: {
    INVALID_CREDENTIALS: env(
      'INVALID_CREDENTIALS',
      '⚠️ Invalid email or password!'
    ),
    TOKEN_EXPIRED: env('TOKEN_EXPIRED', '⚠️ Token has expired!'),
    TOKEN_NOT_FOUND: env('TOKEN_NOT_FOUND', "⚠️ Token doesn't exist!"),
    TOKEN_NOT_GENERATED: env(
      'TOKEN_NOT_GENERATED',
      '⚠️ Failed to generate verification token!'
    ),
    UNAUTHORIZED: env(
      'UN_AUTHORIZED',
      '⚠️ You are not authorized to perform this action!'
    )
  },

  DATABASE: {
    UPDATED: env('DATABASE_UPDATED', '🎉 Database updated successfully')
  },

  DEPARTMENT: {
    ADDED: env('DEPARTMENT_ADDED', '🎉 Department added successfully'),
    BULK_DELETED: env(
      'DEPARTMENTS_DELETED',
      '🎉 Departments deleted successfully.'
    ),
    DELETED: env('DEPARTMENT_DELETED', '🎉 Department deleted successfully.'),
    UPDATED: env('DEPARTMENT_UPDATED', '🎉 Department updated successfully')
  },

  FACILITY: {
    ADDED: env('FACILITY_ADDED', '🎉 Facility added successfully'),
    BULK_DELETED: env(
      'FACILITIES_DELETED',
      '🎉 Facilities deleted successfully.'
    ),
    DELETED: env('FACILITY_DELETED', '🎉 Facility deleted successfully.'),
    UPDATED: env('FACILITY_UPDATED', '🎉 Facility updated successfully')
  },

  FILE: {
    DELETE_FAILED: env('DELETE_FAILED', '⚠️ Failed to delete file!'),
    DIRECTORY_NOT_FOUND: env(
      'DIRECTORY_NOT_FOUND',
      '⚠️ Upload directory not found!'
    ),
    INVALID_FORMAT: env(
      'INVALID_IMAGE_FORMAT',
      '⚠️ Image format is not valid!'
    ),
    NOT_FOUND: env('IMAGE_NOT_FOUND', '⚠️ Image does not exist!'),
    PERMISSION_DENIED: env(
      'PERMISSION_DENIED',
      '⚠️ Permission denied while saving file!'
    ),
    REMOVED: env('FILE_REMOVED', '🎉 File removed successfully.'),
    SPACE_FULL: env('SPACE_FULL', '⚠️ No space left on device!'),
    UPLOAD_FAILED: env('UPLOAD_FAILED', '⚠️ Failed to upload file!'),
    UPLOADED: env('FILE_UPLOADED', '🎉 File uploaded successfully.')
  },

  HOSPITAL: {
    ADDED: env('HOSPITAL_ADDED', '🎉 Hospital added successfully'),
    BULK_DELETED: env('HOSPITALS_DELETED', '🎉 Hospitals deleted successfully'),
    DELETED: env('HOSPITAL_DELETED', '🎉 Hospital deleted successfully'),
    UPDATED: env('HOSPITAL_UPDATED', '🎉 Hospital updated successfully')
  },

  MEDICATION_FROM: {
    ADDED: env(
      'MEDICATION_FORM_ADDED',
      '🎉 Medication form added successfully'
    ),
    BULK_DELETED: env(
      'MEDICATION_FORMS_DELETED',
      '🎉 Medication forms deleted successfully'
    ),
    DELETED: env(
      'MEDICATION_FORM_DELETED',
      '🎉 Medication form deleted successfully'
    ),
    UPDATED: env(
      'MEDICATION_FORM_UPDATED',
      '🎉 Medication form updated successfully'
    )
  },

  MEMBERSHIP: {
    ADDED: env('MEMBERSHIP_ADDED', '🎉 Membership added successfully'),
    BULK_DELETED: env(
      'MEMBERSHIPS_DELETED',
      '🎉 Membership deleted successfully.'
    ),
    DELETED: env('MEMBERSHIP_DELETED', '🎉 Membership deleted successfully.'),
    UPDATED: env('MEMBERSHIP_UPDATED', '🎉 Membership updated successfully')
  },

  MEMBERSHIP_SUBSCRIPTION: {
    ADDED: env(
      'MEMBERSHIP_SUBSCRIPTION_ADDED',
      '🎉 Membership subscription added successfully'
    ),
    BULK_DELETED: env(
      'MEMBERSHIP_SUBSCRIPTIONS_DELETED',
      '🎉 Membership subscriptions deleted successfully.'
    ),
    DELETED: env(
      'MEMBERSHIP_SUBSCRIPTION_DELETED',
      '🎉 Membership subscription deleted successfully.'
    ),
    UPDATED: env(
      'MEMBERSHIP_SUBSCRIPTION_UPDATED',
      '🎉 Membership subscription updated successfully'
    )
  },

  PAYMENT: {
    PROCESSED: env('PAYMENT_PROCESSED', '🎉 Payment processed successfully.')
  },

  PERMISSION: {
    ADDED: env('PERMISSION_ADDED', '🎉 Permission added successfully.'),
    ASSIGNED: env(
      'PERMISSIONS_ASSIGNED',
      '🎉 All permissions are assigned successfully.'
    ),
    UPDATED: env('PERMISSION_UPDATED', '🎉 Permission updated successfully.')
  },

  PHARMA_BRAND: {
    ADDED: env('PHARMA_BRAND_ADDED', '🎉 Pharma brand added successfully'),
    BULK_DELETED: env(
      'PHARMA_BRANDS_DELETED',
      '🎉 Pharma brands deleted successfully.'
    ),
    DELETED: env(
      'PHARMA_BRAND_DELETED',
      '🎉 Pharma brand deleted successfully.'
    ),
    UPDATED: env('PHARMA_BRAND_UPDATED', '🎉 Pharma brand updated successfully')
  },

  PHARMA_CODE: {
    ADDED: env('PHARMA_CODE_ADDED', '🎉 Pharma code added successfully'),
    BULK_DELETED: env(
      'PHARMA_CODES_DELETED',
      '🎉 Pharma code deleted successfully.'
    ),
    DELETED: env('PHARMA_CODE_DELETED', '🎉 Pharma code deleted successfully.'),
    UPDATED: env('PHARMA_CODE_UPDATED', '🎉 Pharma code updated successfully')
  },

  PHARMA_MANUFACTURER: {
    ADDED: env(
      'PHARMA_MANUFACTURER_ADDED',
      '🎉 Pharma manufacture added successfully'
    ),
    BULK_DELETED: env(
      'PHARMA_MANUFACTURERS_DELETED',
      '🎉 Pharma manufacturers deleted successfully.'
    ),
    DELETED: env(
      'PHARMA_MANUFACTURER_DELETED',
      '🎉 Pharma manufacture deleted successfully.'
    ),
    UPDATED: env(
      'PHARMA_MANUFACTURER_UPDATED',
      '🎉 Pharma manufacture updated successfully'
    )
  },

  PHARMA_SALT: {
    ADDED: env('PHARMA_SALT_ADDED', '🎉 Pharma salt added successfully'),
    BULK_DELETED: env(
      'PHARMA_SALTS_DELETED',
      '🎉 Pharma salts deleted successfully.'
    ),
    DELETED: env('PHARMA_SALT_DELETED', '🎉 Pharma salt deleted successfully.'),
    UPDATED: env('PHARMA_SALT_UPDATED', '🎉 Pharma salt updated successfully')
  },

  ROLE: {
    ADDED: env('ROLE_ADDED', '🎉 Role added successfully!'),
    ASSIGNED: env('ROLES_ASSIGNED', '🎉 Roles are assigned successfully.'),
    UPDATED: env('ROLE_UPDATED', '🎉 Role updated successfully.')
  },

  SPECIALITY: {
    ADDED: env('SPECIALITY_ADDED', '🎉 Speciality added successfully!'),
    BULK_DELETED: env(
      'SPECIALITIES_DELETED',
      '🎉 Specialities deleted successfully.'
    ),
    DELETED: env('SPECIALITY_DELETED', '🎉 Speciality deleted successfully.'),
    UPDATED: env('SPECIALITY_UPDATED', '🎉 Speciality updated successfully.')
  },

  SYSTEM: {
    BAD_REQUEST: env('BAD_REQUEST_MESSAGE', '⚠️ 400 Bad request!'),
    INVALID_INPUTS: env('INVALID_INPUTS', '⚠️ Invalid inputs!'),
    PRISMA_INIT_FAILED: env(
      'PRISMA_INIT',
      '⚠️ Failed to initialize prisma client!'
    ),
    SERVER_ERROR: env('SERVER_ERROR_MESSAGE', '⚠️ Something went wrong!'),
    UNIQUE_ERROR: env('UNIQUE_ERR', '⚠️ Record already exists!')
  },

  USER: {
    BULK_DELETED: env('BULK_DELETED', '🎉 Users deleted successfully.'),
    CONFIRM_EMAIL: env('CONFIRM_EMAIL', '🎉 Confirmation email sent.'),
    DELETED: env('USER_DELETED', '🎉 User deleted successfully.'),
    EMAIL_BOUNCED: env('EMAIL_BOUNCED', '⚠️ Email address not found!'),
    EMAIL_NOT_FOUND: env('EMAIL_NOT_FOUND', "⚠️ Email doesn't exist!"),
    EMAIL_REGISTERED: env('EMAIL_REGISTERED', '⚠️ Email already registered!'),
    EMAIL_VERIFIED: env('EMAIL_VERIFIED', '🎉 Email verified successfully.'),
    NOT_FOUND: env('USER_NOT_FOUND', '⚠️ User does not exist!'),
    PROFILE_UPDATED: env('PROFILE_UPDATED', '🎉 Profile updated successfully.')
  }
} as const;
