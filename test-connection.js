require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://admin:password123321@clustercampusarena.jlehwpg.mongodb.net/student_feedback';

console.log('Testing MongoDB Atlas connection...');
console.log('URI:', MONGODB_URI.replace(/password123321/, '***'));

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB Atlas connected successfully');
    console.log('Database:', mongoose.connection.db.databaseName);
    
    // Test schema
    const testSchema = new mongoose.Schema({
      name: String,
      timestamp: { type: Date, default: Date.now }
    });
    
    const TestModel = mongoose.model('Test', testSchema);
    
    // Create and save test document
    const testDoc = new TestModel({ name: 'Connection Test' });
    
    return testDoc.save();
  })
  .then((saved) => {
    console.log('✅ Test document saved:', saved._id);
    
    // Clean up test document
    return mongoose.model('Test').findByIdAndDelete(saved._id);
  })
  .then(() => {
    console.log('✅ Test document cleaned up');
    console.log('✅ Database connection test completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Connection test failed:', error.message);
    process.exit(1);
  });