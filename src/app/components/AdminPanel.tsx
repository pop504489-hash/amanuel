'use client';

import { useState } from 'react';
import { useFirestore } from '@/firebase';
import { collection, serverTimestamp } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { uploadToCloudinary } from '@/app/lib/cloudinary';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, PackagePlus, UploadCloud, XCircle } from 'lucide-react';
import Image from 'next/image';

export function AdminPanel() {
  const [name, setName] = useState('');
  const [nameAm, setNameAm] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Beverages');
  const [unit, setUnit] = useState('Piece');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const { firestore } = useFirestore();
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !file || !firestore) {
      toast({ title: "Missing details", description: "Please fill all fields and upload a photo.", variant: "destructive" });
      return;
    }

    setIsUploading(true);
    try {
      // 1. Upload to Cloudinary
      const imageUrl = await uploadToCloudinary(file);

      // 2. Save to Firestore
      const productData = {
        name,
        nameAm,
        price: parseFloat(price),
        category,
        unit,
        imageUrl,
        status: 'Available',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        description: `${name} - ${category}`,
      };

      const productsRef = collection(firestore, 'products');
      addDocumentNonBlocking(productsRef, productData);

      // 3. Reset Form
      setName('');
      setNameAm('');
      setPrice('');
      setFile(null);
      setPreview(null);
      
      toast({ title: "Product Added", description: "The product is now live in the shop." });
    } catch (error: any) {
      toast({ title: "Upload Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <Card className="border-2 shadow-xl overflow-hidden">
        <CardHeader className="bg-primary text-white p-6">
          <CardTitle className="flex items-center gap-2 text-2xl font-black">
            <PackagePlus className="h-6 w-6" />
            Add New Product
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleAddProduct} className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name (English)</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Cola 500ml" className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nameAm">Product Name (Amharic)</Label>
                <Input id="nameAm" value={nameAm} onChange={(e) => setNameAm(e.target.value)} placeholder="ለምሳሌ ኮላ 500ml" className="rounded-xl" />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="price">Price (ETB)</Label>
                <Input id="price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unit of Measure</Label>
                <Select value={unit} onValueChange={setUnit}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Piece">Piece</SelectItem>
                    <SelectItem value="Crate">Crate</SelectItem>
                    <SelectItem value="Box">Box</SelectItem>
                    <SelectItem value="Pack">Pack</SelectItem>
                    <SelectItem value="Bag">Bag</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Beverages">Beverages</SelectItem>
                  <SelectItem value="Grocery">Grocery</SelectItem>
                  <SelectItem value="Grains">Grains</SelectItem>
                  <SelectItem value="Cleaning">Cleaning</SelectItem>
                  <SelectItem value="Snacks">Snacks</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <Label>Product Photo</Label>
              <div className="flex flex-col items-center justify-center border-4 border-dashed rounded-3xl p-8 bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer relative group">
                {preview ? (
                  <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-lg">
                    <Image src={preview} alt="Preview" fill className="object-cover" />
                    <button 
                      type="button" 
                      onClick={() => { setPreview(null); setFile(null); }}
                      className="absolute top-2 right-2 bg-white/80 rounded-full p-1 text-destructive hover:bg-white"
                    >
                      <XCircle className="h-6 w-6" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center gap-3 cursor-pointer">
                    <div className="bg-primary/10 p-4 rounded-full group-hover:bg-primary/20 transition-colors">
                      <UploadCloud className="h-10 w-10 text-primary" />
                    </div>
                    <span className="font-bold text-muted-foreground">Click to upload image</span>
                    <Input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                  </label>
                )}
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-14 rounded-2xl text-lg font-black gap-3 shadow-lg shadow-primary/20"
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <PackagePlus className="h-6 w-6" />
                  Save Product
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
