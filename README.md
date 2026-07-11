# Magicpin AI Challenge

An AI-powered messaging engine built for the Magicpin Vera AI Challenge.

## Features

- Context ingestion API
- AI-powered trigger processing
- AI conversational reply endpoint
- Gemini integration
- JSON response validation
- Rule-based fallback responses

## Tech Stack

- Node.js
- Express.js
- Google Gemini API
- JavaScript

## Endpoints

### POST /v1/context
Stores merchant, customer, category and trigger contexts.

### POST /v1/tick
Processes available triggers and generates personalized AI actions.

### POST /v1/reply
Continues conversations using Gemini AI.

### GET /v1/healthz
Health check endpoint.

### GET /v1/metadata
Project metadata.

## Run Locally

```bash
npm install
```

```bash
npm run dev
```

Server runs on

```
http://localhost:3000
```

## Environment Variables

Create a `.env` file:

```
PORT=3000
GEMINI_API_KEY=YOUR_API_KEY
```

## Author

Deepak Kumar