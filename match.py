import json
import re

with open("nh.geojson") as f:
    data = json.load(f)

def extract_nh_numbers(name):
    # extract all NH numbers from a name string
    # handles "NH 44", "NH 7,  NH 5", "NH 16,  NH 316A" etc
    matches = re.findall(r'NH\s*([A-Za-z0-9]+)', name, re.IGNORECASE)
    return [m.strip().upper() for m in matches]

# build lookup: nh_number → list of features
nh_to_features = {}
for feature in data['features']:
    name = feature['properties'].get('Name', '')
    for nh in extract_nh_numbers(name):
        if nh not in nh_to_features:
            nh_to_features[nh] = []
        nh_to_features[nh].append(feature)

print(f"{len(nh_to_features)} unique NHs after extraction")

# check how many of your CSV NHs match
import pandas as pd
csv_df = pd.read_csv("GIS_cleaned.csv")
csv_df['nh_number_clean'] = csv_df['nh_number_clean'].str.lstrip('0')
csv_nhs = set(csv_df['nh_number_clean'].str.upper().dropna())

matched = csv_nhs & set(nh_to_features.keys())
unmatched = csv_nhs - set(nh_to_features.keys())

print(f"Matched: {len(matched)}/{len(csv_nhs)}")
print(f"Unmatched: {sorted(unmatched)[:20]}")

# print all GeoJSON NH numbers that contain '20'
matches = [k for k in nh_to_features.keys() if '20' in k]
print(sorted(matches))

# print all GeoJSON NH numbers that contain '15'
matches = [k for k in nh_to_features.keys() if '15' in k]
print(sorted(matches))

# print([k for k in nh_to_features.keys() if k in ['7', '5', '9', '6']])

# print(csv_df[csv_df['nh_number_clean'].isin(['5','6','7','9'])]['nh_number_clean'].value_counts())

# print([k for k in nh_to_features.keys() if k == '44'])

# print(csv_df[csv_df['nh_number_clean'].isin(['5','6','7','9'])][['project_name','start_date','end_date']].head(10).to_string())

print(len(data['features']))
print(sorted(nh_to_features.keys(), key=lambda x: (len(x), x)))
# for f in data['features']:
#     name = f['properties'].get('Name', '')
#     if re.search(r'\bNH\s*(7|44)\b', name, re.IGNORECASE):
#         print(name)


# print(csv_df[csv_df['nh_number_clean'].isin(['5','6','7','9'])][
#     ['project_name', 'nh_number_clean', 'nh_number', 'state']
# ].to_string())

# check how many unique PIU cities you have
print(csv_df[['piu_city', 'piu_contact', 'ro_name', 'ro_contact']].drop_duplicates().shape)
print(csv_df['piu_city'].nunique())