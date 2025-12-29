import { ROLES } from './validation';

export function canCreateRoadmap(userRole) {
  return [ROLES.ADMIN, ROLES.PRODUCT_MANAGER].includes(userRole);
}

export function canEditRoadmap(userRole) {
  return [ROLES.ADMIN, ROLES.PRODUCT_MANAGER].includes(userRole);
}

export function canDeleteRoadmap(userRole) {
  return [ROLES.ADMIN, ROLES.PRODUCT_MANAGER].includes(userRole);
}

export function canApproveRoadmap(userRole) {
  return [ROLES.ADMIN, ROLES.PRODUCT_MANAGER].includes(userRole);
}

export function canCreateRequirement(userRole) {
  return [ROLES.ADMIN, ROLES.PRODUCT_MANAGER].includes(userRole);
}

export function canEditRequirement(userRole) {
  return [ROLES.ADMIN, ROLES.PRODUCT_MANAGER].includes(userRole);
}

export function canDeleteRequirement(userRole) {
  return [ROLES.ADMIN, ROLES.PRODUCT_MANAGER].includes(userRole);
}

export function canValidateRequirement(userRole) {
  return [ROLES.ADMIN, ROLES.PRODUCT_MANAGER].includes(userRole);
}

export function canSubmitIdea(userRole) {
  return Object.values(ROLES).includes(userRole);
}

export function canTriageIdea(userRole) {
  return [ROLES.ADMIN, ROLES.PRODUCT_MANAGER].includes(userRole);
}

export function canPromoteIdea(userRole) {
  return [ROLES.ADMIN, ROLES.PRODUCT_MANAGER].includes(userRole);
}

export function canComment(userRole) {
  return Object.values(ROLES).includes(userRole);
}

export function canUploadAttachment(userRole) {
  return Object.values(ROLES).includes(userRole);
}

export function canDeleteAttachment(userRole, uploaderId, currentUserId) {
  if ([ROLES.ADMIN, ROLES.PRODUCT_MANAGER].includes(userRole)) {
    return true;
  }
  return uploaderId === currentUserId;
}

export function canViewAnalytics(userRole) {
  return [ROLES.ADMIN, ROLES.PRODUCT_MANAGER].includes(userRole);
}

export function canExport(userRole) {
  return [ROLES.ADMIN, ROLES.PRODUCT_MANAGER, ROLES.DEVELOPER].includes(userRole);
}

export function hasFullAccess(userRole) {
  return userRole === ROLES.ADMIN;
}

export function isProductManager(userRole) {
  return [ROLES.ADMIN, ROLES.PRODUCT_MANAGER].includes(userRole);
}

export function canViewRoadmap(userRole) {
  return Object.values(ROLES).includes(userRole);
}

export function canViewRequirement(userRole) {
  return Object.values(ROLES).includes(userRole);
}

export function canViewIdea(userRole) {
  return Object.values(ROLES).includes(userRole);
}