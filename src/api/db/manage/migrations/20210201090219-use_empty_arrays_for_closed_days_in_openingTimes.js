module.exports = {
  async up(db, client) {
    let reps = await db.collection('newreports').find({
      'diff.openingTimes': { $exists: true },
    });
    let updates = 0;
    let rep;
    while ((rep = await reps.next())) {
      if (rep.diff.openingTimes && rep.diff.openingTimes.includes('CLOSED')) {
        await db.collection('newreports').findOneAndUpdate(
          {
            _id: rep._id,
          },
          {
            $set: {
              'diff.openingTimes': rep.diff.openingTimes.map((day) =>
                day === 'CLOSED' ? [] : day
              ),
            },
          }
        );
      }
      updates += 1;
    }
    console.log(`${updates} updated`);
  },

  async down(db, client) {
    let reps = await db.collection('newreports').find({
      'diff.openingTimes': { $exists: true },
    });
    let updates = 0;
    let rep;
    while ((rep = await reps.next())) {
      if (rep.diff.openingTimes.find((e) => e.length === 0)) {
        await db.collection('newreports').findOneAndUpdate(
          {
            _id: rep._id,
          },
          {
            $set: {
              'diff.openingTimes': rep.diff.openingTimes.map((day) =>
                day.length === 0 ? 'CLOSED' : day
              ),
            },
          }
        );
      }
      updates += 1;
    }
    console.log(`${updates} updated`);
  },
};
