// Development mock API interceptor
// Gunakan ini untuk testing tanpa backend yang real

const MOCK_ENABLED = true; // Set ke false untuk production
const STORAGE_KEY = 'mock_bahan_list';
const STORAGE_KEY_PRODUKSI = 'mock_produksi_list';
const STORAGE_KEY_SUPPLIER = 'mock_supplier_list';

// Default initial data
const DEFAULT_BAHAN = [
  {
    id: 1,
    nama: 'Jahe Emprit',
    kategori: 'Rimpang',
    satuan: 'kg',
    stokAwal: 142.5,
    hargaSatuan: 25000,
    threshold: 25,
  },
  {
    id: 2,
    nama: 'Kunyit Kuning',
    kategori: 'Rimpang',
    satuan: 'kg',
    stokAwal: 32.8,
    hargaSatuan: 20000,
    threshold: 30,
  },
  {
    id: 3,
    nama: 'Temulawak',
    kategori: 'Akar',
    satuan: 'kg',
    stokAwal: 4.2,
    hargaSatuan: 35000,
    threshold: 15,
  },
];

// Load mock data from localStorage, atau gunakan default
let mockBahanList: any[] = (() => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      console.log('[MOCK API] Loading data from localStorage');
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn('[MOCK API] Failed to load from localStorage:', error);
  }
  return DEFAULT_BAHAN;
})();

// Default mock produksi (batch)
const DEFAULT_PRODUKSI = [
  {
    id_produksi: 1,
    kode_batch: 'B-2026-001',
    nama_jamu: 'Beras Kencur',
    jenis: null,
    ukuran_batch: 25,
    volume_output: 18,
    efisiensi: 72,
    status: 'ekstraksi',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
  },
  {
    id_produksi: 2,
    kode_batch: 'B-2026-002',
    nama_jamu: 'Kunyit Asam',
    jenis: null,
    ukuran_batch: 40,
    volume_output: null,
    efisiensi: null,
    status: 'antrian',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
  },
  {
    id_produksi: 3,
    kode_batch: 'B-2026-003',
    nama_jamu: 'Temulawak',
    jenis: null,
    ukuran_batch: 30,
    volume_output: 21,
    efisiensi: 70,
    status: 'botolisasi',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
  },
  {
    id_produksi: 4,
    kode_batch: 'B-2026-004',
    nama_jamu: 'Jahe Wangi',
    jenis: null,
    ukuran_batch: 20,
    volume_output: 16,
    efisiensi: 80,
    status: 'selesai',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 52).toISOString(),
  },
];

let mockProduksiList: any[] = (() => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_PRODUKSI);
    if (stored) return JSON.parse(stored);
  } catch {
    // ignore
  }
  return DEFAULT_PRODUKSI;
})();

function saveMockProduksi() {
  try {
    localStorage.setItem(STORAGE_KEY_PRODUKSI, JSON.stringify(mockProduksiList));
  } catch {
    // ignore
  }
}

// Default mock supplier
const DEFAULT_SUPPLIER = [
  {
    id_produsen: 1,
    nama_produsen: 'UD Sari Madura',
    alamat: 'Jl. Raya Sumenep No. 10',
    kota: 'Sumenep',
    kontak: '0812-0000-0001',
    email: 'sari.madura@example.test',
    status: 'aktif',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 120).toISOString(),
  },
  {
    id_produsen: 2,
    nama_produsen: 'CV Rempah Nusantara',
    alamat: 'Jl. Pahlawan No. 21',
    kota: 'Pamekasan',
    kontak: '0812-0000-0002',
    email: 'rempah.nusantara@example.test',
    status: 'menunggu',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 35).toISOString(),
  },
  {
    id_produsen: 3,
    nama_produsen: 'PT Herbal Jaya',
    alamat: null,
    kota: 'Bangkalan',
    kontak: null,
    email: null,
    status: 'ditangguhkan',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 200).toISOString(),
  },
  {
    id_produsen: 4,
    nama_produsen: 'Koperasi Tani',
    alamat: 'Desa Aengbaja',
    kota: 'Sampang',
    kontak: '0812-0000-0004',
    email: 'koperasi.tani@example.test',
    status: 'aktif',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 80).toISOString(),
  },
];

let mockSupplierList: any[] = (() => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_SUPPLIER);
    if (stored) return JSON.parse(stored);
  } catch {
    // ignore
  }
  return DEFAULT_SUPPLIER;
})();

function saveMockSupplier() {
  try {
    localStorage.setItem(STORAGE_KEY_SUPPLIER, JSON.stringify(mockSupplierList));
  } catch {
    // ignore
  }
}

let nextId = Math.max(...mockBahanList.map(item => item.id || 0)) + 1;

// Helper function untuk save ke localStorage
function saveMockDataToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockBahanList));
    console.log('[MOCK API] Data saved to localStorage');
  } catch (error) {
    console.warn('[MOCK API] Failed to save to localStorage:', error);
  }
}

// Helper function untuk reset mock data
export function resetMockData() {
  mockBahanList = JSON.parse(JSON.stringify(DEFAULT_BAHAN));
  nextId = 4;
  saveMockDataToStorage();
  console.log('[MOCK API] Mock data reset to default');
}

export function setupMockApi() {
  if (!MOCK_ENABLED) return;

  // Override fetch untuk mock API
  const originalFetch = window.fetch;

  (window.fetch as any) = async (url: string | Request, options?: RequestInit) => {
    const urlString = typeof url === 'string' ? url : url.url;
    const method = (options?.method || 'GET').toUpperCase();
    const parsedUrl = new URL(urlString, window.location.origin);

    // Mock GET /api/bahan
    if (parsedUrl.pathname.startsWith('/api/bahan') && method === 'GET') {
      console.log('[MOCK API] GET /api/bahan');

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 300));

      const mockResponse = {
        success: true,
        message: 'Data bahan berhasil diambil',
        data: mockBahanList,
      };

      console.log('[MOCK API] Response:', mockResponse);

      return new Response(JSON.stringify(mockResponse), {
        status: 200,
        statusText: 'OK',
        headers: new Headers({ 'Content-Type': 'application/json' }),
      });
    }

    // Mock POST /api/bahan
    if (parsedUrl.pathname.startsWith('/api/bahan') && method === 'POST') {
      console.log('[MOCK API] POST /api/bahan');

      try {
        const bodyText = typeof options?.body === 'string' ? options.body : '{}';
        const body = JSON.parse(bodyText);
        console.log('[MOCK API] Request body:', body);

        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Add new item to mock list
        const newBahan = {
          id: nextId++,
          ...body,
          threshold: 10, // Default threshold
        };

        mockBahanList.push(newBahan);

        console.log('[MOCK API] Updated list:', mockBahanList);
        
        // Save to localStorage untuk persistence across refreshes
        saveMockDataToStorage();

        const mockResponse = {
          success: true,
          message: 'Bahan berhasil ditambahkan',
          data: newBahan,
        };

        console.log('[MOCK API] Response:', mockResponse);

        return new Response(JSON.stringify(mockResponse), {
          status: 201,
          statusText: 'Created',
          headers: new Headers({ 'Content-Type': 'application/json' }),
        });
      } catch (error) {
        console.error('[MOCK API] Error:', error);
        const errorResponse = {
          success: false,
          message: 'Terjadi kesalahan pada mock API',
        };
        return new Response(JSON.stringify(errorResponse), {
          status: 500,
          statusText: 'Internal Server Error',
          headers: new Headers({ 'Content-Type': 'application/json' }),
        });
      }
    }

    // Mock GET /api/produksi/metrics
    if (parsedUrl.pathname === '/api/produksi/metrics' && method === 'GET') {
      console.log('[MOCK API] GET /api/produksi/metrics');
      await new Promise((resolve) => setTimeout(resolve, 250));

      const stokKosong = mockBahanList.filter((b) => (b.stokAwal ?? 0) <= 0).length;
      const stokKritis = mockBahanList.filter((b) => {
        const stok = Number(b.stokAwal ?? 0);
        const thr = Number(b.threshold ?? 0);
        return stok <= thr;
      }).length;

      const totalBatch = mockProduksiList.length;
      const produksiSelesai = mockProduksiList.filter((b) => b.status === 'selesai').length;
      const produksiAktif = mockProduksiList.filter((b) => b.status !== 'selesai').length;

      const mockResponse = {
        success: true,
        message: 'Metrics produksi (mock)',
        data: {
          totalBatch,
          produksiAktif,
          produksiSelesai,
          stokKritis,
          stokKosong,
        },
      };

      return new Response(JSON.stringify(mockResponse), {
        status: 200,
        statusText: 'OK',
        headers: new Headers({ 'Content-Type': 'application/json' }),
      });
    }

    // Mock GET /api/produksi (list / filter)
    if (parsedUrl.pathname === '/api/produksi' && method === 'GET') {
      console.log('[MOCK API] GET /api/produksi');
      await new Promise((resolve) => setTimeout(resolve, 250));

      const status = parsedUrl.searchParams.get('status');
      const list = status ? mockProduksiList.filter((b) => b.status === status) : mockProduksiList;

      const mockResponse = {
        success: true,
        message: 'Data produksi (mock)',
        data: list,
      };

      return new Response(JSON.stringify(mockResponse), {
        status: 200,
        statusText: 'OK',
        headers: new Headers({ 'Content-Type': 'application/json' }),
      });
    }

    // Mock GET /api/supplier/metrics
    if (parsedUrl.pathname === '/api/supplier/metrics' && method === 'GET') {
      console.log('[MOCK API] GET /api/supplier/metrics');
      await new Promise((resolve) => setTimeout(resolve, 250));

      const total = mockSupplierList.length;
      const aktif = mockSupplierList.filter((s) => s.status === 'aktif').length;
      const menunggu = mockSupplierList.filter((s) => s.status === 'menunggu').length;
      const ditangguhkan = mockSupplierList.filter((s) => s.status === 'ditangguhkan').length;

      const mockResponse = {
        success: true,
        message: 'Metrics supplier (mock)',
        data: { total, aktif, menunggu, ditangguhkan },
      };

      return new Response(JSON.stringify(mockResponse), {
        status: 200,
        statusText: 'OK',
        headers: new Headers({ 'Content-Type': 'application/json' }),
      });
    }

    // Mock GET /api/supplier (list / filter)
    if (parsedUrl.pathname === '/api/supplier' && method === 'GET') {
      console.log('[MOCK API] GET /api/supplier');
      await new Promise((resolve) => setTimeout(resolve, 250));

      const status = parsedUrl.searchParams.get('status');
      const list = status ? mockSupplierList.filter((s) => s.status === status) : mockSupplierList;

      const mockResponse = {
        success: true,
        message: 'Data supplier (mock)',
        data: list,
      };

      return new Response(JSON.stringify(mockResponse), {
        status: 200,
        statusText: 'OK',
        headers: new Headers({ 'Content-Type': 'application/json' }),
      });
    }

    // Untuk API lain, gunakan fetch asli
    return originalFetch(url, options);
  };

  console.log('[MOCK API] Mock API initialized. MOCK_ENABLED:', MOCK_ENABLED);
  console.log('[MOCK API] Data persistence: localStorage enabled');
  console.log('[MOCK API] Current items:', mockBahanList.length);

  // Persist default mock data for konsistensi
  saveMockProduksi();
  saveMockSupplier();
}
