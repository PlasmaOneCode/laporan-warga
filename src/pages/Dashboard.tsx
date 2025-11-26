import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Layout/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import StatusBadge from '@/components/Common/StatusBadge';
import CategoryBadge from '@/components/Common/CategoryBadge';
import { FileText, Search, Plus, Filter } from 'lucide-react';
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
  submittedBy?: {
    name: string;
  };
}

const Dashboard = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 12;

  useEffect(() => {
    fetchReports();
  }, [search, category, status, page]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      
      if (search) params.append('search', search);
      if (category && category !== 'all') params.append('category', category);
      if (status && status !== 'all') params.append('status', status);

      const response = await axiosInstance.get(`/reports?${params}`);
      setReports(response.data.data || []);
      setTotal(response.data.total || 0);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSearch('');
    setCategory('all');
    setStatus('all');
    setPage(1);
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard Laporan</h1>
            <p className="text-muted-foreground">Kelola dan pantau semua laporan warga</p>
          </div>
          <Link to="/reports/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Buat Laporan Baru
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter & Pencarian
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari laporan..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kategori</SelectItem>
                  <SelectItem value="lampu_mati">Lampu Mati</SelectItem>
                  <SelectItem value="jalan_berlubang">Jalan Berlubang</SelectItem>
                  <SelectItem value="sampah">Sampah</SelectItem>
                  <SelectItem value="hewan_liar">Hewan Liar</SelectItem>
                </SelectContent>
              </Select>

              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="open">Terbuka</SelectItem>
                  <SelectItem value="in_progress">Dalam Proses</SelectItem>
                  <SelectItem value="done">Selesai</SelectItem>
                  <SelectItem value="rejected">Ditolak</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={handleReset}>
                Reset Filter
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Reports Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        ) : reports.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">Tidak ada laporan ditemukan</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="mb-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                          {formatDistanceToNow(new Date(report.createdAt), { 
                            addSuffix: true,
                            locale: idLocale 
                          })}
                        </span>
                        {report.submittedBy && (
                          <span>{report.submittedBy.name}</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Sebelumnya
                </Button>
                <div className="flex items-center gap-2 px-4">
                  <span className="text-sm text-muted-foreground">
                    Halaman {page} dari {totalPages}
                  </span>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Selanjutnya
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
