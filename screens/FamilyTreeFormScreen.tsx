import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import type { RootStackParamList } from '../src/types';

type Props = NativeStackScreenProps<RootStackParamList, 'FamilyTreeForm'>;

// ─── Types ────────────────────────────────────────────────────
interface FamilyMember {
    id: string;
    firstName: string;
    middleName: string;
    lastName: string;
    maidenName: string;
    birthDate: string;    // free text: "March 5, 1952" or "1952" or ""
    birthPlace: string;
    deathDate: string;
    deathPlace: string;
    isDeceased: boolean;
    relationship: string; // e.g. "Mother", "Paternal Grandfather"
    notes: string;
    generation: number;   // 0 = root, 1 = parents, 2 = grandparents, 3 = great-grandparents
    side: 'root' | 'maternal' | 'paternal';
    parentId: string | null;
}

const createMember = (overrides: Partial<FamilyMember>): FamilyMember => ({
    id: `member_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    firstName: '',
    middleName: '',
    lastName: '',
    maidenName: '',
    birthDate: '',
    birthPlace: '',
    deathDate: '',
    deathPlace: '',
    isDeceased: false,
    relationship: '',
    notes: '',
    generation: 0,
    side: 'root',
    parentId: null,
    ...overrides,
});

// ─── Generation Templates ─────────────────────────────────────
const GENERATION_LABELS: Record<number, string> = {
    0: '👶 The Root Person',
    1: '👨‍👩‍👧 Parents',
    2: '👴👵 Grandparents',
    3: '🏛️ Great-Grandparents',
};

const RELATIONSHIP_OPTIONS: Record<number, { label: string; side: 'root' | 'maternal' | 'paternal'; parentLabel?: string }[]> = {
    0: [{ label: 'Root Person (Center of Tree)', side: 'root' }],
    1: [
        { label: 'Mother', side: 'maternal' },
        { label: 'Father', side: 'paternal' },
    ],
    2: [
        { label: 'Maternal Grandmother', side: 'maternal' },
        { label: 'Maternal Grandfather', side: 'maternal' },
        { label: 'Paternal Grandmother', side: 'paternal' },
        { label: 'Paternal Grandfather', side: 'paternal' },
    ],
    3: [
        { label: 'Maternal Great-Grandmother (Mom\'s Mom\'s side)', side: 'maternal' },
        { label: 'Maternal Great-Grandfather (Mom\'s Mom\'s side)', side: 'maternal' },
        { label: 'Maternal Great-Grandmother (Mom\'s Dad\'s side)', side: 'maternal' },
        { label: 'Maternal Great-Grandfather (Mom\'s Dad\'s side)', side: 'maternal' },
        { label: 'Paternal Great-Grandmother (Dad\'s Mom\'s side)', side: 'paternal' },
        { label: 'Paternal Great-Grandfather (Dad\'s Mom\'s side)', side: 'paternal' },
        { label: 'Paternal Great-Grandmother (Dad\'s Dad\'s side)', side: 'paternal' },
        { label: 'Paternal Great-Grandfather (Dad\'s Dad\'s side)', side: 'paternal' },
    ],
};

// ─── Component ────────────────────────────────────────────────
export default function FamilyTreeFormScreen({ navigation }: Props) {
    const [currentGen, setCurrentGen] = useState(0);
    const [members, setMembers] = useState<FamilyMember[]>([
        createMember({ relationship: 'Root Person', generation: 0, side: 'root' }),
    ]);
    const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
    const [showSiblingModal, setShowSiblingModal] = useState(false);
    const [siblingGen, setSiblingGen] = useState(0);
    const [siblingSide, setSiblingSide] = useState<'root' | 'maternal' | 'paternal'>('root');

    // ── Helpers ───────────────────────────────
    const membersForGen = (gen: number) => members.filter(m => m.generation === gen);

    const updateMember = (id: string, field: keyof FamilyMember, value: string | boolean) => {
        setMembers(prev => prev.map(m => m.id === id ? { ...m, [field]: value } : m));
    };

    const removeMember = (id: string) => {
        setMembers(prev => prev.filter(m => m.id !== id));
    };

    const addSibling = (gen: number, side: 'root' | 'maternal' | 'paternal', relationship: string) => {
        const newMember = createMember({
            generation: gen,
            side,
            relationship,
        });
        setMembers(prev => [...prev, newMember]);
    };

    // Ensure generation members exist
    const ensureGeneration = (gen: number) => {
        const existing = membersForGen(gen);
        const templates = RELATIONSHIP_OPTIONS[gen] || [];
        const missing = templates.filter(t => !existing.some(e => e.relationship === t.label));
        if (missing.length > 0) {
            const newMembers = missing.map(t => createMember({
                generation: gen,
                side: t.side,
                relationship: t.label,
            }));
            setMembers(prev => [...prev, ...newMembers]);
        }
    };

    const goToGeneration = (gen: number) => {
        if (gen <= 3) {
            ensureGeneration(gen);
        }
        setCurrentGen(gen);
    };

    // ── Navigation between generations ───────
    const canGoNext = currentGen < 4; // 0-3 = generations, 4 = siblings/extras, 5 = review
    const canGoPrev = currentGen > 0;

    const handleNext = () => {
        if (currentGen < 3) {
            goToGeneration(currentGen + 1);
        } else if (currentGen === 3) {
            setCurrentGen(4); // extras
        } else if (currentGen === 4) {
            setCurrentGen(5); // review
        }
    };

    const handlePrev = () => {
        if (currentGen > 0) {
            setCurrentGen(currentGen - 1);
        }
    };

    const handleSubmit = () => {
        const filledMembers = members.filter(m => m.firstName.trim() !== '');
        if (filledMembers.length === 0) {
            Alert.alert('No Data', 'Please fill in at least the root person\'s name to generate a family tree.');
            return;
        }
        Alert.alert(
            '🌳 Family Tree Saved!',
            `Your family tree has ${filledMembers.length} member${filledMembers.length > 1 ? 's' : ''} across ${Math.max(...filledMembers.map(m => m.generation)) + 1} generation${Math.max(...filledMembers.map(m => m.generation)) > 0 ? 's' : ''}. The tree preview will be available soon!`,
            [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
    };

    // ── Render member form ────────────────────
    const renderMemberForm = (member: FamilyMember, index: number) => {
        const isExpanded = editingMember?.id === member.id;

        return (
            <View key={member.id} style={styles.memberCard}>
                <TouchableOpacity
                    style={styles.memberHeader}
                    onPress={() => setEditingMember(isExpanded ? null : member)}
                    activeOpacity={0.7}
                >
                    <View style={styles.memberHeaderLeft}>
                        <Text style={styles.memberRelationship}>{member.relationship}</Text>
                        {member.firstName ? (
                            <Text style={styles.memberName}>
                                {member.firstName} {member.middleName} {member.lastName}
                                {member.maidenName ? ` (née ${member.maidenName})` : ''}
                            </Text>
                        ) : (
                            <Text style={styles.memberNamePlaceholder}>Tap to fill in details</Text>
                        )}
                    </View>
                    <Text style={styles.expandArrow}>{isExpanded ? '▲' : '▼'}</Text>
                </TouchableOpacity>

                {isExpanded && (
                    <View style={styles.memberFields}>
                        <View style={styles.fieldRow}>
                            <View style={styles.fieldHalf}>
                                <Text style={styles.fieldLabel}>First Name *</Text>
                                <TextInput
                                    style={styles.input}
                                    value={member.firstName}
                                    onChangeText={(v) => updateMember(member.id, 'firstName', v)}
                                    placeholder="First name"
                                    placeholderTextColor="#999"
                                />
                            </View>
                            <View style={styles.fieldHalf}>
                                <Text style={styles.fieldLabel}>Middle Name</Text>
                                <TextInput
                                    style={styles.input}
                                    value={member.middleName}
                                    onChangeText={(v) => updateMember(member.id, 'middleName', v)}
                                    placeholder="Middle name"
                                    placeholderTextColor="#999"
                                />
                            </View>
                        </View>

                        <View style={styles.fieldRow}>
                            <View style={styles.fieldHalf}>
                                <Text style={styles.fieldLabel}>Last Name *</Text>
                                <TextInput
                                    style={styles.input}
                                    value={member.lastName}
                                    onChangeText={(v) => updateMember(member.id, 'lastName', v)}
                                    placeholder="Last name"
                                    placeholderTextColor="#999"
                                />
                            </View>
                            <View style={styles.fieldHalf}>
                                <Text style={styles.fieldLabel}>Maiden Name</Text>
                                <TextInput
                                    style={styles.input}
                                    value={member.maidenName}
                                    onChangeText={(v) => updateMember(member.id, 'maidenName', v)}
                                    placeholder="If applicable"
                                    placeholderTextColor="#999"
                                />
                            </View>
                        </View>

                        <View style={styles.fieldRow}>
                            <View style={styles.fieldHalf}>
                                <Text style={styles.fieldLabel}>Birth Date</Text>
                                <TextInput
                                    style={styles.input}
                                    value={member.birthDate}
                                    onChangeText={(v) => updateMember(member.id, 'birthDate', v)}
                                    placeholder="e.g. March 5, 1952"
                                    placeholderTextColor="#999"
                                />
                            </View>
                            <View style={styles.fieldHalf}>
                                <Text style={styles.fieldLabel}>Birth Place</Text>
                                <TextInput
                                    style={styles.input}
                                    value={member.birthPlace}
                                    onChangeText={(v) => updateMember(member.id, 'birthPlace', v)}
                                    placeholder="City, State"
                                    placeholderTextColor="#999"
                                />
                            </View>
                        </View>

                        {/* Deceased toggle */}
                        <TouchableOpacity
                            style={styles.deceasedToggle}
                            onPress={() => updateMember(member.id, 'isDeceased', !member.isDeceased)}
                        >
                            <View style={[styles.checkbox, member.isDeceased && styles.checkboxChecked]}>
                                {member.isDeceased && <Text style={styles.checkmark}>✓</Text>}
                            </View>
                            <Text style={styles.deceasedLabel}>Deceased</Text>
                        </TouchableOpacity>

                        {member.isDeceased && (
                            <View style={styles.fieldRow}>
                                <View style={styles.fieldHalf}>
                                    <Text style={styles.fieldLabel}>Date of Passing</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={member.deathDate}
                                        onChangeText={(v) => updateMember(member.id, 'deathDate', v)}
                                        placeholder="e.g. June 2020"
                                        placeholderTextColor="#999"
                                    />
                                </View>
                                <View style={styles.fieldHalf}>
                                    <Text style={styles.fieldLabel}>Place of Passing</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={member.deathPlace}
                                        onChangeText={(v) => updateMember(member.id, 'deathPlace', v)}
                                        placeholder="City, State"
                                        placeholderTextColor="#999"
                                    />
                                </View>
                            </View>
                        )}

                        {/* Notes */}
                        <Text style={styles.fieldLabel}>Notes (optional)</Text>
                        <TextInput
                            style={[styles.input, styles.notesInput]}
                            value={member.notes}
                            onChangeText={(v) => updateMember(member.id, 'notes', v)}
                            placeholder="Nicknames, occupations, fun facts..."
                            placeholderTextColor="#999"
                            multiline
                        />

                        {/* Remove (only for extras / siblings) */}
                        {member.generation >= 1 && !RELATIONSHIP_OPTIONS[member.generation]?.some(t => t.label === member.relationship) && (
                            <TouchableOpacity
                                style={styles.removeBtn}
                                onPress={() => removeMember(member.id)}
                            >
                                <Text style={styles.removeBtnText}>🗑️ Remove This Person</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            </View>
        );
    };

    // ── Render generation page ────────────────
    const renderGenerationPage = () => {
        if (currentGen <= 3) {
            const genMembers = membersForGen(currentGen);
            const genLabel = GENERATION_LABELS[currentGen] || `Generation ${currentGen}`;

            return (
                <View>
                    <Text style={styles.genTitle}>{genLabel}</Text>
                    <Text style={styles.genSubtitle}>
                        {currentGen === 0 && 'This is the person at the center of the family tree.'}
                        {currentGen === 1 && 'Add the parents. Fill in what you know — you can always leave fields blank.'}
                        {currentGen === 2 && 'Going back one more generation. Grandparents add depth and richness to the tree.'}
                        {currentGen === 3 && 'Great-grandparents! Most people know at least a few names here. Every detail counts.'}
                    </Text>

                    {genMembers.map((m, i) => renderMemberForm(m, i))}

                    {/* Add sibling / extra person for this generation */}
                    {currentGen >= 1 && (
                        <TouchableOpacity
                            style={styles.addPersonBtn}
                            onPress={() => {
                                setSiblingGen(currentGen);
                                setShowSiblingModal(true);
                            }}
                        >
                            <Text style={styles.addPersonText}>+ Add Another Person to This Generation</Text>
                        </TouchableOpacity>
                    )}
                </View>
            );
        }

        if (currentGen === 4) {
            // Siblings & extras page
            const siblings = members.filter(m => m.relationship.includes('Sibling') || m.relationship.includes('Aunt') || m.relationship.includes('Uncle'));
            return (
                <View>
                    <Text style={styles.genTitle}>👨‍👩‍👧‍👦 Siblings, Aunts & Uncles</Text>
                    <Text style={styles.genSubtitle}>
                        Add siblings of the root person, or aunts and uncles. These are optional but add wonderful detail to the tree.
                    </Text>

                    {siblings.map((m, i) => renderMemberForm(m, i))}

                    <View style={styles.siblingBtns}>
                        <TouchableOpacity
                            style={styles.addPersonBtn}
                            onPress={() => addSibling(0, 'root', `Sibling ${siblings.filter(s => s.relationship.includes('Sibling')).length + 1}`)}
                        >
                            <Text style={styles.addPersonText}>+ Add a Sibling</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.addPersonBtn}
                            onPress={() => addSibling(1, 'maternal', `Maternal Aunt/Uncle ${siblings.filter(s => s.relationship.includes('Maternal')).length + 1}`)}
                        >
                            <Text style={styles.addPersonText}>+ Add Maternal Aunt/Uncle</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.addPersonBtn}
                            onPress={() => addSibling(1, 'paternal', `Paternal Aunt/Uncle ${siblings.filter(s => s.relationship.includes('Paternal')).length + 1}`)}
                        >
                            <Text style={styles.addPersonText}>+ Add Paternal Aunt/Uncle</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            );
        }

        // currentGen === 5 — Review
        const filledMembers = members.filter(m => m.firstName.trim() !== '');
        const maxGen = filledMembers.length > 0 ? Math.max(...filledMembers.map(m => m.generation)) : 0;

        return (
            <View>
                <Text style={styles.genTitle}>📋 Review Your Family Tree</Text>
                <Text style={styles.genSubtitle}>
                    Here's a summary of everyone you've added. Tap any person to edit their details.
                </Text>

                <View style={styles.summaryBox}>
                    <Text style={styles.summaryText}>
                        🌳 <Text style={styles.bold}>{filledMembers.length}</Text> family member{filledMembers.length !== 1 ? 's' : ''}
                    </Text>
                    <Text style={styles.summaryText}>
                        📊 <Text style={styles.bold}>{maxGen + 1}</Text> generation{maxGen > 0 ? 's' : ''}
                    </Text>
                    <Text style={styles.summaryText}>
                        🕊️ <Text style={styles.bold}>{filledMembers.filter(m => m.isDeceased).length}</Text> deceased
                    </Text>
                </View>

                {[0, 1, 2, 3].map(gen => {
                    const genMembers = filledMembers.filter(m => m.generation === gen);
                    if (genMembers.length === 0) return null;
                    return (
                        <View key={gen} style={styles.reviewGenSection}>
                            <Text style={styles.reviewGenTitle}>{GENERATION_LABELS[gen]}</Text>
                            {genMembers.map(m => (
                                <TouchableOpacity
                                    key={m.id}
                                    style={styles.reviewPerson}
                                    onPress={() => {
                                        setCurrentGen(gen);
                                        setEditingMember(m);
                                    }}
                                >
                                    <Text style={styles.reviewPersonName}>
                                        {m.firstName} {m.middleName} {m.lastName}
                                        {m.maidenName ? ` (née ${m.maidenName})` : ''}
                                        {m.isDeceased ? ' 🕊️' : ''}
                                    </Text>
                                    <Text style={styles.reviewPersonRel}>{m.relationship}</Text>
                                    {m.birthDate ? <Text style={styles.reviewPersonDetail}>Born: {m.birthDate}</Text> : null}
                                    {m.birthPlace ? <Text style={styles.reviewPersonDetail}>📍 {m.birthPlace}</Text> : null}
                                </TouchableOpacity>
                            ))}
                        </View>
                    );
                })}

                {/* Extras (siblings, etc.) */}
                {(() => {
                    const extras = filledMembers.filter(m =>
                        m.relationship.includes('Sibling') || m.relationship.includes('Aunt') || m.relationship.includes('Uncle')
                    );
                    if (extras.length === 0) return null;
                    return (
                        <View style={styles.reviewGenSection}>
                            <Text style={styles.reviewGenTitle}>👨‍👩‍👧‍👦 Siblings, Aunts & Uncles</Text>
                            {extras.map(m => (
                                <TouchableOpacity
                                    key={m.id}
                                    style={styles.reviewPerson}
                                    onPress={() => {
                                        setCurrentGen(4);
                                        setEditingMember(m);
                                    }}
                                >
                                    <Text style={styles.reviewPersonName}>
                                        {m.firstName} {m.lastName}
                                        {m.isDeceased ? ' 🕊️' : ''}
                                    </Text>
                                    <Text style={styles.reviewPersonRel}>{m.relationship}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    );
                })()}
            </View>
        );
    };

    // ── Progress bar ──────────────────────────
    const totalSteps = 6; // Gen0, Gen1, Gen2, Gen3, Extras, Review
    const progress = (currentGen + 1) / totalSteps;

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            {/* Progress Bar */}
            <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
            </View>
            <View style={styles.progressLabels}>
                {['Root', 'Parents', 'Grand', 'Great', 'Extras', 'Review'].map((label, i) => (
                    <TouchableOpacity key={label} onPress={() => {
                        if (i <= 3) goToGeneration(i);
                        else setCurrentGen(i);
                    }}>
                        <Text style={[
                            styles.progressLabel,
                            currentGen === i && styles.progressLabelActive,
                        ]}>{label}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {renderGenerationPage()}
            </ScrollView>

            {/* Bottom Navigation */}
            <View style={styles.bottomNav}>
                {currentGen > 0 ? (
                    <TouchableOpacity style={styles.navBtnSecondary} onPress={handlePrev}>
                        <Text style={styles.navBtnSecondaryText}>← Back</Text>
                    </TouchableOpacity>
                ) : <View style={{ flex: 1 }} />}

                {currentGen < 5 ? (
                    <TouchableOpacity style={styles.navBtnPrimary} onPress={handleNext}>
                        <Text style={styles.navBtnPrimaryText}>
                            {currentGen === 3 ? 'Add Extras →' : currentGen === 4 ? 'Review →' : 'Next →'}
                        </Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity style={styles.navBtnSubmit} onPress={handleSubmit}>
                        <Text style={styles.navBtnPrimaryText}>🌳 Generate Family Tree</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Add Person Modal */}
            <Modal visible={showSiblingModal} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Add Person</Text>
                        <Text style={styles.modalSubtitle}>What is their relationship?</Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="e.g. Step-Mother, Half-Sister"
                            placeholderTextColor="#999"
                            onSubmitEditing={(e) => {
                                const val = e.nativeEvent.text.trim();
                                if (val) {
                                    addSibling(siblingGen, siblingSide, val);
                                    setShowSiblingModal(false);
                                }
                            }}
                            autoFocus
                        />
                        <View style={styles.modalQuickBtns}>
                            {['Step-Mother', 'Step-Father', 'Half-Sibling', 'Adopted'].map(label => (
                                <TouchableOpacity
                                    key={label}
                                    style={styles.quickBtn}
                                    onPress={() => {
                                        addSibling(siblingGen, siblingSide, label);
                                        setShowSiblingModal(false);
                                    }}
                                >
                                    <Text style={styles.quickBtnText}>{label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <TouchableOpacity style={styles.modalClose} onPress={() => setShowSiblingModal(false)}>
                            <Text style={styles.modalCloseText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </KeyboardAvoidingView>
    );
}

// ─── Styles ───────────────────────────────────────────────────
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000080',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingBottom: 20,
    },
    // Progress
    progressBarBg: {
        height: 4,
        backgroundColor: 'rgba(255,255,255,0.15)',
    },
    progressBarFill: {
        height: 4,
        backgroundColor: '#FFD700',
    },
    progressLabels: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    progressLabel: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.5)',
        fontWeight: '600',
    },
    progressLabelActive: {
        color: '#FFD700',
        fontWeight: '800',
    },
    // Generation header
    genTitle: {
        fontSize: 26,
        fontWeight: '900',
        color: '#fff',
        textAlign: 'center',
        marginTop: 24,
        marginBottom: 8,
    },
    genSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.75)',
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 20,
        paddingHorizontal: 10,
    },
    // Member card
    memberCard: {
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.12)',
        overflow: 'hidden',
    },
    memberHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 14,
    },
    memberHeaderLeft: {
        flex: 1,
    },
    memberRelationship: {
        fontSize: 13,
        fontWeight: '800',
        color: '#FFD700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 2,
    },
    memberName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    memberNamePlaceholder: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.4)',
        fontStyle: 'italic',
    },
    expandArrow: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.5)',
        marginLeft: 8,
    },
    memberFields: {
        padding: 14,
        paddingTop: 0,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.08)',
    },
    fieldRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 4,
    },
    fieldHalf: {
        flex: 1,
    },
    fieldLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: 'rgba(255,255,255,0.7)',
        marginBottom: 4,
        marginTop: 8,
    },
    input: {
        backgroundColor: 'rgba(255,255,255,0.12)',
        borderRadius: 8,
        padding: 10,
        fontSize: 14,
        color: '#fff',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
    },
    notesInput: {
        height: 60,
        textAlignVertical: 'top',
    },
    deceasedToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
        marginBottom: 4,
    },
    checkbox: {
        width: 22,
        height: 22,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.4)',
        marginRight: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxChecked: {
        backgroundColor: '#FFD700',
        borderColor: '#FFD700',
    },
    checkmark: {
        color: '#000080',
        fontWeight: '900',
        fontSize: 14,
    },
    deceasedLabel: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        fontWeight: '600',
    },
    removeBtn: {
        marginTop: 12,
        alignSelf: 'flex-end',
    },
    removeBtnText: {
        fontSize: 13,
        color: '#ff6b6b',
        fontWeight: '600',
    },
    // Add person
    addPersonBtn: {
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.25)',
        borderStyle: 'dashed',
        borderRadius: 12,
        padding: 14,
        alignItems: 'center',
        marginBottom: 10,
    },
    addPersonText: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.7)',
        fontWeight: '700',
    },
    siblingBtns: {
        gap: 8,
    },
    // Bottom nav
    bottomNav: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: 'rgba(0,0,0,0.3)',
        gap: 12,
    },
    navBtnSecondary: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    navBtnSecondaryText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },
    navBtnPrimary: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        backgroundColor: '#FFD700',
    },
    navBtnPrimaryText: {
        fontSize: 16,
        fontWeight: '800',
        color: '#000080',
    },
    navBtnSubmit: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        backgroundColor: '#4CAF50',
    },
    // Summary
    summaryBox: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    summaryText: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.9)',
    },
    bold: {
        fontWeight: '900',
        color: '#FFD700',
    },
    // Review
    reviewGenSection: {
        marginBottom: 20,
    },
    reviewGenTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#FFD700',
        marginBottom: 8,
    },
    reviewPerson: {
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 10,
        padding: 12,
        marginBottom: 6,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    reviewPersonName: {
        fontSize: 15,
        fontWeight: '700',
        color: '#fff',
    },
    reviewPersonRel: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.6)',
        marginTop: 2,
    },
    reviewPersonDetail: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.5)',
        marginTop: 2,
    },
    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    modalContent: {
        backgroundColor: '#1a1a5e',
        borderRadius: 20,
        padding: 24,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '900',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 4,
    },
    modalSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.7)',
        textAlign: 'center',
        marginBottom: 16,
    },
    modalInput: {
        backgroundColor: 'rgba(255,255,255,0.12)',
        borderRadius: 10,
        padding: 12,
        fontSize: 15,
        color: '#fff',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        marginBottom: 16,
    },
    modalQuickBtns: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 16,
    },
    quickBtn: {
        backgroundColor: 'rgba(255,215,0,0.15)',
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderWidth: 1,
        borderColor: 'rgba(255,215,0,0.3)',
    },
    quickBtnText: {
        color: '#FFD700',
        fontSize: 13,
        fontWeight: '700',
    },
    modalClose: {
        alignItems: 'center',
        paddingVertical: 10,
    },
    modalCloseText: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 15,
    },
});
