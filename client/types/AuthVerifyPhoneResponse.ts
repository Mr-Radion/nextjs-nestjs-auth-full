import { IUser } from '.';

export interface AuthVerifyPhoneResponse {
  status: string;
  message: string;
  valid: string;
  dateCreated: string;
  dateUpdated: string;
  user: {
    accessToken: string;
    user: IUser;
    refreshToken?: string;
  };
}


// LoginPhone {
//     "message": "Verification is sent!!",
//     "phonenumber": "79031671617",
//     "status": "pending",
//     "dateCreated": "2021-10-20T13:29:32.000Z",
//     "dateUpdated": "2021-10-20T13:29:32.000Z"
// }