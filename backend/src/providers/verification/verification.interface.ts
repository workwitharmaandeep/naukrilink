export type CheckStatusType = 'PASSED' | 'FAILED' | 'WARNING' | 'PENDING' | 'MANUAL_REVIEW';

export interface VerificationCheckResult {
  checkType: string;
  status: CheckStatusType;
  providerName: string;
  rawResponseSummary?: any;
  details?: string;
}

export interface DomainVerificationResult {
  domainResolves: VerificationCheckResult;
  httpsValid: VerificationCheckResult;
  emailDomainMatch: VerificationCheckResult;
  nameConsistency: VerificationCheckResult;
}

export interface IVerificationProvider {
  verifyGstin(gstin: string, legalName: string): Promise<VerificationCheckResult>;
  verifyCin(cin: string, legalName: string): Promise<VerificationCheckResult>;
  verifyDomain(
    websiteUrl: string,
    companyEmail: string,
    brandName: string
  ): Promise<DomainVerificationResult>;
}
