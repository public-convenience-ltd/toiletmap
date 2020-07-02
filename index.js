const express = require('express');
const app = express();

// Redirect to toiletmap.org.uk
app.use((req, res, next) => {
    if (req.hostname !== 'www.toiletmap.org.uk') {
      res.redirect(301, 'https://www.toiletmap.org.uk' + req.originalUrl);
    } else if (req.headers['x-forwarded-proto'] !== 'https') {
      res.redirect(301, 'https://www.toiletmap.org.uk' + req.originalUrl);
    } else {
      next();
    }
});

app.listen(process.env.PORT);