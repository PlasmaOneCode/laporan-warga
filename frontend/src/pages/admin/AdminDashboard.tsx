import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Layout/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import StatusBadge from '@/components/Common/StatusBadge';
import CategoryBadge from '@/components/Common/CategoryBadge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, TrendingUp, Clock, CheckCircle2, Trash2, Eye, Lightbulb, Construction, Trash, Squirrel } from 'lucide-react';
import axiosInstance from '@/lib/axios';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

interface Stats {
  open: number;
  in_progress: number;
  done: number;
  rejected: number;
  total: number;
  byCategory: Record<string, number>;
}

interface Report {
  _id: string;
  title: string;
  category: string;
  status: 'open' | 'in_progress' | 'done' | 'rejected';
  address: string;
  createdAt: string;
  submittedBy: {
    name: string;
  };
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats>({
    open: 0,
    in_progress: 0,
    done: 0,
    rejected: 0,
    total: 0,
    byCategory: {},
  });
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, reportsRes] = await Promise.all([
        axiosInstance.get('/reports/stats'),
        axiosInstance.get('/reports?limit=20'),
      ]);
      
      setStats(statsRes.data || {
        open: 0,
        in_progress: 0,
        done: 0,
        rejected: 0,
        total: 0,
        byCategory: {},
      });
      setReports(reportsRes.data.data || []);
    } catch (error) {
      toast({
        title: 'Gagal memuat data',
        description: 'Terjadi kesalahan saat memuat data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (reportId: string, newStatus: string) => {
    setUpdating(reportId);
    try {
      await axiosInstance.patch(`/reports/${reportId}/status`, { status: newStatus });
      toast({
        title: 'Status berhasil diubah',
        description: 'Status laporan telah diperbarui',
      });
      fetchData();
    } catch (error) {
      toast({
        title: 'Gagal mengubah status',
        description: 'Terjadi kesalahan saat mengubah status',
        variant: 'destructive',
      });
    } finally {
      setUpdating(null);
    }
  };

  const handleDelete = async (reportId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus laporan ini?')) return;

    try {
      await axiosInstance.delete(`/reports/${reportId}`);
      toast({
        title: 'Laporan berhasil dihapus',
        description: 'Laporan telah dihapus dari sistem',
      });
      fetchData();
    } catch (error) {
      toast({
        title: 'Gagal menghapus laporan',
        description: 'Terjadi kesalahan saat menghapus laporan',
        variant: 'destructive',
      });
    }
  };

  const categoryIcons: Record<string, any> = {
    lampu_mati: Lightbulb,
    jalan_berlubang: Construction,
    sampah: Trash,
    hewan_liar: Squirrel,
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">Kelola dan pantau semua laporan warga</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Laporan</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total}</div>
                  <p className="text-xs text-muted-foreground">Semua laporan</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Terbuka</CardTitle>
                  <TrendingUp className="h-4 w-4 text-info" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-info">{stats.open}</div>
                  <p className="text-xs text-muted-foreground">Belum ditangani</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Dalam Proses</CardTitle>
                  <Clock className="h-4 w-4 text-warning" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-warning">{stats.in_progress}</div>
                  <p className="text-xs text-muted-foreground">Sedang ditangani</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Selesai</CardTitle>
                  <CheckCircle2 className="h-4 w-4 text-success" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-success">{stats.done}</div>
                  <p className="text-xs text-muted-foreground">Telah diselesaikan</p>
                </CardContent>
              </Card>
            </div>

            {/* Category Stats */}
            {Object.keys(stats.byCategory).length > 0 && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Laporan per Kategori</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {Object.entries(stats.byCategory).map(([category, count]) => {
                      const Icon = categoryIcons[category] || FileText;
                      return (
                        <div key={category} className="flex items-center gap-3 rounded-lg border border-border p-4">
                          <Icon className="h-8 w-8 text-primary" />
                          <div>
                            <p className="text-2xl font-bold">{count}</p>
                            <CategoryBadge category={category} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reports Table */}
            <Card>
              <CardHeader>
                <CardTitle>Laporan Terbaru</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reports.length === 0 ? (
                    <p className="py-8 text-center text-muted-foreground">Belum ada laporan</p>
                  ) : (
                    reports.map((report) => (
                      <div
                        key={report._id}
                        className="flex flex-col gap-4 rounded-lg border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex-1 space-y-2">
                          <div className="flex flex-wrap gap-2">
                            <CategoryBadge category={report.category} />
                            <StatusBadge status={report.status} />
                          </div>
                          <h3 className="font-semibold">{report.title}</h3>
                          <p className="text-sm text-muted-foreground">{report.address}</p>
                          <div className="flex gap-4 text-xs text-muted-foreground">
                            <span>Oleh: {report.submittedBy.name}</span>
                            <span>
                              {formatDistanceToNow(new Date(report.createdAt), {
                                addSuffix: true,
                                locale: idLocale,
                              })}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 sm:w-48">
                          <Select
                            value={report.status}
                            onValueChange={(value) => handleStatusChange(report._id, value)}
                            disabled={updating === report._id}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="open">Terbuka</SelectItem>
                              <SelectItem value="in_progress">Proses</SelectItem>
                              <SelectItem value="done">Selesai</SelectItem>
                              <SelectItem value="rejected">Ditolak</SelectItem>
                            </SelectContent>
                          </Select>

                          <div className="flex gap-2">
                            <Link to={`/reports/${report._id}`} className="flex-1">
                              <Button variant="outline" size="sm" className="w-full">
                                <Eye className="mr-2 h-4 w-4" />
                                Lihat
                              </Button>
                            </Link>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(report._id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
