import ProfileSettingsTemplate from '@/components/dashboard/ProfileSettingsTemplate';

export default function AdminProfilePage() {
    return (
        <div className="p-8">
            <ProfileSettingsTemplate role="Admin" />
        </div>
    );
}
