
const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');
// Define a schema for the "HelloWorld" document
const ProfileSchema = new mongoose.Schema({
    
        // _id: ObjectId,
        first_name: String,
        last_name: String,
        phone: String,
        bio: String,
        email: {
          type: String,
          unique: true, // Ensures uniqueness of email
          required: true // Makes email a required field
        },
        image_uri: String,
        firebase_uid: String,
        firebase_login_token: String,
        blood_group: String,
        createdAt: Date,
        updatedAt: Date 
      
});
const Profile = mongoose.model('Profile', ProfileSchema);
module.exports = Profile;