export class InvalidCredentialsError extends Error {
  public override message = 'Either email or password is invalid.';
  public path = ['email', 'password'];
  public status = 400;
}

export class InvalidJwtError extends Error {
  public override message = 'Either jwt invalid or expired.';
  public path = ['jwt'];
  public status = 401;
}
