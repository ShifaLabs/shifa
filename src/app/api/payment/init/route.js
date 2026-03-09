import { collections, dbConnect } from "@/lib/dbConnect";
import axios from "axios";
import { ObjectId } from "mongodb";
import SSLCommerzPayment from "sslcommerz-lts";
import { v4 as uuidv4 } from "uuid";

const store_id = process.env.STORE_ID;

const store_passwd = process.env.STORE_PASSWD;
const is_live = process.env.SSL_MODE === "true"; // ensure boolean

const transactionID = uuidv4();
export async function POST(req) {
  try {
    // For GET requests, body is usually empty
    const body = await req.json();

    const appointment = {
      patient: body.patient,
      doctor: body.doctor,
      appointmentDate: body.appointmentDate,
      status: "PendingPayment",
      consultationType: "video",
      symptoms: body.symptoms,
      meetingLink: "<https://meet.telemedapp.com/session/abc123xyz>",
      paymentStatus: "unpaid",
      payment: {
        status: "pending",
        amount: 500,
        currency: "BDT",
      },
      createdAt: body.createdAt,
      updatedAt: body.updatedAt,
    };

    const data = {
      total_amount: 100,
      currency: "BDT",
      tran_id: transactionID,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success/${transactionID}`,
      fail_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/fail`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cancel`,
      ipn_url: `${process.env.NEXT_PUBLIC_APP_URL}/ipn`,
      shipping_method: "Courier",
      product_name: "Computer.",
      product_category: "Electronic",
      product_profile: "general",
      cus_name: "Customer Name",
      cus_email: "customer@example.com",
      cus_add1: "Dhaka",
      cus_add2: "Dhaka",
      cus_city: "Dhaka",
      cus_state: "Dhaka",
      cus_postcode: "1000",
      cus_country: "Bangladesh",
      cus_phone: "01711111111",
      cus_fax: "01711111111",
      ship_name: "Customer Name",
      ship_add1: "Dhaka",
      ship_add2: "Dhaka",
      ship_city: "Dhaka",
      ship_state: "Dhaka",
      ship_postcode: 1000,
      ship_country: "Bangladesh",
      store_id,
      store_passwd,
      is_live,
    };
    const response = await axios({
      method: "POST",
      url: process.env.SANDBOX_LINK,
      data,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    let GatewayPageURL = response.data.GatewayPageURL;
    if (GatewayPageURL) {
      const appointmentCollection = await dbConnect(collections.APPOINTMENTS);
      const updateData = {
        $set: {
          paymentStatus: "paid",
          status: "Confirmed",
          payment: {
            status: "paid",
          },
        },
      };
      const query = { _id: new ObjectId(body._id) };
      const result = await appointmentCollection.updateOne(query, updateData);
      return Response.json({ url: GatewayPageURL });
    }
  } catch (err) {
    console.error("error", err);
    return new Response(
      JSON.stringify({
        error: "Payment initiation failed",
        message: err.message,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
