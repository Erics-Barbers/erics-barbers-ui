import {
  BookingService,
  CreateBookingDto,
  UpdateBookingDto,
} from '../generated';

export class BookingRepository {
  public async getBookings() {
    try {
      return await BookingService.bookingControllerGetBookings();
    } catch (error) {
      console.log('Get bookings error:', error);
      throw error;
    }
  }

  public async getBookingDetails(bookingId: string) {
    try {
      return await BookingService.bookingControllerGetBookingDetails(bookingId);
    } catch (error) {
      console.log('Get booking details error:', error);
      throw error;
    }
  }

  public async createBooking(
    idempotencyKey: string,
    bookingData: CreateBookingDto,
  ) {
    try {
      return await BookingService.bookingControllerCreateBooking(
        idempotencyKey,
        bookingData,
      );
    } catch (error) {
      console.log('Create booking error:', error);
      throw error;
    }
  }

  public async updateBooking(email: string, bookingData: UpdateBookingDto) {
    try {
      return await BookingService.bookingControllerUpdateBooking(
        email,
        bookingData,
      );
    } catch (error) {
      console.log('Update booking error:', error);
      throw error;
    }
  }
}
