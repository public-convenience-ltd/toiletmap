module.exports = {
  async up(db, client) {
    await db.collection('newreports').updateMany(
      {
        'diff.paymentRequired': true,
      },
      {
        $set: {
          'diff.noPayment': false,
        },
      }
    );
    await db.collection('newreports').updateMany(
      {
        'diff.paymentRequired': { $exists: false },
      },
      {
        $set: {
          'diff.noPayment': true,
        },
      }
    );
    await db.collection('newreports').updateMany(
      {
        'diff.paymentRequired': { $exists: true },
      },
      {
        $unset: {
          'diff.paymentRequired': '',
        },
      }
    );
  },

  async down(db, client) {
    return null;
  },
};
