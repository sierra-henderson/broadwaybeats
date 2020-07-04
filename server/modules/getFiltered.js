const db = require('../database');

const getFiltered = (req, res, next) => {
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
};

module.exports = getFiltered;
