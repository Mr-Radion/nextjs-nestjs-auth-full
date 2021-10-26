import crypto from 'crypto'; // crypto.randomInt() более надежная альтернатива чем Math.random(), менее предсказуемая

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
  generate: function (length: number, options: OtpOptions) {
    length = length || 10;

    const allowsChars =
      (options.digits && digits) +
      (options.alphabets && alphabets) +
      (options.upperCase && upperCase) +
      (options.specialChars && specialChars); // если указали опцию digits добавляем '0123456789', если указали еще specialChars, то добавляем '0123456789' + '#!&@' и т.д.

    console.log({ allowsChars });

    let otpCode: string = '';

    while (otpCode.length < length) {
      const charIndex = crypto.randomInt(0, allowsChars.length); // min and max number
      console.log({ charIndex });
      otpCode += allowsChars[charIndex];
    }

    return otpCode;
  },
};

export default otpGenerator;
