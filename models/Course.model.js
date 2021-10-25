const { Schema, model } = require('mongoose')

const courseSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  qualificationId: {
    type: Schema.Types.ObjectId,
    ref: 'Qualification',
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
})

module.exports = model('Course', courseSchema)