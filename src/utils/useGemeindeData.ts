import { useEffect, useState } from "react";
import Papa from "papaparse";
import type GemeindeData from "./types";

export function useGemeindeData(): GemeindeData[] | null {
  const [data, setData] = useState<GemeindeData[] | null>(null);

  useEffect(() => {
    fetch("/gemeinde_data.csv")
      .then((response) => response.text())
      .then((csvText) => {
        Papa.parse<GemeindeData>(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (result) => {
            // Post-process AGS to ensure 5 digits
            const fixedData = result.data.map((row) => ({
              ...row,
              AGS: row.AGS ? String(row.AGS).padStart(5, "0") : "",
            }));
            setData(fixedData);
          },
        });
      });
  }, []);

  return data;
}
