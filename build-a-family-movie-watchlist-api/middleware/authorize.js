export function authorizeModification(req, res, next) {
  const { user } = req;
  const targetUserId = String(req.params.userId);

  if (!user) {
    return res.status(403).json({ error: 'Access denied' });
  }

  const isParent = user.role === 'parent';
  const isOwnChildAccount = user.role === 'child' && String(user.id) === targetUserId;

  if (!isParent && !isOwnChildAccount) {
    return res.status(403).json({ error: 'Access denied' });
  }

  return next();
}