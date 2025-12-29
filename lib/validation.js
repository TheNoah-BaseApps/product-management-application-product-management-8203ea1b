export const ROLES = {
  ADMIN: 'admin',
  PRODUCT_MANAGER: 'product_manager',
  DEVELOPER: 'developer',
  STAKEHOLDER: 'stakeholder',
  VIEWER: 'viewer'
};

export const IDEA_STATUS = {
  SUBMITTED: 'submitted',
  UNDER_REVIEW: 'under_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  ON_HOLD: 'on_hold'
};

export const REQUIREMENT_STATUS = {
  DRAFT: 'draft',
  IN_REVIEW: 'in_review',
  VALIDATED: 'validated',
  IN_DEVELOPMENT: 'in_development',
  COMPLETED: 'completed',
  REJECTED: 'rejected'
};

export const ROADMAP_STATUS = {
  PLANNING: 'planning',
  IN_PROGRESS: 'in_progress',
  APPROVED: 'approved',
  ON_HOLD: 'on_hold',
  COMPLETED: 'completed'
};

export const PRIORITY = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low'
};

export const COMPLEXITY = {
  XS: 'xs',
  S: 's',
  M: 'm',
  L: 'l',
  XL: 'xl'
};

export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password) {
  return password && password.length >= 8;
}

export function validateRole(role) {
  return Object.values(ROLES).includes(role);
}

export function validateStatus(status, type) {
  switch (type) {
    case 'idea':
      return Object.values(IDEA_STATUS).includes(status);
    case 'requirement':
      return Object.values(REQUIREMENT_STATUS).includes(status);
    case 'roadmap':
      return Object.values(ROADMAP_STATUS).includes(status);
    default:
      return false;
  }
}

export function validatePriority(priority) {
  return Object.values(PRIORITY).includes(priority);
}

export function validateComplexity(complexity) {
  return Object.values(COMPLEXITY).includes(complexity);
}

export function validateDateNotFuture(date) {
  if (!date) return true;
  const inputDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return inputDate <= today;
}

export function validateDateIsFuture(date) {
  if (!date) return true;
  const inputDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return inputDate > today;
}

export function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  return input.trim().replace(/[<>]/g, '');
}