import React from "react";
import { StyleSheet, View } from "react-native";

type Props = {
  code: "en" | "rw";
  size?: number;
};

const Flag: React.FC<Props> = ({ code, size = 40 }) => {
  if (code === "rw") {
    // Rwanda: blue (large), yellow (thin), green (medium) with small sun
    return (
      <View style={[styles.flag, { width: size * 1.6, height: size }]}>
        <View
          style={[
            styles.rwStripe,
            { backgroundColor: "#1EB6FF", height: "55%" },
          ]}
        />
        <View
          style={[
            styles.rwStripe,
            { backgroundColor: "#FFD400", height: "15%" },
          ]}
        />
        <View
          style={[
            styles.rwStripe,
            { backgroundColor: "#1FA74B", height: "30%" },
          ]}
        />
        <View
          style={[styles.rwSun, { right: size * 0.12, top: size * 0.08 }]}
        />
      </View>
    );
  }

  // Default: approximate UK flag for 'en'
  return (
    <View
      style={[
        styles.flag,
        { width: size * 1.6, height: size, backgroundColor: "#012169" },
      ]}
    >
      {/* white diagonal */}
      <View
        style={[
          styles.diag,
          styles.whiteDiag,
          { transform: [{ rotate: "45deg" }] },
        ]}
      />
      <View
        style={[
          styles.diag,
          styles.whiteDiag,
          { transform: [{ rotate: "-45deg" }] },
        ]}
      />

      {/* red diagonal */}
      <View
        style={[
          styles.diag,
          styles.redDiag,
          { transform: [{ rotate: "45deg" }] },
        ]}
      />
      <View
        style={[
          styles.diag,
          styles.redDiag,
          { transform: [{ rotate: "-45deg" }] },
        ]}
      />

      {/* white cross */}
      <View style={[styles.crossV]} />
      <View style={[styles.crossH]} />

      {/* red cross */}
      <View style={[styles.crossV, styles.redCrossV]} />
      <View style={[styles.crossH, styles.redCrossH]} />
    </View>
  );
};

const styles = StyleSheet.create({
  flag: {
    borderRadius: 4,
    overflow: "hidden",
    position: "relative",
  },
  rwStripe: {
    width: "100%",
  },
  rwSun: {
    position: "absolute",
    width: 10,
    height: 10,
    borderRadius: 6,
    backgroundColor: "#FFD400",
  },
  diag: {
    position: "absolute",
    left: "-10%",
    top: "-10%",
    width: "120%",
    height: "20%",
    borderRadius: 2,
  },
  whiteDiag: {
    backgroundColor: "#fff",
    opacity: 0.95,
  },
  redDiag: {
    backgroundColor: "#C8102E",
    opacity: 0.95,
    height: "12%",
  },
  crossV: {
    position: "absolute",
    left: "42%",
    top: 0,
    width: "16%",
    height: "100%",
    backgroundColor: "#fff",
  },
  crossH: {
    position: "absolute",
    top: "42%",
    left: 0,
    height: "16%",
    width: "100%",
    backgroundColor: "#fff",
  },
  redCrossV: {
    left: "46%",
    width: "8%",
    backgroundColor: "#C8102E",
  },
  redCrossH: {
    top: "46%",
    height: "8%",
    backgroundColor: "#C8102E",
  },
});

export default Flag;
