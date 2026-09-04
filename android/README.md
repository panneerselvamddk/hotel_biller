# Taste of Thanjai Android app

Open this `android` folder in Android Studio, allow Gradle sync, then run the `app` configuration on a device or emulator.

The app contains the Vite production build in `app/src/main/assets/www`, so billing and LocalStorage data work offline. The current API URL still points to `http://localhost:5000/api`; on a physical device, replace that URL with a deployed HTTPS backend before using MySQL sync.

For a signed release, use Android Studio's **Build > Generate Signed App Bundle / APK**.
