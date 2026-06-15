/* ==========================================================================
   怪力亂神鳥嘴醫生 - 遊戲中繼伺服器 (server.js)
   用途：建立 Express 靜態託管與 Socket.io 雙向連線，轉發玩家對戰訊號
   ========================================================================== */

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 3000;

// 靜態檔案託管：將目前資料夾（包含 index.html, app.js, style.css 以及 assets）作為靜態資源釋出
app.use(express.static(path.join(__dirname, './')));

// 在記憶體中維護所有房間的狀態
// rooms: { [roomId]: { host: socketId, client: socketId, playersReady: { [socketId]: boolean } } }
const rooms = {};

// 生成唯一 6 位數房間 ID
function generateRoomId() {
    let result = '';
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 排除易混淆字元 I, O, 0, 1
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    // 若重複則重新生成
    if (rooms[result]) return generateRoomId();
    return result;
}

io.on('connection', (socket) => {
    console.log(`[連線] 玩家已連接，Socket ID: ${socket.id}`);

    // 1. 建立房間
    socket.on('create-room', (callback) => {
        const roomId = generateRoomId();
        rooms[roomId] = {
            host: socket.id,
            client: null,
            playersReady: {}
        };
        
        socket.join(roomId);
        console.log(`[房間] 玩家 ${socket.id} 建立了房間 [${roomId}]`);
        callback({ status: 'ok', roomId: roomId });
    });

    // 2. 加入房間
    socket.on('join-room', (roomId, callback) => {
        const id = roomId.trim().toUpperCase();
        const room = rooms[id];

        if (!room) {
            callback({ status: 'error', message: '找不到該房間，請確認房間代碼是否正確。' });
            return;
        }

        if (room.client) {
            callback({ status: 'error', message: '該房間人數已滿（最多 2 人）。' });
            return;
        }

        // 加入成功
        room.client = socket.id;
        socket.join(id);
        
        console.log(`[房間] 玩家 ${socket.id} 加入了房間 [${id}]`);
        callback({ status: 'ok', roomId: id, isHost: false });

        // 通知房主，對手已加入
        socket.to(room.host).emit('opponent-joined', { opponentId: socket.id });
    });

    // 3. 轉發遊戲對戰指令 (開火、判定、準備、重啟)
    socket.on('game-message', (data) => {
        const { roomId, message } = data;
        const room = rooms[roomId];
        if (!room) return;

        // 將訊息廣播轉發給房間內的其他玩家
        socket.to(roomId).emit('game-message', message);
    });

    // 4. 玩家中斷連線
    socket.on('disconnect', () => {
        console.log(`[離線] 玩家中斷連線: ${socket.id}`);
        
        // 尋找該玩家所在的房間並清除
        for (const roomId in rooms) {
            const room = rooms[roomId];
            if (room.host === socket.id || room.client === socket.id) {
                // 通知房間內另一位玩家對手已離線
                socket.to(roomId).emit('opponent-left');
                console.log(`[房間] 由於玩家 ${socket.id} 離線，關閉房間 [${roomId}]`);
                delete rooms[roomId];
                break;
            }
        }
    });
});

// 啟動伺服器
server.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`  怪力亂神鳥嘴醫生 遊戲伺服器已成功運行！`);
    console.log(`  本地網址: http://localhost:${PORT}`);
    console.log(`  同一區域網路內的玩家可透過您的 IP 位址進行連線對戰`);
    console.log(`=======================================================`);
});
