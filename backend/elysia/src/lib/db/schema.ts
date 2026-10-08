import { defineRelations, sql } from 'drizzle-orm';
import * as t from 'drizzle-orm/sqlite-core';

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

export const date = t.customType<{ driverData: string; data: Date }>({
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

export const id = t
  .text()
  .primaryKey()
  .$default(() => Bun.randomUUIDv7());

export const user = t.snakeCase.table('user', {
  emailVerified: t.integer({ mode: 'boolean' }).default(false).notNull(),
  phoneNumber: t.text().unique('ux_user_phone_number'),
  phoneNumberVerified: t.integer({ mode: 'boolean' }),
  email: t.text().unique('ux_user_email').notNull(),
  twoFactorEnabled: t.integer({ mode: 'boolean' }),
  username: t.text().unique('ux_user_username'),
  isAnonymous: t.integer({ mode: 'boolean' }),
  banned: t.integer({ mode: 'boolean' }),
  displayUsername: t.text(),
  name: t.text().notNull(),
  banReason: t.text(),
  banExpires: date(),
  image: t.text(),
  role: t.text(),
  ...timestamps,
  id
});

export const userProfile = t.snakeCase.table(
  'user_profile',
  {
    userId: t
      .text()
      .primaryKey()
      .references(() => user.id, { onDelete: 'cascade' }),
    phoneNumber: t.text().unique('ux_user_profile_phone_number'),
    gender: t.text().$type<Gender>(),
    address: t.text(),
    cover: t.text(),
    bio: t.text(),
    ...timestamps
  },
  table => [t.index('fk_user_profile_user_id').on(table.userId)]
);

export const account = t.snakeCase.table(
  'account',
  {
    userId: t
      .text()
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    gender: t.text().$type<Gender>(),
    refreshTokenExpiresAt: t.text(),
    providerId: t.text().notNull(),
    accessTokenExpiresAt: t.text(),
    accountId: t.text().notNull(),
    refreshToken: t.text(),
    accessToken: t.text(),
    password: t.text(),
    address: t.text(),
    idToken: t.text(),
    cover: t.text(),
    scope: t.text(),
    bio: t.text(),
    ...timestamps,
    id
  },
  table => [t.index('fk_account_user_id').on(table.userId)]
);

export const session = t.snakeCase.table(
  'session',
  {
    userId: t
      .text()
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    token: t.text().notNull().unique('ux_session_token'),
    activeOrganizationId: t.text(),
    expiresAt: date().notNull(),
    impersonatedBy: t.text(),
    activeTeamId: t.text(),
    ipAddress: t.text(),
    userAgent: t.text(),
    ...timestamps,
    id
  },
  table => [t.index('fk_session_user_id').on(table.userId)]
);

export const organization = t.snakeCase.table('organization', {
  slug: t.text().unique('ux_organization_slug').notNull(),
  name: t.text().notNull(),
  metadata: t.text(),
  logo: t.text(),
  ...timestamps,
  id
});

export const twoFactor = t.snakeCase.table(
  'two_factor',
  {
    userId: t
      .text()
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    verified: t.integer({ mode: 'boolean' }).default(true),
    failedVerificationCount: t.integer().default(0),
    backupCodes: t.text().notNull(),
    secret: t.text().notNull(),
    lockedUntil: t.text(),
    ...timestamps,
    id
  },
  table => [t.index('fk_two_factor_user_id').on(table.userId)]
);

export const teamMember = t.snakeCase.table(
  'team_member',
  {
    userId: t
      .text()
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    teamId: t
      .text()
      .notNull()
      .references(() => team.id, { onDelete: 'cascade' }),
    membershipKey: t.text(),
    ...timestamps,
    id
  },
  table => [
    t.index('fk_team_member_user_id').on(table.userId),
    t.index('fk_team_member_team_id').on(table.teamId)
  ]
);

export const member = t.snakeCase.table(
  'member',
  {
    organizationId: t
      .text()
      .notNull()
      .references(() => organization.id, { onDelete: 'cascade' }),
    userId: t
      .text()
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    role: t.text().notNull(),
    ...timestamps,
    id
  },
  table => [
    t.index('fk_member_user_id').on(table.userId),
    t.index('fk_member_organization_id').on(table.organizationId)
  ]
);

export const team = t.snakeCase.table(
  'team',
  {
    organizationId: t
      .text()
      .notNull()
      .references(() => organization.id, { onDelete: 'cascade' }),
    memberCount: t.integer().notNull(),
    name: t.text().notNull(),
    ...timestamps,
    id
  },
  table => [t.index('fk_team_organization_id').on(table.organizationId)]
);

export const organizationRole = t.snakeCase.table(
  'organization_role',
  {
    organizationId: t
      .text()
      .notNull()
      .references(() => organization.id, { onDelete: 'cascade' }),
    permission: t.text().notNull(),
    role: t.text().notNull(),
    ...timestamps,
    id
  },
  table => [
    t.index('fk_organization_role_organization_id').on(table.organizationId)
  ]
);

export const verification = t.snakeCase.table(
  'verification',
  {
    identifier: t.text().notNull(),
    expiresAt: date().notNull(),
    value: t.text().notNull(),
    ...timestamps,
    id
  },
  table => [t.index('idx_verification_identifier').on(table.identifier)]
);

export const invitation = t.snakeCase.table(
  'invitation',
  {
    organizationId: t
      .text()
      .notNull()
      .references(() => organization.id, { onDelete: 'cascade' }),
    inviterId: t
      .text()
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    expiresAt: date().notNull(),
    status: t.text().notNull(),
    email: t.text().notNull(),
    teamId: t.text(),
    role: t.text(),
    ...timestamps,
    id
  },
  table => [
    t.index('fk_invitation_organization_id').on(table.organizationId),
    t.index('fk_invitation_inviter_id').on(table.inviterId)
  ]
);

export const schedule = t.snakeCase.table(
  'schedule',
  {
    doctorId: t
      .text()
      .notNull()
      .references(() => doctor.userId, { onDelete: 'cascade' }),
    day: t.text().$type<Day>().notNull(),
    from: t.text().notNull(),
    to: t.text().notNull(),
    ...timestamps
  },
  table => [t.index('idx_schedule_doctor_id').on(table.doctorId)]
);

export const doctor = t.snakeCase.table(
  'doctor',
  {
    userId: t
      .text()
      .primaryKey()
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    experienceYears: t.integer().default(0).notNull(),
    consultationFee: t.integer().default(0).notNull(),
    rating: t.integer().default(0).notNull(),
    licenseNumber: t.text().notNull(),
    ...timestamps
  },
  table => [t.index('fk_doctor_user_id').on(table.userId)]
);

export const doctorToSpecialization = t.snakeCase.table(
  'doctor_to_specialization',
  {
    specialization: t
      .text()
      .notNull()
      .references(() => specialization.name, { onDelete: 'cascade' }),
    doctorId: t
      .text()
      .notNull()
      .references(() => doctor.userId, { onDelete: 'cascade' }),
    ...timestamps
  },
  table => [t.primaryKey({ columns: [table.doctorId, table.specialization] })]
);

export const specialization = t.snakeCase.table('specialization', {
  name: t.text().primaryKey(),
  ...timestamps
});

export const appointment = t.snakeCase.table(
  'appointment',
  {
    doctorId: t
      .text()
      .notNull()
      .references(() => doctor.userId, { onDelete: 'cascade' }),
    patientId: t
      .text()
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    priority: t.text().$type<Priority>().default(Priority.normal).notNull(),
    status: t.text().$type<Status>().default(Status.pending).notNull(),
    queue: t.integer().notNull(),
    from: t.text().notNull(),
    date: date().notNull(),
    to: t.text().notNull(),
    prescription: t.text(),
    rating: t.integer(),
    notes: t.text(),
    ...timestamps,
    id
  },
  table => [
    t.check(
      'chk_appointment_valid_rating',
      sql`${table.rating} between 1 and 5`
    ),
    t
      .unique('ux_appointment_doctor_id_patient_id_date_from_to')
      .on(table.doctorId, table.patientId, table.date, table.from, table.to),
    t.check('chk_appointment_valid_time', sql`${table.from} < ${table.to}`),
    t.index('fk_appointment_patient_id').on(table.patientId),
    t.index('fk_appointment_doctor_id').on(table.doctorId)
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
  userProfile: {
    User: r.one.user({ from: r.userProfile.userId, to: r.user.id })
  },
  twoFactor: { user: r.one.user({ from: r.twoFactor.userId, to: r.user.id }) },
  session: { user: r.one.user({ from: r.session.userId, to: r.user.id }) },
  account: { user: r.one.user({ from: r.account.userId, to: r.user.id }) },
  specialization: { doctors: r.many.doctor() }
}));
