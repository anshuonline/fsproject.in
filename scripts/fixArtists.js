import fs from 'fs';
import YTMusic from 'ytmusic-api';
import { TOP_100_ARTISTS, GENRES_LIST } from '../src/data/artistsData.js';

async function fixArtists() {
  const yt = new YTMusic();
  await yt.initialize();
  
  console.log('Checking and fixing', TOP_100_ARTISTS.length, 'artists...');
  let updatedCount = 0;
  
  for (const a of TOP_100_ARTISTS) {
    let isOk = false;
    try {
      const res = await fetch(a.image, { method: 'HEAD' });
      if (res.status === 200) isOk = true;
    } catch (e) {}
    
    if (!isOk) {
      console.log('Resolving live image for:', a.name);
      try {
        const search = await yt.searchArtists(a.name);
        const thumbs = search[0]?.thumbnails || [];
        const best = thumbs[thumbs.length - 1]?.url || thumbs[0]?.url;
        if (best) {
          a.image = best;
          updatedCount++;
          console.log('  -> Found:', best);
        } else {
          // If no thumbnail, search song by artist to get channel/video thumb
          const songs = await yt.searchSongs(a.name);
          const songThumb = songs[0]?.thumbnails?.[0]?.url;
          if (songThumb) {
            a.image = songThumb;
            updatedCount++;
            console.log('  -> Fallback song thumb:', songThumb);
          }
        }
      } catch (err) {
        console.error('  -> Search failed for', a.name, err.message);
      }
    }
  }
  
  console.log(`Updated ${updatedCount} artists.`);
  
  const outputCode = `export const TOP_100_ARTISTS = ${JSON.stringify(TOP_100_ARTISTS, null, 2)};\n\nexport const GENRES_LIST = ${JSON.stringify(GENRES_LIST, null, 2)};\n`;
  fs.writeFileSync('./src/data/artistsData.js', outputCode, 'utf8');
  console.log('Updated src/data/artistsData.js successfully!');
}

fixArtists().catch(console.error);
