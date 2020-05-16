module.exports = {
  async up(db, client) {
    await db
      .collection('newreports')
      .updateMany(
        { contributor: 'GBPTM' },
        { $set: { contributor: 'toiletmap.org.uk' } }
      );
    await db
      .collection('newreports')
      .updateMany(
        { contributor: 'Great British Public Toilet Map' },
        { $set: { contributor: 'toiletmap.org.uk' } }
      );
    await db
      .collection('newreports')
      .updateMany(
        { contributor: 'GB Public Toilet Map' },
        { $set: { contributor: 'toiletmap.org.uk' } }
      );
  },

  async down(db, client) {
    return null;
  },
};
