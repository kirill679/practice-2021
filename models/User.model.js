const { Schema, model } = require('mongoose')

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  isAdmin: {
    type: Boolean,
    required: true,
    default: false,
  },
  qualifications: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Qualification',
    },
  ],
  passedTests: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Test',
    },
  ],
  passedExams: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Exam',
    },
  ],
})

module.exports = model('User', userSchema)