module.exports = {
  async up(db, client) {
    const CLOSED = 'CLOSED';

    // Start with some tidying
    await db.collection('newreports').updateMany(
      {
        'diff.opening': null,
      },
      {
        $unset: { 'diff.opening': '' },
      }
    );

    let updates = 0;
    let skips = 0;

    let sevendayR = /([0-2][0-9]:[0-5][0-9])-([0-2][0-9]:[0-5][0-9])/;
    let somedaysR = /([a-z][a-z])-([a-z][a-z]) ([0-2][0-9]:[0-5][0-9])-([0-2][0-9]:[0-5][0-9])/i;

    let reps = await db.collection('newreports').find({
      'diff.opening': { $exists: true },
    });

    let rep;
    while ((rep = await reps.next())) {
      let opening = null;

      let sevenday = rep.diff.opening.match(sevendayR);
      if (sevenday) {
        let open = [sevenday[1], sevenday[2]];
        opening = [open, open, open, open, open, open, open];
      }

      let somedays = rep.diff.opening.match(somedaysR);
      if (somedays) {
        let days = [somedays[1].toLowerCase(), somedays[2].toLowerCase()];
        let open = [somedays[3], somedays[4]];
        switch (days.join('')) {
          case 'moth':
            opening = [open, open, open, open, CLOSED, CLOSED, CLOSED];
            break;
          case 'mofr':
            opening = [open, open, open, open, open, CLOSED, CLOSED];
            break;
          case 'mosa':
            opening = [open, open, open, open, open, open, CLOSED];
            break;
          case 'mosu':
            opening = [open, open, open, open, open, open, open];
            break;
          default:
            opening = null;
        }
      }

      if (rep.diff.opening === '24/7') {
        let open = ['00:00', '00:00'];
        opening = [open, open, open, open, open, open, open];
      }

      if (opening) {
        await db.collection('newreports').findOneAndUpdate(
          {
            _id: rep._id,
          },
          {
            $set: {
              'diff.opening': opening,
            },
          }
        );
        updates += 1;
      } else {
        skips += 1;
        console.log(rep._id);
        await db.collection('newreports').findOneAndUpdate(
          {
            _id: rep._id,
          },
          {
            $set: {
              'diff.notes': rep.diff.notes
                ? `${rep.diff.notes}\nHours: ${rep.diff.opening}`
                : rep.diff.opening,
            },
            $unset: {
              'diff.opening': '',
            },
          }
        );
      }
    }
    console.log(`${updates} updated, ${skips} skipped`);
  },

  async down(db, client) {
    return false;
  },
};
