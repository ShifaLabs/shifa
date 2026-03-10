import React from "react";
import {
  CheckCircle2,
  Download,
  Home,
  ArrowRight,
  Printer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { confirmPaymentByTransactionId } from "@/features/payment/payment.service";

const Success = async ({
  params,
}: {
  params: Promise<{ tran_id: string }>;
}) => {
  const { tran_id } = await params;

  const paymentUpdateResult = await confirmPaymentByTransactionId(tran_id);

  const paidAmount = paymentUpdateResult?.payment?.amount || 0;
  const date = new Date().toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-slate-50/50 flex items-center justify-center p-4 font-sans">
      <Card className="max-w-xl w-full border-none shadow-2xl bg-white/80 backdrop-blur-md overflow-hidden">
        {/* Success Header Area */}
        <div className="h-2 bg-emerald-500 w-full" />

        <CardHeader className="text-center pt-10 pb-6">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-emerald-100 p-3 animate-in zoom-in duration-500">
              <CheckCircle2 className="w-12 h-12 text-emerald-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Payment Successful
          </h1>
          <p className="text-slate-500 mt-2">
            Thank you for your trust. Your transaction has been completed.
          </p>
        </CardHeader>

        <CardContent className="space-y-6 px-8">
          {/* Transaction Summary Box */}
          <div className="rounded-2xl bg-slate-100/50 p-6 border border-slate-200/60">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                Transaction Details
              </span>
              <Badge
                variant="secondary"
                className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none"
              >
                Completed
              </Badge>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Transaction ID</span>
                <span className="font-mono font-medium text-slate-900">
                  {tran_id}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Date</span>
                <span className="font-medium text-slate-900">{date}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Payment Method</span>
                <span className="font-medium text-slate-900">
                  Online Banking / Card
                </span>
              </div>
              <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
                <span className="font-semibold text-slate-900">
                  Amount Paid
                </span>
                <span className="text-xl font-bold text-emerald-600">
                  BDT {Number(paidAmount).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <p className="text-xs text-center text-slate-400">
            A confirmation email has been sent to your registered address.
            Please keep this transaction ID for your records.
          </p>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 px-8 pb-10">
          <div className="grid grid-cols-2 gap-4 w-full">
            <Button
              variant="outline"
              className="border-slate-200 hover:bg-slate-50 py-6 group"
            >
              <Download className="mr-2 h-4 w-4 transition-transform group-hover:translate-y-0.5" />
              Get Invoice
            </Button>
            <Button
              variant="outline"
              className="border-slate-200 hover:bg-slate-50 py-6"
            >
              <Printer className="mr-2 h-4 w-4" />
              Print Receipt
            </Button>
          </div>

          <Button
            asChild
            className="w-full py-6 bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-200"
          >
            <Link href="/dashboard">
              Go to Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>

          <Button variant="ghost" asChild className="text-slate-500">
            <Link href="/">Back to Home</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Success;
