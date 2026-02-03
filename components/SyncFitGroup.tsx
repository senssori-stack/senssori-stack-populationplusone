import React, { useState, useRef, useEffect } from 'react';
import { View, Text, LayoutChangeEvent, StyleSheet } from 'react-native';

type Props = {
    items: string[]; // texts in order
    style?: any; // base text style applied to each
    maxFontSize?: number;
    minFontSize?: number;
    step?: number;
    textHorizontalMargin?: number;
    itemGap?: number; // vertical gap between items
};

export default function SyncFitGroup({ items, style, maxFontSize = 32, minFontSize = 8, step = 1, textHorizontalMargin = 8, itemGap = 8 }: Props) {
    const [fontSize, setFontSize] = useState(maxFontSize);
    const containerWidth = useRef<number | null>(null);
    const measuredWidths = useRef<number[]>([]);
    const measureCount = useRef(0);

    useEffect(() => {
        // reset when items change
        setFontSize(maxFontSize);
        measuredWidths.current = [];
        measureCount.current = 0;
    }, [items.join('|'), maxFontSize]);

    function onContainerLayout(e: LayoutChangeEvent) {
        containerWidth.current = e.nativeEvent.layout.width;
        tryAdjust();
    }

    function makeOnTextLayout(index: number) {
        return (e: LayoutChangeEvent) => {
            measuredWidths.current[index] = e.nativeEvent.layout.width;
            measureCount.current = Math.max(measureCount.current, measuredWidths.current.filter(Boolean).length);
            tryAdjust();
        };
    }

    function tryAdjust() {
        if (!containerWidth.current) return;
        // ensure we've measured all items (or at least have some data)
        if (measuredWidths.current.length < items.length) return;
        const requiredWidth = Math.max(...measuredWidths.current);
        const available = containerWidth.current - textHorizontalMargin * 2;
        if (requiredWidth <= available) return; // fits
        setFontSize((cur) => {
            const next = Math.max(minFontSize, cur - step);
            if (next === cur) return cur;
            return next;
        });
        // after reducing font size React will re-measure and call tryAdjust again
    }

    return (
        <View style={styles.container} onLayout={onContainerLayout}>
            {items.map((t, i) => (
                <Text
                    key={i}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    onLayout={makeOnTextLayout(i)}
                    style={[style, { fontSize, marginHorizontal: textHorizontalMargin, marginTop: i === 0 ? 0 : itemGap }]}
                >
                    {t}
                </Text>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({ container: { width: '100%' } });
