import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Animated,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const ITEM_HEIGHT = 44;
const VISIBLE_ITEMS = 5;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

function getDaysInMonth(month: number, year: number): number {
    return new Date(year, month + 1, 0).getDate();
}

interface ScrollWheelProps {
    items: string[];
    selectedIndex: number;
    onSelect: (index: number) => void;
    width: number | string;
}

function ScrollWheel({ items, selectedIndex, onSelect, width }: ScrollWheelProps) {
    const scrollRef = useRef<ScrollView>(null);
    const [isScrolling, setIsScrolling] = useState(false);

    // Scroll to selected item on mount and when selectedIndex changes externally
    useEffect(() => {
        if (!isScrolling && scrollRef.current) {
            scrollRef.current.scrollTo({
                y: selectedIndex * ITEM_HEIGHT,
                animated: false,
            });
        }
    }, [selectedIndex]);

    const handleMomentumEnd = useCallback((event: any) => {
        const y = event.nativeEvent.contentOffset.y;
        const index = Math.round(y / ITEM_HEIGHT);
        const clampedIndex = Math.max(0, Math.min(index, items.length - 1));
        setIsScrolling(false);
        if (clampedIndex !== selectedIndex) {
            onSelect(clampedIndex);
        }
        // Snap to exact position
        scrollRef.current?.scrollTo({
            y: clampedIndex * ITEM_HEIGHT,
            animated: true,
        });
    }, [items.length, selectedIndex, onSelect]);

    const handleScrollBegin = useCallback(() => {
        setIsScrolling(true);
    }, []);

    // Calculate padding to center the first/last items
    const topPadding = ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2);
    const bottomPadding = ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2);

    return (
        <View style={[{ width: width as any, height: PICKER_HEIGHT, overflow: 'hidden' }]}>
            {/* Selection highlight */}
            <View
                pointerEvents="none"
                style={{
                    position: 'absolute',
                    top: topPadding,
                    left: 4,
                    right: 4,
                    height: ITEM_HEIGHT,
                    backgroundColor: 'rgba(0, 122, 255, 0.12)',
                    borderRadius: 10,
                    zIndex: 1,
                }}
            />
            <ScrollView
                ref={scrollRef}
                showsVerticalScrollIndicator={false}
                snapToInterval={ITEM_HEIGHT}
                decelerationRate="fast"
                onMomentumScrollEnd={handleMomentumEnd}
                onScrollBeginDrag={handleScrollBegin}
                contentContainerStyle={{
                    paddingTop: topPadding,
                    paddingBottom: bottomPadding,
                }}
                nestedScrollEnabled={true}
            >
                {items.map((item, index) => {
                    const isSelected = index === selectedIndex;
                    return (
                        <TouchableOpacity
                            key={`${item}-${index}`}
                            activeOpacity={0.7}
                            onPress={() => {
                                onSelect(index);
                                scrollRef.current?.scrollTo({
                                    y: index * ITEM_HEIGHT,
                                    animated: true,
                                });
                            }}
                            style={{
                                height: ITEM_HEIGHT,
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                        >
                            <Text
                                style={{
                                    fontSize: isSelected ? 20 : 16,
                                    fontWeight: isSelected ? '700' : '400',
                                    color: isSelected ? '#007AFF' : '#666',
                                    opacity: isSelected ? 1 : 0.6,
                                }}
                            >
                                {item}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
}

interface ScrollableDatePickerProps {
    visible: boolean;
    date: Date;
    onDateChange: (date: Date) => void;
    onClose: () => void;
    title?: string;
    minimumDate?: Date;
    maximumDate?: Date;
}

export default function ScrollableDatePicker({
    visible,
    date,
    onDateChange,
    onClose,
    title = 'Select Date',
    minimumDate,
    maximumDate,
}: ScrollableDatePickerProps) {
    const [selectedMonth, setSelectedMonth] = useState(date.getMonth());
    const [selectedDay, setSelectedDay] = useState(date.getDate());
    const [selectedYear, setSelectedYear] = useState(date.getFullYear());
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(300)).current;

    // Generate year range
    const minYear = minimumDate ? minimumDate.getFullYear() : 1900;
    const maxYear = maximumDate ? maximumDate.getFullYear() : 2030;
    const years: number[] = [];
    for (let y = minYear; y <= maxYear; y++) {
        years.push(y);
    }

    // Update local state when date prop changes
    useEffect(() => {
        setSelectedMonth(date.getMonth());
        setSelectedDay(date.getDate());
        setSelectedYear(date.getFullYear());
    }, [date]);

    // Animate in/out
    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 250,
                    useNativeDriver: true,
                }),
                Animated.spring(slideAnim, {
                    toValue: 0,
                    damping: 20,
                    stiffness: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [visible]);

    const handleClose = () => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 300,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start(() => onClose());
    };

    // Get days for current month/year
    const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
    const days: number[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
        days.push(d);
    }

    // Clamp day if month/year changes
    const clampedDay = Math.min(selectedDay, daysInMonth);

    const handleConfirm = () => {
        const newDate = new Date(selectedYear, selectedMonth, clampedDay);
        onDateChange(newDate);
        handleClose();
    };

    const handleMonthChange = (index: number) => {
        setSelectedMonth(index);
        // Clamp day
        const maxDays = getDaysInMonth(index, selectedYear);
        if (selectedDay > maxDays) {
            setSelectedDay(maxDays);
        }
    };

    const handleYearChange = (index: number) => {
        const year = years[index];
        setSelectedYear(year);
        // Clamp day
        const maxDays = getDaysInMonth(selectedMonth, year);
        if (selectedDay > maxDays) {
            setSelectedDay(maxDays);
        }
    };

    if (!visible) return null;

    const yearIndex = years.indexOf(selectedYear);

    return (
        <Modal transparent visible={visible} animationType="none">
            <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
                <TouchableOpacity style={styles.overlayTouch} onPress={handleClose} activeOpacity={1} />
                <Animated.View style={[styles.pickerContainer, { transform: [{ translateY: slideAnim }] }]}>
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={handleClose}>
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                        <Text style={styles.titleText}>{title}</Text>
                        <TouchableOpacity onPress={handleConfirm}>
                            <Text style={styles.doneText}>Done</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Scroll Wheels */}
                    <View style={styles.wheelsContainer}>
                        {/* Month */}
                        <ScrollWheel
                            items={MONTHS}
                            selectedIndex={selectedMonth}
                            onSelect={handleMonthChange}
                            width="40%"
                        />
                        {/* Day */}
                        <ScrollWheel
                            items={days.map(d => String(d))}
                            selectedIndex={clampedDay - 1}
                            onSelect={(index) => setSelectedDay(index + 1)}
                            width="20%"
                        />
                        {/* Year */}
                        <ScrollWheel
                            items={years.map(y => String(y))}
                            selectedIndex={yearIndex >= 0 ? yearIndex : 0}
                            onSelect={handleYearChange}
                            width="30%"
                        />
                    </View>

                    {/* Preview */}
                    <View style={styles.previewRow}>
                        <Text style={styles.previewText}>
                            {MONTHS[selectedMonth]} {clampedDay}, {selectedYear}
                        </Text>
                    </View>
                </Animated.View>
            </Animated.View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    overlayTouch: {
        flex: 1,
    },
    pickerContainer: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E5',
    },
    cancelText: {
        fontSize: 16,
        color: '#999',
    },
    titleText: {
        fontSize: 17,
        fontWeight: '600',
        color: '#333',
    },
    doneText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#007AFF',
    },
    wheelsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 10,
    },
    previewRow: {
        alignItems: 'center',
        paddingVertical: 8,
        borderTopWidth: 1,
        borderTopColor: '#E5E5E5',
    },
    previewText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#007AFF',
    },
});
