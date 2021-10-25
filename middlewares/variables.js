module.exports = function (req, res, next) {
  res.locals.isAuth = req.session.isAuthenticated
  res.locals.isAdmin = req.user ? req.user.isAdmin : false
  next()
}