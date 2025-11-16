# Student Feedback Form

ExpressJS web application with server-side validation and MongoDB Atlas integration.

## Features
- ✅ Server-side form validation
- ✅ MongoDB Atlas database storage
- ✅ Clean responsive UI
- ✅ Error handling and display

## Local Development

1. Install dependencies:
```bash
npm install
```

2. Run the application:
```bash
npm start
```

3. Open http://localhost:3003

## Database
- **MongoDB Atlas Cluster:** clustercampusarena
- **Database:** student_feedback
- **Collection:** feedbacks

## Deployment

### Environment Variables
- `MONGODB_URI`: mongodb+srv://admin:password123321@clustercampusarena.jlehwpg.mongodb.net/student_feedback
- `PORT`: Server port (default: 3003)

### Deploy to Render
1. Connect GitHub repository
2. Set environment variable: `MONGODB_URI`
3. Deploy automatically

## Form Validation Rules
- **Full Name**: Required, alphabets + spaces only
- **Email**: Valid email format required
- **Phone**: Exactly 10 digits
- **Roll Number**: Required
- **Branch**: Required selection
- **Course Usefulness**: Required radio selection
- **Rating**: Required, 1-5 scale
- **Suggestions**: Optional

## View Data
Use MongoDB Compass with connection string:
```
mongodb+srv://admin:password123321@clustercampusarena.jlehwpg.mongodb.net/
```