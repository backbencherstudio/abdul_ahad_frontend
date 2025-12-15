import React from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Pie } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

export const pieOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: "bottom" as const,
    },
  },
};

export function PieChart({
  labels,
  data,
  colors,
  className,
}: {
  labels: string[];
  data: number[];
  colors?: string[];
  className?: string;
}) {
  const defaultColors = [
    "rgba(34, 197, 94, 0.8)", // green
    "rgba(59, 130, 246, 0.8)", // blue
    "rgba(234, 179, 8, 0.8)", // yellow
    "rgba(239, 68, 68, 0.8)", // red
    "rgba(168, 85, 247, 0.8)", // purple
  ];

  const chartData = {
    labels,
    datasets: [
      {
        data,
        backgroundColor: colors || defaultColors.slice(0, data.length),
        borderColor: colors?.map(c => c.replace('0.8', '1')) || defaultColors.slice(0, data.length).map(c => c.replace('0.8', '1')),
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className={className || "h-56 w-56 mx-auto"}>
      <Pie options={pieOptions} data={chartData} />
    </div>
  );
}

