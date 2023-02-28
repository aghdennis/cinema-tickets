import TicketTypeRequest from './lib/TicketTypeRequest.js';
import InvalidPurchaseException from './lib/InvalidPurchaseException.js';

export default class TicketService {
  /**
   * Should only have private methods other than the one below.
   */

  #totalChildTicketAmount = 0;
  #totalAdultTicketAmount = 0;
  #totalNoOfSeatReservations = 0;

   #seatService;
   #paymentService;

  constructor(seatReservationService, ticketPaymentService){
    this.#seatService = seatReservationService;
    this.#paymentService = ticketPaymentService;
  }

  purchaseTickets(accountId, ...ticketTypeRequests) {

    this.#validateAccountId(accountId);
    this.#calculateCostsAndReservations(ticketTypeRequests);
    this.#validateAdultTicketCount();
   
    let totalAmount = this.#totalChildTicketAmount +  this.#totalAdultTicketAmount;

    this.#seatService?.reserveSeat(accountId, this.#totalNoOfSeatReservations);
    this.#paymentService?.makePayment(accountId, totalAmount);

    return  totalAmount;
  }

  #validateAccountId(accountId){
    if(accountId <= 0)
    throw new InvalidPurchaseException();
  }

  #validateAdultTicketCount(){
    if(this.#totalAdultTicketAmount <= 0) throw new InvalidPurchaseException();
  }

  #calculateCostsAndReservations(ticketTypeRequests){
    if(ticketTypeRequests && Array.isArray(ticketTypeRequests)){
      ticketTypeRequests.forEach(ticketRequest => {
        if(!(ticketRequest instanceof TicketTypeRequest) || ticketRequest.getNoOfTickets() > 20)
            throw new InvalidPurchaseException();  
      
        if(ticketRequest.getTicketType() === 'ADULT'){
          this.#totalAdultTicketAmount = this.#totalAdultTicketAmount + (ticketRequest.getNoOfTickets() * 20); 
          this.#totalNoOfSeatReservations = this.#totalNoOfSeatReservations + ticketRequest.getNoOfTickets();          
        }  

        if(ticketRequest.getTicketType() === 'CHILD'){
          this.#totalChildTicketAmount = this.#totalChildTicketAmount + (ticketRequest.getNoOfTickets() * 10); 
          this.#totalNoOfSeatReservations = this.#totalNoOfSeatReservations + ticketRequest.getNoOfTickets(); 
        }   
    });  
  }
  }  
}
