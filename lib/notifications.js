import { createNotification } from './db';

export async function notifyRoadmapApproved(roadmapId, roadmapName, creatorId, approvedBy) {
  try {
    await createNotification(
      creatorId,
      `Your roadmap "${roadmapName}" has been approved`,
      'roadmap_approved',
      'roadmap',
      roadmapId
    );
  } catch (error) {
    console.error('Error notifying roadmap approval:', error);
  }
}

export async function notifyRequirementValidated(requirementId, requirementName, creatorId, validatedBy) {
  try {
    await createNotification(
      creatorId,
      `Your requirement "${requirementName}" has been validated`,
      'requirement_validated',
      'requirement',
      requirementId
    );
  } catch (error) {
    console.error('Error notifying requirement validation:', error);
  }
}

export async function notifyIdeaTriaged(ideaId, ideaName, submitterId, status) {
  try {
    await createNotification(
      submitterId,
      `Your idea "${ideaName}" has been triaged: ${status}`,
      'idea_triaged',
      'idea',
      ideaId
    );
  } catch (error) {
    console.error('Error notifying idea triage:', error);
  }
}

export async function notifyIdeaPromoted(ideaId, ideaName, submitterId, requirementId) {
  try {
    await createNotification(
      submitterId,
      `Your idea "${ideaName}" has been promoted to a requirement`,
      'idea_promoted',
      'idea',
      ideaId
    );
  } catch (error) {
    console.error('Error notifying idea promotion:', error);
  }
}

export async function notifyNewComment(entityType, entityId, entityName, ownerId, commenterId) {
  try {
    if (ownerId === commenterId) return;
    
    await createNotification(
      ownerId,
      `New comment on your ${entityType} "${entityName}"`,
      'new_comment',
      entityType,
      entityId
    );
  } catch (error) {
    console.error('Error notifying new comment:', error);
  }
}

export async function notifyStatusChange(entityType, entityId, entityName, ownerId, newStatus) {
  try {
    await createNotification(
      ownerId,
      `Status changed to "${newStatus}" for ${entityType} "${entityName}"`,
      'status_change',
      entityType,
      entityId
    );
  } catch (error) {
    console.error('Error notifying status change:', error);
  }
}