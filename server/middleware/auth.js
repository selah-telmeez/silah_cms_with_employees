// server/middleware/auth.js
const jwt    = require('jsonwebtoken');
const getDB  = require('../../database/db');

const auth = (requiredRole = null) => (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'توكن غير موجود' });
  }

  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const db   = getDB();
    const user = db.prepare('SELECT * FROM users WHERE id = ? AND is_active = 1').get(decoded.id);
    if (!user) return res.status(401).json({ error: 'مستخدم غير موجود' });

    // Role check
    const ROLES_HIERARCHY = { viewer:0, author:1, reviewer:2, designer:2, coordinator:2, editor:3, admin:4 };
    if (requiredRole && (ROLES_HIERARCHY[user.role] || 0) < (ROLES_HIERARCHY[requiredRole] || 0)) {
      return res.status(403).json({ error: 'غير مصرح لك بهذا الإجراء' });
    }

    req.user = user;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'توكن غير صالح' });
  }
};

module.exports = auth;
