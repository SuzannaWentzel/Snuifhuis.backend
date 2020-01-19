const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    bewoner: {
        type: Schema.Types.ObjectId,
        ref: 'Bewoner'
    }
});

module.exports = mongoose.model('User', userSchema);