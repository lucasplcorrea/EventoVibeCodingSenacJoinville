import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function getTableState(tableCode) {
  try {
    const tableRes = await pool.query('SELECT * FROM tables WHERE code = $1', [tableCode.toUpperCase()]);
    if (tableRes.rows.length === 0) return null;
    
    const tableId = tableRes.rows[0].id;

    const peopleRes = await pool.query('SELECT * FROM participants WHERE table_id = $1 ORDER BY name ASC', [tableId]);
    const itemsRes = await pool.query('SELECT * FROM items WHERE table_id = $1 ORDER BY name ASC', [tableId]);
    const sharesRes = await pool.query(`
      SELECT s.item_id, s.participant_id 
      FROM item_shares s
      JOIN items i ON s.item_id = i.id
      WHERE i.table_id = $1
    `, [tableId]);

    const items = itemsRes.rows.map(item => {
      return {
        ...item,
        price: parseFloat(item.price),
        sharedBy: sharesRes.rows
          .filter(s => s.item_id === item.id)
          .map(s => s.participant_id)
      };
    });

    return {
      id: tableRes.rows[0].id,
      code: tableRes.rows[0].code,
      name: tableRes.rows[0].name,
      status: tableRes.rows[0].status,
      people: peopleRes.rows,
      consumedItems: items
    };
  } catch (err) {
    return null;
  }
}

async function getUUID(code) {
  if(!code) return null;
  const r = await pool.query('SELECT id FROM tables WHERE code = $1', [code.toUpperCase()]);
  return r.rows[0]?.id;
}

// REST: Create table
app.post('/tables', async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });
  
  // Format code from name to be URL-friendly uppercase string
  const code = name.trim().toUpperCase().replace(/\s+/g, '-').replace(/[^A-Z0-9-]/g, '');
  
  try {
    const result = await pool.query(
      'INSERT INTO tables (name, code) VALUES ($1, $2) RETURNING code',
      [name.trim(), code]
    );
    res.json({ id: result.rows[0].code });
  } catch (e) {
    if (e.code === '23505') {
       res.status(400).json({ error: 'Já existe uma mesa com esse nome ou código. Escolha outro!' });
    } else {
       res.status(500).json({ error: e.message });
    }
  }
});

// REST: Get all active tables
app.get('/tables', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT t.id, t.code, t.name, t.status, t.created_at, count(p.id) as people_count
      FROM tables t
      LEFT JOIN participants p ON p.table_id = t.id
      WHERE t.status = 'active'
      GROUP BY t.id
      ORDER BY t.created_at DESC
    `);
    res.json(result.rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/tables/:code', async (req, res) => {
  try {
    const state = await getTableState(req.params.code);
    if (!state) return res.status(404).json({ error: 'Not found' });
    res.json(state);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Sockets
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_table', async (tableCode) => {
    if(!tableCode) return;
    socket.join(tableCode.toUpperCase());
  });

  const broadcastState = async (tableCode) => {
    if(!tableCode) return;
    const state = await getTableState(tableCode);
    if (state) io.to(tableCode.toUpperCase()).emit('table_updated', state);
  };

  socket.on('add_person', async ({ tableId: code, name, color }) => {
    try {
      const uuid = await getUUID(code);
      if(!uuid) return;
      await pool.query(
        'INSERT INTO participants (table_id, name, color) VALUES ($1, $2, $3)',
        [uuid, name, color]
      );
      await broadcastState(code);
    } catch(e) { console.error(e) }
  });

  socket.on('remove_person', async ({ tableId: code, participantId }) => {
    try {
      await pool.query('DELETE FROM participants WHERE id = $1', [participantId]);
      await broadcastState(code);
    } catch(e) { console.error(e) }
  });

  socket.on('add_item', async ({ tableId: code, name, price }) => {
    try {
      const uuid = await getUUID(code);
      if(!uuid) return;
      await pool.query(
        'INSERT INTO items (table_id, name, price) VALUES ($1, $2, $3)',
        [uuid, name, price]
      );
      await broadcastState(code);
    } catch(e) { console.error(e) }
  });

  socket.on('remove_item', async ({ tableId: code, itemId }) => {
    try {
      await pool.query('DELETE FROM items WHERE id = $1', [itemId]);
      await broadcastState(code);
    } catch(e) { console.error(e) }
  });

  socket.on('toggle_share', async ({ tableId: code, itemId, participantId }) => {
    try {
      const res = await pool.query(
        'SELECT * FROM item_shares WHERE item_id = $1 AND participant_id = $2',
        [itemId, participantId]
      );
      
      if (res.rows.length > 0) {
        await pool.query(
          'DELETE FROM item_shares WHERE item_id = $1 AND participant_id = $2',
          [itemId, participantId]
        );
      } else {
        await pool.query(
          'INSERT INTO item_shares (item_id, participant_id) VALUES ($1, $2)',
          [itemId, participantId]
        );
      }
      await broadcastState(code);
    } catch(e) { console.error(e) }
  });
});

const port = process.env.PORT || 3000;
server.listen(port, '0.0.0.0', () => {
  console.log(`Backend server running on port ${port} (0.0.0.0)`);
});
