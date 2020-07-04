const ClientError = require('../client-error');
const pg = require('pg');
const format = require('pg-format');

const postQuestionnaireLikes = (req, res, next) => {
  const { lm } = req.body;
  const likedMusicals = lm.map(el => [req.session.userId, el, true]);
  if (likedMusicals.length === 0) {
    next(new ClientError('You must like at least one musical', 400));
  } else {
    const sql = format(`
          insert into "likedMusicals" ("userId", "musicalId", "like")
              values %L
              returning *;
          `, likedMusicals);
    const client = new pg.Client({
      connectionString: process.env.DATABASE_URL
    });
    client.connect();
    client.query(sql)
      .then(result => {
        res.status(201).json(result.rows);
      })
      .catch(err => next(err));
  }
};

module.exports = postQuestionnaireLikes;
