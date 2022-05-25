const config = require('../config');

function checkRole(user, role) {
  if (user && !role) {
    return true;
  }
  //First try getting permissions from the storage on the user object
  let permissions = user[config.auth0.permissionsKey] || '';
  // Next try the scopes field in case our user is a machine-to-machine token
  if (!permissions) {
    permissions = user.scope || '';
  }
  return permissions.includes(role);
}

module.exports = checkRole;
