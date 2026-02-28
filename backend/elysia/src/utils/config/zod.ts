import z from 'zod';

z.config({
  customError: issue => {
    if (issue.code === 'invalid_type' && !issue.input)
      return `${issue.path?.join('.') ?? 'Field'} is required.`;
    return undefined;
  }
});
