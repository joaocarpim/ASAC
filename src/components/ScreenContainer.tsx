// src/components/ScreenContainer.tsx

// ALTERAÇÃO: Precisamos do 'React' para usar o 'ComponentProps'
import React from "react";
// ALTERAÇÃO: Removemos a tentativa de importar 'SafeAreaViewProps'
import { StyleSheet, SafeAreaView } from "react-native";

// ALTERAÇÃO: Usamos React.ComponentProps para pegar o tipo correto das props do SafeAreaView
type ScreenContainerProps = React.ComponentProps<typeof SafeAreaView>;

// O componente agora usa o tipo correto que acabamos de definir
const ScreenContainer = ({
  children,
  style,
  ...props
}: ScreenContainerProps) => {
  return (
    <SafeAreaView style={[styles.container, style]} {...props}>
      {children}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default ScreenContainer;
