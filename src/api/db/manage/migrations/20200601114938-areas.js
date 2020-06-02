module.exports = {
  async up(db, client) {
    await db.collection('newreports').updateMany(
      {
        'diff.area': { $exists: true },
      },
      {
        $unset: { 'diff.area': '' },
      }
    );
  },

  async down(db, client) {
    return null;
  },
};
