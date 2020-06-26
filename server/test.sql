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
   limit 24
