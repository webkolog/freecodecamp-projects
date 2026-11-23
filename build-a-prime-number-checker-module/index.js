function isPrime(num) {
  // Prime numbers must be whole numbers greater than 1
  if (typeof num !== 'number' || !Number.isInteger(num) || num <= 1) {
    return false;
  }

  // 2 and 3 are prime numbers
  if (num <= 3) {
    return true;
  }

  // Eliminate multiples of 2 and 3
  if (num % 2 === 0 || num % 3 === 0) {
    return false;
  }

  // Check divisors of the form 6k ± 1 up to √num
  for (let i = 5; i * i <= num; i += 6) {
    if (num % i === 0 || num % (i + 2) === 0) {
      return false;
    }
  }

  return true;
}

module.exports = {
  isPrime,
};