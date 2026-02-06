import { TokenPayload } from '../../../utils/jwt';

declare global {
  namespace Express {
    export interface Request {
      user?: TokenPayload;
    }
  }
}
