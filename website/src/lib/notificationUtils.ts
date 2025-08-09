// src/lib/notificationUtils.ts
import { JobEventType } from '@effectiveacceleration/contracts';
import type { NotificationWithJob } from '@/hooks/subsquid/useUserNotifications';
import { formatTokenNameAndAmount } from '@/tokens';
import { 
  FileText, 
  UserCheck, 
  DollarSign, 
  Edit, 
  PenTool, 
  CheckCircle, 
  Package, 
  Star, 
  RotateCcw, 
  AlertTriangle, 
  Scale, 
  XCircle, 
  UserPlus, 
  UserMinus, 
  Banknote, 
  Lock, 
  Unlock, 
  MessageSquare,
  FileCheck
} from 'lucide-react';
import React from 'react';

export interface NotificationContent {
  title: string;
  description: string;
  icon?: React.ReactElement;
  priority?: 'low' | 'medium' | 'high';
}

// Helper function to truncate message content
const truncateMessage = (message: string, maxLength: number = 80): string => {
  if (!message) return '';
  // Clean the message - remove any trailing quotes or apostrophes
  const cleanMessage = message.trim().replace(/['"`]+$/, '');
  if (cleanMessage.length <= maxLength) return cleanMessage;
  return `${cleanMessage.substring(0, maxLength).trim()}...`;
};

export const getNotificationContent = (
  notification: NotificationWithJob,
  currentUserAddress?: string
): NotificationContent => {
  const { type, job, address } = notification;
  const isRead = notification.read;
  
  // Helper to determine if current user is creator, worker, or arbitrator
  const getUserRole = () => {
    if (!currentUserAddress || !job) return 'participant';
    const addr = currentUserAddress.toLowerCase();
    if (job.roles?.creator?.toLowerCase() === addr) return 'creator';
    if (job.roles?.worker?.toLowerCase() === addr) return 'worker';
    if (job.roles?.arbitrator?.toLowerCase() === addr) return 'arbitrator';
    return 'participant';
  };

  const userRole = getUserRole();

  // DEBUG logging for message notifications
  if (type === JobEventType.OwnerMessage || type === JobEventType.WorkerMessage) {
    console.log('[notificationUtils] Processing message notification:', {
      notificationId: notification.id,
      type,
      hasMessageContent: !!notification.messageContent,
      messageContent: notification.messageContent,
      messageContentLength: notification.messageContent?.length
    });
  }

  switch (type) {
    case JobEventType.Created:
      return {
        title: isRead ? 'Job Created' : 'New Job Created',
        description: userRole === 'arbitrator' 
          ? 'You have been assigned as the arbitrator for this job'
          : 'A job has been created',
        icon: React.createElement(FileText, { className: 'h-3.5 w-3.5' }),
        priority: 'high'
      };

    case JobEventType.Taken:
      return {
        title: 'Job Taken',
        description: userRole === 'creator'
          ? 'A worker has accepted your job'
          : 'This job has been taken by a worker',
        icon: React.createElement(UserCheck, { className: 'h-3.5 w-3.5' }),
        priority: 'high'
      };

    case JobEventType.Paid:
      return {
        title: 'Payment Received',
        description: job?.amount 
          ? `Payment of ${formatTokenNameAndAmount(job.token, job.amount)} has been made`
          : 'Payment has been made for this job',
        icon: React.createElement(DollarSign, { className: 'h-3.5 w-3.5' }),
        priority: 'high'
      };

    case JobEventType.Updated:
      return {
        title: 'Job Updated',
        description: 'Job details have been modified',
        icon: React.createElement(Edit, { className: 'h-3.5 w-3.5' }),
        priority: 'medium'
      };

    case JobEventType.Signed:
      return {
        title: 'Contract Signed',
        description: userRole === 'creator'
          ? 'The worker has signed the job agreement'
          : 'The job agreement has been signed',
        icon: React.createElement(PenTool, { className: 'h-3.5 w-3.5' }),
        priority: 'medium'
      };

    case JobEventType.Completed:
      return {
        title: 'Job Completed',
        description: userRole === 'worker'
          ? 'Your work has been approved and payment released'
          : userRole === 'arbitrator'
          ? 'This job has been successfully completed'
          : 'The job has been completed and approved',
        icon: React.createElement(CheckCircle, { className: 'h-3.5 w-3.5' }),
        priority: 'high'
      };

    case JobEventType.Delivered:
      return {
        title: 'Work Delivered',
        description: userRole === 'creator'
          ? 'The worker has submitted their deliverables'
          : 'Deliverables have been submitted for review',
        icon: React.createElement(Package, { className: 'h-3.5 w-3.5' }),
        priority: 'high'
      };

    case JobEventType.Rated:
      return {
        title: isRead ? 'Rating Received' : 'New Rating',
        description: userRole === 'worker'
          ? 'You have received a rating for your work'
          : 'A rating has been submitted',
        icon: React.createElement(Star, { className: 'h-3.5 w-3.5' }),
        priority: 'medium'
      };

    case JobEventType.Refunded:
      return {
        title: 'Job Refunded',
        description: userRole === 'creator'
          ? 'Your payment has been refunded'
          : 'The job payment has been refunded',
        icon: React.createElement(RotateCcw, { className: 'h-3.5 w-3.5' }),
        priority: 'high'
      };

    case JobEventType.Disputed:
      return {
        title: 'Dispute Raised',
        description: userRole === 'arbitrator'
          ? 'Your arbitration is needed to resolve this dispute'
          : 'A dispute has been raised and sent to arbitration',
        icon: React.createElement(AlertTriangle, { className: 'h-3.5 w-3.5' }),
        priority: 'high'
      };

    case JobEventType.Arbitrated:
      return {
        title: 'Arbitration Complete',
        description: 'The dispute has been resolved by the arbitrator',
        icon: React.createElement(Scale, { className: 'h-3.5 w-3.5' }),
        priority: 'high'
      };

    case JobEventType.ArbitrationRefused:
      return {
        title: 'Arbitration Refused',
        description: 'The arbitrator has refused to handle this dispute',
        icon: React.createElement(XCircle, { className: 'h-3.5 w-3.5' }),
        priority: 'high'
      };

    case JobEventType.WhitelistedWorkerAdded:
      return {
        title: 'Added to Whitelist',
        description: userRole === 'worker' || address?.toLowerCase() === currentUserAddress?.toLowerCase()
          ? 'You have been added to the whitelist for this job'
          : 'A worker has been added to the whitelist',
        icon: React.createElement(UserPlus, { className: 'h-3.5 w-3.5' }),
        priority: 'medium'
      };

    case JobEventType.WhitelistedWorkerRemoved:
      return {
        title: 'Removed from Whitelist',
        description: userRole === 'worker' || address?.toLowerCase() === currentUserAddress?.toLowerCase()
          ? 'You have been removed from the whitelist'
          : 'A worker has been removed from the whitelist',
        icon: React.createElement(UserMinus, { className: 'h-3.5 w-3.5' }),
        priority: 'low'
      };

    case JobEventType.CollateralWithdrawn:
      return {
        title: 'Collateral Withdrawn',
        description: job?.collateralOwed 
          ? `${formatTokenNameAndAmount(job.token, job.collateralOwed)} withdrawn`
          : 'Collateral has been withdrawn',
        icon: React.createElement(Banknote, { className: 'h-3.5 w-3.5' }),
        priority: 'medium'
      };

    case JobEventType.Closed:
      return {
        title: 'Job Closed',
        description: 'This job has been closed',
        icon: React.createElement(Lock, { className: 'h-3.5 w-3.5' }),
        priority: 'medium'
      };

    case JobEventType.Reopened:
      return {
        title: 'Job Reopened',
        description: 'This job has been reopened for applications',
        icon: React.createElement(Unlock, { className: 'h-3.5 w-3.5' }),
        priority: 'high'
      };

    case JobEventType.OwnerMessage:
    case JobEventType.WorkerMessage: {
      const messageContent = notification.messageContent;
      const isOwnerMessage = type === JobEventType.OwnerMessage;
      
      // Determine description based on content availability
      let description = '';
      
      if (messageContent && messageContent.trim()) {
        // We have actual content
        if (messageContent === '[Unable to load message]' || 
            messageContent === '[Error loading message]') {
          // Error states from the fetch
          description = messageContent;
        } else {
          // Valid message content
          description = truncateMessage(messageContent);
        }
      } else if (messageContent === '') {
        // Explicitly empty message (rare but possible)
        description = '[Empty message]';
      } else {
        // No content available yet or undefined
        // This provides a fallback that's better than empty string
        description = isOwnerMessage 
          ? `Message from ${userRole === 'worker' ? 'job owner' : 'owner'}`
          : `Message from ${userRole === 'creator' ? 'worker' : 'worker'}`;
      }
      
      console.log('[notificationUtils] Message notification result:', {
        notificationId: notification.id,
        hasContent: !!messageContent,
        contentLength: messageContent?.length,
        finalDescription: description
      });
      
      return {
        title: isRead ? 'Message' : 'New Message',
        description,
        icon: React.createElement(MessageSquare, { className: 'h-3.5 w-3.5' }),
        priority: 'medium'
      };
    }

    default:
      return {
        title: 'Job Update',
        description: `Activity on job #${notification.jobId}`,
        icon: React.createElement(FileCheck, { className: 'h-3.5 w-3.5' }),
        priority: 'low'
      };
  }
}
