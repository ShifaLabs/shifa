import { initializePayment } from "@/modules/payment/services/payment-init.service";

export async function POST(req) {
  return initializePayment(req);
}
