function checkRole(user, role) {
  if (user && !role) {
    return true;
  }

  //First try getting permissions from the storage on the user object
  let permissions = user[process.env.AUTH0_PERMISSIONS_KEY] || '';

  // Next try the scopes field in case our user is a machine-to-machine token
  if (!permissions) {
    permissions = user.scope || '';
  }

  return permissions.includes(role);
}

export default checkRole;
