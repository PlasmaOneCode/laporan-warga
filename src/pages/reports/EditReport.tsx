import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '@/components/Layout/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import axiosInstance from '@/lib/axios';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_FILES = 4;
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];

const EditReport = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    address: '',
    lat: '',
    lng: '',
    contact: '',
  });

  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchReport();
  }, [id]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/reports/${id}`);
      const data = response.data;
      setFormData({
        title: data.title || '',
        description: data.description || '',
        category: data.category || '',
        address: data.address || '',
        lat: data.lat?.toString() || '',
        lng: data.lng?.toString() || '',
        contact: data.contact || '',
      });
      setExistingImages(data.images || []);
      setFilePreviews([]);

      // Authorization check: only owner or admin can edit
      if (!user) {
        toast({ title: 'Forbidden', description: 'Anda harus login', variant: 'destructive' });
        navigate('/auth/login');
        return;
      }

      if (user._id !== data.submittedBy?._id && user.role !== 'admin') {
        toast({ title: 'Forbidden', description: 'Anda tidak memiliki akses edit', variant: 'destructive' });
        navigate('/dashboard');
        return;
      }

    } catch (error: any) {
      console.error(error);
      toast({ title: 'Gagal memuat laporan', description: 'Silakan coba lagi', variant: 'destructive' });
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (files.length + selectedFiles.length > MAX_FILES) {
      toast({ title: 'Terlalu banyak gambar', description: `Maksimal ${MAX_FILES} gambar`, variant: 'destructive' });
      return;
    }

    const validFiles: File[] = [];
    const newPreviews: string[] = [];

    selectedFiles.forEach(file => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast({ title: 'Tipe file tidak valid', description: `${file.name}: Hanya JPG, JPEG, dan PNG yang diperbolehkan`, variant: 'destructive' });
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast({ title: 'File terlalu besar', description: `${file.name}: Maksimal 5MB per file`, variant: 'destructive' });
        return;
      }
      validFiles.push(file);
      newPreviews.push(URL.createObjectURL(file));
    });

    setFiles(prev => [...prev, ...validFiles]);
    setFilePreviews(prev => [...prev, ...newPreviews]);
    if (errors.images) setErrors(prev => ({ ...prev, images: '' }));
  };

  const removeFile = (index: number) => {
    // If index relates to an existing image
    if (index < existingImages.length) {
      const idx = index;
      setExistingImages(prev => prev.filter((_, i) => i !== idx));
    } else {
      const previewIdx = index - existingImages.length;
      if (filePreviews[previewIdx] && filePreviews[previewIdx].startsWith('blob:')) {
        URL.revokeObjectURL(filePreviews[previewIdx]);
      }
      setFiles(prev => prev.filter((_, i) => i !== previewIdx));
      setFilePreviews(prev => prev.filter((_, i) => i !== previewIdx));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = 'Judul wajib diisi';
    if (!formData.description.trim()) newErrors.description = 'Deskripsi wajib diisi';
    else if (formData.description.length < 10) newErrors.description = 'Deskripsi minimal 10 karakter';
    if (!formData.category) newErrors.category = 'Kategori wajib dipilih';
    if (!formData.address.trim()) newErrors.address = 'Alamat wajib diisi';

    // Either existingImages (still there) or new files must exist
    if (existingImages.length === 0 && files.length === 0) newErrors.images = 'Minimal 1 gambar wajib diunggah';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast({ title: 'Form tidak valid', description: 'Periksa kembali form Anda', variant: 'destructive' });
      return;
    }

    setSaving(true);

    try {
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('category', formData.category);
      submitData.append('address', formData.address);
      if (formData.lat) submitData.append('lat', formData.lat);
      if (formData.lng) submitData.append('lng', formData.lng);
      if (formData.contact) submitData.append('contact', formData.contact);

      // Append message files (only newly selected files)
      files.forEach(file => submitData.append('images', file));
      // Send existingImages so backend can remove any images deleted by the user
      submitData.append('existingImages', JSON.stringify(existingImages));

      const response = await axiosInstance.put(`/reports/${id}`, submitData, { headers: { 'Content-Type': 'multipart/form-data' } });

      toast({ title: 'Laporan berhasil diubah', description: 'Perubahan tersimpan' });
      navigate(`/reports/${id}`);
    } catch (error: any) {
      console.error(error);
      toast({ title: 'Gagal mengubah laporan', description: error.response?.data?.message || 'Terjadi kesalahan', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center"><div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div></div>
  );
  const combinedPreviews = [...existingImages, ...filePreviews];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Edit Laporan</h1>
            <p className="text-muted-foreground">Ubah data laporan dengan hati-hati</p>
          </div>

          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Informasi Laporan</CardTitle>
                <CardDescription>Ubah data lalu simpan</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Reuse the same layout from NewReport for fields */}
                <div className="space-y-2">
                  <Label htmlFor="title">Judul Laporan <span className="text-destructive">*</span></Label>
                  <Input id="title" placeholder="Contoh: Lampu jalan mati..." value={formData.title} onChange={(e) => handleChange('title', e.target.value)} />
                  {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Deskripsi <span className="text-destructive">*</span></Label>
                  <Textarea id="description" value={formData.description} onChange={(e) => handleChange('description', e.target.value)} rows={5} />
                  {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Kategori <span className="text-destructive">*</span></Label>
                  <Select value={formData.category} onValueChange={(v) => handleChange('category', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lampu_mati">Lampu Mati</SelectItem>
                      <SelectItem value="jalan_berlubang">Jalan Berlubang</SelectItem>
                      <SelectItem value="sampah">Sampah</SelectItem>
                      <SelectItem value="hewan_liar">Hewan Liar</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.category && <p className="text-sm text-destructive">{errors.category}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Alamat/Lokasi <span className="text-destructive">*</span></Label>
                  <Input id="address" value={formData.address} onChange={(e) => handleChange('address', e.target.value)} />
                  {errors.address && <p className="text-sm text-destructive">{errors.address}</p>}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="lat">Latitude (Opsional)</Label>
                    <Input id="lat" type="number" step="any" value={formData.lat} onChange={(e)=> handleChange('lat', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lng">Longitude (Opsional)</Label>
                    <Input id="lng" type="number" step="any" value={formData.lng} onChange={(e)=> handleChange('lng', e.target.value)} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact">Kontak (Opsional)</Label>
                  <Input id="contact" value={formData.contact} onChange={(e)=> handleChange('contact', e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label>Foto <span className="text-destructive">*</span></Label>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Button type="button" variant="outline" onClick={()=> document.getElementById('file-upload')?.click()} disabled={files.length + existingImages.length >= MAX_FILES}>
                        <Upload className="mr-2 h-4 w-4" /> Pilih Gambar
                      </Button>
                      <span className="text-sm text-muted-foreground">{existingImages.length + files.length}/{MAX_FILES} gambar</span>
                      <input id="file-upload" type="file" multiple accept="image/jpeg,image/jpg,image/png" onChange={handleFileChange} className="hidden" />
                    </div>

                    {combinedPreviews.length > 0 ? (
                      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                        {combinedPreviews.map((p, idx) => (
                          <div key={idx} className="group relative aspect-square overflow-hidden rounded-lg border border-border">
                            <img src={p} alt={`Preview ${idx+1}`} className="h-full w-full object-cover" />
                            <button type="button" onClick={() => removeFile(idx)} className="absolute right-2 top-2 rounded-full bg-destructive p-1 text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100">
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border py-12">
                        <ImageIcon className="mb-4 h-12 w-12 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Minimal 1 gambar, maksimal 4 gambar</p>
                        <p className="text-xs text-muted-foreground">JPG, JPEG, PNG (Max 5MB)</p>
                      </div>
                    )}

                    {errors.images && <p className="text-sm text-destructive">{errors.images}</p>}
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button type="submit" className="flex-1" disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan Perubahan'}</Button>
                  <Button type="button" variant="outline" onClick={() => navigate(`/reports/${id}`)}>Batal</Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditReport;
