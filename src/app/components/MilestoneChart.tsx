"use client";

import { LineChart, Line, CartesianGrid, XAxis, YAxis, Legend, Tooltip, ResponsiveContainer } from "recharts";
import React from "react";

export default function MilestoneChart({ data }: { data: Array<Record<string, any>> }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 10, right: 20, bottom: 5, left: 0 }}>
        <CartesianGrid stroke="#868585ff" strokeDasharray="5 5" />
        <Line type="monotone" dataKey="uv" stroke="purple" strokeWidth={2} name="Where we are at" />
        <Line type="monotone" dataKey="pv" stroke="green" strokeWidth={2} name="Where we need to be" strokeDasharray="5 5" />
        <XAxis dataKey="name" />
        <YAxis width={50} />
        <Legend align="right" />
        <Tooltip />
      </LineChart>
    </ResponsiveContainer>
  );
}