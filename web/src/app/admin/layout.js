import AdminShell from '@/components/admin/AdminShell';
import './admin.css';

export const metadata = {
  title: { absolute: 'Admin — Dar Al Najah' },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }) {
  return <AdminShell>{children}</AdminShell>;
}
