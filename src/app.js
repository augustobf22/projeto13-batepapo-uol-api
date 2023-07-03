import express from 'express';
import cors from 'cors';
import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";
import joi from "joi";
import dayjs from "dayjs";

//call app
const app = express();

// config app
app.use(express.json());
app.use(cors());
dotenv.config()

//connect to db
const mongoClient = new MongoClient(process.env.DATABASE_URL);
let db;

mongoClient.connect()
	.then(() => db = mongoClient.db())
	.catch((err) => console.log(err.message))

//inputs schemas
const participantSchema = joi.object({
    name: joi.string().required()
});

const userSchema = joi.object({
    name: joi.string().required(),
    lastStatus: joi.number().required()
});

const msgSchema = joi.object({
    to: joi.string().required(),
    text: joi.string().required(),
    type: joi.string().valid('message','private_message').required()
});

//endpoints
app.post("/participants", async(req, res) => {
    const {name} = req.body;

    const validation = participantSchema.validate(req.body, {abortEarly: false});

    if(validation.error){
        const errors = validation.error.details.map(detail => detail.message);
        return res.status(422).send(errors);
    }

    try{
        const participant = await db.collection("participants").findOne({name: name});
        if(participant) return res.status(409).send("Já existe esse usuário!");

        const lastStatus = Date.now();
        await db.collection("participants").insertOne({name, lastStatus});

        const time = dayjs(Date.now()).format('HH:mm:ss');
        await db.collection("messages").insertOne({from: name, to: 'Todos', text: 'entra na sala...', type: 'status', time: time});

        res.sendStatus(201);
    } catch(err){
        res.status(500).send(err.message);
    }
});

app.get("/participants", async (req, res) => {
	try{
        const participants = await db.collection("participants").find().toArray();
        res.send(participants);
    } catch(err){
        res.status(500).send(err.message);
    }
});

app.post("/messages", async(req, res) => {
    const {to, text, type} = req.body;
    const user = req.headers.user;

    const validation = msgSchema.validate(req.body, {abortEarly: false});

    if(validation.error){
        const errors = validation.error.details.map(detail => detail.message);
        return res.status(422).send(errors);
    }

    try{
        const participant = await db.collection("participants").findOne({name: user});
        if(!participant) return res.status(422).send("Usuário não está na sala!");

        const time = dayjs(Date.now()).format('HH:mm:ss');
        await db.collection("messages").insertOne({from: user, to: to, text: text, type: type, time: time});

        res.sendStatus(201);
    } catch(err){
        res.status(500).send(err.message);
    }
});

app.get("/messages", async(req, res) => {
    const user = req.headers.user;

    //mostrar se: to === todos || to === user || from === user

	try{
        const messages = await db.collection("messages").find({$or: [{to: 'Todos'}, {to: user}, {from: user}]}).toArray();
        res.send(messages);
    } catch(err){
        res.status(500).send(err.message);
    }
});

app.post("/status", async(req, res) => {

});
  
const PORT = 5000;
app.listen(PORT, ()=>console.log(`Servidor rodando na porta ${PORT}`));