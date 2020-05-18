module.exports = {
  async up(db, client) {
    await db.collection('newreports').updateMany(
      {
        'diff.accessibleType': null,
      },
      {
        $set: { 'diff.accessibleType': 'none' },
      }
    );
    await db.collection('newreports').updateMany(
      {
        'diff.accessibleType': '',
      },
      {
        $unset: { 'diff.accessibleType': '' },
      }
    );
    await db.collection('newreports').updateMany(
      {
        'diff.accessibleType': 'none',
      },
      {
        $set: { 'diff.accessible': false },
        $unset: { 'diff.accessibleType': '' },
      }
    );
    await db.collection('newreports').updateMany(
      {
        'diff.accessibleType': { $exists: true },
      },
      {
        $set: { 'diff.accessible': true },
        $unset: { 'diff.accessibleType': '' },
      }
    );
  },

  async down(db, client) {
    return null;
  },
};
