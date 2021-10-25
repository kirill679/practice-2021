const { Schema, model } = require('mongoose')

const examSchema = new Schema({
  examTitle: {
    type: String,
    required: true,
  },
  qualificationId: {
    type: Schema.Types.ObjectId,
    ref: 'Qualification',
    required: true,
  },
  questions: [
    {
      questionTitle: {
        type: String,
        required: true,
      },
      questionNumber: {
        type: Number,
        required: true,
      },
    },
  ],
  answers: [
    {
      questionNumber: {
        type: Number,
        required: true,
      },
      answerNumber: {
        type: Number,
        required: true,
      },
      answerTitle: {
        type: String,
        required: true,
      },
      isCorrect: {
        type: Boolean,
        required: true,
      },
    },
  ],
})

module.exports = model('Exam', examSchema)