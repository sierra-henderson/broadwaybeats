const db = require('../database');

const getAuth = (req, res, next) => {
  const { userId } = req.session;
  if (!userId) {
    return res.json({ username: null });
  }
  const sql = `
    select "u"."username",
           "u"."userId",
           count("lm"."musicalId") as "numLiked"
      from "users" as "u"
      left join "likedMusicals" as "lm" using ("userId")
      where "userId" = $1
      group by "u"."username", "u"."userId"
  `;
  const params = [userId];
  db.query(sql, params)
    .then(result => {
      req.session.userId = result.rows[0].userId;
      result.rows[0].numLiked = parseInt(result.rows[0].numLiked);
      res.json(result.rows[0]);
    })
    .catch(err => next(err));
};

module.exports = getAuth;
