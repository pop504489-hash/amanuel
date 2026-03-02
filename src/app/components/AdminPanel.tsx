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
import { Loader2, PackagePlus, UploadCloud, XCircle, CheckCircle2 } from 'lucide-react';
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

  const handleSubmit = async (e: React.FormEvent) => {
    // 1. Prevent default form submission behavior (page refresh)
    e.preventDefault();
    console.log('Submission initiated...');

    // 2. Client-side validation
    if (!name || !price || !file) {
      console.warn('Submission blocked: Missing required fields');
      toast({ 
        title: "Missing Information / መረጃ ጎድሏል", 
        description: "Please provide a name, price, and a product photo.", 
        variant: "destructive" 
      });
      return;
    }

    // 3. Database readiness check
    if (!firestore) {
      console.error('Firestore instance not available');
      toast({
        title: "Database Error",
        description: "System is still connecting to the database. Please try again in a moment.",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    console.log('Starting Cloudinary upload...');
    
    try {
      // 4. Upload Image to Cloudinary (Awaited)
      const imageUrl = await uploadToCloudinary(file);
      console.log('Cloudinary upload success. Image URL:', imageUrl);

      // 5. Prepare Product Data for Firestore
      const productData = {
        name,
        nameAm: nameAm || name,
        price: parseFloat(price),
        category,
        unit,
        imageUrl,
        status: 'Available',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        description: `${name} in ${category}`,
      };

      // 6. Save to Firestore (Non-blocking update)
      const productsRef = collection(firestore, 'products');
      console.log('Queueing Firestore document creation...');
      addDocumentNonBlocking(productsRef, productData);

      // 7. Success feedback
      console.log('Product posted successfully!');
      toast({ 
        title: "Success! / ተሳክቷል!", 
        description: `${name} has been added to the catalog.`,
      });

      // 8. Reset form state for next entry
      setName('');
      setNameAm('');
      setPrice('');
      setFile(null);
      setPreview(null);
      
    } catch (error: any) {
      console.error('Submission failed with error:', error);
      toast({ 
        title: "Upload Error / ስህተት ተከስቷል", 
        description: error.message || "Failed to post product.", 
        variant: "destructive" 
      });
    } finally {
      // 9. Re-enable the button regardless of outcome
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-4">
      <Card className="border-2 shadow-xl overflow-hidden rounded-3xl">
        <CardHeader className="bg-primary text-primary-foreground p-6">
          <CardTitle className="flex items-center gap-2 text-2xl font-black">
            <PackagePlus className="h-7 w-7" />
            Post New Product / አዲስ ምርት ይጨምሩ
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="font-bold">Product Name (EN) / የምርት ስም</Label>
                <Input 
                  id="name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="e.g. Coca Cola 500ml" 
                  className="rounded-xl h-12" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nameAm" className="font-bold">የምርት ስም (በአማርኛ)</Label>
                <Input 
                  id="nameAm" 
                  value={nameAm} 
                  onChange={(e) => setNameAm(e.target.value)} 
                  placeholder="ለምሳሌ ኮካ ኮላ 500ml" 
                  className="rounded-xl h-12" 
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="price" className="font-bold">Price (ETB) / ዋጋ</Label>
                <Input 
                  id="price" 
                  type="number" 
                  step="0.01"
                  value={price} 
                  onChange={(e) => setPrice(e.target.value)} 
                  placeholder="0.00" 
                  className="rounded-xl h-12 text-lg font-mono" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit" className="font-bold">Unit / መጠን</Label>
                <Select value={unit} onValueChange={setUnit}>
                  <SelectTrigger className="rounded-xl h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Piece">Piece (ፍሬ)</SelectItem>
                    <SelectItem value="Crate">Crate (ክሬት)</SelectItem>
                    <SelectItem value="Box">Box (ሳጥን)</SelectItem>
                    <SelectItem value="Pack">Pack (ጥቅል)</SelectItem>
                    <SelectItem value="Bag">Bag (ጆንያ)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="font-bold">Category / ምድብ</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="rounded-xl h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Beverages">Beverages (መጠጦች)</SelectItem>
                  <SelectItem value="Grocery">Grocery (ግሮሰሪ)</SelectItem>
                  <SelectItem value="Grains">Grains (ጥራጥሬዎች)</SelectItem>
                  <SelectItem value="Cleaning">Cleaning (የጽዳት እቃዎች)</SelectItem>
                  <SelectItem value="Snacks">Snacks (መክሰስ)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label className="font-bold">Product Photo / የምርት ፎቶ</Label>
              <div className="relative group">
                <div 
                  className={`flex flex-col items-center justify-center border-4 border-dashed rounded-3xl p-8 transition-all cursor-pointer bg-muted/20 hover:bg-muted/40 ${preview ? 'border-primary/50' : 'border-muted-foreground/20'}`}
                  onClick={() => document.getElementById('image-upload')?.click()}
                >
                  {preview ? (
                    <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-inner">
                      <Image src={preview} alt="Preview" fill className="object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <UploadCloud className="h-10 w-10 text-white" />
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3 text-muted-foreground">
                      <div className="bg-primary/10 p-4 rounded-full">
                        <UploadCloud className="h-10 w-10 text-primary" />
                      </div>
                      <p className="font-bold">Click to upload photo / ፎቶ ለመጫን እዚህ ይጫኑ</p>
                    </div>
                  )}
                </div>
                <input 
                  id="image-upload" 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange} 
                  className="hidden" 
                />
                {preview && (
                  <Button 
                    type="button" 
                    variant="destructive" 
                    size="icon" 
                    className="absolute -top-2 -right-2 rounded-full h-8 w-8 shadow-lg"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreview(null);
                      setFile(null);
                    }}
                  >
                    <XCircle className="h-5 w-5" />
                  </Button>
                )}
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-16 rounded-2xl text-xl font-black gap-3 shadow-xl shadow-primary/20 hover:scale-[1.01] transition-transform active:scale-[0.98]"
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-6 w-6 animate-spin" />
                  Posting... / በመጫን ላይ...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-6 w-6" />
                  Post Product / ምርቱን ይጫኑ
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <p className="text-center text-xs text-muted-foreground mt-4 font-medium uppercase tracking-widest">
        Secure Admin Access / የአስተዳዳሪ መግቢያ
      </p>
    </div>
  );
}
