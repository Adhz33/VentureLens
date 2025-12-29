import { useState } from 'react';
import { Download, FileSpreadsheet, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface FundingData {
  id: string;
  startup_name: string;
  funding_amount: number | null;
  funding_round: string | null;
  sector: string | null;
  investor_name: string | null;
  location: string | null;
  funding_date: string | null;
}

export const ExportPanel = () => {
  const [isExporting, setIsExporting] = useState(false);

  const fetchFundingData = async (): Promise<FundingData[]> => {
    const { data, error } = await supabase
      .from('funding_data')
      .select('*')
      .order('funding_date', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch data: ${error.message}`);
    }

    return data || [];
  };

  const formatCurrency = (amount: number | null): string => {
    if (!amount) return 'N/A';
    if (amount >= 1000000000) return `$${(amount / 1000000000).toFixed(1)}B`;
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}K`;
    return `$${amount}`;
  };

  const exportToCSV = async () => {
    setIsExporting(true);
    try {
      const data = await fetchFundingData();
      
      if (data.length === 0) {
        toast.info('No funding data available to export');
        return;
      }

      const headers = ['Startup Name', 'Funding Amount', 'Round', 'Sector', 'Investor', 'Location', 'Date'];
      const rows = data.map(item => [
        item.startup_name,
        item.funding_amount?.toString() || '',
        item.funding_round || '',
        item.sector || '',
        item.investor_name || '',
        item.location || '',
        item.funding_date || '',
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `funding_data_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);

      toast.success(`Exported ${data.length} records to CSV`);
    } catch (error) {
      console.error('CSV export error:', error);
      toast.error('Failed to export CSV');
    } finally {
      setIsExporting(false);
    }
  };

  const exportToPDF = async () => {
    setIsExporting(true);
    try {
      const data = await fetchFundingData();

      if (data.length === 0) {
        toast.info('No funding data available to export');
        return;
      }

      const doc = new jsPDF();
      
      // Title
      doc.setFontSize(20);
      doc.setTextColor(40, 40, 40);
      doc.text('Startup Funding Report', 14, 22);
      
      // Subtitle
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 30);
      
      // Summary stats
      const totalFunding = data.reduce((sum, item) => sum + (item.funding_amount || 0), 0);
      const uniqueStartups = new Set(data.map(d => d.startup_name)).size;
      const uniqueInvestors = new Set(data.filter(d => d.investor_name).map(d => d.investor_name)).size;
      
      doc.setFontSize(12);
      doc.setTextColor(40, 40, 40);
      doc.text('Summary', 14, 42);
      doc.setFontSize(10);
      doc.text(`Total Funding: ${formatCurrency(totalFunding)}`, 14, 50);
      doc.text(`Total Deals: ${data.length}`, 14, 56);
      doc.text(`Unique Startups: ${uniqueStartups}`, 14, 62);
      doc.text(`Unique Investors: ${uniqueInvestors}`, 14, 68);

      // Table
      const tableData = data.slice(0, 50).map(item => [
        item.startup_name,
        formatCurrency(item.funding_amount),
        item.funding_round || 'N/A',
        item.sector || 'N/A',
        item.investor_name || 'N/A',
        item.funding_date || 'N/A',
      ]);

      autoTable(doc, {
        startY: 76,
        head: [['Startup', 'Amount', 'Round', 'Sector', 'Investor', 'Date']],
        body: tableData,
        theme: 'striped',
        headStyles: {
          fillColor: [245, 158, 11],
          textColor: [255, 255, 255],
          fontSize: 9,
        },
        bodyStyles: {
          fontSize: 8,
        },
        columnStyles: {
          0: { cellWidth: 35 },
          1: { cellWidth: 25 },
          2: { cellWidth: 25 },
          3: { cellWidth: 30 },
          4: { cellWidth: 35 },
          5: { cellWidth: 25 },
        },
      });

      doc.save(`funding_report_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success(`Exported ${Math.min(data.length, 50)} records to PDF`);
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error('Failed to export PDF');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={isExporting}>
          {isExporting ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Download className="w-4 h-4 mr-2" />
          )}
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportToCSV}>
          <FileSpreadsheet className="w-4 h-4 mr-2" />
          Download CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToPDF}>
          <FileText className="w-4 h-4 mr-2" />
          Generate PDF Report
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
