import { createClient } from "@/lib/supabase/server";
// import { sendEmail } from "@/lib/email-service"; // TODO: implement in email phase

export type NotificationType =
  | "property_approved"
  | "property_rejected"
  | "property_changes_requested"
  | "car_approved"
  | "car_rejected"
  | "car_changes_requested"
  | "owner_approved"
  | "owner_rejected"
  | "subscription_updated";

export interface NotificationPayload {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  entityType?: "property" | "car" | "owner";
  entityId?: string;
  adminId?: string;
  metadata?: Record<string, any>;
  link?: string;
}

/**
 * Send notification to owner in database + email
 */
export async function sendOwnerNotification(payload: NotificationPayload) {
  const supabase = await createClient();

  try {
    // 1. Save to database
    const { data: notification, error: dbError } = await supabase
      .from("notifications")
      .insert({
        user_id: payload.userId,
        type: payload.type,
        title: payload.title,
        message: payload.message,
        read: false,
        entity_type: payload.entityType,
        entity_id: payload.entityId,
        admin_id: payload.adminId,
        metadata: payload.metadata || {},
        link: payload.link,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (dbError) {
      console.error("Failed to save notification:", dbError);
      throw dbError;
    }

    // 2. Get user email
    const { data: user, error: userError } = await supabase
      .from("profiles")
      .select("email, full_name")
      .eq("id", payload.userId)
      .single();

    if (userError || !user?.email) {
      console.error("User not found:", userError);
      return notification;
    }

    // 3. Send email (TODO: implement in email phase)
    await sendNotificationEmail({
      email: user.email,
      userName: user.full_name || "Owner",
      type: payload.type,
      title: payload.title,
      message: payload.message,
      link: payload.link,
    });

    return notification;
  } catch (error) {
    console.error("Notification service error:", error);
    throw error;
  }
}

/**
 * Specific notifications for property review workflow
 */

// Property Approved
export async function notifyPropertyApproved(
  ownerId: string,
  propertyId: string,
  propertyName: string,
  adminId: string
) {
  return sendOwnerNotification({
    userId: ownerId,
    type: "property_approved",
    title: `✅ Property Approved!`,
    message: `Your property "${propertyName}" has been approved and is now live on the platform. Start receiving bookings!`,
    entityType: "property",
    entityId: propertyId,
    adminId,
    link: `/owner/listings/${propertyId}`,
    metadata: {
      propertyName,
      action: "approved",
    },
  });
}

// Property Rejected - Final Decision
export async function notifyPropertyRejected(
  ownerId: string,
  propertyId: string,
  propertyName: string,
  rejectionReason: string,
  adminId: string
) {
  return sendOwnerNotification({
    userId: ownerId,
    type: "property_rejected",
    title: `❌ Property Not Approved`,
    message: `Your property "${propertyName}" was not approved. Reason: ${rejectionReason}. You can list a different property.`,
    entityType: "property",
    entityId: propertyId,
    adminId,
    link: `/owner/listings`,
    metadata: {
      propertyName,
      reason: rejectionReason,
      action: "rejected",
      isFinal: true,
    },
  });
}

// Property Changes Requested - Owner can resubmit
export async function notifyPropertyChangesRequested(
  ownerId: string,
  propertyId: string,
  propertyName: string,
  changesReason: string,
  adminId: string
) {
  return sendOwnerNotification({
    userId: ownerId,
    type: "property_changes_requested",
    title: `⚠️ Changes Required`,
    message: `Your property "${propertyName}" needs some updates. Required changes: ${changesReason}. Please update and resubmit for review.`,
    entityType: "property",
    entityId: propertyId,
    adminId,
    link: `/owner/listings/${propertyId}/edit`,
    metadata: {
      propertyName,
      reason: changesReason,
      action: "changes_requested",
      allowResubmission: true,
    },
  });
}

// Owner Verification Approved
export async function notifyOwnerVerificationApproved(
  ownerId: string,
  adminId: string
) {
  return sendOwnerNotification({
    userId: ownerId,
    type: "owner_approved",
    title: `✅ Your Account Verified!`,
    message: `Your account has been verified. You can now start adding properties and cars to the platform.`,
    entityType: "owner",
    entityId: ownerId,
    adminId,
    link: `/owner/listings`,
    metadata: {
      action: "owner_approved",
    },
  });
}

// Owner Verification Rejected
export async function notifyOwnerVerificationRejected(
  ownerId: string,
  rejectionReason: string,
  adminId: string
) {
  return sendOwnerNotification({
    userId: ownerId,
    type: "owner_rejected",
    title: `❌ Verification Not Approved`,
    message: `Your account verification was not approved. Reason: ${rejectionReason}. Contact support for more information.`,
    entityType: "owner",
    entityId: ownerId,
    adminId,
    link: `/support`,
    metadata: {
      reason: rejectionReason,
      action: "owner_rejected",
      isFinal: true,
    },
  });
}

/**
 * Email notification function
 */
interface EmailNotificationPayload {
  email: string;
  userName: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
}

async function sendNotificationEmail(payload: EmailNotificationPayload) {
  // TODO: Implement email sending with Resend in email phase
  // For now, just log it
  console.log(`📧 Email would be sent to ${payload.email}:`, {
    title: payload.title,
    message: payload.message,
  });
}