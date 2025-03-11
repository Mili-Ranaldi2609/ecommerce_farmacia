import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { envs } from 'src/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor() {
        super({
            clientID: envs.googleClientId,
            clientSecret: envs.googleClientSecret,
            callbackURL: envs.googleCallbackUrl,
            scope: ['email', 'profile',
                'https://www.googleapis.com/auth/user.addresses.read',
                'https://www.googleapis.com/auth/user.birthday.read',
                'https://www.googleapis.com/auth/user.phonenumbers.read',
                'https://www.googleapis.com/auth/userinfo.profile',
            ],
        });
    }

    async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback): Promise<any> {
        const { name, emails, photos, birthday, gender, phoneNumbers, addresses } = profile;
        const user = {
            email: emails[0].value,
            firstName: name.givenName,
            lastName: name.familyName,
            picture: photos[0].value,
            birthDate: birthday ? birthday : 'null',
            sex: gender ? gender: 'null',
            phoneNumber: phoneNumbers ? phoneNumbers[0].value : 'null',
            address: addresses ? addresses[0].formatted : 'null',
            accessToken,
        };
        done(null, user);
    }
}