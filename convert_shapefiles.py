"""
Group 3 Survey Data - Shapefile to GeoJSON Converter
CE673M / CE673A | IIT Kanpur
Usage: python convert_shapefiles.py
Requires: geopandas, pyproj
"""

import geopandas as gpd
import pandas as pd
from pathlib import Path
import json, csv
from pyproj import Transformer

# ── CONFIGURATION ──
INPUT_DIR  = Path("./shapefiles")   # folder containing .shp files
OUTPUT_DIR = Path("./geojson")      # output folder
OUTPUT_DIR.mkdir(exist_ok=True)

# UTM Zone 44N → WGS84
TRANSFORMER = Transformer.from_crs("EPSG:32644", "EPSG:4326", always_xy=True)

# ── LEGEND ABBREVIATIONS ──
LEGEND_MAP = {
    "BC": "Building Corner", "CB": "Building Corner", "CP": "Control Point",
    "CE": "Control Point",   "SL": "Street Light",    "TREE": "Tree",
    "T":  "Tree",            "FH": "Fire Hydrant",    "FL": "Fire Hydrant",
    "MH": "Manhole",         "MN": "Manhole",         "SH": "Spot Height",
    "RD": "Road",            "PV": "Pavement",        "PS": "Parking Space",
    "SB": "Seating Bench",   "TBM": "Temporary Benchmark",
    "SA": "Seating Area",   "DR": "Drain",
}

COLOR_MAP = {
    "Building Corner":    "#FF6B6B", "Control Point":     "#FFD93D",
    "Street Light":       "#6BCB77", "Tree":              "#228B22",
    "Fire Hydrant":       "#FF4500", "Manhole":           "#9B59B6",
    "Spot Height":        "#00BCD4", "Road":              "#78909C",
    "Pavement":           "#FF9800", "Parking Space":     "#3F51B5",
    "Seating Bench":      "#795548", "Temporary Benchmark": "#E91E63",
    "Survey Anchor":      "#009688", "Drain":             "#8BC34A",
}

def convert_csv_to_geojson(csv_path: Path, out_path: Path):
    """Convert a raw TS CSV (Station,N,E,Z,ID) to GeoJSON."""
    features = []
    with open(csv_path, newline="") as f:
        reader = csv.DictReader(f)
        for row in reader:
            try:
                e, n, z = float(row["E"]), float(row["N"]), float(row["Z"])
                code = row["ID"].strip().upper()
                label = LEGEND_MAP.get(code, code)
                lon, lat = TRANSFORMER.transform(e, n)
                features.append({
                    "type": "Feature",
                    "geometry": {"type": "Point", "coordinates": [round(lon,7), round(lat,7)]},
                    "properties": {
                        "station": row["Station"], "easting": round(e,3),
                        "northing": round(n,3), "elevation": round(z,3),
                        "code": code, "label": label,
                        "color": COLOR_MAP.get(label, "#AAAAAA"),
                    }
                })
            except (ValueError, KeyError):
                continue
    geojson = {"type": "FeatureCollection", "features": features}
    with open(out_path, "w") as f:
        json.dump(geojson, f, indent=2)
    print(f"  ✓ {out_path.name}  ({len(features)} features)")
    return len(features)

def convert_shapefile_to_geojson(shp_path: Path, out_path: Path):
    """Convert any shapefile to WGS84 GeoJSON with enriched properties."""
    gdf = gpd.read_file(shp_path)
    # Reproject to WGS84 if needed
    if gdf.crs and gdf.crs.to_epsg() != 4326:
        gdf = gdf.to_crs(epsg=4326)
    elif gdf.crs is None:
        # Assume UTM 44N
        gdf = gdf.set_crs(epsg=32644, allow_override=True).to_crs(epsg=4326)
    # Enrich with label/color from ID column (if present)
    if "ID" in gdf.columns:
        gdf["code"] = gdf["ID"].astype(str).str.strip().str.upper()
        gdf["label"] = gdf["code"].map(LEGEND_MAP).fillna(gdf["code"])
        gdf["color"] = gdf["label"].map(COLOR_MAP).fillna("#AAAAAA")
    gdf.to_file(out_path, driver="GeoJSON")
    print(f"  ✓ {out_path.name}  ({len(gdf)} features)")
    return len(gdf)

def main():
    total = 0
    print("\n── Group 3 Survey Data Converter ──")
    # 1. Auto-detect CSVs in current directory
    for csv_file in Path(".").glob("**/*.csv"):
        out = OUTPUT_DIR / (csv_file.stem + ".geojson")
        print(f"\nCSV → GeoJSON: {csv_file}")
        try:
            total += convert_csv_to_geojson(csv_file, out)
        except Exception as e:
            print(f"  ✗ Error: {e}")
    # 2. Auto-detect shapefiles
    for shp in INPUT_DIR.glob("**/*.shp"):
        out = OUTPUT_DIR / (shp.stem + ".geojson")
        print(f"\nSHP → GeoJSON: {shp}")
        try:
            total += convert_shapefile_to_geojson(shp, out)
        except Exception as e:
            print(f"  ✗ Error: {e}")
    print(f"\n── Done! {total} total features exported to ./{OUTPUT_DIR}/ ──\n")

if __name__ == "__main__":
    main()
