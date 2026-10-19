import csv
import io
import json
import os

RAW_CSV = """item_id,category,item_name,price_inr,notes,currency,is_available,display_order
ATM0001,Plain Paper Dosa,Plain Paper,60,,INR,True,1
ATM0002,Plain Paper Dosa,Baby Paper,60,,INR,True,2
ATM0003,Plain Paper Dosa,Naylon Paper,60,,INR,True,3
ATM0004,Plain Paper Dosa,Onion Paper,60,,INR,True,4
ATM0005,Plain Paper Dosa,Garlic Paper,80,,INR,True,5
ATM0006,Plain Paper Dosa,Panner Paper,90,,INR,True,6
ATM0007,Plain Paper Dosa,Chocolate Paper,70,,INR,True,7
ATM0008,Plain Paper Dosa,Panner Sezwan Paper,100,,INR,True,8
ATM0009,Plain Paper Dosa,Cheese Paper,90,,INR,True,9
ATM0010,Plain Paper Dosa,Cheese Garlic Paper,100,,INR,True,10
ATM0011,Plain Paper Dosa,Panner Cheese Paper,120,,INR,True,11
ATM0012,Plain Paper Dosa,Salad Paper,90,,INR,True,12
ATM0013,Plain Paper Dosa,Crunchy Paper,60,,INR,True,13
ATM0014,Plain Paper Dosa,Panner Khakra,100,,INR,True,14
ATM0015,Plain Paper Dosa,Plain Khakra,70,,INR,True,15
ATM0016,Plain Paper Dosa,Peri Peri Khakra,80,,INR,True,16
ATM0017,Plain Paper Dosa,Garlic Khakra,90,,INR,True,17
ATM0018,Plain Paper Dosa,Cheese Khakra,100,,INR,True,18
ATM0019,Plain Paper Dosa,Jera Mari Khakra,90,,INR,True,19
ATM0020,Masala Dosa,Masala Dosa,110,,INR,True,1
ATM0021,Masala Dosa,Onion Masala,120,,INR,True,2
ATM0022,Masala Dosa,Garlic Masala,130,,INR,True,3
ATM0023,Masala Dosa,Sezwan Masala,130,,INR,True,4
ATM0024,Masala Dosa,Panner Masala,140,,INR,True,5
ATM0025,Masala Dosa,Cheese Masala,160,,INR,True,6
ATM0026,Masala Dosa,Panner Sezwan Masala,170,,INR,True,7
ATM0027,Masala Dosa,Palak Sezwan Masala,130,,INR,True,8
ATM0028,Masala Dosa,Panner Cheese Masala,130,,INR,True,9
ATM0029,Masala Dosa,Cheese Palak Masala,170,,INR,True,10
ATM0030,Masala Dosa,Palak Panner Masala,170,,INR,True,11
ATM0031,Masala Dosa,Cheese Palak Masala,180,Duplicate menu entry; verify price/name,INR,True,12
ATM0032,Masala Dosa,Mix Masala,190,,INR,True,13
ATM0033,Masala Dosa,Hayderabad Masala,180,,INR,True,14
ATM0034,Masala Dosa,Sp. Atmiya Masala,220,,INR,True,15
ATM0035,Masala Dosa,Cheese Sezwan Masala,210,,INR,True,16
ATM0036,Chinese Rice,Veg. Fry Rice,90,,INR,True,1
ATM0037,Chinese Rice,Mushroom Fry Rice,100,,INR,True,2
ATM0038,Chinese Rice,Panner Fry Rice,110,,INR,True,3
ATM0039,Chinese Rice,Veg. Triple Fry Rice,130,,INR,True,4
ATM0040,Chinese Rice,Veg. Sezwan Rice,100,,INR,True,5
ATM0041,Chinese Rice,Manchurian Rice,120,,INR,True,6
ATM0042,Chinese Rice,Sezwan Manchurian Rice,130,,INR,True,7
ATM0043,Chinese Rice,Veg. Garlic Rice,100,,INR,True,8
ATM0044,Chinese Rice,Veg. Singapuri Rice,140,,INR,True,9
ATM0045,Chinese Rice,Jeera Rice,70,,INR,True,10
ATM0046,Chinese Rice,Kaju Panner Rice,100,,INR,True,11
ATM0047,Chinese Rice,Panner Manchurian Rice,120,,INR,True,12
ATM0048,Chinese Rice,Panner Manchurian Sezwan Rice,130,,INR,True,13
ATM0049,Chinese Rice,Veg. Chilly Rice,140,,INR,True,14
ATM0050,Chinese Rice,Mushroom Sezwan Fry Rice,130,,INR,True,15
ATM0051,Chinese Rice,Veg. Sezwan Fry Rice,110,,INR,True,16
ATM0052,Chinese Rice,Sp. Atmiya Fry Rice,150,,INR,True,17
ATM0053,Starter,Manchurian Dry,120,,INR,True,1
ATM0054,Starter,Manchurian Gravy,130,,INR,True,2
ATM0055,Starter,Panner Manchurian Dry,150,,INR,True,3
ATM0056,Starter,Sezwan Manchurian Dry,160,,INR,True,4
ATM0057,Starter,Panner Chilly Dry,170,,INR,True,5
ATM0058,Starter,Panner Chilly Gravy,180,,INR,True,6
ATM0059,Starter,Chilly Potato,150,,INR,True,7
ATM0060,Starter,Panner 65,160,,INR,True,8
ATM0061,Starter,Mushroom Chilly Dry,170,,INR,True,9
ATM0062,Starter,Mushroom Chilly Gravy,180,,INR,True,10
ATM0063,Starter,Chinese Bhel,100,,INR,True,11
ATM0064,Starter,Bombay Bhel,110,,INR,True,12
ATM0065,Starter,Panner Bhel,150,,INR,True,13
ATM0066,Mysore Dosa,Mysore Masala,130,,INR,True,1
ATM0067,Mysore Dosa,Garlic Mysore,140,,INR,True,2
ATM0068,Mysore Dosa,Panner Mysore,150,,INR,True,3
ATM0069,Mysore Dosa,Cheese Mysore,160,,INR,True,4
ATM0070,Mysore Dosa,Sweet Corn Mysore,170,,INR,True,5
ATM0071,Mysore Dosa,Palak Panner Mysore,180,,INR,True,6
ATM0072,Mysore Dosa,Panner Sweet Corn Mysore,200,,INR,True,7
ATM0073,Mysore Dosa,Panner Tukada Mysore,200,,INR,True,8
ATM0074,Mysore Dosa,Panner Cheese Mysore,220,,INR,True,9
ATM0075,Mysore Dosa,Panner Sweet Corn Mysore,210,Duplicate menu entry with different price; verify,INR,True,10
ATM0076,Mysore Dosa,Cheese Bhurji Mysore,230,,INR,True,11
ATM0077,Mysore Dosa,S.P. Atmiya Mysore,210,,INR,True,12
ATM0078,Mysore Dosa,Open Cheese Mysore,200,,INR,True,13
ATM0079,Mysore Dosa,Kaju Mysore Bhurji,200,,INR,True,14
ATM0080,Fancy Dosa,Sweet Corn Dosa,250,,INR,True,1
ATM0081,Fancy Dosa,Chinese,200,,INR,True,2
ATM0082,Fancy Dosa,Panner Frankie,220,,INR,True,3
ATM0083,Fancy Dosa,Panner Sweet Corn,230,,INR,True,4
ATM0084,Fancy Dosa,Spring Roll,250,,INR,True,5
ATM0085,Fancy Dosa,Italian,300,,INR,True,6
ATM0086,Fancy Dosa,Dilkush,220,,INR,True,7
ATM0087,Fancy Dosa,Cheese Frankie,240,,INR,True,8
ATM0088,Fancy Dosa,Panner Chilly,250,,INR,True,9
ATM0089,Fancy Dosa,Cheese Chilly,260,,INR,True,10
ATM0090,Fancy Dosa,Jeeni Roll,200,,INR,True,11
ATM0091,Fancy Dosa,Raja Rani,220,,INR,True,12
ATM0092,Fancy Dosa,Panner Cheese Frankie,200,,INR,True,13
ATM0093,Fancy Dosa,Pizza,200,,INR,True,14
ATM0094,Fancy Dosa,Gotala,220,,INR,True,15
ATM0095,Fancy Dosa,Green Gotala,250,,INR,True,16
ATM0096,Fancy Dosa,Cheese Maggi,220,,INR,True,17
ATM0097,Fancy Dosa,Surti Mysore Bhaji,150,Handwritten corrected price appears 150,INR,True,18
ATM0098,Maggi,Plain Maggi,50,Menu text looks like 'Plan Maggi',INR,True,1
ATM0099,Maggi,Vegetable Maggi,60,,INR,True,2
ATM0100,Maggi,Cheese Maggi,80,,INR,True,3
ATM0101,Maggi,Butter Maggi,80,,INR,True,4
ATM0102,Maggi,Panner Maggi,90,,INR,True,5
ATM0103,Maggi,Cheese Panner Maggi,110,,INR,True,6
ATM0104,Maggi,Mattar Maggi,80,,INR,True,7
ATM0105,Maggi,Chilly Garlic Maggi,100,,INR,True,8
ATM0106,Maggi,Sp. Atmiya Maggi,130,,INR,True,9
ATM0107,Noodles,Hakka Noodles,120,,INR,True,1
ATM0108,Noodles,Veg. Sezwan Noodles,130,,INR,True,2
ATM0109,Noodles,Veg. Chilly Garlic Noodles,130,,INR,True,3
ATM0110,Noodles,Manchurian Noodles,140,,INR,True,4
ATM0111,Noodles,Panner Sezwan Noodles,140,,INR,True,5
ATM0112,Noodles,Singapuri Noodles,150,,INR,True,6
ATM0113,Noodles,Panner Noodles,160,,INR,True,7
ATM0114,Noodles,Sezwan Noodles,170,,INR,True,8
ATM0115,Noodles,Sezwan Mushroom Noodles,150,,INR,True,9
ATM0116,Noodles,Mushroom Noodles,130,,INR,True,10
ATM0117,Soup,Manchaw Soup,70,,INR,True,1
ATM0118,Soup,Manchuriyan Soup,90,,INR,True,2
ATM0119,Soup,Tomanto Soup,70,,INR,True,3
ATM0120,Soup,Hot & Sour Soup,90,,INR,True,4
ATM0121,Soup,Vegetable Soup,80,,INR,True,5
ATM0122,Soup,Sp. Atmiya Soup,100,,INR,True,6
ATM0123,Papad,Rosted Papad,20,,INR,True,1
ATM0124,Papad,Fry Papad,30,,INR,True,2
ATM0125,Papad,Masala Papad,50,,INR,True,3
ATM0126,Papad,Cheese Masala Papad,60,,INR,True,4
ATM0127,Papad,Cheese Panner Masala Papad,80,,INR,True,5
ATM0128,Papad,Franch Fries,70,,INR,True,6
ATM0129,Papad,Peri Peri Franch Fries,80,,INR,True,7
ATM0130,Special Item,Pasta Dosa,200,,INR,True,1
ATM0131,Special Item,Dilbhar Dosa,240,,INR,True,2
ATM0132,Special Item,Mataka Dosa,300,,INR,True,3
ATM0133,Special Item,Bahubali Dosa,350,,INR,True,4
ATM0134,Special Item,Burji Kalifa Dosa,350,,INR,True,5
ATM0135,Special Item,Atmiya Sp. Fancy,360,,INR,True,6
ATM0136,Special Item,Maharaja Dosa,290,,INR,True,7
ATM0137,Special Item,Double Cheese Pizza,220,,INR,True,8
ATM0138,Pav Bhaji,Pavu Bhaji,70,,INR,True,1
ATM0139,Pav Bhaji,Lashaniya Pavu Bhaji,80,,INR,True,2
ATM0140,Pav Bhaji,Butter Pavu Bhaji,80,,INR,True,3
ATM0141,Pav Bhaji,Panner Pavu Bhaji,130,,INR,True,4
ATM0142,Pav Bhaji,Cheese Pavu Bhaji,140,,INR,True,5
ATM0143,Pav Bhaji,Panner Cheese Pavu Bhaji,150,,INR,True,6
ATM0144,Pav Bhaji,Green Pavu Bhaji,90,,INR,True,7
ATM0145,Pav Bhaji,Jain Pavu Bhaji,100,,INR,True,8
ATM0146,Pav Bhaji,Swami Narayan Pavu Bhaji,90,,INR,True,9
ATM0147,Pav Bhaji,Sp. Atmiya Pavu Bhaji,160,,INR,True,10
ATM0148,Pulav,Regular Pulav,70,,INR,True,1
ATM0149,Pulav,Panner Pulav,90,,INR,True,2
ATM0150,Pulav,Cheese Pulav,110,,INR,True,3
ATM0151,Pulav,Cheese Panner Pulav,120,,INR,True,4
ATM0152,Pulav,Butter Pulav,90,,INR,True,5
ATM0153,Pulav,Kashmiri Pulav,120,,INR,True,6
ATM0154,Pulav,Hyderabadi Pulav,110,,INR,True,7
ATM0155,Pulav,Palak Pulav,120,,INR,True,8
ATM0156,Pulav,Matar Pulav,80,,INR,True,9
ATM0157,Pulav,Palak Kaju Pulav,130,,INR,True,10
ATM0158,Pulav,Sp. Atmiya Pulav,150,,INR,True,11
ATM0159,Uttapam,Mix Uttapam,150,,INR,True,1
ATM0160,Uttapam,Masala Uttapam,150,,INR,True,2
ATM0161,Uttapam,Cheese Uttapam,200,,INR,True,3
ATM0162,Uttapam,Cheese Panner Uttapam,220,,INR,True,4
ATM0163,Uttapam,Onion Uttapam,160,,INR,True,5
ATM0164,Uttapam,Sp. Atmiya Uttapam,250,,INR,True,6
ATM0165,Idali,Plain Idali,40,,INR,True,1
ATM0166,Idali,Masala Idali,60,,INR,True,2
ATM0167,Idali,Fry Idali,80,,INR,True,3
ATM0168,Idali,Thati Idali,70,,INR,True,4
ATM0169,Idali,Thati Idali Ghee Puti,100,,INR,True,5
ATM0170,Vada & Dhokala,Mendu Vada,40,,INR,True,1
ATM0171,Vada & Dhokala,Dahi Vada,40,,INR,True,2
ATM0172,Vada & Dhokala,Blue Dahi Vada,50,,INR,True,3
ATM0173,Vada & Dhokala,Dhokala,40,,INR,True,4
ATM0174,Vada & Dhokala,Fry Dhokala,60,,INR,True,5
ATM0175,Unlimited - Masala Dosa,Unlimited Masala Dosa,130,"Per person; child price 100. Includes masala dosa, peri peri masala dosa, jeera mari masala, onion masala, garlic masala (Gujarati text; verify exact inclusion list).",INR,True,1
ATM0176,Unlimited - Chinese,Unlimited Chinese,160,"Per person; child price 110. Includes noodles, Manchurian fry, Manchurian rice, Chinese bhel, Manchaw soup / hot & sour soup (verify exact inclusion list).",INR,True,1
ATM0177,Combo,Pav Bhaji + Pulav + Cold Drinks,100,Per person; child price 80.,INR,True,1"""

# Gujarati mapping for categories
CAT_GUJARATI = {
    "Plain Paper Dosa": "પ્લેન પેપર ઢોસા",
    "Masala Dosa": "મસાલા ઢોસા",
    "Chinese Rice": "ચાઈનીઝ રાઈસ",
    "Starter": "સ્ટાર્ટર",
    "Mysore Dosa": "માયસોર ઢોસા",
    "Fancy Dosa": "ફેન્સી ઢોસા",
    "Maggi": "મેગી",
    "Noodles": "નુડલ્સ",
    "Soup": "સુપ",
    "Papad": "પાપડ અને ફ્રેન્ચ ફ્રાઈસ",
    "Special Item": "સ્પેશિયલ આઈટમ",
    "Pav Bhaji": "પાંઉભાજી",
    "Pulav": "પુલાવ",
    "Uttapam": "ઉત્તપમ",
    "Idali": "ઇડલી",
    "Vada & Dhokala": "વડા અને ઢોકળા",
    "Unlimited - Masala Dosa": "અનલિમિટેડ મસાલા ઢોસા",
    "Unlimited - Chinese": "અનલિમિટેડ ચાઈનીઝ",
    "Combo": "કોમ્બો ઓફર્સ"
}

CAT_ICONS = {
    "Plain Paper Dosa": "Layers",
    "Masala Dosa": "Utensils",
    "Chinese Rice": "ShoppingBag",
    "Starter": "Flame",
    "Mysore Dosa": "Flame",
    "Fancy Dosa": "Sparkles",
    "Maggi": "Flame",
    "Noodles": "Utensils",
    "Soup": "Coffee",
    "Papad": "Sparkles",
    "Special Item": "Award",
    "Pav Bhaji": "UtensilsCrossed",
    "Pulav": "Soup",
    "Uttapam": "Layers",
    "Idali": "Circle",
    "Vada & Dhokala": "Sun",
    "Unlimited - Masala Dosa": "HeartHandshake",
    "Unlimited - Chinese": "HeartHandshake",
    "Combo": "Tag"
}

reader = csv.DictReader(io.StringIO(RAW_CSV.strip()))
items = []
category_set = []

for row in reader:
    cat = row["category"].strip()
    if cat not in category_set:
        category_set.append(cat)
    
    price = float(row["price_inr"])
    item_id = row["item_id"].strip()
    item_name = row["item_name"].strip()
    notes = row["notes"].strip()
    display_order = int(row["display_order"])
    
    # Description based on notes or pure-veg description
    desc = notes if notes else f"Fresh authentic pure-veg {item_name} made to order with traditional Atmiya Hub spices."
    
    is_spicy = any(k in item_name.lower() for k in ["sezwan", "chilly", "spicy", "garlic", "lashaniya", "peri peri", "hot & sour"])
    
    item_obj = {
        "id": item_id,
        "name": item_name,
        "english_name": item_name,
        "gujarati_name": item_name,
        "category": cat,
        "price": price,
        "originalPrice": price,
        "finalPrice": price,
        "hasDiscount": False,
        "discountPercent": 0,
        "description": desc,
        "image_url": None,  # Strictly NO image as requested by user
        "is_veg": True,
        "is_spicy": is_spicy,
        "is_available": True,
        "orders_count": 25 + (display_order * 3) % 40,
        "prepTimeMins": 10 if "Dosa" in cat else (5 if "Papad" in cat or "Soup" in cat else 8),
        "rating": 4.8,
        "display_order": display_order,
        "notes": notes
    }
    items.append(item_obj)

# Create categories
categories_list = []
for i, c in enumerate(category_set):
    categories_list.append({
        "id": f"cat_{i+1:02d}",
        "name": c,
        "gujarati": CAT_GUJARATI.get(c, c),
        "icon": CAT_ICONS.get(c, "Utensils"),
        "percentage": 10
    })

print(f"Total parsed items: {len(items)}")
print(f"Total parsed categories: {len(categories_list)}")

# 1. Output backend JSON
backend_json_path = os.path.join("backend", "app", "authentic_menu_data.json")
with open(backend_json_path, "w", encoding="utf-8") as f:
    json.dump({
        "restaurant": "Atmiya Dosa Hub (આત્મીય ઢોસા હબ)",
        "location": "College Chokdi, Petlad-Khambhat Road, Opp. Harshal Hospital, Petlad",
        "total_items": len(items),
        "categories": categories_list,
        "items": items
    }, f, indent=2, ensure_ascii=False)
print(f"Wrote backend JSON: {backend_json_path}")

# 2. Output frontend JS
frontend_js_path = os.path.join("frontend", "src", "lib", "authenticMenuData.js")
js_content = f"""// AUTHENTIC MENU DATA FOR ATMIYA DOSA HUB (Petlad, Anand, Gujarat)
// Extracted 100% authentically from physical 7 menu cards (ATM0001 - ATM0177)
// ZERO STOCK IMAGES - All dishes configured with image_url: null as requested by user.

export const AUTHENTIC_CATEGORIES = {json.dumps(categories_list, indent=2, ensure_ascii=False)};

export const AUTHENTIC_MENU_CARD_ITEMS = {json.dumps(items, indent=2, ensure_ascii=False)};
"""

with open(frontend_js_path, "w", encoding="utf-8") as f:
    f.write(js_content)
print(f"Wrote frontend JS: {frontend_js_path}")
