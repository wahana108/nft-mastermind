console.log('script.js loaded');

const supabase = window.supabase.createClient('https://oqquvpjikdbjlagdlbhp.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xcXV2cGppa2RiamxhZ2RsYmhwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ5NTE4MDgsImV4cCI6MjA2MDUyNzgwOH0.ec28Q9VqiW2FomXESxVkiYswtWe6kJS-Vpc7W_tMsuU');

function showSection(sectionId) {
  document.querySelectorAll('.section').forEach(section => {
    section.classList.remove('active');
  });
  const activeSection = document.getElementById(sectionId);
  if (activeSection) {
    activeSection.classList.add('active');
  }
}

async function register(email, password) {
  try {
    console.log('Registering with:', email);
    const res = await fetch('/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) throw new Error(`Register failed: ${res.status}`);
    const result = await res.text();
    console.log('Registration successful:', result);
    alert('Registration successful! You can now use this account on other NFT platforms.');
    showSection('home-section');
  } catch (error) {
    console.error('Registration error:', error.message);
    alert('Registration failed: ' + error.message);
  }
}

async function loadNFTGallery() {
  try {
    const { data, error } = await supabase
      .from('nfts')
      .select('id, title, image_url')
      .order('created_at', { ascending: false });
    if (error) throw error;
    const gallery = document.getElementById('nft-gallery');
    gallery.innerHTML = '';
    data.forEach(nft => {
      gallery.innerHTML += `
        <div class="nft-card" data-nft-id="${nft.id}">
          ${nft.image_url ? `<img src="${nft.image_url}" alt="${nft.title}">` : `
            <div>
              <p>No image available</p>
              <p>Title: ${nft.title || 'Unknown NFT'}</p>
              <p>ID: ${nft.id}</p>
            </div>
          `}
        </div>
      `;
    });
  } catch (error) {
    console.error('Error loading NFT gallery:', error.message);
    document.getElementById('nft-gallery').innerHTML = `<p>Error: ${error.message}</p>`;
  }
}

async function loadNFTCatalog(searchQuery = '') {
  try {
    let query = supabase
      .from('nfts')
      .select('id, title, vendor_id, price, description, image_url, created_at, likes_count')
      .order('created_at', { ascending: false });
    if (searchQuery) {
      query = query.ilike('title', `%${searchQuery}%`);
    }
    const { data, error } = await query;
    if (error) throw error;
    const catalog = document.getElementById('nft-catalog');
    catalog.innerHTML = '';
    data.forEach(nft => {
      catalog.innerHTML += `
        <div class="nft-card">
          ${nft.image_url ? `<img src="${nft.image_url}" alt="${nft.title}">` : '<p>No image available</p>'}
          <h3>${nft.title}</h3>
          <p>ID: ${nft.id}</p>
          <p>Price: Rp${nft.price || 0}</p>
          <p>${nft.description || 'No description'}</p>
          <p>Likes: ${nft.likes_count || 0}</p>
        </div>
      `;
    });
  } catch (error) {
    console.error('Error loading NFT catalog:', error.message);
    document.getElementById('nft-catalog').innerHTML = `<p>Error: ${error.message}</p>`;
  }
}

async function loadTransactionLog(searchQuery = '') {
  try {
    let query = supabase
      .from('transactions')
      .select('id, nft_id, status, proof_url, created_at, seller_id, buyer_id, amount')
      .order('created_at', { ascending: false });
    if (searchQuery) {
      query = query.or(`nft_id.ilike.%${searchQuery}%,status.ilike.%${searchQuery}%,proof_url.ilike.%${searchQuery}%`);
    }
    const { data, error } = await query;
    if (error) throw error;
    const transactionList = document.getElementById('transaction-list');
    transactionList.innerHTML = '';
    if (data.length === 0) {
      transactionList.innerHTML = '<p>No transactions yet.</p>';
    } else {
      data.forEach(transaction => {
        transactionList.innerHTML += `
          <div class="transaction-item">
            <p>ID: ${transaction.id}</p>
            <p>NFT ID: ${transaction.nft_id}</p>
            <p>Status: ${transaction.status || 'Unknown'}</p>
            <p>Proof URL: <a href="${transaction.proof_url}" target="_blank">${transaction.proof_url}</a></p>
            <p>Created At: ${new Date(transaction.created_at).toLocaleString()}</p>
            <p>Seller ID: ${transaction.seller_id}</p>
            <p>Buyer ID: ${transaction.buyer_id}</p>
            <p>Amount: Rp${transaction.amount || 0}</p>
          </div>
        `;
      });
    }
  } catch (error) {
    console.error('Error loading transaction log:', error.message);
    document.getElementById('transaction-list').innerHTML = `<p>Error: ${error.message}</p>`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded');
  loadNFTGallery();
  document.querySelectorAll('.qa-item').forEach(item => {
    item.addEventListener('click', () => {
      item.classList.toggle('active');
    });
  });
  document.getElementById('go-to-qa-btn').addEventListener('click', () => {
    document.getElementById('qa-section').scrollIntoView({ behavior: 'smooth' });
  });
  document.getElementById('show-main-p2p-btn').addEventListener('click', () => {
    window.location.href = 'https://nft-main-bice.vercel.app/';
  });
  document.getElementById('show-home-btn').addEventListener('click', () => {
    showSection('home-section');
    loadNFTGallery();
  });
  document.getElementById('show-catalog-btn').addEventListener('click', () => {
    showSection('catalog-section');
    loadNFTCatalog();
  });
  document.getElementById('show-validations-btn').addEventListener('click', () => {
    window.location.href = 'https://nft-validations.vercel.app/';
  });
  document.getElementById('show-pooling-btn').addEventListener('click', () => {
    window.location.href = 'https://nft-charity-kappa.vercel.app/';
  });
  document.getElementById('show-recommendations-btn').addEventListener('click', () => {
    window.location.href = 'https://nft-recommendations.vercel.app/';
  });
  document.getElementById('show-transaction-log-btn').addEventListener('click', () => {
    showSection('transaction-log-section');
    loadTransactionLog();
  });
  document.getElementById('show-register-btn').addEventListener('click', () => {
    showSection('register-section');
  });
  document.getElementById('nft-search').addEventListener('input', (e) => {
    const searchQuery = e.target.value.trim();
    loadNFTCatalog(searchQuery);
  });
  document.getElementById('register-btn')?.addEventListener('click', () => {
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    register(email, password);
  });
  showSection('home-section');
});
