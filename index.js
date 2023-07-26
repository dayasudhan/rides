const express = require('express');
//const serverless = require('serverless-http');
require('dotenv').config();
//const MongoClient = require('mongodb').MongoClient;
const {ObjectId,MongoClient}  = require('mongodb');
//const URI = 'mongodb+srv://heroku_mhgndgwl:sudhan@cluster0.w1k1zag.mongodb.net/?retryWrites=true&w=majority';
// require('dotenv').config();
const port =   3002;
const app = express();
app.use(express.json());
app.use(async (req, res, next) => {
  try {
    console.log("process.env.MONGOURI",process.env.MONGOURI)
    const client = await MongoClient.connect(process.env.MONGOURI);
    const db = client.db('test');

    req.db = db;
    next();
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    res.sendStatus(500);
  }
});
app.get('/', (req, res) => res.send('Namaste Home Page'));
app.get('/test', (req, res) => res.send('Namaste Dayasudhan 🙏'));

app.get('/rides', async (req, res) => {
  try {
    const collection = req.db.collection('trips');
    const leads = await collection.find().toArray();
    res.json(leads);
  } catch (error) {
    console.error('Error retrieving users from MongoDB:', error);
    res.sendStatus(500);
  }
});
app.post('/rides', async (req, res) => {
  try {
    const collection = req.db.collection('trips');
    const response = await collection.insertOne(req.body);
    res.json(response);
  } catch (error) {
    console.error('Error retrieving users from MongoDB:', error);
    res.sendStatus(500);
  }
});
app.delete('/rides/:id', async (req, res) => {
  try {
    const collection = req.db.collection('trips');
    console.log("req.params.id",req.params.id)
    const result = await collection.deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Document not found' });
    }
    res.status(200).json({ message: 'Ride Document deleted successfully' });
  } catch (error) {
    console.error('Error retrieving users from MongoDB:', error);
    res.sendStatus(500);
  }
});
app.patch('/rides/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const updatedFields = req.body;
    const collection = req.db.collection('trips');
    console.log("req.params.id",req.params.id)
    const result = await collection.updateOne({ _id: new ObjectId(req.params.id) },
    { $set: updatedFields });    
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'ride not found' });
    }
    
    res.status(200).json({ message: 'ride updated successfully' });
  } catch (error) {
    console.error('Error retrieving users from MongoDB:', error);
    res.sendStatus(500);
  }
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
});
if(process.env.DEV === 'true')
{
  app.listen(3000, () => 
    console.log(`Server is listening on port ${process.env.PORT}.${process.env.DEV} `)
    
  );
}
else{
  exports.handler = serverless(app);
}
