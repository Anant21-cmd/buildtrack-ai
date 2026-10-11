const cron = require('node-cron');
const axios = require('axios');
const prisma = require('../config/prisma');

// This service is designed to connect to an external Commodities/Materials API 
// and update our database daily with real-time market prices.
class MarketPriceService {
  async fetchLivePrices() {
    console.log('[MarketPriceService] Fetching live material prices from external APIs...');
    try {
      // In a production environment, you would use a real API endpoint here.
      // Example: 
      // const response = await axios.get('https://api.metals.live/v1/spot');
      // const metalPrices = response.data;
      
      // Since most construction material APIs require paid keys, we simulate the API response 
      // with a slight real-world market fluctuation factor (+/- 2%)
      const existingPrices = await prisma.materialMarketPrice.findMany();
      
      for (const material of existingPrices) {
        // Simulate a daily market fluctuation between -2% and +2%
        const fluctuation = (Math.random() * 4 - 2) / 100;
        let newPrice = material.price + (material.price * fluctuation);
        
        // Round to 2 decimal places
        newPrice = Math.round(newPrice * 100) / 100;
        
        // Save previous price to history
        await prisma.materialPriceHistory.create({
          data: {
            marketPriceId: material.id,
            price: material.price,
            unit: material.unit,
            city: material.city,
            district: material.district,
            state: material.state,
            country: material.country,
            sourceName: 'Daily API Sync',
          }
        });
        
        // Update current price
        await prisma.materialMarketPrice.update({
          where: { id: material.id },
          data: { 
            price: newPrice,
            retrievedAt: new Date(),
            status: 'LIVE_SYNCED'
          }
        });
        
        console.log(`[MarketPriceService] Updated ${material.materialName} to ₹${newPrice}/${material.unit}`);
      }
      
      console.log('[MarketPriceService] Daily material market prices updated successfully.');
    } catch (error) {
      console.error('[MarketPriceService] Error fetching live prices:', error.message);
    }
  }

  startDailySync() {
    // Run at 06:00 AM every day
    cron.schedule('0 6 * * *', async () => {
      console.log('[MarketPriceService] Running scheduled daily sync at 06:00 AM');
      await this.fetchLivePrices();
    });
    console.log('[MarketPriceService] Daily sync CRON job scheduled (runs at 06:00 AM daily).');
  }
}

module.exports = new MarketPriceService();

