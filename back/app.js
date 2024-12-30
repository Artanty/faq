const express = require('express');
const dotenv = require('dotenv');
const ticketRoutes = require('./routes/tickets');
const answerRoutes = require('./routes/answers');
const axios = require('axios');
const cors = require('cors');
const checkDBConnection = require('./core/db_check_connection')
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/tickets', ticketRoutes);
app.use('/answers', answerRoutes);


async function sendRuntimeEventToStat(triggerIP) {
  try {
    const payload = {
      projectId: `${process.env.PROJECT_ID}@github`,
      namespace: process.env.NAMESPACE,
      stage: 'RUNTIME',
      eventData: JSON.stringify(
        {
          triggerIP: triggerIP,
          projectId: process.env.PROJECT_ID,
          slaveRepo: process.env.SLAVE_REPO,
          commit: process.env.COMMIT
        }
      )
    }
    await axios.post(`${process.env.STAT_URL}/add-event`, payload);
    console.log(`SENT TO @stat: ${process.env.PROJECT_ID}@github -> ${process.env.SLAVE_REPO} | ${process.env.COMMIT}`)
    return true
  } catch (error) {
    console.error('error in sendRuntimeEventToStat...');
    if (axios.isAxiosError(error)) {
      // Handle Axios-specific errors
      const axiosError = error; // as AxiosError
      console.error('Axios Error:', {
          message: axiosError.message,
          status: axiosError.response?.status,
          statusText: axiosError.response?.statusText,
          data: axiosError.response?.data,
      });
    } else {
        // Handle generic errors
        console.error('Unexpected Error:', error);
    }
    return false;
  }
}

// Function to check if the current minute is one of [0, 15, 30, 45]
function shouldRunStat(currentMinute) { // : boolean
  return [1, 15, 30, 45].includes(currentMinute);
}

// Global variable to track the last minute when sendRuntimeEventToStat was called
let lastExecutedMinute = null; // : number | null

//(req: Request, res: Response) => {
app.get('/get-updates', async (req, res) => {
  const clientIP = req.ip;

  // Parse URL parameters
  const { stat } = req.query;

  let sendToStatResult = false;

  // Get the current minute
  const now = new Date();
  const currentMinute = now.getMinutes();

  // Check if stat=true is in the URL params
  if (stat === 'true') {
      sendToStatResult = await sendRuntimeEventToStat(clientIP);
  } else {
      // If stat is not true, check the current time and whether the function was already called this minute
      if (shouldRunStat(currentMinute) && lastExecutedMinute !== currentMinute) {
          lastExecutedMinute = currentMinute; // Update the last executed minute
          sendToStatResult = await sendRuntimeEventToStat(clientIP);
      }
  }

  res.json({
      trigger: clientIP,
      PORT: process.env.PORT,
      isSendToStat: sendToStatResult,
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  checkDBConnection()
});