import * as request from 'supertest';
import * as bcrypt from 'bcrypt';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { dataSource } from '../../users/e2e-test/users.dataSource';
import { runSeeders } from 'typeorm-extension';
import { JwtService } from '@nestjs/jwt';
import { AppModule } from '../../../src/app.module';
import { User } from '../../users/entities/user.entity';
import { Repository } from 'typeorm';

describe('Auth', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let usersRepository: Repository<User>;
  let users: User[];
  let guest: User;
  let admin: User;
  let guestToken: string;
  let adminToken: string;

  beforeAll(async () => {
    // 設定測試 module並啟用測試 app
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    // 建立資料庫連接並檢查連接狀態
    try {
      await dataSource.initialize();
      console.log('Database connection established successfully.');
    } catch (error) {
      console.error('Database connection failed:', error);
      throw error;
    }

    await dataSource.synchronize(true);
    usersRepository = dataSource.getRepository(User);
    const [seederEntity] = await runSeeders(dataSource);
    users = seederEntity.result as Array<User>;
    admin = users[0];
    guest = users[1];

    // 建立登入使用者
    jwtService = app.get<JwtService>(JwtService);
    adminToken = jwtService.sign(admin);
    guestToken = jwtService.sign(guest);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('User Sign Up', () => {
    it('should return access token', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: `${guest.email}`, password: '123456' })
        .expect(201);

      const userInfo = jwtService.decode(response.body.accessToken);
      console.log(userInfo);
    });
  });
});
