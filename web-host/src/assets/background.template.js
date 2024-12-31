// chrome.runtime.onConnect.addListener((port) => {
//   console.assert(port.name === "my-channel");
//   port.onMessage.addListener((msg) => {
//     console.log("Received message from app:", msg);
//   });
// });
const STAT_BACK_URL = 'STAT_BACK_URL_PLACEHOLDER';

chrome.alarms.create('examReminder', {
  periodInMinutes: 1
});

// Listen for the alarm trigger
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'examReminder') {
    // Open the extension's popup
    openPopup();
  }
});

function openPopup() {
  // Check if there is an active browser window
  chrome.windows.getAll({}, (windows) => {
    if (windows.length > 0) {
      // Try to open the popup
      chrome.action.openPopup((error) => {
        if (error) {
          console.error('Failed to open popup:', error);
          this.sendErrorEvent();
        } else {
          // Send a message to the opened popup
          sendMessageToPopup();
        }
      });
    } else {
      // No active window, show a notification instead
      sendErrorEvent();
    }
  });
}
  
  
function sendErrorEvent() {
  fetch(`${STAT_BACK_URL}/add-event`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      error: 'Failed to open popup',
      timestamp: new Date().toISOString()
    })
  })
    .then(response => response.json())
    .then(data => console.log('Error event sent successfully:', data))
    .catch(error => console.error('Error sending error event:', error));
}

// Function to send a message to the opened popup
function sendMessageToPopup() {
  // chrome.runtime.sendMessage({ message: 'Hello from background.js!', data: { key: 'value' } }, (response) => {
  //   if (chrome.runtime.lastError) {
  //     console.error('Error sending message:', chrome.runtime.lastError);
  //   } else {
  //     console.log('Message sent successfully. Response:', response);
  //   }
  // });
}

