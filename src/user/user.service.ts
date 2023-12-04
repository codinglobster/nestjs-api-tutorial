import { PrismaService } from 'src/prisma/prisma.service';
import { EditUserDto } from './dto';

export class UserService {
  constructor(private prisma: PrismaService) {}

  async editUser(id: number, dto: EditUserDto) {
    const user = await this.prisma.user.update({
      where: { id: id },
      data: {
        email: dto.email,
      },
    });
    return user;
  }
}
