// crypto.randomInt() more reliable alternative than Math.random (), less predictable
// note here https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Math/random
// crypto documentation https://nodejs.org/api/crypto.html and https://nodejs.org/api/crypto.html#cryptorandomintmin-max-callback

// more example alphabets
// let alphabetsZ = {};
// alphabetsZ['32'] = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'; // base 32
// alphabetsZ['64'] = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'; // base 64
// alphabetsZ['85'] =
//   '!"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstu';
// alphabetsZ['91'] =
//   'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!#$%&()*+,./:;<=>?@[]^_`{|}~"';

const digits: string = '0123456789';
const alphabets: string = 'abcdefghijklmnopqrstuvwxyz';
const upperCase = alphabets.toUpperCase();
const specialChars: string = '#!&@';

type OtpOptions = {
  digits: boolean; // true если нам нужны числа
  alphabets?: boolean; // true если нам нужны буквы
  upperCase?: boolean; // true если нам нужны буквы в верхнем регистре
  specialChars?: boolean; // true если нам нужны спец символы
};

const otpGenerator = {
  generate: async function (length: number, options: OtpOptions) {
    const { randomInt } = await import('crypto');
    length = length || 10;

    const allowsChars =
      ((options.digits || '') && digits) +
      ((options.alphabets || '') && alphabets) +
      ((options.upperCase || '') && upperCase) +
      ((options.specialChars || '') && specialChars);

    let otpCode: string = '';

    while (otpCode.length < length) {
      const charIndex = randomInt(0, allowsChars.length);
      console.log({ charIndex });
      otpCode += allowsChars[charIndex];
    }

    return otpCode;
  },
};

export default otpGenerator;
