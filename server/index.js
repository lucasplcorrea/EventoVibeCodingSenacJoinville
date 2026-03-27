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
    const tableRes = await pool.query(`
      SELECT t.*, w.name as waiter_name 
      FROM tables t
      LEFT JOIN waiters w ON t.waiter_id = w.id
      WHERE t.code = $1
    `, [tableCode.toUpperCase()]);
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
      closed_at: tableRes.rows[0].closed_at,
      total_amount: tableRes.rows[0].total_amount,
      tip_amount: tableRes.rows[0].tip_amount,
      waiter: tableRes.rows[0].waiter_id ? {
        id: tableRes.rows[0].waiter_id,
        name: tableRes.rows[0].waiter_name
      } : null,
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

// REST: Waiters Management
app.get('/waiters', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM waiters ORDER BY name ASC');
    res.json(r.rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/waiters', async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });
  try {
    const r = await pool.query('INSERT INTO waiters (name) VALUES ($1) RETURNING *', [name.trim()]);
    res.json(r.rows[0]);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// REST: Create table
app.post('/tables', async (req, res) => {
  const { name, waiter_id } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });
  
  const code = name.trim().toUpperCase().replace(/\s+/g, '-').replace(/[^A-Z0-9-]/g, '');
  
  try {
    const result = await pool.query(
      'INSERT INTO tables (name, code, waiter_id) VALUES ($1, $2, $3) RETURNING code',
      [name.trim(), code, waiter_id || null]
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
      SELECT t.id, t.code, t.name, t.status, t.created_at, w.name as waiter_name, count(p.id) as people_count
      FROM tables t
      LEFT JOIN waiters w ON t.waiter_id = w.id
      LEFT JOIN participants p ON p.table_id = t.id
      WHERE t.status = 'active'
      GROUP BY t.id, w.name
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

// REST: Close Table
app.post('/tables/:code/close', async (req, res) => {
  const code = req.params.code.toUpperCase();
  const { total_amount, tip_amount } = req.body;
  try {
    const uuid = await getUUID(code);
    if (!uuid) return res.status(404).json({ error: 'Table not found' });
    
    await pool.query(
      "UPDATE tables SET status = 'closed', closed_at = NOW(), total_amount = $1, tip_amount = $2 WHERE id = $3",
      [total_amount || 0, tip_amount || 0, uuid]
    );
    
    const state = await getTableState(code);
    io.to(code).emit('table_updated', state);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// REST: Daily History
app.get('/history/today', async (req, res) => {
  try {
    const reports = await pool.query(`
      SELECT t.id, t.code, t.name, t.closed_at, t.total_amount, t.tip_amount, 
             w.name as waiter_name
      FROM tables t
      LEFT JOIN waiters w ON t.waiter_id = w.id
      WHERE t.status = 'closed' AND DATE(t.closed_at) = CURRENT_DATE
      ORDER BY t.closed_at DESC
    `);
    
    const waitersReport = await pool.query(`
      SELECT w.id, w.name, 
             COUNT(t.id) as tables_served, 
             SUM(t.total_amount) as revenue, 
             SUM(t.tip_amount) as total_tips
      FROM waiters w
      LEFT JOIN tables t ON t.waiter_id = w.id AND t.status = 'closed' AND DATE(t.closed_at) = CURRENT_DATE
      GROUP BY w.id, w.name
      ORDER BY total_tips DESC NULLS LAST
    `);
    
    res.json({
      tables: reports.rows,
      waiters: waitersReport.rows
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Sockets
io.on('connection', (socket) => {
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
