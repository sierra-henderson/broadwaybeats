with "topCategories" as (
  select "mt"."tagId" as "id",
        'tag' as "category",
        count("mt".*) as "totalInstances"
    from "likedMusicals" as "lm"
    join "musicalTags" as "mt" using ("musicalId")
    where "lm"."userId" = 2
  group by "mt"."tagId"
union all
select "msc"."musicalStyleId" as "id",
      'musical style' as "category",
      count("msc".*) as "totalInstances"
    from "likedMusicals" as "lm"
    join "musicalStyleCategories" as "msc" using ("musicalId")
    where "lm"."userId" = 2
  group by "msc"."musicalStyleId"
union all
select "mg"."genreId" as "id",
      'genre' as "category",
      count("mg".*) as "totalInstances"
    from "likedMusicals" as "lm"
    join "musicalGenres" as "mg" using ("musicalId")
    where "lm"."userId" = 2
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
      left join "likedMusicals" as "lm"
      on "m"."musicalId" = "lm"."musicalId"
      where "lm"."musicalId" is null
), "matchedByGenre" as (
  select "m"."musicalId",
         "m"."title",
         "m"."imageUrl"
      from "musicals" as "m"
      join "musicalGenres" as "mg" using ("musicalId")
      join "topCategories" as "tc"
      on "mg"."genreId" = "tc"."id" and
        "tc"."category" = 'genre'
      left join "likedMusicals" as "lm"
      on "m"."musicalId" = "lm"."musicalId"
      where "lm"."musicalId" is null
), "matchedByMusicalStyle" as (
  select "m"."musicalId",
         "m"."title",
         "m"."imageUrl"
      from "musicals" as "m"
      join "musicalStyleCategories" as "msc" using ("musicalId")
      join "topCategories" as "tc"
      on "msc"."musicalStyleId" = "tc"."id" and
        "tc"."category" = 'musical style'
      left join "likedMusicals" as "lm"
      on "m"."musicalId" = "lm"."musicalId"
      where "lm"."musicalId" is null
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
 group by "am"."musicalId", "am"."title", "am"."imageUrl"
 order by "relevance" desc
 limit 20
