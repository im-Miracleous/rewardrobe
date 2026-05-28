"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, ArrowLeft, CheckCircle2, Database, RefreshCcw } from 'lucide-react';

type DatabaseStatus = {
  connected: boolean;
  latencyMs: number;
  userCount: number | null;
  message: string;
  checkedAt: string;
};

const POLL_INTERVAL_MS = 5000;

export default function DatabaseCheckPage() {
  const [result, setResult] = useState<DatabaseStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const statusLabel = useMemo(() => {
    if (!result) return 'Memeriksa...';
    return result.connected ? 'Connected' : 'Disconnected';
  }, [result]);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const loadStatus = async () => {
      try {
        const response = await fetch('/api/db-status', {
          method: 'GET',
          cache: 'no-store',
          signal: controller.signal,
        });

        const payload = (await response.json()) as DatabaseStatus;

        if (!isMounted) {
          return;
        }

        setResult(payload);
        setErrorMessage(null);
        setLastUpdated(new Date().toLocaleTimeString('id-ID'));
      } catch (error) {
        if (!isMounted || (error instanceof DOMException && error.name === 'AbortError')) {
          return;
        }

        setErrorMessage(error instanceof Error ? error.message : 'Gagal memeriksa status database');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadStatus();
    const intervalId = window.setInterval(loadStatus, POLL_INTERVAL_MS);

    return () => {
      isMounted = false;
      controller.abort();
      window.clearInterval(intervalId);
    };
  }, []);

  return (
    <main className="min-h-screen bg-stone-50 px-6 py-10 text-stone-800">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <Link href="/" className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-green-700 hover:text-green-800">
          <ArrowLeft size={16} /> Kembali ke beranda
        </Link>

        <section className="overflow-hidden rounded-4xl border border-stone-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <div className="grid gap-0 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="bg-linear-to-br from-green-950 via-green-800 to-[#4a7c59] p-8 text-white sm:p-10">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-semibold backdrop-blur-md">
                <Database size={16} /> Live Database Monitor
              </div>
              <h1 className="font-display text-3xl font-bold leading-tight sm:text-4xl">
                Cek koneksi PostgreSQL dan Prisma dari aplikasi.
              </h1>
              <p className="mt-4 max-w-xl text-white/75">
                Halaman ini mem-poll endpoint API secara berkala. Status dan latency akan berubah otomatis tanpa perlu refresh manual.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
                  <div className="text-sm text-white/65">Status</div>
                  <div className="mt-1 flex items-center gap-2 text-lg font-bold">
                    {result?.connected ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                    {statusLabel}
                  </div>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
                  <div className="text-sm text-white/65">Latency</div>
                  <div className="mt-1 text-lg font-bold">
                    {isLoading ? 'Checking...' : result?.latencyMs ?? '-'} ms
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 p-8 sm:p-10">
              <div className={`rounded-2xl border p-5 ${result?.connected ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'}`}>
                <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] ${result?.connected ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                  {result?.connected ? 'Database online' : 'Database offline'}
                </div>
                <div className="mt-4 text-2xl font-display font-bold text-stone-900">
                  {isLoading ? 'Memeriksa koneksi...' : result?.connected ? 'Prisma berhasil terhubung.' : 'Koneksi database terputus.'}
                </div>
                <p className="mt-3 text-sm leading-relaxed text-stone-600">
                  {isLoading
                    ? 'Menunggu respons dari endpoint API...'
                    : result?.message ?? errorMessage ?? 'Tidak ada respons dari server.'}
                </p>
              </div>

              <div className="rounded-2xl border border-stone-200 bg-stone-50 p-5">
                <div className="text-sm font-semibold text-stone-500">Tabel yang diuji</div>
                <div className="mt-2 text-4xl font-display font-bold text-stone-900">
                  {result?.userCount === null || result?.userCount === undefined ? '-' : result.userCount}
                </div>
                <div className="mt-1 text-sm text-stone-500">Jumlah baris di tabel users</div>
                <div className="mt-3 text-xs text-stone-400">Last update: {lastUpdated ?? 'belum ada'}</div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-stone-200 bg-white px-5 py-3 text-sm font-semibold text-stone-700 transition hover:border-green-200 hover:text-green-700"
                >
                  <RefreshCcw size={16} /> Refresh manual
                </button>

                <Link href="/auth" className="inline-flex items-center justify-center rounded-2xl bg-green-700 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-green-950/10 transition hover:bg-green-800">
                  Buka halaman auth
                </Link>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-stone-200 bg-white p-5">
            <div className="text-sm font-semibold text-stone-500">Cara pakai</div>
            <p className="mt-2 text-sm text-stone-600">Jalankan PostgreSQL, pastikan DATABASE_URL benar, lalu buka halaman ini. Status akan diperbarui otomatis tiap 5 detik.</p>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-white p-5">
            <div className="text-sm font-semibold text-stone-500">Jika gagal</div>
            <p className="mt-2 text-sm text-stone-600">Periksa host, port, username, password, dan pastikan database rewardrobe_db ada.</p>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-white p-5">
            <div className="text-sm font-semibold text-stone-500">Next check</div>
            <p className="mt-2 text-sm text-stone-600">Tambahkan route CRUD setelah halaman ini menunjukkan status connected.</p>
          </div>
        </div>
      </div>
    </main>
  );
}