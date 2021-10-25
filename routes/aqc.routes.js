const { Router } = require('express')
const Profession = require('../models/Profession.model')
const Qualification = require('../models/Qualification.model')
const Test = require('../models/Test.model')
const Exam = require('../models/Exam.model')
const Course = require('../models/Course.model')
const auth = require('../middlewares/auth')
const admin = require('../middlewares/admin')
const News = require('../models/News.model')

const router = Router()

router.get('/', auth, (req, res) => {
  res.render('pages/aqc/aqcPage', {
    isAQC: true,
    title: 'ЦОК',
  })
})

router.get('/tests', auth, async (req, res) => {
  try {
    const professions = await Profession.find().lean()
    const qualifications = await Qualification.find().lean()
    const tests = await Test.find().lean()

    const testsGroups = []

    professions.forEach(p => {
      const qualificationsForProfession = qualifications.filter(
        q => q.professionId.toString() === p._id.toString())
      const testsForGroup = []

      qualificationsForProfession.forEach(q => {
        const testsForQualification = tests.filter(
          t => t.qualificationId.toString() === q._id.toString())
        testsForGroup.push(...testsForQualification)
      })

      testsGroups.push({ professionTitle: p.title, tests: testsForGroup })
    })

    testsGroups.forEach(g => {
      g.tests.map(t => {
        const testQualification = qualifications.find(
          q => q._id.toString() === t.qualificationId.toString())
        const testProfession = professions.find(
          p => p._id.toString() === testQualification.professionId.toString())
        t.degree = +testQualification.degree
        t.qualificationTitle = `${testProfession.title}, уровень ${testQualification.degree}`
        return t
      })
    })

    testsGroups.forEach(g => {
      g.tests.sort((a, b) => a.degree - b.degree)
    })

    let passedTests = req.user.passedTests

    passedTests = passedTests.map(
      pt => tests.find(t => t._id.toString() === pt.toString()))

    res.render('pages/aqc/testsPage', {
      testFail: req.flash('testFail'),
      testSuccess: req.flash('testSuccess'),
      isAQC: true,
      title: 'ЦОК',
      testsGroups,
      passedTests,
    })
  } catch (e) {
    console.log(e)
  }
})

router.get('/tests/id/:id', auth, async (req, res) => {
  try {
    const test = await Test.findById(req.params.id).lean()
    const qualification = await Qualification.findById(test.qualificationId).
      lean()
    const profession = await Profession.findById(qualification.professionId).
      lean()

    if (!test) {
      return res.redirect('/aqc/tests')
    }

    const questionsGroups = []

    test.questions.forEach(q => questionsGroups.push(q))

    questionsGroups.map(q => {
      const answersForQuestion = test.answers.filter(
        a => a.questionNumber === q.questionNumber)
      q.answers = [...answersForQuestion]
      return q
    })

    res.render('pages/aqc/singleTestPage', {
      isAQC: true,
      title: 'ЦОК',
      test,
      questionsGroups,
      qualification,
      profession,
    })
  } catch (e) {
    console.log(e)
  }
})

router.get('/tests/add', auth, admin, async (req, res) => {
  try {
    const professions = await Profession.find().lean()
    const qualifications = await Qualification.find().lean()

    const qualificationsGroups = []

    professions.forEach(p => {
      const qualificationsForGroup = qualifications.filter(
        q => q.professionId.toString() === p._id.toString())

      qualificationsForGroup.sort((a, b) => a.degree - b.degree)

      qualificationsGroups.push({
        professionTitle: p.title,
        qualifications: qualificationsForGroup,
      })
    })

    res.render('pages/aqc/addTestPage', {
      isAQC: true,
      title: 'ЦОК',
      qualificationsGroups,
    })
  } catch (e) {
    console.log(e)
  }
})

router.post('/tests/add', auth, admin, async (req, res) => {
  try {
    const { qualificationId, testTitle } = req.body

    const test = new Test({
      testTitle,
      qualificationId,
      questions: [
        {
          questionTitle: 'Первый вопрос',
          questionNumber: 1,
        },
        {
          questionTitle: 'Второй вопрос',
          questionNumber: 2,
        },
        {
          questionTitle: 'Третий вопрос',
          questionNumber: 3,
        },
      ],
      answers: [
        {
          questionNumber: 1,
          answerNumber: 1,
          answerTitle: 'Неверный ответ',
          isCorrect: false,
        },
        {
          questionNumber: 1,
          answerNumber: 2,
          answerTitle: 'Верный ответ',
          isCorrect: true,
        },
        {
          questionNumber: 1,
          answerNumber: 3,
          answerTitle: 'Неверный ответ',
          isCorrect: false,
        },
        {
          questionNumber: 1,
          answerNumber: 4,
          answerTitle: 'Верный ответ',
          isCorrect: true,
        },
        {
          questionNumber: 2,
          answerNumber: 1,
          answerTitle: 'Верный ответ',
          isCorrect: true,
        },
        {
          questionNumber: 2,
          answerNumber: 2,
          answerTitle: 'Неверный ответ',
          isCorrect: false,
        },
        {
          questionNumber: 2,
          answerNumber: 3,
          answerTitle: 'Неверный ответ',
          isCorrect: false,
        },
        {
          questionNumber: 2,
          answerNumber: 4,
          answerTitle: 'Неверный ответ',
          isCorrect: false,
        },
        {
          questionNumber: 3,
          answerNumber: 1,
          answerTitle: 'Неверный ответ',
          isCorrect: false,
        },
        {
          questionNumber: 3,
          answerNumber: 2,
          answerTitle: 'Верный ответ',
          isCorrect: true,
        },
        {
          questionNumber: 3,
          answerNumber: 3,
          answerTitle: 'Верный ответ',
          isCorrect: true,
        },
        {
          questionNumber: 3,
          answerNumber: 4,
          answerTitle: 'Неверный ответ',
          isCorrect: false,
        },
      ],
    })

    await test.save()
    return res.redirect('/aqc/tests')
  } catch (e) {
    console.log(e)
  }
})

router.post('/tests/check', auth, async (req, res) => {
  try {
    const { testId } = req.body
    delete req.body.testId
    const answers = req.body

    const test = await Test.findById(testId)

    const groupedAnswers = []
    test.answers.forEach(a => {
      const questionNumber = a.questionNumber

      const candidate = groupedAnswers.find(
        ga => ga.questionNumber === questionNumber)
      if (candidate) {
        candidate.answers.push({
          answerNumber: a.answerNumber,
          isCorrect: a.isCorrect,
        })
      } else {
        groupedAnswers.push({
          questionNumber,
          answers: [
            {
              answerNumber: a.answerNumber,
              isCorrect: a.isCorrect,
            },
          ],
        })
      }
    })

    const groupedCorrectAnswers = []
    groupedAnswers.forEach(a => {
      const questionNumber = a.questionNumber
      const answersObjects = a.answers.filter(answer => answer.isCorrect)
      answersObjects.map(a => delete a.isCorrect)

      const answers = []
      answersObjects.forEach(ao => answers.push(ao.answerNumber))

      groupedCorrectAnswers.push({ questionNumber, answers })
    })

    const userAnswers = []
    Object.keys(answers).forEach(k => {
      const questionNumber = +k.split('-')[0]
      const answerNumber = +k.split('-')[1]
      userAnswers.push({ questionNumber, answerNumber })
    })

    const groupedUserAnswers = []
    userAnswers.forEach(ua => {
      const questionNumber = ua.questionNumber
      const answerNumber = ua.answerNumber

      const candidate = groupedUserAnswers.find(
        gua => gua.questionNumber === questionNumber)

      if (candidate) {
        candidate.answers.push(answerNumber)
      } else {
        groupedUserAnswers.push({
          questionNumber,
          answers: [answerNumber],
        })
      }
    })

    const result = []
    groupedCorrectAnswers.forEach(ca => {
      const ua = groupedUserAnswers.find(
        a => a.questionNumber === ca.questionNumber)
      if (ua) {
        if (JSON.stringify(ua.answers) === JSON.stringify(ca.answers)) {
          result.push({
            questionNumber: ca.questionNumber,
            isCorrect: true,
          })
        } else {
          result.push({
            questionNumber: ca.questionNumber,
            isCorrect: false,
          })
        }
      } else {
        result.push({
          questionNumber: ca.questionNumber,
          isCorrect: false,
        })
      }
    })

    const questionsNumber = result.length
    const correctAnswersNumber = result.filter(q => q.isCorrect).length

    if (correctAnswersNumber * 100 / questionsNumber > 80) {
      // User has passed test
      const user = req.user
      const candidate = user.passedTests.find(
        pt => pt._id.toString() === testId)
      if (!candidate) {
        user.passedTests.push(testId)
      }
      await user.save()
      req.flash('testSuccess',
        'Поздравляем, вы прошли тест! Теперь вам доступны экзамены по этой квалификации.')
      return res.redirect('/aqc/tests')
    } else {
      // User has not passed test
      req.flash('testFail',
        'К сожалению, вы не прошлли тест. Пройдите курс по данной квалификации и попробуйте еще раз.')
      return res.redirect('/aqc/tests')
    }

    return res.redirect('/aqc/tests')
  } catch (e) {
    console.log(e)
  }
})

router.get('/exams', auth, async (req, res) => {
  try {
    const professions = await Profession.find().lean()
    const qualifications = await Qualification.find().lean()
    const exams = await Exam.find().lean()

    let examsGroups = []

    professions.forEach(p => {
      const qualificationsForProfession = qualifications.filter(
        q => q.professionId.toString() === p._id.toString())
      const examsForGroup = []

      qualificationsForProfession.forEach(q => {
        const examsForQualification = exams.filter(
          e => e.qualificationId.toString() === q._id.toString())
        examsForGroup.push(...examsForQualification)
      })

      examsGroups.push({ professionTitle: p.title, exams: examsForGroup })
    })

    examsGroups.forEach(g => {
      g.exams.map(e => {
        const examQualification = qualifications.find(
          q => q._id.toString() === e.qualificationId.toString())
        const examProfession = professions.find(
          p => p._id.toString() === examQualification.professionId.toString())
        e.degree = +examQualification.degree
        e.qualificationTitle = `${examProfession.title}, уровень ${examQualification.degree}`
        return e
      })
    })

    examsGroups.forEach(g => {
      g.exams.sort((a, b) => a.degree - b.degree)
    })

    let passedExams = req.user.passedExams

    passedExams = passedExams.map(
      pe => exams.find(e => e._id.toString() === pe.toString()))

    const user = req.user

    const tests = await Test.find().lean()

    const passedTestsQualifications = user.passedTests.map(pt => {
      const test = tests.find(t => t._id.toString() === pt.toString())
      return test.qualificationId
    })

    if (!user.isAdmin) {
      examsGroups = examsGroups.map(eg => {
        eg.exams = eg.exams.filter(e => passedTestsQualifications.find(
          q => q.toString() === e.qualificationId.toString()))
        return eg
      })
    }

    res.render('pages/aqc/examsPage', {
      examFail: req.flash('examFail'),
      examSuccess: req.flash('examSuccess'),
      isAQC: true,
      title: 'ЦОК',
      examsGroups,
      passedExams,
    })
  } catch (e) {
    console.log(e)
  }
})

router.get('/exams/id/:id', auth, async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id).lean()
    const qualification = await Qualification.findById(exam.qualificationId).
      lean()
    const profession = await Profession.findById(qualification.professionId).
      lean()

    if (!exam) {
      return res.redirect('/aqc/exams')
    }

    const questionsGroups = []

    exam.questions.forEach(q => questionsGroups.push(q))

    questionsGroups.map(q => {
      const answersForQuestion = exam.answers.filter(
        a => a.questionNumber === q.questionNumber)
      q.answers = [...answersForQuestion]
      return q
    })

    res.render('pages/aqc/singleExamPage', {
      isAQC: true,
      title: 'ЦОК',
      exam,
      questionsGroups,
      qualification,
      profession,
    })
  } catch (e) {
    console.log(e)
  }
})

router.get('/exams/add', auth, admin, async (req, res) => {
  try {

    const professions = await Profession.find().lean()
    const qualifications = await Qualification.find().lean()

    const qualificationsGroups = []

    professions.forEach(p => {
      const qualificationsForGroup = qualifications.filter(
        q => q.professionId.toString() === p._id.toString())

      qualificationsForGroup.sort((a, b) => a.degree - b.degree)

      qualificationsGroups.push({
        professionTitle: p.title,
        qualifications: qualificationsForGroup,
      })
    })

    res.render('pages/aqc/addExamPage', {
      isAQC: true,
      title: 'ЦОК',
      qualificationsGroups,
    })
  } catch (e) {
    console.log(e)
  }
})

router.post('/exams/add', auth, admin, async (req, res) => {
  try {
    const { qualificationId, examTitle } = req.body

    const exam = new Exam({
      examTitle,
      qualificationId,
      questions: [
        {
          questionTitle: 'Первый вопрос',
          questionNumber: 1,
        },
        {
          questionTitle: 'Второй вопрос',
          questionNumber: 2,
        },
        {
          questionTitle: 'Третий вопрос',
          questionNumber: 3,
        },
      ],
      answers: [
        {
          questionNumber: 1,
          answerNumber: 1,
          answerTitle: 'Неверный ответ',
          isCorrect: false,
        },
        {
          questionNumber: 1,
          answerNumber: 2,
          answerTitle: 'Верный ответ',
          isCorrect: true,
        },
        {
          questionNumber: 1,
          answerNumber: 3,
          answerTitle: 'Неверный ответ',
          isCorrect: false,
        },
        {
          questionNumber: 1,
          answerNumber: 4,
          answerTitle: 'Верный ответ',
          isCorrect: true,
        },
        {
          questionNumber: 2,
          answerNumber: 1,
          answerTitle: 'Верный ответ',
          isCorrect: true,
        },
        {
          questionNumber: 2,
          answerNumber: 2,
          answerTitle: 'Неверный ответ',
          isCorrect: false,
        },
        {
          questionNumber: 2,
          answerNumber: 3,
          answerTitle: 'Неверный ответ',
          isCorrect: false,
        },
        {
          questionNumber: 2,
          answerNumber: 4,
          answerTitle: 'Неверный ответ',
          isCorrect: false,
        },
        {
          questionNumber: 3,
          answerNumber: 1,
          answerTitle: 'Неверный ответ',
          isCorrect: false,
        },
        {
          questionNumber: 3,
          answerNumber: 2,
          answerTitle: 'Верный ответ',
          isCorrect: true,
        },
        {
          questionNumber: 3,
          answerNumber: 3,
          answerTitle: 'Верный ответ',
          isCorrect: true,
        },
        {
          questionNumber: 3,
          answerNumber: 4,
          answerTitle: 'Неверный ответ',
          isCorrect: false,
        },
      ],
    })

    await exam.save()
    return res.redirect('/aqc/exams')
  } catch (e) {
    console.log(e)
  }
})

router.post('/exams/check', auth, async (req, res) => {
  try {
    const { examId } = req.body
    delete req.body.examId
    const answers = req.body

    const exam = await Exam.findById(examId)

    const groupedAnswers = []
    exam.answers.forEach(a => {
      const questionNumber = a.questionNumber

      const candidate = groupedAnswers.find(
        ga => ga.questionNumber === questionNumber)
      if (candidate) {
        candidate.answers.push({
          answerNumber: a.answerNumber,
          isCorrect: a.isCorrect,
        })
      } else {
        groupedAnswers.push({
          questionNumber,
          answers: [
            {
              answerNumber: a.answerNumber,
              isCorrect: a.isCorrect,
            },
          ],
        })
      }
    })

    const groupedCorrectAnswers = []
    groupedAnswers.forEach(a => {
      const questionNumber = a.questionNumber
      const answersObjects = a.answers.filter(answer => answer.isCorrect)
      answersObjects.map(a => delete a.isCorrect)

      const answers = []
      answersObjects.forEach(ao => answers.push(ao.answerNumber))

      groupedCorrectAnswers.push({ questionNumber, answers })
    })

    const userAnswers = []
    Object.keys(answers).forEach(k => {
      const questionNumber = +k.split('-')[0]
      const answerNumber = +k.split('-')[1]
      userAnswers.push({ questionNumber, answerNumber })
    })

    const groupedUserAnswers = []
    userAnswers.forEach(ua => {
      const questionNumber = ua.questionNumber
      const answerNumber = ua.answerNumber

      const candidate = groupedUserAnswers.find(
        gua => gua.questionNumber === questionNumber)

      if (candidate) {
        candidate.answers.push(answerNumber)
      } else {
        groupedUserAnswers.push({
          questionNumber,
          answers: [answerNumber],
        })
      }
    })

    const result = []
    groupedCorrectAnswers.forEach(ca => {
      const ua = groupedUserAnswers.find(
        a => a.questionNumber === ca.questionNumber)
      if (ua) {
        if (JSON.stringify(ua.answers) === JSON.stringify(ca.answers)) {
          result.push({
            questionNumber: ca.questionNumber,
            isCorrect: true,
          })
        } else {
          result.push({
            questionNumber: ca.questionNumber,
            isCorrect: false,
          })
        }
      } else {
        result.push({
          questionNumber: ca.questionNumber,
          isCorrect: false,
        })
      }
    })

    const questionsNumber = result.length
    const correctAnswersNumber = result.filter(q => q.isCorrect).length

    if (correctAnswersNumber * 100 / questionsNumber > 80) {
      // User has passed exam
      const user = req.user
      const candidateExam = user.passedExams.find(
        pe => pe._id.toString() === examId)
      if (!candidateExam) {
        user.passedExams.push(examId)
      }

      const candidateQualification = user.qualifications.find(
        q => q._id.toString() === exam.qualificationId.toString())
      if (!candidateQualification) {
        user.qualifications.push(exam.qualificationId)
      }

      await user.save()
      req.flash('examSuccess',
        'Поздравляем, вы прошли экзамен! Вам присвоена квалификация.')
      return res.redirect('/aqc/exams')
    } else {
      // User has not passed exam
      req.flash('examFail',
        'К сожалению, вы не прошлли экзамен. Пройдите курс по данной квалификации и попробуйте еще раз.')
      return res.redirect('/aqc/exams')
    }

    return res.redirect('/aqc/tests')
  } catch (e) {
    console.log(e)
  }
})

router.get('/courses', auth, async (req, res) => {
  try {
    const professions = await Profession.find().lean()
    const qualifications = await Qualification.find().lean()
    const courses = await Course.find().lean()

    let coursesGroups = []

    professions.forEach(p => {
      const qualificationsForProfession = qualifications.filter(
        q => q.professionId.toString() === p._id.toString())
      const coursesForGroup = []

      qualificationsForProfession.forEach(q => {
        const coursesForQualification = courses.filter(
          c => c.qualificationId.toString() === q._id.toString())
        coursesForGroup.push(...coursesForQualification)
      })

      coursesGroups.push({ professionTitle: p.title, courses: coursesForGroup })
    })

    coursesGroups.forEach(g => {
      g.courses.map(c => {
        const courseQualification = qualifications.find(
          q => q._id.toString() === c.qualificationId.toString())
        const courseProfession = professions.find(
          p => p._id.toString() === courseQualification.professionId.toString())
        c.degree = +courseQualification.degree
        c.qualificationTitle = `${courseProfession.title}, уровень ${courseQualification.degree}`
        return c
      })
    })

    coursesGroups.forEach(g => {
      g.courses.sort((a, b) => a.degree - b.degree)
    })

    coursesGroups = coursesGroups.filter(cg => cg.courses.length)

    res.render('pages/aqc/coursesPage', {
      isAQC: true,
      title: 'ЦОК',
      coursesGroups,
    })
  } catch (e) {
    console.log(e)
  }
})

router.get('/courses/id/:id', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).lean()
    const qualification = await Qualification.findById(course.qualificationId).
      lean()
    const profession = await Profession.findById(qualification.professionId).
      lean()

    if (!course) {
      return res.redirect('/aqc/courses')
    }

    res.render('pages/aqc/singleCoursePage', {
      isAQC: true,
      title: 'ЦОК',
      course,
      qualification,
      profession,
    })
  } catch (e) {
    console.log(e)
  }
})

router.get('/courses/id/:id/edit', auth, admin, async (req, res) => {
  try {

    const course = await Course.findById(req.params.id).lean()
    const professions = await Profession.find().lean()
    const qualifications = await Qualification.find().lean()

    const qualificationsGroups = []

    professions.forEach(p => {
      const qualificationsForGroup = qualifications.filter(
        q => q.professionId.toString() === p._id.toString())

      qualificationsForGroup.sort((a, b) => a.degree - b.degree)

      qualificationsGroups.push({
        professionTitle: p.title,
        qualifications: qualificationsForGroup,
      })
    })

    if (!course) {
      return res.render('/aqc/courses')
    }

    const selectedQualificationId = course.qualificationId.toString()

    res.render('pages/aqc/editCoursePage', {
      isAQC: true,
      title: 'ЦОК',
      course,
      qualificationsGroups,
      selectedQualificationId,
    })
  } catch (e) {
    console.log(e)
  }
})

router.post('/courses/edit', auth, admin, async (req, res) => {
  try {
    const { id } = req.body
    delete req.body.id
    await Course.findByIdAndUpdate(id, req.body)
    return res.redirect('/aqc/courses')
  } catch (e) {
    console.log(e)
  }
})

router.get('/courses/add', auth, admin, async (req, res) => {
  try {
    const professions = await Profession.find().lean()
    const qualifications = await Qualification.find().lean()

    const qualificationsGroups = []

    professions.forEach(p => {
      const qualificationsForGroup = qualifications.filter(
        q => q.professionId.toString() === p._id.toString())

      qualificationsForGroup.sort((a, b) => a.degree - b.degree)

      qualificationsGroups.push({
        professionTitle: p.title,
        qualifications: qualificationsForGroup,
      })
    })

    res.render('pages/aqc/addCoursePage', {
      isAQC: true,
      title: 'ЦОК',
      qualificationsGroups,
    })
  } catch (e) {
    console.log(e)
  }
})

router.post('/courses/add', auth, admin, async (req, res) => {
  try {
    const { title, qualificationId, text } = req.body

    const course = new Course({ title, qualificationId, text })
    await course.save()

    return res.redirect('/aqc/courses')
  } catch (e) {
    console.log(e)
  }
})

router.post('/courses/delete', auth, admin, async (req, res) => {
  try {
    await Course.deleteOne({ _id: req.body.id })
    return res.redirect('/aqc/courses')
  } catch (e) {
    console.log(e)
  }
})

module.exports = router