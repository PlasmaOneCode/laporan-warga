import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_FILES = 4;
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];

const NewReport = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    address: '',
    lat: '',
    lng: '',
    contact: '',
  });
  
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    
    // Validate file count
    if (files.length + selectedFiles.length > MAX_FILES) {
      toast({
        title: 'Terlalu banyak gambar',
        description: `Maksimal ${MAX_FILES} gambar`,
        variant: 'destructive',
      });
      return;
    }

    // Validate each file
    const validFiles: File[] = [];
    const newPreviews: string[] = [];

    selectedFiles.forEach(file => {
      // Check file type
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast({
          title: 'Tipe file tidak valid',
          description: `${file.name}: Hanya JPG, JPEG, dan PNG yang diperbolehkan`,
          variant: 'destructive',
        });
        return;
      }

      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        toast({
          title: 'File terlalu besar',
          description: `${file.name}: Maksimal 5MB per file`,
          variant: 'destructive',
        });
        return;
      }

      validFiles.push(file);
      newPreviews.push(URL.createObjectURL(file));
    });

    setFiles(prev => [...prev, ...validFiles]);
    setPreviews(prev => [...prev, ...newPreviews]);
    
    if (errors.images) {
      setErrors(prev => ({ ...prev, images: '' }));
    }
  };

  const removeFile = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Judul wajib diisi';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Deskripsi wajib diisi';
    } else if (formData.description.length < 10) {
      newErrors.description = 'Deskripsi minimal 10 karakter';
    }

    if (!formData.category) {
      newErrors.category = 'Kategori wajib dipilih';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Alamat wajib diisi';
    }

    if (files.length === 0) {
      newErrors.images = 'Minimal 1 gambar wajib diunggah';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      toast({
        title: 'Form tidak valid',
        description: 'Periksa kembali form Anda',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('category', formData.category);
      submitData.append('address', formData.address);
      
      if (formData.lat) submitData.append('lat', formData.lat);
      if (formData.lng) submitData.append('lng', formData.lng);
      if (formData.contact) submitData.append('contact', formData.contact);

      files.forEach(file => {
        submitData.append('images', file);
      });

      const response = await axiosInstance.post('/reports', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast({
        title: 'Laporan berhasil dibuat',
        description: 'Laporan Anda telah disimpan',
      });

      navigate(`/reports/${response.data._id}`);
    } catch (error: any) {
      toast({
        title: 'Gagal membuat laporan',
        description: error.response?.data?.message || 'Terjadi kesalahan',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Buat Laporan Baru</h1>
            <p className="text-muted-foreground">Laporkan masalah lingkungan di sekitar Anda</p>
          </div>

          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Informasi Laporan</CardTitle>
                <CardDescription>Isi data dengan lengkap dan jelas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">
                    Judul Laporan <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="title"
                    placeholder="Contoh: Lampu jalan mati di depan RT 01"
                    value={formData.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                  />
                  {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">
                    Deskripsi <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Jelaskan masalah secara detail (minimal 10 karakter)"
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    rows={5}
                  />
                  {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label htmlFor="category">
                    Kategori <span className="text-destructive">*</span>
                  </Label>
                  <Select value={formData.category} onValueChange={(value) => handleChange('category', value)}>
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

                {/* Address */}
                <div className="space-y-2">
                  <Label htmlFor="address">
                    Alamat/Lokasi <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="address"
                    placeholder="Contoh: Jl. Mawar No. 10, RT 01/RW 05"
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                  />
                  {errors.address && <p className="text-sm text-destructive">{errors.address}</p>}
                </div>

                {/* Coordinates (Optional) */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="lat">Latitude (Opsional)</Label>
                    <Input
                      id="lat"
                      type="number"
                      step="any"
                      placeholder="-6.200000"
                      value={formData.lat}
                      onChange={(e) => handleChange('lat', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lng">Longitude (Opsional)</Label>
                    <Input
                      id="lng"
                      type="number"
                      step="any"
                      placeholder="106.816666"
                      value={formData.lng}
                      onChange={(e) => handleChange('lng', e.target.value)}
                    />
                  </div>
                </div>

                {/* Contact */}
                <div className="space-y-2">
                  <Label htmlFor="contact">Kontak (Opsional)</Label>
                  <Input
                    id="contact"
                    placeholder="Nomor telepon atau email"
                    value={formData.contact}
                    onChange={(e) => handleChange('contact', e.target.value)}
                  />
                </div>

                {/* Images */}
                <div className="space-y-2">
                  <Label>
                    Foto <span className="text-destructive">*</span>
                  </Label>
                  <div className="space-y-4">
                    {/* Upload Button */}
                    <div className="flex items-center gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('file-upload')?.click()}
                        disabled={files.length >= MAX_FILES}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Gambar
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        {files.length}/{MAX_FILES} gambar (Max 5MB per file)
                      </span>
                      <input
                        id="file-upload"
                        type="file"
                        multiple
                        accept="image/jpeg,image/jpg,image/png"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </div>

                    {/* Preview Grid */}
                    {previews.length > 0 && (
                      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                        {previews.map((preview, index) => (
                          <div key={index} className="group relative aspect-square overflow-hidden rounded-lg border border-border">
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="h-full w-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => removeFile(index)}
                              className="absolute right-2 top-2 rounded-full bg-destructive p-1 text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {files.length === 0 && (
                      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border py-12">
                        <ImageIcon className="mb-4 h-12 w-12 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Minimal 1 gambar, maksimal 4 gambar</p>
                        <p className="text-xs text-muted-foreground">JPG, JPEG, PNG (Max 5MB)</p>
                      </div>
                    )}
                  </div>
                  {errors.images && <p className="text-sm text-destructive">{errors.images}</p>}
                </div>

                {/* Submit */}
                <div className="flex gap-4">
                  <Button type="submit" className="flex-1" disabled={loading}>
                    {loading ? 'Mengirim...' : 'Kirim Laporan'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/dashboard')}
                    disabled={loading}
                  >
                    Batal
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewReport;
