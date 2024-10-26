import 'source-map-support/register'
import Axios from 'axios'
import { decode, verify } from 'jsonwebtoken';
import { createLogger } from '../../utils/logger';

const logger = createLogger('auth');

const jwksUrl = process.env.AUTH_JWKS_URL;

export async function handler(event) {
  try {
    const jwtToken = await verifyToken(event.authorizationToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader) {

    const token = getToken(authHeader);
    if (!token) {
      throw new Error('Token is missing from the authorization header');
    }
    const jwt = decode(token, { complete: true });

    if (!jwt) {
      throw new Error('JWT is empty or invalid');
    }

    const kid = jwt.header.kid;
    if (!kid) {
      throw new Error('Key ID (kid) is missing from the JWT header');
    }
    
  try {
    const publicKey = await getCert(kid);
    return verify(token, publicKey, { algorithms: ['RS256'] });
  } catch (error) {
    logger.error(`Token verification failed: ${error.message}`);
    throw error; // Re-throw the error after logging
  }
}


function getToken(authHeader) {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}

const getCert = async (kid) => {
  logger.info(`Getting certificate, header kid: ${kid}`);

  try {
    const { data } = await Axios.get(jwksUrl);
    const keys = data.keys;

    if (!keys || keys.length === 0) {
      throw new Error('No keys found in JWKS');
    }

    const signingKeys = keys
      .filter(key => 
        key.use === 'sig' &&
        key.kty === 'RSA' &&
        key.kid &&
        ((key.x5c?.length > 0) || (key.n && key.e))
      )
      .map(key => ({
        kid: key.kid,
        nbf: key.nbf,
        publicKey: certToPEM(key.x5c[0]),
      }));

    const key = signingKeys.find(k => k.kid === kid);

    if (!key) {
      throw new Error(`Key not found for kid: ${kid}`);
    }

    return key.publicKey;
  } catch (error) {
    logger.error(`Error getting certificate: ${error.message}`);
    throw error;
  }
};

const certToPEM = (cert) => {
  const formattedCert = cert.match(/.{1,64}/g).join('\n');
  return `-----BEGIN CERTIFICATE-----\n${formattedCert}\n-----END CERTIFICATE-----\n`;
};
