require('dotenv/config');
const express = require('express');
const pg = require('pg');
const format = require('pg-format');

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
      where unaccent(lower("title")) ilike '%' ||  unaccent('${query}') || '%'
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

app.get('/api/filter/:tag/:genre/:musicalStyle', (req, res, next) => {
  const tag = req.params.tag.split(',').map(el => parseInt(el));
  const genre = req.params.genre.split(',').map(el => parseInt(el));
  const musicalStyle = req.params.musicalStyle.split(',').map(el => parseInt(el));
  if (tag && genre && musicalStyle) {
    const sql = `
      select "musicals"."title",
      "musicals"."musicalId",
      "musicals"."imageUrl",
      "musicals"."musicUrl"
      from "musicals"
      join "musicalTags" using ("musicalId")
      join "musicalGenres" using ("musicalId")
      join "musicalStyleCategories" using ("musicalId")
      left join (select unnest(array[${tag}]) as "tagId") as "tagIds" using ("tagId")
      left join (select unnest(array[${genre}]) as "genreId") as "genreIds" using ("genreId")
      left join (select unnest(array[${musicalStyle}]) as "musicalStyleId") as "musicalStyleIds" using ("musicalStyleId")
      where "tagIds"."tagId" is not null and
      "genreIds"."genreId" is not null and
      "musicalStyleIds"."musicalStyleId" is not null
  group by "musicals"."musicalId"
  having count(distinct "musicalTags"."tagId") = ${tag.length} and
        count(distinct "musicalGenres"."genreId") = ${genre.length} and
        count(distinct "musicalStyleCategories"."musicalStyleId") = ${musicalStyle.length}
    `;
    db.query(sql)
      .then(result => res.json(result.rows))
      .catch(err => next(err));
  }
});

app.get('/api/musicals/:musicalId', (req, res, next) => {
  const { musicalId } = req.params;
  const sql = `
      select *
      from "musicals"
      where "musicalId" = $1
      `;
  const params = [musicalId];
  db.query(sql, params)
    .then(result => {
      const musical = result.rows[0];
      if (!musical) {
        next(new ClientError(`musicalId ${musicalId} does not exist`, 400));
      } else {
        res.json(musical);
      }
    })
    .catch(err => next(err));
});

app.get('/api/musicals/:musicalId/related', (req, res, next) => {
  const { musicalId } = req.params;
  const sql = `
  with "allMatches" as (
  select "om"."title",
         "om"."musicalId",
         "om"."imageUrl",
         count (distinct "mt"."tagId") as "matches"
    from "musicals" as "om"
    join "musicalTags" as "mt"
      on "om"."musicalId" = "mt"."musicalId"
    join (
      select "tagId"
        from "musicals"
        join "musicalTags" using ("musicalId")
       where "musicals"."musicalId" = $1
    ) as "selectedTags"
      on "selectedTags"."tagId" = "mt"."tagId"
   where "om"."musicalId" != $1
   group by "om"."musicalId"
  union all
  select "om"."title",
         "om"."musicalId",
         "om"."imageUrl",
         count (distinct "msc"."musicalStyleId") as "matches"
    from "musicals" as "om"
    join "musicalStyleCategories" as "msc"
      on "om"."musicalId" = "msc"."musicalId"
    join (
      select "musicalStyleId"
        from "musicals"
        join "musicalStyleCategories" using ("musicalId")
       where "musicals"."musicalId" = $1
    ) as "selectedStyles"
      on "selectedStyles"."musicalStyleId" = "msc"."musicalStyleId"
   where "om"."musicalId" != $1
   group by "om"."musicalId"
  union all
  select "om"."title",
         "om"."musicalId",
         "om"."imageUrl",
         count (distinct "mg"."genreId") as "matches"
    from "musicals" as "om"
    join "musicalGenres" as "mg"
      on "om"."musicalId" = "mg"."musicalId"
    join (
      select "genreId"
        from "musicals"
        join "musicalGenres" using ("musicalId")
       where "musicals"."musicalId" = $1
    ) as "selectedGenres"
      on "selectedGenres"."genreId" = "mg"."genreId"
   where "om"."musicalId" != $1
   group by "om"."musicalId"
  )
  select "musicalId",
         "title",
         "imageUrl",
         sum("matches") as "relevance"
    from "allMatches"
   group by "musicalId", "title", "imageUrl"
   order by "relevance" desc
   limit 10
  `;
  const params = [musicalId];
  db.query(sql, params)
    .then(result => {
      const musical = result.rows;
      if (musical.length === 0) {
        next(new ClientError(`musicalId ${musicalId} does not exist`, 400));
      } else {
        res.json(musical);
      }
    })
    .catch(err => next(err));
});

app.post('/api/signup', (req, res, next) => {
  const { username } = req.body;
  const sql = `
  select "username",
          "userId"
    from "users"
    where "username" = $1
  `;
  const params = [username];
  db.query(sql, params)
    .then(result => {
      if (result.rows.length === 0) {
        const sql = `
          insert into "users" ("userId", "username")
              values  (default, $1)
            returning *
        `;
        return db.query(sql, params)
          .then(result => {
            return result.rows[0];
          });
      } else {
        return result.rows[0];
      }
    })
    .then(result => {
      req.session.userId = result.userId;
      res.json(result);
    })
    .catch(err => next(err));
});

app.post('/api/questionaire/seeds', (req, res, next) => {
  const { genreSeeds, musicalStyleSeeds } = req.body;
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
              return result.rows;
            })
            .catch(err => next(err));
        }
      })
      .then(data => res.json(data))
      .catch(err => next(err));
  }
});

app.get('/api/questionaire/seedMusicals/:userId', (req, res, next) => {

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
