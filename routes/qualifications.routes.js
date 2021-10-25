const { Router } = require('express')
const Qualification = require('../models/Qualification.model')
const Profession = require('../models/Profession.model')
const auth = require('../middlewares/auth')
const admin = require('../middlewares/admin')

const router = Router()

router.get('/', async (req, res) => {
  try {
    const professions = await Profession.find().lean()
    const qualifications = await Qualification.find().lean()

    let qualificationsGroups = []

    professions.forEach(p => {
      const qualificationsForGroup = qualifications.filter(
        q => q.professionId.toString() === p._id.toString())

      qualificationsForGroup.sort((a, b) => a.degree - b.degree)

      qualificationsGroups.push({
        professionTitle: p.title,
        qualifications: qualificationsForGroup,
      })
    })

    qualificationsGroups = qualificationsGroups.filter(
      qg => qg.qualifications.length)

    res.render('pages/qualifications/qualificationsPage', {
      isQualifications: true,
      title: 'Квалификации',
      qualificationsGroups,
    })
  } catch (e) {
    console.log(e)
  }
})

router.get('/:id/edit', auth, admin, async (req, res) => {
  try {
    const qualification = await Qualification.findById(req.params.id).lean()
    const professions = await Profession.find().lean()

    if (!qualification) {
      return res.redirect('/qualifications')
    }

    const selectedProfessionId = qualification.professionId.toString()

    res.render('pages/qualifications/editQualificationPage', {
      isQualifications: true,
      title: 'Квалификации',
      qualification,
      selectedProfessionId,
      professions,
    })
  } catch (e) {
    console.log(e)
  }
})

router.post('/edit', auth, admin, async (req, res) => {
  try {
    const { id } = req.body
    delete req.body.id

    await Qualification.findByIdAndUpdate(id, req.body)
    return res.redirect('/qualifications')
  } catch (e) {
    console.log(e)
  }
})

router.get('/add', auth, admin, async (req, res) => {
  try {
    const professions = await Profession.find().lean()

    res.render('pages/qualifications/addQualificationPage', {
      isQualifications: true,
      title: 'Квалификации',
      professions,
    })
  } catch (e) {
    console.log(e)
  }
})

router.post('/add', auth, admin, async (req, res) => {
  try {
    const { professionId, degree, description } = req.body

    const qualification = new Qualification(
      { professionId, degree, description })
    await qualification.save()

    return res.redirect('/qualifications')
  } catch (e) {
    console.log(e)
  }
})

router.post('/delete', auth, admin, async (req, res) => {
  try {
    await Qualification.deleteOne({ _id: req.body.id })
    return res.redirect('/qualifications')
  } catch (e) {
    console.log(e)
  }
})

router.get('/professions', auth, admin, async (req, res) => {
  try {
    const professions = await Profession.find().lean()

    res.render('pages/qualifications/professionsPage', {
      isQualifications: true,
      title: 'Квалификации',
      professions,
    })
  } catch (e) {
    console.log(e)
  }
})

router.get('/professions/:id/edit', admin, auth, async (req, res) => {
  try {
    const profession = await Profession.findById(req.params.id).lean()

    if (!profession) {
      return res.redirect('/qualifications/professions')
    }

    res.render('pages/qualifications/editProfessionPage', {
      isQualifications: true,
      title: 'Квалификации',
      profession,
    })
  } catch (e) {
    console.log(e)
  }
})

router.post('/professions/edit', auth, admin, async (req, res) => {
  try {
    const { id } = req.body
    delete req.body.id

    await Profession.findByIdAndUpdate(id, req.body)
    return res.redirect('/qualifications/professions')
  } catch (e) {
    console.log(e)
  }
})

router.get('/professions/add', auth, admin, (req, res) => {
  res.render('pages/qualifications/addProfessionPage', {
    isQualifications: true,
    title: 'Квалификации',
  })
})

router.post('/professions/add', auth, admin, async (req, res) => {
  try {
    const profession = new Profession({ title: req.body.title })
    await profession.save()

    return res.redirect('/qualifications/professions')
  } catch (e) {
    console.log(e)
  }
})

router.post('/professions/delete', auth, admin, async (req, res) => {
  try {
    await Profession.deleteOne({ _id: req.body.id })
    return res.redirect('/qualifications/professions')
  } catch (e) {
    console.log(e)
  }
})

module.exports = router