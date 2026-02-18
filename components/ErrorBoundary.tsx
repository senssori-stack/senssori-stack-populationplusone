import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

interface Props {
    children: React.ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export default class ErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('App Error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <View style={styles.container}>
                    <Text style={styles.title}>Something went wrong</Text>
                    <ScrollView style={styles.scroll}>
                        <Text style={styles.error}>
                            {this.state.error?.toString()}
                        </Text>
                        <Text style={styles.stack}>
                            {this.state.error?.stack}
                        </Text>
                    </ScrollView>
                </View>
            );
        }

        return this.props.children;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 20,
        paddingTop: 60,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'red',
        marginBottom: 20,
    },
    scroll: {
        flex: 1,
        width: '100%',
    },
    error: {
        fontSize: 16,
        color: '#333',
        marginBottom: 10,
    },
    stack: {
        fontSize: 12,
        color: '#666',
        fontFamily: 'monospace',
    },
});
