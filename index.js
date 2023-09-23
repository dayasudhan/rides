const express = require('express');
const serverless = require('serverless-http');
const axios = require('axios');
require('dotenv').config();
const googleOAuth = require('./middleware/index');
const {ObjectId,MongoClient}  = require('mongodb');
const firebaseAdmin = require('./config/firebase-config')
const fcmUrl = 'https://fcm.googleapis.com/fcm/send'; 

const app = express();
app.use(express.json());
app.use(async (req, res, next) => {
  try {
    const client = await MongoClient.connect(process.env.URI);
    const db = client.db('test');

    req.db = db;
    req.client = client;
    next();
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    res.sendStatus(500);
  }
});
app.get('/', (req, res) => res.send('Namaste Home Page'));
app.get('/test', (req, res) => res.send('Namaste Dayasudhan 🙏'));

app.get('/current_rides', async (req, res) => {
  try {
    console.log("get current_rides");
    const ridesCollection = req.db.collection('trips');
    let query = { start_time: { $gt: '2023-07-09 00:00:00'},end_time:{$lt:'2023-07-10 12:59:59' } };
    const rides = await ridesCollection.find(query).toArray();
    res.json(rides);
  } catch (error) {
    console.error('Error retrieving users from MongoDB:', error);
    res.sendStatus(500);
  }

  req.client.close();
});
app.post('/rides', async (req, res) => {
  try {
    console.log("post rides");
    const ridesCollection = req.db.collection('trips');
    req.body['status'] = 'idle';
    const response = await ridesCollection.insertOne(req.body);
    res.json(response);
  } catch (error) {
    console.error('Error retrieving users from MongoDB:', error);
    res.sendStatus(500);
  }

  req.client.close();
});
app.delete('/rides/:id', async (req, res) => {
  try {
    const ridesCollection = req.db.collection('trips');
    console.log("req.params.id",req.params.id)
    const result = await ridesCollection.deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Document not found' });
    }
    res.status(200).json({ message: 'Ride Document deleted successfully' });
  } catch (error) {
    console.error('Error retrieving users from MongoDB:', error);
    res.sendStatus(500);
  }

  req.client.close();
});
app.delete('/ridesall', async (req, res) => {
  try {
    const ridesCollection = req.db.collection('trips');
   
    //const result = await ridesCollection.deleteOne({ _id: new ObjectId(req.params.id) });
    const result = await ridesCollection.deleteMany({}, function (err, result) {
      if (err) throw err;
    
      console.log(`Deleted ${result.deletedCount} documents from ${collectionName}`);
    
      // Close the MongoDB connection
      client.close();
    });
    console.log("result",result)
    // if (result.deletedCount === 0) {
    //   return res.status(404).json({ message: 'Document not found' });
    // }
    res.status(200).json({ message: 'Ride Document deleted successfully' });
  } catch (error) {
    console.error('Error retrieving users from MongoDB:', error);
    res.sendStatus(500);
  }

  req.client.close();
});
app.delete('/profilesall', async (req, res) => {
  try {
    const ridesCollection = req.db.collection('trips');
   
    //const result = await ridesCollection.deleteOne({ _id: new ObjectId(req.params.id) });
    const result = await ridesCollection.deleteMany({}, function (err, result) {
      if (err) throw err;
    
      console.log(`Deleted ${result.deletedCount} documents from ${collectionName}`);
    
      // Close the MongoDB connection
      client.close();
    });
    console.log("result",result)
    // if (result.deletedCount === 0) {
    //   return res.status(404).json({ message: 'Document not found' });
    // }
    res.status(200).json({ message: 'Ride Document deleted successfully' });
  } catch (error) {
    console.error('Error retrieving users from MongoDB:', error);
    res.sendStatus(500);
  }

  req.client.close();
});
app.get('/rides', async (req, res) => {
  try {
    const ridesCollection = req.db.collection('trips');
    const rides = await ridesCollection.find().toArray();
    res.json(rides);
  } catch (error) {
    console.error('Error retrieving users from MongoDB:', error);
    res.sendStatus(500);
  }
  req.client.close();
});
app.get('/rides/:id', async (req, res) => {
  try {
    const ridesCollection = req.db.collection('trips');
    const objectId = new ObjectId(req.params.id);
    const rides = await ridesCollection.findOne({ _id :objectId});
    console.log("inside rides/id",req.params.id,rides)
    //const result = await collection.findOne({ _id :objectId});
    res.json(rides);
  } catch (error) {
    console.error('Error retrieving users from MongoDB:', error);
    res.sendStatus(500);
  }
  req.client.close();
});
app.patch('/rides/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const updatedFields = req.body;
    const ridesCollection = req.db.collection('trips');
    console.log("req.params.id",req.params.id)
    const result = await ridesCollection.updateOne({ _id: new ObjectId(req.params.id) },
    { $set: updatedFields });    
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'ride not found' });
    }
    
    res.status(200).json({ message: 'ride updated successfully' });
  } catch (error) {
    console.error('Error retrieving users from MongoDB:', error);
    res.sendStatus(500);
  }

  req.client.close();
});
app.get('/profiles', async (req, res) => {
  try {
    const usersCollection = req.db.collection('profiles');
    const response = await usersCollection.find().toArray();
    res.json(response);
  } catch (error) {
    console.error('Error retrieving users from MongoDB:', error);
    res.sendStatus(500);
  }

  req.client.close();
});
app.post('/profiles', async (req, res) => {
  try {
    console.log("req",req.body)
    const usersCollection = req.db.collection('profiles');
    const users = await usersCollection.insertOne(req.body);
    res.json(users);
  } catch (error) {
    console.error('Error retrieving users from MongoDB:', error);
    res.sendStatus(500);
  }

  req.client.close();
});
app.get('/profiles/:id', async (req, res) => {
  try {
    const usersCollection = req.db.collection('profiles');
    const objectId = new ObjectId(req.params.id);
    const rides = await usersCollection.findOne({ _id :objectId});
    console.log("inside rides/id",req.params.id,rides)
    //const result = await collection.findOne({ _id :objectId});
    res.json(rides);
  } catch (error) {
    console.error('Error retrieving users from MongoDB:', error);
    res.sendStatus(500);
  }
  req.client.close();
});
app.delete('/profiles/:id', async (req, res) => {
  try {
    const usersCollection = req.db.collection('profiles');
    console.log("req.params.id",req.params.id)
    const result = await usersCollection.deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Document not found' });
    }
    res.status(200).json({ message: 'Profile Document deleted successfully' });
  } catch (error) {
    console.error('Error retrieving users from MongoDB:', error);
    res.sendStatus(500);
  }

  req.client.close();
});
app.patch('/profiles/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const updatedFields = req.body;
    const usersCollection = req.db.collection('profiles');
    const result = await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: updatedFields }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }

  req.client.close();
});
app.post('/start_ride',  async (req, res) => {
  const ridesCollection = req.db.collection('trips');

  const filter = { _id: new ObjectId(req.body.ride_id) };
  const update = {
    $set: {
      'status':'active',// Update the status to the new value
      updatedAt: new Date(), // Optionally update other fields
    },
  };

  const options = { returnOriginal: true };
  const result = await ridesCollection.findOneAndUpdate(filter, update, options);
  console.log("result",result);
  const usersCollection = req.db.collection('profiles');
  const promises  = await result.value.riders.map(async e=>{
    const profile = await usersCollection.findOne({ _id: new ObjectId(e) });
    console.log("profile",profile);
    return profile && profile['fcmToken'];

  })
  Promise.all(promises)
  .then(registrationTokens => {
        console.log('Data from all promises:', registrationTokens);
        const postData = {
          'registration_ids': registrationTokens,
          "notification": {
            "body": "ride started by created user",
            "title": result.name
          },
          "data":  result
        };
        const customHeaders = {
          'Authorization': 'key=AAAAdg_f35E:APA91bEgdpg4AH4lanYL7-9s18P6EotNpFKCVT8cDGwcK-uFV13e12eJAOXWfJxBADRQSvi0kn24mTTZbQeNSlWNi8zTvuDWossEJ3vXi1wAFHetwQmwJzmSs9YhC2FLXRRfrRM1qdLb', // Example of an authorization header
          'Content-Type': 'application/json' // Replace with your custom headers
        };
        axios.post(fcmUrl, postData,{headers: customHeaders})
        .then((response) => {
          console.log('Response:', response.data);
          res.send(response.data).status(200);
        })
        .catch((error) => {
          console.error('Error:', error);
        });
    })
    .catch(error => {
      console.error('An error occurred:', error);
    });
})
app.post('/complete_ride',  async (req, res) => {
  const ridesCollection = req.db.collection('trips');

  const filter = { _id: new ObjectId(req.body.ride_id) };
  const update = {
    $set: {
      'status':'completed',// Update the status to the new value
      updatedAt: new Date(), // Optionally update other fields
    },
  };

  const options = { returnOriginal: true };
  const result = await ridesCollection.findOneAndUpdate(filter, update, options);
  console.log("result",result);
  const usersCollection = req.db.collection('profiles');
  const promises  = await result.value.riders.map(async e=>{
    const profile = await usersCollection.findOne({ _id: new ObjectId(e) });
    console.log("profile",profile);
    return profile && profile['fcmToken'];

  })
  Promise.all(promises)
  .then(registrationTokens => {
        console.log('Data from all promises:', registrationTokens);
        const postData = {
          'registration_ids': registrationTokens,
          "notification": {
            "body": "ride completed by created user",
            "title": result.name
          },
          "data":  result
        };
        const customHeaders = {
          'Authorization': 'key=AAAAdg_f35E:APA91bEgdpg4AH4lanYL7-9s18P6EotNpFKCVT8cDGwcK-uFV13e12eJAOXWfJxBADRQSvi0kn24mTTZbQeNSlWNi8zTvuDWossEJ3vXi1wAFHetwQmwJzmSs9YhC2FLXRRfrRM1qdLb', // Example of an authorization header
          'Content-Type': 'application/json' // Replace with your custom headers
        };
        axios.post(fcmUrl, postData,{headers: customHeaders})
        .then((response) => {
          console.log('Response:', response.data);
          res.send(response.data).status(200);
        })
        .catch((error) => {
          console.error('Error:', error);
        });
    })
    .catch(error => {
      console.error('An error occurred:', error);
    });
})
app.patch('/fcm_token',  async (req, res) => {
  console.log("fcm_token",req.body);
  try {
    const updatedFields = {'fcmToken':req.body.fcm_token}
    const usersCollection = req.db.collection('profiles');
    const result = await usersCollection.updateOne({ _id: new ObjectId(req.body.userid) },
    { $set: updatedFields });    
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'profile not found' });
    }
    
    res.status(200).json({ message: 'profile updated with fcmtoken' });
  } catch (error) {
    console.error('Error retrieving users from MongoDB:', error);
    res.sendStatus(500);
  }
  req.client.close();
})

if(process.env.DEV === 'true')
{
  app.listen(process.env.PORT, () => 
    console.log(`Server is listening on port ${process.env.PORT}.${process.env.DEV} `)
  );
}
else{
  exports.handler = serverless(app);
}
