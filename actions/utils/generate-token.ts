import { v4 as uuidv4 } from 'uuid';
import CryptoJS from 'crypto-js';
import { TableauUserGroupService } from '@/lib/services/tableau-user-group-service';



function base64url (source: CryptoJS.lib.WordArray) {
        // Encode in classical base64
        let encodedSource = CryptoJS.enc.Base64.stringify(source);

        // Remove padding equal characters
        encodedSource = encodedSource.replace(/=+$/, '');

        // Replace characters according to base64url specifications
        encodedSource = encodedSource.replace(/\+/g, '-');
        encodedSource = encodedSource.replace(/\//g, '_');

        return encodedSource;
    }


async function generateJwt ({ email }: {email: string}) {
    // const jwtSecret = "I8AhJz4BozY4axWmGe9rUic/a6+ntdyoSpNwK76craY=";
    // const jwtSecretId = "8b109864-24f7-4b19-8e5f-32ad340d5c7d";
    // const jwtClientId = "ef4ef302-341b-4565-b512-6cff188f2011";
    
    // Extract domain from email
    const emailDomain = email.split('@')[1].split('.')[0];
    
    // Try to get domain override from database
    const domainOverride = await TableauUserGroupService.getDomainOverride(emailDomain);
    
    // Validate that domain exists in database
    if (!domainOverride) {
        throw new Error(`No domain override found for email domain: ${emailDomain}. Please ensure the domain is configured in the database.`);
    }
    
    const jwtSecret = process.env.TABLEAU_SECRET_KEY || '';
    const jwtSecretId = process.env.TABLEAU_SECRET_ID || '';
    const jwtClientId = process.env.TABLEAU_CLIENT_ID || '';
    // Set headers for JWT
    const header = {
        'typ': 'JWT',
        'alg': 'HS256',
        'kid': jwtSecretId,
        'iss': jwtClientId,
    };

    // Prepare timestamp in seconds
    const currentTimestamp = Math.floor(Date.now() / 1000);
    // const jti = pm.variables.replaceIn('{{$guid}}');

    // company - derive from email domain or set static value

    const payload = {
        'iss': jwtClientId,
        'sub': email,
        'email': email,
        'company': domainOverride,
        'aud': 'tableau',
        'exp': currentTimestamp + 600, // Token valid for 10 minutes
        'iat': currentTimestamp,
        'jti': uuidv4(),
        'scp': [
            "tableau:content:read",
            "tableau:views:embed"
        ],
    };




    // encode header
    const stringifiedHeader = CryptoJS.enc.Utf8.parse(JSON.stringify(header));
    const encodedHeader = base64url(stringifiedHeader);

    // encode data
    const stringifiedData = CryptoJS.enc.Utf8.parse(JSON.stringify(payload));
    const encodedData = base64url(stringifiedData);

    // build token
    const token = `${encodedHeader}.${encodedData}`;
    // sign token
    let signature : string | CryptoJS.lib.WordArray = CryptoJS.HmacSHA256(token, jwtSecret);
    signature = base64url(signature);
    const signedToken = `${token}.${signature}`;
    return signedToken;
}

export default generateJwt;