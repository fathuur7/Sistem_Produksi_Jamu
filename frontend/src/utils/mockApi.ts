// Development mock API interceptor
// Gunakan ini untuk testing tanpa backend yang real

const MOCK_ENABLED = true; // Set ke false untuk production

// In-memory storage untuk mock data
let mockBahanList: any[] = [
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

let nextId = 4;

export function setupMockApi() {
  if (!MOCK_ENABLED) return;

  // Override fetch untuk mock API
  const originalFetch = window.fetch;

  window.fetch = async (url: string | Request, options?: RequestInit) => {
    const urlString = typeof url === 'string' ? url : url.url;

    // Mock GET /api/bahan
    if (urlString.includes('/api/bahan') && (!options?.method || options?.method === 'GET')) {
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
    if (urlString.includes('/api/bahan') && options?.method === 'POST') {
      console.log('[MOCK API] POST /api/bahan');

      try {
        const body = JSON.parse(options.body as string);
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

    // Untuk API lain, gunakan fetch asli
    return originalFetch(url, options);
  };

  console.log('[MOCK API] Mock API initialized. MOCK_ENABLED:', MOCK_ENABLED);
}
