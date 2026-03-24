import { initializePayment } from "@/modules/payment/payment-init.service";

export async function POST(req) {
  return initializePayment(req);
}
