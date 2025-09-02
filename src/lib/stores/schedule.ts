export interface ScheduleBlock {
  id: string;
  blockedDate: string;
  deliveryBlocked: boolean;
  pickupBlocked: boolean;
  reason?: string;
  createdAt: string;
}
