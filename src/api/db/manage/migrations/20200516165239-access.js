module.exports = {
  async up(db, client) {
    // find reports with access none/private and convert them to "active : false"
    await db.collection('newreports').updateMany(
      {
        'diff.access': { $in: ['none', 'private'] },
      },
      {
        $set: { 'diff.active': false },
        $unset: { 'diff.access': '' },
      }
    );
    // now find the remainder and ensure they are active: true
    await db.collection('newreports').updateMany(
      {
        'diff.access': { $exists: true },
      },
      {
        $set: { 'diff.active': true },
        $unset: { 'diff.access': '' },
      }
    );
  },

  async down(db, client) {
    return null;
  },
};
