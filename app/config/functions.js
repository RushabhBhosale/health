import {IsAndroid} from './style';
import moment from 'moment';
import settings from '../config/settings';

const config = settings();

export function makeFullName(fName, lName, prefix) {
  let fullName = prefix ? prefix + ' ' : '';
  if (fName && lName) {
    fullName += fName + ' ' + lName;
  } else if (fName) {
    fullName += fName;
  } else if (lName) {
    fullName += lName;
  }
  return fullName;
}

export function getFullUrl(fileName, folderPath) {
  return fileName
    ? fileName.startsWith('http://')
      ? fileName
      : config.cdnUrl + folderPath + fileName
    : '';
}

export const formatDateObject = (input, options) => {
  options = options || {dateStyle: 'short', timeZone: 'Asia/Kolkata'};

  return input && input instanceof Date && input.toLocaleDateString
    ? input.toLocaleDateString('en-IN', options)
    : input;
};

/* ===== Date Formating ===== */
const monthName = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ],
  monthFullName = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

export const Time_Zone_Offset = () => {
  return 5.5 * 60 * 60 * 1000;
};

export const get_weekDays = () => [
  'Sun',
  'Mon',
  'Tue',
  'Wed',
  'Thu',
  'Fri',
  'Sat',
];

export function get_day(day_index) {
  const weekArr = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return weekArr[day_index];
}

export const Day_dd_Mon_YYYY = (dateObject) => {
  const weekRow = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  if(dateObject !== null) {
    if (IsAndroid) {
      /* utc = dateObject.getTime() + dateObject.getTimezoneOffset() * 60000,
        US_time = utc + 3600000 * -4,
        US_date = new Date(US_time); */

      return (
        weekRow[dateObject.getDay()] +
        ', ' +
        dateObject.getDate() +
        ' ' +
        monthName[dateObject.getMonth()] +
        ' ' +
        dateObject.getFullYear()
      );
    } else {
      return dateObject.toLocaleDateString('en-IN', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        timeZone: 'Asia/Kolkata',
      });
    }
  } else {
    return "01, Jan, 1970";
  }
};

export const dd_Mon_YYYY_Day = (dateObject) => {
  const weekRow = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  if(dateObject !== null) {
    if (IsAndroid) {
      return (
        dateObject.getDate() +
        ' ' +
        monthName[dateObject.getMonth()] +
        ' ' +
        dateObject.getFullYear() +
        ', ' +
        weekRow[dateObject.getDay()]
      );
    } else {
      return dateObject.toLocaleDateString('en-IN', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        timeZone: 'Asia/Kolkata',
      });
    }
  } else {
    return "00-00-0000";
  }
};

export const Day_dd_Mon = (dateObject) => {
  const weekRow = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  if(dateObject !== null) {
    if (IsAndroid) {
      return (
        weekRow[dateObject.getDay()] +
        ', ' +
        dateObject.getDate() +
        ' ' +
        monthName[dateObject.getMonth()]
      );
    } else {
      return dateObject.toLocaleDateString('en-IN', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        timeZone: 'Asia/Kolkata',
      });
    }
  } else {
    return "99-99-9999";
  }
};

export const DayLong_dd_Month = (dateObject) => {
  const weekFullRow = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  if(dateObject !== null) {
    if (IsAndroid) {
      return (
        weekFullRow[dateObject.getDay()] +
        ', ' +
        dateObject.getDate() +
        ' ' +
        monthFullName[dateObject.getMonth()]
      );
    } else {
      return dateObject.toLocaleDateString('en-IN', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        timeZone: 'Asia/Kolkata',
      });
    }
  } else{
    return "01-01-0001";
  }
};

export const dd_Mon_yyyy = (dateObject) => {
  if(dateObject !== null) {
    if (IsAndroid) {
      return (
        dateObject.getDate() +
        ' ' +
        monthName[dateObject.getMonth()] +
        ' ' +
        dateObject.getFullYear()
      );
    } else {
      return dateObject.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        timeZone: 'Asia/Kolkata',
      });
    }
  } else{
    return "02-02-0002";
  }
};

export const dd_mm_yyyy = (dateObject, separator = '/') => {
  if(dateObject !== null) {
    return (
      dateObject.getDate() +
      separator +
      (dateObject.getMonth() + 1) +
      separator +
      dateObject.getFullYear()
    );
  } else{
    return "03-03-0003";
  }
};

export const Month_YYYY = (dateObject) => {
  return dateObject !== null ? monthFullName[dateObject.getMonth()] + ' ' + dateObject.getFullYear() : "Mon-9090";
};

export const mm_YYYY = (dateObject) => {
  return dateObject !== null ? monthName[dateObject.getMonth()] + ' ' + dateObject.getFullYear() : "01-1010";
};

export const areDatesEqual = (dateObj1, dateObj2) => {
  if(dateObj1 !== null && dateObj2 !== null) {
    return (
      dateObj1.getFullYear() === dateObj2.getFullYear() &&
      dateObj1.getMonth() === dateObj2.getMonth() &&
      dateObj1.getDate() === dateObj2.getDate()
    );
  } else {
    return false;
  }
};

export const isDatePast = (dateObj, buffer = 0) => {
  return dateObj !== null ? dateObj.getTime() < new Date().getTime() + buffer : false;
};

export const isUTCDatePast = (dateObj, buffer = 0) => {
  const offset_minutes = 330;
  let DT_now = moment().add(buffer, 'milliseconds');
  if(dateObj !== null) {
    return DT_now.isAfter(
      moment.utc(dateObj).subtract(offset_minutes, 'minutes'),
    );
  } else {
    return true;
  }
};

export const getDayStart = (dateObj) =>
  new Date(new Date(dateObj).setHours(0, 0, 0, 0));

export const hrs_mnt_from_timestamp = (timeStamp) => {
  let tsArray = timeStamp.split(' ');
  let tsTime = tsArray[0].split(':');
  let hours = 0,
    minutes = 0;
  hours = tsArray[1].match(/^[P]/i) ? tsTime[0] + 12 : tsTime[0];
  minutes = tsTime[1];
  return {hours, minutes};
};

export const minutes_from_timestamp = (timeStamp) => {
  let tsArray = timeStamp.split(' ');
  let tsTime = tsArray[0].split(':');
  let hrs = 0,
    minutes = 0;
  hrs = tsArray[1].match(/^[P]/i) ? tsTime[0] + 12 : tsTime[0];
  minutes = tsTime[1];
  return hrs * 60 + minutes;
};

export const cm_to_FeetInches = (cm) => {
  let rawFeet = (Number(cm) * 0.3937) / 12;
  let feet = Math.floor(rawFeet);
  let inches = Math.round((rawFeet - feet) * 12);
  return {feet, inches};
};

export const age_from_dob = (dob) => {
  let today = new Date();
  let birthDate = new Date(dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  let m = today.getMonth() - birthDate.getMonth();
  return m < 0 || (m === 0 && today.getDate() < birthDate.getDate())
    ? --age
    : age;
};

export const date_time_12hrs = (dateObj) => {
  let hrs = dateObj.getHours();
  let mins = dateObj.getMinutes();
  let meridian = 'AM';
  if (hrs === 0) {
    hrs = 12;
  } else if (hrs === 12) {
    meridian = 'PM';
  } else if (hrs > 12) {
    hrs -= 12;
    meridian = 'PM';
  }
  hrs = hrs.toString().padStart(2, '0');
  mins = mins.toString().padStart(2, '0');
  return hrs + ':' + mins + ' ' + meridian;
};

export const splitTimeSlots = (date, sTime, eTime, duration) => {
  const startString = moment(`${date} ${sTime}`, 'DD-MM-YYYY h:mm a').format(
    'YYYY-MM-DD h:mm a',
  );
  const endString = moment(`${date} ${eTime}`, 'DD-MM-YYYY h:mm a').format(
    'YYYY-MM-DD h:mm a',
  );
  let start = moment(startString, 'YYYY-MM-DD h:mm a');
  let end = moment(endString, 'YYYY-MM-DD h:mm a');
  start.minutes(Math.ceil(start.minutes() / duration) * 15);
  let result = [];
  let current = moment(start);

  while (current < end) {
    result.push(current.format('YYYY-MM-DD hh:mm A'));
    current.add(duration, 'minutes');
  }

  return result.length;
};

export const commaSeparatedNumberIN_D2 = (numbIn) =>
  numbIn.toFixed(2).replace(/(\d)(?=(\d{2})+\d\.)/g, '$1,');

export const commaSeparatedNumberIN = (numbIn) =>
  numbIn
    .toFixed(2)
    .replace(/(\d)(?=(\d{2})+\d\.)/g, '$1,')
    .slice(0, -3);

export const numberPostfix = (inputVal) => {
  let absValue = 0;
  let outputVal = 0;
  if (inputVal) {
    absValue = Math.abs(inputVal);
    if (absValue >= Math.pow(10, 12)) {
      outputVal = (inputVal / Math.pow(10, 9)).toFixed(2) + 'T';
    } else if (absValue >= Math.pow(10, 9)) {
      outputVal = (inputVal / Math.pow(10, 9)).toFixed(2) + 'B';
    } else if (absValue >= Math.pow(10, 7)) {
      outputVal = (inputVal / Math.pow(10, 7)).toFixed(2) + 'Cr';
    } else if (absValue >= Math.pow(10, 5)) {
      outputVal = (inputVal / Math.pow(10, 5)).toFixed(2) + 'L';
    } else if (absValue >= Math.pow(10, 3)) {
      outputVal = (inputVal / Math.pow(10, 3)).toFixed(2) + 'K';
    } else {
      outputVal = inputVal.toFixed(2);
    }
  } else outputVal = inputVal.toFixed(2);
  return outputVal;
};

export const makeWebViewSource = (inSource) => {
  return {
    html:
      '<html><head><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body style="padding:0; margin:0;">' +
      inSource +
      '</body></html>',
  };
};
