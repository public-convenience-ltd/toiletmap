module.exports = {
  async up(db, client) {
    await db.collection('newreports').updateMany(
      {
        'diff.type': 'unisex',
      },
      {
        $set: { 'diff.allGender': true },
      }
    );
  },

  async down(db, client) {
    return null;
  },
};
