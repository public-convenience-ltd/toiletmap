import { JWTUser } from '../graphql/context';

function checkRole(user: JWTUser, role: string | undefined): boolean {
  if (user && !role) {
    return true;
  }
  // First try getting permissions from the storage on the user object
  let permissions: string =
    (user[process.env.AUTH0_PERMISSIONS_KEY as string] as string) || '';
  // Next try the scopes field in case our user is a machine-to-machine token
  if (!permissions) {
    permissions = (user.scope as string) || '';
  }
  return permissions.includes(role || '');
}

export default checkRole;
