// chrome.runtime.onConnect.addListener((port) => {
//   console.assert(port.name === "my-channel");
//   port.onMessage.addListener((msg) => {
//     console.log("Received message from app:", msg);
//   });
// });
const STAT_BACK_URL = 'STAT_BACK_URL_PLACEHOLDER';
const PROJECT_ID = 'PROJECT_ID_PLACEHOLDER' + '@github'
const NAMESPACE = 'NAMESPACE_PLACEHOLDER'
const SLAVE_REPO = 'SLAVE_REPO_PLACEHOLDER'
const COMMIT = 'COMMIT_PLACEHOLDER'

chrome.alarms.create('examReminder', {
  periodInMinutes: 5
});

chrome.alarms.create('sendHttpRequest', { periodInMinutes: 15 });


// Listen for the alarm trigger
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'examReminder') {
    // Open the extension's popup
    openPopup();
  }
  if (alarm.name === 'sendHttpRequest') {
    sendStatRuntimeEvent();
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
          this.sendStatUnknownEvent('chrome.action.openPopup error: ', error);
        } else {
          // Send a message to the opened popup
          sendMessageToPopup();
        }
      });
    } else {
      // No active window, show a notification instead
      sendStatUnknownEvent('!windows.length on openPopup`');
    }
  });
}
  
  
function sendStatUnknownEvent(eventData) {
  fetch(`${STAT_BACK_URL}/add-event`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      projectId: 'faq@github',
      namespace: 'web-host',
      stage: 'UNKNOWN',
      eventData,
    })
  })
    .then(response => response.json())
    .then(data => console.log('Error event sent successfully:', data))
    .catch(error => console.error('Error sending error event:', error));
}

// Function to send a message to the opened popup
function sendMessageToPopup() {
  chrome.runtime.sendMessage({ message: 'Hello from background.js!', data: { key: 'value' } }, (response) => {
    if (chrome.runtime.lastError) {
      console.error('Error sending message:', chrome.runtime.lastError);
    } else {
      console.log('Message sent successfully. Response:', response);
    }
  });
}

function sendStatRuntimeEvent () {
  const url = `${STAT_BACK_URL}/add-event`; // Replace with your API endpoint
  const payload = {
    projectId: `${PROJECT_ID}`,
    namespace: `${NAMESPACE}`,
    stage: 'RUNTIME',
    eventData: JSON.stringify(
      {
        projectId: `${PROJECT_ID}`,
        slaveRepo: `${SLAVE_REPO}`,
        commit: `${COMMIT}`
      }
    )
  }
  const options = {
    method: 'POST', // or 'POST', 'PUT', etc.
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload), // Add body for POST/PUT requests
  };

  fetch(url, options)
    .then((response) => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then((data) => {
      console.log('HTTP request successful:', data);
    })
    .catch((error) => {
      console.error('Error sending HTTP request:', error);
    });
};


