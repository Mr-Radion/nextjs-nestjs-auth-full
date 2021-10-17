import { Request } from 'express';

export type UserAgentType = {
  mobile?: boolean;
  windows?: boolean;
  linux?: boolean;
  other?: boolean;
};

export const hasUserAgent = (req: Request) => {
  const ua = req.headers['user-agent'];
  let result: UserAgentType = {};

  switch (true) {
    case /mobile/i.test(ua):
      result['mobile'] = true;
      break;
    case /Windows NT/.test(ua):
      result['windows'] = true;
      break;
    case /Linux/.test(ua):
      result['linux'] = true;
      break;
    default:
      result['other'] = true;
      break;
  }

  return result;
};

// https://wicg.github.io/ua-client-hints/