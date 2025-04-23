/**
 * Service for interacting with the OpenAI API endpoints
 */
export const openaiService = {
  /**
   * Generate text using OpenAI
   * @param prompt The prompt to generate text from
   * @returns The generated text
   */
  async generateText(prompt: string): Promise<string> {
    try {
      const response = await fetch('/api/openai/generate-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to generate text');
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to generate text');
      }
      
      return data.data;
    } catch (error) {
      console.error('Error generating text with OpenAI:', error);
      throw error;
    }
  },
  
  /**
   * Generate a shipping document using OpenAI
   * @param vesselData The vessel data for the document
   * @param documentType The type of document to generate
   * @returns The generated document content
   */
  async generateDocument(vesselData: any, documentType: string): Promise<string> {
    try {
      const response = await fetch('/api/openai/generate-document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ vesselData, documentType }),
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to generate document');
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to generate document');
      }
      
      return data.data;
    } catch (error) {
      console.error('Error generating document with OpenAI:', error);
      throw error;
    }
  },
  
  /**
   * Generate trading analysis using OpenAI
   * @param marketData The market data to analyze
   * @returns The generated analysis
   */
  async analyzeTradingData(marketData: any): Promise<string> {
    try {
      const response = await fetch('/api/openai/analyze-trading', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ marketData }),
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to analyze trading data');
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to analyze trading data');
      }
      
      return data.data;
    } catch (error) {
      console.error('Error analyzing trading data with OpenAI:', error);
      throw error;
    }
  },
  
  /**
   * Analyze vessel route and suggest optimizations
   * @param vesselData The vessel data including route information
   * @returns The route analysis and optimization suggestions
   */
  async analyzeVesselRoute(vesselData: any): Promise<string> {
    try {
      const response = await fetch('/api/openai/analyze-route', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ vesselData }),
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to analyze vessel route');
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to analyze vessel route');
      }
      
      return data.data;
    } catch (error) {
      console.error('Error analyzing vessel route with OpenAI:', error);
      throw error;
    }
  },
  
  /**
   * Generate structured data using OpenAI
   * @param prompt The prompt for data generation
   * @param schema Description of the expected JSON structure
   * @returns The generated structured data
   */
  async generateStructuredData<T>(prompt: string, schema: string): Promise<T> {
    try {
      const response = await fetch('/api/openai/structured-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt, schema }),
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to generate structured data');
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to generate structured data');
      }
      
      return data.data as T;
    } catch (error) {
      console.error('Error generating structured data with OpenAI:', error);
      throw error;
    }
  }
};