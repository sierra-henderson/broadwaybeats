require('dotenv/config');
const express = require('express');

const db = require('./database');
const ClientError = require('./client-error');
const staticMiddleware = require('./static-middleware');
const sessionMiddleware = require('./session-middleware');
const _ = require('lodash');

const app = express();

app.use(staticMiddleware);
app.use(sessionMiddleware);

app.use(express.json());

app.get('/api/health-check', (req, res, next) => {
  db.query('select \'successfully connected\' as "message"')
    .then(result => res.json(result.rows[0]))
    .catch(err => next(err));
});

app.get('/api/search/:query', (req, res, next) => {
  const { query } = req.params;
  if (query === '' || query === ' ') {
    next(new ClientError('query must contain a non-whitespace character', 400));

  } else {
    const sql = `
      select "title",
          "imageUrl",
          "musicUrl",
          "musicalId"
      from "musicals"
      where unaccent(lower("title")) like '%' ||  unaccent('${query}') || '%'
      `;

    db.query(sql)
      .then(result => {
        const [one, two] = _.partition(result.rows, obj => {
          return obj.title.toLowerCase().replace('the ', '').replace('a ', '').startsWith(query);
        });
        res.json(one.concat(two));
      });
  }
});

app.use('/api', (req, res, next) => {
  next(new ClientError(`cannot ${req.method} ${req.originalUrl}`, 404));
});

app.use((err, req, res, next) => {
  if (err instanceof ClientError) {
    res.status(err.status).json({ error: err.message });
  } else {
    console.error(err);
    res.status(500).json({
      error: 'an unexpected error occurred'
    });
  }
});

app.listen(process.env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log('Listening on port', process.env.PORT);
});