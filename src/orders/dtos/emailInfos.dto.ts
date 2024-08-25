export class EmailInfos {
  userEmail: string;
  userName: string;
  orderId: string;

  constructor(userEmail: string, userName: string, orderId: string) {
    this.userEmail = userEmail;
    this.userName = userName;
    this.orderId = orderId;
  }
}
