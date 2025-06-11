require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');

const User = require('./routers/User');
const Profile = require('./routers/Profile');
const Company = require('./routers/Company');
const Notification = require('./routers/Notification');
const Application = require('./routers/Application');
const Recruiter = require('./routers/Recruiter');
const SavedJob = require('./routers/SavedJob');
const Job = require('./routers/Job');
const ViewedJob = require('./routers/ViewedJob');
const FollowedCompany= require('./routers/FollowedCompany');
const Feedback = require('./routers/Feedback');
const Interview = require('./routers/Interview');
const JobStats = require('./routers/JobStats');
const Message = require('./routers/Message');
const Report = require('./routers/Report');
const Test = require('./routers/Test');
const TestAnswer = require('./routers/TestResult');
const TestQuestion = require('./routers/TestQuestion');
const TestResult = require('./routers/TestResult');
const Filter = require('./routers/Fliter');
const logoutRouter = require('./routers/Logout'); 
const AvailableTime = require('./routers/AvailableTime');
const Academic = require('./routers/Academic');
const Experience = require('./routers/Experience');
const CvFile = require('./routers/CVFile');
const TestAttempt = require('./routers/TestAttempt');
const Invitation = require('./routers/Invitation');
const InterviewSchedule = require('./routers/InterviewSchedule');
const JobRecommendation = require('./routers/JobRecomend');
const Moderation = require('./routers/Moderation');
const ReviewSchema= require('./routers/ReviewSchema');
const CategorySchema = require('./routers/CategorySchema');
const Package = require('./routers/Package');
const Subscription = require('./routers/Subscription'); 
const Payment = require('./routers/Payment');

// Import middleware authenticateSocket
const authenticateSocket = require('./middleware/authenticateSocket');
const AICV = require('./routers/AICV');

// Cấu hình cloudinary
const cloudinary = require('cloudinary').v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();

// Tạo httpServer cho Socket.IO
const httpServer = http.createServer(app);
const io = socketIO(httpServer, {
  cors: {
    origin: "http://localhost:3000", // URL frontend
    methods: ["GET", "POST",'PUT', 'DELETE'],
    credentials: true,  // Allow credentials
  }
});
io.use(authenticateSocket); 
app.use((req, res, next) => {
  req.io = io;  // Gắn io vào trong request object
  next();
});
io.use(authenticateSocket);  // Áp dụng middleware authenticateSocket

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
  });
});

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Join user-specific room
  socket.on('join', (userId) => {
    console.log(`User ${userId} joined room`);
    socket.join(userId); // Dùng để gửi socket.emit chỉ tới user đó
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
  });
});

// Cấu hình CORS và Middleware khác
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, // Allow credentials (cookies, tokens)
}));

app.use(express.json());

// Sử dụng router
app.use('/api/users', User);
app.use('/api/profiles', Profile);
app.use('/api/companies', Company);
app.use('/api/notifications', Notification);
app.use('/api/applications', Application);
app.use('/api/recruiters', Recruiter);
app.use('/api/savedjobs', SavedJob);
app.use('/api/jobs', Job);
app.use('/api/viewedjobs', ViewedJob);
app.use('/api/followedcompanies', FollowedCompany);
app.use('/api/feedbacks', Feedback);
app.use('/api/interviews', Interview);
app.use('/api/jobstats', JobStats);
app.use('/api/messages', Message);
app.use('/api/reports', Report);
app.use('/api/tests', Test);
app.use('/api/testanswer', TestAnswer);
app.use('/api/testquestion', TestQuestion);
app.use('/api/testresult', TestResult);
app.use('/api/filter', Filter);
app.use('/api/availabletime', AvailableTime);
app.use('/api/academic', Academic);
app.use('/api/experience', Experience);
app.use('/api/cvfile', CvFile);
app.use('/api/testattempt', TestAttempt);
app.use('/api/invitation',Invitation);
app.use('/api/interviewschedule', InterviewSchedule);
app.use('/api/jobrecomend',JobRecommendation);
app.use('/api/moderations',Moderation);
app.use('/api', logoutRouter);
app.use('/api/aicv', AICV);
app.use('/api/reviewschema',ReviewSchema);
app.use('/api/categoryschema',CategorySchema);
app.use('/api/package',Package);
app.use('/api/subscription',Subscription);
app.use('/api/payment',Payment);

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/hirepoint', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("Could not connect to MongoDB:", err));

// Lắng nghe trên cổng 5000
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
