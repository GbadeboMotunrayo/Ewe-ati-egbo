import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius, spacing } from '@/theme/theme';

interface Props {
  children: React.ReactNode;
}
interface State {
  error: Error | null;
}

/** Catches render crashes, offers a retry, and never shows raw error text to customers. */
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    if (__DEV__) console.error('Ewe ati Egbo crashed:', error, info);
    // TODO: send to crash reporting (e.g. Sentry) in production.
  }

  private retry = () => this.setState({ error: null });

  render() {
    if (this.state.error) {
      return (
        <View style={styles.container}>
          <Text style={styles.leaf}>🌿</Text>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>
            {__DEV__ ? this.state.error.message : 'Sorry — that screen hit a snag. Please try again.'}
          </Text>
          <Pressable onPress={this.retry} style={styles.btn} accessibilityRole="button" accessibilityLabel="Try again">
            <Text style={styles.btnText}>Try again</Text>
          </Pressable>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg, backgroundColor: colors.background },
  leaf: { fontSize: 40, marginBottom: spacing.sm },
  title: { fontFamily: fonts.heading, fontSize: 20, color: colors.text, marginBottom: spacing.sm },
  message: { fontFamily: fonts.body, fontSize: 14, color: colors.textSecondary, textAlign: 'center', maxWidth: 360 },
  btn: { marginTop: spacing.lg, backgroundColor: colors.primary, borderRadius: radius.md, paddingHorizontal: spacing.lg, paddingVertical: 14 },
  btnText: { fontFamily: fonts.headingMedium, fontSize: 15, color: colors.white },
});
