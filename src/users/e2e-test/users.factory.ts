import { setSeederFactory } from 'typeorm-extension';
import { User } from '../../../src/users/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { Faker } from '@faker-js/faker';

export default setSeederFactory(User, async (faker: Faker) => {
  const user = new User();
  user.name = faker.person.fullName();
  user.email = faker.internet.email();
  user.password = await bcrypt.hash(faker.internet.password(), 10);
  user.role = 'guest';

  return user;
});
