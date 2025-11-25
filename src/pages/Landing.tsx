import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Layout/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import StatusBadge from '@/components/Common/StatusBadge';
import CategoryBadge from '@/components/Common/CategoryBadge';
import { FileText, TrendingUp, Clock, CheckCircle2 } from 'lucide-react';
import axiosInstance from '@/lib/axios';
import { formatDistanceToNow } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

interface Report {
  _id: string;
  title: string;
  category: string;
  status: 'open' | 'in_progress' | 'done' | 'rejected';
  images: string[];
  address: string;
  createdAt: string;
}

interface Stats {
  open: number;
  in_progress: number;
  done: number;
  total: number;
}

const Landing = () => {
  const { isAuthenticated } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [stats, setStats] = useState<Stats>({ open: 0, in_progress: 0, done: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [reportsRes, statsRes] = await Promise.all([
        axiosInstance.get('/reports?limit=5'),
        axiosInstance.get('/reports/stats'),
      ]);
      
      setReports(reportsRes.data.data || []);
      setStats(statsRes.data || { open: 0, in_progress: 0, done: 0, total: 0 });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="border-b border-border bg-gradient-to-b from-primary/5 to-background py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Sistem Pelaporan Lingkungan
            <span className="block bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              RT/RW Digital
            </span>
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
            Platform untuk melaporkan dan mengelola masalah lingkungan di sekitar Anda. 
            Bersama membangun lingkungan yang lebih baik.
          </p>
          {isAuthenticated ? (
            <Link to="/reports/new">
              <Button size="lg" className="gap-2">
                <FileText className="h-5 w-5" />
                Buat Laporan Baru
              </Button>
            </Link>
          ) : (
            <div className="flex gap-4 justify-center">
              <Link to="/auth/login">
                <Button size="lg" variant="outline">Login</Button>
              </Link>
              <Link to="/auth/register">
                <Button size="lg">Daftar Sekarang</Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
        </div>
      </section>

      {/* Recent Reports */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Laporan Terbaru</h2>
              <p className="text-muted-foreground">5 laporan terbaru dari warga</p>
            </div>
            <Link to="/dashboard">
              <Button variant="outline">Lihat Semua</Button>
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : reports.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">Belum ada laporan</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {reports.map((report) => (
                <Link key={report._id} to={`/reports/${report._id}`}>
                  <Card className="overflow-hidden transition-all hover:shadow-lg">
                    <div className="aspect-video overflow-hidden bg-muted">
                      {report.images?.[0] ? (
                        <img
                          src={report.images[0]}
                          alt={report.title}
                          className="h-full w-full object-cover transition-transform hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <FileText className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <CardHeader>
                      <div className="mb-2 flex gap-2">
                        <CategoryBadge category={report.category} />
                        <StatusBadge status={report.status} />
                      </div>
                      <CardTitle className="line-clamp-2">{report.title}</CardTitle>
                      <CardDescription className="line-clamp-1">
                        {report.address}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(report.createdAt), { 
                          addSuffix: true,
                          locale: idLocale 
                        })}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Landing;
