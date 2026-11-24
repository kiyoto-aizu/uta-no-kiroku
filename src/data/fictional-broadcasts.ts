export type BroadcastRecord = {
  id: string;
  songId: string;
  title: string;
  broadcastDate: string;
  category: 'monthly_song' | 'regular_song';
};

// These fictional titles and dates are not real broadcast history.
export const fictionalBroadcasts: BroadcastRecord[] = [
  { id: '1', songId: 'song-1', title: 'テストの月のうた', broadcastDate: '2024-04-01', category: 'monthly_song' },
  { id: '2', songId: 'song-2', title: '架空の虹のうた', broadcastDate: '2024-04-01', category: 'regular_song' },
  { id: '3', songId: 'song-3', title: 'ふわふわ雲のぼうけん', broadcastDate: '2024-04-01', category: 'regular_song' },
  { id: '4', songId: 'song-1', title: 'テストの月のうた', broadcastDate: '2024-04-02', category: 'monthly_song' },
  { id: '5', songId: 'song-4', title: 'きらきら星のクッキー', broadcastDate: '2024-04-02', category: 'regular_song' },
  { id: '6', songId: 'song-2', title: '架空の虹のうた', broadcastDate: '2024-04-03', category: 'regular_song' },
  { id: '7', songId: 'song-5', title: 'ぽかぽか空のおさんぽ', broadcastDate: '2024-04-03', category: 'regular_song' },
  { id: '8', songId: 'song-6', title: 'テストの青い風船', broadcastDate: '2024-05-01', category: 'monthly_song' },
  { id: '9', songId: 'song-7', title: 'まるい月のおまつり', broadcastDate: '2024-05-01', category: 'regular_song' },
  { id: '10', songId: 'song-6', title: 'テストの青い風船', broadcastDate: '2024-05-02', category: 'monthly_song' },
  { id: '11', songId: 'song-8', title: 'おひさまの架空列車', broadcastDate: '2024-05-02', category: 'regular_song' },
];
