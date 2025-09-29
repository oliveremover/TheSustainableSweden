"use client";

import { LineChart, Line, CartesianGrid, XAxis, YAxis, Legend, Tooltip, ResponsiveContainer } from "recharts";
import React from "react";

export default function MilestoneChart({ data }: { data: Array<Record<string, any>> }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 10, right: 20, bottom: 5, left: 5 }}>
        <CartesianGrid stroke="#4b4b4bff" strokeDasharray="5 5" />
        <Line type="monotone" dataKey="uv" stroke="purple" strokeWidth={2} name="Where we are at" />
        <Line type="monotone" dataKey="pv" stroke="green" strokeWidth={2} name="Where we need to be" strokeDasharray="5 5" />
        <XAxis dataKey="name" />
        <YAxis width={50} />
        <Legend align="right" />
        <Tooltip contentStyle={{ backgroundColor: "color(display-p3 .098 .098 .098)", border: "1px solid color-mix(in oklab, color(display-p3 1 1 1 / .172), color(display-p3 .228 .228 .228) 25%)", borderRadius: "8px" }} />
      </LineChart>
    </ResponsiveContainer>
  );
}