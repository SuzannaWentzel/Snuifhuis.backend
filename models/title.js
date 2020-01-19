const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const titleSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    bewoner: {
        type: Schema.Types.ObjectId,
        ref: 'Bewoner',
        required: true
    }
});

module.exports = mongoose.model('Title', titleSchema);