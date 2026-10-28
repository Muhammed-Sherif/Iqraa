export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(value, min));
}
export function formatTime(timeInSeconds: number): string {
  const totalSeconds = Math.floor(timeInSeconds);
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

export function formatDuration(millis: number): string {
  return formatTime(millis / 1000);
}
