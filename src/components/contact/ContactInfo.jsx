export default function ContactInfo() {
  return (
    <div className="space-y-10">
      <div className="rounded-2xl border border-border bg-card p-8">
        <h3 className="text-xl font-semibold mb-4">Support Information</h3>

        <div className="space-y-6 text-sm text-muted-foreground">
          <div>
            <p className="font-medium text-foreground">📧 Email</p>
            <p>shifa.management.team@gmail.com</p>
          </div>

          <div>
            <p className="font-medium text-foreground">📞 Phone</p>
            <p>+880-1234-567890</p>
          </div>

          <div>
            <p className="font-medium text-foreground font-bangla">🕒 Working Hours</p>
            <p>শনিবার – বৃহস্পতিবার | সকাল ৯টা – সন্ধ্যা ৬টা</p>
          </div>

          <div>
            <p className="font-medium text-foreground font-bangla">🔐 Data Privacy</p>
            <p>আপনার তথ্য নিরাপদ ও এনক্রিপ্টেড পদ্ধতিতে সংরক্ষণ করা হয়।</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-muted/40 p-8">
        <h3 className="text-lg font-semibold mb-3">Need Faster Help?</h3>
        <p className="text-sm text-muted-foreground">
          Live chat feature coming soon for instant support.
        </p>
      </div>
    </div>
  );
}
