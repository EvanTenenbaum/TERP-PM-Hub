import { useEffect, useState } from 'react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

const SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutes

export function useAutoSync() {
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const utils = trpc.useUtils();
  
  const syncMutation = trpc.sync.triggerSync.useMutation({
    onMutate: () => {
      setIsSyncing(true);
    },
    onSuccess: () => {
      setLastSync(new Date());
      setIsSyncing(false);
      utils.pmItems.list.invalidate();
      console.log('[Auto-Sync] GitHub sync completed');
    },
    onError: (error: any) => {
      setIsSyncing(false);
      console.error('[Auto-Sync] Failed:', error.message);
      // Don't show toast for background sync failures to avoid spam
    }
  });

  // Sync once per session (not on every page load)
  useEffect(() => {
    const hasSyncedThisSession = sessionStorage.getItem('pm-hub-synced');
    
    if (!hasSyncedThisSession) {
      console.log('[Auto-Sync] First sync of session');
      syncMutation.mutate();
      sessionStorage.setItem('pm-hub-synced', new Date().toISOString());
    } else {
      console.log('[Auto-Sync] Already synced this session at', hasSyncedThisSession);
      setLastSync(new Date(hasSyncedThisSession));
    }
  }, []);

  // Periodic sync
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isSyncing) {
        syncMutation.mutate();
      }
    }, SYNC_INTERVAL);

    return () => clearInterval(interval);
  }, [isSyncing]);

  const manualSync = () => {
    syncMutation.mutate();
    toast.promise(
      new Promise((resolve, reject) => {
        const unsubscribe = syncMutation.mutate(undefined, {
          onSuccess: () => {
            resolve(true);
            unsubscribe;
          },
          onError: (error: any) => {
            reject(error);
            unsubscribe;
          }
        });
      }),
      {
        loading: 'Syncing with GitHub...',
        success: 'Sync complete!',
        error: 'Sync failed'
      }
    );
  };

  return {
    isSyncing,
    lastSync,
    manualSync
  };
}
