import express from 'express';
import cors from 'cors';
import { MongoClient } from "mongodb";
import dotenv from "dotenv";

const app = express();

app.use(express.json());
app.use(cors());
dotenv.config()

const mongoClient = new MongoClient(process.env.DATABASE_URL);
let db;

mongoClient.connect()
	.then(() => db = mongoClient.db())
	.catch((err) => console.log(err.message))

app.get("/usuarios", (req, res) => {
	// buscando usuários
	const promise = db.collection("users").find().toArray();

	promise.then(users => res.send(users))  // array de usuários
	promise.catch(err => res.status(500).send(err.message))  // mensagem de erro
});

app.post('/sign-up', (req, res) => {
    const newUser = req.body;
    users.push(newUser);

    res.send("OK");
});

app.post('/tweets', (req, res) => {
    const newTweet = req.body;
    const validUser = users.find(e => e.username === newTweet.username);

    if(!validUser){
        res.send("UNAUTHORIZED");
        return;
    }

    tweets.push(newTweet);
    res.send("OK");
});

app.get('/tweets', (req, res) => {
    tweets.forEach(t => t.avatar = users.find(e => e.username === t.username).avatar);
    
    let tweetsGet;
    if(tweets.length>9){
        tweetsGet = tweets.slice(-10);
    } else {
        tweetsGet = tweets.slice(0, tweets.length);
    }

    res.send(tweetsGet);
});
  
const PORT = 5000;
app.listen(PORT, ()=>console.log(`Servidor rodando na porta ${PORT}`));