console.log('script.js loaded');

const supabase = window.supabase.createClient('https://jmqwuaybvruzxddsppdh.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptcXd1YXlidnJ1enhkZHNwcGRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA0MTUxNzEsImV4cCI6MjA1NTk5MTE3MX0.ldNdOrsb4BWyFRwZUqIFEbmU0SgzJxiF_Z7eGZPKZJg');
let token = localStorage.getItem('authToken') || null;

function showSection(sectionId) {
  document.querySelectorAll('.section').forEach(section => {
    section.classList.remove('active');
    const iframe = section.querySelector('iframe');
    if (iframe) iframe.style.display = 'none';
  });
  const activeSection = document.getElementById(sectionId);
  if (activeSection) {
    activeSection.classList.add('active');
    const iframe = activeSection.querySelector('iframe');
    if (iframe) iframe.style.display = 'block';
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
          <!-- Tombol "Submit for Validation" dihapus -->
        </div>
      `;
    });
  } catch (error) {
    console.error('Error loading NFT catalog:', error.message);
    document.getElementById('nft-catalog').innerHTML = `<p>Error: ${error.message}</p>`;
  }
}

async function loadTransactionLog() {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('id, nft_id, status, proof_url, created_at, seller_id, buyer_id, amount, updated_at, type')
      .order('created_at', { ascending: false });
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
            <p>Updated At: ${new Date(transaction.updated_at).toLocaleString()}</p>
            <p>Type: ${transaction.type || 'Unknown'}</p>
          </div>
        `;
      });
    }
  } catch (error) {
    console.error('Error loading transaction log:', error.message);
    document.getElementById('transaction-list').innerHTML = `<p>Error: ${error.message}</p>`;
  }
}

async function submitValidation() {
  try {
    document.getElementById('action-result').innerHTML = '';
    const nftId = document.getElementById('nft-id').value;
    const projectValue = document.getElementById('project-value').value;
    const transactionProof = document.getElementById('transaction-proof').value;

    if (!nftId || isNaN(nftId) || parseInt(nftId) <= 0) {
      throw new Error('Please enter a valid NFT ID');
    }
    if (!projectValue || isNaN(projectValue) || parseInt(projectValue) < 100000) {
      throw new Error('Please enter a valid project value (minimum Rp100,000)');
    }
    if (!transactionProof) {
      throw new Error('Please enter a transaction proof link');
    }

    const urlPattern = /^(https?:\/\/[^\s$.?#].[^\s]*)$/i;
    if (!urlPattern.test(transactionProof)) {
      throw new Error('Please enter a valid URL for the transaction proof (e.g., https://etherscan.io/tx/...)');
    }

    console.log('Submitting validation for NFT:', nftId);
    const res = await fetch('/submit-validation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ nft_id: parseInt(nftId), project_value: parseInt(projectValue), transaction_proof })
    });
    if (!res.ok) throw new Error(`Submit failed: ${res.status}`);
    const result = await res.text();
    console.log('Validation submitted:', result);
    document.getElementById('action-result').innerHTML = `<p>${result}</p>`;
  } catch (error) {
    console.error('Error submitting validation:', error.message);
    document.getElementById('action-result').innerHTML = `
      <p>Error: ${error.message}</p>
      <button onclick="document.getElementById('action-result').innerHTML = ''">Dismiss</button>
    `;
  }
}

async function confirmValidation() {
  try {
    const validationId = prompt('Enter Validation ID to confirm:');
    if (!validationId) return alert('Please enter Validation ID');
    console.log('Confirming validation for ID:', validationId);
    const res = await fetch('/confirm-validation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ validation_id: parseInt(validationId) })
    });
    if (!res.ok) throw new Error(`Confirm failed: ${res.status}`);
    const result = await res.text();
    console.log('Validation confirmed:', result);
    document.getElementById('action-result').innerHTML = `<p>${result}</p>`;
  } catch (error) {
    console.error('Error confirming validation:', error.message);
    document.getElementById('action-result').innerHTML = `<p>Error: ${error.message}</p>`;
  }
}

async function rejectValidation() {
  try {
    const validationId = prompt('Enter Validation ID to reject:');
    if (!validationId) return alert('Please enter Validation ID');
    console.log('Rejecting validation for ID:', validationId);
    const res = await fetch('/reject-validation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ validation_id: parseInt(validationId) })
    });
    if (!res.ok) throw new Error(`Reject failed: ${res.status}`);
    const result = await res.text();
    console.log('Validation rejected:', result);
    document.getElementById('action-result').innerHTML = `<p>${result}</p>`;
  } catch (error) {
    console.error('Error rejecting validation:', error.message);
    document.getElementById('action-result').innerHTML = `<p>Error: ${error.message}</p>`;
  }
}

async function revalidateProject() {
  try {
    document.getElementById('action-result').innerHTML = '';
    const validationId = prompt('Enter Validation ID to revalidate:');
    const newValidatorId = prompt('Enter New Validator ID:');
    const transactionProof = prompt('Enter Transaction Proof Link:');

    if (!validationId || isNaN(validationId) || parseInt(validationId) <= 0) {
      throw new Error('Please enter a valid Validation ID');
    }
    if (!newValidatorId) {
      throw new Error('Please enter a new Validator ID');
    }
    if (!transactionProof) {
      throw new Error('Please enter a transaction proof link');
    }

    const urlPattern = /^(https?:\/\/[^\s$.?#].[^\s]*)$/i;
    if (!urlPattern.test(transactionProof)) {
      throw new Error('Please enter a valid URL for the transaction proof (e.g., https://etherscan.io/tx/...)');
    }

    console.log('Revalidating project for ID:', validationId);
    const res = await fetch('/revalidate-project', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        validation_id: parseInt(validationId),
        new_validator_id: newValidatorId,
        transaction_proof: transactionProof
      })
    });
    if (!res.ok) throw new Error(`Revalidate failed: ${res.status}`);
    const result = await res.text();
    console.log('Revalidation submitted:', result);
    document.getElementById('action-result').innerHTML = `<p>${result}</p>`;
  } catch (error) {
    console.error('Error revalidating:', error.message);
    document.getElementById('action-result').innerHTML = `
      <p>Error: ${error.message}</p>
      <button onclick="document.getElementById('action-result').innerHTML = ''">Dismiss</button>
    `;
  }
}

async function convertValidNft() {
  try {
    const nftId = prompt('Enter NFT ID to convert:');
    if (!nftId) return alert('Please enter NFT ID');
    console.log('Converting valid NFT:', nftId);
    const res = await fetch('/convert-valid-nft', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ nft_id: parseInt(nftId) })
    });
    if (!res.ok) throw new Error(`Convert failed: ${res.status}`);
    const result = await res.text();
    console.log('NFT converted:', result);
    document.getElementById('action-result').innerHTML = `<p>${result}</p>`;
  } catch (error) {
    console.error('Error converting NFT:', error.message);
    document.getElementById('action-result').innerHTML = `<p>Error: ${error.message}</p>`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded');
  token = localStorage.getItem('authToken') || null;

  // Inisialisasi halaman depan
  loadNFTGallery();

  // Inisialisasi Q&A interaktif
  document.querySelectorAll('.qa-item').forEach(item => {
    item.addEventListener('click', () => {
      item.classList.toggle('active');
    });
  });

  // Inisialisasi pencarian NFT
  document.getElementById('nft-search').addEventListener('input', (e) => {
    loadNFTCatalog(e.target.value);
  });

  // Inisialisasi navigasi
  document.getElementById('show-home-btn').addEventListener('click', () => {
    showSection('home-section');
    document.getElementById('home-iframe').style.display = 'block';
  });
  document.getElementById('show-catalog-btn').addEventListener('click', () => {
    showSection('catalog-section');
    loadNFTCatalog();
    document.getElementById('home-iframe').style.display = 'none';
  });
  document.getElementById('show-validations-btn').addEventListener('click', () => {
    showSection('validations-section');
    document.getElementById('validations-iframe').style.display = 'block';
    document.getElementById('home-iframe').style.display = 'none';
  });
  document.getElementById('show-pooling-btn').addEventListener('click', () => {
    showSection('pooling-section');
    document.getElementById('pooling-iframe').style.display = 'block';
    document.getElementById('home-iframe').style.display = 'none';
  });
  document.getElementById('show-recommendations-btn').addEventListener('click', () => {
    showSection('recommendations-section');
    document.getElementById('recommendations-iframe').style.display = 'block';
    document.getElementById('home-iframe').style.display = 'none';
  });
  document.getElementById('show-transaction-log-btn').addEventListener('click', () => {
    showSection('transaction-log-section');
    loadTransactionLog();
  });

  // Inisialisasi tombol aksi
  const submitValidationBtn = document.getElementById('submit-validation-btn');
  if (submitValidationBtn) submitValidationBtn.addEventListener('click', submitValidation);
  const confirmValidationBtn = document.getElementById('confirm-validation-btn');
  if (confirmValidationBtn) confirmValidationBtn.addEventListener('click', confirmValidation);
  const rejectValidationBtn = document.getElementById('reject-validation-btn');
  if (rejectValidationBtn) rejectValidationBtn.addEventListener('click', rejectValidation);
  const revalidateBtn = document.getElementById('revalidate-btn');
  if (revalidateBtn) revalidateBtn.addEventListener('click', revalidateProject);
  const convertNftBtn = document.getElementById('convert-nft-btn');
  if (convertNftBtn) convertNftBtn.addEventListener('click', convertValidNft);

  // Inisialisasi status login
  if (token) {
    showSection('pool-section');
  } else {
    showSection('home-section');
  }
});