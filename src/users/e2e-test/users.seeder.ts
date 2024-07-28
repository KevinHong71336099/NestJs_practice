import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';

export default class UserSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<any> {
    const usersFactory = await factoryManager.get(User);
    const usersRepository = dataSource.getRepository(User);
    const users = await usersFactory.saveMany(5);
    const roles = [
      {
        name: 'Jack_Admin',
        email: 'Jack321@gmail.com',
        password: await bcrypt.hash('123456', 10),
        role: 'admin',
      },
      {
        name: 'Jack',
        email: 'Jack123@gmail.com',
        password: await bcrypt.hash('123456', 10),
        role: 'guest',
      },
    ];
    await usersRepository.save(roles);

    return [...roles, ...users];
  }
}
