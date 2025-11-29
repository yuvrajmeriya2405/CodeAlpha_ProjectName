// api.js
// Simple wrapper to call iTunes Search API
// We return an array of normalized tracks for our player

async function searchiTunes(query, limit = 25) {
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&limit=${limit}`;
    try {
        const res = await fetch(url);
        if (!res.ok) {
            throw new Error('Network response not ok');
        }
        const data = await res.json();
        // Map iTunes results to our internal format
        const tracks = data.results.map(item => ({
            id: item.trackId || `${item.collectionId}-${Math.random()}`,
            title: item.trackName || item.collectionName || 'Unknown',
            artist: item.artistName || 'Unknown Artist',
            previewUrl: item.previewUrl || null,         // 30s preview (if available)
            artwork: (item.artworkUrl100 || '').replace('100x100', '400x400'),
            duration: item.trackTimeMillis || item.collectionArtistId || 0
        })).filter(t => t.previewUrl); // keep only those with previewUrl
        return tracks;
    } catch (err) {
        console.error('iTunes search error', err);
        return [];
    }
}
