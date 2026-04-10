import jwt from 'jsonwebtoken';

/**
 * Required Authentication Middleware
 * Returns 401 if no valid token is provided
 */
export const authenticate = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    req.isAuthenticated = true;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// Alias for consistency with new routes
export const authenticateToken = authenticate;

/**
 * ✅ NEW: Optional Authentication Middleware
 * Validates token if present, but doesn't reject unauthenticated requests
 * Sets req.user and req.isAuthenticated if token is valid
 * Useful for endpoints that support both authenticated and guest users
 */
export const authenticateOptional = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        req.isAuthenticated = true;
      } catch (error) {
        // Token is invalid, but continue as guest
        console.warn('Optional auth: Token validation failed, proceeding as guest');
        req.user = null;
        req.isAuthenticated = false;
      }
    } else {
      // No token provided, continue as guest
      req.user = null;
      req.isAuthenticated = false;
    }
    
    next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    req.user = null;
    req.isAuthenticated = false;
    next();
  }
};

/**
 * Role-based Authorization Middleware
 * Only works after authenticate middleware has verified the token
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};
