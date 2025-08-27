import { Router, Request, Response } from 'express';
import { auth } from '../middleware/auth';

const router = Router();

// All payment routes require authentication
router.use(auth);

// Create payment intent for booking
router.post('/create-payment-intent', async (req: Request, res: Response) => {
  try {
    const { gameId, numberOfSeats } = req.body;
    const userId = (req as any).user.id;

    // Validate input
    if (!gameId || !numberOfSeats || numberOfSeats < 1) {
      return res.status(400).json({
        success: false,
        error: 'Game ID and number of seats are required'
      });
    }

    // TODO: Implement Stripe payment intent creation
    // 1. Fetch game details to get price
    // 2. Calculate total amount (price * seats + service fee)
    // 3. Create Stripe payment intent
    // 4. Return client secret

    // Mock payment intent for now
    const mockGamePrice = 20.00;
    const baseAmount = mockGamePrice * numberOfSeats;
    const serviceFee = Math.round(baseAmount * 0.112 * 100) / 100; // 11.2% service fee
    const totalAmount = baseAmount + serviceFee;

    const paymentIntent = {
      clientSecret: `pi_mock_${Date.now()}_secret_mock`,
      amount: Math.round(totalAmount * 100), // Stripe expects cents
      currency: 'USD'
    };

    res.json({
      success: true,
      data: paymentIntent,
      message: 'Payment intent created successfully'
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create payment intent'
    });
  }
});

// Webhook endpoint for Stripe events (if needed)
router.post('/webhook', async (req: Request, res: Response) => {
  try {
    // TODO: Implement Stripe webhook handling
    // 1. Verify webhook signature
    // 2. Handle payment events (succeeded, failed, etc.)
    // 3. Update booking status accordingly

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).json({
      success: false,
      error: 'Webhook processing failed'
    });
  }
});

export default router;
