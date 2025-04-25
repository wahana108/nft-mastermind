const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const app = express();
const port = process.env.PORT || 3009;

const supabaseUrl = 'https://oqquvpjikdbjlagdlbhp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xcXV2cGppa2RiamxhZ2RsYmhwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDk1MTgwOCwiZXhwIjoyMDYwNTI3ODA4fQ.cJri-wLQcDod3J49fUKesAY2cnghU3jtlD4BiuYMelw'; // Ganti dengan service_role key dari Supabase Dashboard
const supabase = createClient(supabaseUrl, supabaseKey, { auth: { autoRefreshToken: false, persistSession: false } });

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    res.send('Registration successful! You can now use this account on other NFT platforms.');
  } catch (error) {
    console.error('Registration error:', error.message);
    res.status(400).send(error.message);
  }
});

app.get('/nft-gallery', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('nfts')
      .select('id, title, image_url, price')
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching NFT gallery:', error.message);
    res.status(500).send(error.message);
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
