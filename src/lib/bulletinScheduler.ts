import { bulletinService, supabase } from './supabase';

export class BulletinScheduler {
  private intervalId: number | null = null;
  private readonly CHECK_INTERVAL = 60000; // Check every minute

  start() {
    if (this.intervalId) {
      return; // Already running
    }

    console.log('Starting bulletin scheduler...');
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
      console.log('Bulletin scheduler stopped');
    }
  }

  private async checkAndActivateScheduledBulletins() {
    try {
      // Get current user ID from session
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      
      if (!userId) {
        console.log('No user session, skipping scheduled bulletin check');
        return;
      }

      // Pass userId to filter bulletins the user has access to
      const scheduledBulletins = await bulletinService.getScheduledBulletins(userId);

      if (scheduledBulletins.length === 0) {
        return;
      }

      console.log(`Found ${scheduledBulletins.length} bulletins ready for activation (local timezone)`);

      for (const bulletin of scheduledBulletins) {
        try {
          // Use the bulletin's created_by, but verify user has access
          await bulletinService.activateScheduledBulletin(bulletin.id, bulletin.created_by);
          console.log(`Activated bulletin ${bulletin.id} for user ${bulletin.created_by} at local time: ${new Date().toLocaleString()}`);
        } catch (error) {
          console.error(`Failed to activate bulletin ${bulletin.id}:`, error);
        }
      }
    } catch (error) {
      console.error('Error checking scheduled bulletins:', error);
    }
  }

  // Manual activation method for testing
  async activateNow() {
    console.log('Manually triggering bulletin activation check...');
    await this.checkAndActivateScheduledBulletins();
  }
}

export const bulletinScheduler = new BulletinScheduler();