import { defineRelations } from 'drizzle-orm';
import * as t from 'drizzle-orm/sqlite-core';

export enum Gender {
  female = 'female',
  male = 'male'
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

export const User = t.snakeCase.table('user', {
  banExpires: t
    .text()
    .$type<Date>()
    .$default(() => new Date())
    .$onUpdate(() => new Date()),
  updatedAt: t
    .text()
    .$type<Date>()
    .$default(() => new Date())
    .$onUpdate(() => new Date()),
  createdAt: t
    .text()
    .$type<Date>()
    .$default(() => new Date()),
  phoneNumber: t.text().unique('user_phone_number_unique_index'),
  emailVerified: t.integer({ mode: 'boolean' }).default(false),
  email: t.text().unique('user_email_unique_index').notNull(),
  username: t.text().unique('user_username_unique_index'),
  id: t.text().primaryKey().default(Bun.randomUUIDv7()),
  phoneNumberVerified: t.integer({ mode: 'boolean' }),
  twoFactorEnabled: t.integer({ mode: 'boolean' }),
  isAnonymous: t.integer({ mode: 'boolean' }),
  banned: t.integer({ mode: 'boolean' }),
  displayUsername: t.text(),
  name: t.text().notNull(),
  banReason: t.text(),
  image: t.text(),
  role: t.text()
});

export const UserProfile = t.snakeCase.table(
  'user_profile',
  {
    updatedAt: t
      .text()
      .$type<Date>()
      .$default(() => new Date()),
    createdAt: t
      .text()
      .$type<Date>()
      .$default(() => new Date()),
    userId: t
      .text()
      .primaryKey()
      .references(() => User.id),
    phoneNumber: t.text().unique('user_profile_phone_number_unique_index'),
    gender: t.text().$type<Gender>(),
    address: t.text(),
    cover: t.text(),
    bio: t.text()
  },
  table => [t.index('user_profile_user_id_index').on(table.userId)]
);

export const Account = t.snakeCase.table(
  'account',
  {
    updatedAt: t
      .text()
      .$default(() => new Date().toISOString())
      .$onUpdate(() => new Date().toISOString()),
    createdAt: t
      .text()
      .$type<Date>()
      .$default(() => new Date()),
    userId: t
      .text()
      .notNull()
      .references(() => User.id),
    id: t.text().primaryKey().default(Bun.randomUUIDv7()),
    gender: t.text().$type<'female' | 'male'>(),
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
    bio: t.text()
  },
  table => [t.index('account_user_id_index').on(table.userId)]
);

export const Session = t.snakeCase.table(
  'session',
  {
    updatedAt: t
      .text()
      .$default(() => new Date().toISOString())
      .$onUpdate(() => new Date().toISOString()),
    createdAt: t
      .text()
      .$type<Date>()
      .$default(() => new Date()),
    userId: t
      .text()
      .notNull()
      .references(() => User.id),
    token: t.text().notNull().unique('session_token_unique_index'),
    id: t.text().primaryKey().default(Bun.randomUUIDv7()),
    activeOrganizationId: t.text(),
    expiresAt: t.text().notNull(),
    impersonatedBy: t.text(),
    activeTeamId: t.text(),
    ipAddress: t.text(),
    userAgent: t.text()
  },
  table => [t.index('session_user_id_index').on(table.userId)]
);

export const Organization = t.snakeCase.table('organization', {
  updatedAt: t
    .text()
    .$default(() => new Date().toISOString())
    .$onUpdate(() => new Date().toISOString()),
  createdAt: t
    .text()
    .$type<Date>()
    .$default(() => new Date()),
  slug: t.text().unique('organization_slug_unique_index').notNull(),
  id: t.text().primaryKey().default(Bun.randomUUIDv7()),
  name: t.text().notNull(),
  metadata: t.text(),
  logo: t.text()
});

export const TwoFactor = t.snakeCase.table(
  'two_factor',
  {
    updatedAt: t
      .text()
      .$default(() => new Date().toISOString())
      .$onUpdate(() => new Date().toISOString()),
    createdAt: t
      .text()
      .$type<Date>()
      .$default(() => new Date()),
    userId: t
      .text()
      .notNull()
      .references(() => User.id),
    id: t.text().primaryKey().default(Bun.randomUUIDv7()),
    verified: t.integer({ mode: 'boolean' }).notNull(),
    failedVerificationCount: t.integer().notNull(),
    backupCodes: t.text().notNull(),
    secret: t.text().notNull(),
    lockedUntil: t.text()
  },
  table => [t.index('two_factor_user_id_index').on(table.userId)]
);

export const TeamMember = t.snakeCase.table(
  'team_member',
  {
    updatedAt: t
      .text()
      .$default(() => new Date().toISOString())
      .$onUpdate(() => new Date().toISOString()),
    createdAt: t
      .text()
      .$type<Date>()
      .$default(() => new Date()),
    userId: t
      .text()
      .notNull()
      .references(() => User.id),
    teamId: t
      .text()
      .notNull()
      .references(() => Team.id),
    id: t.text().primaryKey().default(Bun.randomUUIDv7()),
    membershipKey: t.text()
  },
  table => [
    t.index('team_member_user_id_index').on(table.userId),
    t.index('team_member_team_id_index').on(table.teamId)
  ]
);

export const Member = t.snakeCase.table(
  'member',
  {
    updatedAt: t
      .text()
      .$default(() => new Date().toISOString())
      .$onUpdate(() => new Date().toISOString()),
    organizationId: t
      .text()
      .notNull()
      .references(() => Organization.id),
    createdAt: t
      .text()
      .$type<Date>()
      .$default(() => new Date()),
    userId: t
      .text()
      .notNull()
      .references(() => User.id),
    id: t.text().primaryKey().default(Bun.randomUUIDv7()),
    role: t.text().notNull()
  },
  table => [
    t.index('member_user_id_index').on(table.userId),
    t.index('member_organization_id_index').on(table.organizationId)
  ]
);

export const Team = t.snakeCase.table(
  'team',
  {
    updatedAt: t
      .text()
      .$default(() => new Date().toISOString())
      .$onUpdate(() => new Date().toISOString()),
    organizationId: t
      .text()
      .notNull()
      .references(() => Organization.id),
    createdAt: t
      .text()
      .$type<Date>()
      .$default(() => new Date()),
    id: t.text().primaryKey().default(Bun.randomUUIDv7()),
    memberCount: t.integer().notNull(),
    name: t.text().notNull()
  },
  table => [t.index('team_organization_id_index').on(table.organizationId)]
);

export const OrganizationRole = t.snakeCase.table(
  'organization_role',
  {
    updatedAt: t
      .text()
      .$default(() => new Date().toISOString())
      .$onUpdate(() => new Date().toISOString()),
    organizationId: t
      .text()
      .notNull()
      .references(() => Organization.id),
    createdAt: t
      .text()
      .$type<Date>()
      .$default(() => new Date()),
    id: t.text().primaryKey().default(Bun.randomUUIDv7()),
    permission: t.text().notNull(),
    role: t.text().notNull()
  },
  table => [
    t.index('organization_role_organization_id_index').on(table.organizationId)
  ]
);

export const Verification = t.snakeCase.table(
  'verification',
  {
    updatedAt: t
      .text()
      .$default(() => new Date().toISOString())
      .$onUpdate(() => new Date().toISOString()),
    createdAt: t
      .text()
      .$type<Date>()
      .$default(() => new Date()),
    id: t.text().primaryKey().default(Bun.randomUUIDv7()),
    identifier: t.text().notNull(),
    expiresAt: t.text().notNull(),
    value: t.text().notNull()
  },
  table => [t.index('verification_identifier_index').on(table.identifier)]
);

export const Invitation = t.snakeCase.table(
  'invitation',
  {
    updatedAt: t
      .text()
      .$default(() => new Date().toISOString())
      .$onUpdate(() => new Date().toISOString()),
    organizationId: t
      .text()
      .notNull()
      .references(() => Organization.id),
    createdAt: t
      .text()
      .$type<Date>()
      .$default(() => new Date()),
    inviterId: t
      .text()
      .notNull()
      .references(() => User.id),
    id: t.text().primaryKey().default(Bun.randomUUIDv7()),
    expiresAt: t.text().notNull(),
    status: t.text().notNull(),
    email: t.text().notNull(),
    teamId: t.text(),
    role: t.text()
  },
  table => [
    t.index('invitation_organization_id_index').on(table.organizationId),
    t.index('invitation_inviter_id_index').on(table.inviterId)
  ]
);

export const relations = defineRelations(
  {
    OrganizationRole,
    Organization,
    Verification,
    UserProfile,
    TeamMember,
    Invitation,
    TwoFactor,
    Account,
    Session,
    Member,
    User,
    Team
  },
  r => ({
    User: {
      profile: r.one.UserProfile({ to: r.UserProfile.userId, from: r.User.id }),
      invitations: r.many.Invitation(),
      teamMembers: r.many.TeamMember(),
      TwoFactor: r.many.TwoFactor(),
      sessions: r.many.Session(),
      accounts: r.many.Account(),
      members: r.many.Member()
    },
    Invitation: {
      organization: r.one.Organization({
        from: r.Invitation.organizationId,
        to: r.Organization.id
      }),
      inviter: r.one.User({ from: r.Invitation.inviterId, to: r.User.id })
    },
    Member: {
      organization: r.one.Organization({
        from: r.Member.organizationId,
        to: r.Organization.id
      }),
      user: r.one.User({ from: r.Member.userId, to: r.User.id })
    },
    Organization: {
      organizationRoles: r.many.OrganizationRole(),
      invitations: r.many.Invitation(),
      members: r.many.Member(),
      teams: r.many.Team()
    },
    TeamMember: {
      user: r.one.User({ from: r.TeamMember.userId, to: r.User.id }),
      team: r.one.Team({ from: r.TeamMember.teamId, to: r.Team.id })
    },
    OrganizationRole: {
      organization: r.one.Organization({
        from: r.OrganizationRole.organizationId,
        to: r.Organization.id
      })
    },
    Team: {
      organization: r.one.Organization({
        from: r.Team.organizationId,
        to: r.Organization.id
      })
    },
    UserProfile: {
      User: r.one.User({ from: r.UserProfile.userId, to: r.User.id })
    },
    TwoFactor: {
      user: r.one.User({ from: r.TwoFactor.userId, to: r.User.id })
    },
    Session: { user: r.one.User({ from: r.Session.userId, to: r.User.id }) },
    Account: { user: r.one.User({ from: r.Account.userId, to: r.User.id }) }
  })
);

export const schema = {
  OrganizationRole,
  Organization,
  Verification,
  UserProfile,
  TeamMember,
  Invitation,
  TwoFactor,
  Account,
  Session,
  Member,
  User,
  Team
};
