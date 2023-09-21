const express = require('express');
const serverless = require('serverless-http');
const axios = require('axios');
require('dotenv').config();

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
  console.log("start_ride",req.body);
  const ridesCollection = req.db.collection('trips');
  const result = await ridesCollection.findOne({ _id: new ObjectId(req.body.rideId) });
  const postData = {
    "to": req.body.to ,
    "notification": {
      "body": "New announcement"
      // "OrganizationId": "2",
      // "content_available": true,
      // "priority": "high",
      // "subtitle": "Elementary School",
      // "title": "hello"
    },
    "data":  result
  };
  const customHeaders = {
    'Authorization': 'key=AAAAdg_f35E:APA91bEgdpg4AH4lanYL7-9s18P6EotNpFKCVT8cDGwcK-uFV13e12eJAOXWfJxBADRQSvi0kn24mTTZbQeNSlWNi8zTvuDWossEJ3vXi1wAFHetwQmwJzmSs9YhC2FLXRRfrRM1qdLb', // Example of an authorization header
    'Content-Type': 'application/json' // Replace with your custom headers
  };
  // console.log("result",result)
  axios.post(fcmUrl, postData,{headers: customHeaders})
  .then((response) => {
    console.log('Response:', response.data);
    res.send(response.data).status(200);
  })
  .catch((error) => {
    console.error('Error:', error);
  });

})
app.get('/start_ride',  async (req, res) => {

  const postData = {
    "to": "fv4na3HGS9CRVYRBQE5LTi:APA91bGw9TXGfm5tmS_vSyWirX7Q7YmsdiMBS6hfibOi5i5IghyPl4n6we75EAyuctwHKUP-QJSGmoN2WGBkiPFRVonB-X_DqbuISsLqqFWtp75CfdwiuFRunKbvSop6oLt4UD8vHWiF",
    "notification": {
      "body": "New announcement assigned2",
      "OrganizationId": "2",
      "content_available": true,
      "priority": "high",
      "subtitle": "Elementary School",
      "title": "hello"
    },
    "data":  {
      "_id": "64aabdb502343f44c4f95f7d",
      "name": "Male Trip",
      "location": {
        "source": {"name": "shimoga", "latitude": 40.7829, "longitude": -73.9654},
        "destination": {"name": "goa", "latitude": 40.7829, "longitude": -73.9654}
      },
      "start_time": "2023-07-09 12:30:00",
      "end_time": "2023-07-10 12:30:00",
      "riders": ["6173748a73b3c48b78e4e7f1", "6173748a73b3c48b78e4e7f2"]
    }
  };
  const customHeaders = {
    'Authorization': 'key=AAAAdg_f35E:APA91bEgdpg4AH4lanYL7-9s18P6EotNpFKCVT8cDGwcK-uFV13e12eJAOXWfJxBADRQSvi0kn24mTTZbQeNSlWNi8zTvuDWossEJ3vXi1wAFHetwQmwJzmSs9YhC2FLXRRfrRM1qdLb', // Example of an authorization header
    'Content-Type': 'application/json' // Replace with your custom headers
  };
  console.log("postData",postData,customHeaders);
  axios.post(fcmUrl, postData,{headers: customHeaders})
  .then((response) => {
    console.log('Response:', response.data);
    res.send(response.data).status(200);
  })
  .catch((error) => {
    console.error('Error:', error);
  });
});
app.get('/pn',  async (req, res) => {
  console.log("inside pn")
  const registrationTokens = ['device_token_1', 'device_token_2'];
// app.post('/rides/start/:id', async (req, res) => {
  try {
    const topic = 'rides';
    const message = {
      data: {
        score: '850',
        time: '2:45'
      },
      notification: {
        title: 'Notification Title',
        body: 'Notification Body',
      },
      topic: 'registrationTokens',
    };
    await firebaseAdmin
    .messaging()
    .send(message)
    .then((response) => {
      console.log('Successfully sent trip message:', response);

    })
    .catch((error) => {
      console.error('Error sending message:', error);
    });
  } catch (error) {
    console.error('Error retrieving users from MongoDB:', error);
    res.sendStatus(500);
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
