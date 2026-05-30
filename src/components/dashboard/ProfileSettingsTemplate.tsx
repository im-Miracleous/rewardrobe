'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface ProfileSettingsTemplateProps {
    role: 'Admin' | 'Donatur' | 'Penerima';
}

export default function ProfileSettingsTemplate({ role }: ProfileSettingsTemplateProps) {
    const [isEditing, setIsEditing] = useState(false);

    const [formData, setFormData] = useState({
        name: `John Doe (${role})`,
        email: 'johndoe@example.com',
        phone: '081234567890',
        currentPassword: '',
        newPassword: '',
    });

    const [avatarUrl, setAvatarUrl] = useState(`https://api.dicebear.com/7.x/notionists/svg?seed=John Doe (${role})`);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState('');

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    setAvatarUrl(event.target.result as string);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Here you would typically send the data to your backend
        console.log('Saved profile:', formData);
        setIsEditing(false);
    };

    return (
        <div className="space-y-8 max-w-4xl">
            <div>
                <h1 className="text-3xl font-bold text-stone-800 font-display">Profil & Pengaturan</h1>
                <p className="text-stone-500 mt-2">Kelola informasi profil dan pengaturan keamanan akun Anda.</p>
            </div>

            <div className="bg-white rounded-2xl border border-stone-100 p-8 shadow-sm">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                    {/* Profile Picture Section */}
                    <div className="flex flex-col items-center gap-4 w-full md:w-1/3">
                        <div className="w-32 h-32 rounded-full bg-green-100 border-4 border-white shadow-lg overflow-hidden relative group">
                            <img
                                src={avatarUrl}
                                alt="Profile Avatar"
                                className="w-full h-full object-cover"
                            />
                            {isEditing && (
                                <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                    <span className="text-white text-xs font-semibold">Ubah Foto</span>
                                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                                </label>
                            )}
                        </div>
                        <div className="text-center">
                            <h3 className="font-bold text-stone-800 text-lg">{formData.name}</h3>
                            <p className="text-sm text-stone-500">{role} Akun</p>
                        </div>
                    </div>

                    {/* Form Section */}
                    <div className="w-full md:w-2/3">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-stone-800 border-b border-stone-100 pb-2">Informasi Dasar</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input
                                        label="Nama Lengkap"
                                        id="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                    />
                                    <Input
                                        label="Nomor Telepon"
                                        id="phone"
                                        type="tel"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                    />
                                    <div className="md:col-span-2">
                                        <Input
                                            label="Alamat Email"
                                            id="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                        />
                                    </div>
                                </div>
                            </div>

                            {isEditing && (
                                <div className="space-y-4 pt-4">
                                    <h3 className="text-lg font-bold text-stone-800 border-b border-stone-100 pb-2">Keamanan (Opsional)</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Input
                                            label="Password Saat Ini"
                                            id="currentPassword"
                                            type="password"
                                            placeholder="Masukkan untuk mengubah"
                                            value={formData.currentPassword}
                                            onChange={handleChange}
                                        />
                                        <Input
                                            label="Password Baru"
                                            id="newPassword"
                                            type="password"
                                            placeholder="Kosongkan jika tidak diubah"
                                            value={formData.newPassword}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    {/* Zona Bahaya */}
                                    <div className="mt-8 bg-red-50 rounded-2xl border border-red-100 p-6 shadow-sm">
                                        <h4 className="text-md font-bold text-red-800 mb-2">Zona Bahaya (Hapus Akun)</h4>
                                        <p className="text-sm text-red-600 mb-4">
                                            Penghapusan akun bersifat permanen dan tidak dapat dibatalkan. Semua data, pengaturan, dan riwayat donasi Anda akan dihapus selamanya.
                                        </p>
                                        <Button type="button" variant="danger" onClick={() => setIsDeleteModalOpen(true)}>Hapus Akun</Button>
                                    </div>
                                </div>
                            )}

                            <div className="pt-6 flex gap-4 justify-end">
                                {isEditing ? (
                                    <>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            onClick={() => setIsEditing(false)}
                                        >
                                            Batal
                                        </Button>
                                        <Button type="submit" variant="primary">
                                            Simpan Perubahan
                                        </Button>
                                    </>
                                ) : (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsEditing(true)}
                                    >
                                        Edit Profil
                                    </Button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Modal Konfirmasi Hapus Akun */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-6 shadow-2xl transform transition-all">
                        <div>
                            <h3 className="text-xl font-bold text-stone-900 mb-2">Konfirmasi Hapus Akun</h3>
                            <p className="text-sm text-stone-600">
                                Tindakan ini sangat fatal dan tidak dapat dibatalkan. Untuk mengonfirmasi penghapusan akun Anda, silakan ketik <strong className="text-red-600 select-none">HAPUS AKUN</strong> pada kolom di bawah ini.
                            </p>
                        </div>
                        <Input
                            placeholder="Ketik HAPUS AKUN"
                            value={deleteConfirmation}
                            onChange={(e) => setDeleteConfirmation(e.target.value)}
                        />
                        <div className="flex gap-3 justify-end pt-2">
                            <Button
                                variant="ghost"
                                onClick={() => { setIsDeleteModalOpen(false); setDeleteConfirmation(''); }}
                            >
                                Batal
                            </Button>
                            <Button
                                variant="danger"
                                className={deleteConfirmation !== 'HAPUS AKUN' ? 'grayscale opacity-70 hover:!bg-red-500 cursor-not-allowed' : ''}
                                onClick={() => {
                                    if (deleteConfirmation !== 'HAPUS AKUN') {
                                        alert('Verifikasi gagal! Pastikan Anda telah mengetik "HAPUS AKUN" dengan benar (kapital semua).');
                                    } else {
                                        alert('Akun telah dihapus secara permanen.');
                                        setIsDeleteModalOpen(false);
                                        // Normally you would handle logout/redirect here
                                    }
                                }}
                            >
                                Hapus Permanen
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
