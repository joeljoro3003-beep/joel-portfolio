# Joel — Full-Stack Developer Portfolio

A premium, production-ready full-stack portfolio website.

## Tech Stack

- **Frontend:** HTML, CSS, JavaScript (Vanilla)
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Mongoose)

## Setup

```bash
npm install
npm start
```

Server runs at `http://localhost:3000`

## API

| Method | Route      | Description              |
|--------|-----------|--------------------------|
| POST   | /contact  | Submit contact message   |
| GET    | /messages | Retrieve all messages    |

## Structure

```
├── public/          # Frontend
│   ├── index.html
│   ├── style.css
│   ├── script.js
│   └── assets/frames/
├── server/          # Backend
│   ├── server.js
│   └── models/Contact.js
├── .env             # Environment variables
└── package.json
```
