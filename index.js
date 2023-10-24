const express = require('express');
const cors = require('cors');
const bodyParser =require('body-parser');
const nodemailer =require('nodemailer');
const { MongoClient, ServerApiVersion,ObjectId } = require('mongodb');


require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.db_user}:${process.env.db_password}@cluster0.w68aaz5.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });

async function run(){
    try{
         // Connect to the database
         await client.connect();
         const classCollection = client.db("onlinehashor").collection("newclass");
         const newStudentCollection=client.db("newdb").collection("classes");

          // get the stored classes from database 
         app.get('/classes', async(req,res)=>{
          const query={};
          const cursor=classCollection.find(query);
          const classes=await cursor.toArray();
          res.send(classes);
         })

         //get the new added students from database
         app.get('/students', async(req,res)=>{
          const query={};
          const cursor=newStudentCollection.find(query);
          const student=await cursor.toArray();
          res.send(student);
         })

        //  get invitation email 
        


        // stored the new classes 
         app.post('/user', async(req,res) =>{
          const newUser=req.body;
          console.log("adding new user", newUser)
          const result=await classCollection.insertOne(newUser);
          res.send(result); 

         })

         //stored people in new classes database
         app.post('/student', async(req,res)=>{
          const { recipent}=req.body;


          // owner email and password 
          const emailUser=process.env.emailUser;
          const emailPassword=process.env.emailPassword;


          const transporter =nodemailer.createTransport({
            service: 'gmail',
            auth:{
              user: emailUser,
              pass: emailPassword
            }
          });
          const mailOption ={
            from: emailUser,
            to: recipent,
            subject: "Class invitation link",
            text: 'This is a test email'
          };
          transporter.sendMail(mailOption,(error,info)=>{
            if(error){
              console.log(error);
              res.status(500).json({ success: false, message: 'Failed to send invitation' });
            }
            else {
              console.log('Email sent: ' + info.response);
              res.json({ success: true, message: 'Invitation sent successfully' });
            }
          })

          //storing in database
          const result1 = await newStudentCollection.insertOne({ email: recipent });
          res.json({ success: true, message: 'Invitation sent successfully', result: result1 });


         })

           

        }
    finally{
      
    }
   
    
  }
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`listening to port ${port}`);
});
