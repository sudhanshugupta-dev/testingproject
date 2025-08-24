// import React from "react";
// import { View, Text, StyleSheet } from "react-native";
// import LinearGradient from "react-native-linear-gradient";

// const initialsFromName = (name?: string) => {
//   if (!name) return "NA";
//   const parts = name.trim().split(/\s+/);
//   const first = parts[0]?.[0] || "";
//   const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
//   return (first + last).toUpperCase();
// };

// // Generate gradient colors based on name
// const colorsFromName = (name?: string) => {
//   if (!name) return ["#6366F1", "#4F46E5"];
//   const colors = [
//     ["#6366F1", "#4F46E5"], // indigo
//     ["#10B981", "#059669"], // green
//     ["#F59E0B", "#D97706"], // amber
//     ["#3B82F6", "#2563EB"], // blue
//     ["#EF4444", "#DC2626"], // red
//     ["#8B5CF6", "#7C3AED"], // violet
//     ["#EC4899", "#DB2777"], // pink
//   ];
//   const index = name.charCodeAt(0) % colors.length;
//   return colors[index];
// };

// const CustomAvatar = ({ name, size = 48 }: { name?: string; size?: number }) => {
//   const initials = initialsFromName(name);
//   const gradientColors = colorsFromName(name);

//   return (
//     <LinearGradient
//       colors={gradientColors}
//       style={[
//         styles.container,
//         { width: size, height: size, borderRadius: size / 2, shadowRadius: size * 0.2 },
//       ]}
//     >
//       <Text style={[styles.text, { fontSize: size * 0.42 }]}>{initials}</Text>
//     </LinearGradient>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     alignItems: "center",
//     justifyContent: "center",
//     shadowColor: "#000",
//     shadowOpacity: 0.15,
//     shadowOffset: { width: 0, height: 2 },
//     elevation: 4, // Android shadow
//   },
//   text: {
//     color: "#fff",
//     fontWeight: "700",
//   },
// });

// export default CustomAvatar;

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import LinearGradient from "react-native-linear-gradient";

const initialsFromName = (name?: string) => {
  if (!name) return "NA";
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] || "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
};

// Generate gradient colors based on name
const colorsFromName = (name?: string) => {
  if (!name) return ["#6366F1", "#4F46E5"];
  const colors = [
    ["#6366F1", "#4F46E5"], // indigo
    ["#10B981", "#059669"], // green
    ["#F59E0B", "#D97706"], // amber
    ["#3B82F6", "#2563EB"], // blue
    ["#EF4444", "#DC2626"], // red
    ["#8B5CF6", "#7C3AED"], // violet
    ["#EC4899", "#DB2777"], // pink
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
};

const CustomAvatar = ({ name, size = 48 }: { name?: string; size?: number }) => {
  const initials = initialsFromName(name);
  const gradientColors = colorsFromName(name);

  return (
    <LinearGradient
      colors={gradientColors}
      style={[
        styles.container,
        { width: size, height: size, borderRadius: size / 2, shadowRadius: size * 0.2 },
      ]}
    >
      <Text style={[styles.text, { fontSize: size * 0.42 }]}>{initials}</Text>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4, // Android shadow
  },
  text: {
    color: "#fff",
    fontWeight: "700",
  },
});

export default CustomAvatar;