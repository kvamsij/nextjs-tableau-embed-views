import { jwtDecode, JwtPayload } from 'jwt-decode';
import dayjs from 'dayjs';
import { ISession } from '@/actions/utils/session';

export interface AuthenticationResult {
    isValid: boolean;
    session: ISession;
    error?: string;
}

export interface IAuthenticationService {
    validateSession(session: ISession): AuthenticationResult;
}

export class JWTAuthenticationService implements IAuthenticationService {
    validateSession(session: ISession): AuthenticationResult {
        try {
            // Check basic session requirements
            if (!session.jwt || !session.siteId) {
                return {
                    isValid: false,
                    session,
                    error: 'Authentication required - missing JWT or site ID'
                };
            }

            // Validate JWT structure and expiration
            const decodedToken = jwtDecode<JwtPayload>(session.jwt);
            if (!decodedToken) {
                return {
                    isValid: false,
                    session,
                    error: 'Invalid JWT token format'
                };
            }

            // Check token expiration
            const now = dayjs().unix();
            const isTokenExpired = decodedToken.exp! < now;
            
            if (isTokenExpired) {
                return {
                    isValid: false,
                    session,
                    error: 'JWT token has expired'
                };
            }

            return {
                isValid: true,
                session
            };
        } catch (error) {
            return {
                isValid: false,
                session,
                error: error instanceof Error ? error.message : 'Authentication validation failed'
            };
        }
    }
}