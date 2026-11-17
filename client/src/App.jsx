import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API = 'http://localhost:5000/api';

function App() {
  const [page, setPage] = useState('home'); // home, artist, music, login, signup, mypage, create
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');

  const [posts, setPosts] = useState([]);
  const [myPosts, setMyPosts] = useState([]);
  const [subEmail, setSubEmail] = useState('');

  const [authForm, setAuthForm] = useState({ username: '', password: '', nickname: '' });
  const [postForm, setPostForm] = useState({ category: '자유게시판', title: '', content: '' });
  const [editPostId, setEditPostId] = useState(null);
  const [profileForm, setProfileForm] = useState({ nickname: '', password: '' });

  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  // [JOIN 1] 전체 게시글 + 작성자 닉네임 조회
  const fetchPosts = async () => {
    const res = await axios.get(`${API}/posts`);
    setPosts(res.data);
  };

  // [JOIN 2] 마이페이지 내 정보 + 내 작성글 조회
  const fetchMyData = async () => {
    if (!token) return;
    const meRes = await axios.get(`${API}/users/me`, authHeader);
    setProfileForm({ nickname: meRes.data.nickname, password: '' });
    const myRes = await axios.get(`${API}/posts/my`, authHeader);
    setMyPosts(myRes.data);
  };

  useEffect(() => {
    fetchPosts();
    if (token) fetchMyData();
  }, [token]);

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/users/signup`, authForm);
      alert('회원가입 완료! 로그인해주세요.');
      setAuthForm({ username: '', password: '', nickname: '' });
      setPage('login');
    } catch (err) {
      alert(err.response?.data?.message || '가입 실패');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API}/users/login`, authForm);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setToken(res.data.token);
      setUser(res.data.user);
      setPage('home');
    } catch (err) {
      alert(err.response?.data?.message || '로그인 실패');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken('');
    setUser(null);
    setPage('home');
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    await axios.put(`${API}/users/me`, profileForm, authHeader);
    const updatedUser = { ...user, nickname: profileForm.nickname };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    alert('프로필이 수정되었습니다.');
    fetchPosts();
    fetchMyData();
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('정말 탈퇴하시겠습니까? 작성한 글도 모두 삭제됩니다.')) return;
    await axios.delete(`${API}/users/me`, authHeader);
    alert('탈퇴 처리되었습니다.');
    handleLogout();
    fetchPosts();
  };

  const handleSavePost = async (e) => {
    e.preventDefault();
    if (editPostId) {
      await axios.put(`${API}/posts/${editPostId}`, postForm, authHeader);
      alert('게시물이 수정되었습니다.');
    } else {
      await axios.post(`${API}/posts`, postForm, authHeader);
      alert('게시물이 등록되었습니다.');
    }
    setPostForm({ category: '자유게시판', title: '', content: '' });
    setEditPostId(null);
    setPage('home');
    fetchPosts();
    fetchMyData();
  };

  const handleDeletePost = async (id) => {
    if (!window.confirm('게시물을 삭제하시겠습니까?')) return;
    await axios.delete(`${API}/posts/${id}`, authHeader);
    fetchPosts();
    fetchMyData();
  };

  const startEdit = (post) => {
    setEditPostId(post.id);
    setPostForm({ category: post.category, title: post.title, content: post.content });
    setPage('create');
  };

  // 리센느(RESCENE) 멤버 5명 데이터 (활동명, 본명, 포지션, 사진)
  // * 원하는 실제 멤버 사진 파일이 있다면 client/public/images/ 폴더에 넣고 '/images/woni.jpg' 형태로 바꾸면 됩니다.
  const members = [
    {
      stageName: '원이 (WONI)',
      realName: '본명: 정원이 (2004.05.25)',
      role: '리더 · 보컬',
      photo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTHIy8ysxPC40q6IoZtn7EfJRpZ7p_-MIO_bOXO6ZnA-Mg3FR1MZXtl6ze_&s=10'
    },
    {
      stageName: '리브 (LIV)',
      realName: '본명: 진경은 (2006.10.11)',
      role: '보컬',
      photo: 'https://i.namu.wiki/i/DFfQg-rW38ph0MiYnDWKNpbRMh6raiaKtHq7iYUqkb_sQE6f6EtaLZNidnednYFQ6oZmU46FN7tefwu2To31vw.webp'
    },
    {
      stageName: '미나미 (MINAMI)',
      realName: '본명: 이토 미나미 (2006.11.29)',
      role: '메인보컬',
      photo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSdWkoj1oO64XTu3NqRu6J8UO0gttkggcP-lz52SpmNZQ&s=10'
    },
    {
      stageName: '메이 (MAY)',
      realName: '본명: 이예빈 (2008.08.19)',
      role: '보컬 · 댄스',
      photo: 'https://i.namu.wiki/i/AYeJjJTS6KiJ7HGxYNYrcoB8U5UB-cFG-GOmgoa6s0AbKCwzNwUbwRlaSYTha63KDEVsqpp5gf_I5TDnPJxyTw.webp'
    },
    {
      stageName: '제나 (ZENA)',
      realName: '본명: 김가영 (2008.11.27)',
      role: '보컬 · 막내',
      photo: 'https://i.namu.wiki/i/eDNiXcklY8n4DFacrPz8Cn1VDoBzjNyknlqhgZZdhL1kSV720sCo-uVHSCvf00-4EutHmXIbA31UwXzRyuvxdQ.webp'
    }
  ];

  // 리센느(RESCENE) 앨범별 음악 정보 데이터
  const discography = [
    {
      type: '미니 4집',
      title: 'PULSE',
      releaseDate: '2024.03.26',
      desc: '향기로 장면을 다시 떠올린다는 리센느의 정체성을 담은 데뷔 싱글 앨범',
      tracks: [
        { no: '01', name: 'With', isTitle: true },
        { no: '02', name: '백화요란', isTitle: false }
      ]
    },
    {
      type: '1st Mini Album',
      title: 'SCENEDROME',
      releaseDate: '2024.08.27',
      desc: '사랑에 빠진 순간의 황홀함과 청량한 무드를 담아낸 첫 번째 미니 앨범',
      tracks: [
        { no: '01', name: 'Lucky You', isTitle: false },
        { no: '02', name: 'LOVE ATTACK', isTitle: true },
        { no: '03', name: 'New World', isTitle: false },
        { no: '04', name: 'Pinball', isTitle: false }
      ]
    },
    {
      type: '2nd Mini Album',
      title: 'Glow Up',
      releaseDate: '2025.02.05',
      desc: '한층 더 성장하고 눈부시게 빛나는 리센느의 비주얼과 음악을 담은 미니 2집',
      tracks: [
        { no: '01', name: 'CRASH', isTitle: false },
        { no: '02', name: 'Glow Up', isTitle: true },
        { no: '03', name: 'Going on', isTitle: false },
        { no: '04', name: 'In my lotion', isTitle: false },
        { no: '05', name: 'Cotton Candy', isTitle: false }
      ]
    }
  ];

  return (
    <div>
      {/* 상단 네비게이션 */}
      <nav className="navbar">
        <div className="logo" onClick={() => setPage('home')}>RESCENE</div>

        <div className="nav-links">
          <button
            className={`nav-btn ${page === 'home' ? 'active' : ''}`}
            onClick={() => setPage('home')}
          >
            게시판
          </button>
          <button
            className={`nav-btn ${page === 'artist' ? 'active' : ''}`}
            onClick={() => setPage('artist')}
          >
            아티스트 정보
          </button>
          <button
            className={`nav-btn ${page === 'music' ? 'active' : ''}`}
            onClick={() => setPage('music')}
          >
            음악 정보
          </button>
        </div>

        <div className="auth-group">
          {user ? (
            <>
              <span style={{ fontSize: '13px', fontWeight: 600 }}>{user.nickname}님</span>
              <button className="btn-outline" onClick={() => { fetchMyData(); setPage('mypage'); }}>마이페이지</button>
              <button className="btn-primary" onClick={handleLogout}>로그아웃</button>
            </>
          ) : (
            <>
              <button className="btn-outline" onClick={() => setPage('login')}>로그인</button>
              <button className="btn-primary" onClick={() => setPage('signup')}>회원가입</button>
            </>
          )}
        </div>
      </nav>

      {/* 1. 메인 화면 (커뮤니티 게시판 - 핵심데이터 CRUD + JOIN 1) */}
      {page === 'home' && (
        <>
          <header className="hero">
            <p className="hero-sub">THE SCENT OF SCENE</p>
            <h1 className="hero-title">RESCENE</h1>
            <p className="hero-desc">향기로 기억되는 장면, 리센느 공식 아카이브 & 팬 커뮤니티</p>

            <form
              className="subscribe-box"
              onSubmit={(e) => {
                e.preventDefault();
                if (!subEmail) return alert('이메일을 입력하세요.');
                alert(`${subEmail} 주소로 RESCENE 뉴스레터 구독이 신청되었습니다.`);
                setSubEmail('');
              }}
            >
              <input
                type="email"
                placeholder="뉴스레터 구독 이메일 입력"
                value={subEmail}
                onChange={(e) => setSubEmail(e.target.value)}
              />
              <button type="submit" className="btn-primary">구독하기</button>
            </form>
          </header>

          <main className="container">
            <div className="section-header">
              <h2>팬 커뮤니티 게시판</h2>
              {user && (
                <button
                  className="btn-primary"
                  onClick={() => {
                    setEditPostId(null);
                    setPostForm({ category: '자유게시판', title: '', content: '' });
                    setPage('create');
                  }}
                >
                  + 새 게시물
                </button>
              )}
            </div>

            {posts.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#777777', padding: '50px 0' }}>
                등록된 게시물이 없습니다. 로그인 후 첫 게시물을 작성해보세요!
              </p>
            ) : (
              <div className="card-grid">
                {posts.map((post) => (
                  <div className="card" key={post.id}>
                    <span className="badge">{post.category}</span>
                    <h3>{post.title}</h3>
                    <p>{post.content}</p>
                    <div className="card-meta">
                      <span>작성자: {post.author_nickname}</span>
                      {user && user.id === post.user_id && (
                        <div>
                          <button className="btn-small" onClick={() => startEdit(post)}>수정</button>
                          <button className="btn-small btn-danger" onClick={() => handleDeletePost(post.id)}>삭제</button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </>
      )}

      {/* 2. 아티스트 정보 (멤버 5명 가로 5열: 사진 + 활동명 + 본명) */}
      {page === 'artist' && (
        <main className="container">
          <div className="section-header">
            <h2>아티스트 정보 — RESCENE (리센느)</h2>
            <span style={{ fontSize: '13px', color: '#555555' }}>데뷔일: 2024.03.26 | 소속사: 더뮤즈엔터테인먼트</span>
          </div>

          <div className="member-grid-5">
            {members.map((member) => (
              <div className="member-card" key={member.stageName}>
                <img src={member.photo} alt={member.stageName} className="member-photo" />
                <div className="member-info">
                  <div className="member-stage">{member.stageName}</div>
                  <div className="member-real">{member.realName}</div>
                  <span className="member-role">{member.role}</span>
                </div>
              </div>
            ))}
          </div>
        </main>
      )}

      {/* 3. 음악 정보 (앨범별 수록곡 정리) */}
      {page === 'music' && (
        <main className="container">
          <div className="section-header">
            <h2>음악 정보 — DISCOGRAPHY</h2>
            <span style={{ fontSize: '13px', color: '#555555' }}>발매 앨범 및 수록곡 리스트</span>
          </div>

          <div className="card-grid">
            {discography.map((album) => (
              <div className="card" key={album.title}>
                <span className="badge">{album.type}</span>
                <h3>{album.title}</h3>
                <p style={{ fontSize: '12px', color: '#777777', marginBottom: '8px' }}>
                  발매일: {album.releaseDate}
                </p>
                <p>{album.desc}</p>

                <ul className="track-list">
                  {album.tracks.map((t) => (
                    <li key={t.no}>
                      <span>
                        <strong>{t.no}.</strong> {t.name}
                        {t.isTitle && <span className="title-tag">TITLE</span>}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </main>
      )}

      {/* 회원가입 화면 */}
      {page === 'signup' && (
        <div className="form-box">
          <h2>회원가입</h2>
          <form onSubmit={handleSignup}>
            <input
              className="input-field"
              placeholder="아이디"
              required
              value={authForm.username}
              onChange={(e) => setAuthForm({ ...authForm, username: e.target.value })}
            />
            <input
              className="input-field"
              type="password"
              placeholder="비밀번호"
              required
              value={authForm.password}
              onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
            />
            <input
              className="input-field"
              placeholder="닉네임"
              required
              value={authForm.nickname}
              onChange={(e) => setAuthForm({ ...authForm, nickname: e.target.value })}
            />
            <button type="submit" className="btn-primary" style={{ width: '100%' }}>가입하기</button>
          </form>
        </div>
      )}

      {/* 로그인 화면 */}
      {page === 'login' && (
        <div className="form-box">
          <h2>로그인</h2>
          <form onSubmit={handleLogin}>
            <input
              className="input-field"
              placeholder="아이디"
              required
              value={authForm.username}
              onChange={(e) => setAuthForm({ ...authForm, username: e.target.value })}
            />
            <input
              className="input-field"
              type="password"
              placeholder="비밀번호"
              required
              value={authForm.password}
              onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
            />
            <button type="submit" className="btn-primary" style={{ width: '100%' }}>로그인</button>
          </form>
        </div>
      )}

      {/* 게시물 등록 / 수정 화면 */}
      {page === 'create' && (
        <div className="form-box">
          <h2>{editPostId ? '게시물 수정' : '새 게시물 작성'}</h2>
          <form onSubmit={handleSavePost}>
            <select
              className="input-field"
              value={postForm.category}
              onChange={(e) => setPostForm({ ...postForm, category: e.target.value })}
            >
              <option value="자유게시판">자유게시판</option>
              <option value="앨범리뷰">앨범리뷰</option>
              <option value="응원메시지">응원메시지</option>
            </select>
            <input
              className="input-field"
              placeholder="제목을 입력하세요"
              required
              value={postForm.title}
              onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
            />
            <textarea
              className="input-field"
              rows="5"
              placeholder="내용을 입력하세요"
              required
              value={postForm.content}
              onChange={(e) => setPostForm({ ...postForm, content: e.target.value })}
            />
            <button type="submit" className="btn-primary" style={{ width: '100%' }}>
              {editPostId ? '수정 완료' : '등록하기'}
            </button>
          </form>
        </div>
      )}

      {/* 마이페이지 (회원 수정/탈퇴 + 내 글 JOIN 2 조회) */}
      {page === 'mypage' && user && (
        <div className="container">
          <div className="form-box" style={{ marginTop: 0 }}>
            <h2>마이페이지 (프로필 관리)</h2>
            <p style={{ fontSize: '13px', color: '#555555', marginBottom: '14px' }}>아이디: {user.username}</p>
            <form onSubmit={handleUpdateProfile}>
              <input
                className="input-field"
                placeholder="새 닉네임"
                required
                value={profileForm.nickname}
                onChange={(e) => setProfileForm({ ...profileForm, nickname: e.target.value })}
              />
              <input
                className="input-field"
                type="password"
                placeholder="새 비밀번호 (변경 시에만 입력)"
                value={profileForm.password}
                onChange={(e) => setProfileForm({ ...profileForm, password: e.target.value })}
              />
              <button type="submit" className="btn-primary" style={{ width: '100%', marginBottom: '10px' }}>
                프로필 수정
              </button>
            </form>
            <button
              onClick={handleDeleteAccount}
              className="btn-small btn-danger"
              style={{ width: '100%', padding: '10px', marginLeft: 0 }}
            >
              회원 탈퇴
            </button>
          </div>

          <div className="section-header">
            <h3>내가 작성한 게시물</h3>
          </div>
          <div className="card-grid">
            {myPosts.map((post) => (
              <div className="card" key={post.id}>
                <span className="badge">{post.category}</span>
                <h3>{post.title}</h3>
                <p>{post.content}</p>
                <div className="card-meta">
                  <span>작성자: {post.nickname}</span>
                  <div>
                    <button className="btn-small" onClick={() => startEdit(post)}>수정</button>
                    <button className="btn-small btn-danger" onClick={() => handleDeletePost(post.id)}>삭제</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <footer className="footer">
        © 2026 RESCENE OFFICIAL ARCHIVE PROJECT. ALL RIGHTS RESERVED.
      </footer>
    </div>
  );
}

export default App;