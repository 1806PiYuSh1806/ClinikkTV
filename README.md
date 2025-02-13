# Clinikk TV Backend

## Project Overview
Clinikk TV is a backend service that provides users access to health-related content in the form of audio and video. This project is a Proof of Concept (POC) for Clinikk TV's backend API, enabling user authentication, media upload, retrieval, streaming, and interaction (likes/unlikes).

## Tech Stack
- **Backend Framework**: Node.js
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Token)
- **Cloud Storage**: AWS S3
- **Web Server**: Express.js

## Backend Structure
```
ClinikkTV/
│── controllers/
│   ├── media.controller.js
│   ├── user.controller.js
│── db/
│   ├── db.js  # MongoDB connection setup
│── middlewares/
│   ├── auth.middleware.js
│── models/
│   ├── blacklistToken.model.js
│   ├── media.model.js
│   ├── user.model.js
│── routes/
│   ├── media.routes.js
│   ├── user.routes.js
│── services/
│   ├── media.service.js
│   ├── user.service.js
│── app.js
│── server.js
│── .env
│── package.json
```

## Setup Instructions
### 1. Clone the Repository
```sh
$ git clone https://github.com/1806PiYuSh1806/ClinikkTV.git
$ cd ClinikkTV
```

### 2. Install Dependencies
```sh
$ npm install
```

### 3. Set Up Environment Variables
Create a `.env` file in the root directory and configure the following variables:
```
PORT=4000
DB_CONNECT=<your_mongodb_connection_string>
JWT_SECRET=<your_jwt_secret>
AWS_ACCESS_KEY_ID=<your_aws_access_key>
AWS_SECRET_ACCESS_KEY=<your_aws_secret_key>
AWS_REGION=<your_aws_region>
AWS_BUCKET_NAME=<your_s3_bucket_name>
```

### 4. Start the Server
```sh
$ npm start
```

## API Endpoints

### User Authentication
| Method | Endpoint        | Description |
|--------|---------------|-------------|
| POST   | /users/register | Register a new user |
| POST   | /users/login | Login and obtain JWT token |

### Media Management
| Method | Endpoint | Description |
|--------|---------|-------------|
| POST   | /media/upload | Upload a video/audio file |
| GET    | /media/list | Retrieve all media metadata |
| GET    | /media/list/:id | Retrieve specific media metadata |
| GET    | /media/stream/:id | Stream a video/audio file |
| GET    | /media/:id/like | Like a media file |
| GET    | /media/:id/unlike | Unlike a media file |

## Database Schemas

### Media Model (`media.model.js`)
```javascript
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MediaSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  url: { type: String, required: true },
  type: { type: String, enum: ["video", "audio"], required: true },
  uploadedBy: { type: Schema.Types.ObjectId, ref: "user" },
  likes: [{ type: Schema.Types.ObjectId, ref: "user" }],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Media", MediaSchema);
```

### User Model (`user.model.js`)
```javascript
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
  fullname: {
    firstname: { type: String, required: true, minlength: 3 },
    lastname: { type: String, minlength: 3 },
  },
  email: { type: String, required: true, minlength: 5 },
  password: { type: String, required: true, select: false },
});

userSchema.methods.generateAuthToken = function () {
  return jwt.sign({ _id: this._id }, process.env.JWT_SECRET, { expiresIn: "24h" });
};

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.statics.hashPassword = async function (password) {
  return await bcrypt.hash(password, 10);
};

module.exports = mongoose.model("user", userSchema);
```

### Blacklisted Token Model (`blacklistToken.model.js`)
```javascript
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const blacklistTokenSchema = new Schema({
  token: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now, expires: 86400 },
});

module.exports = mongoose.model('BlacklistToken', blacklistTokenSchema);
```

## Running the Project
1. Start the server using `npm start`.
2. Use **Postman** or any API client to test endpoints.
3. Ensure MongoDB is running and AWS credentials are correctly set.

## License
This project is for educational and demonstration purposes only.

## Author
PIYUSH UPADHYAY
piyush.upadhyay22b@iiitg.ac.in