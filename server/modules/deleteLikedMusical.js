const db = require('../database');
const ClientError = require('../client-error');

const deleteLikedMusical = (req, res, next) => {
  const { musicalId } = req.params;
  const { userId } = req.session;
  if (isNaN(parseInt(userId))) {
    next(new ClientError('userId must be an integer', 400));
  }
  if (isNaN(parseInt(musicalId))) {
    next(new ClientError('musicalId must be an integer', 400));
  }
  const sql = `
    delete from "likedMusicals"
      where "userId" = $1 and
      "musicalId" = $2
  `;
  const params = [userId, musicalId];
  db.query(sql, params)
    .then(result => {
      const obj = {
        like: null,
        musicalId,
        userId
      };
      res.json(obj);
    })
    .catch(err => next(err));
};

module.exports = deleteLikedMusical;
