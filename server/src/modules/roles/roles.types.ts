export enum RolesType {
  USER = 'USER',
  MODERATOR = 'MODERATOR',
  ADMIN = 'ADMIN',
}

export type Role = RolesType.USER | RolesType.MODERATOR | RolesType.ADMIN;
