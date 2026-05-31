import pandas as pd
import json

piu_df = pd.read_csv('piu_geocoded.csv')
piu_df = piu_df.dropna(subset=['lat', 'lng'])

piu_list = piu_df[['piu_city', 'piu_contact', 'ro_name', 'ro_contact', 'lat', 'lng']].to_dict('records')

with open('frontend/public/piu_locations.json', 'w') as f:
    json.dump(piu_list, f)

print(f"saved {len(piu_list)} PIU locations")