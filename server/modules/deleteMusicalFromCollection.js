const db = require('../database');
const ClientError = require('../client-error');

const deleteMusicalFromCollection = (req, res, next) => {
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
};

module.exports = deleteMusicalFromCollection;
