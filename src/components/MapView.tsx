import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, GeoJSON, useMapEvent } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { csvParse } from "d3-dsv";
import { useSelectionStore } from "../store/useSelectionStore";

function ZoomListener({ onZoom }) {
  useMapEvent("zoomend", (e) => {
    onZoom(e.target.getZoom());
  });
  return null;
}

function getColorFromValue(value, min, max) {
  const t = (value - min) / (max - min);
  const norm = Math.max(0, Math.min(1, t));
  const lightBlue = [219, 234, 254];
  const darkBlue = [30, 64, 175];
  const rgb = lightBlue.map((l, i) => Math.round(l + (darkBlue[i] - l) * norm));
  return `rgb(${rgb.join(",")})`;
}

export default function MapView({ colorVariable }) {
  const [zoom, setZoom] = useState(6);
  const [gemeindeGeo, setGemeindeGeo] = useState(null);
  const [csvData, setCsvData] = useState({});
  const [valueMinMax, setValueMinMax] = useState(null);

  const geoJsonRef = useRef();
  const selectedGemeinde = useSelectionStore((s) => s.selectedGemeinde);
  const setSelectedGemeinde = useSelectionStore((s) => s.setSelectedGemeinde);

  useEffect(() => {
    fetch("/gemeinde.geo.json")
      .then((res) => res.json())
      .then((data) => setGemeindeGeo(data));

    fetch("/gemeinde_data.csv")
      .then((res) => res.text())
      .then((text) => {
        const parsed = csvParse(text);
        const byAGS = {};
        parsed.forEach((row) => {
          const ags = row.AGS.padStart(5, "0");
          byAGS[ags] = row;
        });
        setCsvData(byAGS);
      });
  }, []);

  useEffect(() => {
    if (!gemeindeGeo || !csvData) return;
    const values = [];
    gemeindeGeo.features.forEach((f) => {
      const ags = f.properties.AGS;
      const row = csvData[ags];
      if (row && row[colorVariable] !== undefined) {
        const num = Number(row[colorVariable]);
        if (!isNaN(num)) values.push(num);
      }
    });
    if (values.length > 0) {
      setValueMinMax([Math.min(...values), Math.max(...values)]);
    }
  }, [gemeindeGeo, csvData, colorVariable]);

  // Style function using CSV data and selection
  const geoStyleGemeinde = (feature) => {
    if (!valueMinMax) return {};
    const ags = feature.properties.AGS;
    const row = csvData[ags];
    let color = "#eee";
    if (row && row[colorVariable] !== undefined) {
      const value = Number(row[colorVariable]);
      if (!isNaN(value)) {
        color = getColorFromValue(value, valueMinMax[0], valueMinMax[1]);
      }
    }
    const isSelected = selectedGemeinde && ags === selectedGemeinde.ags;
    return {
      color: isSelected ? "#1e40af" : "#fff",
      weight: isSelected ? 3 : 1,
      fillColor: color,
      fillOpacity: 0.6,
    };
  };

  // Feature interaction handler
  function createOnEachFeature(type) {
    return (feature, layer) => {
      const name = feature.properties.GEN;
      const ags = feature.properties.AGS;
      const row = csvData[ags];
      let tooltip = name;
      if (row) {
        tooltip += ` (${colorVariable}: ${row[colorVariable]})`;
      }

      layer.bindTooltip(tooltip, {
        permanent: false,
        direction: "top",
        sticky: true,
      });

      layer.on("click", (e) => {
        const current = useSelectionStore.getState().selectedGemeinde;
        if (current && current.ags === ags) {
          useSelectionStore.getState().clearSelectedGemeinde();
          layer.closePopup();
        } else {
          setSelectedGemeinde({ ags, gen: name });

          const valueText =
            row && row[colorVariable] !== undefined
              ? `${colorVariable}: ${row[colorVariable]}`
              : "No data";

          layer
            .bindPopup(`<strong>${name}</strong><br>${valueText}`)
            .openPopup(e.latlng);
        }
      });
    };
  }

  useEffect(() => {
    if (!geoJsonRef.current || !selectedGemeinde) return;

    const frame = requestAnimationFrame(() => {
      const layers = geoJsonRef.current.getLayers();
      layers.forEach((layer) => {
        if (
          layer.feature &&
          layer.feature.properties.AGS === selectedGemeinde.ags &&
          layer.bringToFront
        ) {
          layer.bringToFront();
        }
      });
    });

    return () => cancelAnimationFrame(frame);
  }, [selectedGemeinde, gemeindeGeo, colorVariable]);

  return (
    <>
      <MapContainer
        center={[51.1657, 10.4515]}
        zoom={6}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <TileLayer
          url="https://tiles.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        />
        <ZoomListener onZoom={setZoom} />

        {gemeindeGeo && (
          <GeoJSON
            key={colorVariable}
            data={gemeindeGeo}
            style={geoStyleGemeinde}
            onEachFeature={createOnEachFeature("Gemeinde")}
            ref={geoJsonRef}
          />
        )}
      </MapContainer>
    </>
  );
}
