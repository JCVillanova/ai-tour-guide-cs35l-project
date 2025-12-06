// jest.config.js
module.exports = {
  preset: "jest-expo",
  setupFilesAfterEnv: ["@testing-library/jest-native/extend-expect"],
  transformIgnorePatterns: [
    "node_modules/(?!(jest-)?react-native|@react-native|expo(nent)?|@expo(nent)?/.*|expo-router|@expo/vector-icons|react-native-svg)",
  ],
  testMatch: ["**/__tests__/**/*.test.[jt]s?(x)"],
};
