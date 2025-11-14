const filters = require('../../app/filters');

describe('Custom filters', () => {
  let filterFunctions;

  beforeEach(() => {
    filterFunctions = filters();
  });

  test('filters object is returned', () => {
    expect(filterFunctions).toBeDefined();
    expect(typeof filterFunctions).toBe('object');
  });

  describe('timeOneHourAgo filter', () => {
    test('is defined and is a function', () => {
      const timeFilter = filterFunctions.timeOneHourAgo;
      expect(timeFilter).toBeDefined();
      expect(typeof timeFilter).toBe('function');
    });

    test('returns valid time format', () => {
      const timeFilter = filterFunctions.timeOneHourAgo;
      const result = timeFilter();
      
      // Should match time format: 1-12:00-59am/pm
      expect(result).toMatch(/^([1-9]|1[0-2]):[0-5][0-9](am|pm)$/);
    });

    test('returns a time that is approximately one hour ago', () => {
      const timeFilter = filterFunctions.timeOneHourAgo;
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const result = timeFilter();
      
      // Parse the result to verify it's approximately one hour ago
      const [timePart, ampm] = result.split(/(am|pm)/);
      const [hours, minutes] = timePart.split(':').map(Number);
      let resultHours = hours;
      if (ampm === 'pm' && hours !== 12) {
        resultHours = hours + 12;
      } else if (ampm === 'am' && hours === 12) {
        resultHours = 0;
      }
      
      // Check that the time is within 2 minutes of one hour ago (allowing for test execution time)
      const resultTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), resultHours, minutes);
      const diff = Math.abs(resultTime.getTime() - oneHourAgo.getTime());
      expect(diff).toBeLessThan(2 * 60 * 1000); // Within 2 minutes
    });
  });

  describe('yesterdayDayName filter', () => {
    test('is defined and is a function', () => {
      const dayFilter = filterFunctions.yesterdayDayName;
      expect(dayFilter).toBeDefined();
      expect(typeof dayFilter).toBe('function');
    });

    test('returns valid day name', () => {
      const dayFilter = filterFunctions.yesterdayDayName;
      const result = dayFilter();
      
      // Should be a valid day name
      expect(['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']).toContain(result);
    });

    test('returns yesterday\'s day correctly', () => {
      const dayFilter = filterFunctions.yesterdayDayName;
      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const expectedDay = dayNames[yesterday.getDay()];
      
      const result = dayFilter();
      
      // Should return yesterday's day
      expect(result).toBe(expectedDay);
    });
  });

  describe('dayBeforeYesterdayName filter', () => {
    test('is defined and is a function', () => {
      const dayFilter = filterFunctions.dayBeforeYesterdayName;
      expect(dayFilter).toBeDefined();
      expect(typeof dayFilter).toBe('function');
    });

    test('returns valid day name', () => {
      const dayFilter = filterFunctions.dayBeforeYesterdayName;
      const result = dayFilter();
      
      // Should be a valid day name
      expect(['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']).toContain(result);
    });

    test('returns day before yesterday correctly', () => {
      const dayFilter = filterFunctions.dayBeforeYesterdayName;
      const now = new Date();
      const twoDaysAgo = new Date(now);
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const expectedDay = dayNames[twoDaysAgo.getDay()];
      
      const result = dayFilter();
      
      // Should return day before yesterday
      expect(result).toBe(expectedDay);
    });
  });
});