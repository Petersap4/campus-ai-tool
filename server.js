import express from 'express';                              //server framework
import cors from 'cors';                                    //browser frontend - server backend communication
import dotenv from 'dotenv';                                //secret variables
import multer from 'multer';                                //handle multipart/form-data file uploads
import fs from 'fs';                                        //file system module to read uploaded files
import { GoogleGenAI } from '@google/genai';                //import the Google GenAI library

dotenv.config();                    //reading the env file and injecting the api key into memory
const app = express();              //initialize the application
app.use(cors()); 
app.use(express.json());

const upload = multer({ dest: 'uploads/' }); // temporary storage for uploaded PDF files
const ai = new GoogleGenAI({});              //initialize the Google GenAI client

app.post('/api/generate-study-material', upload.single('pdfFile'), async (req, res) => {
    let filePath = null;
    
    try {
        let contentsParam;

        if (req.file) {
            filePath = req.file.path;                                                 // temporary path of the uploaded file
            console.log("Received PDF file from frontend:", req.file.originalname);
            
            const pdfBuffer = fs.readFileSync(filePath);
            const base64Pdf = pdfBuffer.toString("base64");

            contentsParam = [
                {
                    inlineData: {
                        mimeType: "application/pdf",
                        data: base64Pdf
                    }
                },
                `You are an educational AI. Read the provided document and output a valid JSON object. 
                You MUST include ALL THREE of these keys:
                1. "summary": A string containing a summary.
                2. "flashcards": An array of objects with "question" and "answer" strings.
                3. "quiz": An array of exactly 3 objects. Each object must have a "question" string, an "options" array of 4 string choices, and a "correctAnswer" string that matches one of the options.`
            ];
        } else {
            const { topicNotes } = req.body;                                  //extract the notes from the request body
            console.log("Received text notes from frontend:", topicNotes); 

            if (!topicNotes) {
                return res.status(400).json({ error: 'No text or PDF file provided' });
            }

            contentsParam = `You are an educational AI. Read the notes below and output a valid JSON object. 
            You MUST include ALL THREE of these keys:
            1. "summary": A string containing a summary.
            2. "flashcards": An array of objects with "question" and "answer" strings.
            3. "quiz": An array of exactly 3 objects. Each object must have a "question" string, an "options" array of 4 string choices, and a "correctAnswer" string that matches one of the options.

            Here are the notes to analyze:
            ${topicNotes}`;
        }

        const response = await ai.models.generateContent({      //call the Google GenAI API to generate content
            model: 'gemini-3.5-flash-lite',                          //specify the model to use
            contents: contentsParam,                            
            config: {                                           //specify the response format
                responseMimeType: 'application/json',           //strict json output
            }
        });

        console.log("Raw Gemini Output:", response.text);       //log the raw output from the model for debugging

        let rawText = response.text.trim();                     //remove any leading/trailing whitespace
        rawText = rawText.replace(/^```json/, '').replace(/^```/, '').replace(/```$/, '').trim();
        
        const parsedData = JSON.parse(rawText);                 //parse the cleaned string into a JSON object
        res.json(parsedData);                                   //send the parsed JSON back to the frontend

    } catch (error) {
        console.error("Backend Error:", error);
        res.status(500).json({ error: 'Failed to generate study materials' });
    } finally {        
      
      // Automatically clean up the temporary uploaded file whether success or failure
        
        if (filePath && fs.existsSync(filePath)) {
            fs.unlink(filePath, (err) => {
                if (err) console.error("Failed to delete temp file:", err);
                else console.log(`Cleaned up temp file: ${filePath}`);
            });
        }
    }
});

app.listen(3000, () => console.log('Server running locally on port 3000'));    //continuously listen for incoming browser requests