    // opening post pop up
    const modal = document.getElementById('createModal');
    const overlay = document.getElementById('modalOverlay');
    const fab = document.getElementById('fab');
    const closeBtn = document.getElementById('modalClose');
    const textarea = document.getElementById('postText');

    function openModal() {
      modal.classList.add('open');
      modal.setAttribute('aria-hidden','false');
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
      setTimeout(() => textarea.focus(), 80);
    }
    function closeModal() {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden','true');
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      fab.focus();
    }

    fab.addEventListener('click', openModal);
    fab.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(); }});
    overlay.addEventListener('click', closeModal);
    closeBtn.addEventListener('click', closeModal);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modal.classList.contains('open')) closeModal(); });





// Simple client-side feed with persistence (localStorage)
    const STORAGE_KEY = 'simple_feed_posts_v1';

    function nowISO(){ return new Date().toISOString(); }

    function loadPosts(){
      try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      } catch(e){ return []; }
    }

    function savePosts(list){
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    }

    // sample name/avatar generator
    function randomUser(){
      return {
        name: 'You',
        avatarText: 'Y'
      };
    }

    // format time as xx.xx.xxxx
    function formatTimestamp(iso){
      const d = new Date(iso);
 
      const diff = Date.now() - d.getTime();
      if (diff < 60_000) return Math.floor(diff/1000) + 's';
      if (diff < 3_600_000) return Math.floor(diff/60000) + 'm';
      if (diff < 86_400_000) {
        // show hours and minutes(24-hour)
        const hh = String(d.getHours()).padStart(2,'0');
        const mm = String(d.getMinutes()).padStart(2,'0');
        return `${hh}:${mm}`;
      }
      // show short date
      return d.toLocaleDateString();
    }

    // create DOM for a post object
    function createPostElement(post){
      const el = document.createElement('div');
      el.className = 'post';
      el.dataset.id = post.id;

      el.innerHTML = `
        <div class="meta">
          <div class="avatar">${post.user.avatarText}</div>
          <div>
            <div class="name">${escapeHtml(post.user.name)}</div>
            <div class="time">${formatTimestamp(post.createdAt)}</div>
          </div>
        </div>
        <div class="content">${escapeHtml(post.text)}</div>
        ${post.image ? `<img src="${escapeHtml(post.image)}" alt="post image" onerror="this.style.display='none'">` : ''}
        <div class="actions">
          <button class="action-btn like-btn ${post.liked ? 'liked' : ''}">👍 <span class="like-count">${post.likes}</span></button>
          <button class="action-btn comment-toggle">💬 ${post.comments.length}</button>
          <button class="action-btn delete-btn" style="margin-left:auto;color:#ff4d4f">Delete</button>
        </div>

        <div class="comments" style="display:none">
          <div class="comment-list">
            ${post.comments.map(c => `<div class="comment"><strong>${escapeHtml(c.user)}</strong>${escapeHtml(c.text)}</div>`).join('')}
          </div>
          <div class="comment-form">
            <input class="comment-input" placeholder="Write a comment...">
            <button class="btn comment-send">Send</button>
          </div>
        </div>
      `;

      return el;
    }

    // sanitize very simply
    function escapeHtml(s=''){
      return String(s)
        .replaceAll('&','&amp;')
        .replaceAll('<','&lt;')
        .replaceAll('>','&gt;')
        .replaceAll('"','&quot;')
        .replaceAll("'",'&#39;');
    }

    // render feed (prepend newest first)
    function renderFeed(){
      const feed = document.getElementById('feed');
      feed.innerHTML = '';
      const posts = loadPosts();
      // newest first
      posts.slice().reverse().forEach(p => feed.appendChild(createPostElement(p)));
    }

    // post actions: like, comment, toggle, delete handled by event delegation
    document.getElementById('feed').addEventListener('click', (e) => {
      const postEl = e.target.closest('.post');
      if (!postEl) return;
      const id = postEl.dataset.id;
      const posts = loadPosts();
      const idx = posts.findIndex(x => x.id === id);
      if (idx === -1) return;

      if (e.target.closest('.like-btn')){
        // toggle like
        posts[idx].liked = !posts[idx].liked;
        posts[idx].likes += posts[idx].liked ? 1 : -1;
        savePosts(posts);
        renderFeed();
      } else if (e.target.closest('.comment-toggle')){
        const commentsBox = postEl.querySelector('.comments');
        commentsBox.style.display = commentsBox.style.display === 'none' ? 'block' : 'none';
      } else if (e.target.closest('.delete-btn')){
        if (!confirm('Delete this post?')) return;
        posts.splice(idx,1);
        savePosts(posts);
        renderFeed();
      } else if (e.target.closest('.comment-send')){
        // send a comment inside that post element
        const input = postEl.querySelector('.comment-input');
        const text = input.value.trim();
        if (!text) return;
        posts[idx].comments.push({ user: 'You', text, createdAt: nowISO() });
        savePosts(posts);
        renderFeed();
      }
    });

    // Publish new post
    document.getElementById('publishBtn').addEventListener('click', () => {
      const text = document.getElementById('postText').value.trim();
      const img = document.getElementById('postImage').value.trim();
      if (!text && !img) {
        alert('Add text or an image URL first.');
        return;
      }

      const posts = loadPosts();

      const newPost = {
        id: 'p_' + Date.now() + '_' + Math.random().toString(36).slice(2,8),
        user: randomUser(),
        text,
        image: img || '',
        likes: 0,
        liked: false,
        comments: [],
        createdAt: nowISO()
      };

      posts.push(newPost); // push to end; render uses reverse to show newest first
      savePosts(posts);

      // clear input
      document.getElementById('postText').value = '';
      document.getElementById('postImage').value = '';
      renderFeed();

      // scroll feed to top to see new post
      const feed = document.getElementById('feed');
      feed.scrollTop = 0;
    });

    document.getElementById('clearBtn').addEventListener('click', () => {
      document.getElementById('postText').value = '';
      document.getElementById('postImage').value = '';
    });

    // initial render
    renderFeed();
