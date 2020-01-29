const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const photoSchema = new Schema({
    picturePath: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    createdAt: {
        type: Date,
        required: true
    },
    bewoner: {
        type: Schema.Types.ObjectId,
        ref: 'Bewoner',
        required: true
    },
    private: {
        type: Boolean,
    },
    fwos: {
        type: Boolean,
        required: true,
    },
    profilePicture: {
        type: Boolean,
    }
});

module.exports = mongoose.model('Photo', photoSchema);
