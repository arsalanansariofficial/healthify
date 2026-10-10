import {
  customType,
  primaryKey,
  snakeCase,
  integer,
  unique,
  check,
  index,
  text
} from 'drizzle-orm/sqlite-core';
import { defineRelations, sql } from 'drizzle-orm';

export enum Day {
  wednesday = 'wednesday',
  thursday = 'thursday',
  saturday = 'saturday',
  tuesday = 'tuesday',
  sunday = 'sunday',
  monday = 'monday',
  friday = 'friday'
}

export enum Status {
  confirmed = 'confirmed',
  cancelled = 'cancelled',
  pending = 'pending'
}

export enum Priority {
  normal = 'normal',
  urgent = 'urgent',
  high = 'high',
  low = 'low'
}

export enum Gender {
  female = 'female',
  male = 'male'
}

export enum Role {
  doctor = 'doctor',
  user = 'user'
}

export type SchemaSelect = {
  [K in keyof typeof schema]: (typeof schema)[K]['$inferSelect'];
};

export type SchemaInsert = {
  [K in keyof typeof schema]: (typeof schema)[K]['$inferInsert'];
};

export type SchemaUpdate = {
  [K in keyof SchemaSelect]: Partial<SchemaSelect[K]>;
};

export const date = customType<{ driverData: string; data: Date }>({
  fromDriver: (value: string) => new Date(value),
  toDriver: (value: Date) => value.toISOString(),
  dataType: () => 'text'
});

export const timestamps = {
  updatedAt: date()
    .$default(() => new Date())
    .$onUpdate(() => new Date())
    .notNull(),
  createdAt: date()
    .$default(() => new Date())
    .notNull()
};

export const id = text()
  .primaryKey()
  .$default(() => Bun.randomUUIDv7());

export const user = snakeCase.table('user', {
  emailVerified: integer({ mode: 'boolean' }).default(false).notNull(),
  phoneNumber: text().unique('ux_user_phone_number'),
  phoneNumberVerified: integer({ mode: 'boolean' }),
  email: text().unique('ux_user_email').notNull(),
  twoFactorEnabled: integer({ mode: 'boolean' }),
  username: text().unique('ux_user_username'),
  isAnonymous: integer({ mode: 'boolean' }),
  banned: integer({ mode: 'boolean' }),
  displayUsername: text(),
  name: text().notNull(),
  banExpires: date(),
  banReason: text(),
  image: text(),
  role: text(),
  ...timestamps,
  id
});

export const userProfile = snakeCase.table(
  'user_profile',
  {
    userId: text()
      .primaryKey()
      .references(() => user.id, { onDelete: 'cascade' }),
    phoneNumber: text().unique('ux_user_profile_phone_number'),
    gender: text().$type<Gender>(),
    address: text(),
    cover: text(),
    bio: text(),
    ...timestamps
  },
  table => [index('fk_user_profile_user_id').on(table.userId)]
);

export const account = snakeCase.table(
  'account',
  {
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    gender: text().$type<Gender>(),
    refreshTokenExpiresAt: text(),
    providerId: text().notNull(),
    accessTokenExpiresAt: text(),
    accountId: text().notNull(),
    refreshToken: text(),
    accessToken: text(),
    password: text(),
    address: text(),
    idToken: text(),
    cover: text(),
    scope: text(),
    bio: text(),
    ...timestamps,
    id
  },
  table => [index('fk_account_user_id').on(table.userId)]
);

export const session = snakeCase.table(
  'session',
  {
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    token: text().notNull().unique('ux_session_token'),
    activeOrganizationId: text(),
    expiresAt: date().notNull(),
    impersonatedBy: text(),
    activeTeamId: text(),
    ipAddress: text(),
    userAgent: text(),
    ...timestamps,
    id
  },
  table => [index('fk_session_user_id').on(table.userId)]
);

export const organization = snakeCase.table('organization', {
  slug: text().unique('ux_organization_slug').notNull(),
  name: text().notNull(),
  metadata: text(),
  logo: text(),
  ...timestamps,
  id
});

export const twoFactor = snakeCase.table(
  'two_factor',
  {
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    verified: integer({ mode: 'boolean' }).default(true),
    failedVerificationCount: integer().default(0),
    backupCodes: text().notNull(),
    secret: text().notNull(),
    lockedUntil: text(),
    ...timestamps,
    id
  },
  table => [index('fk_two_factor_user_id').on(table.userId)]
);

export const teamMember = snakeCase.table(
  'team_member',
  {
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    teamId: text()
      .notNull()
      .references(() => team.id, { onDelete: 'cascade' }),
    membershipKey: text(),
    ...timestamps,
    id
  },
  table => [
    index('fk_team_member_user_id').on(table.userId),
    index('fk_team_member_team_id').on(table.teamId)
  ]
);

export const member = snakeCase.table(
  'member',
  {
    organizationId: text()
      .notNull()
      .references(() => organization.id, { onDelete: 'cascade' }),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    role: text().notNull(),
    ...timestamps,
    id
  },
  table => [
    index('fk_member_user_id').on(table.userId),
    index('fk_member_organization_id').on(table.organizationId)
  ]
);

export const team = snakeCase.table(
  'team',
  {
    organizationId: text()
      .notNull()
      .references(() => organization.id, { onDelete: 'cascade' }),
    memberCount: integer().notNull(),
    name: text().notNull(),
    ...timestamps,
    id
  },
  table => [index('fk_team_organization_id').on(table.organizationId)]
);

export const organizationRole = snakeCase.table(
  'organization_role',
  {
    organizationId: text()
      .notNull()
      .references(() => organization.id, { onDelete: 'cascade' }),
    permission: text().notNull(),
    role: text().notNull(),
    ...timestamps,
    id
  },
  table => [
    index('fk_organization_role_organization_id').on(table.organizationId)
  ]
);

export const verification = snakeCase.table(
  'verification',
  {
    identifier: text().notNull(),
    expiresAt: date().notNull(),
    value: text().notNull(),
    ...timestamps,
    id
  },
  table => [index('idx_verification_identifier').on(table.identifier)]
);

export const invitation = snakeCase.table(
  'invitation',
  {
    organizationId: text()
      .notNull()
      .references(() => organization.id, { onDelete: 'cascade' }),
    inviterId: text()
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    expiresAt: date().notNull(),
    status: text().notNull(),
    email: text().notNull(),
    teamId: text(),
    role: text(),
    ...timestamps,
    id
  },
  table => [
    index('fk_invitation_organization_id').on(table.organizationId),
    index('fk_invitation_inviter_id').on(table.inviterId)
  ]
);

export const schedule = snakeCase.table(
  'schedule',
  {
    doctorId: text()
      .notNull()
      .references(() => doctor.userId, { onDelete: 'cascade' }),
    day: text().$type<Day>().notNull(),
    from: text().notNull(),
    to: text().notNull(),
    ...timestamps
  },
  table => [index('idx_schedule_doctor_id').on(table.doctorId)]
);

export const doctor = snakeCase.table(
  'doctor',
  {
    userId: text()
      .primaryKey()
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    experienceYears: integer().default(0).notNull(),
    consultationFee: integer().default(0).notNull(),
    rating: integer().default(0).notNull(),
    licenseNumber: text().notNull(),
    ...timestamps
  },
  table => [index('fk_doctor_user_id').on(table.userId)]
);

export const doctorToSpecialization = snakeCase.table(
  'doctor_to_specialization',
  {
    specialization: text()
      .notNull()
      .references(() => specialization.name, { onDelete: 'cascade' }),
    doctorId: text()
      .notNull()
      .references(() => doctor.userId, { onDelete: 'cascade' }),
    ...timestamps
  },
  table => [primaryKey({ columns: [table.doctorId, table.specialization] })]
);

export const specialization = snakeCase.table('specialization', {
  name: text().primaryKey(),
  ...timestamps
});

export const appointment = snakeCase.table(
  'appointment',
  {
    doctorId: text()
      .notNull()
      .references(() => doctor.userId, { onDelete: 'cascade' }),
    patientId: text()
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    priority: text().$type<Priority>().default(Priority.normal).notNull(),
    status: text().$type<Status>().default(Status.pending).notNull(),
    queue: integer().notNull(),
    from: text().notNull(),
    date: date().notNull(),
    to: text().notNull(),
    prescription: text(),
    rating: integer(),
    feedback: text(),
    notes: text(),
    ...timestamps,
    id
  },
  table => [
    check('chk_appointment_valid_rating', sql`${table.rating} between 1 and 5`),
    unique('ux_appointment_doctor_id_patient_id_date_from_to').on(
      table.doctorId,
      table.patientId,
      table.date,
      table.from,
      table.to
    ),
    check('chk_appointment_valid_time', sql`${table.from} < ${table.to}`),
    index('fk_appointment_patient_id').on(table.patientId),
    index('fk_appointment_doctor_id').on(table.doctorId)
  ]
);

export const schema = {
  doctorToSpecialization,
  organizationRole,
  specialization,
  organization,
  verification,
  userProfile,
  appointment,
  teamMember,
  invitation,
  twoFactor,
  schedule,
  account,
  session,
  doctor,
  member,
  user,
  team
};

export const relations = defineRelations(schema, r => ({
  doctor: {
    specializations: r.many.specialization({
      to: r.specialization.name.through(
        r.doctorToSpecialization.specialization
      ),
      from: r.doctor.userId.through(r.doctorToSpecialization.doctorId)
    }),
    user: r.one.user({ from: r.doctor.userId, to: r.user.id }),
    appointments: r.many.appointment(),
    profile: r.one.userProfile(),
    schedule: r.many.schedule()
  },
  user: {
    appointments: r.many.appointment(),
    invitations: r.many.invitation(),
    teamMembers: r.many.teamMember(),
    TwoFactor: r.many.twoFactor(),
    profile: r.one.userProfile(),
    sessions: r.many.session(),
    accounts: r.many.account(),
    members: r.many.member(),
    doctor: r.one.doctor()
  },
  invitation: {
    organization: r.one.organization({
      from: r.invitation.organizationId,
      to: r.organization.id
    }),
    inviter: r.one.user({ from: r.invitation.inviterId, to: r.user.id })
  },
  member: {
    organization: r.one.organization({
      from: r.member.organizationId,
      to: r.organization.id
    }),
    user: r.one.user({ from: r.member.userId, to: r.user.id })
  },
  appointment: {
    doctor: r.one.doctor({ from: r.appointment.doctorId, to: r.doctor.userId }),
    patient: r.one.user({ from: r.appointment.patientId, to: r.user.id })
  },
  userProfile: {
    doctor: r.one.doctor({ from: r.userProfile.userId, to: r.doctor.userId }),
    user: r.one.user({ from: r.userProfile.userId, to: r.user.id })
  },
  organization: {
    organizationRoles: r.many.organizationRole(),
    invitations: r.many.invitation(),
    members: r.many.member(),
    teams: r.many.team()
  },
  team: {
    organization: r.one.organization({
      from: r.team.organizationId,
      to: r.organization.id
    }),
    teamMembers: r.many.teamMember()
  },
  teamMember: {
    user: r.one.user({ from: r.teamMember.userId, to: r.user.id }),
    team: r.one.team({ from: r.teamMember.teamId, to: r.team.id })
  },
  organizationRole: {
    organization: r.one.organization({
      from: r.organizationRole.organizationId,
      to: r.organization.id
    })
  },
  schedule: {
    doctor: r.one.doctor({ from: r.schedule.doctorId, to: r.doctor.userId })
  },
  twoFactor: { user: r.one.user({ from: r.twoFactor.userId, to: r.user.id }) },
  session: { user: r.one.user({ from: r.session.userId, to: r.user.id }) },
  account: { user: r.one.user({ from: r.account.userId, to: r.user.id }) },
  specialization: { doctors: r.many.doctor() }
}));
