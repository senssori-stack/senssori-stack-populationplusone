import React, { useState, useRef, useEffect } from 'react';
import { Text, View, StyleSheet, LayoutChangeEvent } from 'react-native';

type Props = {
    children: string;
    style?: any;
    maxFontSize?: number;
    minFontSize?: number;
    step?: number;
    numberOfLines?: number;
};

export default function FitText({ children, style, maxFontSize = 36, minFontSize = 8, step = 1, numberOfLines = 1 }: Props) {
    const [fontSize, setFontSize] = useState(maxFontSize);
    const containerWidth = useRef<number | null>(null);
    const textWidth = useRef<number | null>(null);

    useEffect(() => {
        // Reset font size when text changes
        setFontSize(maxFontSize);
        textWidth.current = null;
    }, [children, maxFontSize]);

    function onContainerLayout(e: LayoutChangeEvent) {
        containerWidth.current = e.nativeEvent.layout.width;
        attemptFit();
    }

    function onTextLayout(e: LayoutChangeEvent) {
        // measure the text width when rendered
        const w = e.nativeEvent.layout.width;
        textWidth.current = w;
        attemptFit();
    }

    function attemptFit() {
        if (!containerWidth.current || !textWidth.current) return;
        // If text fits, nothing to do. If not, reduce font size until it fits or min reached.
        if (textWidth.current <= containerWidth.current) return;
        // reduce font size progressively
        setFontSize((cur) => {
            let next = cur - step;
            if (next < minFontSize) next = minFontSize;
            return next;
        });
    }

    return (
        <View onLayout={onContainerLayout} style={styles.container}>
            <Text
                numberOfLines={numberOfLines}
                onLayout={onTextLayout}
                style={[style, { fontSize }]}
                ellipsizeMode="tail"
            >
                {children}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { width: '100%' },
});
