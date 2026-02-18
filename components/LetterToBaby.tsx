import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLOR_SCHEMES } from '../src/data/utils/colors';
import type { ThemeName } from '../src/types';

// Landscape 11x8.5 at 300 DPI = 3300x2550 pixels
export const LANDSCAPE_WIDTH = 3300;
export const LANDSCAPE_HEIGHT = 2550;

type Props = {
    theme?: ThemeName;
    previewScale?: number;
    babyName?: string;
    dobISO?: string;
    motherName?: string;
    fatherName?: string;
    motherLetter?: string;
    fatherLetter?: string;
    jointLetter?: string;
};

export default function LetterToBaby(props: Props) {
    const {
        theme = 'green' as ThemeName,
        previewScale = 0.2,
        babyName = 'Baby',
        dobISO = '',
        motherName = 'Mom',
        fatherName = 'Dad',
        motherLetter = '',
        fatherLetter = '',
        jointLetter = '',
    } = props;

    const colors = COLOR_SCHEMES[theme] || COLOR_SCHEMES.green;

    // Fixed dimensions
    const displayWidth = LANDSCAPE_WIDTH * previewScale;
    const displayHeight = LANDSCAPE_HEIGHT * previewScale;
    const borderWidth = Math.round(displayWidth * 0.015);
    const innerPadding = Math.round(displayWidth * 0.03);

    // Font sizes scaled to display
    const titleSize = Math.round(displayWidth * 0.032);
    const subtitleSize = Math.round(displayWidth * 0.016);
    const headerSize = Math.round(displayWidth * 0.02);
    const bodySize = Math.round(displayWidth * 0.0135);
    const footerSize = Math.round(displayWidth * 0.011);

    // Format date for display
    const formattedDate = dobISO ? (() => {
        const [y, m, d] = dobISO.split('-').map(Number);
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        return `${months[m - 1]} ${d}, ${y}`;
    })() : '';

    // Divider line
    const dividerColor = colors.text === '#fff' || colors.text === '#ffffff'
        ? 'rgba(255,255,255,0.25)'
        : 'rgba(0,0,0,0.15)';

    return (
        <View style={[styles.container, {
            width: displayWidth,
            height: displayHeight,
            backgroundColor: colors.bg,
            borderWidth,
            borderColor: colors.text === '#fff' || colors.text === '#ffffff'
                ? 'rgba(255,255,255,0.3)'
                : 'rgba(0,0,0,0.2)',
        }]}>
            <View style={[styles.inner, { padding: innerPadding }]}>
                {/* Title */}
                <Text style={[styles.title, {
                    fontSize: titleSize,
                    color: colors.text,
                    marginBottom: Math.round(displayHeight * 0.005),
                }]}>
                    💌 A Letter to {babyName}
                </Text>

                {/* Subtitle with date */}
                {formattedDate ? (
                    <Text style={[styles.subtitle, {
                        fontSize: subtitleSize,
                        color: colors.text,
                        opacity: 0.7,
                        marginBottom: Math.round(displayHeight * 0.02),
                    }]}>
                        Written on the day you were born — {formattedDate}
                    </Text>
                ) : null}

                {/* Adaptive layout based on which letters are provided */}
                {jointLetter ? (
                    /* Joint letter — full width, single column */
                    <View style={[styles.letterColumn, { flex: 1 }]}>
                        <View style={[styles.letterHeaderBar, {
                            borderBottomWidth: Math.round(displayWidth * 0.002),
                            borderBottomColor: dividerColor,
                            paddingBottom: Math.round(displayHeight * 0.008),
                            marginBottom: Math.round(displayHeight * 0.012),
                        }]}>
                            <Text style={[styles.letterHeader, {
                                fontSize: headerSize,
                                color: colors.text,
                            }]}>
                                From {motherName || 'Mom'} & {fatherName || 'Dad'} 💕💙
                            </Text>
                        </View>
                        <Text style={[styles.letterBody, {
                            fontSize: bodySize,
                            color: colors.text,
                            lineHeight: bodySize * 1.55,
                        }]}>
                            {jointLetter}
                        </Text>
                    </View>
                ) : motherLetter && fatherLetter ? (
                    /* Both parents wrote separate letters — two-column layout */
                    <View style={styles.columnsRow}>
                        {/* Mom's Letter */}
                        <View style={[styles.letterColumn, {
                            marginRight: Math.round(displayWidth * 0.015),
                        }]}>
                            <View style={[styles.letterHeaderBar, {
                                borderBottomWidth: Math.round(displayWidth * 0.002),
                                borderBottomColor: dividerColor,
                                paddingBottom: Math.round(displayHeight * 0.008),
                                marginBottom: Math.round(displayHeight * 0.012),
                            }]}>
                                <Text style={[styles.letterHeader, {
                                    fontSize: headerSize,
                                    color: colors.text,
                                }]}>
                                    From {motherName || 'Mom'} 💕
                                </Text>
                            </View>
                            <Text style={[styles.letterBody, {
                                fontSize: bodySize,
                                color: colors.text,
                                lineHeight: bodySize * 1.55,
                            }]}>
                                {motherLetter}
                            </Text>
                        </View>

                        {/* Vertical Divider */}
                        <View style={[styles.verticalDivider, {
                            backgroundColor: dividerColor,
                            width: Math.round(displayWidth * 0.001),
                        }]} />

                        {/* Dad's Letter */}
                        <View style={[styles.letterColumn, {
                            marginLeft: Math.round(displayWidth * 0.015),
                        }]}>
                            <View style={[styles.letterHeaderBar, {
                                borderBottomWidth: Math.round(displayWidth * 0.002),
                                borderBottomColor: dividerColor,
                                paddingBottom: Math.round(displayHeight * 0.008),
                                marginBottom: Math.round(displayHeight * 0.012),
                            }]}>
                                <Text style={[styles.letterHeader, {
                                    fontSize: headerSize,
                                    color: colors.text,
                                }]}>
                                    From {fatherName || 'Dad'} 💙
                                </Text>
                            </View>
                            <Text style={[styles.letterBody, {
                                fontSize: bodySize,
                                color: colors.text,
                                lineHeight: bodySize * 1.55,
                            }]}>
                                {fatherLetter}
                            </Text>
                        </View>
                    </View>
                ) : motherLetter ? (
                    /* Only Mom's letter — full width */
                    <View style={[styles.letterColumn, { flex: 1 }]}>
                        <View style={[styles.letterHeaderBar, {
                            borderBottomWidth: Math.round(displayWidth * 0.002),
                            borderBottomColor: dividerColor,
                            paddingBottom: Math.round(displayHeight * 0.008),
                            marginBottom: Math.round(displayHeight * 0.012),
                        }]}>
                            <Text style={[styles.letterHeader, {
                                fontSize: headerSize,
                                color: colors.text,
                            }]}>
                                From {motherName || 'Mom'} 💕
                            </Text>
                        </View>
                        <Text style={[styles.letterBody, {
                            fontSize: bodySize,
                            color: colors.text,
                            lineHeight: bodySize * 1.55,
                        }]}>
                            {motherLetter}
                        </Text>
                    </View>
                ) : fatherLetter ? (
                    /* Only Dad's letter — full width */
                    <View style={[styles.letterColumn, { flex: 1 }]}>
                        <View style={[styles.letterHeaderBar, {
                            borderBottomWidth: Math.round(displayWidth * 0.002),
                            borderBottomColor: dividerColor,
                            paddingBottom: Math.round(displayHeight * 0.008),
                            marginBottom: Math.round(displayHeight * 0.012),
                        }]}>
                            <Text style={[styles.letterHeader, {
                                fontSize: headerSize,
                                color: colors.text,
                            }]}>
                                From {fatherName || 'Dad'} 💙
                            </Text>
                        </View>
                        <Text style={[styles.letterBody, {
                            fontSize: bodySize,
                            color: colors.text,
                            lineHeight: bodySize * 1.55,
                        }]}>
                            {fatherLetter}
                        </Text>
                    </View>
                ) : (
                    <View style={[styles.letterColumn, { flex: 1, justifyContent: 'center', alignItems: 'center' }]}>
                        <Text style={[styles.letterBody, {
                            fontSize: bodySize,
                            color: colors.text,
                            opacity: 0.5,
                            textAlign: 'center',
                        }]}>
                            No letters written yet.
                        </Text>
                    </View>
                )}

                {/* Signature & Date Section */}
                <View style={[styles.signatureSection, {
                    borderTopWidth: Math.round(displayWidth * 0.001),
                    borderTopColor: dividerColor,
                    paddingTop: Math.round(displayHeight * 0.015),
                    marginTop: Math.round(displayHeight * 0.015),
                }]}>
                    {jointLetter ? (
                        /* Joint — one signature block, centered */
                        <View style={styles.signatureBlockCenter}>
                            <View style={[styles.signatureLine, {
                                borderBottomColor: colors.text,
                                width: Math.round(displayWidth * 0.35),
                                marginBottom: Math.round(displayHeight * 0.006),
                            }]} />
                            <Text style={[styles.signatureLabel, { fontSize: footerSize, color: colors.text }]}>
                                Signature — {motherName || 'Mom'} & {fatherName || 'Dad'}
                            </Text>
                            <View style={{ marginTop: Math.round(displayHeight * 0.012) }}>
                                <View style={[styles.signatureLine, {
                                    borderBottomColor: colors.text,
                                    width: Math.round(displayWidth * 0.2),
                                    marginBottom: Math.round(displayHeight * 0.006),
                                }]} />
                                <Text style={[styles.signatureLabel, { fontSize: footerSize, color: colors.text }]}>
                                    Date
                                </Text>
                            </View>
                        </View>
                    ) : motherLetter && fatherLetter ? (
                        /* Both parents — two signature blocks side by side */
                        <View style={styles.signatureRow}>
                            <View style={styles.signatureBlockCenter}>
                                <View style={[styles.signatureLine, {
                                    borderBottomColor: colors.text,
                                    width: Math.round(displayWidth * 0.3),
                                    marginBottom: Math.round(displayHeight * 0.006),
                                }]} />
                                <Text style={[styles.signatureLabel, { fontSize: footerSize, color: colors.text }]}>
                                    Signature — {motherName || 'Mom'}
                                </Text>
                                <View style={{ marginTop: Math.round(displayHeight * 0.01) }}>
                                    <View style={[styles.signatureLine, {
                                        borderBottomColor: colors.text,
                                        width: Math.round(displayWidth * 0.18),
                                        marginBottom: Math.round(displayHeight * 0.006),
                                    }]} />
                                    <Text style={[styles.signatureLabel, { fontSize: footerSize, color: colors.text }]}>
                                        Date
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.signatureBlockCenter}>
                                <View style={[styles.signatureLine, {
                                    borderBottomColor: colors.text,
                                    width: Math.round(displayWidth * 0.3),
                                    marginBottom: Math.round(displayHeight * 0.006),
                                }]} />
                                <Text style={[styles.signatureLabel, { fontSize: footerSize, color: colors.text }]}>
                                    Signature — {fatherName || 'Dad'}
                                </Text>
                                <View style={{ marginTop: Math.round(displayHeight * 0.01) }}>
                                    <View style={[styles.signatureLine, {
                                        borderBottomColor: colors.text,
                                        width: Math.round(displayWidth * 0.18),
                                        marginBottom: Math.round(displayHeight * 0.006),
                                    }]} />
                                    <Text style={[styles.signatureLabel, { fontSize: footerSize, color: colors.text }]}>
                                        Date
                                    </Text>
                                </View>
                            </View>
                        </View>
                    ) : (
                        /* Single parent — one signature block */
                        <View style={styles.signatureBlockCenter}>
                            <View style={[styles.signatureLine, {
                                borderBottomColor: colors.text,
                                width: Math.round(displayWidth * 0.35),
                                marginBottom: Math.round(displayHeight * 0.006),
                            }]} />
                            <Text style={[styles.signatureLabel, { fontSize: footerSize, color: colors.text }]}>
                                Signature — {motherLetter ? (motherName || 'Mom') : (fatherName || 'Dad')}
                            </Text>
                            <View style={{ marginTop: Math.round(displayHeight * 0.012) }}>
                                <View style={[styles.signatureLine, {
                                    borderBottomColor: colors.text,
                                    width: Math.round(displayWidth * 0.2),
                                    marginBottom: Math.round(displayHeight * 0.006),
                                }]} />
                                <Text style={[styles.signatureLabel, { fontSize: footerSize, color: colors.text }]}>
                                    Date
                                </Text>
                            </View>
                        </View>
                    )}
                </View>

                {/* Footer */}
                <View style={[styles.footer, {
                    borderTopWidth: Math.round(displayWidth * 0.001),
                    borderTopColor: dividerColor,
                    paddingTop: Math.round(displayHeight * 0.008),
                    marginTop: Math.round(displayHeight * 0.012),
                }]}>
                    <Text style={[styles.footerText, {
                        fontSize: footerSize,
                        color: colors.text,
                        opacity: 0.5,
                    }]}>
                        With love, on the day you entered our world — Population +1™
                    </Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        overflow: 'hidden',
    },
    inner: {
        flex: 1,
        justifyContent: 'flex-start',
    },
    title: {
        fontWeight: '900',
        textAlign: 'center',
        letterSpacing: 1,
    },
    subtitle: {
        fontWeight: '600',
        textAlign: 'center',
        fontStyle: 'italic',
    },
    columnsRow: {
        flex: 1,
        flexDirection: 'row',
    },
    letterColumn: {
        flex: 1,
    },
    letterHeaderBar: {},
    letterHeader: {
        fontWeight: '800',
        textAlign: 'center',
    },
    letterBody: {
        fontWeight: '400',
    },
    verticalDivider: {
        alignSelf: 'stretch',
    },
    footer: {
        alignItems: 'center',
    },
    footerText: {
        fontWeight: '600',
        fontStyle: 'italic',
    },
    signatureSection: {
    },
    signatureRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    signatureBlockCenter: {
        alignItems: 'center',
    },
    signatureLine: {
        borderBottomWidth: 1,
        alignSelf: 'center',
    },
    signatureLabel: {
        fontWeight: '500',
        textAlign: 'center',
        opacity: 0.6,
    },
});
