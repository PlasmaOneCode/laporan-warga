import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Layout/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import StatusBadge from '@/components/Common/StatusBadge';
import CategoryBadge from '@/components/Common/CategoryBadge';
import { MapPin, Calendar, User, Phone, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import axiosInstance from '@/lib/axios';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Report {
  _id: string;
  title: string;
  description: string;
  category: string;
  status: 'open' | 'in_progress' | 'done' | 'rejected';
  images: string[];
  address: string;
  lat?: number;
  lng?: number;
  contact?: string;
  createdAt: string;
  submittedBy: {
    _id: string;
    name: string;
  };
}

const ReportDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchReport();
  }, [id]);

  const fetchReport = async () => {
    try {
      const response = await axiosInstance.get(`/reports/${id}`);
      setReport(response.data);
    } catch (error) {
      toast({
        title: 'Gagal memuat laporan',
        description: 'Laporan tidak ditemukan',
        variant: 'destructive',
      });
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setUpdating(true);
    try {
      await axiosInstance.patch(`/reports/${id}/status`, { status: newStatus });
      toast({
        title: 'Status berhasil diubah',
        description: `Status laporan diubah menjadi ${newStatus}`,
      });
      fetchReport();
    } catch (error) {
      toast({
        title: 'Gagal mengubah status',
        description: 'Terjadi kesalahan saat mengubah status',
        variant: 'destructive',
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    try {
      await axiosInstance.delete(`/reports/${id}`);
      toast({
        title: 'Laporan berhasil dihapus',
        description: 'Laporan telah dihapus dari sistem',
      });
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: 'Gagal menghapus laporan',
        description: 'Terjadi kesalahan saat menghapus laporan',
        variant: 'destructive',
      });
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % (report?.images.length || 1));
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + (report?.images.length || 1)) % (report?.images.length || 1));
  };

  const canEdit = user && (user._id === report?.submittedBy._id || user.role === 'admin');

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!report) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate('/dashboard')}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Kembali
            </Button>
            {canEdit && (
              <div className="flex gap-2">
                <Link to={`/reports/${id}/edit`}>
                  <Button variant="outline" size="sm">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                </Link>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Hapus
                </Button>
              </div>
            )}
          </div>

          {/* Image Carousel */}
          <Card className="mb-6 overflow-hidden">
            <div className="relative aspect-video bg-muted">
              {report.images.length > 0 ? (
                <>
                  <img
                    src={report.images[currentImageIndex]}
                    alt={report.title}
                    className="h-full w-full object-cover"
                  />
                  {report.images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition hover:bg-black/70"
                      >
                        <ChevronLeft className="h-6 w-6" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition hover:bg-black/70"
                      >
                        <ChevronRight className="h-6 w-6" />
                      </button>
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-sm text-white">
                        {currentImageIndex + 1} / {report.images.length}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p className="text-muted-foreground">Tidak ada gambar</p>
                </div>
              )}
            </div>
          </Card>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <div className="mb-4 flex flex-wrap gap-2">
                    <CategoryBadge category={report.category} />
                    <StatusBadge status={report.status} />
                  </div>
                  <CardTitle className="text-3xl">{report.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="mb-2 font-semibold">Deskripsi</h3>
                    <p className="whitespace-pre-wrap text-muted-foreground">{report.description}</p>
                  </div>

                  <div className="flex items-start gap-2 text-muted-foreground">
                    <MapPin className="mt-0.5 h-5 w-5 flex-shrink-0" />
                    <span>{report.address}</span>
                  </div>

                  {report.contact && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-5 w-5" />
                      <span>{report.contact}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Map (if coordinates available) */}
              {report.lat && report.lng && (
                <Card>
                  <CardHeader>
                    <CardTitle>Lokasi di Peta</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-video rounded-lg bg-muted flex items-center justify-center">
                      <p className="text-muted-foreground">
                        Peta: {report.lat}, {report.lng}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        (Integrasi Leaflet dapat ditambahkan di sini)
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Info Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Informasi</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Dilaporkan oleh</p>
                      <p className="font-medium">{report.submittedBy.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Tanggal laporan</p>
                      <p className="font-medium">
                        {format(new Date(report.createdAt), 'dd MMMM yyyy, HH:mm', { locale: idLocale })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Status Update (Admin or Owner) */}
              {canEdit && (
                <Card>
                  <CardHeader>
                    <CardTitle>Ubah Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Select
                      value={report.status}
                      onValueChange={handleStatusChange}
                      disabled={updating}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Terbuka</SelectItem>
                        <SelectItem value="in_progress">Dalam Proses</SelectItem>
                        <SelectItem value="done">Selesai</SelectItem>
                        <SelectItem value="rejected">Ditolak</SelectItem>
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Laporan?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Laporan akan dihapus secara permanen dari sistem.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ReportDetail;
