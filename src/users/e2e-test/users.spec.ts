import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { dataSource } from './users.dataSource';
import { runSeeders } from 'typeorm-extension';
import { JwtService } from '@nestjs/jwt';
import { AppModule } from '../../../src/app.module';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';

describe('Users', () => {
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
    await dataSource.synchronize(true);
    await app.close();
  });

  /*
  describe('Find All Users', () => {
    it('should return all users', async () => {
      const response = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);

      response.body.forEach((user: User) => {
        expect(user).toHaveProperty('id');
        expect(user).toHaveProperty('name');
        expect(user).toHaveProperty('email');
      });
    });

    it('should get unauthorized error', async () => {
      await request(app.getHttpServer()).get('/users').expect(401);
    });

    it('should get forbidden error', async () => {
      await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${guestToken}`)
        .expect(403);
    });
  });
  */

  describe('Find User by ID', () => {
    it('should return user', async () => {
      const response = await request(app.getHttpServer())
        .get(`/users/${guest.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.id).toBe(guest.id);
      expect(response.body.email).toBe(guest.email);
    });

    it('should return notfound error', async () => {
      const nullId = '83129672-a57a-4751-860b-1143e3fb8998';
      await request(app.getHttpServer())
        .get(`/users/${nullId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });

    it('should get unauthorized error', async () => {
      await request(app.getHttpServer()).get(`/users/${guest.id}`).expect(401);
    });

    it('should get forbidden error', async () => {
      await request(app.getHttpServer())
        .get(`/users/${guest.id}`)
        .set('Authorization', `Bearer ${guestToken}`)
        .expect(403);
    });
  });

  describe('Find User by Query', () => {
    let queryEmail: string;
    let queryPage: number;
    let queryLimit: number;
    let queryOrderBy: string;
    let queryName = '';

    it('should return limit number of users order by createdAt', async () => {
      queryPage = 2;
      queryLimit = 3;

      // 驗證page是否查詢正確使用者
      async function getUsersFromDatabase(page: number, limit: number) {
        const offset = (page - 1) * limit;
        return await usersRepository.find({
          order: { createdAt: 'ASC' },
          skip: offset,
          take: limit,
        });
      }

      const response = await request(app.getHttpServer())
        .get(
          `/users?name=&page=${queryPage}&limit=${queryLimit}&orderBy=${queryOrderBy}&email=`,
        )
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // 驗證數量是否正確
      const results = response.body as User[];
      expect(results.length).toBe(queryLimit);

      for (let i = 0; i < results.length - 1; i++) {
        // 驗證時間順序是否正確
        const currentItem = results[i];
        const nextItem = results[i + 1];
        const isFaster =
          new Date(currentItem.createdAt).getTime() <=
          new Date(nextItem.createdAt).getTime();
        expect(isFaster).toBe(true);
      }

      // 比較每個使用者物件
      const expectedUsers = await getUsersFromDatabase(queryPage, queryLimit);
      // 將 expectedUsers 中的日期轉換為字符串
      const formattedExpectedUsers = expectedUsers.map((user) => ({
        ...user,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      }));
      results.forEach((actualUser, index) => {
        expect(actualUser).toEqual(
          expect.objectContaining(formattedExpectedUsers[index]),
        );
      });
    });

    it('should return users whose name is jack', async () => {
      queryName = 'jack';
      queryPage = 1;
      queryLimit = 2;
      const response = await request(app.getHttpServer())
        .get(
          `/users?name=${queryName}&page=${queryPage}&limit=${queryLimit}&orderBy=${queryOrderBy}&email=`,
        )
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const results = response.body as User[];

      for (const user of results) {
        expect(user.name.toLowerCase().includes(queryName)).toBe(true);
      }
    });

    // 測試query by email是否正常
    it('should return users whose email is yahoo account', async () => {
      queryPage = 1;
      queryLimit = 2;
      queryEmail = '@yahoo.com';
      const response = await request(app.getHttpServer())
        .get(
          `/users?name=&page=${queryPage}&limit=${queryLimit}&orderBy=${queryOrderBy}&email=${queryEmail}`,
        )
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const results = response.body as User[];

      for (const user of results) {
        expect(user.email.includes(queryEmail)).toBe(true);
      }
    });

    // 測試 query 欄位不能為空
    it('should return bad request error', async () => {
      const noLimitQuery = await request(app.getHttpServer())
        .get(
          `/users?name=&page=${queryPage}&limit=&orderBy=${queryOrderBy}&email=`,
        )
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);

      expect(noLimitQuery.body.message[0]).toBe(
        'limit must be a positive number',
      );

      const noPageQuery = await request(app.getHttpServer())
        .get(
          `/users?name=&page=&limit=${queryLimit}&orderBy=${queryOrderBy}&email=`,
        )
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);

      expect(noPageQuery.body.message[0]).toBe(
        'page must be a positive number',
      );

      const noOrderByQuery = await request(app.getHttpServer())
        .get(
          `/users?name=&page=${queryPage}&limit=${queryLimit}&orderBy=&email=`,
        )
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);

      expect(noOrderByQuery.body.message[0]).toBe(
        'orderBy should not be empty',
      );
    });

    it('should get unauthorized error', async () => {
      await request(app.getHttpServer())
        .get(
          `/users?name=&page=${queryPage}&limit=${queryLimit}&orderBy=${queryOrderBy}&email=${queryEmail}`,
        )
        .expect(401);
    });

    it('should get forbidden error', async () => {
      await request(app.getHttpServer())
        .get(
          `/users?name=&page=${queryPage}&limit=${queryLimit}&orderBy=${queryOrderBy}&email=${queryEmail}`,
        )
        .set('Authorization', `Bearer ${guestToken}`)
        .expect(403);
    });
  });
});
