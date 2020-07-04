const db = require('../database');
const ClientError = require('../client-error');

const getLikedMusical = (req, res, next) => {
  const { musicalId } = req.params;
  const { userId } = req.session;
  if (isNaN(parseInt(musicalId))) {
    next(new ClientError('musicalId must be an integer', 400));
  }
  const sql = `
  select *
  from "likedMusicals"
  where "userId" = $1 and
    "musicalId" = $2
  `;
  const params = [userId, musicalId];
  db.query(sql, params)
    .then(result => {
      if (result.rows[0]) {
        res.json(result.rows[0]);
      } else {
        const obj = {
          like: null,
          musicalId,
          userId
        };
        res.json(obj);
      }
    })
    .catch(err => next(err));
};

module.exports = getLikedMusical;
