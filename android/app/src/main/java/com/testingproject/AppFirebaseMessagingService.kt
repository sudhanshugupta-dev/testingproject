package com.testingproject

import android.content.Context
import android.util.Log
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
// Removed ShortcutBadger to avoid AndroidX/support conflicts

class AppFirebaseMessagingService : FirebaseMessagingService() {
  override fun onMessageReceived(message: RemoteMessage) {
    super.onMessageReceived(message)
    try {
      val data = message.data
      // Expect server to send totalUnread in payload
      val totalUnreadString = data["totalUnread"]
      if (totalUnreadString != null) {
        val totalUnread = totalUnreadString.toIntOrNull() ?: 0
        updateAppIconBadge(applicationContext, totalUnread)
      }
    } catch (e: Exception) {
      Log.e("FCM", "Error processing message for badge", e)
    }
  }

  private fun updateAppIconBadge(context: Context, count: Int) {
    // No-op: ShortcutBadger removed. Implement OEM-specific badges if needed.
    Log.d("Badge", "Badge count update requested: $count (no-op)")
  }
}



