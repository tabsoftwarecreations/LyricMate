import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = 'https://itmkbxwhvovylfzgpmsr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0bWtieHdodm92eWxmemdwbXNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1NzQwNzgsImV4cCI6MjA5MzE1MDA3OH0.XDsAo0ydBs6p2pR1aj15p2diLfpOeraY_p53_zn1kFc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});

/**
 * Robust helper to fetch approved songs with retries and a native fetch fallback.
 * Bypasses library wrapper issues that occasionally lead to Cloudflare 520 errors.
 */
export async function safeFetchSongs(categoryName = null, retries = 3) {
    // 1. Try direct native fetch API first (highly reliable and instant)
    try {
        let url = `${supabaseUrl}/rest/v1/songs?select=id,title,artist,category,status&status=eq.approved&order=title.asc`;
        if (categoryName) {
            url += `&category=eq.${encodeURIComponent(categoryName)}`;
        }

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'apikey': supabaseAnonKey,
                'Authorization': `Bearer ${supabaseAnonKey}`,
                'Content-Type': 'application/json',
            }
        });

        if (response.ok) {
            const data = await response.json();
            return { data, error: null };
        }
        console.warn(`Direct fetch returned status: ${response.status}. Falling back to Supabase client...`);
    } catch (err) {
        console.warn('Direct fetch failed. Falling back to Supabase client...', err);
    }

    // 2. Fallback to Supabase client if direct fetch failed
    let lastError = null;
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            let query = supabase.from('songs').select('id,title,artist,category,status').eq('status', 'approved');
            if (categoryName) {
                query = query.eq('category', categoryName);
            }
            const { data, error } = await query.order('title', { ascending: true });
            if (!error) return { data, error: null };
            lastError = error;
        } catch (err) {
            lastError = err;
        }
        if (attempt < retries) {
            await new Promise(r => setTimeout(r, attempt * 500));
        }
    }

    return { data: null, error: lastError || new Error('Failed to fetch songs') };
}

/**
 * Robust helper to fetch pending songs for the Admin panel.
 * Uses a native HTTP fetch fallback to bypass Cloudflare 520 errors.
 */
export async function safeFetchPendingSongs(retries = 3) {
    // 1. Try direct native fetch API first (highly reliable and instant)
    try {
        let url = `${supabaseUrl}/rest/v1/songs?status=eq.pending&order=id.desc`;
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'apikey': supabaseAnonKey,
                'Authorization': `Bearer ${supabaseAnonKey}`,
                'Content-Type': 'application/json',
            }
        });

        if (response.ok) {
            const data = await response.json();
            return { data, error: null };
        }
        console.warn(`Direct fetch pending songs returned status: ${response.status}. Falling back to Supabase client...`);
    } catch (err) {
        console.warn('Direct fetch pending songs failed. Falling back to Supabase client...', err);
    }

    // 2. Fallback to Supabase client if direct fetch failed
    let lastError = null;
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const { data, error } = await supabase
                .from('songs')
                .select('*')
                .eq('status', 'pending')
                .order('id', { ascending: false });
            if (!error) return { data, error: null };
            lastError = error;
        } catch (err) {
            lastError = err;
        }
        if (attempt < retries) {
            await new Promise(r => setTimeout(r, attempt * 500));
        }
    }

    return { data: null, error: lastError || new Error('Failed to fetch pending songs') };
}

/**
 * Robust helper to fetch songs by a list of IDs.
 * Uses a native HTTP fetch fallback to bypass Cloudflare 520 errors.
 */
export async function safeFetchSongsByIds(songIds, retries = 3) {
    if (!songIds || songIds.length === 0) return { data: [], error: null };

    // 1. Try direct native fetch API first (highly reliable and instant)
    try {
        let url = `${supabaseUrl}/rest/v1/songs?select=id,title,artist,category,status&id=in.(${songIds.join(',')})&order=title.asc`;
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'apikey': supabaseAnonKey,
                'Authorization': `Bearer ${supabaseAnonKey}`,
                'Content-Type': 'application/json',
            }
        });

        if (response.ok) {
            const data = await response.json();
            return { data, error: null };
        }
        console.warn(`Direct fetch songs by ids returned status: ${response.status}. Falling back to Supabase client...`);
    } catch (err) {
        console.warn('Direct fetch songs by ids failed. Falling back to Supabase client...', err);
    }

    // 2. Fallback to Supabase client if direct fetch failed
    let lastError = null;
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const { data, error } = await supabase
                .from('songs')
                .select('id,title,artist,category,status')
                .in('id', songIds)
                .order('title', { ascending: true });
            if (!error) return { data, error: null };
            lastError = error;
        } catch (err) {
            lastError = err;
        }
        if (attempt < retries) {
            await new Promise(r => setTimeout(r, attempt * 500));
        }
    }

    return { data: null, error: lastError || new Error('Failed to fetch songs by ids') };
}

/**
 * Robust helper to fetch a single song by its ID (including full lyrics and transliterations).
 * Uses a native HTTP fetch fallback to bypass Cloudflare 520 errors.
 */
export async function safeFetchSongById(songId, retries = 3) {
    if (!songId) return { data: null, error: new Error('Invalid song ID') };

    // 1. Try direct native fetch API first (highly reliable and instant)
    try {
        let url = `${supabaseUrl}/rest/v1/songs?id=eq.${songId}`;
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'apikey': supabaseAnonKey,
                'Authorization': `Bearer ${supabaseAnonKey}`,
                'Content-Type': 'application/json',
            }
        });

        if (response.ok) {
            const data = await response.json();
            return { data: data && data.length > 0 ? data[0] : null, error: null };
        }
        console.warn(`Direct fetch song by id returned status: ${response.status}. Falling back to Supabase client...`);
    } catch (err) {
        console.warn('Direct fetch song by id failed. Falling back to Supabase client...', err);
    }

    // 2. Fallback to Supabase client if direct fetch failed
    let lastError = null;
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const { data, error } = await supabase
                .from('songs')
                .select('*')
                .eq('id', songId)
                .single();
            if (!error) return { data, error: null };
            lastError = error;
        } catch (err) {
            lastError = err;
        }
        if (attempt < retries) {
            await new Promise(r => setTimeout(r, attempt * 500));
        }
    }

    return { data: null, error: lastError || new Error('Failed to fetch song by id') };
}

/**
 * Robust helper to insert a song into the DB.
 * Uses a native HTTP POST request fallback to bypass Cloudflare 520 errors.
 */
export async function safeInsertSong(songData) {
    // 1. Try direct native fetch API first (highly reliable and instant)
    try {
        const response = await fetch(`${supabaseUrl}/rest/v1/songs`, {
            method: 'POST',
            headers: {
                'apikey': supabaseAnonKey,
                'Authorization': `Bearer ${supabaseAnonKey}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(songData)
        });

        if (response.ok) {
            const data = await response.json();
            return { data, error: null };
        }
        console.warn(`Direct insert returned status: ${response.status}. Falling back to Supabase client...`);
    } catch (err) {
        console.warn('Direct insert failed. Falling back to Supabase client...', err);
    }

    // 2. Fallback to Supabase client if direct insert failed
    try {
        const { data, error } = await supabase.from('songs').insert([songData]).select();
        return { data, error };
    } catch (err) {
        return { data: null, error: err };
    }
}

/**
 * Robust helper to update song status (e.g. approve song).
 * Uses a native HTTP PATCH request fallback to bypass Cloudflare 520 errors.
 */
export async function safeUpdateSongStatus(songId, status) {
    // 1. Try direct native fetch API first (highly reliable and instant)
    try {
        const response = await fetch(`${supabaseUrl}/rest/v1/songs?id=eq.${songId}`, {
            method: 'PATCH',
            headers: {
                'apikey': supabaseAnonKey,
                'Authorization': `Bearer ${supabaseAnonKey}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({ status })
        });

        if (response.ok) {
            return { error: null };
        }
        console.warn(`Direct update returned status: ${response.status}. Falling back to Supabase client...`);
    } catch (err) {
        console.warn('Direct update failed. Falling back to Supabase client...', err);
    }

    // 2. Fallback to Supabase client if direct update failed
    try {
        const { error } = await supabase.from('songs').update({ status }).eq('id', songId);
        return { error };
    } catch (err) {
        return { error: err };
    }
}

/**
 * Robust helper to delete a song and its references.
 * Uses native HTTP DELETE request fallbacks to bypass Cloudflare 520 errors.
 */
export async function safeDeleteSong(songId) {
    // 1. Try direct native fetch API first (highly reliable and instant)
    try {
        // Delete from favorites first (foreign key dependency)
        await fetch(`${supabaseUrl}/rest/v1/favorites?song_id=eq.${songId}`, {
            method: 'DELETE',
            headers: {
                'apikey': supabaseAnonKey,
                'Authorization': `Bearer ${supabaseAnonKey}`,
                'Content-Type': 'application/json'
            }
        });

        const response = await fetch(`${supabaseUrl}/rest/v1/songs?id=eq.${songId}`, {
            method: 'DELETE',
            headers: {
                'apikey': supabaseAnonKey,
                'Authorization': `Bearer ${supabaseAnonKey}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            return { error: null };
        }
        console.warn(`Direct delete returned status: ${response.status}. Falling back to Supabase client...`);
    } catch (err) {
        console.warn('Direct delete failed. Falling back to Supabase client...', err);
    }

    // 2. Fallback to Supabase client if direct delete failed
    try {
        await supabase.from('favorites').delete().eq('song_id', songId);
        const { error } = await supabase.from('songs').delete().eq('id', songId);
        return { error };
    } catch (err) {
        return { error: err };
    }
}

/**
 * Robust helper to insert a user favorite.
 * Uses a native HTTP POST request with authenticated session JWT token to bypass Cloudflare 520 errors.
 */
export async function safeInsertFavorite(userId, songId) {
    if (!userId || !songId) return { error: new Error('Invalid arguments') };

    // 1. Try direct native fetch API first (bypasses Cloudflare 520 errors)
    try {
        const { data: { session } } = await supabase.auth.getSession();
        const accessToken = session?.access_token;
        if (!accessToken) throw new Error('No active session token');

        const response = await fetch(`${supabaseUrl}/rest/v1/favorites`, {
            method: 'POST',
            headers: {
                'apikey': supabaseAnonKey,
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({ user_id: userId, song_id: songId })
        });

        if (response.ok) {
            return { error: null };
        }
        console.warn(`Direct insert favorite returned status: ${response.status}. Falling back to Supabase client...`);
    } catch (err) {
        console.warn('Direct insert favorite failed. Falling back to Supabase client...', err);
    }

    // 2. Fallback to Supabase client
    try {
        const { error } = await supabase.from('favorites').insert([{ user_id: userId, song_id: songId }]);
        return { error };
    } catch (err) {
        return { error: err };
    }
}

/**
 * Robust helper to delete a user favorite.
 * Uses a native HTTP DELETE request with authenticated session JWT token to bypass Cloudflare 520 errors.
 */
export async function safeDeleteFavorite(userId, songId) {
    if (!userId || !songId) return { error: new Error('Invalid arguments') };

    // 1. Try direct native fetch API first (bypasses Cloudflare 520 errors)
    try {
        const { data: { session } } = await supabase.auth.getSession();
        const accessToken = session?.access_token;
        if (!accessToken) throw new Error('No active session token');

        const response = await fetch(`${supabaseUrl}/rest/v1/favorites?user_id=eq.${userId}&song_id=eq.${songId}`, {
            method: 'DELETE',
            headers: {
                'apikey': supabaseAnonKey,
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            return { error: null };
        }
        console.warn(`Direct delete favorite returned status: ${response.status}. Falling back to Supabase client...`);
    } catch (err) {
        console.warn('Direct delete favorite failed. Falling back to Supabase client...', err);
    }

    // 2. Fallback to Supabase client
    try {
        const { error } = await supabase.from('favorites').delete().eq('user_id', userId).eq('song_id', songId);
        return { error };
    } catch (err) {
        return { error: err };
    }
}

/**
 * Robust helper to fetch all favorites for a user.
 * Uses a native HTTP GET request with authenticated session JWT token to bypass Cloudflare 520 errors.
 */
export async function safeFetchFavorites(userId, retries = 3) {
    if (!userId) return { data: [], error: null };

    // 1. Try direct native fetch API first (bypasses Cloudflare 520 errors)
    try {
        const { data: { session } } = await supabase.auth.getSession();
        const accessToken = session?.access_token;
        if (!accessToken) throw new Error('No active session token');

        const response = await fetch(`${supabaseUrl}/rest/v1/favorites?select=song_id&user_id=eq.${userId}`, {
            method: 'GET',
            headers: {
                'apikey': supabaseAnonKey,
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            return { data, error: null };
        }
        console.warn(`Direct fetch favorites returned status: ${response.status}. Falling back to Supabase client...`);
    } catch (err) {
        console.warn('Direct fetch favorites failed. Falling back to Supabase client...', err);
    }

    // 2. Fallback to Supabase client
    let lastError = null;
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const { data, error } = await supabase
                .from('favorites')
                .select('song_id')
                .eq('user_id', userId);
            if (!error) return { data, error: null };
            lastError = error;
        } catch (err) {
            lastError = err;
        }
        if (attempt < retries) {
            await new Promise(r => setTimeout(r, attempt * 500));
        }
    }

    return { data: null, error: lastError || new Error('Failed to fetch favorites') };
}

// Local favorites key
const LOCAL_FAVS_KEY = '@lyricmate_local_favorites';

/**
 * Loads favorite IDs from AsyncStorage.
 */
export async function getLocalFavorites() {
    try {
        const val = await AsyncStorage.getItem(LOCAL_FAVS_KEY);
        return val ? JSON.parse(val) : [];
    } catch (e) {
        console.warn('Error reading local favorites:', e);
        return [];
    }
}

/**
 * Saves favorite IDs to AsyncStorage.
 */
export async function saveLocalFavorites(favs) {
    try {
        await AsyncStorage.setItem(LOCAL_FAVS_KEY, JSON.stringify(favs));
    } catch (e) {
        console.warn('Error writing local favorites:', e);
    }
}