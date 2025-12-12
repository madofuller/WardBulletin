import { bulletinService, supabase } from './supabase';

export class BulletinScheduler {
  private intervalId: number | null = null;
  private readonly CHECK_INTERVAL = 60000; // Check every minute

  start() {
    if (this.intervalId) {
      return; // Already running
    }

    this.intervalId = window.setInterval(() => {
      this.checkAndActivateScheduledBulletins();
    }, this.CHECK_INTERVAL);

    // Run immediately on start
    this.checkAndActivateScheduledBulletins();
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private async checkAndActivateScheduledBulletins() {
    try {
      // Get current user ID from session
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;

      if (!userId) {
        return;
      }

      // Pass userId to filter bulletins the user has access to
      const scheduledBulletins = await bulletinService.getScheduledBulletins(userId);

      if (scheduledBulletins.length === 0) {
        return;
      }

      for (const bulletin of scheduledBulletins) {
        try {
          // Use the bulletin's created_by, but verify user has access
          await bulletinService.activateScheduledBulletin(bulletin.id, bulletin.created_by);
        } catch (error) {
          // Failed to activate bulletin
        }
      }
    } catch (error) {
      // Error checking scheduled bulletins
    }
  }

  // Manual activation method for testing
  async activateNow() {
    await this.checkAndActivateScheduledBulletins();
  }
}

export const bulletinScheduler = new BulletinScheduler();
