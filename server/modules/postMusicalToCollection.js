const db = require('../database');
const ClientError = require('../client-error');

const postMusicalToCollection = (req, res, next) => {
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
};

module.exports = postMusicalToCollection;
