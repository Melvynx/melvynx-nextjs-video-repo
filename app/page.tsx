"use client";

import { TimeZoneSelect } from "@/components/timezone-select";
import { useState } from "react";

export default function Home() {
  const [selectedTimeZone, setSelectedTimeZone] = useState<string>("");

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">NextFullstack</h1>
      <p>TimeZone : {selectedTimeZone}</p>
      <TimeZoneSelect
        selectedTimeZone={selectedTimeZone}
        onTimeZoneChange={setSelectedTimeZone}
      />
    </div>
  );
}
