import React from "react";

const Success = async ({ params }) => {
  // Both params and searchParams are async in latest Next.js
  const resolvedParams = await params;
  const tran_id = resolvedParams.tran_id; // from URL path

  console.log(tran_id);

  return <div>this is success page ${tran_id}</div>;
};

export default Success;
