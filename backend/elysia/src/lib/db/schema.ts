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

export const user = t.snakeCase.table('user', {
  updatedAt: t
    .text()
    .$type<Date>()
    .$default(() => new Date())
    .$onUpdate(() => new Date())
    .notNull(),
  banExpires: t
    .text()
    .$type<Date>()
    .$default(() => new Date())
    .$onUpdate(() => new Date()),
  createdAt: t
    .text()
    .$type<Date>()
    .$default(() => new Date())
    .notNull(),
  emailVerified: t.integer({ mode: 'boolean' }).default(false).notNull(),
  phoneNumber: t.text().unique('user_phone_number_unique_index'),
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

export const userProfile = t.snakeCase.table(
  'user_profile',
  {
    updatedAt: t
      .text()
      .$type<Date>()
      .$default(() => new Date())
      .notNull(),
    createdAt: t
      .text()
      .$type<Date>()
      .$default(() => new Date())
      .notNull(),
    userId: t
      .text()
      .primaryKey()
      .references(() => user.id),
    phoneNumber: t.text().unique('user_profile_phone_number_unique_index'),
    gender: t.text().$type<Gender>(),
    address: t.text(),
    cover: t.text(),
    bio: t.text()
  },
  table => [t.index('user_profile_user_id_index').on(table.userId)]
);

export const account = t.snakeCase.table(
  'account',
  {
    updatedAt: t
      .text()
      .$type<Date>()
      .$default(() => new Date())
      .notNull(),
    createdAt: t
      .text()
      .$type<Date>()
      .$default(() => new Date())
      .notNull(),
    userId: t
      .text()
      .notNull()
      .references(() => user.id),
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

export const session = t.snakeCase.table(
  'session',
  {
    updatedAt: t
      .text()
      .$type<Date>()
      .$default(() => new Date())
      .notNull(),
    createdAt: t
      .text()
      .$type<Date>()
      .$default(() => new Date())
      .notNull(),
    userId: t
      .text()
      .notNull()
      .references(() => user.id),
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

export const organization = t.snakeCase.table('organization', {
  updatedAt: t
    .text()
    .$type<Date>()
    .$default(() => new Date())
    .notNull(),
  createdAt: t
    .text()
    .$type<Date>()
    .$default(() => new Date())
    .notNull(),
  slug: t.text().unique('organization_slug_unique_index').notNull(),
  id: t.text().primaryKey().default(Bun.randomUUIDv7()),
  name: t.text().notNull(),
  metadata: t.text(),
  logo: t.text()
});

export const twoFactor = t.snakeCase.table(
  'two_factor',
  {
    updatedAt: t
      .text()
      .$type<Date>()
      .$default(() => new Date())
      .notNull(),
    createdAt: t
      .text()
      .$type<Date>()
      .$default(() => new Date())
      .notNull(),
    userId: t
      .text()
      .notNull()
      .references(() => user.id),
    verified: t.integer({ mode: 'boolean' }).default(true),
    id: t.text().primaryKey().default(Bun.randomUUIDv7()),
    failedVerificationCount: t.integer().default(0),
    backupCodes: t.text().notNull(),
    secret: t.text().notNull(),
    lockedUntil: t.text()
  },
  table => [t.index('two_factor_user_id_index').on(table.userId)]
);

export const teamMember = t.snakeCase.table(
  'team_member',
  {
    updatedAt: t
      .text()
      .$type<Date>()
      .$default(() => new Date())
      .notNull(),
    createdAt: t
      .text()
      .$type<Date>()
      .$default(() => new Date())
      .notNull(),
    userId: t
      .text()
      .notNull()
      .references(() => user.id),
    teamId: t
      .text()
      .notNull()
      .references(() => team.id),
    id: t.text().primaryKey().default(Bun.randomUUIDv7()),
    membershipKey: t.text()
  },
  table => [
    t.index('team_member_user_id_index').on(table.userId),
    t.index('team_member_team_id_index').on(table.teamId)
  ]
);

export const member = t.snakeCase.table(
  'member',
  {
    updatedAt: t
      .text()
      .$type<Date>()
      .$default(() => new Date())
      .notNull(),
    createdAt: t
      .text()
      .$type<Date>()
      .$default(() => new Date())
      .notNull(),
    organizationId: t
      .text()
      .notNull()
      .references(() => organization.id),
    userId: t
      .text()
      .notNull()
      .references(() => user.id),
    id: t.text().primaryKey().default(Bun.randomUUIDv7()),
    role: t.text().notNull()
  },
  table => [
    t.index('member_user_id_index').on(table.userId),
    t.index('member_organization_id_index').on(table.organizationId)
  ]
);

export const team = t.snakeCase.table(
  'team',
  {
    updatedAt: t
      .text()
      .$type<Date>()
      .$default(() => new Date())
      .notNull(),
    createdAt: t
      .text()
      .$type<Date>()
      .$default(() => new Date())
      .notNull(),
    organizationId: t
      .text()
      .notNull()
      .references(() => organization.id),
    id: t.text().primaryKey().default(Bun.randomUUIDv7()),
    memberCount: t.integer().notNull(),
    name: t.text().notNull()
  },
  table => [t.index('team_organization_id_index').on(table.organizationId)]
);

export const organizationRole = t.snakeCase.table(
  'organization_role',
  {
    updatedAt: t
      .text()
      .$type<Date>()
      .$default(() => new Date())
      .notNull(),
    createdAt: t
      .text()
      .$type<Date>()
      .$default(() => new Date())
      .notNull(),
    organizationId: t
      .text()
      .notNull()
      .references(() => organization.id),
    id: t.text().primaryKey().default(Bun.randomUUIDv7()),
    permission: t.text().notNull(),
    role: t.text().notNull()
  },
  table => [
    t.index('organization_role_organization_id_index').on(table.organizationId)
  ]
);

export const verification = t.snakeCase.table(
  'verification',
  {
    updatedAt: t
      .text()
      .$type<Date>()
      .$default(() => new Date())
      .notNull(),
    createdAt: t
      .text()
      .$type<Date>()
      .$default(() => new Date())
      .notNull(),
    id: t.text().primaryKey().default(Bun.randomUUIDv7()),
    identifier: t.text().notNull(),
    expiresAt: t.text().notNull(),
    value: t.text().notNull()
  },
  table => [t.index('verification_identifier_index').on(table.identifier)]
);

export const invitation = t.snakeCase.table(
  'invitation',
  {
    updatedAt: t
      .text()
      .$type<Date>()
      .$default(() => new Date())
      .notNull(),
    createdAt: t
      .text()
      .$type<Date>()
      .$default(() => new Date())
      .notNull(),
    expiresAt: t
      .text()
      .$type<Date>()
      .$default(() => new Date())
      .notNull(),
    organizationId: t
      .text()
      .notNull()
      .references(() => organization.id),
    inviterId: t
      .text()
      .notNull()
      .references(() => user.id),
    id: t.text().primaryKey().default(Bun.randomUUIDv7()),
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
    organizationRole,
    organization,
    verification,
    userProfile,
    teamMember,
    invitation,
    twoFactor,
    account,
    session,
    member,
    user,
    team
  },
  r => ({
    user: {
      profile: r.one.userProfile({ to: r.userProfile.userId, from: r.user.id }),
      invitations: r.many.invitation(),
      teamMembers: r.many.teamMember(),
      TwoFactor: r.many.twoFactor(),
      sessions: r.many.session(),
      accounts: r.many.account(),
      members: r.many.member()
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
    organization: {
      organizationRoles: r.many.organizationRole(),
      invitations: r.many.invitation(),
      members: r.many.member(),
      teams: r.many.team()
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
    team: {
      organization: r.one.organization({
        from: r.team.organizationId,
        to: r.organization.id
      })
    },
    userProfile: {
      User: r.one.user({ from: r.userProfile.userId, to: r.user.id })
    },
    twoFactor: {
      user: r.one.user({ from: r.twoFactor.userId, to: r.user.id })
    },
    session: { user: r.one.user({ from: r.session.userId, to: r.user.id }) },
    account: { user: r.one.user({ from: r.account.userId, to: r.user.id }) }
  })
);

export const schema = {
  organizationRole,
  organization,
  verification,
  userProfile,
  teamMember,
  invitation,
  twoFactor,
  account,
  session,
  member,
  user,
  team
};
