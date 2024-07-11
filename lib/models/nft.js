const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const availabilityEntrySchema = new Schema({
    dayOfWeek: {
        type: String,
        required: true
    },
    seats: {
        type: Number,
        required: true
    },
    startTime: {
        type: String,
        required: true
    },
    endTime: {
        type: String,
        required: true
    }
}, {
    _id: false
});

const availabilityPlanSchema = new Schema({
    entries: [availabilityEntrySchema],
    timezone: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    }
}, {
    _id: false
});

const geolocationSchema = new Schema({
    lat: {
        type: Number,
        required: true
    },
    lng: {
        type: Number,
        required: true
    }
}, {
    _id: false
});

const locationSchema = new Schema({
    address: {
        type: String,
        required: true
    },
    building: String,
    geolocation: geolocationSchema
}, {
    _id: false
});

const photoSchema = new Schema({
    url: String,
}, {
    timestamps: true
});

const boatNftSchema = new Schema({
    tokenId: {
        type: String,
        required: true,
        unique: true
    },
    owner: {
        type: String,
        required: true
    },
    listingType: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    availabilityPlan: availabilityPlanSchema,
    location: locationSchema,
    photos: [photoSchema]
}, {
    timestamps: true
});

module.exports = mongoose.model('BoatNft', boatNftSchema);
