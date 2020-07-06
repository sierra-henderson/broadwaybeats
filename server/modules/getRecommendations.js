const db = require('../database');
const ClientError = require('../client-error');

const getRecommendations = (req, res, next) => {
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
};

module.exports = getRecommendations;
