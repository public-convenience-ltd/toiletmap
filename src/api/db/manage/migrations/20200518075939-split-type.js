module.exports = {
  async up(db, client) {
    // Take the various values of the "type" attribute and split them out
    await db.collection('newreports').updateMany(
      {
        'diff.type': '',
      },
      {
        $unset: { 'diff.access': '' },
      }
    );
    await db.collection('newreports').updateMany(
      {
        'diff.type': 'none',
      },
      {
        $unset: { 'diff.type': '' },
      }
    );
    await db.collection('newreports').updateMany(
      {
        'diff.type': null,
      },
      {
        $unset: { 'diff.type': '' },
      }
    );
    await db.collection('newreports').updateMany(
      {
        'diff.type': 'unisex',
      },
      {
        $unset: { 'diff.type': '' },
        $set: { 'diff.allGender': true },
      }
    );
    await db.collection('newreports').updateMany(
      {
        'diff.type': 'female and male',
      },
      {
        $set: { 'diff.female': true, 'diff.male': true },
        $unset: { 'diff.type': '' },
      }
    );
    await db.collection('newreports').updateMany(
      {
        'diff.type': 'female',
      },
      {
        $set: { 'diff.female': true },
        $unset: { 'diff.type': '' },
      }
    );
    await db.collection('newreports').updateMany(
      {
        'diff.type': 'male',
      },
      {
        $set: { 'diff.male': true },
        $unset: { 'diff.type': '' },
      }
    );
    await db.collection('newreports').updateMany(
      {
        'diff.type': 'children only',
      },
      {
        $set: {
          'diff.childrenOnly': true,
          'diff.male': false,
          'diff.female': false,
        },
        $unset: { 'diff.type': '' },
      }
    );
    await db.collection('newreports').updateMany(
      {
        'diff.type': 'male urinal',
      },
      {
        $set: {
          'diff.urinalOnly': true,
          'diff.male': true,
          'diff.female': false,
        },
        $unset: { 'diff.type': '' },
      }
    );
  },

  async down(db, client) {
    return null;
  },
};
