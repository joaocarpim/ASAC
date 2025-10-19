// src/components/AccessibleImage.tsx

import React from "react";
import { Image, ImageProps, Text, View, StyleSheet } from "react-native";
import { useSettings } from "../hooks/useSettings";
import { useContrast } from "../hooks/useContrast";

interface AccessibleImageProps extends ImageProps {
  alt?: string;
  fallbackText?: string;
}

const AccessibleImage: React.FC<AccessibleImageProps> = ({
  alt,
  fallbackText,
  style,
  ...props
}) => {
  const { imageScale } = useSettings();
  const { theme } = useContrast();
  const [hasError, setHasError] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  const handleError = (error: any) => {
    console.log("AccessibleImage Error:", error.nativeEvent.error);
    setHasError(true);
    setIsLoading(false);
    if (props.onError) {
      props.onError(error);
    }
  };

  // CORREÇÃO APLICADA AQUI
  const handleLoad = (event: any) => {
    console.log("AccessibleImage Load Success");
    setIsLoading(false);
    setHasError(false);
    if (props.onLoad) {
      props.onLoad(event);
    }
  };

  const handleLoadStart = () => {
    console.log("AccessibleImage Load Start");
    setIsLoading(true);
    if (props.onLoadStart) {
      props.onLoadStart();
    }
  };

  if (hasError) {
    return (
      <View
        style={[style, styles.fallbackContainer, { borderColor: theme.text }]}
      >
        <Text style={[styles.fallbackText, { color: theme.text }]}>
          {fallbackText || "?"}
        </Text>
        <Text style={[styles.fallbackSubtext, { color: theme.text }]}>
          Imagem não encontrada
        </Text>
      </View>
    );
  }

  return (
    <View style={style}>
      <Image
        {...props}
        style={[
          { width: "100%", height: "100%" },
          imageScale !== 1 ? { transform: [{ scale: imageScale }] } : {},
        ]}
        accessible={true}
        accessibilityLabel={alt || props.accessibilityLabel}
        onError={handleError}
        onLoad={handleLoad}
        onLoadStart={handleLoadStart}
        resizeMode={props.resizeMode || "contain"}
      />
      {__DEV__ && (
        <View style={styles.debugIndicator}>
          <Text style={styles.debugText}>{isLoading ? "⏳" : "✅"}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  fallbackContainer: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderStyle: "dashed",
    borderRadius: 8,
    padding: 10,
  },
  fallbackText: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 5,
  },
  fallbackSubtext: {
    fontSize: 10,
    opacity: 0.7,
    textAlign: "center",
  },
  debugIndicator: {
    position: "absolute",
    top: 2,
    right: 2,
    backgroundColor: "rgba(0,0,0,0.1)",
    borderRadius: 8,
    padding: 1,
  },
  debugText: {
    fontSize: 12,
  },
});

export default AccessibleImage;
