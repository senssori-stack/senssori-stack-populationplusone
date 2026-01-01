async function fetchUser(id) {
  try {
    const res = await fetch(`/api/users/${encodeURIComponent(id)}`);
    if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('fetchUser error:', err);
    return null;
  }
}

export default fetchUser;
