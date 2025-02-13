import requests
import pandas as pd
from datetime import datetime, timedelta
import time

# ======================= Configuration =======================

# Target cryptocurrency symbol
TARGET_SYMBOL = "MAGA"  # You can change this to any symbol you want to search for

# Coinbase Pro API endpoints
COINBASE_PRO_API_BASE_URL = "https://api.pro.coinbase.com"

# Coinbase API endpoint for spot prices
COINBASE_API_BASE_URL = "https://api.coinbase.com/v2/prices"

# ======================= Helper Functions =======================

def get_all_products():
    """
    Fetches all available trading pairs (products) from Coinbase Pro.
    
    :return: List of products if successful, else None
    """
    try:
        url = f"{COINBASE_PRO_API_BASE_URL}/products"
        response = requests.get(url)
        if response.status_code == 200:
            products = response.json()
            print(products)
            return products
        else:
            print(f"Error: Unable to fetch products. HTTP Status Code: {response.status_code}")
            return None
    except Exception as e:
        print(f"Exception occurred while fetching products: {e}")
        return None

def find_product_by_symbol(products, symbol):
    """
    Searches for a product by its base currency symbol.
    
    :param products: List of products fetched from Coinbase Pro
    :param symbol: The base currency symbol to search for (e.g., "BTC")
    :return: Product dictionary if found, else None
    """
    for product in products:
        if product['base_currency'].upper() == symbol.upper():
            return product
    return None

def get_current_price(symbol):
    """
    Fetches the current spot price of a cryptocurrency from Coinbase.
    
    :param symbol: Cryptocurrency symbol (e.g., BTC, ETH)
    :return: Current price in USD as float if successful, else None
    """
    try:
        url = f"{COINBASE_API_BASE_URL}/{symbol}-USD/spot"
        response = requests.get(url)
        if response.status_code == 200:
            data = response.json()
            price = float(data["data"]["amount"])
            return price
        else:
            print(f"Error: Unable to fetch current price for {symbol}. HTTP Status Code: {response.status_code}")
            return None
    except Exception as e:
        print(f"Exception occurred while fetching current price for {symbol}: {e}")
        return None

def get_historical_price(product_id, target_date):
    """
    Fetches the historical spot price of a cryptocurrency from Coinbase Pro's API.
    
    :param product_id: Trading pair ID (e.g., BTC-USD)
    :param target_date: datetime.date object representing the target date
    :return: Historical price in USD as float if successful, else None
    """
    try:
        # Coinbase Pro API endpoint for historical rates (candles)
        granularity = 86400  # 1 day in seconds

        # Calculate the start and end timestamps
        start = datetime.combine(target_date, datetime.min.time())
        end = start + timedelta(days=1)
        start_iso = start.isoformat()
        end_iso = end.isoformat()

        url = f"{COINBASE_PRO_API_BASE_URL}/products/{product_id}/candles"
        params = {
            "start": start_iso,
            "end": end_iso,
            "granularity": granularity
        }

        response = requests.get(url, params=params)
        if response.status_code == 200:
            data = response.json()
            if data:
                # Coinbase Pro returns [ time, low, high, open, close, volume ]
                # We'll use the 'close' price for the day
                close_price = float(data[0][4])
                return close_price
            else:
                print(f"No historical data available for {product_id} on {target_date}")
                return None
        else:
            print(f"Error: Unable to fetch historical price for {product_id} on {target_date}. HTTP Status Code: {response.status_code}")
            return None
    except Exception as e:
        print(f"Exception occurred while fetching historical price for {product_id} on {target_date}: {e}")
        return None

# ======================= Main Function =======================

def main():
    # Step 1: Fetch all products from Coinbase Pro
    products = get_all_products()
    if products is None:
        print("Failed to retrieve products. Exiting.")
        return

    # Step 2: Search for the target symbol
    product = find_product_by_symbol(products, TARGET_SYMBOL)
    if product:
        product_id = product['id']
        print(f"Found product for symbol '{TARGET_SYMBOL}': {product_id}")
    else:
        print(f"Symbol '{TARGET_SYMBOL}' not found on Coinbase Pro.")
        product_id = None

    # Step 3: If product exists, fetch current and historical prices
    if product_id:
        # Calculate dates for 1 day ago and 1 week ago
        today = datetime.utcnow().date()
        one_day_ago = today - timedelta(days=1)
        one_week_ago = today - timedelta(weeks=1)

        # Fetch current price
        current_price = get_current_price(TARGET_SYMBOL)
        if current_price is None:
            current_price_display = "N/A"
        else:
            current_price_display = f"${current_price:,.2f}"

        # Pause to respect API rate limits
        time.sleep(1)

        # Fetch price from 1 day ago
        price_one_day = get_historical_price(product_id, one_day_ago)
        if price_one_day is None:
            price_one_day_display = "N/A"
        else:
            price_one_day_display = f"${price_one_day:,.2f}"

        # Pause to respect API rate limits
        time.sleep(1)

        # Fetch price from 1 week ago
        price_one_week = get_historical_price(product_id, one_week_ago)
        if price_one_week is None:
            price_one_week_display = "N/A"
        else:
            price_one_week_display = f"${price_one_week:,.2f}"
    else:
        current_price_display = "N/A"
        price_one_day_display = "N/A"
        price_one_week_display = "N/A"

    # Step 4: Organize data into a Pandas DataFrame
    data = {
        "Coin": [TARGET_SYMBOL],
        "Price 1 Week Ago (USD)": [price_one_week_display],
        "Price 1 Day Ago (USD)": [price_one_day_display],
        "Current Price (USD)": [current_price_display],
        "Funding Rate": ["N/A"],  # Placeholder as Coinbase does not provide this
        "Basis (USD)": ["N/A"]      # Placeholder as Coinbase does not provide this
    }

    df = pd.DataFrame(data)

    # Step 5: Display the DataFrame
    print("\n=== Cryptocurrency Price Data ===")
    print(df.to_string(index=False))

    # Optional: Save the DataFrame to a CSV file.
    # df.to_csv("crypto_price_data.csv", index=False)

# ======================= Execution Entry Point =======================

if __name__ == "__main__":
    main()
