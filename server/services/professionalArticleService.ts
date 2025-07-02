import OpenAI from 'openai';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

export interface ArticleGenerationRequest {
  vesselId: number;
  vesselName: string;
  articleType: string;
  authorId: number;
}

export interface GeneratedArticle {
  title: string;
  content: string;
  type: string;
}

const ARTICLE_TEMPLATES = {
  commercial_analysis: {
    title: "Commercial Analysis Report",
    prompt: `Generate a comprehensive commercial analysis report for the vessel {vesselName}. 

This should be a professional maritime industry report covering:
1. Market Position Analysis
2. Commercial Viability Assessment
3. Revenue Generation Potential
4. Operating Cost Analysis
5. Competitive Market Overview
6. Investment Recommendations

The report should be detailed, data-driven, and written in professional maritime industry language. Include specific metrics, market trends, and actionable insights. Format as structured HTML with proper headings and sections.`
  },
  
  technical_certificate: {
    title: "Technical Certificate",
    prompt: `Generate a professional technical certificate document for the vessel {vesselName}.

This should include:
1. Vessel Technical Specifications
2. Safety Compliance Certification
3. Environmental Standards Compliance
4. Equipment Certification Status
5. Inspection Results Summary
6. Regulatory Compliance Statement

Write in formal certification language with technical precision. Include certification numbers, dates, and regulatory references. Format as structured HTML suitable for official documentation.`
  },
  
  inspection_report: {
    title: "Vessel Inspection Report",
    prompt: `Generate a detailed vessel inspection report for {vesselName}.

Cover the following inspection areas:
1. Hull and Structural Integrity
2. Cargo Systems and Equipment
3. Navigation and Communication Systems
4. Safety Equipment and Procedures
5. Environmental Compliance
6. Crew Facilities and Standards
7. Maintenance Status
8. Recommendations and Action Items

Write in professional maritime inspection language with specific findings, recommendations, and compliance status. Format as structured HTML with clear sections.`
  },
  
  cargo_manifest: {
    title: "Cargo Manifest Document",
    prompt: `Generate a comprehensive cargo manifest document for the vessel {vesselName}.

Include the following sections:
1. Cargo Description and Classification
2. Loading and Stowage Details
3. Quantity and Weight Specifications
4. Origin and Destination Information
5. Handling Requirements
6. Safety and Environmental Considerations
7. Documentation and Certificates
8. Compliance with International Regulations

Write in formal maritime documentation language with precise technical details. Format as structured HTML suitable for official cargo documentation.`
  },

  // Trading Documents
  letter_of_intent: {
    title: "Letter of Intent (LOI)",
    prompt: `Generate a professional Letter of Intent for oil cargo purchase involving the vessel {vesselName}.

Include the following sections:
1. Declaration of Intent to Purchase
2. Oil Product Specifications and Grade
3. Estimated Quantity and Volume
4. Proposed Price Terms and Structure
5. Loading Port and Destination Details
6. Tentative Timeline and Schedule
7. Payment and Financial Terms
8. Conditions and Requirements
9. Legal Framework and Jurisdiction
10. Next Steps and Documentation

Write in formal commercial language typical for international oil trading. Include specific maritime terminology and standard LOI clauses. Format as structured HTML for professional presentation.`
  },

  soft_corporate_offer: {
    title: "Soft Corporate Offer (SCO)",
    prompt: `Generate a Soft Corporate Offer for oil products related to vessel {vesselName}.

Include the following sections:
1. Product Specifications and Quality
2. Quantity Available and Delivery Terms
3. Origin and Loading Terminal Details
4. Pricing Structure and Payment Terms
5. Delivery Schedule and Logistics
6. Tank Storage and Vessel Requirements
7. Documentation and Certificates
8. Performance Guarantees
9. Validity Period and Conditions
10. Contact Information and Procedures

Write in professional oil trading language with specific technical details. Include standard SCO terms and conditions. Format as structured HTML for business presentation.`
  },

  purchase_order: {
    title: "Irrevocable Corporate Purchase Order",
    prompt: `Generate an Irrevocable Corporate Purchase Order for oil cargo involving vessel {vesselName}.

Include the following sections:
1. Buyer and Seller Information
2. Product Specifications and Grade
3. Exact Quantity and Volume
4. Unit Price and Total Value
5. Loading Port and Discharge Terminal
6. Delivery Terms and Incoterms
7. Payment Terms and Schedule
8. Quality Specifications and Testing
9. Performance Bond Requirements
10. Force Majeure and Legal Clauses

Write in binding legal commercial language for oil trading. Include irrevocable commitment clauses and standard purchase terms. Format as structured HTML for official documentation.`
  },

  sales_purchase_agreement: {
    title: "Sales & Purchase Agreement (SPA)",
    prompt: `Generate a comprehensive Sales & Purchase Agreement for oil products related to vessel {vesselName}.

Include the following sections:
1. Parties and Legal Entities
2. Product Description and Specifications
3. Quantity, Quality, and Testing Procedures
4. Price, Payment Terms, and Currency
5. Delivery Terms and Shipping Instructions
6. Loading and Discharge Procedures
7. Title Transfer and Risk Allocation
8. Insurance and Force Majeure
9. Dispute Resolution and Arbitration
10. Governing Law and Jurisdiction

Write in formal legal language for international oil trading contracts. Include comprehensive terms and conditions. Format as structured HTML for legal documentation.`
  },

  // Financial Documents
  performance_bond: {
    title: "Performance Bond (PB)",
    prompt: `Generate a Performance Bond document for oil trading contract involving vessel {vesselName}.

Include the following sections:
1. Bond Issuer and Beneficiary Details
2. Principal Contract Reference
3. Bond Amount and Currency
4. Performance Obligations Covered
5. Validity Period and Expiration
6. Conditions for Bond Execution
7. Claims Procedure and Documentation
8. Governing Law and Jurisdiction
9. Amendment and Cancellation Terms
10. Contact Information and Instructions

Write in formal banking and legal language. Include standard performance bond clauses for oil trading. Format as structured HTML for financial documentation.`
  },

  standby_letter_credit: {
    title: "Standby Letter of Credit (SBLC)",
    prompt: `Generate a Standby Letter of Credit for oil trading transaction involving vessel {vesselName}.

Include the following sections:
1. Issuing Bank and Beneficiary Information
2. Credit Amount and Currency
3. Underlying Transaction Reference
4. Conditions for Drawing
5. Required Documentation
6. Presentation Period and Expiry Date
7. Payment Terms and Instructions
8. Governing Rules and Regulations
9. Confirmation and Amendment Procedures
10. Contact Details and Communications

Write in standard banking language following UCP 600 guidelines. Include specific SBLC terms for oil trading. Format as structured HTML for banking documentation.`
  },

  documentary_letter_credit: {
    title: "Documentary Letter of Credit (DLC)",
    prompt: `Generate a Documentary Letter of Credit for oil shipment on vessel {vesselName}.

Include the following sections:
1. Opening Bank and Beneficiary Details
2. Credit Amount and Available Balance
3. Shipment Terms and Latest Date
4. Required Documents and Presentation
5. Bill of Lading Requirements
6. Insurance and Inspection Certificates
7. Payment and Negotiation Terms
8. Partial Shipments and Transshipment
9. UCP 600 Rules and Compliance
10. Advising Bank and Confirmation

Write in international banking language compliant with UCP 600. Include specific documentary requirements for oil shipments. Format as structured HTML for trade finance.`
  },

  proforma_invoice: {
    title: "Proforma Invoice",
    prompt: `Generate a Proforma Invoice for oil products shipped on vessel {vesselName}.

Include the following sections:
1. Seller and Buyer Information
2. Invoice Number and Date
3. Product Description and Specifications
4. Quantity, Unit Price, and Total Amount
5. Terms of Sale and Delivery
6. Payment Terms and Currency
7. Shipping Instructions and Details
8. Validity Period and Conditions
9. Customs and Regulatory Information
10. Contact Details and References

Write in commercial invoice language for international trade. Include accurate pricing and shipping terms. Format as structured HTML for customs and quotation purposes.`
  },

  commercial_invoice: {
    title: "Commercial Invoice",
    prompt: `Generate a Commercial Invoice for oil cargo delivery via vessel {vesselName}.

Include the following sections:
1. Seller and Buyer Complete Details
2. Invoice Number, Date, and Reference
3. Detailed Product Description
4. Quantity, Unit Price, and Total Value
5. Terms of Payment and Delivery
6. Shipping and Transportation Details
7. Customs Classification and Codes
8. Currency and Exchange Rates
9. Tax and Duty Information
10. Certification and Signatures

Write in official commercial language for international trade. Include all required customs information. Format as structured HTML for payment and customs clearance.`
  },

  // Shipping & Logistics
  bill_of_lading: {
    title: "Bill of Lading (B/L)",
    prompt: `Generate a Bill of Lading for oil cargo transported on vessel {vesselName}.

Include the following sections:
1. Shipper, Consignee, and Notify Party
2. Vessel Name and Voyage Number
3. Port of Loading and Discharge
4. Description of Goods and Quantity
5. Freight Terms and Charges
6. Number of Originals Issued
7. Date of Loading and Sailing
8. Condition of Cargo and Remarks
9. Master's Signature and Seal
10. Legal Terms and Conditions

Write in maritime legal language following international standards. Include standard B/L clauses for oil cargo. Format as structured HTML for shipping documentation.`
  },

  packing_list: {
    title: "Packing List",
    prompt: `Generate a Packing List for oil cargo shipment on vessel {vesselName}.

Include the following sections:
1. Shipper and Consignee Information
2. Cargo Description and Classification
3. Package Numbers and Markings
4. Quantity and Weight Details
5. Tank or Container Specifications
6. Loading and Stowage Instructions
7. Handling and Safety Requirements
8. Measurement and Volume Data
9. Quality and Grade Information
10. Shipping and Transport Details

Write in technical shipping language with precise specifications. Include detailed cargo information for handling. Format as structured HTML for logistics documentation.`
  },

  shipping_declaration: {
    title: "Shipping Declaration",
    prompt: `Generate a Shipping Declaration for oil cargo on vessel {vesselName}.

Include the following sections:
1. Vessel and Voyage Information
2. Cargo Description and Classification
3. Loading Port and Destination
4. Shipper and Consignee Details
5. Quantity and Value Declaration
6. Route and Transit Information
7. Safety and Environmental Data
8. Regulatory Compliance Status
9. Insurance and Coverage Details
10. Declaration and Certification

Write in official maritime declaration language. Include regulatory compliance statements. Format as structured HTML for shipping authorities.`
  },

  discharge_permit: {
    title: "Discharge Permit",
    prompt: `Generate a Discharge Permit for oil cargo from vessel {vesselName}.

Include the following sections:
1. Port Authority and Vessel Details
2. Cargo Description and Quantity
3. Discharge Terminal and Facilities
4. Safety and Environmental Clearance
5. Required Documentation and Certificates
6. Discharge Procedures and Timeline
7. Quality Control and Testing Requirements
8. Waste Management and Disposal
9. Emergency Response Procedures
10. Permit Validity and Conditions

Write in port authority language with safety emphasis. Include environmental protection requirements. Format as structured HTML for port operations.`
  },

  delivery_report: {
    title: "Delivery Report",
    prompt: `Generate a Delivery Report for oil cargo delivered by vessel {vesselName}.

Include the following sections:
1. Vessel and Cargo Identification
2. Delivery Date, Time, and Location
3. Quantity Delivered and Received
4. Quality Analysis and Test Results
5. Condition of Cargo and Packaging
6. Delivery Process and Procedures
7. Any Discrepancies or Issues
8. Receiver Confirmation and Signature
9. Documentation and Certificates
10. Final Status and Completion

Write in operational delivery language with accuracy emphasis. Include quality confirmation details. Format as structured HTML for completion documentation.`
  },

  bunker_delivery_note: {
    title: "Bunker Delivery Note (BDN)",
    prompt: `Generate a Bunker Delivery Note for fuel supplied to vessel {vesselName}.

Include the following sections:
1. Supplier and Vessel Information
2. Port and Delivery Location
3. Fuel Type and Specifications
4. Quantity Delivered and Meter Readings
5. Quality Parameters and Test Results
6. Delivery Date, Time, and Duration
7. Sampling and Analysis Procedures
8. Master's and Engineer's Confirmation
9. Any Remarks or Observations
10. Signatures and Documentation

Write in marine engineering language for fuel operations. Include technical fuel specifications and quality data. Format as structured HTML for vessel operations.`
  },

  // Certificates & Quality
  certificate_origin: {
    title: "Certificate of Origin",
    prompt: `Generate a Certificate of Origin for oil products transported on vessel {vesselName}.

Include the following sections:
1. Issuing Authority and Certification Body
2. Exporter and Importer Information
3. Product Description and Classification
4. Country of Origin and Production
5. Manufacturing and Processing Details
6. Quality Standards and Compliance
7. Export Regulations and Permits
8. Certification Date and Validity
9. Official Stamps and Signatures
10. Legal Framework and Authenticity

Write in official certification language with regulatory compliance. Include authentic origin verification. Format as structured HTML for customs and trade authorities.`
  },

  sgs_inspection: {
    title: "SGS Inspection Certificate",
    prompt: `Generate an SGS Inspection Certificate for oil cargo on vessel {vesselName}.

Include the following sections:
1. SGS Office and Inspector Information
2. Vessel and Cargo Identification
3. Inspection Date, Time, and Location
4. Sampling Procedures and Methods
5. Quality Analysis and Test Results
6. Quantity Verification and Measurements
7. Condition Assessment and Findings
8. Compliance with Specifications
9. Certification and Validation
10. SGS Official Signature and Seal

Write in technical inspection language with SGS standards. Include detailed analytical results and quality parameters. Format as structured HTML for quality assurance.`
  },

  certificate_quality: {
    title: "Certificate of Quality",
    prompt: `Generate a Certificate of Quality for oil products on vessel {vesselName}.

Include the following sections:
1. Issuing Laboratory and Certification Body
2. Product Identification and Batch Details
3. Sampling Date, Time, and Procedures
4. Physical and Chemical Properties
5. Quality Parameters and Specifications
6. Test Methods and Standards Applied
7. Results and Compliance Status
8. Quality Assurance and Validation
9. Certificate Validity and Limitations
10. Laboratory Signature and Accreditation

Write in analytical laboratory language with technical precision. Include comprehensive quality data and test results. Format as structured HTML for quality certification.`
  },

  certificate_quantity: {
    title: "Certificate of Quantity",
    prompt: `Generate a Certificate of Quantity for oil cargo on vessel {vesselName}.

Include the following sections:
1. Surveyor and Inspection Company Details
2. Vessel and Cargo Information
3. Measurement Date, Time, and Location
4. Tank Gauging and Calibration Data
5. Temperature and Density Measurements
6. Volume Calculations and Corrections
7. Net Quantity and Weight Determination
8. Measurement Standards and Procedures
9. Surveyor Certification and Validation
10. Official Signature and Company Seal

Write in surveying and measurement language with mathematical precision. Include detailed quantity calculations and measurement data. Format as structured HTML for quantity verification.`
  },

  pre_discharge_inspection: {
    title: "Pre-discharge Inspection",
    prompt: `Generate a Pre-discharge Inspection report for vessel {vesselName}.

Include the following sections:
1. Inspector and Inspection Company Details
2. Vessel and Cargo Identification
3. Inspection Date, Time, and Scope
4. Cargo Condition and Quality Assessment
5. Tank and Pipeline System Check
6. Safety and Environmental Review
7. Documentation and Certificate Verification
8. Discharge Readiness Assessment
9. Recommendations and Requirements
10. Inspector Certification and Approval

Write in maritime inspection language with safety focus. Include comprehensive readiness assessment. Format as structured HTML for port and terminal operations.`
  },

  // Safety & Compliance
  safety_data_sheet: {
    title: "Safety Data Sheet (SDS)",
    prompt: `Generate a Safety Data Sheet for oil products transported on vessel {vesselName}.

Include the following sections:
1. Product Identification and Classification
2. Hazard Identification and Warnings
3. Composition and Ingredient Information
4. First Aid Measures and Emergency Procedures
5. Fire Fighting and Explosion Prevention
6. Accidental Release and Spill Response
7. Handling and Storage Requirements
8. Exposure Controls and Personal Protection
9. Physical and Chemical Properties
10. Transport Information and Regulations

Write in regulatory safety language following GHS standards. Include comprehensive hazard information and safety precautions. Format as structured HTML for workplace safety.`
  },

  cargo_insurance: {
    title: "Cargo Insurance",
    prompt: `Generate a Cargo Insurance document for oil shipment on vessel {vesselName}.

Include the following sections:
1. Insurance Company and Policy Details
2. Insured Party and Beneficiary Information
3. Cargo Description and Value
4. Voyage Route and Transportation Details
5. Coverage Scope and Limitations
6. Premium and Payment Terms
7. Claims Procedure and Documentation
8. Exclusions and Conditions
9. Policy Period and Validity
10. Contact Information and Emergency Claims

Write in insurance industry language with legal precision. Include comprehensive coverage terms and conditions. Format as structured HTML for insurance documentation.`
  },

  risk_assessment: {
    title: "Risk Assessment",
    prompt: `Generate a Risk Assessment for oil transportation operation involving vessel {vesselName}.

Include the following sections:
1. Operation Scope and Objectives
2. Risk Identification and Categories
3. Probability and Impact Analysis
4. Environmental and Safety Hazards
5. Security and Operational Risks
6. Mitigation Strategies and Controls
7. Contingency and Emergency Plans
8. Monitoring and Review Procedures
9. Responsible Parties and Authorities
10. Risk Register and Documentation

Write in risk management language with analytical approach. Include comprehensive risk analysis and mitigation measures. Format as structured HTML for operational planning.`
  },

  // Licenses & Permits
  export_license: {
    title: "Export License",
    prompt: `Generate an Export License for oil products shipped on vessel {vesselName}.

Include the following sections:
1. Licensing Authority and Reference Number
2. Exporter Information and Registration
3. Product Description and Classification
4. Quantity and Value Authorization
5. Destination Country and End User
6. Export Terms and Conditions
7. Validity Period and Restrictions
8. Compliance Requirements and Obligations
9. Reporting and Documentation Duties
10. Official Seal and Authorization

Write in regulatory government language with legal authority. Include export control requirements and compliance obligations. Format as structured HTML for trade administration.`
  },

  import_license: {
    title: "Import License",
    prompt: `Generate an Import License for oil products arriving on vessel {vesselName}.

Include the following sections:
1. Import Authority and License Number
2. Importer Details and Registration
3. Product Specifications and Classification
4. Authorized Quantity and Value
5. Origin Country and Supplier Information
6. Import Terms and Regulations
7. Customs Duties and Tax Information
8. Validity Period and Conditions
9. Compliance and Reporting Requirements
10. Official Authorization and Stamp

Write in customs and trade regulation language. Include import procedures and regulatory compliance. Format as structured HTML for customs authorities.`
  },

  // Financial Records
  payment_receipt: {
    title: "Payment Receipt",
    prompt: `Generate a Payment Receipt for oil trading transaction involving vessel {vesselName}.

Include the following sections:
1. Payer and Payee Information
2. Receipt Number and Transaction Date
3. Payment Amount and Currency
4. Payment Method and Reference
5. Invoice or Contract Reference
6. Description of Goods or Services
7. Tax and Duty Breakdown
8. Bank Details and Processing Information
9. Receipt Validity and Terms
10. Official Signature and Company Seal

Write in financial accounting language with transaction accuracy. Include complete payment documentation. Format as structured HTML for financial records.`
  },

  statement_account: {
    title: "Statement of Account",
    prompt: `Generate a Statement of Account for oil trading activities related to vessel {vesselName}.

Include the following sections:
1. Account Holder and Company Details
2. Statement Period and Date Range
3. Opening and Closing Balance
4. Transaction History and Details
5. Invoices and Payment Records
6. Charges, Fees, and Interest
7. Credits and Adjustments
8. Outstanding Balance and Due Amounts
9. Payment Terms and Conditions
10. Contact Information for Inquiries

Write in financial statement language with accounting precision. Include comprehensive account activity and balance information. Format as structured HTML for financial management.`
  }
};

export class ProfessionalArticleService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }
  
  async generateArticle(request: ArticleGenerationRequest): Promise<GeneratedArticle> {
    const template = ARTICLE_TEMPLATES[request.articleType as keyof typeof ARTICLE_TEMPLATES];
    
    if (!template) {
      throw new Error(`Unknown article type: ${request.articleType}`);
    }

    const prompt = template.prompt.replace(/{vesselName}/g, request.vesselName);

    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a professional maritime industry expert and technical writer. Generate comprehensive, accurate, and professionally formatted reports for the shipping industry. Always respond with structured HTML content using proper headings, paragraphs, and formatting."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000
      });

      const content = completion.choices[0].message.content;
      
      if (!content) {
        throw new Error("No content generated from AI service");
      }

      return {
        title: template.title,
        content: content,
        type: request.articleType
      };

    } catch (error: any) {
      console.error("Error generating article:", error);
      
      // Provide a professional fallback if AI generation fails
      const fallbackContent = this.generateFallbackContent(request.articleType, request.vesselName);
      
      return {
        title: template.title,
        content: fallbackContent,
        type: request.articleType
      };
    }
  }

  async generatePDF(article: GeneratedArticle, vesselName: string, articleId: number): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        // Ensure uploads directory exists
        const uploadsDir = path.join(process.cwd(), 'uploads', 'articles');
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }

        const fileName = `vessel-article-${articleId}-${Date.now()}.pdf`;
        const filePath = path.join(uploadsDir, fileName);

        const doc = new PDFDocument({
          margin: 50,
          size: 'A4'
        });

        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        // Add company logo (if exists)
        const logoPath = path.join(process.cwd(), 'public', 'assets', 'petrodealhub-logo.png');
        if (fs.existsSync(logoPath)) {
          doc.image(logoPath, 50, 50, { width: 200 });
          doc.moveDown(3);
        }

        // Add watermark
        doc.save();
        doc.rotate(45, { origin: [300, 400] });
        doc.fontSize(60);
        doc.fillColor('gray', 0.1);
        doc.text('PetroDealHub', 0, 300, { align: 'center' });
        doc.restore();

        // Header
        doc.fillColor('black');
        doc.fontSize(24);
        doc.font('Helvetica-Bold');
        doc.text(article.title, 50, 150, { align: 'center' });
        
        doc.fontSize(16);
        doc.font('Helvetica');
        doc.text(`Vessel: ${vesselName}`, 50, 180, { align: 'center' });
        
        doc.fontSize(12);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 50, 200, { align: 'center' });
        
        // Add line separator
        doc.moveTo(50, 220)
           .lineTo(550, 220)
           .stroke();

        doc.moveDown(2);

        // Content
        const cleanContent = this.stripHtmlTags(article.content);
        const lines = cleanContent.split('\n').filter(line => line.trim());
        
        let yPosition = 250;
        doc.fontSize(11);
        doc.font('Helvetica');

        for (const line of lines) {
          if (yPosition > 750) {
            doc.addPage();
            yPosition = 50;
          }

          if (line.trim().length === 0) {
            yPosition += 10;
            continue;
          }

          // Handle headers (lines that are all caps or contain certain keywords)
          if (this.isHeader(line)) {
            doc.font('Helvetica-Bold');
            doc.fontSize(12);
            yPosition += 15;
          } else {
            doc.font('Helvetica');
            doc.fontSize(11);
          }

          const wrappedText = doc.text(line, 50, yPosition, { 
            width: 500, 
            continued: false 
          });
          
          yPosition += doc.heightOfString(line, { width: 500 }) + 5;
        }

        // Footer
        const pageCount = doc.bufferedPageRange().count;
        for (let i = 0; i < pageCount; i++) {
          doc.switchToPage(i);
          doc.fontSize(10);
          doc.text(
            `Page ${i + 1} of ${pageCount}`,
            50,
            750,
            { align: 'center' }
          );
          doc.text(
            'Generated by PetroDealHub Professional Services',
            50,
            760,
            { align: 'center' }
          );
        }

        doc.end();

        stream.on('finish', () => {
          resolve(`/uploads/articles/${fileName}`);
        });

        stream.on('error', (error) => {
          reject(error);
        });

      } catch (error) {
        reject(error);
      }
    });
  }

  private stripHtmlTags(html: string): string {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .trim();
  }

  private isHeader(line: string): boolean {
    const trimmed = line.trim();
    return (
      trimmed.length < 100 &&
      (trimmed === trimmed.toUpperCase() ||
       trimmed.includes(':') ||
       /^\d+\./.test(trimmed) ||
       ['EXECUTIVE SUMMARY', 'INTRODUCTION', 'CONCLUSION', 'RECOMMENDATIONS'].some(header => 
         trimmed.toUpperCase().includes(header)
       ))
    );
  }

  private generateFallbackContent(articleType: string, vesselName: string): string {
    const date = new Date().toLocaleDateString();
    
    const fallbackTemplates = {
      commercial_analysis: `
        <h2>Commercial Analysis Report</h2>
        <h3>Vessel: ${vesselName}</h3>
        <p><strong>Date:</strong> ${date}</p>
        
        <h3>Executive Summary</h3>
        <p>This commercial analysis provides a comprehensive evaluation of ${vesselName}'s market position and revenue potential in the current maritime industry landscape.</p>
        
        <h3>Market Position Analysis</h3>
        <p>The vessel demonstrates strong positioning within the oil tanker segment, with operational capabilities suited for current market demands.</p>
        
        <h3>Financial Performance</h3>
        <p>Based on industry standards and operational metrics, ${vesselName} presents viable commercial opportunities.</p>
        
        <h3>Recommendations</h3>
        <p>Continue monitoring market conditions and optimize operational efficiency to maximize revenue potential.</p>
      `,
      
      technical_certificate: `
        <h2>Technical Certificate</h2>
        <h3>Vessel: ${vesselName}</h3>
        <p><strong>Certificate Date:</strong> ${date}</p>
        
        <h3>Certification Statement</h3>
        <p>This certificate confirms that ${vesselName} meets the required technical standards and safety regulations for maritime operations.</p>
        
        <h3>Compliance Status</h3>
        <p>All systems and equipment have been inspected and certified according to international maritime standards.</p>
        
        <h3>Valid Until</h3>
        <p>This certification remains valid subject to periodic inspections and compliance maintenance.</p>
      `,
      
      inspection_report: `
        <h2>Vessel Inspection Report</h2>
        <h3>Vessel: ${vesselName}</h3>
        <p><strong>Inspection Date:</strong> ${date}</p>
        
        <h3>Inspection Overview</h3>
        <p>Comprehensive inspection of ${vesselName} has been completed covering all major systems and operational areas.</p>
        
        <h3>Key Findings</h3>
        <p>The vessel maintains good operational condition with all safety systems functioning within acceptable parameters.</p>
        
        <h3>Recommendations</h3>
        <p>Continue regular maintenance schedules and monitor identified areas for future attention.</p>
      `,
      
      cargo_manifest: `
        <h2>Cargo Manifest</h2>
        <h3>Vessel: ${vesselName}</h3>
        <p><strong>Manifest Date:</strong> ${date}</p>
        
        <h3>Cargo Information</h3>
        <p>This manifest details the cargo specifications and handling requirements for ${vesselName}.</p>
        
        <h3>Loading Details</h3>
        <p>Cargo has been loaded according to international safety standards and vessel specifications.</p>
        
        <h3>Documentation</h3>
        <p>All required documentation and certificates are in order and comply with international regulations.</p>
      `
    };
    
    return fallbackTemplates[articleType as keyof typeof fallbackTemplates] || 
           `<h2>Professional Document</h2><p>Document generated for ${vesselName} on ${date}</p>`;
  }
}

export const professionalArticleService = new ProfessionalArticleService();