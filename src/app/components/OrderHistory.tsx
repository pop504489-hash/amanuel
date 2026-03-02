
'use client';

import { Order, OrderStatus, translations, Language } from '@/app/lib/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, Truck, CheckCircle2, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface Props {
  orders: Order[];
  language: Language;
}

const statusIcons: Record<OrderStatus, any> = {
  'Pending': Package,
  'Out for Delivery': Truck,
  'Delivered': CheckCircle2,
};

const statusColors: Record<OrderStatus, string> = {
  'Pending': 'bg-orange-100 text-orange-700 border-orange-200',
  'Out for Delivery': 'bg-blue-100 text-blue-700 border-blue-200',
  'Delivered': 'bg-green-100 text-green-700 border-green-200',
};

export function OrderHistory({ orders, language }: Props) {
  const t = translations[language];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-primary">{t.orders}</h2>
      </div>

      <div className="grid gap-4">
        {orders.map((order) => {
          const StatusIcon = statusIcons[order.status];
          return (
            <Card key={order.id} className="overflow-hidden border-2 hover:border-primary/10 transition-colors">
              <CardHeader className="bg-muted/30 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm border">
                      <StatusIcon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">#{order.id}</CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(order.date), 'MMMM dd, yyyy')}
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className={`px-4 py-1.5 rounded-full text-sm font-bold border-2 ${statusColors[order.status]}`}>
                    {order.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="grid gap-2">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm py-1 border-b border-dashed last:border-0">
                        <span className="font-medium">{item.quantity}x {item.productName}</span>
                        <span className="text-muted-foreground">ETB {item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center pt-2 font-black text-xl border-t">
                    <span>{t.total}</span>
                    <span className="text-primary">ETB {order.total}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
