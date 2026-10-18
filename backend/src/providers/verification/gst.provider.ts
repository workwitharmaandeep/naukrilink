import { VerificationCheckResult } from './verification.interface';
import { validateGstin } from '../../modules/verification/verification.validator';

export class GstVerificationProvider {
  async verifyGstin(gstin: string, legalName: string): Promise<VerificationCheckResult> {
    // 1. Algorithmic Format & Mod-36 Checksum Validation
    const formatCheck = validateGstin(gstin);

    if (!formatCheck.isValid) {
      return {
        checkType: 'GSTIN_FORMAT_AND_CHECKSUM',
        status: 'FAILED',
        providerName: 'GSTN_ALGORITHM',
        details: formatCheck.reason || 'GSTIN checksum or format verification failed',
        rawResponseSummary: {
          gstinProvided: gstin,
          error: formatCheck.reason,
        },
      };
    }

    // 2. Licensed GST Data API Lookup
    const apiKey = process.env.GST_API_KEY;
    const apiUrl = process.env.GST_API_URL || 'https://api.gst.gov.in/v1/authenticate';
    const providerName = process.env.GST_API_PROVIDER || 'LICENSED_GSTIN_GATEWAY';

    if (!apiKey || apiKey.trim() === '') {
      // Per Section 3 & 5.2: If no provider key is configured, system MUST report 'Pending manual review' rather than pretending to verify
      return {
        checkType: 'GSTIN_REGISTRY_LOOKUP',
        status: 'MANUAL_REVIEW',
        providerName: providerName,
        details:
          'GSTIN format & checksum verified. External licensed GST API credentials not configured in environment (GST_API_KEY). Queued for administrator document verification.',
        rawResponseSummary: {
          gstin: gstin.toUpperCase(),
          formatValid: true,
          checksumValid: true,
          apiConfigured: false,
          stateCode: gstin.substring(0, 2),
          panEmbedded: gstin.substring(2, 12),
        },
      };
    }

    try {
      // When API credentials are supplied in production
      const response = await fetch(`${apiUrl}?gstin=${encodeURIComponent(gstin)}`, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return {
          checkType: 'GSTIN_REGISTRY_LOOKUP',
          status: 'MANUAL_REVIEW',
          providerName: providerName,
          details: `External GST API returned status ${response.status}. Queued for manual verification.`,
          rawResponseSummary: { status: response.status, statusText: response.statusText },
        };
      }

      const data = await response.json();
      return {
        checkType: 'GSTIN_REGISTRY_LOOKUP',
        status: data.active ? 'PASSED' : 'FAILED',
        providerName: providerName,
        details: data.active
          ? `Verified active registered taxpayer: ${data.tradeName || legalName}`
          : 'GSTIN record found but status is inactive or cancelled',
        rawResponseSummary: data,
      };
    } catch (err: any) {
      return {
        checkType: 'GSTIN_REGISTRY_LOOKUP',
        status: 'MANUAL_REVIEW',
        providerName: providerName,
        details: `Network error connecting to licensed GST provider (${err.message}). Queued for manual review.`,
        rawResponseSummary: { error: err.message },
      };
    }
  }
}

export const gstVerificationProvider = new GstVerificationProvider();
