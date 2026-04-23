const getTokenFromRequest = (req) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    return req.headers.authorization.split(" ")[1];
  }

  if (req.cookies && req.cookies.accessToken) {
    return req.cookies.accessToken;
  }

  if (req.cookies && req.cookies.token) {
    return req.cookies.token;
  }

  return null;
};

export default getTokenFromRequest;
