# import requests
# import json
# import time
# import pandas as pd

# def fetch_nh_batch(nh_numbers):
#     # build union of ways for each NH number
#     ways = "\n".join([
#         f'way["ref"~"NH {nh}$|NH-{nh}$"](4.0,68.0,37.0,97.0);'
#         for nh in nh_numbers
#     ])
    
#     query = f"""
#     [out:json][timeout:90];
#     (
#     {ways}
#     );
#     out geom;
#     """
    
#     response = requests.post(
#         "https://overpass-api.de/api/interpreter",
#         data={"data": query},
#         headers={"Content-Type": "application/x-www-form-urlencoded"},
#         timeout=90
#     )
    
#     print(f"  Status: {response.status_code}, Size: {len(response.text)} chars")
    
#     if response.status_code != 200 or not response.text.strip():
#         print(f"  Empty/error response")
#         return {"elements": []}
    
#     return response.json()

# def fetch_all_nhs(nh_list, batch_size=10):  # smaller batch size
#     all_features = []
#     batches = [nh_list[i:i+batch_size] for i in range(0, len(nh_list), batch_size)]
    
#     for i, batch in enumerate(batches):
#         print(f"Batch {i+1}/{len(batches)}: {batch}")
#         try:
#             data = fetch_nh_batch(batch)
#             count = 0
#             for element in data.get('elements', []):
#                 if element['type'] == 'way' and 'geometry' in element:
#                     coords = [[pt['lon'], pt['lat']] for pt in element['geometry']]
#                     feature = {
#                         "type": "Feature",
#                         "properties": {
#                             "nh_ref": element.get('tags', {}).get('ref', ''),
#                             "name": element.get('tags', {}).get('name', ''),
#                         },
#                         "geometry": {
#                             "type": "LineString",
#                             "coordinates": coords
#                         }
#                     }
#                     all_features.append(feature)
#                     count += 1
#             print(f"  Got {count} segments")
#         except Exception as e:
#             print(f"  Failed: {e}")
        
#         time.sleep(3)
    
#     geojson = {"type": "FeatureCollection", "features": all_features}
#     with open("all_nhs.geojson", "w") as f:
#         json.dump(geojson, f)
    
#     print(f"Done! {len(all_features)} total segments saved to all_nhs.geojson")

# csv_df = pd.read_csv("GIS_cleaned.csv")
# nh_list = csv_df['nh_number_clean'].dropna().unique().tolist()
# print(f"Fetching {len(nh_list)} unique NHs")

# fetch_all_nhs(nh_list, batch_size=10)

import json

with open("nh.geojson") as f:
    data = json.load(f)

names = set(f['properties']['Name'] for f in data['features'])
print(len(names), "unique NHs")
print(list(names)[:20])

