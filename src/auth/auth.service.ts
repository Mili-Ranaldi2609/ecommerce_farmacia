import { HttpException, Injectable, Logger, OnModuleInit, Req } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaClient, Rol, UserType } from '@prisma/client';
import { LoginUserDto, RegisterUserDto, UpdateClientUser } from './dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { envs } from '../config';

@Injectable()
export class AuthService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('AuthService');

  constructor(private readonly jwtService: JwtService) {
    super();
  }

  onModuleInit() {
    this.$connect();
    this.logger.log('Connected to the database');
  }

  async signJWT(payload: JwtPayload) {
    return this.jwtService.sign(payload);
  }

  async verifyToken(token: string) {
    try {
      const { sub, iat, exp, ...user } = this.jwtService.verify(token, {
        secret: envs.jwtSecret,
      });

      return {
        user: user,
        token: await this.signJWT(user),
      };
    } catch (error) {
       (error);
    }
  }

  async registerUser(registerUserDto: RegisterUserDto) {
    const { email, nombre, password } = registerUserDto;

      const user = await this.user.findUnique({
        where: {
          email: email,
        },
      });

      if (user) {
        throw new HttpException('User already exists', 400);
      }

      const userCreate = await this.user.create({
        data: {
          email: email,
          password: bcrypt.hashSync(password, 10),
        },
      });

      const ClientCreate = await this.client.create({
        data: {
          nombre: nombre,
          apellido: registerUserDto.apellido,
          direccion: registerUserDto.direccion,
          available: true,
          fechaNacimiento: registerUserDto.fechaNacimiento,
          sexo: registerUserDto.sexo,
          telefono: registerUserDto.telefono,
          userType: registerUserDto.userType,
          rol: registerUserDto.rol,
          userId: userCreate.id,
        },
      });

      const { password: __, ...rest } = userCreate;

      return {
        user: rest,
        client: ClientCreate,
        token: await this.signJWT(rest),
      };
  }

  async loginUser(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;

    try {
      const user = await this.user.findUnique({
        where: { email , googleBool: false},
      });

      if (!user) {
        throw new HttpException('User not found', 404);
      }

      const isPasswordValid = bcrypt.compareSync(password, user.password);

      if (!isPasswordValid) {
        
      }

      const { password: __, ...rest } = user;

      return {
        user: rest,
        token: await this.signJWT(rest),
      };
    } catch (error) {
      
    }
  }

  async findAll() {
    try {
      return await this.client.findMany({where: {available: true}, include: {user: true}});
    } catch (error) {
      throw new HttpException(error.message, 400);
    }
  }

  async findOne(id: number) {
    try {
      return await this.client.findUnique({
        where: {
          id: id,
          available: true,
        },
        include: { user: true },
      });
    } catch (error) {
      throw new HttpException(error.message, 400);
    }
  }

  async update(updateClientDto: UpdateClientUser) {
    try {
      const clientR = await this.client.findUnique({
        where: {
          id: updateClientDto.id,
          available: true,
        },
      });
      if (!clientR) {
        throw new HttpException('Client not found', 400);
      }
      const updatedClient = await this.client.update({
        where: {
          id: updateClientDto.id,
        },
        data: updateClientDto,
      });
      return updatedClient;
    } catch (error) {
      throw new HttpException(error.message, 400);
    }
  }

  async remove(id: number) {
    try {
      const clientR = await this.client.findUnique({
        where: {
          id: id,
          available: true,
        },
      });

      if (!clientR) {
        throw new HttpException('client not found', 400);
      }

      await this.client.update({
        where: { id: id },
        data: { available: false },
      });

      return {
        status: 200,
        message: 'Client deleted',
      };
    } catch (error) {
      throw new HttpException(error.message, 400);  
    }
  }

  async googleSignIn(req) {
    if (!req.user) {
      throw new HttpException('No user from Google', 400);
    }

    const { email, firstName, lastName, picture, birthDate, sex, phoneNumber, address } = req.user;


    const user = await this.user.findUnique({
      where: { email, googleBool: true },
    });

    const userB = await this.user.findUnique({
      where: { email, googleBool: false },
    });

    if(userB) {
      throw new HttpException('User already exists', 400);
    }

    if (!user) {
      const userC = await this.user.create({
        data: {
          email,
          password: "null",
          googleBool: true,
        },
      });

      const clientX = await this.client.create({
        data: {
          nombre: firstName,
          apellido: lastName,
          available: true,
          direccion: address,
          fechaNacimiento: birthDate,
          sexo: sex,
          telefono: phoneNumber,
          // userType: UserType.PACIENTE,
          // rol: Rol.CLIENT,
          userId: userC.id,
        },
      });

      const userF = await this.user.findUnique({
        where: { email, googleBool: true },
        include: { client: true },
      });

      if (!userF) {
        throw new HttpException('User not found', 404);
      }

      const { password: __, ...rest } = userF;

    return {
      user: rest,
      token: await this.signJWT(rest),
    };
    } else if(user) {
      const { password: __, googleBool, ...rest } = user;

      return {
        user: rest,
        token: await this.signJWT(rest),
      };
    }
  }
}
