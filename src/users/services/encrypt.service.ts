import { Injectable } from '@nestjs/common';

// import 3rd party modules
import * as bcrypt from 'bcrypt';

@Injectable()
export class EncryptService {
  async bcryptUserPassword(password: string): Promise<string> {
    const saltRounds: number = 10;
    const encryptedPwd = await bcrypt.hash(password, saltRounds);
    return encryptedPwd;
  }

  async isPasswordCorrect(
    plainPassword: string,
    passwordHash: string,
  ): Promise<boolean> {
    return await bcrypt.compare(plainPassword, passwordHash);
  }
}
