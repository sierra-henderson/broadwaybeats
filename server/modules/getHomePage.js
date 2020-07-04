const db = require('../database');
const ClientError = require('../client-error');

const getHomePage = (req, res, next) => {
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
};

module.exports = getHomePage;
