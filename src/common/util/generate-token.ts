//Generate 7 digits number,
export const generateToken = () =>
  (Math.floor(Math.random() * 9000000) + 1000000).toString();
