import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '@/api.js';

export const useStudentNotificationsStore = defineStore('studentNotifications', () => {
  const notifications = ref([]);
  const isLoading = ref(false);
  const error = ref('');

  // Unread count badge
  const unreadCount = computed(() => notifications.value.filter((n) => !n.isRead).length);

  // Group by severity
  const ineligibleNotifications = computed(() =>
    notifications.value.filter((n) => n.type === 'ineligible')
  );
  const warningNotifications = computed(() =>
    notifications.value.filter((n) => n.type === 'warning_1' || n.type === 'warning_2')
  );
  const evalOpenNotifications = computed(() =>
    notifications.value.filter((n) => n.type === 'eval_open')
  );

  /**
   * Fetch all student notifications from the backend.
   */
  async function fetchNotifications() {
    isLoading.value = true;
    error.value = '';
    try {
      const { data } = await api.get('/notifications/my');
      notifications.value = data;
    } catch (err) {
      error.value = err?.response?.data?.message || 'Failed to load notifications';
      console.error('fetchNotifications error:', err);
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Mark a single notification as read.
   */
  async function markRead(id) {
    try {
      await api.patch(`/notifications/${id}/read`);
      const n = notifications.value.find((n) => n.id === id);
      if (n) n.isRead = true;
    } catch (err) {
      console.error('markRead error:', err);
    }
  }

  /**
   * Mark all notifications as read.
   */
  async function markAllRead() {
    try {
      await api.patch('/notifications/read-all');
      notifications.value.forEach((n) => (n.isRead = true));
    } catch (err) {
      console.error('markAllRead error:', err);
    }
  }

  return {
    notifications,
    isLoading,
    error,
    unreadCount,
    ineligibleNotifications,
    warningNotifications,
    evalOpenNotifications,
    fetchNotifications,
    markRead,
    markAllRead,
  };
});
