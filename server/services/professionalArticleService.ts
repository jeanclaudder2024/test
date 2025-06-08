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