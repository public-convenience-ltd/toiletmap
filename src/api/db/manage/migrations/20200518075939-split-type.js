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
        $set: { 'diff.women': true, 'diff.men': true },
        $unset: { 'diff.type': '' },
      }
    );
    await db.collection('newreports').updateMany(
      {
        'diff.type': 'female',
      },
      {
        $set: { 'diff.women': true },
        $unset: { 'diff.type': '' },
      }
    );
    await db.collection('newreports').updateMany(
      {
        'diff.type': 'male',
      },
      {
        $set: { 'diff.men': true },
        $unset: { 'diff.type': '' },
      }
    );
    await db.collection('newreports').updateMany(
      {
        'diff.type': 'children only',
      },
      {
        $set: {
          'diff.children': true,
          'diff.men': false,
          'diff.women': false,
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
          'diff.men': true,
          'diff.women': false,
        },
        $unset: { 'diff.type': '' },
      }
    );
  },

  async down(db, client) {
    return null;
  },
};
