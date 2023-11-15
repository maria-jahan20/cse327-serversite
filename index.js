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
// app.use(bodyParser.json())


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
  // Create a schema for your MCQ questions


async function run(){
    try{


         // Connect to the database
         await client.connect();
         const classCollection = client.db("onlinehashor").collection("newclass");
         const newStudentCollection=client.db("newdb").collection("classes");
         const questionCollection=client.db("quizzes").collection('questions');



          // get the stored classes from database 
       // get the stored classes from the database
app.get('/classes', async (req, res) => {
  try {
    const userEmail = req.query.email; // Get the user's email from the query parameter

    if (!userEmail) {
      return res.status(400).json({ error: 'User email is required.' });
    }

    const query = { email: userEmail }; // Modify the query to filter classes by user email
    const cursor = classCollection.find(query);
    const classes = await cursor.toArray();
    res.json(classes);
  } catch (error) {
    console.error('Error fetching classes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


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
        // app.get('/showclasses/:id', async (req, res) => {
        //   const id = req.params.id;
        //   const objectId = { _id: new ObjectId(id) };
        //   const cursor = await classCollection.findOne(objectId);
        //   if (cursor) {
        //     res.send(cursor);
        //     console.log(cursor);
        //   } else {
        //     res.status(404).json({ error: 'Class not found' });
        //   }
        // });
        

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


         // posting question in mongodb 
        
         app.post("/classes/:id/design", async (req, res) => {
          const { id } = req.params;
          const classId = new ObjectId(id);
          // console.log(id);
          const { questions,formId } = req.body; // Access the questions array from the request body
        
          try {
            const questionsToInsert = questions.map((question) => ({
              formId:formId,
              question: question.question,
              options: question.options,
              correctOption: question.correctOption,
              classId: classId,
            }));
        
            // Assuming you are using a MongoDB collection named questionCollection
            const result = await questionCollection.insertMany(questionsToInsert);
        
            res.status(201).json({ message: "Questions posted successfully" });
          } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error posting questions" });
          }
        });

        // app.get('/classes/:id/:formId/question', async (req, res) => {
        //   try {
        //     const classId = req.params.id;
        //     const formId = req.params.formId; // Retrieve formId from the URL
        
        //     // Assuming questionCollection is your MongoDB collection
        //     const query = await questionCollection.find({
        //       classId: new ObjectId(classId),
        //       formId: formId,
        //     }).toArray();
        
        //     if (query.length > 0) {
        //       res.json(query);
        //       console.log(query);
        //     } else {
        //       res.status(404).json({ error: 'Form not found for the given class and formId' });
        //     }
        //   } catch (error) {
        //     console.error("Error fetching data:", error);
        //     res.status(500).json({ error: 'Internal server error' });
        //   }
        // });

        app.get('/classes/:id/:formId/question', async (req, res) => {
          try {
            const classId = req.params.id;
            const formId = req.params.formId;
        
            const query = await questionCollection.find({
              classId: new ObjectId(classId),
              formId: formId,
            }).toArray();
        
            if (query.length > 0) {
              res.json(query);
              console.log(query);
            } else {
              res.status(404).json({ error: 'Form not found for the given class and formId' });
            }
          } catch (error) {
            console.error('Error fetching data:', error);
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
      

         


        app.post('/classes/:id/student', async (req, res) => {
          try {
            const {id}=req.params;
            console.log(id);
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
              text:`http://localhost:3000/classes/${id}`
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
