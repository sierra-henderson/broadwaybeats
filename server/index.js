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
    where lower("username") = lower($1)
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
});

app.get('/api/questionaire/seedMusicals', (req, res, next) => {
  const { userId } = req.session;
  const sql = `
  with "allMatches" as (
  select "om"."title",
         "om"."musicalId",
         "om"."imageUrl",
         count (distinct "msc"."musicalStyleId") as "matches"
    from "musicals" as "om"
    join "musicalStyleCategories" as "msc"
      on "om"."musicalId" = "msc"."musicalId"
    join (
      select "musicalStyleId"
        from "musicalStyleSeeds"
       where "musicalStyleSeeds"."userId" = $1
    ) as "userStyleSeeds"
      on "userStyleSeeds"."musicalStyleId" = "msc"."musicalStyleId"
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
        from "genreSeeds"
       where "genreSeeds"."userId" = $1
    ) as "userGenreSeeds"
      on "userGenreSeeds"."genreId" = "mg"."genreId"
   group by "om"."musicalId"
  )
  select "musicalId",
         "title",
         "imageUrl",
         sum("matches") as "relevance"
    from "allMatches"
   group by "musicalId", "title", "imageUrl"
   order by "relevance" desc
   limit 30
  `;
  const params = [userId];
  db.query(sql, params)
    .then(result => {
      if (result.rows.length === 0) {
        next(new ClientError(`userlId ${userId} has not provided enough information to get recommendations`, 400));
      } else {
        res.json(result.rows);
      }
    });
});

app.post('/api/questionaire/like', (req, res, next) => {
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
});

app.get('/api/recommendations', (req, res, next) => {
  const { userId } = req.session;
  if (isNaN(parseInt(userId))) {
    next(new ClientError('userId must be an integer', 400));
  }
  const sql = `
  with "topCategories" as (
  select "mt"."tagId" as "id",
        'tag' as "category",
        count("mt".*) as "totalInstances"
    from "likedMusicals" as "lm"
    join "musicalTags" as "mt" using ("musicalId")
    where "lm"."userId" = $1
  group by "mt"."tagId"
union all
select "msc"."musicalStyleId" as "id",
      'musical style' as "category",
      count("msc".*) as "totalInstances"
    from "likedMusicals" as "lm"
    join "musicalStyleCategories" as "msc" using ("musicalId")
    where "lm"."userId" = $1
  group by "msc"."musicalStyleId"
union all
select "mg"."genreId" as "id",
      'genre' as "category",
      count("mg".*) as "totalInstances"
    from "likedMusicals" as "lm"
    join "musicalGenres" as "mg" using ("musicalId")
    where "lm"."userId" = $1
  group by "mg"."genreId"
  order by "totalInstances" desc
    limit 5
), "matchedByTag" as (
  select "m"."musicalId",
         "m"."title",
         "m"."imageUrl"
      from "musicals" as "m"
      join "musicalTags" as "mt" using ("musicalId")
      join "topCategories" as "tc"
      on "mt"."tagId" = "tc"."id" and
        "tc"."category" = 'tag'
), "matchedByGenre" as (
  select "m"."musicalId",
         "m"."title",
         "m"."imageUrl"
      from "musicals" as "m"
      join "musicalGenres" as "mg" using ("musicalId")
      join "topCategories" as "tc"
      on "mg"."genreId" = "tc"."id" and
        "tc"."category" = 'genre'
), "matchedByMusicalStyle" as (
  select "m"."musicalId",
         "m"."title",
         "m"."imageUrl"
      from "musicals" as "m"
      join "musicalStyleCategories" as "msc" using ("musicalId")
      join "topCategories" as "tc"
      on "msc"."musicalStyleId" = "tc"."id" and
        "tc"."category" = 'musical style'
), "allMatches" as (
  select *
    from "matchedByTag"
  union all
  select *
    from "matchedByGenre"
  union all
  select *
    from "matchedByMusicalStyle"
)
select "am"."musicalId",
       "am"."title",
       "am"."imageUrl",
       count(*) as "relevance"
  from "allMatches" as "am"
  where "am"."musicalId" not in (
    select "musicalId"
      from "likedMusicals"
      where "userId" = $1
  )
 group by "am"."musicalId", "am"."title", "am"."imageUrl"
 order by "relevance" desc
 limit 20
  `;
  const params = [userId];
  db.query(sql, params)
    .then(result => {
      if (result.rows.length === 0) {
        res.json({ error: 'You must like at least one musical to get recommendations' });
      } else {
        res.json(result.rows);
      }
    })
    .catch(err => next(err));
});

app.get('/api/musicals/:musicalId/like', (req, res, next) => {
  const { musicalId } = req.params;
  const { userId } = req.session;
  if (isNaN(parseInt(musicalId))) {
    next(new ClientError('musicalId must be an integer', 400));
  }
  const sql = `
  select *
  from "likedMusicals"
  where "userId" = $1 and
    "musicalId" = $2
  `;
  const params = [userId, musicalId];
  db.query(sql, params)
    .then(result => {
      if (result.rows[0]) {
        res.json(result.rows[0]);
      } else {
        const obj = {
          like: null,
          musicalId,
          userId
        };
        res.json(obj);
      }
    })
    .catch(err => next(err));
});

app.post('/api/musicals/:musicalId/like', (req, res, next) => {
  const { musicalId } = req.params;
  const { userId } = req.session;
  if (isNaN(parseInt(userId))) {
    next(new ClientError('userId must be an integer', 400));
  }
  if (isNaN(parseInt(musicalId))) {
    next(new ClientError('musicalId must be an integer', 400));
  }
  const sql = `
  select *
  from "likedMusicals"
  where "userId" = $1 and
    "musicalId" = $2 and
    "like" = true
  `;
  const params = [userId, musicalId];
  db.query(sql, params)
    .then(result => {
      if (result.rows.length > 0) {
        next(new ClientError(`Musical with id ${musicalId} has already been liked by user with id ${userId}`, 400));
      } else {
        const sql = `
        insert into "likedMusicals" ("userId", "musicalId", "like")
        values ($1, $2, true)
        returning *
        `;
        return db.query(sql, params)
          .then(result => {
            return res.status(201).json(result.rows[0]);
          })
          .catch(err => next(err));
      }
    })
    .catch(err => next(err));
});

app.delete('/api/musicals/:musicalId/like', (req, res, next) => {
  const { musicalId } = req.params;
  const { userId } = req.session;
  if (isNaN(parseInt(userId))) {
    next(new ClientError('userId must be an integer', 400));
  }
  if (isNaN(parseInt(musicalId))) {
    next(new ClientError('musicalId must be an integer', 400));
  }
  const sql = `
    delete from "likedMusicals"
      where "userId" = $1 and
      "musicalId" = $2
  `;
  const params = [userId, musicalId];
  db.query(sql, params)
    .then(result => {
      const obj = {
        like: null,
        musicalId,
        userId
      };
      res.json(obj);
    })
    .catch(err => next(err));
});

app.get('/api/home', (req, res, next) => {
  const { userId } = req.session;
  const params = [userId];
  if (isNaN(parseInt(userId))) {
    next(new ClientError('userId must be an integer', 400));
  }
  const getRecommendations = () => {
    let recommendations;
    const sql = `
  with "topCategories" as (
  select "mt"."tagId" as "id",
        'tag' as "category",
        count("mt".*) as "totalInstances"
    from "likedMusicals" as "lm"
    join "musicalTags" as "mt" using ("musicalId")
    where "lm"."userId" = $1
  group by "mt"."tagId"
union all
select "msc"."musicalStyleId" as "id",
      'musical style' as "category",
      count("msc".*) as "totalInstances"
    from "likedMusicals" as "lm"
    join "musicalStyleCategories" as "msc" using ("musicalId")
    where "lm"."userId" = $1
  group by "msc"."musicalStyleId"
union all
select "mg"."genreId" as "id",
      'genre' as "category",
      count("mg".*) as "totalInstances"
    from "likedMusicals" as "lm"
    join "musicalGenres" as "mg" using ("musicalId")
    where "lm"."userId" = $1
  group by "mg"."genreId"
  order by "totalInstances" desc
    limit 5
), "matchedByTag" as (
  select "m"."musicalId",
         "m"."title",
         "m"."imageUrl"
      from "musicals" as "m"
      join "musicalTags" as "mt" using ("musicalId")
      join "topCategories" as "tc"
      on "mt"."tagId" = "tc"."id" and
        "tc"."category" = 'tag'
), "matchedByGenre" as (
  select "m"."musicalId",
         "m"."title",
         "m"."imageUrl"
      from "musicals" as "m"
      join "musicalGenres" as "mg" using ("musicalId")
      join "topCategories" as "tc"
      on "mg"."genreId" = "tc"."id" and
        "tc"."category" = 'genre'
), "matchedByMusicalStyle" as (
  select "m"."musicalId",
         "m"."title",
         "m"."imageUrl"
      from "musicals" as "m"
      join "musicalStyleCategories" as "msc" using ("musicalId")
      join "topCategories" as "tc"
      on "msc"."musicalStyleId" = "tc"."id" and
        "tc"."category" = 'musical style'
), "allMatches" as (
  select *
    from "matchedByTag"
  union all
  select *
    from "matchedByGenre"
  union all
  select *
    from "matchedByMusicalStyle"
)
select "am"."musicalId",
       "am"."title",
       "am"."imageUrl",
       count(*) as "relevance"
  from "allMatches" as "am"
  where "am"."musicalId" not in (
    select "musicalId"
      from "likedMusicals"
      where "userId" = $1
  )
 group by "am"."musicalId", "am"."title", "am"."imageUrl"
 order by "relevance" desc
 limit 20
  `;
    return db.query(sql, params)
      .then(result => {
        if (result.rows.length === 0) {
          next(new ClientError('You must like at least one musical to get recommendations', 400));
        } else {
          recommendations = result.rows;
          return recommendations;
        }
      })
      .catch(err => next(err));
  };
  const getRelated = () => {
    let related1, related2;
    const sql = `
    with "chosenLikes" as (
    select "lm"."musicalId",
           "m"."title",
            row_number() over() as "number"
            from "likedMusicals" as "lm"
            join "musicals" as "m" using ("musicalId")
    where "userId" = $1
    limit 2
    ), "allMatches1" as (
    select "om"."title",
           "om"."musicalId",
           "om"."imageUrl",
           "selectedTags"."title" as "relatedTo",
           count (distinct "mt"."tagId") as "matches"
      from "musicals" as "om"
      join "musicalTags" as "mt"
        on "om"."musicalId" = "mt"."musicalId"
      join (
        select "tagId",
                "title"
          from "chosenLikes"
          join "musicalTags" using ("musicalId")
         where "chosenLikes"."number" = 1
      ) as "selectedTags"
        on "selectedTags"."tagId" = "mt"."tagId"
      where "om"."musicalId" not in (
        select "musicalId"
            from "likedMusicals"
          where "userId" = $1
      )
     group by "om"."musicalId", "selectedTags"."title"
    union all
    select "om"."title",
           "om"."musicalId",
           "om"."imageUrl",
           "selectedStyles"."title" as "relatedTo",
           count (distinct "msc"."musicalStyleId") as "matches"
      from "musicals" as "om"
      join "musicalStyleCategories" as "msc"
        on "om"."musicalId" = "msc"."musicalId"
      join (
        select "musicalStyleId",
               "title"
          from "chosenLikes"
          join "musicalStyleCategories" using ("musicalId")
         where "chosenLikes"."number" = 1
      ) as "selectedStyles"
        on "selectedStyles"."musicalStyleId" = "msc"."musicalStyleId"
      where "om"."musicalId" not in (
        select "musicalId"
            from "likedMusicals"
          where "userId" = $1
    )
   group by "om"."musicalId", "selectedStyles"."title"
    union all
    select "om"."title",
           "om"."musicalId",
           "om"."imageUrl",
           "selectedGenres"."title" as "relatedTo",
           count (distinct "mg"."genreId") as "matches"
      from "musicals" as "om"
      join "musicalGenres" as "mg"
        on "om"."musicalId" = "mg"."musicalId"
      join (
        select "genreId",
                "title"
          from "chosenLikes"
          join "musicalGenres" using ("musicalId")
         where "chosenLikes"."number" = 1
      ) as "selectedGenres"
        on "selectedGenres"."genreId" = "mg"."genreId"
      where "om"."musicalId" not in (
        select "musicalId"
            from "likedMusicals"
          where "userId" = $1
      )
     group by "om"."musicalId", "selectedGenres"."title"
    ), "allMatches2" as (
      select "om"."title",
           "om"."musicalId",
           "om"."imageUrl",
           "selectedTags"."title" as "relatedTo",
           count (distinct "mt"."tagId") as "matches"
      from "musicals" as "om"
      join "musicalTags" as "mt"
        on "om"."musicalId" = "mt"."musicalId"
      join (
        select "tagId",
              "title"
          from "chosenLikes"
          join "musicalTags" using ("musicalId")
         where "chosenLikes"."number" = 2
      ) as "selectedTags"
        on "selectedTags"."tagId" = "mt"."tagId"
      where "om"."musicalId" not in (
        select "musicalId"
            from "likedMusicals"
          where "userId" = $1
      )
     group by "om"."musicalId", "selectedTags"."title"
    union all
    select "om"."title",
           "om"."musicalId",
           "om"."imageUrl",
           "selectedStyles"."title" as "relatedTo",
           count (distinct "msc"."musicalStyleId") as "matches"
      from "musicals" as "om"
      join "musicalStyleCategories" as "msc"
        on "om"."musicalId" = "msc"."musicalId"
      join (
        select "musicalStyleId",
                "title"
          from "chosenLikes"
          join "musicalStyleCategories" using ("musicalId")
         where "chosenLikes"."number" = 2
      ) as "selectedStyles"
        on "selectedStyles"."musicalStyleId" = "msc"."musicalStyleId"
      where "om"."musicalId" not in (
        select "musicalId"
            from "likedMusicals"
          where "userId" = $1
      )
     group by "om"."musicalId", "selectedStyles"."title"
    union all
    select "om"."title",
           "om"."musicalId",
           "om"."imageUrl",
           "selectedGenres"."title"  as "relatedTo",
           count (distinct "mg"."genreId") as "matches"
      from "musicals" as "om"
      join "musicalGenres" as "mg"
        on "om"."musicalId" = "mg"."musicalId"
      join (
        select "genreId",
              "title"
          from "chosenLikes"
          join "musicalGenres" using ("musicalId")
         where "chosenLikes"."number" = 2
      ) as "selectedGenres"
        on "selectedGenres"."genreId" = "mg"."genreId"
      where "om"."musicalId" not in (
        select "musicalId"
            from "likedMusicals"
          where "userId" = $1
      )
     group by "om"."musicalId", "selectedGenres"."title"
    ), "firstMusical" as (
    select 1 as "relatedNumber",
            "allMatches1"."relatedTo",
            "allMatches1"."musicalId",
            "allMatches1"."title",
            "allMatches1"."imageUrl",
         sum("matches") as "relevance"
    from "allMatches1"
     group by "allMatches1"."musicalId", "allMatches1"."title", "allMatches1"."imageUrl", "allMatches1"."relatedTo"
     order by "relevance" desc
     limit 10
    ), "secondMusical" as (
    select 2 as "relatedNumber",
            "allMatches2"."relatedTo",
            "allMatches2"."musicalId",
            "allMatches2"."title",
            "allMatches2"."imageUrl",
         sum("matches") as "relevance"
    from "allMatches2"
     group by "allMatches2"."musicalId", "allMatches2"."title", "allMatches2"."imageUrl", "allMatches2"."relatedTo"
     order by "relevance" desc
     limit 10
    )
    select *
        from "firstMusical"
    union
    select *
        from "secondMusical"
  `;
    return db.query(sql, params)
      .then(result => {
        related1 = result.rows.filter(el => el.relatedNumber === 1);
        related2 = result.rows.filter(el => el.relatedNumber === 2);
        return [related1, related2];
      })
      .catch(err => next(err));
  };

  const getCategories = () => {
    let genre, musicalStyle;
    const sql = `
    with "genreSuggestion" as (
      select "mg"."genreId",
             "g"."name",
          count("mg".*) as "totalInstances"
        from "likedMusicals" as "lm"
        join "musicalGenres" as "mg" using ("musicalId")
        join "genres" as "g" using ("genreId")
        where "lm"."userId" = $1
      group by "mg"."genreId", "g"."name"
    order by "totalInstances"
    limit 1
    ), "musicalStyleSuggestion" as (
      select "msc"."musicalStyleId",
             "ms"."name",
          count("msc".*) as "totalInstances"
        from "likedMusicals" as "lm"
        join "musicalStyleCategories" as "msc" using ("musicalId")
        join "musicalStyles" as "ms" using ("musicalStyleId")
        where "lm"."userId" = $1
      group by "msc"."musicalStyleId", "ms"."name"
      order by "totalInstances"
      limit 1
    ), "musicalStyleTen" as (
      select 'musical style' as "category",
            "mss"."name",
            "musicals"."musicalId",
            "musicals"."title",
            "musicals"."imageUrl"
        from "musicals"
        join "musicalStyleCategories" using ("musicalId")
        join "musicalStyleSuggestion" as "mss" using ("musicalStyleId")
        where "musicals"."musicalId" not in (
          select "musicalId"
              from "likedMusicals"
            where "userId" = $1
        ) and "musicalStyleCategories"."musicalStyleId" in (
          select "musicalStyleId"
              from "musicalStyleSuggestion"
        )
        limit 10
    ), "genreTen" as (
      select 'genre' as "category",
              "gs"."name",
              "musicals"."musicalId",
              "musicals"."title",
              "musicals"."imageUrl"
    from "musicals"
    join "musicalGenres" using ("musicalId")
    join "genreSuggestion" as "gs" using ("genreId")
    where "musicals"."musicalId" not in (
      select "musicalId"
          from "likedMusicals"
        where "userId" = $1
    ) and "musicalGenres"."genreId" in (
          select "genreId"
              from "genreSuggestion"
        )
    limit 10
    )
    select *
      from "musicalStyleTen"
      union all
    select *
      from "genreTen"
  `;
    return db.query(sql, params)
      .then(results => {
        genre = results.rows.filter(el => el.category === 'genre');
        musicalStyle = results.rows.filter(el => el.category === 'musical style');
        return [genre, musicalStyle];
      })
      .catch(err => next(err));
  };

  Promise.all([
    getRecommendations(),
    getRelated(),
    getCategories()
  ])
    .then(([recommendations, related, categories]) => {
      res.json({ recommendations, related, categories });
    })
    .catch(err => next(err));
});

app.post('/api/collections/:musicalId', (req, res, next) => {
  const { userId } = req.session;
  const { musicalId } = req.params;
  const { collectionName } = req.body;
  const numMusicals = parseInt(req.body.numMusicals);
  if (isNaN(parseInt(userId))) {
    next(new ClientError('userId must be an integer', 400));
  }
  if (collectionName === '' || collectionName === ' ') {
    next(new ClientError('The collection must be given a name', 400));
  }
  const sql = `
    select "name",
            "collectionId"
      from "collections"
      where "userId" = $1 and
      "name" = $2
  `;
  const params = [userId, collectionName];
  db.query(sql, params)
    .then(result => {
      if (result.rows.length === 0) {
        const sql = `
        with "imageForPlaylist" as (
          select "imageUrl"
            from "musicals"
          where "musicalId" = $1
        )
        insert into "collections" ("collectionId", "userId", "imageUrl", "name")
        values (default, $2, (select * from "imageForPlaylist"), $3)
        returning *;
        `;
        const params = [musicalId, userId, collectionName];
        return db.query(sql, params)
          .then(result => {
            return result.rows[0];
          });
      } else if (numMusicals === 0) {
        const collectionId = result.rows[0];
        const sql = `
        with "imageForPlaylist" as (
          select "imageUrl"
            from "musicals"
          where "musicalId" = $1
        )
        update "collections"
          set "imageUrl" = (select * from "imageForPlaylist")
            where "collectionId" = $2
        `;
        const params = [musicalId, collectionId.collectionId];
        return db.query(sql, params)
          .then(result => {
            return collectionId;
          });
      } else {
        return result.rows[0];
      }
    })
    .then(result => {
      const collectionId = result.collectionId;
      const sql = `
      select *
        from "collectionItems"
        where "collectionId" = $1 and
        "musicalId" = $2
      `;
      const params = [collectionId, musicalId];
      return db.query(sql, params)
        .then(result => {
          if (result.rows.length === 0) {
            const sql = `
              insert into "collectionItems" ("musicalId", "collectionId")
              values ($1, $2)
              returning *;
            `;
            const params = [musicalId, collectionId];
            return db.query(sql, params)
              .then(result => {
                return result.rows[0];
              });
          } else {
            return { error: `musical is already in ${collectionName}` };
          }
        });
    })
    .then(result => {
      res.json(result);
    })
    .catch(err => next(err));
});

app.get('/api/collections', (req, res, next) => {
  const { userId } = req.session;
  const sql = `
    select "c"."name",
           "c"."collectionId",
           "c"."imageUrl",
           count("ci"."musicalId") as "numMusicals"
      from "collections" as "c"
      left join "collectionItems" as "ci" using ("collectionId")
    where "c"."userId" = $1
    group by "c"."name", "c"."collectionId"
  `;
  const params = [userId];
  db.query(sql, params)
    .then(result => {
      res.json(result.rows);
    })
    .catch(err => next(err));
});

app.get('/api/collections/:collectionId', (req, res, next) => {
  const { collectionId } = req.params;
  if (isNaN(parseInt(collectionId))) {
    next(new ClientError('collectionId must be an integer', 400));
  }
  const sql = `
  select "c"."name" as "collectionName",
         "c"."collectionId",
         "m"."musicalId",
         "m"."title",
         "m"."musicBy",
         "m"."lyricsBy",
         "m"."imageUrl"
      from "collections" as "c"
      join "collectionItems" using ("collectionId")
      join "musicals" as "m" using ("musicalId")
    where "c"."collectionId" = $1
  `;
  const params = [collectionId];
  db.query(sql, params)
    .then(result => {
      if (result.rows.length === 0) {
        next(new ClientError(`collectionid ${collectionId} does not exist`, 400));
      } else {
        res.json(result.rows);
      }
    })
    .catch(err => next(err));
});

app.delete('/api/collections/:collectionId/:musicalId', (req, res, next) => {
  const { collectionId, musicalId } = req.params;
  if (isNaN(parseInt(collectionId))) {
    next(new ClientError('collectionId must be an integer', 400));
  }
  if (isNaN(parseInt(musicalId))) {
    next(new ClientError('musicalId must be an integer', 400));
  }
  const sql = `
  with "collectionImage" as (
  select "m"."musicalId"
  from "musicals" as "m"
  join  "collectionItems" as "ci" using ("musicalId")
  join  "collections" as "c" using ("collectionId")
  where "c"."collectionId" = $1 and
    "m"."imageUrl" = "c"."imageUrl"
  ) select "c"."name",
           "c"."collectionId",
           "c"."imageUrl",
           "collectionImage"."musicalId",
           count("ci"."musicalId") as "numMusicals"
      from "collections" as "c"
      left join "collectionItems" as "ci" using ("collectionId")
      left join "collectionImage" using ("musicalId")
    where "c"."collectionId" = $1
    group by "c"."name", "c"."collectionId", "collectionImage"."musicalId"
  `;
  const params = [collectionId];
  db.query(sql, params)
    .then(result => {
      let isOnlyMusical = true;
      let isImageUrl = false;
      result.rows.forEach(el => {
        if (el.musicalId === parseInt(musicalId)) {
          isImageUrl = true;
        }
        if (el.musicalId === null) {
          isOnlyMusical = false;
        }
      });
      if (isOnlyMusical) {
        const sql = `
        update "collections"
          set "imageUrl" = '/images/empty-collection.png'
        where "collectionId" = $1
        `;
        const params = [collectionId];
        return db.query(sql, params)
          .then(result => {
            return result.rows;
          });
      } else if (isImageUrl) {
        const sql = `
        with "newUrl" as (
          select "m"."imageUrl"
              from "musicals" as "m"
              join "collectionItems" as "ci" using ("musicalId")
            where "m"."musicalId" != $1 and
                  "ci"."collectionId" = $2
            limit 1
        )
        update "collections"
          set "imageUrl" = (select * from "newUrl")
        where "collectionId" = $2
        `;
        const params = [musicalId, collectionId];
        return db.query(sql, params)
          .then(result => {
            return result.rows;
          });
      } else {
        return result.rows;
      }
    })
    .then(result => {
      const sql = `
      delete from "collectionItems"
        where "collectionId" = $1 and
        "musicalId" = $2
      returning *
      `;
      const params = [collectionId, musicalId];
      return db.query(sql, params)
        .then(result => {
          return result.rows;
        });
    })
    .then(result => {
      res.json(result[0]);
    })
    .catch(err => next(err));
});

app.delete('/api/collections/:collectionId', (req, res, next) => {
  const { collectionId } = req.params;
  if (isNaN(parseInt(collectionId))) {
    next(new ClientError('collectionId must be an integer', 400));
  }
  const sql = `
  delete from "collectionItems"
    where "collectionId" = $1
    returning *
  `;
  const params = [collectionId];
  db.query(sql, params)
    .then(result => {
      const sql = `
      delete from "collections"
        where "collectionId" = $1
        returning *
      `;
      return db.query(sql, params)
        .then(result => {
          return result.rows[0];
        });
    })
    .then(result => {
      res.json(result);
    })
    .catch(err => next(err));
});

app.put('/api/collections/:collectionId', (req, res, next) => {
  const { collectionId } = req.params;
  const { collectionName } = req.body;
  if (isNaN(parseInt(collectionId))) {
    next(new ClientError('collectionId must be an integer', 400));
  }
  const sql = `
    update "collections"
      set "name" = $1
    where "collectionId" = $2
  `;
  const params = [collectionName, collectionId];
  db.query(sql, params)
    .then(result => {
      res.json(result.rows);
    })
    .catch(err => next(err));
});

app.post('/api/suggestions', (req, res, next) => {
  const { title, composer, notes } = req.body;
  const sql = `
  insert into "suggestions" ("title", "composer", "notes")
  values ($1, $2, $3)
  `;
  const params = [title, composer, notes];
  db.query(sql, params)
    .then(result => {
      res.json(result.rows);
    })
    .catch(err => next(err));
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
