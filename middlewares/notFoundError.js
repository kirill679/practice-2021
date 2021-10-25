module.exports = function (req, res) {
  res.status(404).render('pages/404Page', {
    title: '404',
  })
}