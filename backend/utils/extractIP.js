/**
 * Extract client IP address from request
 * 
 * Checks multiple sources in order of priority:
 * 1. x-forwarded-for header (for proxies/load balancers)
 * 2. x-real-ip header (for nginx)
 * 3. req.ip (for direct connections)
 * 
 * @param {Object} req - Express request object
 * @returns {string} Client IP address
 */
function extractClientIP(req) {
  // 1. Check x-forwarded-for header (proxy/load balancer)
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    // Return first IP from comma-separated list
    return forwarded.split(',')[0].trim();
  }
  
  // 2. Check x-real-ip header (nginx)
  const realIP = req.headers['x-real-ip'];
  if (realIP) {
    return realIP;
  }
  
  // 3. Fallback to req.ip (direct connection)
  return req.ip;
}

module.exports = extractClientIP;
