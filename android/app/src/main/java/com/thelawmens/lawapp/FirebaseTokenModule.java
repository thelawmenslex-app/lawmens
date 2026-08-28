package com.thelawmens.lawapp;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Build;
import androidx.annotation.NonNull;
import androidx.core.app.NotificationCompat;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.google.firebase.messaging.FirebaseMessaging;

public class FirebaseTokenModule extends ReactContextBaseJavaModule {

    public static final String CHANNEL_ID = "lawmens_broadcasts_channel";
    public static final String CHANNEL_NAME = "THE-LAWMEN'S Legal Broadcasts";

    public FirebaseTokenModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @NonNull
    @Override
    public String getName() {
        return "FirebaseTokenModule";
    }

    @ReactMethod
    public void getFcmToken(Promise promise) {
        try {
            FirebaseMessaging.getInstance().getToken()
                .addOnCompleteListener(task -> {
                    if (!task.isSuccessful()) {
                        promise.reject("FCM_ERROR", task.getException() != null ? task.getException().getMessage() : "Failed to fetch FCM token");
                        return;
                    }
                    String token = task.getResult();
                    promise.resolve(token);
                });
        } catch (Exception e) {
            promise.reject("FCM_EXCEPTION", e.getMessage());
        }
    }

    @ReactMethod
    public void displaySystemNotification(String title, String message, String actionUrl) {
        try {
            Context context = getReactApplicationContext();
            if (context == null) return;

            Intent intent = new Intent(context, MainActivity.class);
            intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
            if (actionUrl != null && !actionUrl.isEmpty()) {
                intent.putExtra("actionUrl", actionUrl);
            }

            PendingIntent pendingIntent = PendingIntent.getActivity(
                    context,
                    (int) System.currentTimeMillis(),
                    intent,
                    PendingIntent.FLAG_ONE_SHOT | PendingIntent.FLAG_IMMUTABLE
            );

            Uri defaultSoundUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION);

            NotificationCompat.Builder notificationBuilder =
                    new NotificationCompat.Builder(context, CHANNEL_ID)
                            .setSmallIcon(R.mipmap.ic_launcher)
                            .setContentTitle(title != null && !title.isEmpty() ? title : "THE-LAWMEN'S Legal Notice")
                            .setContentText(message != null ? message : "New legal broadcast available.")
                            .setStyle(new NotificationCompat.BigTextStyle().bigText(message != null ? message : ""))
                            .setAutoCancel(true)
                            .setSound(defaultSoundUri)
                            .setPriority(NotificationCompat.PRIORITY_HIGH)
                            .setDefaults(NotificationCompat.DEFAULT_ALL)
                            .setContentIntent(pendingIntent);

            NotificationManager notificationManager =
                    (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                NotificationChannel channel = new NotificationChannel(
                        CHANNEL_ID,
                        CHANNEL_NAME,
                        NotificationManager.IMPORTANCE_HIGH
                );
                channel.setDescription("Live legal updates, amendments, and notifications");
                channel.enableLights(true);
                channel.enableVibration(true);
                if (notificationManager != null) {
                    notificationManager.createNotificationChannel(channel);
                }
            }

            if (notificationManager != null) {
                notificationManager.notify((int) System.currentTimeMillis(), notificationBuilder.build());
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
