import { sqliteTable, integer, index, text } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm/_relations';

export const user = sqliteTable('user', {
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
    .$onUpdate(() => new Date())
    .notNull(),
  emailVerified: integer('email_verified', { mode: 'boolean' })
    .default(false)
    .notNull(),
  twoFactorEnabled: integer('two_factor_enabled', { mode: 'boolean' }).default(
    false
  ),
  phoneNumberVerified: integer('phone_number_verified', { mode: 'boolean' }),
  isAnonymous: integer('is_anonymous', { mode: 'boolean' }).default(false),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  banned: integer('banned', { mode: 'boolean' }).default(false),
  banExpires: integer('ban_expires', { mode: 'timestamp_ms' }),
  phoneNumber: text('phone_number').unique(),
  displayUsername: text('display_username'),
  email: text('email').notNull().unique(),
  username: text('username').unique(),
  banReason: text('ban_reason'),
  name: text('name').notNull(),
  id: text('id').primaryKey(),
  image: text('image'),
  role: text('role')
});

export const session = sqliteTable(
  'session',
  {
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .$onUpdate(() => new Date())
      .notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
    activeOrganizationId: text('active_organization_id'),
    token: text('token').notNull().unique(),
    impersonatedBy: text('impersonated_by'),
    activeTeamId: text('active_team_id'),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    id: text('id').primaryKey()
  },
  table => [index('session_userId_idx').on(table.userId)]
);

export const account = sqliteTable(
  'account',
  {
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .$onUpdate(() => new Date())
      .notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    refreshTokenExpiresAt: integer('refresh_token_expires_at', {
      mode: 'timestamp_ms'
    }),
    accessTokenExpiresAt: integer('access_token_expires_at', {
      mode: 'timestamp_ms'
    }),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
    providerId: text('provider_id').notNull(),
    accountId: text('account_id').notNull(),
    refreshToken: text('refresh_token'),
    accessToken: text('access_token'),
    id: text('id').primaryKey(),
    password: text('password'),
    idToken: text('id_token'),
    scope: text('scope')
  },
  table => [index('account_userId_idx').on(table.userId)]
);

export const verification = sqliteTable(
  'verification',
  {
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .$onUpdate(() => new Date())
      .notNull(),
    expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    id: text('id').primaryKey()
  },
  table => [index('verification_identifier_idx').on(table.identifier)]
);

export const organization = sqliteTable('organization', {
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  id: text('id').primaryKey(),
  metadata: text('metadata'),
  logo: text('logo')
});

export const organizationRole = sqliteTable(
  'organization_role',
  {
    organizationId: text('organization_id')
      .notNull()
      .references(() => organization.id, { onDelete: 'cascade' }),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).$onUpdate(
      () => new Date()
    ),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
    permission: text('permission').notNull(),
    role: text('role').notNull(),
    id: text('id').primaryKey()
  },
  table => [
    index('organizationRole_organizationId_idx').on(table.organizationId),
    index('organizationRole_role_idx').on(table.role)
  ]
);

export const team = sqliteTable(
  'team',
  {
    organizationId: text('organization_id')
      .notNull()
      .references(() => organization.id, { onDelete: 'cascade' }),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).$onUpdate(
      () => new Date()
    ),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
    memberCount: integer('member_count').default(0).notNull(),
    name: text('name').notNull(),
    id: text('id').primaryKey()
  },
  table => [index('team_organizationId_idx').on(table.organizationId)]
);

export const teamMember = sqliteTable(
  'team_member',
  {
    teamId: text('team_id')
      .notNull()
      .references(() => team.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }),
    membershipKey: text('membership_key').unique(),
    id: text('id').primaryKey()
  },
  table => [
    index('teamMember_teamId_idx').on(table.teamId),
    index('teamMember_userId_idx').on(table.userId)
  ]
);

export const member = sqliteTable(
  'member',
  {
    organizationId: text('organization_id')
      .notNull()
      .references(() => organization.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
    role: text('role').default('member').notNull(),
    id: text('id').primaryKey()
  },
  table => [
    index('member_organizationId_idx').on(table.organizationId),
    index('member_userId_idx').on(table.userId)
  ]
);

export const invitation = sqliteTable(
  'invitation',
  {
    organizationId: text('organization_id')
      .notNull()
      .references(() => organization.id, { onDelete: 'cascade' }),
    inviterId: text('inviter_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
    status: text('status').default('pending').notNull(),
    email: text('email').notNull(),
    id: text('id').primaryKey(),
    teamId: text('team_id'),
    role: text('role')
  },
  table => [
    index('invitation_organizationId_idx').on(table.organizationId),
    index('invitation_email_idx').on(table.email)
  ]
);

export const twoFactor = sqliteTable(
  'two_factor',
  {
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    failedVerificationCount: integer('failed_verification_count').default(0),
    verified: integer('verified', { mode: 'boolean' }).default(true),
    lockedUntil: integer('locked_until', { mode: 'timestamp_ms' }),
    backupCodes: text('backup_codes').notNull(),
    secret: text('secret').notNull(),
    id: text('id').primaryKey()
  },
  table => [
    index('twoFactor_secret_idx').on(table.secret),
    index('twoFactor_userId_idx').on(table.userId)
  ]
);

export const userRelations = relations(user, ({ many }) => ({
  teamMembers: many(teamMember),
  invitations: many(invitation),
  twoFactors: many(twoFactor),
  sessions: many(session),
  accounts: many(account),
  members: many(member)
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, { fields: [session.userId], references: [user.id] })
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, { fields: [account.userId], references: [user.id] })
}));

export const organizationRelations = relations(organization, ({ many }) => ({
  organizationRoles: many(organizationRole),
  invitations: many(invitation),
  members: many(member),
  teams: many(team)
}));

export const organizationRoleRelations = relations(
  organizationRole,
  ({ one }) => ({
    organization: one(organization, {
      fields: [organizationRole.organizationId],
      references: [organization.id]
    })
  })
);

export const teamRelations = relations(team, ({ many, one }) => ({
  organization: one(organization, {
    fields: [team.organizationId],
    references: [organization.id]
  }),
  teamMembers: many(teamMember)
}));

export const teamMemberRelations = relations(teamMember, ({ one }) => ({
  team: one(team, { fields: [teamMember.teamId], references: [team.id] }),
  user: one(user, { fields: [teamMember.userId], references: [user.id] })
}));

export const memberRelations = relations(member, ({ one }) => ({
  organization: one(organization, {
    fields: [member.organizationId],
    references: [organization.id]
  }),
  user: one(user, { fields: [member.userId], references: [user.id] })
}));

export const invitationRelations = relations(invitation, ({ one }) => ({
  organization: one(organization, {
    fields: [invitation.organizationId],
    references: [organization.id]
  }),
  user: one(user, { fields: [invitation.inviterId], references: [user.id] })
}));

export const twoFactorRelations = relations(twoFactor, ({ one }) => ({
  user: one(user, { fields: [twoFactor.userId], references: [user.id] })
}));
