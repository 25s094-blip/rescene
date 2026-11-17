const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('./db');

const app = express();
const SECRET_KEY = 'rescene_secret_key';

app.use(cors());
app.use(express.json());

// 인증 미들웨어
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: '로그인이 필요합니다.' });
  try {
    req.user = jwt.verify(token, SECRET_KEY);
    next();
  } catch {
    res.status(401).json({ message: '유효하지 않은 토큰입니다.' });
  }
};

// ================= [1. 회원 관리 CRUD] =================

// Create: 회원가입 (bcrypt 암호화)
app.post('/api/users/signup', async (req, res) => {
  try {
    const { username, password, nickname } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO users (username, password, nickname) VALUES (?, ?, ?)',
      [username, hashed, nickname]
    );
    res.json({ message: '회원가입 완료' });
  } catch (err) {
    res.status(400).json({ message: '이미 존재하는 아이디이거나 입력 오류입니다.' });
  }
});

// Read: 로그인
app.post('/api/users/login', async (req, res) => {
  const { username, password } = req.body;
  const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
  if (rows.length === 0) return res.status(400).json({ message: '아이디가 없습니다.' });

  const user = rows[0];
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ message: '비밀번호가 틀렸습니다.' });

  const token = jwt.sign({ id: user.id, username: user.username, nickname: user.nickname }, SECRET_KEY);
  res.json({ token, user: { id: user.id, username: user.username, nickname: user.nickname } });
});

// Read: 마이페이지 프로필 조회
app.get('/api/users/me', auth, async (req, res) => {
  const [rows] = await pool.query('SELECT id, username, nickname, created_at FROM users WHERE id = ?', [req.user.id]);
  res.json(rows[0]);
});

// Update: 마이페이지 프로필 수정
app.put('/api/users/me', auth, async (req, res) => {
  const { nickname, password } = req.body;
  if (password) {
    const hashed = await bcrypt.hash(password, 10);
    await pool.query('UPDATE users SET nickname = ?, password = ? WHERE id = ?', [nickname, hashed, req.user.id]);
  } else {
    await pool.query('UPDATE users SET nickname = ? WHERE id = ?', [nickname, req.user.id]);
  }
  res.json({ message: '회원정보가 수정되었습니다.' });
});

// Delete: 회원 탈퇴
app.delete('/api/users/me', auth, async (req, res) => {
  await pool.query('DELETE FROM users WHERE id = ?', [req.user.id]);
  res.json({ message: '회원 탈퇴가 완료되었습니다.' });
});

// ================= [2. 핵심 데이터 CRUD + JOIN 2개] =================

// Create: 게시글 등록
app.post('/api/posts', auth, async (req, res) => {
  const { category, title, content, image_url } = req.body;
  await pool.query(
    'INSERT INTO posts (user_id, category, title, content, image_url) VALUES (?, ?, ?, ?, ?)',
    [req.user.id, category || 'FAN', title, content, image_url || '']
  );
  res.json({ message: '등록되었습니다.' });
});

// Read (JOIN 1): 전체 목록 조회 (posts + users JOIN)
app.get('/api/posts', async (req, res) => {
  const [rows] = await pool.query(`
    SELECT p.*, u.nickname AS author_nickname, u.username AS author_username
    FROM posts p
    JOIN users u ON p.user_id = u.id
    ORDER BY p.id DESC
  `);
  res.json(rows);
});

// Read (JOIN 2): 마이페이지 내 작성글 조회 (users + posts JOIN)
app.get('/api/posts/my', auth, async (req, res) => {
  const [rows] = await pool.query(`
    SELECT p.id, p.category, p.title, p.content, p.created_at, u.nickname
    FROM users u
    JOIN posts p ON u.id = p.user_id
    WHERE u.id = ?
    ORDER BY p.id DESC
  `, [req.user.id]);
  res.json(rows);
});

// Update: 본인 작성 데이터 수정
app.put('/api/posts/:id', auth, async (req, res) => {
  const { category, title, content } = req.body;
  const [result] = await pool.query(
    'UPDATE posts SET category = ?, title = ?, content = ? WHERE id = ? AND user_id = ?',
    [category, title, content, req.params.id, req.user.id]
  );
  if (result.affectedRows === 0) return res.status(403).json({ message: '본인 글만 수정할 수 있습니다.' });
  res.json({ message: '수정되었습니다.' });
});

// Delete: 본인 작성 데이터 삭제
app.delete('/api/posts/:id', auth, async (req, res) => {
  const [result] = await pool.query(
    'DELETE FROM posts WHERE id = ? AND user_id = ?',
    [req.params.id, req.user.id]
  );
  if (result.affectedRows === 0) return res.status(403).json({ message: '본인 글만 삭제할 수 있습니다.' });
  res.json({ message: '삭제되었습니다.' });
});

app.listen(5000, () => console.log('RESCENE Server running on http://localhost:5000'));