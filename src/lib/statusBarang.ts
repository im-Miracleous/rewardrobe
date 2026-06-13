// Helper terpusat untuk status BarangDonasi.
// Alur: menunggu_pengiriman -> terkirim -> tersalurkan (ditolak = opsional, barang ditolak admin).

export type StatusBarang = 'menunggu_pengiriman' | 'terkirim' | 'tersalurkan' | 'ditolak';

export const STATUS_BARANG_VALUES: StatusBarang[] = [
    'menunggu_pengiriman',
    'terkirim',
    'tersalurkan',
    'ditolak',
];

export const STATUS_BARANG_LABEL: Record<StatusBarang, string> = {
    menunggu_pengiriman: 'Menunggu Pengiriman',
    terkirim: 'Terkirim',
    tersalurkan: 'Tersalurkan',
    ditolak: 'Ditolak',
};

// Kelas warna badge (Tailwind) per status.
export const STATUS_BARANG_BADGE: Record<StatusBarang, string> = {
    menunggu_pengiriman: 'bg-amber-50 text-amber-700 border-amber-200',
    terkirim: 'bg-green-50 text-green-700 border-green-200',
    tersalurkan: 'bg-blue-50 text-blue-700 border-blue-200',
    ditolak: 'bg-red-50 text-red-700 border-red-200',
};

export function statusBarangLabel(status: string): string {
    return STATUS_BARANG_LABEL[status as StatusBarang] ?? status;
}
