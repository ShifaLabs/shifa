import { submitSupportTicket } from "@/modules/contact/services/contact-ticket.service";

export async function POST(req) {
  return submitSupportTicket(req);
}
