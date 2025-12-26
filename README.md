# Rollytics - Offline Attendance Manager

A React Native attendance management app for teachers and college students with class-wise attendance tracking and percentage calculation. 

## Features

- ✅ Offline attendance management (no permissions required)
- 📊 Class-wise attendance tracking
- 📈 Automatic percentage calculation
- 👥 Student management
- 📅 Date-wise attendance records
- 📱 Clean and intuitive UI

## Tech Stack

- React Native 0.80.1
- React Navigation v6
- AsyncStorage for offline data persistence
- React Native Vector Icons

## Folder Structure

```
Rollytics/
├── src/
│   ├── components/
│   │   ├── ClassCard.jsx
│   │   ├── StudentCard.jsx
│   │   ├── AttendanceItem.jsx
│   │   └── Header.jsx
│   ├── screens/
│   │   ├── HomeScreen.jsx
│   │   ├── ClassDetailsScreen.jsx
│   │   ├── TakeAttendanceScreen.jsx
│   │   ├── AttendanceHistoryScreen.jsx
│   │   └── StatisticsScreen.jsx
│   ├── utils/
│   │   └── storage.js
│   ├── constants/
│   │   └── colors.js
│   └── navigation/
│       └── AppNavigator.jsx
├── App.jsx
├── package.json
└── README.md
```

## Installation

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- React Native development environment setup
- For iOS: Xcode and CocoaPods
- For Android: Android Studio and JDK

### Steps

1. **Clone or create the project**

```bash
npx react-native@0.80.1 init Rollytics --version 0.80.1
cd Rollytics
```

2. **Install dependencies**

```bash
npm install @react-native-async-storage/async-storage@^2.2.0
npm install @react-native-picker/picker@^2.11.4
npm install @react-navigation/bottom-tabs@^6.6.1
npm install @react-navigation/native@^6.1.18
npm install @react-navigation/native-stack@^6.11.0
npm install react-native-safe-area-context@^5.6.2
npm install react-native-screens@^4.18.0
npm install react-native-vector-icons@^10.3.0
```

3. **iOS specific setup**

```bash
cd ios
pod install
cd ..
```

4. **Link Vector Icons (if needed)**

For Android, add to `android/app/build.gradle`:

```gradle
apply from: file("../../node_modules/react-native-vector-icons/fonts.gradle")
```

For iOS, the fonts are automatically linked via CocoaPods.

5. **Replace the files**

Copy all the source files from this repository into your project following the folder structure above.

6. **Run the app**

```bash
# For Android
npm run android

# For iOS
npm run ios
```

## Usage

### Adding a Class

1. Open the app
2. Tap the "+" button on the home screen
3. Enter class name and add students
4. Save the class

### Taking Attendance

1. Select a class from the home screen
2. Tap "Take Attendance"
3. Mark students as Present/Absent
4. Save attendance

### Viewing Statistics

1. Navigate to the Statistics tab
2. View overall attendance percentages
3. Check class-wise performance

## Package.json Dependencies

```json
{
  "dependencies": {
    "@react-native-async-storage/async-storage": "^2.2.0",
    "@react-native-picker/picker": "^2.11.4",
    "@react-native/new-app-screen": "0.80.1",
    "@react-navigation/bottom-tabs":  "^6.6.1",
    "@react-navigation/native": "^6.1.18",
    "@react-navigation/native-stack": "^6.11.0",
    "react":  "19.1.0",
    "react-native": "0.80.1",
    "react-native-safe-area-context": "^5.6.2",
    "react-native-screens": "^4.18.0",
    "react-native-vector-icons": "^10.3.0"
  }
}
```

## Permissions

**This app requires NO permissions! ** All data is stored locally using AsyncStorage.

## License

MIT

## Support

For issues and feature requests, please create an issue in the repository.
```