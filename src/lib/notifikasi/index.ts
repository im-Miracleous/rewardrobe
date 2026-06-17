import { Prisma } from '@prisma/client';

export type StatusEvent = 
    | { type: 'BARANG_TERKIRIM'; userId: number; barangJudul: string }
    | { type: 'BARANG_TERSALURKAN'; userId: number; barangJudul: string }
    | { type: 'PERMINTAAN_DITERIMA'; userId: number; barangJudul: string }
    | { type: 'PERMINTAAN_DITOLAK'; userId: number; barangJudul: string };

type Observer = (tx: Prisma.TransactionClient, event: StatusEvent) => Promise<void>;

class NotificationSubject {
    private observers: Observer[] = [];

    subscribe(observer: Observer) {
        this.observers.push(observer);
    }

    async emitStatusEvent(tx: Prisma.TransactionClient, event: StatusEvent) {
        for (const obs of this.observers) {
            await obs(tx, event);
        }
    }
}

export const notificationSubject = new NotificationSubject();

// Database Notification Observer
const databaseNotificationObserver: Observer = async (tx, event) => {
    let judul = '';
    let pesan = '';

    switch (event.type) {
        case 'BARANG_TERKIRIM':
            judul = 'Barang Anda Diterima';
            pesan = `Barang donasi "${event.barangJudul}" telah sampai di gudang kami.`;
            break;
        case 'BARANG_TERSALURKAN':
            judul = 'Barang Anda Tersalurkan';
            pesan = `Barang donasi "${event.barangJudul}" telah berhasil disalurkan kepada penerima.`;
            break;
        case 'PERMINTAAN_DITERIMA':
            judul = 'Permintaan Diterima';
            pesan = `Permintaan Anda untuk barang "${event.barangJudul}" telah disetujui.`;
            break;
        case 'PERMINTAAN_DITOLAK':
            judul = 'Permintaan Ditolak';
            pesan = `Maaf, permintaan Anda untuk barang "${event.barangJudul}" ditolak.`;
            break;
    }

    await tx.notifikasi.create({
        data: {
            user_id: event.userId,
            judul,
            pesan,
        }
    });
};

// Register observer
notificationSubject.subscribe(databaseNotificationObserver);
