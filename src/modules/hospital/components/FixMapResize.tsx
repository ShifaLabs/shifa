"use client";

import { memo } from "react";
import { useLeafletFix } from "../hooks/useLeafletFix";

function FixMapResize() {
  useLeafletFix();

  return null;
}

export default memo(FixMapResize);
