# Hopper - Sprint 2 Development Client Setup

This application uses native networking modules (`react-native-zeroconf` for mDNS local peer discovery and `react-native-tcp-socket` for P2P socket connections). As a result, **plain Expo Go cannot run this project**.

## Running Development Builds

### 1. Build Custom Development Client
To build a custom development client binary:
```bash
# For Android:
eas build --profile development --platform android

# For iOS:
eas build --profile development --platform ios
```
Or generate local native projects:
```bash
npx expo run:android
# OR
npx expo run:ios
```

### 2. Start Metro Bundler
Once the development build app is installed on your physical test device:
```bash
npx expo start --dev-client
```

This provides fast hot reloading and full iteration capabilities while leveraging native local socket networking.
