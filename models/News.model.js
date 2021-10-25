const { Schema, model } = require('mongoose')

const newsSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  imgUrl: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  dateAdded: {
    type: Date,
    required: true,
  },
})

module.exports = model('News', newsSchema)