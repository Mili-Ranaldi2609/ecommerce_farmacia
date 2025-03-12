import { Body, Controller, Delete, Get, Inject, Param, ParseIntPipe, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { LoginUserDto, RegisterUserDto } from './dto';
import { AuthGuard } from './guards/auth.guard';
import { AuthGuard as GAuthGuard } from '@nestjs/passport';
import { Token, User } from './decorators';
import { CurrentUser } from './interfaces/current-user.interface';
import { UpdateClientUser } from './dto/update-client-user.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
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
  registerUser(@Body() registerUserDto: RegisterUserDto) {
    return this.authService.registerUser(registerUserDto);
  }

  @Post('login')
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.loginUser(loginUserDto);
  }

  @UseGuards( AuthGuard )
  @Post('verify')
  @ApiBearerAuth('bearerAuth')
  verifyToken( @User() user: CurrentUser, @Token() token: string) {
    return this.authService.verifyToken(token);
  }

  @UseGuards( AuthGuard )
  @Get('/clients')
  @ApiBearerAuth('bearerAuth')
  findAll() {
    return this.authService.findAll();
  }

  @UseGuards( AuthGuard )
  @Get('/clients/:id')
  @ApiBearerAuth('bearerAuth')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.authService.findOne(id);
  }

  @UseGuards( AuthGuard )
  @Patch('/clients/:id')
  @ApiBearerAuth('bearerAuth')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateClientUser: UpdateClientUser) {
    this.authService.update(updateClientUser);
  }

  @UseGuards( AuthGuard )
  @Delete('/clients/:id')
  @ApiBearerAuth('bearerAuth')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.authService.remove(id);
  }
}
