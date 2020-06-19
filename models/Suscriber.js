const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const subscriberSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
});
const Subscriber = mongoose.model('subscriber', subscriberSchema);
module.exports = Subscriber;