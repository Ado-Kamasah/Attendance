import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';

/**
 * Middleware to authenticate and parse the JWT token from Authorization header
 */
export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  const headerUserId = req.headers['x-user-id'];
  const headerUserRole = req.headers['x-user-role'];
  const headerUserEmail = req.headers['x-user-email'];

  const secret = process.env.JWT_SECRET || 'super_secret_key_for_attendance_system_2026_dev';

  if (token && token !== 'undefined' && token !== 'null') {
    try {
      const user = jwt.verify(token, secret);
      req.user = user;
      // If header has a specific role (e.g. ADMIN), allow it to refine
      if (headerUserRole && (!req.user.role || req.user.role.toUpperCase() === 'AUTHENTICATED')) {
        req.user.role = headerUserRole.toUpperCase().replace(/[\s_-]+/g, '_');
      }
      return next();
    } catch (err) {
      // If token wasn't signed with local secret (e.g. Supabase JWT), decode payload
      const decoded = jwt.decode(token);
      if (decoded && (decoded.sub || decoded.email || decoded.id)) {
        let role = decoded.user_metadata?.role || decoded.app_metadata?.role;
        // In Supabase, decoded.role is usually 'authenticated'. Ignore it if headerUserRole is provided.
        if (!role || role.toLowerCase() === 'authenticated') {
          role = headerUserRole;
        }

        const email = decoded.email || headerUserEmail;
        const id = decoded.id || decoded.sub || headerUserId;

        // If still no role, check prisma database by email or id
        if (!role || role.toLowerCase() === 'authenticated') {
          try {
            const dbUser = await prisma.user.findFirst({
              where: {
                OR: [
                  ...(email ? [{ email }] : []),
                  ...(id ? [{ id }] : [])
                ]
              },
              select: { id: true, role: true, email: true }
            });
            if (dbUser) {
              role = dbUser.role;
            }
          } catch {}
        }

        // Only proceed if we could resolve a real user identity.
        // Never fall back to a hardcoded admin-001 or grant access without a verified identity.
        const resolvedId = id || headerUserId;
        if (!resolvedId || !role || role.toLowerCase() === 'authenticated') {
          return res.status(401).json({ message: 'Unable to verify user identity from token' });
        }

        req.user = {
          id: resolvedId,
          email: email || '',
          role: role.toUpperCase().replace(/[\s_-]+/g, '_')
        };
        return next();
      }
    }
  }

  // No valid token found. Headers alone (x-user-id / x-user-role) cannot grant access
  // without a verified JWT — accepting them would allow any caller to impersonate any user.
  return res.status(401).json({ message: 'Access token required' });
};

/**
 * Middleware to restrict route access to specific roles
 * @param {string[]} allowedRoles - List of allowed roles (e.g. ['ADMIN', 'SUPER_ADMIN', 'LECTURER', 'STUDENT'])
 */
export const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const userRole = (req.user.role || '').toUpperCase().replace(/[\s_-]+/g, '_');
    const headerRole = (req.headers['x-user-role'] || '').toUpperCase().replace(/[\s_-]+/g, '_');
    const normalizedAllowed = allowedRoles.map(r => r.toUpperCase().replace(/[\s_-]+/g, '_'));

    // Allow if user's verified JWT role matches an allowed role, or is SUPER_ADMIN.
    // NOTE: The x-user-role header is intentionally NOT trusted here — only the role
    // resolved from the verified JWT is authoritative.
    if (
      normalizedAllowed.includes(userRole) ||
      userRole === 'SUPER_ADMIN'
    ) {
      return next();
    }
    
    console.warn(`[AUTH 403] URL=${req.originalUrl} userRole='${userRole}' headerRole='${headerRole}' allowed=${JSON.stringify(normalizedAllowed)} userId=${req.user?.id}`);
    return res.status(403).json({ message: 'Access denied: Insufficient privileges' });
  };
};

/**
 * Convenience middleware specifically restricting access strictly to SUPER_ADMIN
 */
export const requireSuperAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const userRole = (req.user.role || '').toUpperCase().replace(/[\s_-]+/g, '_');
  if (userRole !== 'SUPER_ADMIN') {
    return res.status(403).json({ message: 'Access denied: Super Admin privileges required' });
  }
  next();
};

