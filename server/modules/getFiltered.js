const db = require('../database');

const getFiltered = (req, res, next) => {
  const tag = req.query.tag || [];
  const genre = req.query.genre || [];
  const musicalStyle = req.query.musicalStyle || [];
  const numCategories = [tag, genre, musicalStyle].filter(el => el.length !== 0).length;
  const sql = `
      with "genreMatches" as (
        select "musicalId"
          from "musicalGenres"
          join (select unnest($1::int[]) as "genreId") as "genreIds" using ("genreId")
          group by "musicalId"
          having count("musicalId") = $2
      ), "tagMatches" as (
        select "musicalId"
          from "musicalTags"
          join (select unnest($3::int[]) as "tagId") as "tagIds" using ("tagId")
          group by "musicalId"
          having count("musicalId") = $4
      ), "musicalStyleMatches" as (
        select "musicalId"
          from "musicalStyleCategories"
          join (select unnest($5::int[]) as "musicalStyleId") as "musicalStyleIds" using ("musicalStyleId")
          group by "musicalId"
          having count("musicalId") = $6
      ), "allMatches" as (
          select "musicalId"
            from "genreMatches"
          union all
          select "musicalId"
            from "tagMatches"
          union all
          select "musicalId"
            from "musicalStyleMatches"
      ), "categoryMatches" as (
        select "musicalId",
        count ("musicalId")
          from "allMatches"
        group by "musicalId"
        having count("musicalId") = $7
      )
      select "musicals"."title",
      "musicals"."musicalId",
      "musicals"."imageUrl",
      "musicals"."musicUrl"
      from "musicals"
      join "categoryMatches" on
      "musicals"."musicalId" = "categoryMatches"."musicalId"
    `;
  const params = [genre, genre.length, tag, tag.length, musicalStyle, musicalStyle.length, numCategories];
  db.query(sql, params)
    .then(result => {
      res.json(result.rows);
    })
    .catch(err => next(err));
};

module.exports = getFiltered;
