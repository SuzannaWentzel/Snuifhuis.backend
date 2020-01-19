const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const bewonerSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    moveInDate: {
        type: Date,
        required: true
    },
    moveOutDate: {
        type: Date
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: Schema.Types.ObjectId,
        ref: 'Title'
    },
    profilePicture: {
        type: String
    }
});

module.exports = mongoose.model('Bewoner', bewonerSchema);
