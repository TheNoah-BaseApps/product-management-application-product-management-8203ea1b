'use client';

import { useState } from 'react';
import { Download, FileText, FileSpreadsheet, FileJson } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

export default function ExportButton({ 
  data = [], 
  filename = 'export', 
  columns = [],
  title = 'Export Data'
}) {
  const [loading, setLoading] = useState(false);

  const exportToPDF = () => {
    try {
      setLoading(true);
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(16);
      doc.text(title, 14, 15);
      
      // Add timestamp
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 25);

      // Prepare table data
      const headers = columns.length > 0 
        ? columns.map(col => col.header || col.label || col.key)
        : Object.keys(data[0] || {});
      
      const rows = data.map(item => {
        if (columns.length > 0) {
          return columns.map(col => {
            const value = col.accessor 
              ? col.accessor(item) 
              : item[col.key || col.field];
            return formatCellValue(value);
          });
        }
        return Object.values(item).map(formatCellValue);
      });

      // Add table
      doc.autoTable({
        head: [headers],
        body: rows,
        startY: 35,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [59, 130, 246] },
      });

      // Save PDF
      doc.save(`${filename}.pdf`);
      toast.success('PDF exported successfully');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Failed to export PDF');
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    try {
      setLoading(true);
      
      // Prepare data for Excel
      const excelData = data.map(item => {
        if (columns.length > 0) {
          const row = {};
          columns.forEach(col => {
            const header = col.header || col.label || col.key;
            const value = col.accessor 
              ? col.accessor(item) 
              : item[col.key || col.field];
            row[header] = formatCellValue(value);
          });
          return row;
        }
        return item;
      });

      // Create workbook and worksheet
      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Data');

      // Auto-size columns
      const maxWidth = 50;
      const colWidths = [];
      const range = XLSX.utils.decode_range(ws['!ref']);
      
      for (let C = range.s.c; C <= range.e.c; ++C) {
        let maxLen = 10;
        for (let R = range.s.r; R <= range.e.r; ++R) {
          const cell = ws[XLSX.utils.encode_cell({ r: R, c: C })];
          if (cell && cell.v) {
            const len = cell.v.toString().length;
            if (len > maxLen) maxLen = len;
          }
        }
        colWidths.push({ wch: Math.min(maxLen + 2, maxWidth) });
      }
      ws['!cols'] = colWidths;

      // Save Excel file
      XLSX.writeFile(wb, `${filename}.xlsx`);
      toast.success('Excel file exported successfully');
    } catch (error) {
      console.error('Error exporting Excel:', error);
      toast.error('Failed to export Excel file');
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    try {
      setLoading(true);
      
      // Prepare CSV data
      const headers = columns.length > 0 
        ? columns.map(col => col.header || col.label || col.key)
        : Object.keys(data[0] || {});
      
      const rows = data.map(item => {
        if (columns.length > 0) {
          return columns.map(col => {
            const value = col.accessor 
              ? col.accessor(item) 
              : item[col.key || col.field];
            return formatCellValue(value);
          });
        }
        return Object.values(item).map(formatCellValue);
      });

      // Create CSV content
      const csvContent = [
        headers.join(','),
        ...rows.map(row => 
          row.map(cell => {
            // Escape cells containing commas, quotes, or newlines
            const cellStr = String(cell);
            if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
              return `"${cellStr.replace(/"/g, '""')}"`;
            }
            return cellStr;
          }).join(',')
        )
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('CSV file exported successfully');
    } catch (error) {
      console.error('Error exporting CSV:', error);
      toast.error('Failed to export CSV file');
    } finally {
      setLoading(false);
    }
  };

  const exportToJSON = () => {
    try {
      setLoading(true);
      
      const jsonData = {
        title,
        exportedAt: new Date().toISOString(),
        data: data
      };

      const blob = new Blob([JSON.stringify(jsonData, null, 2)], { 
        type: 'application/json' 
      });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}.json`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('JSON file exported successfully');
    } catch (error) {
      console.error('Error exporting JSON:', error);
      toast.error('Failed to export JSON file');
    } finally {
      setLoading(false);
    }
  };

  const formatCellValue = (value) => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (value instanceof Date) return value.toLocaleDateString();
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  if (!data || data.length === 0) {
    return (
      <Button variant="outline" size="sm" disabled>
        <Download className="h-4 w-4 mr-2" />
        Export
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={loading}>
          <Download className="h-4 w-4 mr-2" />
          {loading ? 'Exporting...' : 'Export'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportToPDF}>
          <FileText className="h-4 w-4 mr-2" />
          Export as PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToExcel}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Export as Excel
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToCSV}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToJSON}>
          <FileJson className="h-4 w-4 mr-2" />
          Export as JSON
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}