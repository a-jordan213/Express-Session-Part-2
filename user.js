const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    admin: { //by default it'll be set to false
        type: Boolean,
        default: false
    }
});
//then export, can do it in 1 line
module.exports = mongoose.model('User', userSchema);