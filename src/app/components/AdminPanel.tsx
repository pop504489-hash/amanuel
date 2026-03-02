
'use client';

import { useState } from 'react';
import { useFirestore, useAuth, useCollection, useMemoFirebase } from '@/firebase';
import { collection, serverTimestamp, query, orderBy, doc } from 'firebase/firestore';
import { addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { uploadToCloudinary } from '@/app/lib/cloudinary';
import { Order, OrderStatus } from '@/app/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, PackagePlus, UploadCloud, XCircle, CheckCircle2, LogOut, ClipboardList, Phone, MapPin, User, CheckCircle } from 'lucide-react';
import Image from 'next/image';
import { signOut } from 'firebase/auth';
import { format } from 'date-fns';

export function AdminPanel() {
  const [activeTab, setActiveTab] = useState('orders');
  const [name, setName] = useState('');
  const [nameAm, setNameAm] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Beverages');
  const [unit, setUnit] = useState('Crate');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const firestore = useFirestore();
  const auth = useAuth();
  const { toast } = useToast();

  const ordersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'orders'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const { data: orders, isLoading: ordersLoading } = useCollection<Order>(ordersQuery);

  const handleLogout = () => {
    signOut(auth);
    toast({ title: "Logged Out", description: "You have been securely signed out." });
  };

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
    e.preventDefault();
    if (!name || !price || !file) {
      toast({ title: "Error", description: "All fields are required.", variant: "destructive" });
      return;
    }

    if (!firestore) return;
    setIsUploading(true);
    
    try {
      const imageUrl = await uploadToCloudinary(file);
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

      addDocumentNonBlocking(collection(firestore, 'products'), productData);
      toast({ title: "Success", description: "Product added." });
      setName(''); setNameAm(''); setPrice(''); setFile(null); setPreview(null);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const markAsDelivered = (orderId: string) => {
    if (!firestore) return;
    updateDocumentNonBlocking(doc(firestore, 'orders', orderId), { status: 'Delivered' });
    toast({ title: "Order Updated", description: "Marked as Delivered." });
  };

  return (
    <div className="max-w-4xl mx-auto py-4 space-y-4 px-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-primary">Admin Console</h2>
        <Button variant="ghost" onClick={handleLogout} className="text-destructive gap-2">
          <LogOut className="h-4 w-4" /> Logout
        </Button>
      </div>

      <Tabs defaultValue="orders" onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 rounded-2xl h-14 p-1">
          <TabsTrigger value="orders" className="rounded-xl font-bold gap-2">
            <ClipboardList className="h-4 w-4" /> View Orders
          </TabsTrigger>
          <TabsTrigger value="post" className="rounded-xl font-bold gap-2">
            <PackagePlus className="h-4 w-4" /> Add Product
          </TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-4 mt-6">
          {ordersLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>
          ) : orders && orders.length > 0 ? (
            <div className="grid gap-6">
              {orders.map((order) => (
                <Card key={order.id} className="border-2 rounded-3xl overflow-hidden shadow-lg">
                  <div className={`h-2 w-full ${order.status === 'Delivered' ? 'bg-green-500' : 'bg-orange-500'}`} />
                  <CardContent className="p-6 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 font-black text-lg">
                          <User className="h-4 w-4 text-primary" /> {order.customerName}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" /> {order.location}
                        </div>
                        <a href={`tel:${order.phoneNumber}`} className="flex items-center gap-2 text-sm text-primary font-bold hover:underline">
                          <Phone className="h-4 w-4" /> {order.phoneNumber}
                        </a>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground uppercase font-black">
                          {order.createdAt?.toDate ? format(order.createdAt.toDate(), 'MMM dd, HH:mm') : 'Recently'}
                        </div>
                        <div className="text-xl font-black text-primary">ETB {order.total}</div>
                      </div>
                    </div>

                    <div className="bg-muted/30 p-4 rounded-2xl space-y-2">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm font-medium">
                          <span>{item.quantity}x {item.productName}</span>
                          <span className="text-muted-foreground">ETB {item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                        {order.status}
                      </div>
                      {order.status !== 'Delivered' && (
                        <Button onClick={() => markAsDelivered(order.id)} className="bg-green-600 hover:bg-green-700 rounded-xl gap-2 font-bold shadow-lg shadow-green-200">
                          <CheckCircle className="h-4 w-4" /> ተረክቧል (Mark Delivered)
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-muted/20 rounded-3xl border-4 border-dashed">
              <ClipboardList className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
              <p className="text-muted-foreground font-bold">No orders found yet.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="post" className="mt-6">
          <Card className="border-2 shadow-xl overflow-hidden rounded-3xl">
            <CardHeader className="bg-primary text-primary-foreground p-6">
              <CardTitle className="flex items-center gap-2 text-2xl font-black">
                <PackagePlus className="h-7 w-7" /> Post New Product
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="font-bold">Name (EN) / ስም</Label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Coca Cola" className="rounded-xl h-12" />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold">Name (AM) / ስም (አማርኛ)</Label>
                    <Input value={nameAm} onChange={(e) => setNameAm(e.target.value)} placeholder="ለምሳሌ ኮካ ኮላ" className="rounded-xl h-12" />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="font-bold">Price (ETB) / ዋጋ</Label>
                    <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" className="rounded-xl h-12" />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold">Unit / መጠን</Label>
                    <Select value={unit} onValueChange={setUnit}>
                      <SelectTrigger className="rounded-xl h-12"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Crate">Crate (ክሬት)</SelectItem>
                        <SelectItem value="Box">Box (ሳጥን)</SelectItem>
                        <SelectItem value="Piece">Piece (ፍሬ)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">Category / ምድብ</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="rounded-xl h-12"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Beverages">Beverages</SelectItem>
                      <SelectItem value="Grocery">Grocery</SelectItem>
                      <SelectItem value="Grains">Grains</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <Label className="font-bold">Photo / ፎቶ</Label>
                  <div className="flex flex-col items-center justify-center border-4 border-dashed rounded-3xl p-8 bg-muted/20 cursor-pointer" onClick={() => document.getElementById('image-upload')?.click()}>
                    {preview ? <div className="relative w-full aspect-video rounded-2xl overflow-hidden"><Image src={preview} alt="Preview" fill className="object-cover" /></div> : <UploadCloud className="h-10 w-10 text-primary" />}
                    <input id="image-upload" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                  </div>
                </div>
                <Button type="submit" className="w-full h-16 rounded-2xl text-xl font-black gap-3" disabled={isUploading}>
                  {isUploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <CheckCircle2 className="h-6 w-6" />} Post Product
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
