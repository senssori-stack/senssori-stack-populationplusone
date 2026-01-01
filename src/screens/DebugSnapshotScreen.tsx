import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { getAllSnapshotValues, LAST_SNAPSHOT_MAPPINGS, clearSnapshotCache } from '../data/utils/snapshot';
import { fetchCSV, parseCSV } from '../data/utils/csv';
import { SNAPSHOT_CSV_URL } from '../data/utils/sheets';

export default function DebugSnapshotScreen() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Record<string, string> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rawRows, setRawRows] = useState<string[][] | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await getAllSnapshotValues();
        setData(res);
      } catch (err: any) {
        setError(err.message || String(err));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function handleForceFetch() {
    setLoading(true);
    setError(null);
    try {
      // clear cache and refetch
      clearSnapshotCache();
      const rows = await fetchCSV(SNAPSHOT_CSV_URL);
      setRawRows(rows);
      const res = await getAllSnapshotValues();
      setData(res);
    } catch (err: any) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Snapshot Fetch Debug</Text>
      {loading && <ActivityIndicator size="large" color="#fff" />}
      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <ScrollView style={styles.scroll}>
          <View style={{ marginBottom: 10 }}>
            <Text style={[styles.key, { fontSize: 14 }]}>Dev Controls</Text>
            <Text style={styles.val} onPress={handleForceFetch}>Force fetch & clear cache (tap)</Text>
            <Text style={styles.val} onPress={() => { clearSnapshotCache(); setData(null); setRawRows(null); }}>Clear cache (tap)</Text>
          </View>
          {rawRows && (
            <View style={{ marginBottom: 12 }}>
              <Text style={[styles.key, { fontSize: 14 }]}>Raw CSV Rows (first 4)</Text>
              {rawRows.slice(0, 4).map((r, i) => (
                <Text key={i} style={styles.val}>{JSON.stringify(r)}</Text>
              ))}
            </View>
          )}
          {LAST_SNAPSHOT_MAPPINGS && LAST_SNAPSHOT_MAPPINGS.length > 0 && (
            <View style={{ marginBottom: 12 }}>
              <Text style={[styles.key, { fontSize: 14 }]}>Applied Mappings</Text>
              {LAST_SNAPSHOT_MAPPINGS.map((m, idx) => (
                <Text key={idx} style={styles.val}>{`${m.from} → ${m.to}`}</Text>
              ))}
            </View>
          )}
          {data ? (
            Object.entries(data).map(([k, v]) => (
              <View key={k} style={styles.row}>
                <Text style={styles.key}>{k}</Text>
                <Text style={styles.val}>{v || 'N/A'}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.note}>No data</Text>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#0f2b22' },
  title: { color: '#fff', fontSize: 18, marginBottom: 12 },
  scroll: { marginTop: 12 },
  row: { marginBottom: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)', paddingBottom: 6 },
  key: { color: '#9fe4c2', fontWeight: '600' },
  val: { color: '#fff' },
  note: { color: '#ccc' },
  error: { color: '#ff8080' },
});
