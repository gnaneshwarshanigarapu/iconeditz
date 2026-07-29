export function getIpAddress(req) {
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
      return forwarded.split(',')[0];
    }
    return req.connection.remoteAddress;
  }
  