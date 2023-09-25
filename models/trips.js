const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');

// Define a schema for the "HelloWorld" document
const Tripschema = new mongoose.Schema({
    //"_id": ObjectID,  // Assuming you're using ObjectID for unique identifiers
    "name": String,
    "location": {
      "source": {
        "name": String,
        "latitude": Number,
        "longitude": Number
      },
      "destination": {
        "name": String,
        "latitude": Number,
        "longitude": Number
      }
    },
    "start_time": Date, // Date and time in ISO format
    "end_time": Date,   // Date and time in ISO format
    "riders": [ObjectId],  // Array of ObjectIDs referring to riders
    "created_userid": ObjectId, // ObjectID referring to the creator user
    "status": String,
    "createdAt": Date,
    "updatedAt": Date  // Date and time in ISO format
  });
const Trips = mongoose.model('trips', Tripschema);
// export default Trips;
module.exports = Trips;