const db = require('../database');
const ClientError = require('../client-error');

const getRelated = (req, res, next) => {
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
};

module.exports = getRelated;
