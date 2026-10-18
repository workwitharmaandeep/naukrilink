import { VerificationCheckResult } from './verification.interface';
import { validateCin } from '../../modules/verification/verification.validator';

export class McaVerificationProvider {
  async verifyCin(cin: string, legalName: string): Promise<VerificationCheckResult> {
    const formatCheck = validateCin(cin);

    if (!formatCheck.isValid) {
      return {
        checkType: 'CIN_FORMAT_AND_STRUCTURE',
        status: 'FAILED',
        providerName: 'MCA_STATUTORY_RULES',
        details: formatCheck.reason || 'CIN does not meet statutory requirements',
        rawResponseSummary: {
          cinProvided: cin,
          error: formatCheck.reason,
        },
      };
    }

    const apiKey = process.env.MCA_API_KEY;
    const apiUrl = process.env.MCA_API_URL || 'https://mca.gov.in/api/v1/company';
    const providerName = process.env.MCA_API_PROVIDER || 'MCA_GATEWAY';

    if (!apiKey || apiKey.trim() === '') {
      return {
        checkType: 'CIN_MCA_RECORD_LOOKUP',
        status: 'MANUAL_REVIEW',
        providerName: providerName,
        details:
          'CIN format and incorporation year verified. Live MCA API key not configured in environment (MCA_API_KEY). Queued for manual admin verification.',
        rawResponseSummary: {
          cin: cin.toUpperCase(),
          formatValid: true,
          listingStatus: cin.startsWith('L') ? 'Listed' : 'Unlisted',
          incorporationYear: cin.substring(8, 12),
          stateCode: cin.substring(6, 8),
          companyType: cin.substring(12, 15),
          apiConfigured: false,
        },
      };
    }

    try {
      const response = await fetch(`${apiUrl}?cin=${encodeURIComponent(cin)}`, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return {
          checkType: 'CIN_MCA_RECORD_LOOKUP',
          status: 'MANUAL_REVIEW',
          providerName: providerName,
          details: `MCA API returned HTTP ${response.status}. Queued for manual review.`,
          rawResponseSummary: { status: response.status },
        };
      }

      const data = await response.json();
      return {
        checkType: 'CIN_MCA_RECORD_LOOKUP',
        status: data.companyStatus === 'Active' ? 'PASSED' : 'FAILED',
        providerName: providerName,
        details: `MCA Corporate Record: ${data.companyName || legalName} (${data.companyStatus || 'Status Unknown'})`,
        rawResponseSummary: data,
      };
    } catch (err: any) {
      return {
        checkType: 'CIN_MCA_RECORD_LOOKUP',
        status: 'MANUAL_REVIEW',
        providerName: providerName,
        details: `Network error connecting to MCA provider (${err.message}). Queued for manual review.`,
        rawResponseSummary: { error: err.message },
      };
    }
  }
}

export const mcaVerificationProvider = new McaVerificationProvider();
