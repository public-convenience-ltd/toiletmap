module.exports = {
  async up(db, client) {
    await db.collection('newreports').updateMany(
      {
        'diff.fee': { $exists: true },
      },
      {
        $set: {
          'diff.paymentRequired': true,
        },
        $rename: { 'diff.fee': 'diff.paymentDetails' },
      }
    );
  },

  async down(db, client) {
    return null;
  },
};
