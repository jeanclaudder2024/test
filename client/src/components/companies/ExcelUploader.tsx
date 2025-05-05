import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Upload, CheckCircle, AlertCircle, FileSpreadsheet, Loader2 } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface ExcelUploaderProps {
  onImportSuccess: (count: number) => void;
}

const ExcelUploader: React.FC<ExcelUploaderProps> = ({ onImportSuccess }) => {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadedCount, setUploadedCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setUploadStatus('idle');
    }
  };

  const resetUploader = () => {
    setFile(null);
    setProgress(0);
    setUploadStatus('idle');
    setUploadedCount(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsLoading(true);
    setUploadStatus('uploading');
    setProgress(10);

    try {
      // Read Excel file
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          setProgress(30);
          
          // Assume the first sheet is the one we want
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          
          // Convert to JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          
          setProgress(50);
          
          if (jsonData.length === 0) {
            throw new Error('The Excel file does not contain any data');
          }
          
          console.log('Parsed Excel data:', jsonData);
          
          // Process the data and transform it if needed
          const companies = jsonData.map((row: any) => ({
            name: row.Name || row.name || '',
            country: row.Country || row.country || '',
            region: row.Region || row.region || '',
            headquarters: row.Headquarters || row.headquarters || row.HQ || '',
            foundedYear: row.FoundedYear || row.foundedYear || row.Founded || null,
            ceo: row.CEO || row.ceo || '',
            fleetSize: row.FleetSize || row.fleetSize || null,
            specialization: row.Specialization || row.specialization || '',
            website: row.Website || row.website || '',
            logo: row.Logo || row.logo || '',
            description: row.Description || row.description || '',
            revenue: row.Revenue || row.revenue || null,
            employees: row.Employees || row.employees || null,
            publiclyTraded: Boolean(row.PubliclyTraded || row.publiclyTraded),
            stockSymbol: row.StockSymbol || row.stockSymbol || '',
            status: 'active'
          }));
          
          setProgress(70);
          
          // Send data to the API
          const result = await apiRequest('/api/companies/import-excel', {
            method: 'POST',
            data: { companies }
          });
          
          setProgress(100);
          setUploadedCount(result.count || companies.length);
          setUploadStatus('success');
          
          // Notify parent component
          onImportSuccess(result.count || companies.length);
          
          toast({
            title: 'Import Successful',
            description: `Successfully imported ${result.count || companies.length} companies from Excel`,
            variant: 'default',
          });
        } catch (error) {
          console.error('Error processing Excel file:', error);
          setUploadStatus('error');
          
          toast({
            title: 'Import Failed',
            description: error instanceof Error ? error.message : 'Failed to process Excel file',
            variant: 'destructive',
          });
        } finally {
          setIsLoading(false);
        }
      };
      
      reader.onerror = () => {
        setUploadStatus('error');
        setIsLoading(false);
        
        toast({
          title: 'Import Failed',
          description: 'Failed to read Excel file',
          variant: 'destructive',
        });
      };
      
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error('Error uploading Excel file:', error);
      setUploadStatus('error');
      setIsLoading(false);
      
      toast({
        title: 'Import Failed',
        description: error instanceof Error ? error.message : 'Failed to upload Excel file',
        variant: 'destructive',
      });
    }
  };

  return (
    <div>
      <div className="mb-6">
        <div className="flex gap-4 items-center">
          <Button 
            variant="outline" 
            onClick={() => fileInputRef.current?.click()} 
            disabled={isLoading}
            className="w-[200px] h-16"
          >
            <input
              type="file"
              accept=".xlsx,.xls"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <div className="flex flex-col items-center justify-center">
              <Upload className="h-5 w-5 mb-1" />
              <span>Select Excel File</span>
            </div>
          </Button>
          
          <div className="flex-1">
            {file ? (
              <Card className="p-4 flex items-center gap-3">
                <FileSpreadsheet className="h-6 w-6 text-primary" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{file.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB • {file.type || 'Excel file'}
                  </div>
                </div>
                <Button 
                  variant="default" 
                  onClick={handleUpload} 
                  disabled={isLoading || uploadStatus === 'success'}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : uploadStatus === 'success' ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Imported
                    </>
                  ) : (
                    'Import'
                  )}
                </Button>
              </Card>
            ) : (
              <div className="p-4 border border-dashed rounded-md text-center text-muted-foreground">
                <p>No file selected</p>
                <p className="text-xs mt-1">Supported formats: .xlsx, .xls</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {uploadStatus !== 'idle' && (
        <div className="mt-4">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">
              {uploadStatus === 'uploading' ? 'Processing...' : 
               uploadStatus === 'success' ? 'Import completed' : 
               'Import failed'}
            </span>
            <span className="text-sm text-muted-foreground">{progress}%</span>
          </div>
          
          <Progress value={progress} className="h-2" />
          
          <div className="mt-4">
            {uploadStatus === 'uploading' ? (
              <div className="flex items-center text-muted-foreground text-sm">
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                <span>Importing company data...</span>
              </div>
            ) : uploadStatus === 'success' ? (
              <div className="flex items-center text-sm text-green-600">
                <CheckCircle className="h-4 w-4 mr-2" />
                <span>Successfully imported {uploadedCount} companies</span>
              </div>
            ) : uploadStatus === 'error' ? (
              <div className="flex items-center text-sm text-destructive">
                <AlertCircle className="h-4 w-4 mr-2" />
                <span>Failed to import companies</span>
              </div>
            ) : null}
          </div>
          
          {(uploadStatus === 'success' || uploadStatus === 'error') && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={resetUploader} 
              className="mt-4"
            >
              Reset
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default ExcelUploader;