// components/RightSidebar.tsx
import React, { useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

import { useSelectionStore } from "../store/useSelectionStore";

import { useGemeindeData } from "../utils/useGemeindeData";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#845EC2",
  "#FF6F91",
  "#2C73D2",
  "#FFC75F",
];

const RightSidebar: React.FC<{ colorVariable: string }> = ({
  colorVariable,
}) => {
  const gemeindeData = useGemeindeData();
  const selectedGemeinde = useSelectionStore((s) => s.selectedGemeinde);

  const chartData = useMemo(() => {
    if (!selectedGemeinde || !colorVariable || !gemeindeData) return null;

    const selectedAGS = selectedGemeinde.ags;
    const bundeslandCode = selectedAGS.slice(0, 4);

    return gemeindeData
      .filter((row) => row.AGS.slice(0, 4) === bundeslandCode)
      .map((row) => ({
        name: row.GEN,
        value: Number(row[colorVariable] as string) || 0,
      }))
      .filter((d) => d.value > 0);
  }, [selectedGemeinde, colorVariable, gemeindeData]);

  return (
    <div className="p-4">
      {selectedGemeinde ? (
        <div className="flex flex-col h-screen">
          <p className="mb-4 text-gray-300">
            <strong>Selected Gemeinde:</strong> {selectedGemeinde.gen}
          </p>

          {chartData && chartData.length > 0 ? (
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    label
                    outerRadius={180}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p>No data available</p>
          )}
        </div>
      ) : (
        <p>No region selected</p>
      )}
    </div>
  );
};

export default RightSidebar;
