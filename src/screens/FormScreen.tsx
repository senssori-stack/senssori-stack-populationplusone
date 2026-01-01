import React, { useState, useEffect } from "react";
import {
  View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity,
  useWindowDimensions, Image, Alert,
} from "react-native";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";

import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList, ThemeName } from '../types';
import { COLOR_SCHEMES } from "../data/utils/colors";
import SignFrontPortrait from '../../components/SignFrontPortrait';
import SignFrontLandscape from '../../components/SignFrontLandscape';
import TimeCapsulePortrait from '../../components/TimeCapsulePortrait';
import TimeCapsuleLandscape from '../../components/TimeCapsuleLandscape';
import { getAllSnapshotValues } from '../data/utils/snapshot';
import { getSnapshotWithHistorical } from '../data/utils/historical-snapshot';
import { getPopulationForCity } from '../data/utils/populations';

type Props = NativeStackScreenProps<RootStackParamList, "Form">;

export default function FormScreen({ navigation, route }: Props) {
  const [theme, setTheme] = useState<ThemeName>("green");
  const [mode, setMode] = useState<'baby' | 'birthday'>('baby'); // NEW: Mode toggle
  
  // TEST DATA - Prefilled for easy testing
  // 🧪 For testing long names, uncomment these lines:
  // const [babyFirst, setBabyFirst] = useState("Bartholomew Christopher");
  // const [babyLast, setBabyLast] = useState("Montgomery-Williams-Henderson");
  // const [hometown, setHometown] = useState("San Francisco International Airport, California");
  
  const [babyFirst, setBabyFirst] = useState("Emma");
  const [babyMiddle, setBabyMiddle] = useState("Grace");
  const [babyLast, setBabyLast] = useState("Johnson");
  const [babies, setBabies] = useState<Array<{ first: string; middle?: string; last?: string; photoUri?: string | null }>>([
    { 
      first: 'Emma', 
      middle: 'Grace', 
      last: 'Johnson',
      photoUri: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face' // Test photo for Twin 1
    },
    { 
      first: 'Ethan', 
      middle: 'James', 
      last: 'Johnson',
      photoUri: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&h=400&fit=crop&crop=face' // Test photo for Twin 2
    },
  ]);
  const [babyCount, setBabyCount] = useState<number>(2); // Updated to 2 for twins
  const [motherName, setMotherName] = useState("Sarah Johnson");
  const [fatherName, setFatherName] = useState("Michael Johnson");
  const [email, setEmail] = useState("sarah.johnson@email.com"); // For marketing
  const [hometown, setHometown] = useState("Springfield, MO");
  const [dobDate, setDobDate] = useState<Date>(new Date()); // Today's date
  const [weightLb, setWeightLb] = useState("7");
  const [weightOz, setWeightOz] = useState("8");
  const [lengthIn, setLengthIn] = useState("20");
  const [photoUri, setPhotoUri] = useState<string | null>('https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face');
  const [frontOrientation, setFrontOrientation] = useState<'landscape' | 'portrait'>('landscape');
  const [timeCapsuleOrientation, setTimeCapsuleOrientation] = useState<'landscape' | 'portrait'>('landscape');
  const [touched, setTouched] = useState({ babyFirst: false, hometown: false });
  const [snapshot, setSnapshot] = useState<Record<string, string>>({});
  const [population, setPopulation] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const { width: screenWidth } = useWindowDimensions();

  const canBuild = (babies.some(b => (b.first||'').trim().length > 0) || babyFirst.trim().length > 0) && hometown.trim().length > 0;

  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (!hometown.trim() || hometown.length < 3) return;
      try {
        setLoading(true);
        console.log('🏙️  Fetching data for hometown:', hometown, 'birth year:', dobDate.getFullYear());
        console.log('📱 Device info - User Agent:', navigator.userAgent);
        console.log('🌐 Network state:', navigator.onLine ? 'ONLINE' : 'OFFLINE');
        
        // Fetch snapshot data from Google Sheets with timeout
        console.log('📊 Starting snapshot fetch...');
        const snapshotPromise = getAllSnapshotValues();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Network timeout after 15 seconds')), 15000)
        );
        
        const snapshotData = await Promise.race([snapshotPromise, timeoutPromise]) as Record<string, string>;
        console.log('✅ Snapshot data fetched:', Object.keys(snapshotData).length, 'entries');
        console.log('📊 Sample data:', Object.keys(snapshotData).slice(0, 3));
        setSnapshot(snapshotData);
        
        // Fetch population for the entered hometown with historical context
        console.log('👥 Starting population fetch for:', hometown, 'in year:', dobDate.getFullYear());
        const { getPopulationWithHistoricalContext } = await import('../data/utils/historical-city-populations');
        const cityPopulation = await getPopulationWithHistoricalContext(hometown, dobDate.getFullYear());
        console.log('✅ Population result:', cityPopulation);
        setPopulation(cityPopulation);
      } catch (error) {
        console.error('❌ MOBILE NETWORK ERROR:', error);
        const err = error as Error;
        console.error('Error type:', err.name || 'Unknown');
        console.error('Error message:', err.message || 'Unknown error');
        console.error('Network online status:', navigator.onLine);
        
        // Provide fallback data for offline/error scenarios
        console.log('🔄 Using fallback data...');
        setSnapshot({
          'GALLON OF GASOLINE': '$3.07',
          'US POPULATION': '342,651,000',
          'PRESIDENT': 'Historical data temporarily unavailable'
        });
        setPopulation(null);
        
        // Show user-friendly error if needed
        Alert.alert(
          'Network Issue',
          'Having trouble loading latest data. Using cached information. Please check your internet connection.',
          [{ text: 'OK' }]
        );
      } finally {
        setLoading(false);
      }
    }, 1000);
    return () => clearTimeout(timeoutId);
  }, [hometown, dobDate]); // Include dobDate dependency for historical population

  function openDate() {
    DateTimePickerAndroid.open({
      value: dobDate,
      onChange: (_e, d) => { if (d) setDobDate(d); },
      mode: "date",
      is24Hour: true,
    });
  }

  async function pickPhotoForBaby(index?: number) {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      const granted = (perm as any).status === 'granted' || (perm as any).granted === true;
      if (!granted) {
        alert('Permission required to pick a photo. Please enable Photos/Media access in Settings.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true, quality: 1,
      });
      const cancelled = (result as any).canceled === true || (result as any).cancelled === true;
      const uri = (result as any).assets?.[0]?.uri ?? (result as any).uri ?? null;
      if (cancelled) return;
      if (!uri) {
        alert('Failed to pick a photo. Please try again.');
        return;
      }
      if (typeof index === 'number') {
        setBabies(bs => {
          const copy = [...bs];
          copy[index] = { ...copy[index], photoUri: uri };
          return copy;
        });
      } else {
        setPhotoUri(uri);
        setBabies(bs => {
          const copy = [...bs];
          if (copy.length > 0) copy[copy.length - 1].photoUri = uri;
          return copy;
        });
      }
    } catch (e) {
      alert('Unable to pick a photo — an unexpected error occurred.');
    }
  }

  function removePhotoForBaby(index: number) {
    setBabies(bs => {
      const copy = [...bs];
      copy[index] = { ...copy[index], photoUri: null };
      return copy;
    });
  }

  useEffect(() => {
    setBabies(bs => {
      const copy = [...bs];
      while (copy.length < babyCount) copy.push({ first: '' });
      while (copy.length > babyCount) copy.pop();
      return copy;
    });
  }, [babyCount]);

  async function onBuild() {
    const hasBabyNames = babies.some(b => (b.first || '').trim().length > 0) || babyFirst.trim().length > 0;
    if (!hasBabyNames || !hometown.trim()) {
      setTouched(t => ({ ...t, babyFirst: true, hometown: true }));
      alert("Please complete the required fields: Baby first name and Hometown.");
      return;
    }
    let finalPopulation = population;
    if (!finalPopulation) {
      try {
        setLoading(true);
        finalPopulation = await getPopulationForCity(hometown.trim());
        setPopulation(finalPopulation);
        if (!finalPopulation) finalPopulation = 100000;
      } catch (error) {
        finalPopulation = 100000;
      } finally {
        setLoading(false);
      }
    }
    const meaningfulBabies = babies.filter(b => (b.first || '').trim().length > 0);
    const payload: any = {
      theme,
      motherName: motherName.trim(),
      fatherName: fatherName.trim(),
      email: email.trim(), // Store for marketing
      hometown: hometown.trim(),
      dobISO: `${dobDate.getFullYear()}-${String(dobDate.getMonth() + 1).padStart(2, '0')}-${String(dobDate.getDate()).padStart(2, '0')}`,
      // Only include weight/length for single babies
      weightLb: babyCount === 1 ? weightLb.trim() : '',
      weightOz: babyCount === 1 ? weightOz.trim() : '',
      lengthIn: babyCount === 1 ? lengthIn.trim() : '',
    };
    if (meaningfulBabies.length > 0) {
      payload.babies = meaningfulBabies.map(b => ({
        first: (b.first||'').trim(),
        middle: (b.middle||'').trim(),
        last: (b.last||'').trim(),
        photoUri: b.photoUri ?? null
      }));
    } else {
      payload.babyFirst = babyFirst.trim();
      payload.babyMiddle = babyMiddle.trim();
      payload.babyLast = babyLast.trim();
      payload.photoUri = photoUri;
    }
    payload.frontOrientation = frontOrientation;
    payload.timeCapsuleOrientation = timeCapsuleOrientation;
    payload.snapshot = snapshot;
    payload.population = finalPopulation;
    navigation.navigate('Preview', payload);
  }

  const C = COLOR_SCHEMES[theme as keyof typeof COLOR_SCHEMES];

  return (
    <ScrollView style={[styles.page, { backgroundColor: C.bg }]} contentContainerStyle={styles.container}>
      
      {/* MODE TOGGLE - Birthday Time Capsule Feature */}
      <Text style={[styles.h1, { fontSize: 20, marginBottom: 8 }]}>Create a Time Capsule</Text>
      <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
        <TouchableOpacity 
          onPress={() => setMode('baby')} 
          style={[styles.themeBtn, { paddingVertical: 12, borderWidth: 2, borderColor: mode === 'baby' ? '#fff' : '#666' }]}
        >
          <Text style={[styles.themeText, { color: '#fff' }]}>👶 New Baby</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => setMode('birthday')} 
          style={[styles.themeBtn, { paddingVertical: 12, borderWidth: 2, borderColor: mode === 'birthday' ? '#fff' : '#666' }]}
        >
          <Text style={[styles.themeText, { color: '#fff' }]}>🎂 Birthday Gift</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.h1}>{mode === 'baby' ? 'Baby First Name' : 'Person\'s First Name'}</Text>
      <Text style={styles.h1}>{mode === 'baby' ? 'How many babies?' : 'How many people?'}</Text>
      <View style={{ flexDirection: 'row', gap: 12, marginBottom: 8 }}>
        {[1,2,3].map(n => (
          <TouchableOpacity key={n} onPress={() => setBabyCount(n)} style={[styles.themeBtn, { paddingVertical: 10, borderWidth: 1, borderColor: babyCount===n ? '#fff' : '#666' }]}>
            <Text style={[styles.themeText, { color: '#fff' }]}>
              {mode === 'baby' 
                ? (n === 1 ? 'Single' : n === 2 ? 'Twins' : 'Triplets')
                : (n === 1 ? 'One' : n === 2 ? 'Two' : 'Three')
              }
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {babies.map((b, idx) => (
        <View key={idx} style={{ marginBottom: 10 }}>
          <Text style={[styles.h1, { fontSize: 16 }]}>
            {mode === 'baby' ? `Baby ${idx + 1} First Name` : `Person ${idx + 1} First Name`}
          </Text>
          <TextInput
            style={[styles.input, { 
              backgroundColor: '#FFFFFF', 
              color: '#0a0a0a', 
              borderColor: touched.babyFirst && !(b.first || '').trim() ? '#ff6b6b' : 'rgba(255,255,255,0.8)' 
            }]}
            placeholder="First name"
            placeholderTextColor="#999"
            value={b.first}
            onChangeText={t => setBabies(bs => { const copy = [...bs]; copy[idx] = { ...copy[idx], first: t }; return copy; })}
          />
          <Text style={[styles.h1, { fontSize: 16 }]}>
            {mode === 'baby' ? `Baby ${idx + 1} Middle (optional)` : `Person ${idx + 1} Middle (optional)`}
          </Text>
          <TextInput 
            style={styles.input} 
            placeholder="Middle name (optional)" 
            placeholderTextColor="#999"
            value={b.middle || ''} 
            onChangeText={t => setBabies(bs => { const copy = [...bs]; copy[idx] = { ...copy[idx], middle: t }; return copy; })} 
          />
          <Text style={[styles.h1, { fontSize: 16 }]}>
            {mode === 'baby' ? `Baby ${idx + 1} Last (optional)` : `Person ${idx + 1} Last (optional)`}
          </Text>
          <TextInput 
            style={styles.input} 
            placeholder="Last name (optional)" 
            placeholderTextColor="#999"
            value={b.last || ''} 
            onChangeText={t => setBabies(bs => { const copy = [...bs]; copy[idx] = { ...copy[idx], last: t }; return copy; })} 
          />
          
          {/* Individual Photo Upload */}
          <Text style={[styles.h1, { fontSize: 16 }]}>
            {mode === 'baby' ? `Baby ${idx + 1} Photo (optional)` : `Person ${idx + 1} Photo (optional)`}
          </Text>
          <TouchableOpacity 
            style={[
              styles.btn, 
              styles.whiteBtn,
              { 
                backgroundColor: b.photoUri ? '#e8f5e8' : '#FFFFFF',
                borderWidth: 2,
                borderColor: b.photoUri ? '#4CAF50' : 'rgba(255,255,255,0.8)'
              }
            ]} 
            onPress={() => pickPhotoForBaby(idx)}
          >
            <Text style={[
              styles.btnText, 
              styles.darkText,
              { color: b.photoUri ? '#2E7D32' : '#0a0a0a' }
            ]}>
              {b.photoUri ? `✓ Photo ${idx + 1} Selected` : `📷 Upload Photo ${idx + 1}`}
            </Text>
          </TouchableOpacity>
          
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 }}>
            {babies.length > 1 && (
              <TouchableOpacity
                style={[
                  styles.btn, 
                  { 
                    backgroundColor: 'rgba(255,255,255,0.15)', 
                    paddingVertical: 10, 
                    paddingHorizontal: 20,
                    borderWidth: 1,
                    borderColor: 'rgba(255,255,255,0.3)'
                  }
                ]}
                onPress={() => setBabies(bs => bs.filter((_, i) => i !== idx))}
              >
                <Text style={{ color: '#fff', fontWeight: '600' }}>Remove {mode === 'baby' ? 'Baby' : 'Person'}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      ))}

      <Text style={styles.h1}>Mother&apos;s Name</Text>
      <TextInput 
        style={styles.input} 
        placeholder="Mother's name (optional)" 
        placeholderTextColor="#999"
        value={motherName} 
        onChangeText={setMotherName} 
      />

      <Text style={styles.h1}>Father&apos;s Name</Text>
      <TextInput 
        style={styles.input} 
        placeholder="Father's name (optional)" 
        placeholderTextColor="#999"
        value={fatherName} 
        onChangeText={setFatherName} 
      />

      <Text style={styles.h1}>Hometown (City, State) — required</Text>
      <TextInput
        style={[
          styles.input, 
          { 
            backgroundColor: '#FFFFFF', 
            color: '#0a0a0a', 
            borderColor: touched.hometown && !hometown.trim() ? '#ff6b6b' : 'rgba(255,255,255,0.8)',
            borderWidth: touched.hometown && !hometown.trim() ? 2 : 1
          }
        ]}
        placeholder="City, State (e.g., Springfield, MO)"
        placeholderTextColor="#999"
        value={hometown}
        onChangeText={setHometown}
        autoCapitalize="words"
        onBlur={() => setTouched(t => ({ ...t, hometown: true }))}
      />
      {loading && (
        <Text style={{ 
          color: '#90EE90', 
          fontSize: 14, 
          marginTop: 8, 
          textAlign: 'center',
          fontWeight: '500'
        }}>🔍 Finding population data...</Text>
      )}
      {population && (
        <Text style={{ 
          color: '#90EE90', 
          fontSize: 14, 
          marginTop: 8, 
          textAlign: 'center',
          fontWeight: '600'
        }}>✅ Population found: {population.toLocaleString()}</Text>
      )}
      {touched.hometown && !hometown.trim() ? (
        <Text style={[styles.errorText, { color: '#ffcccc' }]}>Hometown is required (e.g. "Austin, Texas").</Text>
      ) : touched.hometown && hometown.trim() && hometown.includes(',') && !population && !loading ? (
        <Text style={[styles.errorText, { color: '#ffdddd' }]}>Population not found. Try "Chicago, Illinois" or "Miami, Florida"</Text>
      ) : null}

      <Text style={styles.h1}>
        {mode === 'baby' ? 'Date of Birth' : 'Birthday Date'}
      </Text>
      <TouchableOpacity style={[styles.btn, styles.whiteBtn]} onPress={openDate}>
        <Text style={[styles.btnText, styles.darkText]}>
          {dobDate.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "2-digit", year: "numeric" })}
        </Text>
      </TouchableOpacity>

      {/* Weight and Length only shown for baby announcements */}
      {mode === 'baby' && (
        <>
          <Text style={styles.h1}>Weight</Text>
          {babyCount > 1 ? (
            <View style={{ 
              backgroundColor: 'rgba(255,255,255,0.1)', 
              padding: 20, 
              borderRadius: 12, 
              marginBottom: 16,
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.2)'
            }}>
              <Text style={{ 
                color: '#fff', 
                textAlign: 'center',
                fontSize: 16,
                fontWeight: '600',
                marginBottom: 8
              }}>
                ⚖️ Weight not available for {babyCount === 2 ? 'twins' : 'multiple babies'}
              </Text>
              <Text style={{ 
                color: 'rgba(255,255,255,0.8)', 
                textAlign: 'center',
                fontSize: 14,
                lineHeight: 20
              }}>
                Individual measurements would be confusing on the announcement
              </Text>
            </View>
          ) : (
            <View style={styles.row}>
              <TextInput 
                style={[styles.input, styles.half]} 
                placeholder="7 lbs" 
                placeholderTextColor="#999"
                keyboardType="numeric" 
                value={weightLb} 
                onChangeText={setWeightLb} 
              />
              <TextInput 
                style={[styles.input, styles.half]} 
                placeholder="8 oz" 
                placeholderTextColor="#999"
                keyboardType="numeric" 
                value={weightOz} 
                onChangeText={setWeightOz} 
              />
            </View>
          )}

          <Text style={styles.h1}>Length (inches)</Text>
          {babyCount > 1 ? (
            <View style={{ 
              backgroundColor: 'rgba(255,255,255,0.1)', 
              padding: 20, 
              borderRadius: 12, 
              marginBottom: 16,
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.2)'
            }}>
              <Text style={{ 
                color: '#fff', 
                textAlign: 'center',
                fontSize: 16,
                fontWeight: '600',
                marginBottom: 8
              }}>
                📏 Length not available for {babyCount === 2 ? 'twins' : 'multiple babies'}
              </Text>
              <Text style={{ 
                color: 'rgba(255,255,255,0.8)', 
                textAlign: 'center',
                fontSize: 14,
                lineHeight: 20
              }}>
                Individual measurements would be confusing on the announcement
              </Text>
            </View>
          ) : (
            <TextInput 
              style={styles.input} 
              placeholder="20 inches" 
              placeholderTextColor="#999"
              keyboardType="numeric" 
              value={lengthIn} 
              onChangeText={setLengthIn} 
            />
          )}
        </>
      )}

      <Text style={styles.h1}>Color Scheme</Text>
      <View style={styles.row}>
        {(["green","pink","blue"] as ThemeName[]).map(t => (
          <TouchableOpacity
            key={t}
            onPress={() => setTheme(t)}
            style={[
              styles.themeBtn,
              {
                backgroundColor: theme === t ? COLOR_SCHEMES[t as keyof typeof COLOR_SCHEMES].bg : 'transparent',
                borderColor: COLOR_SCHEMES[t as keyof typeof COLOR_SCHEMES].border,
                borderWidth: 1,
                opacity: theme === t ? 1 : 0.95,
              }
            ]}
          >
            <Text style={[styles.themeText, { color: '#ffffff' }]}>{t.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.h1}>Layout Options</Text>
      
      {/* Front Page Layout */}
      <Text style={[styles.h1, { fontSize: 16, marginTop: 12, marginBottom: 8 }]}>Front Page Layout</Text>
      <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
        <TouchableOpacity 
          onPress={() => setFrontOrientation('landscape')} 
          style={[styles.themeBtn, { 
            paddingVertical: 12, 
            borderWidth: 2, 
            borderColor: frontOrientation === 'landscape' ? '#fff' : '#666',
            backgroundColor: frontOrientation === 'landscape' ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)'
          }]}
        >
          <Text style={[styles.themeText, { color: '#fff' }]}>📄 Landscape</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => setFrontOrientation('portrait')} 
          style={[styles.themeBtn, { 
            paddingVertical: 12, 
            borderWidth: 2, 
            borderColor: frontOrientation === 'portrait' ? '#fff' : '#666',
            backgroundColor: frontOrientation === 'portrait' ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)'
          }]}
        >
          <Text style={[styles.themeText, { color: '#fff' }]}>📋 Portrait</Text>
        </TouchableOpacity>
      </View>

      {/* TimeCapsule Page Layout */}
      <Text style={[styles.h1, { fontSize: 16, marginTop: 12, marginBottom: 8 }]}>TimeCapsule Layout</Text>
      <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
        <TouchableOpacity 
          onPress={() => setTimeCapsuleOrientation('landscape')} 
          style={[styles.themeBtn, { 
            paddingVertical: 12, 
            borderWidth: 2, 
            borderColor: timeCapsuleOrientation === 'landscape' ? '#fff' : '#666',
            backgroundColor: timeCapsuleOrientation === 'landscape' ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)'
          }]}
        >
          <Text style={[styles.themeText, { color: '#fff' }]}>📊 Landscape</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => setTimeCapsuleOrientation('portrait')} 
          style={[styles.themeBtn, { 
            paddingVertical: 12, 
            borderWidth: 2, 
            borderColor: timeCapsuleOrientation === 'portrait' ? '#fff' : '#666',
            backgroundColor: timeCapsuleOrientation === 'portrait' ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)'
          }]}
        >
          <Text style={[styles.themeText, { color: '#fff' }]}>📑 Portrait</Text>
        </TouchableOpacity>
      </View>

      {loading && hometown.trim() && (
        <View style={{
          backgroundColor: 'rgba(255,255,255,0.1)',
          padding: 16,
          borderRadius: 12,
          marginTop: 16,
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.2)'
        }}>
          <Text style={{ 
            color: '#fff', 
            textAlign: 'center', 
            fontSize: 16,
            fontWeight: '500'
          }}>
            🔍 Loading data from Google Sheets...
          </Text>
        </View>
      )}

      <Text style={styles.h1}>Email Address (for order updates & special offers)</Text>
      <TextInput 
        style={styles.input} 
        placeholder="your.email@example.com" 
        placeholderTextColor="#999"
        value={email} 
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
      />

      <TouchableOpacity
        style={[styles.btn, styles.buildBtn, styles.whiteBtn, (!canBuild || loading) && styles.btnDisabled]}
        onPress={onBuild}
        disabled={!canBuild || loading}
      >
        <Text style={[styles.buildText, styles.darkText]}>
          {loading 
            ? 'LOADING...' 
            : mode === 'baby' 
              ? 'BUILD MY BIRTH ANNOUNCEMENT'
              : 'BUILD MY TIME CAPSULE GIFT'
          }
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  container: { padding: 20, paddingBottom: 40 },
  h1: { 
    color: "#FFFFFF", 
    fontSize: 18, 
    fontWeight: "700", 
    marginTop: 20, 
    marginBottom: 12,
    letterSpacing: 0.5
  },
  input: { 
    backgroundColor: "#FFFFFF", 
    color: "#0a0a0a", 
    borderRadius: 12, 
    paddingHorizontal: 18, 
    paddingVertical: 16, 
    fontSize: 16, 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.8)',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  row: { flexDirection: "row", gap: 12 },
  half: { flex: 1 },
  btn: { 
    backgroundColor: "rgba(255,255,255,0.1)", 
    borderRadius: 12, 
    paddingVertical: 16, 
    alignItems: "center", 
    marginTop: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)"
  },
  btnText: { 
    color: "white", 
    fontSize: 16, 
    fontWeight: "600",
    letterSpacing: 0.3
  },
  buildBtn: { 
    marginTop: 24, 
    backgroundColor: "rgba(255,255,255,0.95)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6
  },
  buildText: { 
    color: "#0a0a0a", 
    fontWeight: "800", 
    fontSize: 18, 
    textAlign: "center",
    letterSpacing: 0.5
  },
  themeBtn: { 
    flex: 1, 
    paddingVertical: 14, 
    borderRadius: 12, 
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)"
  },
  themeText: { 
    color: "white", 
    fontWeight: "700",
    fontSize: 15,
    letterSpacing: 0.3
  },
  errorText: { 
    color: '#ffcccc', 
    marginTop: 8, 
    fontSize: 14,
    fontStyle: 'italic'
  },
  btnDisabled: { opacity: 0.6 },
  whiteBtn: { 
    backgroundColor: '#FFFFFF',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4
  },
  darkText: { color: '#0a0a0a' },
});