// Utility functions for time conversion between 24-hour and 12-hour formats

export function convertTo12Hour(time24: string): string {
  if (!time24) return '';
  
  const [hours, minutes] = time24.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  
  return `${displayHour}:${minutes} ${ampm}`;
}

export function convertTo24Hour(time12: string): string {
  if (!time12) return '';
  
  const [time, period] = time12.split(' ');
  const [hours, minutes] = time.split(':');
  let hour = parseInt(hours);
  
  if (period === 'AM' && hour === 12) {
    hour = 0;
  } else if (period === 'PM' && hour !== 12) {
    hour += 12;
  }
  
  return `${hour.toString().padStart(2, '0')}:${minutes}`;
}

export function generateTimeOptions(): Array<{value: string, label: string}> {
  const times = [];
  
  // Generate times from 6:00 AM to 5:45 PM in 15-minute intervals
  for (let hour = 6; hour <= 17; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      // Stop at 5:45 PM (17:45)
      if (hour === 17 && minute > 45) break;
      
      const time24 = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      const time12 = convertTo12Hour(time24);
      times.push({ value: time24, label: time12 });
    }
  }
  
  return times;
}
