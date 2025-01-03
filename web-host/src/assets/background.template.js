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

chrome.alarms.create('openPopup', { periodInMinutes: 1 });

chrome.alarms.create('sendStat', { periodInMinutes: 1 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'openPopup') {
    openPopup();
  }
  if (alarm.name === 'sendStat') {
    sendStatEvent({ stage: 'RUNTIME', data: {
      projectId: `${PROJECT_ID}`,
      slaveRepo: `${SLAVE_REPO}`,
      commit: `${COMMIT}`
    } });
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
          this.sendStatEvent({ stage: 'UNKNOWN', data: `chrome.action.openPopup error: ${error}` });
        } else {
          const data = {
            from: 'ext-service-worker',
            to: 'faq',
            event: 'SHOW_OLDEST_TICKET',
            payload: null
          }
          sendMessageToHost(data);
        }
      });
    } else {
      this.sendStatEvent({ stage: 'UNKNOWN', data: `!windows.length on openPopup` });
    }
  });
}

function sendStatEvent(eventStage, eventData) {
  const statPayload = {
    projectId: `${PROJECT_ID}`,
    namespace: 'web-host',
    stage: eventStage,
    eventData,
  }

  const onErrorMessagePayload = {
    from: 'ext-service-worker',
    to: 'web-host',
    event: 'RETRY_SEND_STAT',
    payload: statPayload
  }

  fetch(`${STAT_BACK_URL}/add-event`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(statPayload)
  })
    .then((response) => {
      if (!response.ok) {
        sendMessageToHost(onErrorMessagePayload);
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then((data) => {
      console.log('HTTP request successful:', data);
    })
    .catch((error) => {
      console.error('Error sending HTTP request:', error);
      sendMessageToHost(onErrorMessagePayload);
    });
}

// export interface BusEvent<T = Record<string, unknown>> {
//   from: string;
//   to: string;
//   event: string;
//   payload: T;
//   self?: true;
//   status?: string;
// }
function sendMessageToHost(data) {
  chrome.runtime.sendMessage(data, (response) => {
    if (chrome.runtime.lastError) {
      console.error('Error sending message:');
      console.error(chrome.runtime.lastError)
    } else {
      console.log('Message sent successfully. Response:');
      console.log(response)
    }
  });
}
