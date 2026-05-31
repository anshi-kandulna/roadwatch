import json
import re
import pandas as pd
from shapely.geometry import shape, mapping
from shapely import simplify as shapely_simplify

# load files
with open("nh.geojson") as f:
    data = json.load(f)

csv_df = pd.read_csv("GIS_cleaned.csv")

csv_df.columns = ['constituency', 'project_id', 'project_name',
                   'state', 'districts', 'nh_number', 
                   'length_km', 'lane_config', 'work_type', 
                   'contract_type', 'sanctioned_amt_cr', 
                   'physical_progress_pct', 'start_date', 
                   'end_date', 'piu_city', 'piu_contact', 
                   'ro_name', 'ro_contact', 'nh_number_clean']

csv_df['nh_number_clean'] = csv_df['nh_number'].astype(str).str.extract(r'(\d+[A-Za-z]?)')[0].str.lstrip('0')

remap_to_44 = [236, 237, 743, 1178, 1181, 1275, 1293]
remap_to_344 = [44, 920]
csv_df.loc[remap_to_44, 'nh_number_clean'] = '44'
csv_df.loc[remap_to_344, 'nh_number_clean'] = '344'

nh_to_projects = {}
for _, row in csv_df.iterrows():
    nh = str(row['nh_number_clean']).upper()
    if nh not in nh_to_projects:
        nh_to_projects[nh] = []
    nh_to_projects[nh].append({
        'project_name': row['project_name'],
        'start_date': str(row['start_date']),
        'end_date': str(row['end_date']),
        'sanctioned_amt_cr': str(row['sanctioned_amt_cr']),
        'physical_progress_pct': str(row['physical_progress_pct']),
        'state': row['state'],
        'districts': str(row['districts']),
        'work_type': str(row['work_type']),
        'piu_city': str(row['piu_city']),
        'piu_contact': str(row['piu_contact']),
        'ro_name': str(row['ro_name']),
        'ro_contact': str(row['ro_contact'])
    })

def extract_nh_numbers(name):
    matches = re.findall(r'NH\s*([A-Za-z0-9]+)', name, re.IGNORECASE)
    return [m.strip().upper() for m in matches]

def simplify_geometry(geometry, tolerance=0.01):
    try:
        geom = shape(geometry)
        simplified = shapely_simplify(geom, tolerance=tolerance, preserve_topology=True)
        return mapping(simplified)
    except:
        return geometry

# attach projects + filter + simplify in one pass
matched_features = 0
filtered = []
for feature in data['features']:
    name = feature['properties'].get('Name', '')
    nhs = extract_nh_numbers(name)
    projects = []
    for nh in nhs:
        projects.extend(nh_to_projects.get(nh, []))
    
    if projects:
        feature['properties']['projects'] = projects
        filtered.append(feature)  # remove simplify here, we'll merge instead
        matched_features += 1

print(f"features with projects: {matched_features}")

# merge all segments of same NH into one feature
from shapely.ops import linemerge

nh_geometries = {}
nh_properties = {}

for feature in filtered:
    name = feature['properties'].get('Name', '')
    nhs = extract_nh_numbers(name)
    if not nhs:
        continue
    nh = nhs[0]
    
    if nh not in nh_geometries:
        nh_geometries[nh] = []
        nh_properties[nh] = feature['properties']
    
    try:
        nh_geometries[nh].append(shape(feature['geometry']))
    except:
        continue

merged_features = []
for nh, geoms in nh_geometries.items():
    try:
        merged = linemerge(geoms)
        if merged.is_empty:
            continue
        merged_features.append({
            'type': 'Feature',
            'geometry': mapping(merged),
            'properties': nh_properties[nh]
        })
    except:
        continue

print(f"merged into {len(merged_features)} NH features")

# save
with open("nh_enriched.geojson", "w") as f:
    f.write('{"type":"FeatureCollection","features":[')
    for i, feature in enumerate(merged_features):
        if i > 0:
            f.write(',')
        json.dump(feature, f)
    f.write(']}')

print("saved nh_enriched.geojson")