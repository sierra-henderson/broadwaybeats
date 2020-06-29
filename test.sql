with "chosenLikes" as (
    select "lm"."musicalId",
           "m"."title",
            row_number() over() as "number"
            from "likedMusicals" as "lm"
            join "musicals" as "m" using ("musicalId")
    where "userId" = 5
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
          where "userId" = 5
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
          where "userId" = 5
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
          where "userId" = 5
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
          where "userId" = 5
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
          where "userId" = 5
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
          where "userId" = 5
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
