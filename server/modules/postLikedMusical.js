const db = require('../database');
const ClientError = require('../client-error');

const postLikedMusical = (req, res, next) => {
  const { musicalId } = req.params;
  const { userId } = req.session;
  if (isNaN(parseInt(userId))) {
    next(new ClientError('userId must be an integer', 400));
  }
  if (isNaN(parseInt(musicalId))) {
    next(new ClientError('musicalId must be an integer', 400));
  }
  const sql = `
  select *
  from "likedMusicals"
  where "userId" = $1 and
    "musicalId" = $2 and
    "like" = true
  `;
  const params = [userId, musicalId];
  db.query(sql, params)
    .then(result => {
      if (result.rows.length > 0) {
        next(new ClientError(`Musical with id ${musicalId} has already been liked by user with id ${userId}`, 400));
      } else {
        const sql = `
        insert into "likedMusicals" ("userId", "musicalId", "like")
        values ($1, $2, true)
        returning *
        `;
        return db.query(sql, params)
          .then(result => {
            return res.status(201).json(result.rows[0]);
          })
          .catch(err => next(err));
      }
    })
    .catch(err => next(err));
};

module.exports = postLikedMusical;
