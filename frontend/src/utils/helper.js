export const getInitials = (name) => {
  const initials = name.match(/\b\w/g) || [];
  return ((initials.shift() || "") + (initials.pop() || "")).toUpperCase();
};

export const capitalizeFirstTwoWords = (str) => {
  const words = str.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase() + words[0].slice(1);
  }
  const capitalizedWords = words
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1));
  return capitalizedWords.join(" ");
};
