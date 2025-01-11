export function formatDate(
    dateString: string, 
    formatConfig: { 
      day?: boolean, 
      month?: boolean, 
      year?: boolean, 
      hours?: boolean, 
      minutes?: boolean 
    } = { 
      day: true, 
      month: true, 
      year: true, 
      hours: true, 
      minutes: true 
    }
  ) {
    // Create a Date object from the input string
    const date = new Date(dateString);
  
    // Extract UTC components (ignoring the local timezone)
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Months are zero-based
    const year = String(date.getUTCFullYear()).slice(-2); // Get the last two digits of the year
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  
    // Initialize an array to build the formatted string
    const parts = [];
  
    // Add components to the array based on the formatConfig
    if (formatConfig.day) parts.push(day);
    if (formatConfig.month) parts.push(month);
    if (formatConfig.year) parts.push(year);
    if (formatConfig.hours || formatConfig.minutes) {
        const timePart = [];
        if (formatConfig.hours) timePart.push(hours);
        if (formatConfig.minutes) timePart.push(minutes);
        parts.push(timePart.join(':'));
    }
    let formattedDate = ''
    // Join the parts with dots and spaces as needed
    if (formatConfig.day && formatConfig.month && formatConfig.year && (formatConfig.hours || formatConfig.minutes)) {
      formattedDate = parts.slice(0,2).join('.') + ' ' + parts[3];
    } else {
      formattedDate = parts.join('.');
    }  
  
    return formattedDate;
  }
  
  
  // export const swapObject = (obj) => {
  //   const swappedObj = {};
  //   for (const [key, value] of Object.entries(obj)) {
  //     swappedObj[value] = key;
  //   }
  //   return swappedObj;
  // };
  
  
  
  export function formatDateByTimezone<T extends Record<string, any>>(
    arr: T[],
    prop: keyof T,
    timezone: string
  ): T[] {
    // Validate the timezone
    try {
        new Intl.DateTimeFormat('en-US', { timeZone: timezone }).format(new Date());
    } catch (error) {
        throw new Error(`Invalid time zone specified: ${timezone}`);
    }
  
    return arr.map(obj => {
        // Create a deep copy of the object to avoid mutating the original
        const newObj: T = { ...obj };
  
        // Get the date string from the specified property
        const dateString = newObj[prop];
  
        // Ensure the property value is a string (or Date) that can be parsed
        // if (typeof dateString !== 'string' && !(dateString instanceof Date)) {
        //     throw new Error(`Property ${String(prop)} must be a string or Date`);
        // }
  
        // Create a Date object from the date string
        const date = new Date(dateString);
  
        // Get the timezone-adjusted date parts
        const adjustedDate = new Intl.DateTimeFormat('en-US', {
            timeZone: timezone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            fractionalSecondDigits: 3, // Include milliseconds
            hour12: false
        }).formatToParts(date);
  
        // Extract the parts and construct the ISO string
        const year = adjustedDate.find(part => part.type === 'year')!.value;
        const month = adjustedDate.find(part => part.type === 'month')!.value;
        const day = adjustedDate.find(part => part.type === 'day')!.value;
        const hour = adjustedDate.find(part => part.type === 'hour')!.value;
        const minute = adjustedDate.find(part => part.type === 'minute')!.value;
        const second = adjustedDate.find(part => part.type === 'second')!.value;
        const fractionalSecond = adjustedDate.find(part => part.type === 'fractionalSecond')!.value;
  
        // Construct the ISO string in the same format
        const isoString = `${year}-${month}-${day}T${hour}:${minute}:${second}.${fractionalSecond}Z`;
  
        // Update the property with the adjusted ISO string
        newObj[prop] = isoString as T[keyof T];
  
        return newObj;
    });
  }
  
  // // Example usage:
  // interface ExampleObject {
  //   id: number;
  //   timestamp: string;
  // }
  
  // const data: ExampleObject[] = [
  //   { id: 1, timestamp: '2024-12-22T23:17:03.007Z' },
  //   { id: 2, timestamp: '2024-12-23T10:45:00.123Z' }
  // ];
  
  // try {
  //   const formattedData = formatDateByTimezone(data, 'timestamp', 'America/New_York'); // Valid timezone
  //   console.log(formattedData);
  // } catch (error) {
  //   console.error(error.message);
  // }

  export function formatTimeDifference(dateString: string) {
    const receivedDate = new Date(dateString);
    const now = new Date();
  
    // Check if the date is invalid
    if (isNaN(receivedDate.getTime())) {
      return 'Неверная дата';
    }
  
    // Calculate the difference in milliseconds
    const diffInMs = +now - +receivedDate;
  
    // Handle future dates
    if (diffInMs < 0) {
      return 'Дата в будущем';
    }
  
    // Convert the difference to seconds, minutes, hours, etc.
    const diffInSeconds = Math.floor(diffInMs / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    const diffInWeeks = Math.floor(diffInDays / 7);
    const diffInMonths = Math.floor(diffInDays / 30);
    const diffInYears = Math.floor(diffInDays / 365);
  
    // Helper function to get the correct Russian plural form
    function getRussianPlural(number: number, one: string, two: string, five: string) {
      number = Math.abs(number) % 100;
      const remainder = number % 10;
      if (number > 10 && number < 20) return five;
      if (remainder === 1) return one;
      if (remainder >= 2 && remainder <= 4) return two;
      return five;
    }
  
    // Determine the appropriate format based on the difference
    if (diffInSeconds < 60) {
      const secondsText = getRussianPlural(diffInSeconds, 'секунда', 'секунды', 'секунд');
      return `${diffInSeconds} ${secondsText} назад`;
    } else if (diffInMinutes < 60) {
      const minutesText = getRussianPlural(diffInMinutes, 'минута', 'минуты', 'минут');
      return `${diffInMinutes} ${minutesText} назад`;
    } else if (diffInHours < 24) {
      const hoursText = getRussianPlural(diffInHours, 'час', 'часа', 'часов');
      return `${diffInHours} ${hoursText} назад`;
    } else if (diffInDays < 7) {
      const daysText = getRussianPlural(diffInDays, 'день', 'дня', 'дней');
      return `${diffInDays} ${daysText} назад`;
    } else if (diffInWeeks < 4) {
      const weeksText = getRussianPlural(diffInWeeks, 'неделя', 'недели', 'недель');
      return `${diffInWeeks} ${weeksText} назад`;
    } else if (diffInMonths < 12) {
      const monthsText = getRussianPlural(diffInMonths, 'месяц', 'месяца', 'месяцев');
      return `${diffInMonths} ${monthsText} назад`;
    } else {
      const yearsText = getRussianPlural(diffInYears, 'год', 'года', 'лет');
      return `${diffInYears} ${yearsText} назад`;
    }
  }

  export function getDateRangeFromToday(description: string): 
  { startDate: string | null, endDate: string | null } {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    const currentDay = today.getDate();
    const currentDayOfWeek = (today.getDay() + 6) % 7; // Adjust so Monday is 0 and Sunday is 6
  
    // Helper function to format a date as 'YYYY-MM-DD'
    const formatDate = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
  
    // Calculate start and end dates for each variant
    const variants: { [key: string]: { startDate: string | null; endDate: string | null } } = {
      'all': {
        startDate: null,
        endDate: null,
      },
      // 1. Start of this month, today
      'this_month_today': {
        startDate: formatDate(new Date(currentYear, currentMonth, 1)),
        endDate: formatDate(today),
      },
      // 2. Start of previous month, end of previous month
      '1_m_ago': {
        startDate: formatDate(new Date(currentYear, currentMonth - 1, 1)),
        endDate: formatDate(new Date(currentYear, currentMonth, 0)),
      },
      // 3. Start of previous previous month, end of previous previous month
      '2_m_ago': {
        startDate: formatDate(new Date(currentYear, currentMonth - 2, 1)),
        endDate: formatDate(new Date(currentYear, currentMonth - 1, 0)),
      },
      // 4. Start of previous previous month, today
      '2_m_ago_today': {
        startDate: formatDate(new Date(currentYear, currentMonth - 2, 1)),
        endDate: formatDate(today),
      },
      // 5. Start of previous previous previous month, today
      '3_m_ago_today': {
        startDate: formatDate(new Date(currentYear, currentMonth - 3, 1)),
        endDate: formatDate(today),
      },
      // 6. Start of this year, today
      'this_year_today': {
        startDate: formatDate(new Date(currentYear, 0, 1)),
        endDate: formatDate(today),
      },
      // 7. Start of previous week, end of previous week
      'prev_week': {
        startDate: formatDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() - currentDayOfWeek - 7)),
        endDate: formatDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() - currentDayOfWeek - 1)),
      },
      // 8. Start of this week, today
      'this_week_today': {
        startDate: formatDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() - currentDayOfWeek)),
        endDate: formatDate(today),
      },
    };
    
    return variants[description] || variants['all']
  }