"use client";
import { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap, CircleMarker } from "leaflet";
import { GRADE_META, type Household, type Grade } from "@/lib/types";
import { GradeDot } from "@/components/ui";
import { RiskMap } from "@/components/RiskMap";

// 합성 그리드 좌표(gx/gy 0~100)를 서울시 일대 실좌표로 투영.
// 지도 배경만 실제이며, 가구 위치·행정동명은 전부 합성 데이터다 (화면에 명시).
const BBOX = { latTop: 37.665, latBottom: 37.445, lngLeft: 126.83, lngRight: 127.155 };
function toLatLng(gx: number, gy: number): [number, number] {
  return [
    BBOX.latTop - (gy / 100) * (BBOX.latTop - BBOX.latBottom),
    BBOX.lngLeft + (gx / 100) * (BBOX.lngRight - BBOX.lngLeft),
  ];
}

const ORDER: Grade[] = ["정상", "관심", "주의", "위기"]; // 위험 가구가 위에 그려지도록
const RADIUS: Record<Grade, number> = { 위기: 9, 주의: 7, 관심: 5.5, 정상: 4 };
const OPACITY: Record<Grade, number> = { 위기: 0.95, 주의: 0.9, 관심: 0.75, 정상: 0.55 };

export function GeoRiskMap({
  households,
  selectedId,
  onSelect,
}: {
  households: Household[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<Record<string, CircleMarker>>({});
  const [status, setStatus] = useState<"loading" | "ready" | "failed">("loading");

  // 지도 초기화 (클라이언트 전용)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const L = (await import("leaflet")).default;
        if (cancelled || !boxRef.current || mapRef.current) return;
        const map = L.map(boxRef.current, {
          center: [37.5519, 126.9918],
          zoom: 11,
          scrollWheelZoom: false, // 페이지 스크롤 방해 방지 (+/- 버튼·드래그는 가능)
          zoomControl: true,
        });
        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 17,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(map);

        const sorted = [...households].sort((a, b) => ORDER.indexOf(a.grade) - ORDER.indexOf(b.grade));
        for (const h of sorted) {
          const m = GRADE_META[h.grade];
          const marker = L.circleMarker(toLatLng(h.gx, h.gy), {
            radius: RADIUS[h.grade],
            fillColor: m.color,
            fillOpacity: OPACITY[h.grade],
            color: "#ffffff",
            weight: 1.5,
          })
            .addTo(map)
            .on("click", () => onSelect(h.id))
            .bindTooltip(`${h.id} · ${h.dong} · ${h.grade} ${h.riskScore}점`, { direction: "top", offset: [0, -6] });
          markersRef.current[h.id] = marker;
        }
        mapRef.current = map;
        setStatus("ready");
        setTimeout(() => map.invalidateSize(), 150);
      } catch {
        if (!cancelled) setStatus("failed");
      }
    })();
    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      markersRef.current = {};
    };
    // households는 시드 고정 합성 데이터로 불변 — 초기화 1회면 충분
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 선택 가구 하이라이트
  useEffect(() => {
    const markers = markersRef.current;
    for (const h of households) {
      const mk = markers[h.id];
      if (!mk) continue;
      const sel = h.id === selectedId;
      mk.setStyle({
        color: sel ? "#1a2233" : "#ffffff",
        weight: sel ? 3 : 1.5,
        radius: sel ? RADIUS[h.grade] + 3 : RADIUS[h.grade],
      });
      if (sel) mk.bringToFront();
    }
  }, [selectedId, households, status]);

  if (status === "failed") return <RiskMap households={households} selectedId={selectedId} onSelect={onSelect} />;

  return (
    <div>
      <div className="relative overflow-hidden rounded-xl border border-line">
        <div ref={boxRef} className="z-0 h-[300px] w-full bg-surface2" aria-label="지역 위험 분포 지도" />
        {status === "loading" && (
          <div className="absolute inset-0 grid place-items-center bg-surface2 text-xs text-muted">지도를 불러오는 중…</div>
        )}
        <span className="absolute right-2 top-2 z-[500] rounded-full border border-amber-200 bg-amber-50/95 px-2 py-0.5 text-[10px] font-semibold text-amber-900">
          가구 위치 · 동명은 합성 좌표
        </span>
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted">
        {(["위기", "주의", "관심", "정상"] as Grade[]).map((g) => (
          <span key={g} className="inline-flex items-center gap-1.5">
            <GradeDot grade={g} />
            {g}
          </span>
        ))}
      </div>
    </div>
  );
}
