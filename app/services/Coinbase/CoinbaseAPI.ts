import axios from 'axios';

const COINBASE_API_KEY = 'YOUR_COINBASE_API_KEY_HERE';

interface Product {
  id: string;
  name: string;
  balance: string;
  price: number;
}

export class CoinbaseAPI {
  static async getWalletProducts(address: string): Promise<Product[]> {
    try {
      const response = await axios.get(`https://api.coinbase.com/v2/accounts/${address}/balance`, {
        headers: {
          'Authorization': `Bearer ${COINBASE_API_KEY}`,
        },
      });

      const productData: Product[] = response.data.data.map((account: any) => ({
        id: account.id,
        name: account.name,
        balance: account.balance.amount,
        price: account.native_balance.amount,
      }));

      console.log('Products in wallet:', productData);
      return productData;
    } catch (error) {
      console.error('Error fetching Coinbase products:', error);
      throw error;
    }
  }
}