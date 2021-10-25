const { Schema, model } = require('mongoose')

const qualificationSchema = new Schema({
  professionId: {
    type: Schema.Types.ObjectId,
    ref: 'Profession',
    required: true,
  },
  degree: {
    type: Number,
    required: true,
    default: 1,
  },
  description: {
    type: String,
    required: true,
  },
})

module.exports = model('Qualification', qualificationSchema)