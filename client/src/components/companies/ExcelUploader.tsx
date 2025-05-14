import { useState } from 'react';
import { read, utils } from 'xlsx';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileCheck, AlertTriangle, FileWarning, FileX, Ship, Building } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface ExcelUploaderProps {
  onImportSuccess: (count: number) => void;
}

export default function ExcelUploader({ onImportSuccess }: ExcelUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [importedCount, setImportedCount] = useState(0);
  const [error, setError] = useState('');
  const { toast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    const files = e.target.files;
    
    if (!files || files.length === 0) {
      setFile(null);
      setPreviewData([]);
      return;
    }
    
    const selectedFile = files[0];
    
    // Check file type
    if (!selectedFile.name.endsWith('.xlsx') && !selectedFile.name.endsWith('.xls')) {
      setError('Please upload an Excel file (.xlsx or .xls)');
      setFile(null);
      setPreviewData([]);
      return;
    }
    
    setFile(selectedFile);
    
    try {
      // Read the Excel file
      const arrayBuffer = await selectedFile.arrayBuffer();
      const workbook = read(arrayBuffer, { type: 'array' });
      
      // Get the first sheet
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert to JSON
      const jsonData = utils.sheet_to_json(worksheet);
      
      // Show preview of first 5 records
      setPreviewData(jsonData.slice(0, 5));
    } catch (err) {
      console.error('Error reading Excel file:', err);
      setError('Error reading Excel file. Please make sure it is a valid Excel file.');
      setFile(null);
      setPreviewData([]);
    }
  };

  const processCompanyData = (data: any[]) => {
    return data.map(item => ({
      name: item.Name || item.name || '',
      country: item.Country || item.country || null,
      region: item.Region || item.region || null,
      headquarters: item.Headquarters || item.headquarters || null,
      foundedYear: item.FoundedYear || item['Founded Year'] || item.founded_year || null,
      ceo: item.CEO || item.ceo || null,
      fleetSize: item.FleetSize || item['Fleet Size'] || item.fleet_size || null,
      specialization: item.Specialization || item.specialization || null,
      website: item.Website || item.website || null,
      description: item.Description || item.description || null,
      revenue: item.Revenue || item.revenue || null,
      employees: item.Employees || item.employees || null,
      publiclyTraded: Boolean(item.PubliclyTraded || item['Publicly Traded'] || item.publicly_traded || false),
      stockSymbol: item.StockSymbol || item['Stock Symbol'] || item.stock_symbol || null,
      status: 'active'
    }));
  };

  const handleUpload = async () => {
    if (!file) return;
    
    try {
      setIsUploading(true);
      setProgress(10);
      
      // Read the Excel file
      const arrayBuffer = await file.arrayBuffer();
      const workbook = read(arrayBuffer, { type: 'array' });
      
      // Get the first sheet
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert to JSON
      const jsonData = utils.sheet_to_json(worksheet);
      setProgress(30);
      
      // Process the data
      const companies = processCompanyData(jsonData);
      setProgress(50);
      
      // Upload to API
      const response = await apiRequest('/api/companies/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ companies })
      });
      
      setProgress(100);
      
      const result = await response.json();
      setImportedCount(result.count);
      
      toast({
        title: 'Import successful',
        description: `${result.count} companies imported successfully.`,
        variant: 'default',
      });
      
      // Call the callback
      onImportSuccess(result.count);
    } catch (err) {
      console.error('Error uploading companies:', err);
      setError('Error uploading companies. Please try again.');
      toast({
        title: 'Import failed',
        description: 'There was an error importing the companies data.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const resetUploader = () => {
    setFile(null);
    setPreviewData([]);
    setProgress(0);
    setError('');
    setImportedCount(0);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Ship className="h-5 w-5 text-primary" />
          Import Oil Shipping Companies
        </CardTitle>
        <CardDescription>
          Upload an Excel file (.xlsx) containing oil shipping company data
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-red-800 dark:text-red-300 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        )}
        
        {!file && (
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center">
            <Upload className="h-8 w-8 mx-auto mb-4 text-gray-400" />
            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Excel files only (.xlsx, .xls)
            </p>
            <input
              type="file"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleFileChange}
              accept=".xlsx,.xls"
              disabled={isUploading}
            />
          </div>
        )}
        
        {file && !isUploading && importedCount === 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30 rounded-md">
              <FileCheck className="h-5 w-5 text-green-500" />
              <div className="flex-1">
                <p className="text-sm font-medium">{file.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={resetUploader}
                className="h-8 w-8 p-0"
              >
                <FileX className="h-5 w-5" />
              </Button>
            </div>
            
            {previewData.length > 0 && (
              <div className="border border-gray-200 dark:border-gray-800 rounded-md overflow-hidden">
                <div className="text-sm font-medium px-4 py-2 bg-gray-100 dark:bg-gray-800">
                  Preview: {previewData.length} of {file ? "many" : "0"} rows
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                      <tr>
                        {Object.keys(previewData[0]).slice(0, 5).map((key) => (
                          <th key={key} className="px-4 py-2 text-left">
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.map((row, rowIndex) => (
                        <tr key={rowIndex} className="border-t border-gray-200 dark:border-gray-800">
                          {Object.keys(row).slice(0, 5).map((key) => (
                            <td key={key} className="px-4 py-2 truncate max-w-[150px]">
                              {String(row[key] !== null && row[key] !== undefined ? row[key] : '-')}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
        
        {isUploading && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <FileWarning className="h-5 w-5 text-amber-500 animate-pulse" />
              <p className="text-sm">Processing {file?.name}...</p>
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              {progress < 30 && "Reading file..."}
              {progress >= 30 && progress < 50 && "Processing data..."}
              {progress >= 50 && progress < 100 && "Importing to database..."}
              {progress === 100 && "Complete!"}
            </p>
          </div>
        )}
        
        {importedCount > 0 && !isUploading && (
          <div className="p-4 bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30 rounded-md text-center">
            <FileCheck className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <p className="font-medium">Import Complete!</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Successfully imported {importedCount} companies.
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={resetUploader} disabled={isUploading || !file}>
          {importedCount > 0 ? "Import Another File" : "Cancel"}
        </Button>
        {file && importedCount === 0 && (
          <Button onClick={handleUpload} disabled={isUploading || !file}>
            {isUploading ? "Importing..." : "Import Oil Companies"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}