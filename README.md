# Campus AI Tool

An AI-powered study assistant designed to help students upload materials, process documents, and interact with study notes using the Google GenAI SDK.

## Tech Stack

* **Backend:** Node.js, Express
* **File Management:** Multer
* **AI Integration:** Google GenAI SDK (`gemini-3.6-flash`)
* **Frontend:** HTML5, JavaScript (`campus_ai_tool.html`)

## Prerequisites

Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

## Setup Instructions

1. Clone the repository:
```bash
git clone https://github.com/Petersap4/campus-ai-tool.git
cd campus-ai-tool

```


2. Install the required dependencies:
```bash
npm install

```


3. Create a `.env` file in the root directory and add your Google Gemini API key:
```env
GEMINI_API_KEY=your_actual_api_key_here

```


4. Start the development server:
```bash
node server.js

```


5. Open your browser and go to `http://localhost:3000` to run the application or just open the HTML file (`campus_ai_tool.html`) with your preferred browser(e.g. Google Chrome, Microsoft Edge, Brave).
