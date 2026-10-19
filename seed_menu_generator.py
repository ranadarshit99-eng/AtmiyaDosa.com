import json
import uuid

with open('backend/app/authentic_menu_data.json', encoding='utf-8') as f:
    data = json.load(f)

restaurant_id = '11111111-1111-1111-1111-111111111111'
namespace = uuid.UUID('6ba7b810-9dad-11d1-80b4-00c04fd430c8')

cat_map = {}

# Step 1: Categories SQL
cat_sql = [
    "DO $$",
    "BEGIN",
    f"    DELETE FROM public.menu_items WHERE restaurant_id = '{restaurant_id}';",
    f"    DELETE FROM public.menu_categories WHERE restaurant_id = '{restaurant_id}';"
]

for i, cat in enumerate(data['categories'], 1):
    c_name = cat['name'].replace("'", "''")
    c_guj = cat.get('gujarati', c_name).replace("'", "''")
    c_icon = cat.get('icon', 'Utensils').replace("'", "''")
    cid = str(uuid.uuid5(namespace, f"category_{cat['name']}"))
    cat_map[cat['name']] = cid
    cat_sql.append(
        f"    INSERT INTO public.menu_categories (id, restaurant_id, name, gujarati_name, icon, display_order, is_active) "
        f"VALUES ('{cid}', '{restaurant_id}', '{c_name}', '{c_guj}', '{c_icon}', {i}, true);"
    )

cat_sql.append("END $$;")

with open('seed_step1_categories.sql', 'w', encoding='utf-8') as f:
    f.write('\n'.join(cat_sql))

# Step 2: Items multi-row INSERT SQL
item_values = []
for item in data['items']:
    iid = str(uuid.uuid5(namespace, f"item_{item['id']}"))
    cid = cat_map[item['category']]
    name = item['name'].replace("'", "''")
    guj_name = item.get('gujarati_name', name).replace("'", "''")
    desc = item.get('description', '').replace("'", "''")
    price = item['price']
    prep_time = item.get('prepTimeMins', 10)
    cat_escaped = item['category'].replace("'", "''")
    tags_sql = f"ARRAY['Authentic', '{cat_escaped}']::text[]"
    item_values.append(
        f"('{iid}', '{restaurant_id}', '{cid}', '{name}', '{guj_name}', '{desc}', {price}, true, true, {prep_time}, NULL, {tags_sql})"
    )

items_sql = (
    "INSERT INTO public.menu_items (id, restaurant_id, category_id, name, gujarati_name, description, price, is_available, is_jain_available, prep_time_mins, image_url, tags)\n"
    "VALUES\n" + ",\n".join(item_values) + ";"
)

with open('seed_step2_items.sql', 'w', encoding='utf-8') as f:
    f.write(items_sql)

print(f"Generated seed_step1_categories.sql ({len(data['categories'])} categories)")
print(f"Generated seed_step2_items.sql ({len(data['items'])} items)")
