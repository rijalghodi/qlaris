import { OrderSystem } from "@/components/order/order-system";
import { Breadcrumb } from "@/components/ui/breadcrumb";

export default function OrderPage() {
  return (
    <div className="container mx-auto max-w-[1600px] p-4 h-full">
      <OrderSystem />
    </div>
  );
}
