export function generateRoadmapId() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 7);
  return `RM-${timestamp}-${random}`.toUpperCase();
}

export function generateRequirementId() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 7);
  return `REQ-${timestamp}-${random}`.toUpperCase();
}

export function generateIdeaId() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 7);
  return `IDEA-${timestamp}-${random}`.toUpperCase();
}

export function generateUniqueId(prefix = 'ID') {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 9);
  return `${prefix}-${timestamp}-${random}`.toUpperCase();
}