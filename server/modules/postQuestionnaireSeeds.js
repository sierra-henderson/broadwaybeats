const db = require('../database');
const ClientError = require('../client-error');
const pg = require('pg');
const format = require('pg-format');

const postQuestionnaireSeeds = (req, res, next) => {
  const { g, ms } = req.body;
  const genreSeeds = g.map(el => [req.session.userId, el]);
  const musicalStyleSeeds = ms.map(el => [req.session.userId, el]);
  if (genreSeeds.length === 0 || musicalStyleSeeds.length === 0) {
    next(new ClientError('You must choose at least one of each category', 400));
  } else {
    const sql = `
    select "userId",
          "genreId",
          "musicalStyleId"
        from "genreSeeds"
        join "musicalStyleSeeds" using ("userId")
      where "userId" = $1;
    `;
    const params = [genreSeeds[0][0]];
    db.query(sql, params)
      .then(result => {
        if (result.rows.length !== 0) {
          next(new ClientError(`user with id ${params} already filled out the questionaire`, 400));
        } else {
          const sql = format(`
          insert into "genreSeeds" ("userId", "genreId")
              values %L
              returning *;
          insert into "musicalStyleSeeds" ("userId", "musicalStyleId")
              values %L
              returning *
          `, genreSeeds, musicalStyleSeeds);
          const client = new pg.Client({
            connectionString: process.env.DATABASE_URL
          });
          client.connect();
          return client.query(sql)
            .then(result => {
              return [result[0].rows, result[1].rows];
            })
            .catch(err => next(err));
        }
      })
      .then(data => res.status(201).json(data))
      .catch(err => next(err));
  }
};

module.exports = postQuestionnaireSeeds;
