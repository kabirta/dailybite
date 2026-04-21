const getStartOfDayUTC = (dateInput = new Date()) => {
  const date = new Date(dateInput);
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
};

module.exports = { getStartOfDayUTC };
