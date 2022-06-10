import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Slider,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import maplibregl, { GeoJSONSource, LngLat } from "maplibre-gl";
import { useTranslation } from "next-i18next";
import { useRef, useEffect, useState } from "react";
import "maplibre-gl/dist/maplibre-gl.css";
import makeCircle from "@turf/circle";
import { useRouter } from "next/router";

type Props = {
  open: boolean;
  value?: { center: LngLat; zoom: number; radius: number };
  onClose: (result?: { center: LngLat; zoom: number; radius: number }) => void;
  readOnly?: boolean;
};

export function MapDialog({ open, onClose, value, readOnly }: Props) {
  const { t } = useTranslation();

  const [mapContainer, setMapContainer] = useState<HTMLDivElement | null>(null);

  const [map, setMap] = useState<maplibregl.Map>();

  const [center, setCenter] = useState<LngLat | undefined>(value?.center);

  useEffect(() => {
    if (!mapContainer) {
      return;
    }

    const map = new maplibregl.Map({
      container: mapContainer,
      style: `https://api.maptiler.com/maps/streets/style.json?key=0iOk4fgsz9fOXyDYCirE`,
      center: value?.center ?? [14, 48],
      zoom: value?.zoom ?? 2,
    });

    map.addControl(new maplibregl.NavigationControl({}), "top-right");

    if (!readOnly) {
      map.on("click", (ev) => {
        setCenter(ev.lngLat);
      });

      map.getCanvas().style.cursor = "default";
    }

    map.on("load", () => {
      map.addSource("circle", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [],
        },
      });

      map.addLayer({
        id: "searchResultPoly",
        type: "fill",
        source: "circle",
        layout: {},
        paint: {
          "fill-color": "blue",
          "fill-opacity": 0.1,
        },
      });

      setMap(map);
    });

    return () => {
      map.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapContainer, readOnly]);

  useEffect(() => {
    if (!map || !center) {
      return;
    }

    const marker = new maplibregl.Marker().setLngLat(center).addTo(map);

    if (!readOnly) {
      marker.getElement().style.cursor = "default";
    }

    return () => {
      marker.remove();
    };
  }, [center, map, readOnly]);

  const [radius, setRadius] = useState(
    value?.radius ? Math.pow(value?.radius, 1 / 10) : 0
  );

  useEffect(() => {
    if (!map || !center) {
      return;
    }

    (map.getSource("circle") as GeoJSONSource).setData({
      type: "FeatureCollection",
      features: [
        makeCircle([center.lng, center.lat], Math.pow(radius, 10), {
          units: "meters",
        }),
      ],
    });
  }, [radius, center, map]);

  const { locale } = useRouter();

  const nf0 = new Intl.NumberFormat(locale, { maximumFractionDigits: 0 });

  const nf1 = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 });

  const theme = useTheme();

  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Dialog
      fullWidth
      maxWidth="xl"
      fullScreen={fullScreen}
      open={open}
      onClose={() => onClose()}
    >
      <DialogTitle>{t(readOnly ? "Place" : "SetPositionTitle")}</DialogTitle>

      <DialogContent>
        <Box
          sx={{
            height: fullScreen ? "100%" : "70vh",
            minHeight: "300px",
            position: "relative",
          }}
        >
          <Box
            sx={{
              position: "absolute !important",
              inset: 0,
            }}
            ref={setMapContainer}
          />
        </Box>

        {!readOnly && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 3, mt: 2 }}>
            <Typography sx={{ flexShrink: 0 }}>{t("Radius")}</Typography>

            <Slider
              disabled={!center}
              min={0.9}
              max={3.5}
              step={0.0001}
              valueLabelDisplay="auto"
              valueLabelFormat={(a) => {
                const m = Math.pow(a, 10);

                return (
                  (m >= 1000 && m < 10000 ? nf1 : nf0).format(
                    m > 1000 ? m / 1000 : m
                  ) + (m > 1000 ? " km" : "m")
                );
              }}
              value={radius}
              onChange={(_, a) => setRadius(a as number)}
            />
          </Box>
        )}
      </DialogContent>

      {readOnly ? (
        <DialogActions>
          <Button onClick={() => onClose()}>{t("Close")}</Button>
        </DialogActions>
      ) : (
        <DialogActions>
          <Button onClick={() => setCenter(undefined)} disabled={!center}>
            {t("Clear")}
          </Button>

          <Divider orientation="vertical" flexItem sx={{ ml: 1 }} />

          <Button
            onClick={() =>
              onClose(
                center && {
                  center,
                  zoom: map?.getZoom() ?? 2,
                  radius: Math.pow(radius ?? 0, 10),
                }
              )
            }
          >
            {t("Save")}
          </Button>

          <Button variant="text" onClick={() => onClose()}>
            {t("Cancel")}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
}
