const express = require('express');
const cors = require('cors');
require("dotenv").config();
const ObjectId = require('mongodb').ObjectId;
const { MongoClient } = require('mongodb');


//call express
const app = express();

const port = process.env.PORT || 5000;


//middle ware

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.l11nf.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

console.log(uri)


async function run() {
    try {
        await client.connect();

        const database = client.db("All_Products");
        const productCollection = database.collection("products");
        const ordersCollection = database.collection("orders_products");
        const reviewCollection = database.collection("user_review");
        const userCollection = database.collection("users");



        //add product

        app.post('/product', async (req, res) => {
            const product=req.body;
            const result=await productCollection.insertOne(product);
            res.send(result)
        })

        //delete api

        app.delete('/products/:id',async(req,res)=>{
            const id=req.params.id;
            const query={_id:ObjectId(id)}
            const result = await productCollection.deleteOne(query)
            res.send(result)
        })

        app.delete('/orderProducts/:id',async(req,res)=>{
            const id=req.params.id;
            const query={_id:ObjectId(id)}
            const result = await ordersCollection.deleteOne(query)
            res.send(result)
        })


        //get all product 
        app.get('/products',async(req,res)=>{
            const result=await productCollection.find({}).toArray();
            res.send(result)
        })


        // Show single product for placeOrders
        app.get('/products/:id',async(req,res)=>{
            const id=req.params.id;
            const query={_id:ObjectId(id)}
            const result=await productCollection.findOne(query);
            res.send(result);
        })


        //add orders data

        app.post('/orderProducts',async(req,res)=>{
            const product=req.body;
            const result=await ordersCollection.insertOne(product);
            res.send(result)
        })

        //review user
        app.post('/reviewUser',async(req,res)=>{
            const review=req.body;
            const result=await reviewCollection.insertOne(review);
            res.send(result)
        })

        //delete review

        app.delete('/review/:id',async(req,res)=>{
            const id=req.params.id;
            const query={_id:ObjectId(id)}
            const result = await reviewCollection.deleteOne(query)
            res.send(result)
        })
        ////conformation api


        app.put('/confirmation/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const updateDoc = {
                $set: { status: 'confirm' }
                
            };
            const result = await ordersCollection.updateOne(query, updateDoc)
            
            res.json(result);

        })

        //user post 
        app.post('/users',async(req,res)=>{
            const user=req.body;
            const result=await userCollection.insertOne(user);
            res.send(result)
        })


        //check admin

        

        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };

            const options = { upsert: true };

            const updateDoc = { $set: user };
            const result = await userCollection.updateOne(filter, updateDoc, options)
            res.json(result);

        })

        //admin make

        app.put('/users/admin', async (req, res) => {

            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await userCollection.updateOne(filter, updateDoc);
            console.log(result)
            res.json(result)

            
        })


        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
      
            const user = await userCollection.findOne(query);

            
            
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })


        //get all order product

        app.get('/allOrdersProduct', async (req, res) => {
            const result = await ordersCollection.find({}).toArray();
            res.send(result)
        })

        //get all review
        app.get('/review',async(req,res)=>{
            const result=await reviewCollection.find({}).toArray();
            res.send(result)
        })
        //get login user data show

        app.get('/orderProducts', async (req, res) => {
            const email = req.query.email;
            const query = { email: email }
            const cursor = ordersCollection.find(query);
            const products = await cursor.toArray();
            res.json(products)
        })




    } finally {
    //   await client.close();
    }
  }
  run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Hello world')
})




app.listen(process.env.PORT || 5000, () => {
    console.log('My project is Running',port)
})