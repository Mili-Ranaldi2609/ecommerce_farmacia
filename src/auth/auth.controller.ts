import { Body, Controller, Delete, Get, Inject, Param, ParseIntPipe, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { LoginUserDto, RegisterUserDto } from './dto';
import { AuthGuard } from './guards/auth.guard';
import { AuthGuard as GAuthGuard } from '@nestjs/passport';
import { Token, User } from './decorators';
import { CurrentUser } from './interfaces/current-user.interface';
import { UpdateClientUser } from './dto/update-client-user.dto';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(@Inject() private readonly authService: AuthService) {}

  @Get('google/signin')
  @UseGuards(GAuthGuard('google'))
  async googleSignIn(@Req() req) {}

  @Get('google/signin/callback')
  @UseGuards(GAuthGuard('google'))
  async googleSignInCallback(@Req() req) {
    return this.authService.googleSignIn(req);
  }

  @Post('register')
  @ApiBody({
    description: 'Register a new user',
    type: RegisterUserDto,
    examples: {
      example1: {
        summary: 'Example request',
        value: {
          email: 'papugomez@example.com',
          password: 'SecurePassword123!',
          nombre: 'John',
          apellido: 'Doe',
          direccion: '123 Main Street',
          available: true,
          fechaNacimiento: '1990-01-01',
          sexo: 'Male',
          telefono: '555-123-4567',
          userType: 'PACIENTE',
          rol: 'ADMIN',
          urlImagen: 'https://rybwefx6jybsfaoy.public.blob.vercel-storage.com/WhatsApp%20Image%202025-01-26%20at%2000.36.01_d9c79014-Z8k8T8zEs1NoxTen228mjZ0zlOE6LE.jpg',
        },
      },
    },
  })
  registerUser(@Body() registerUserDto: RegisterUserDto) {
    return this.authService.registerUser(registerUserDto);
  }

  @Post('login')
  @ApiBody({
    description: 'Login a user',
    type: LoginUserDto,
    examples: {
      example1: {
        summary: 'Example request',
        value: {
          email: 'user@example.com',
          password: 'password123',
        },
      },
    },
  })
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.loginUser(loginUserDto);
  }

  @UseGuards(AuthGuard)
  @Post('verify')
  @ApiBearerAuth('bearerAuth')
  @ApiBody({
    description: 'Verify a token',
    examples: {
      example1: {
        summary: 'Example request',
        value: {
          token: 'your-jwt-token',
        },
      },
    },
  })
  verifyToken(@User() user: CurrentUser, @Token() token: string) {
    return this.authService.verifyToken(token);
  }

  @UseGuards(AuthGuard)
  @Get('/clients')
  @ApiBearerAuth('bearerAuth')
  findAll() {
    return this.authService.findAll();
  }

  @UseGuards(AuthGuard)
  @Get('/clients/:id')
  @ApiBearerAuth('bearerAuth')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.authService.findOne(id);
  }

  @UseGuards(AuthGuard)
  @Patch('/clients/:id')
  @ApiBearerAuth('bearerAuth')
  @ApiBody({
    description: 'Update client information',
    type: UpdateClientUser,
    examples: {
      example1: {
        summary: 'Example request',
        value: {
          id: 1,
          nombre: 'John',
          apellido: 'Doe',
          direccion: '456 Elm St',
          telefono: '9876543210',
        },
      },
    },
  })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateClientUser: UpdateClientUser) {
    return this.authService.update(updateClientUser);
  }

  @UseGuards(AuthGuard)
  @Delete('/clients/:id')
  @ApiBearerAuth('bearerAuth')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.authService.remove(id);
  }
}
