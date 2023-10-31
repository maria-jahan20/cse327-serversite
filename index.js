const express = require('express');
const cors = require('cors');
const bodyParser =require('body-parser');
const nodemailer =require('nodemailer');
const { MongoClient, ServerApiVersion } = require('mongodb');
const { ObjectId } = require('mongodb');



require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

// middle ware 
app.use(cors());
app.use(express.json());
app.use(bodyParser.json())


const uri = `mongodb+srv://${process.env.db_user}:${process.env.db_password}@cluster0.w68aaz5.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });
  const emailUser=process.env.emailUser;
  const emailPassword=process.env.emailPassword;

  const transporter =nodemailer.createTransport({
    service: 'gmail',
    auth:{
      user: emailUser,
      pass: emailPassword
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

        //  get classes from database 
        app.get('/classes/:id', async(req,res)=>{
          try {
          const id = req.params.id;
          
          const objectId={_id:new ObjectId(id)};
         
          const cursor=await classCollection.findOne(objectId);
          if (cursor) {
            res.send(cursor);
            console.log(cursor);
          } else {
            res.status(404).json({ error: 'Class not found' });
          }
        } catch (error) {
          console.error("Error fetching data:", error);
          res.status(500).json({ error: 'Internal server error' });
        }

     


         
         
          

         
        })

     // get the student 
app.get('/student', async (req, res) => {
  const query = {};
  const cursor = newStudentCollection.find(query);
  const students = await cursor.toArray();
  
  // Send a JSON response with a message and the data
  // res.status(200).json({
  //   students: students
  // });
  res.send(students);
});



        //  get the new added students from database 
         app.get('/classes/:id/student', async(req,res)=>{
          try {
            const classId = req.params.id;
           
        
            // Find all students with the matching classId
            const students = await newStudentCollection
              .find({ classId:new ObjectId(classId) })
              .toArray();
        
            res.status(200).json(students);
          }
          
          catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal server error' });
          }
        });
      
        
        
        
        
        
        


        // stored the new classes 
         app.post('/classes', async(req,res) =>{
          const newClass=req.body;
          console.log("adding new user", newClass)
          const result=await classCollection.insertOne(newClass);
          res.send(result); 

         })
        // app.post('/user',async(req,res)=>{
        //   const newUser=req.body;
        //   const id=req.params.id;
        //   newUser.id=id;

        // })

        //  //stored people in new classes database
        //  app.post('/student', async(req,res)=>{
          
        //   const {recipient}=req.body;

        //   // const { recipient}=req.body;


          

        // //  to send the email 
        //   const mailOption ={
        //     from: emailUser,
        //     to: recipient,
        //     subject: "Class invitation link",
        //     text: 'This is a test email'
        //   };
        //   transporter.sendMail(mailOption,(error,info)=>{
        //     if(error){
        //       console.log(error);
        //       res.status(500).json({ success: false, message: 'Failed to send invitation' });
        //     }
        //     else {
        //       console.log('Email sent: ' + info.response);
        //       res.json({ success: true, message: 'Invitation sent successfully' });
        //     }
        //   })

        //   //storing in database
        //   const result1 = await newStudentCollection.insertOne({ email: recipient });
        //   res.json({ success: true, message: 'Invitation sent successfully', result: result1 });


         


        app.post('/classes/:id/student', async (req, res) => {
          try {
            const {id}=req.params;
            const classId=new ObjectId(id)
            
            const { recipient} = req.body;
            console.log(recipient);
            console.log(classId);

           

            const student = {
              email:recipient,

              classId:classId , // Convert classId to ObjectId
            
            };
          
        
            // Send the email
            const mailOptions = {
              from: emailUser,
              to: recipient,
              subject: "Class invitation link",
              text: 'This is a test email'
            };
        
            transporter.sendMail(mailOptions, async (error, info) => {
              if (error) {
                console.log(error);
                res.status(500).json({ success: false, message: 'Failed to send invitation' });
              } else {
                console.log('Email sent: ' + info.response);
        
                // Store the email in the database along with the associated classId
                const result1 = await newStudentCollection.insertOne(student);
        
                res.json({ success: true, message: 'Invitation sent successfully', result: result1 });
              }
            });
          } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'An error occurred. Please try again later.' });
          }
        });
        

        //  delete students from class 
        app.delete('/students/:id', async (req, res) => {
          const id = req.params.id;
          const objectId = new ObjectId(id);
          const query = { _id: objectId };
          const result = await newStudentCollection.deleteOne(query);
          res.send('Student is deleted');
      });
      
      

           

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
