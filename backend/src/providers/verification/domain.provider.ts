import dns from 'dns';
import https from 'https';
import { DomainVerificationResult, VerificationCheckResult, CheckStatusType } from './verification.interface';
import { validateEmailDomainMatch } from '../../modules/verification/verification.validator';

export class DomainVerificationProvider {
  private extractHostname(rawUrl: string): string {
    const formatted = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`;
    const parsed = new URL(formatted);
    return parsed.hostname.toLowerCase();
  }

  async verifyDomain(
    websiteUrl: string,
    companyEmail: string,
    brandName: string
  ): Promise<DomainVerificationResult> {
    const hostname = this.extractHostname(websiteUrl);

    // 1. DNS Resolution Check
    let dnsCheckResult: VerificationCheckResult;
    try {
      const addresses = await dns.promises.resolve(hostname);
      dnsCheckResult = {
        checkType: 'DOMAIN_DNS_RESOLUTION',
        status: (addresses && addresses.length > 0 ? 'PASSED' : 'FAILED') as CheckStatusType,
        providerName: 'NODE_DNS_LOOKUP',
        details: `Domain successfully resolved to active IP addresses: ${addresses.join(', ')}`,
        rawResponseSummary: { hostname, addresses },
      };
    } catch (err: any) {
      dnsCheckResult = {
        checkType: 'DOMAIN_DNS_RESOLUTION',
        status: 'FAILED',
        providerName: 'NODE_DNS_LOOKUP',
        details: `DNS resolution failed for hostname '${hostname}': ${err.code || err.message}`,
        rawResponseSummary: { hostname, error: err.message },
      };
    }

    // 2. HTTPS SSL/TLS Validity Check
    let httpsCheckResult: VerificationCheckResult;
    if (dnsCheckResult.status === 'PASSED') {
      try {
        await new Promise<void>((resolve, reject) => {
          const req = https.get(
            `https://${hostname}`,
            { timeout: 5000, rejectUnauthorized: true },
            (res) => {
              res.resume();
              resolve();
            }
          );
          req.on('error', (err) => reject(err));
          req.on('timeout', () => {
            req.destroy();
            reject(new Error('Connection timed out'));
          });
        });

        httpsCheckResult = {
          checkType: 'HTTPS_SSL_VALIDITY',
          status: 'PASSED',
          providerName: 'NODE_HTTPS_CLIENT',
          details: `HTTPS connection established with a valid, trusted SSL/TLS certificate.`,
          rawResponseSummary: { hostname, protocol: 'https:' },
        };
      } catch (err: any) {
        httpsCheckResult = {
          checkType: 'HTTPS_SSL_VALIDITY',
          status: 'WARNING',
          providerName: 'NODE_HTTPS_CLIENT',
          details: `HTTPS check encountered an issue (${err.message}). Queued for admin manual review.`,
          rawResponseSummary: { hostname, error: err.message },
        };
      }
    } else {
      httpsCheckResult = {
        checkType: 'HTTPS_SSL_VALIDITY',
        status: 'FAILED',
        providerName: 'NODE_HTTPS_CLIENT',
        details: 'Skipped HTTPS check because DNS resolution failed.',
        rawResponseSummary: { hostname },
      };
    }

    // 3. Email Domain vs Website Domain Match
    const matchesEmail = validateEmailDomainMatch(companyEmail, websiteUrl);
    const emailDomain = companyEmail.split('@')[1] || '';
    const emailDomainMatchResult: VerificationCheckResult = {
      checkType: 'EMAIL_DOMAIN_MATCH',
      status: (matchesEmail ? 'PASSED' : 'WARNING') as CheckStatusType,
      providerName: 'IDENTITY_MATCHER',
      details: matchesEmail
        ? `Corporate email domain '${emailDomain}' matches verified website domain '${hostname}'.`
        : `Email domain '${emailDomain}' does not match official domain '${hostname}'. Flagged for administrator review.`,
      rawResponseSummary: { emailDomain, hostname, matches: matchesEmail },
    };

    // 4. Name Consistency Check
    const cleanBrand = brandName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanHost = hostname.replace(/\.(com|in|org|net|co|io|tech|ai|gov)$/i, '').replace(/[^a-z0-9]/g, '');

    const nameConsistent =
      cleanHost.includes(cleanBrand) || cleanBrand.includes(cleanHost) || cleanBrand.length <= 3;

    const nameConsistencyResult: VerificationCheckResult = {
      checkType: 'BRAND_NAME_CONSISTENCY',
      status: (nameConsistent ? 'PASSED' : 'WARNING') as CheckStatusType,
      providerName: 'IDENTITY_MATCHER',
      details: nameConsistent
        ? `Brand name '${brandName}' aligns with domain registration token '${cleanHost}'.`
        : `Brand name '${brandName}' has low overlap with domain '${hostname}'. Queued for manual confirmation.`,
      rawResponseSummary: { brandName, cleanBrand, cleanHost, consistent: nameConsistent },
    };

    return {
      domainResolves: dnsCheckResult,
      httpsValid: httpsCheckResult,
      emailDomainMatch: emailDomainMatchResult,
      nameConsistency: nameConsistencyResult,
    };
  }
}

export const domainVerificationProvider = new DomainVerificationProvider();
