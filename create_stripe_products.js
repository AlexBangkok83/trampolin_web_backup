// create_stripe_products.js
//
// Usage:
//   STRIPE_SECRET_KEY=sk_test_xxx node create_stripe_products.js
//
// This will create Bronze, Silver, Gold products + prices (monthly/annual)
// for Trampolin Facebook Ads Analytics.

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20', // use the latest stable API
});

async function main() {
  try {
    console.log('🚀 Creating Trampolin subscription products (Bronze, Silver, Gold)...\n');

    // --- Bronze Plan (500 URLs, $29/month) ---
    console.log('Creating Bronze Plan...');
    const bronze = await stripe.products.create({
      name: 'Bronze Plan',
      description:
        '500 URL analyses per month - Perfect for small businesses and individual marketers',
    });

    const bronzeMonthly = await stripe.prices.create({
      product: bronze.id,
      currency: 'usd',
      unit_amount: 2900, // $29.00
      recurring: { interval: 'month' },
    });

    const bronzeAnnual = await stripe.prices.create({
      product: bronze.id,
      currency: 'usd',
      unit_amount: 27840, // $278.40 (4% discount)
      recurring: { interval: 'year' },
    });

    // --- Silver Plan (1000 URLs, $39/month) ---
    console.log('Creating Silver Plan...');
    const silver = await stripe.products.create({
      name: 'Silver Plan',
      description: '1,000 URL analyses per month - Ideal for agencies and growing businesses',
    });

    const silverMonthly = await stripe.prices.create({
      product: silver.id,
      currency: 'usd',
      unit_amount: 3900, // $39.00
      recurring: { interval: 'month' },
    });

    const silverAnnual = await stripe.prices.create({
      product: silver.id,
      currency: 'usd',
      unit_amount: 37440, // $374.40 (4% discount)
      recurring: { interval: 'year' },
    });

    // --- Gold Plan (2500 URLs, $69/month) ---
    console.log('Creating Gold Plan...');
    const gold = await stripe.products.create({
      name: 'Gold Plan',
      description: '2,500 URL analyses per month - For enterprise and high-volume users',
    });

    const goldMonthly = await stripe.prices.create({
      product: gold.id,
      currency: 'usd',
      unit_amount: 6900, // $69.00
      recurring: { interval: 'month' },
    });

    const goldAnnual = await stripe.prices.create({
      product: gold.id,
      currency: 'usd',
      unit_amount: 66240, // $662.40 (4% discount)
      recurring: { interval: 'year' },
    });

    console.log('\n✅ Successfully created all Trampolin subscription products!');
    console.log('\n📋 Copy these environment variables to your .env file:');
    console.log('=====================================');
    console.log(`BRONZE_MONTHLY_PRICE=${bronzeMonthly.id}`);
    console.log(`BRONZE_ANNUAL_PRICE=${bronzeAnnual.id}`);
    console.log(`SILVER_MONTHLY_PRICE=${silverMonthly.id}`);
    console.log(`SILVER_ANNUAL_PRICE=${silverAnnual.id}`);
    console.log(`GOLD_MONTHLY_PRICE=${goldMonthly.id}`);
    console.log(`GOLD_ANNUAL_PRICE=${goldAnnual.id}`);
    console.log('=====================================');

    console.log('\n💰 Pricing Summary:');
    console.log('- Bronze: $29/month (500 URLs) | $278.40/year');
    console.log('- Silver: $39/month (1,000 URLs) | $374.40/year');
    console.log('- Gold: $69/month (2,500 URLs) | $662.40/year');
    console.log('- 7-day free trial on all plans');
  } catch (err) {
    console.error('❌ Error creating products/prices:', err.message);
    if (err.type === 'StripeAuthenticationError') {
      console.error("🔑 Make sure your STRIPE_SECRET_KEY is correct and starts with 'sk_test_'");
    }
  }
}

main();
