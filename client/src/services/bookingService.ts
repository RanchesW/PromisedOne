import apiService, { bookingsAPI, paymentsAPI } from './api';
import { Booking, PaymentIntent } from '@kazrpg/shared';

export interface BookingRequest {
  gameId: string;
  numberOfSeats: number;
  specialRequests?: string;
}

export interface PaymentIntentRequest {
  gameId: string;
  numberOfSeats: number;
}

class BookingService {
  // Create a payment intent for the booking
  async createPaymentIntent(request: PaymentIntentRequest): Promise<PaymentIntent> {
    const response = await paymentsAPI.createPaymentIntent(request.gameId, request.numberOfSeats);
    
    if (!response.data.success) {
      throw new Error(response.data.message || response.data.error || 'Failed to create payment intent');
    }
    
    // Extract the payment intent from the response data
    const paymentIntentData = response.data.data as PaymentIntent;
    return paymentIntentData;
  }

  // Create a booking
  async createBooking(request: BookingRequest): Promise<Booking> {
    const bookingData = {
      game: request.gameId,
      numberOfSeats: request.numberOfSeats,
      specialRequests: request.specialRequests,
    };
    
    const response = await bookingsAPI.create(bookingData);
    
    if (!response.data.success) {
      throw new Error(response.data.message || response.data.error || 'Failed to create booking');
    }
    
    return response.data.data as Booking;
  }

  // Confirm payment and complete booking
  async confirmBooking(bookingId: string, paymentIntentId: string): Promise<Booking> {
    const response = await bookingsAPI.confirm(bookingId, paymentIntentId);
    
    if (!response.data.success) {
      throw new Error(response.data.message || response.data.error || 'Failed to confirm booking');
    }
    
    return response.data.data as Booking;
  }

  // Get user's bookings
  async getUserBookings(): Promise<Booking[]> {
    const response = await bookingsAPI.getMyBookings();
    
    if (!response.data.success) {
      throw new Error(response.data.message || response.data.error || 'Failed to fetch bookings');
    }
    
    return response.data.data as Booking[];
  }

  // Get booking by ID
  async getBooking(id: string): Promise<Booking> {
    const response = await bookingsAPI.getById(id);
    
    if (!response.data.success) {
      throw new Error(response.data.message || response.data.error || 'Failed to fetch booking');
    }
    
    return response.data.data as Booking;
  }

  // Cancel a booking
  async cancelBooking(id: string): Promise<void> {
    const response = await bookingsAPI.cancel(id);
    
    if (!response.data.success) {
      throw new Error(response.data.message || response.data.error || 'Failed to cancel booking');
    }
  }
}

export default new BookingService();