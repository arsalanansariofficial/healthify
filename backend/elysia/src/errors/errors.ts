export class InvalidJwtError extends Error {
  public override message = 'Either jwt invalid or expired.';
  public path = ['jwt'];
  public status = 401;
}
