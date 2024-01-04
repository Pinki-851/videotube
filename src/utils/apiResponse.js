export class APIResponse {
  constructor(data, message = "Success", statusCode) {
    this.data = data;
    this.message = message;
    this.statusCode = statusCode;
    this.success = statusCode < 400;
  }
}
