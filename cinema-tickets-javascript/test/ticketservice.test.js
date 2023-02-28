import TicketService from '../src/pairtest/TicketService'
import TicketTypeRequest from '../src/pairtest/lib/TicketTypeRequest';
import InvalidPurchaseException from '../src/pairtest/lib/InvalidPurchaseException';
import SeatReservationService from '../src/thirdparty/seatbooking/SeatReservationService';
import TicketPaymentService from '../src/thirdparty/paymentgateway/TicketPaymentService';

describe('TicketTypeRequestTests', () => {
    test('an invalid ticket type throws a type error', () => {        
        expect(() => new TicketTypeRequest('ERROR', 3)).toThrow(TypeError);        
    });
    test('a valid ticket type of infant does not throw an error', () => {
        expect(() => new TicketTypeRequest('INFANT', 3)).not.toThrow(); 
    });
    test('a valid ticket type of ADULT does not throw an error', () => {
        expect(() => new TicketTypeRequest('ADULT', 3)).not.toThrow(); 
    });
    test('a valid ticket type of CHILD does not throw an error', () => {
        expect(() => new TicketTypeRequest('CHILD', 3)).not.toThrow(); 
    });
    test('any valid ticket type with invalid quantity throws an error', () => {
        expect(() => new TicketTypeRequest('ADULT', 'Qty')).toThrow(); 
    });
})

describe('TicketServiceTests', () => {    
   
    const seatReservationMock = jest.spyOn(SeatReservationService.prototype, 'reserveSeat')
    .mockImplementation(() => {}); 
    const paymentServiceMock = jest.spyOn(TicketPaymentService.prototype, 'makePayment')
    .mockImplementation(() => {}); 

    test('can initialise the tickets service object', () => {  
        let ticketService = new TicketService();     
        expect(ticketService).toBeTruthy();
    });

    test('should not throw invalidpurchaseexception when multiple ticket requests are valid', () => {
        let adultRequest = new TicketTypeRequest('ADULT', 2);
        let infantRequest = new TicketTypeRequest('INFANT', 5);
        let childRequest = new TicketTypeRequest('CHILD', 1);

        let ticketService = new TicketService();

        expect(() => ticketService.purchaseTickets(123, adultRequest, infantRequest, childRequest))
        .not.toThrow();
    });

    test('should throw invalidpurchaseexception when more than 20 tickets is being purchased', () => {
        let adultRequest = new TicketTypeRequest('ADULT', 21);
        let ticketService = new TicketService();
        expect(() => ticketService.purchaseTickets(123, adultRequest)).toThrow(InvalidPurchaseException);
    });

    test('should return a total of 30 pounds when each of adult and child tickets are requested', () => {
        let adultRequest = new TicketTypeRequest('ADULT', 1);
        let childRequest = new TicketTypeRequest('CHILD', 1);

        let ticketService = new TicketService();
        let totalAmount = ticketService.purchaseTickets(123, childRequest, adultRequest);

        expect(totalAmount).toBe(30);
    });

    test('should return a total of 50 pounds when two adults and one child tickets', () => {
        let adultRequest = new TicketTypeRequest('ADULT', 2);
        let childRequest = new TicketTypeRequest('CHILD', 1);

        let ticketService = new TicketService();
        let totalAmount = ticketService.purchaseTickets(123, childRequest, adultRequest);

        expect(totalAmount).toBe(50);
    });

    test('should return a total of 60 pounds when two adults, two children and three infants', () => {
        let adultRequest = new TicketTypeRequest('ADULT', 2);
        let childRequest = new TicketTypeRequest('CHILD', 2);
        let infantRequest = new TicketTypeRequest('INFANT', 3);
       
        let ticketService = new TicketService();
        let totalAmount = ticketService.purchaseTickets(123, childRequest, adultRequest, infantRequest);

        expect(totalAmount).toBe(60);
    });

  test('should reserve an adult seat when a single adult reserves a ticket', () => {
    seatReservationMock.mockClear();
    paymentServiceMock.mockClear();

    let adultRequest = new TicketTypeRequest('ADULT', 1);

    let sr = new SeatReservationService();
    let pm = new TicketPaymentService();
    let ticketService = new TicketService(sr, pm);
    ticketService.purchaseTickets(123, adultRequest);
    
    expect(seatReservationMock).toHaveBeenCalledTimes(1);
    expect(paymentServiceMock).toHaveBeenCalledTimes(1);
  });

  test('should not purchase child and infant tickets without an adult ticket', () => {     
    seatReservationMock.mockClear();
    paymentServiceMock.mockClear();

    let childRequest = new TicketTypeRequest('CHILD', 1);
    let infantRequest = new TicketTypeRequest('INFANT', 1);
   
    let sr = new SeatReservationService();
    let pm = new TicketPaymentService();
    let ticketService = new TicketService(sr, pm);
    
    expect(() => ticketService.purchaseTickets(123, childRequest, infantRequest)).toThrow(InvalidPurchaseException);
    expect(seatReservationMock).toHaveBeenCalledTimes(0);
    expect(paymentServiceMock).toHaveBeenCalledTimes(0);
  });
   
})

