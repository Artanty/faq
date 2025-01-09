const Schedule = require('./models/Schedule');

// Check if the current day is active in the weekdays pattern
function _isDayActive (scheduleWeekdays, currentTime) {
    const currentDay = currentTime.getDay(); // 0 (Sunday) to 6 (Saturday)
    const dayIndex = currentDay === 0 ? 6 : currentDay - 1
    // Convert weekdays string to an array of booleans
    return scheduleWeekdays.charAt(dayIndex) === '1';
}

// Check if the current time matches the schedule frequency
function _isFrequencyStep (frequency, currentTime) {
    const currentMinutes = currentTime.getMinutes();
    return currentMinutes % frequency === 0
}


function shouldShowModal(schedules, currentTime) {
    schedules = schedules.map(el => {
        el.frequency = currentTime.getMinutes()
        return el
    })
    /**
     * Получаем все расписания. понимаем, нужно ли открывать модалку и какой билет в ней показывать.
     * Сначала отбираем все расписания, что в принципе могут быть сейчас сработать.
     */
    // console.log(currentTime.getMinutes())
    // console.log(schedules.length)
    const filtered = schedules.filter(schedule => {
        return schedule.active && 
        _isDayActive(schedule.weekdays, currentTime) === true &&
        _isFrequencyStep(schedule.frequency, currentTime) === true
    })
    /**
     * нужно решить с какими параметрами вызывать функцию Ticket.findOldest()
     * вызвать ее сколько вещей раз
     * сохранить массив ответов
     * открыть попап.
     */
    // Priority: ticketId > topicId > folderId
//     if (schedule.ticketId !== undefined) {
//         // If ticketId is defined, skip date filtering
//       } else if (schedule.topicId !== undefined) {
//         // If topicId is defined, skip folderId filtering
//       } else if (schedule.folderId !== undefined) {
//         // If folderId is defined, proceed
//       }
// console.log(filtered.length)
  }

//   {
//     // Priority: ticketId > topicId > folderId
//     if (schedule.ticketId !== undefined) {
//         // If ticketId is defined, skip date filtering
//       } else if (schedule.topicId !== undefined) {
//         // If topicId is defined, skip folderId filtering
//       } else if (schedule.folderId !== undefined) {
//         // If folderId is defined, proceed
//       }
  
//       // Skip date filtering if ticketId is passed
//       if (schedule.ticketId === undefined) {
//         // Check if the current time is within the schedule's date range
//         const scheduleDateFrom = schedule.dateFrom ? new Date(schedule.dateFrom) : null;
//         const scheduleDateTo = schedule.dateTo ? new Date(schedule.dateTo) : null;
  
//         if (scheduleDateFrom && currentTime < scheduleDateFrom) continue; // Schedule hasn't started yet
//         if (scheduleDateTo && currentTime > scheduleDateTo) continue; // Schedule has ended
//       }
//   }

  async function test () {
    const sqs = await Schedule.findByUserId(1);
    // console.log(sqs)
    const result = shouldShowModal(sqs, new Date())
    console.log(result)
}

module.exports = test