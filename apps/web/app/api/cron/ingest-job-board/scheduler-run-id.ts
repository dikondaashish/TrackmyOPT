export function jobBoardHourlyRunId(now = new Date()) {
  return `job-board-hour-${now.toISOString().slice(0, 13)}`;
}
