const express = require('express');
const serverless = require('serverless-http');
const axios = require('axios');
require('dotenv').config();
const googleOAuth = require('./middleware/index');
const firebaseAdmin = require('./config/firebase-config')
const fcmUrl = 'https://fcm.googleapis.com/fcm/send'; 
const mongoose = require("mongoose");
const Trips = require('./models/trips');
const Profile = require('./models/profile');
mongoose
  .connect(process.env.URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to the database');
  })
  .catch((err) => {
    console.error('Error connecting to the database:', err);
  });
const app = express();
app.use(express.json());
app.get('/', (req, res) => res.send('Namaste Home Page'));
app.get('/test', (req, res) => res.send('Namaste Dayasudhan 🙏'));

app.get('/current_rides', async (req, res) => {
  try {
    console.log("get current_rides");
    // Define the query using Mongoose's querying methods
    const query = {
      start_time: { $gt: '2023-07-09 00:00:00' },
      end_time: { $lt: '2023-07-10 12:59:59' }
    };

    // Use the Mongoose model to find documents that match the query
    const rides = await Trips.find(query).exec();

    res.json(rides);
  } catch (error) {
    console.error('Error retrieving trips from MongoDB:', error);
    res.sendStatus(500);
  }
});
app.post('/rides', async (req, res) => {

  req.body['createdAt'] = new Date();
  req.body['updatedAt'] = new Date();
  req.body['status'] = 'idle';
  console.log("body",req.body )
  try {
    const rides = new Trips(req.body);
    await rides.save();
    res.send(rides);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});
app.get('/rides', async (req, res) => {
  try {
    try {
      const results = await Trips.find({});
      console.log(results);
      res.json(results).status(200)
    } catch (error) {
      res.sendStatus(500);
    }
  }catch (error) {
      console.error('Error retrieving users from MongoDB:', error);
      res.sendStatus(500);
    }

});

app.delete('/rides/:id', async (req, res) => {
  try {
    console.log("req.params.id", req.params.id);

    // Use the Mongoose model to find and delete a document by its ID
    const result = await Trips.deleteOne({ _id: req.params.id });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.status(200).json({ message: 'Ride Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting ride document:', error);
    res.sendStatus(500);
  }
});
app.delete('/ridesall', async (req, res) => {
  try {
    // Use the Mongoose model to delete all documents in the "trips" collection
    const result = await Trips.deleteMany({});
    console.log("result", result);
    res.status(200).json({ message: 'All Ride Documents deleted successfully' });
  } catch (error) {
    console.error('Error deleting all ride documents:', error);
    res.sendStatus(500);
  }
});
app.delete('/profilesall', async (req, res) => {
   try {
      // Use the Mongoose model to delete all documents in the "trips" collection
      const result = await Profile.deleteMany({});
      console.log("result", result);
      res.status(200).json({ message: 'All Ride Documents deleted successfully' });
    } catch (error) {
      console.error('Error deleting all ride documents:', error);
      res.sendStatus(500);
    }
});

app.get('/rides/:id', async (req, res) => {
  try {
    // Use the Mongoose model to find a document by its ID
    const ride = await Trips.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    res.json(ride);
  } catch (error) {
    console.error('Error retrieving ride document:', error);
    res.sendStatus(500);
  }
});
app.patch('/rides/:id', async (req, res) => {
  try {
    const rideId = req.params.id;
    const updatedFields = req.body;

    // Use the Mongoose model to update a document by its ID
    const result = await Trips.updateOne({ _id: rideId }, { $set: updatedFields });

    if (result.nModified === 0) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    res.status(200).json({ message: 'Ride updated successfully' });
  } catch (error) {
    console.error('Error updating ride document:', error);
    res.sendStatus(500);
  }
});
app.post('/profiles', async (req, res) => {
  //const { name, email, age } = req.body;
   
   req.body['createdAt'] = new Date();
   req.body['updatedAt'] = new Date();
   console.log("body",req.body )
  try {
    const profile = new Profile(req.body);
    await profile.save();
    res.send(profile);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});
app.get('/profiles', async (req, res) => {
  try {
    try {
      const results = await Profile.find({});
      console.log(results);
      res.json(results).status(200)
    } catch (error) {
      res.sendStatus(500);
    }
  }catch (error) {
      console.error('Error retrieving users from MongoDB:', error);
      res.sendStatus(500);
    }

});

app.get('/profiles/:id', async (req, res) => {
  try {
    // Use the Mongoose model to find a document by its ID
    const ride = await Profile.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(ride);
  } catch (error) {
    console.error('Error retrieving user document:', error);
    res.sendStatus(500);
  }
});
app.get('/profiles/phone/:phone', async (req, res) => {
  try {
    // Use the Mongoose model to find a user profile by phone number
    const userProfile = await Profile.findOne({ phone: req.params.phone });

    if (!userProfile) {
      return res.status(404).json({ message: 'User profile not found' });
    }

    res.json(userProfile);
  } catch (error) {
    console.error('Error retrieving user profile from MongoDB:', error);
    res.sendStatus(500);
  }
});
app.get('/profiles/email/:email', async (req, res) => {
  try {
    // Use the Mongoose model to find a user profile by phone number
    const userProfile = await Profile.findOne({ email: req.params.email });

    if (!userProfile) {
      return res.status(404).json({ message: 'User profile not found' });
    }

    res.json(userProfile);
  } catch (error) {
    console.error('Error retrieving user profile from MongoDB:', error);
    res.sendStatus(500);
  }
});
app.delete('/profiles/:id', async (req, res) => {
  try {
    // Use the Mongoose model to find and delete a user profile document by its ID
    const result = await Profile.deleteOne({ _id: req.params.id });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.status(200).json({ message: 'Profile Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting user profile document:', error);
    res.sendStatus(500);
  }
});
app.patch('/profiles/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const updatedFields = req.body;

    // Use the Mongoose model to update a user profile document by its ID
    const result = await Profile.updateOne({ _id: userId }, { $set: updatedFields });

    if (result.nModified === 0) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.status(200).json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating user profile document:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
app.post('/start_ride', async (req, res) => {
  try {
    const rideId = req.body.ride_id;

    // Use the Mongoose model to update the ride status and updatedAt field
    const rideUpdate = await Trips.findByIdAndUpdate(
      rideId,
      {
        $set: {
          status: 'active', // Update the status to the new value
          updatedAt: new Date(), // Optionally update other fields
        },
      },
      { new: true }
    );

    if (!rideUpdate) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    const riderIds = rideUpdate.riders;

    // Use the Mongoose model to find user profiles by their IDs
    const riderProfiles = await Profile.find({ _id: { $in: riderIds } });

    // Extract FCM tokens from the rider profiles
    const registrationTokens = riderProfiles
      .filter(profile => profile.fcmToken)
      .map(profile => profile.fcmToken);

    if (registrationTokens.length > 0) {
      const postData = {
        registration_ids: registrationTokens,
        notification: {
          body: 'Ride started by creator',
          title: rideUpdate.name,
        },
        data: rideUpdate,
      };

      const customHeaders = {
        Authorization: 'key=AAAAdg_f35E:APA91bEgdpg4AH4lanYL7-9s18P6EotNpFKCVT8cDGwcK-uFV13e12eJAOXWfJxBADRQSvi0kn24mTTZbQeNSlWNi8zTvuDWossEJ3vXi1wAFHetwQmwJzmSs9YhC2FLXRRfrRM1qdLb', // Example of an authorization header
        'Content-Type': 'application/json', // Replace with your custom headers
      };

      axios
        .post(fcmUrl, postData, { headers: customHeaders })
        .then(response => {
          console.log('Response:', response.data);
          res.send(response.data).status(200);
        })
        .catch(error => {
          console.error('Error:', error);
          res.sendStatus(500);
        });
    } else {
      // No FCM tokens found for riders
      res.status(200).json({ message: 'No FCM tokens found for riders' });
    }
  } catch (error) {
    console.error('Error starting ride:', error);
    res.sendStatus(500);
  }
});
app.post('/complete_ride',  async (req, res) => {
    try {
      const rideId = req.body.ride_id;
  
      // Use the Mongoose model to update the ride status and updatedAt field
      const rideUpdate = await Trips.findByIdAndUpdate(
        rideId,
        {
          $set: {
            status: 'completed', // Update the status to the new value
            updatedAt: new Date(), // Optionally update other fields
          },
        },
        { new: true }
      );
  
      if (!rideUpdate) {
        return res.status(404).json({ message: 'Ride not found' });
      }
  
      const riderIds = rideUpdate.riders;
  
      // Use the Mongoose model to find user profiles by their IDs
      const riderProfiles = await Profile.find({ _id: { $in: riderIds } });
  
      // Extract FCM tokens from the rider profiles
      const registrationTokens = riderProfiles
        .filter(profile => profile.fcmToken)
        .map(profile => profile.fcmToken);
  
      if (registrationTokens.length > 0) {
        const postData = {
          registration_ids: registrationTokens,
          notification: {
            body: 'Ride completed by creator',
            title: rideUpdate.name,
          },
          data: rideUpdate,
        };
  
        const customHeaders = {
          Authorization: 'key=AAAAdg_f35E:APA91bEgdpg4AH4lanYL7-9s18P6EotNpFKCVT8cDGwcK-uFV13e12eJAOXWfJxBADRQSvi0kn24mTTZbQeNSlWNi8zTvuDWossEJ3vXi1wAFHetwQmwJzmSs9YhC2FLXRRfrRM1qdLb', // Example of an authorization header
          'Content-Type': 'application/json', // Replace with your custom headers
        };
  
        axios
          .post(fcmUrl, postData, { headers: customHeaders })
          .then(response => {
            console.log('Response:', response.data);
            res.send(response.data).status(200);
          })
          .catch(error => {
            console.error('Error:', error);
            res.sendStatus(500);
          });
      } else {
        // No FCM tokens found for riders
        res.status(200).json({ message: 'No FCM tokens found for riders' });
      }
    } catch (error) {
      console.error('Error starting ride:', error);
      res.sendStatus(500);
    }
  });

app.patch('/fcm_token', async (req, res) => {
  console.log("fcm_token", req.body);
  try {
    const { userid, fcm_token } = req.body;
    const updatedFields = { 'fcmToken': fcm_token };

    // Use the Mongoose model to update the FCM token in the user profile document
    const result = await Profile.updateOne({ _id: userid }, { $set: updatedFields });

    if (result.nModified === 0) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.status(200).json({ message: 'Profile updated with FCM token' });
  } catch (error) {
    console.error('Error updating user profile with FCM token:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

if(process.env.DEV === 'true')
{
  app.listen(process.env.PORT, () => 
    console.log(`Server is listening on port ${process.env.PORT}.${process.env.DEV} `)
  );
}
else{
  exports.handler = serverless(app);
}
