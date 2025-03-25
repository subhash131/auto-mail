export const formatDateTime = (timestamp: string) => {
  const date = new Date(timestamp);
  const time = date.toLocaleString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const fullDate = date.toLocaleString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return `${time}, ${fullDate}`;
};
