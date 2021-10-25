const { Schema, model } = require('mongoose')

const professionSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
})

module.exports = model('Profession', professionSchema)