package com.thelawmens.lawapp;

import androidx.annotation.NonNull;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.google.firebase.messaging.FirebaseMessaging;

public class FirebaseTokenModule extends ReactContextBaseJavaModule {

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
}
