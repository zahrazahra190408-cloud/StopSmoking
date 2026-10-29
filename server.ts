import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

interface Customization {
  hat: string;
  outfit: string;
  glasses: string;
  skinColor: string;
  roomTheme: string;
}

interface CoupleReward {
  id: string;
  title: string;
  requiredStreakDays: number;
  rewardDescription: string;
  claimed: boolean;
  createdBy: 'zahra' | 'smoker';
  createdAt: number;
}

interface CheerMessage {
  id: string;
  from: 'zahra' | 'smoker';
  message: string;
  emoji: string;
  timestamp: number;
}

interface DailyRecord {
  date: string; // YYYY-MM-DD
  count: number;
  cravingsResisted: number;
}

interface RoomData {
  roomId: string;
  partnerName: string; // e.g. "Zahra"
  smokerName: string;  // e.g. "Rian" / "Pacar"
  dailyLimit: number;
  costPerPack: number;
  cigsPerPack: number;
  cigarettesToday: number;
  lastSmokedAt: number;
  quitStartDate: number;
  cravingCount: number;
  pet: {
    name: string;
    health: number;
    lungCleanliness: number;
    happiness: number;
    coins: number;
    xp: number;
    lastCaredAt: number;
    customization: Customization;
    unlockedItems: string[];
  };
  history: DailyRecord[];
  cheers: CheerMessage[];
  coupleRewards: CoupleReward[];
  lastUpdated: number;
}

// In-memory persistent room store
const rooms: Record<string, RoomData> = {};

// Default initial state generator
function createDefaultRoom(roomId: string): RoomData {
  const now = Date.now();
  const pastWeek: DailyRecord[] = [];
  
  // Seed initial 7-day reduction progress
  const counts = [14, 12, 10, 8, 7, 5, 3];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now - i * 24 * 60 * 60 * 1000);
    const dateStr = d.toISOString().split('T')[0];
    pastWeek.push({
      date: dateStr,
      count: counts[6 - i] || 3,
      cravingsResisted: Math.floor(Math.random() * 4) + 2,
    });
  }

  return {
    roomId: roomId.toUpperCase(),
    partnerName: 'Zahra',
    smokerName: 'Pacar Zahra',
    dailyLimit: 6,
    costPerPack: 35000,
    cigsPerPack: 16,
    cigarettesToday: 2,
    lastSmokedAt: now - 3 * 60 * 60 * 1000, // 3 hours ago
    quitStartDate: now - 7 * 24 * 60 * 60 * 1000, // started 7 days ago
    cravingCount: 8,
    pet: {
      name: 'Puffi',
      health: 82,
      lungCleanliness: 78,
      happiness: 85,
      coins: 140,
      xp: 320,
      lastCaredAt: now - 30 * 60 * 1000,
      customization: {
        hat: 'sprout',
        outfit: 'none',
        glasses: 'none',
        skinColor: '#FDE68A',
        roomTheme: 'cozy',
      },
      unlockedItems: ['hat_sprout', 'skin_golden', 'room_cozy', 'hat_cap'],
    },
    history: pastWeek,
    cheers: [
      {
        id: 'c1',
        from: 'zahra',
        message: 'Semangat terus ya sayang! Aku selalu dukung kamu biar napasnya makin enteng ❤️',
        emoji: '💖',
        timestamp: now - 2 * 60 * 60 * 1000,
      },
      {
        id: 'c2',
        from: 'zahra',
        message: 'Keren banget hari ini baru 2 batang! Yuk tahan sampai besok pagi 🥰',
        emoji: '✨',
        timestamp: now - 45 * 60 * 1000,
      },
    ],
    coupleRewards: [
      {
        id: 'r1',
        title: 'Traktir Kopi & Pastry Favorit',
        requiredStreakDays: 1,
        rewardDescription: 'Zahra bakal traktir kopi dan croffle sepulang kerja!',
        claimed: true,
        createdBy: 'zahra',
        createdAt: now - 6 * 24 * 60 * 60 * 1000,
      },
      {
        id: 'r2',
        title: 'Movie Date Bioskop VIP',
        requiredStreakDays: 3,
        rewardDescription: 'Nonton film pilihan kamu berdua akhir pekan ini plus popcorn jumbo.',
        claimed: false,
        createdBy: 'zahra',
        createdAt: now - 5 * 24 * 60 * 60 * 1000,
      },
      {
        id: 'r3',
        title: 'Masakan Spesial Rumahan Pilihanmu',
        requiredStreakDays: 7,
        rewardDescription: 'Zahra masakin menu kesukaan spesial saat berhasil bertahan 1 minggu!',
        claimed: false,
        createdBy: 'zahra',
        createdAt: now - 4 * 24 * 60 * 60 * 1000,
      },
      {
        id: 'r4',
        title: 'Staycation Liburan Sehat',
        requiredStreakDays: 14,
        rewardDescription: 'Uang hemat rokok dialihkan buat jalan-jalan ke udara segar pegunungan.',
        claimed: false,
        createdBy: 'zahra',
        createdAt: now - 2 * 24 * 60 * 60 * 1000,
      },
    ],
    lastUpdated: now,
  };
}

// Pre-seed default room for Zahra & her boyfriend
rooms['ZAHRA1'] = createDefaultRoom('ZAHRA1');
rooms['SEHATKU'] = createDefaultRoom('SEHATKU');

// SSE clients map for real-time push
const sseClients: Record<string, express.Response[]> = {};

function notifyRoomSubscribers(roomId: string, data: RoomData) {
  const clients = sseClients[roomId] || [];
  const payload = `data: ${JSON.stringify(data)}\n\n`;
  for (const client of clients) {
    try {
      client.write(payload);
    } catch {
      // client disconnected
    }
  }
}

// API Routes
app.get('/api/room/:roomId', (req, res) => {
  const roomId = req.params.roomId.toUpperCase();
  if (!rooms[roomId]) {
    rooms[roomId] = createDefaultRoom(roomId);
  }
  res.json(rooms[roomId]);
});

app.post('/api/room/join', (req, res) => {
  const { roomId, partnerName, smokerName } = req.body;
  const id = (roomId || 'ZAHRA1').toUpperCase().trim();
  if (!rooms[id]) {
    rooms[id] = createDefaultRoom(id);
  }
  if (partnerName) rooms[id].partnerName = partnerName;
  if (smokerName) rooms[id].smokerName = smokerName;
  rooms[id].lastUpdated = Date.now();
  notifyRoomSubscribers(id, rooms[id]);
  res.json(rooms[id]);
});

// SSE endpoint for instant two-phone live sync
app.get('/api/sync/:roomId', (req, res) => {
  const roomId = req.params.roomId.toUpperCase();
  if (!rooms[roomId]) {
    rooms[roomId] = createDefaultRoom(roomId);
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  if (!sseClients[roomId]) {
    sseClients[roomId] = [];
  }
  sseClients[roomId].push(res);

  // Send current state immediately
  res.write(`data: ${JSON.stringify(rooms[roomId])}\n\n`);

  req.on('close', () => {
    sseClients[roomId] = (sseClients[roomId] || []).filter((c) => c !== res);
  });
});

// Perform action
app.post('/api/room/:roomId/action', (req, res) => {
  const roomId = req.params.roomId.toUpperCase();
  if (!rooms[roomId]) {
    rooms[roomId] = createDefaultRoom(roomId);
  }
  const room = rooms[roomId];
  const { action, payload } = req.body;
  const now = Date.now();
  const todayStr = new Date(now).toISOString().split('T')[0];

  if (action === 'SMOKE') {
    room.cigarettesToday += 1;
    room.lastSmokedAt = now;
    
    // Penalize pet health & lungs
    room.pet.health = Math.max(5, room.pet.health - 15);
    room.pet.lungCleanliness = Math.max(5, room.pet.lungCleanliness - 12);
    room.pet.happiness = Math.max(10, room.pet.happiness - 10);

    // Update daily history
    let todayRecord = room.history.find((h) => h.date === todayStr);
    if (!todayRecord) {
      todayRecord = { date: todayStr, count: 0, cravingsResisted: 0 };
      room.history.push(todayRecord);
    }
    todayRecord.count += 1;

    // Auto alert message in cheer log
    room.cheers.unshift({
      id: `alert-${now}`,
      from: 'smoker',
      message: `Merokok 1 batang. Puffi terbatuk-batuk, tapi jangan menyerah untuk pulih kembali!`,
      emoji: '💨',
      timestamp: now,
    });
  } else if (action === 'RESIST') {
    room.cravingCount += 1;
    // Reward coins and XP
    room.pet.coins += 20;
    room.pet.xp += 30;
    room.pet.happiness = Math.min(100, room.pet.happiness + 8);
    room.pet.health = Math.min(100, room.pet.health + 4);

    let todayRecord = room.history.find((h) => h.date === todayStr);
    if (!todayRecord) {
      todayRecord = { date: todayStr, count: 0, cravingsResisted: 0 };
      room.history.push(todayRecord);
    }
    todayRecord.cravingsResisted += 1;

    room.cheers.unshift({
      id: `resist-${now}`,
      from: 'smoker',
      message: `Berhasil menahan rasa ingin merokok! +20 Koin Sehat & Puffi tersenyum lebar!`,
      emoji: '🌟',
      timestamp: now,
    });
  } else if (action === 'CARE') {
    const careType = payload?.type; // 'bath' | 'feed' | 'pet' | 'walk'
    room.pet.lastCaredAt = now;
    room.pet.xp += 15;
    if (careType === 'bath') {
      room.pet.lungCleanliness = Math.min(100, room.pet.lungCleanliness + 15);
      room.pet.health = Math.min(100, room.pet.health + 5);
    } else if (careType === 'feed') {
      room.pet.health = Math.min(100, room.pet.health + 10);
      room.pet.happiness = Math.min(100, room.pet.happiness + 5);
    } else if (careType === 'pet') {
      room.pet.happiness = Math.min(100, room.pet.happiness + 15);
    } else if (careType === 'walk') {
      room.pet.health = Math.min(100, room.pet.health + 8);
      room.pet.happiness = Math.min(100, room.pet.happiness + 10);
      room.pet.lungCleanliness = Math.min(100, room.pet.lungCleanliness + 8);
    }
  } else if (action === 'CUSTOMIZE') {
    if (payload?.customization) {
      room.pet.customization = {
        ...room.pet.customization,
        ...payload.customization,
      };
    }
    if (payload?.boughtItem && !room.pet.unlockedItems.includes(payload.boughtItem)) {
      if (room.pet.coins >= (payload.cost || 0)) {
        room.pet.coins -= (payload.cost || 0);
        room.pet.unlockedItems.push(payload.boughtItem);
      }
    }
  } else if (action === 'CHEER') {
    const { from, message, emoji } = payload;
    room.cheers.unshift({
      id: `c-${now}`,
      from: from || 'zahra',
      message: message || 'Tetap semangat ya!',
      emoji: emoji || '💖',
      timestamp: now,
    });
    // Zahra's cheer warms pet's heart
    room.pet.happiness = Math.min(100, room.pet.happiness + 12);
  } else if (action === 'REWARD_ADD') {
    const { title, requiredStreakDays, rewardDescription, createdBy } = payload;
    room.coupleRewards.push({
      id: `r-${now}`,
      title,
      requiredStreakDays: Number(requiredStreakDays) || 1,
      rewardDescription,
      claimed: false,
      createdBy: createdBy || 'zahra',
      createdAt: now,
    });
  } else if (action === 'REWARD_CLAIM') {
    const { rewardId } = payload;
    const r = room.coupleRewards.find((item) => item.id === rewardId);
    if (r) {
      r.claimed = true;
      room.cheers.unshift({
        id: `reward-claim-${now}`,
        from: 'zahra',
        message: `Horeee! Reward "${r.title}" berhasil diklaim bersama! Selamat sayang! 🎉`,
        emoji: '🎁',
        timestamp: now,
      });
    }
  } else if (action === 'UPDATE_SETTINGS') {
    if (payload.dailyLimit !== undefined) room.dailyLimit = Number(payload.dailyLimit);
    if (payload.costPerPack !== undefined) room.costPerPack = Number(payload.costPerPack);
    if (payload.cigsPerPack !== undefined) room.cigsPerPack = Number(payload.cigsPerPack);
    if (payload.partnerName) room.partnerName = payload.partnerName;
    if (payload.smokerName) room.smokerName = payload.smokerName;
    if (payload.petName) room.pet.name = payload.petName;
  }

  room.lastUpdated = now;
  notifyRoomSubscribers(roomId, room);
  res.json(room);
});

// Competitive Leaderboard API
app.get('/api/leaderboard', (_req, res) => {
  const leaderboardData = [
    {
      rank: 1,
      couple: 'Zahra & Rian',
      streakDays: 7,
      petLevel: 5,
      cigsAvoided: 84,
      moneySaved: 183750,
      avatarSkin: 'golden',
      badge: 'Bintang Paru Sehat',
    },
    {
      rank: 2,
      couple: 'Dina & Farhan',
      streakDays: 14,
      petLevel: 8,
      cigsAvoided: 168,
      moneySaved: 367500,
      avatarSkin: 'emerald',
      badge: 'Pahlawan Bebas Asap',
    },
    {
      rank: 3,
      couple: 'Annisa & Dimas',
      streakDays: 5,
      petLevel: 4,
      cigsAvoided: 60,
      moneySaved: 131250,
      avatarSkin: 'pink',
      badge: 'Pejuang Disiplin',
    },
    {
      rank: 4,
      couple: 'Bella & Kevin',
      streakDays: 4,
      petLevel: 3,
      cigsAvoided: 48,
      moneySaved: 105000,
      avatarSkin: 'cyan',
      badge: 'Langkah Pertama',
    },
    {
      rank: 5,
      couple: 'Putri & Yoga',
      streakDays: 3,
      petLevel: 3,
      cigsAvoided: 36,
      moneySaved: 78750,
      avatarSkin: 'purple',
      badge: 'Penjelajah Udara Segar',
    },
  ];
  res.json(leaderboardData);
});

// Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`NikoPuff full-stack server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
